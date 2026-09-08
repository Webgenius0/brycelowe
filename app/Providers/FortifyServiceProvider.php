<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Models\LoginAttempt;
use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(\Laravel\Fortify\Contracts\LoginResponse::class, function () {
            return new class implements \Laravel\Fortify\Contracts\LoginResponse {
                public function toResponse($request)
                {
                    return $request->wantsJson() && !$request->hasHeader('X-Inertia')
                        ? response()->json(['two_factor' => false])
                        : redirect()->intended(config('fortify.home'));
                }
            };
        });

        $this->app->singleton(\Laravel\Fortify\Contracts\LogoutResponse::class, function () {
            return new class implements \Laravel\Fortify\Contracts\LogoutResponse {
                public function toResponse($request)
                {
                    return $request->wantsJson() && !$request->hasHeader('X-Inertia')
                        ? response()->json('', 204)
                        : redirect('/');
                }
            };
        });

        $this->app->singleton(\Laravel\Fortify\Contracts\RegisterResponse::class, function () {
            return new class implements \Laravel\Fortify\Contracts\RegisterResponse {
                public function toResponse($request)
                {
                    return $request->wantsJson() && !$request->hasHeader('X-Inertia')
                        ? response()->json('', 201)
                        : redirect()->intended(config('fortify.home'));
                }
            };
        });

        $this->app->singleton(\Laravel\Fortify\Contracts\PasswordResetResponse::class, function ($app, $parameters) {
            $status = $parameters['status'] ?? '';
            return new class($status) implements \Laravel\Fortify\Contracts\PasswordResetResponse {
                protected $status;
                public function __construct($status)
                {
                    $this->status = $status;
                }
                public function toResponse($request)
                {
                    return $request->wantsJson() && !$request->hasHeader('X-Inertia')
                        ? response()->json(['status' => trans($this->status)], 200)
                        : redirect('/login')->with('status', trans($this->status));
                }
            };
        });

        $this->app->singleton(\Laravel\Fortify\Contracts\SuccessfulPasswordResetLinkRequestResponse::class, function ($app, $parameters) {
            $status = $parameters['status'] ?? '';
            return new class($status) implements \Laravel\Fortify\Contracts\SuccessfulPasswordResetLinkRequestResponse {
                protected $status;
                public function __construct($status)
                {
                    $this->status = $status;
                }
                public function toResponse($request)
                {
                    return $request->wantsJson() && !$request->hasHeader('X-Inertia')
                        ? response()->json(['status' => trans($this->status)], 200)
                        : redirect()->back()->with('status', trans($this->status));
                }
            };
        });

        $this->app->singleton(\Laravel\Fortify\Contracts\PasswordUpdateResponse::class, function () {
            return new class implements \Laravel\Fortify\Contracts\PasswordUpdateResponse {
                public function toResponse($request)
                {
                    return $request->wantsJson() && !$request->hasHeader('X-Inertia')
                        ? response()->json('', 200)
                        : redirect()->back()->with('status', 'password-updated');
                }
            };
        });

        $this->app->singleton(\Laravel\Fortify\Contracts\EmailVerificationResponse::class, function () {
            return new class implements \Laravel\Fortify\Contracts\EmailVerificationResponse {
                public function toResponse($request)
                {
                    return $request->wantsJson() && !$request->hasHeader('X-Inertia')
                        ? response()->json('', 204)
                        : redirect()->intended(config('fortify.home') . '?verified=1');
                }
            };
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureActions();
        $this->configureViews();
        $this->configureRateLimiting();
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::createUsersUsing(CreateNewUser::class);

        Fortify::authenticateUsing(function (Request $request) {
            $ip    = $request->ip();
            $email = strtolower($request->input(Fortify::username(), ''));

            // Check if this IP+email combo is currently locked out
            if (LoginAttempt::isLocked($ip, $email)) {
                $rawTime    = LoginAttempt::getLockoutTime($ip, $email);
                $lockedUntil = $rawTime ? \Illuminate\Support\Carbon::parse($rawTime) : null;
                $minutesLeft = $lockedUntil ? ceil(now()->diffInSeconds($lockedUntil) / 60) : 0;
                throw ValidationException::withMessages([
                    Fortify::username() => __(
                        'Too many failed login attempts from your IP. Locked until :time (:min minute(s) remaining).',
                        ['time' => $lockedUntil?->format('H:i'), 'min' => $minutesLeft]
                    ),
                ]);
            }

            $user = User::where('email', $email)->first();

            if ($user && Hash::check($request->password, $user->password)) {
                if ($user->status === 'Inactive') {
                    LoginAttempt::recordFailure($ip, $email);
                    throw ValidationException::withMessages([
                        Fortify::username() => __('Your account is inactive. Please contact support.'),
                    ]);
                }
                if ($user->status === 'Banned') {
                    LoginAttempt::recordFailure($ip, $email);
                    throw ValidationException::withMessages([
                        Fortify::username() => __('Your account has been banned.'),
                    ]);
                }

                // Successful login — clear any previous attempt record
                LoginAttempt::clearRecord($ip, $email);
                return $user;
            }

            // Wrong credentials — record failure
            LoginAttempt::recordFailure($ip, $email);
            return null;
        });
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        Fortify::loginView(fn(Request $request) => Inertia::render('auth/login', [
            'canResetPassword' => Features::enabled(Features::resetPasswords()),
            'canRegister' => Features::enabled(Features::registration()),
            'status' => $request->session()->get('status'),
        ]));

        Fortify::resetPasswordView(fn(Request $request) => Inertia::render('auth/reset-password', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]));

        Fortify::requestPasswordResetLinkView(fn(Request $request) => Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::verifyEmailView(fn(Request $request) => Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::registerView(fn() => Inertia::render('auth/register'));

        Fortify::twoFactorChallengeView(function (Request $request) {
            $userId = $request->session()->get('login.id');
            $user = $userId ? \App\Models\User::find($userId) : null;

            return Inertia::render('auth/two-factor-challenge', [
                'totpEnabled' => (bool) ($user && !empty($user->two_factor_secret)),
                'emailOtpEnabled' => (bool) ($user && $user->email_2fa_enabled),
                'passkeysEnabled' => (bool) ($user && $user->passkeys()->exists()),
                'email' => $user ? $user->email : null,
            ]);
        });

        Fortify::confirmPasswordView(fn() => Inertia::render('auth/confirm-password'));
    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        // Set to a high value — our custom DB-backed IP throttle in authenticateUsing() handles
        // lockouts with a proper ValidationException (422) that Inertia renders as a field error.
        // Fortify's built-in limiter throws 429 which Inertia cannot intercept gracefully.
        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())) . '|' . $request->ip());

            return Limit::perMinute(20)->by($throttleKey);
        });
    }
}
