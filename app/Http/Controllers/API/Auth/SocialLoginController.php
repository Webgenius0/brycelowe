<?php

namespace App\Http\Controllers\API\Auth;

use App\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialLoginController extends Controller
{
    use ApiResponse;

    public function socialLogin(Request $request)
    {
        $request->validate([
            'provider_id' => 'required|in:google,apple',
            'token' => 'required',
            'role' => 'nullable|string',
        ]);

        try {
            $email = null;
            $name = null;
            $avatar = null;

            if ($request->provider_id === 'google') {
                $socialUser = Socialite::driver('google')->stateless()->userFromToken($request->token);
                $email = $socialUser->getEmail();
                $name = $socialUser->getName() ?: ($email ? explode('@', $email)[0] : 'Google User');
                $avatar = $socialUser->getAvatar();
            } elseif ($request->provider_id === 'apple') {
                $payload = $this->verifyAppleIdentityToken($request->token);

                $providerUserId = $payload['sub'] ?? null;
                $email = $payload['email'] ?? $request->email;
                $name = $request->name ?? 'Apple User';
                $avatar = null;

                if (! $providerUserId || ! $email) {
                    return $this->error('Invalid Apple token', 401);
                }
            } else {
                return $this->error('Unsupported provider', 422);
            }

            if (! $email) {
                return $this->error('Could not retrieve email from social provider', 422);
            }

            $user = User::where('email', $email)->first();
            if (! $user) {
                if (! $request->filled('role')) {
                    return response()->json([
                        'status' => false,
                        'code' => 422,
                        'message' => 'Role is required for unregistered users.',
                        'is_new_user' => true,
                        'errors' => [
                            'role' => ['The role field is required.'],
                        ],
                    ], 422);
                }

                $role = ucfirst(strtolower(trim($request->role)));
                if (! in_array($role, ['User', 'Partner'])) {
                    return response()->json([
                        'status' => false,
                        'code' => 422,
                        'message' => 'Invalid role specified. Role must be User or Partner.',
                        'errors' => [
                            'role' => ['The selected role is invalid. Allowed roles are User, Partner.'],
                        ],
                    ], 422);
                }

                $password = Str::random(16);

                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'password' => Hash::make($password),
                    'avatar' => $avatar,
                    'email_verified_at' => now(),
                    'role' => $role,
                    'status' => 'Active',
                ]);

                // Link any gifted subscriptions purchased before they registered
                $giftedSubscriptions = \App\Models\Subscription::where('recipient_email', $user->email)
                    ->whereNull('user_id')
                    ->get();

                foreach ($giftedSubscriptions as $sub) {
                    $sub->update(['user_id' => $user->id]);

                    $plan = \App\Models\Plan::where('stripe_price_id', $sub->stripe_price)->first()
                        ?? \App\Models\Plan::where('title', $sub->type)->first();

                    if ($plan) {
                        $user->update([
                            'points' => ($user->points ?? 0) + ($plan->points ?? 0),
                            'points_valid_till' => \Carbon\Carbon::now()->addDays($plan->duration ?? 30),
                        ]);
                    }
                }
            } else {
                if (empty($user->avatar) && $avatar) {
                    $user->update(['avatar' => $avatar]);
                }
            }

            if ($user->status === 'Inactive') {
                return \App\Helpers\Helper::jsonErrorResponse('Your account is inactive. Please contact support.', 403, []);
            }

            if ($user->status === 'Banned') {
                return \App\Helpers\Helper::jsonErrorResponse('Your account has been banned.', 403, []);
            }

            Auth::login($user);
            $token = $user->createToken('AuthToken')->plainTextToken;

            return response()->json([
                'status' => true,
                'message' => 'Login Successful',
                'token_type' => 'Bearer',
                'token' => $token,
                'data' => $user,
            ]);
        } catch (Exception $e) {
            \Log::error('Social login failed: '.$e->getMessage());

            return $this->error('Something went wrong: '.$e->getMessage(), 500);
        }
    }

    public function redirectCallbackApple()
    {
        return $this->ok('You are now logged in');
    }

    private function verifyAppleIdentityToken(string $jwt): array
    {

        $parts = explode('.', $jwt);
        if (count($parts) !== 3) {
            return [];
        }

        [$headerB64, $payloadB64, $sigB64] = $parts;

        $payloadJson = base64_decode(strtr($payloadB64, '-_', '+/'));
        $payload = json_decode($payloadJson, true) ?? [];

        if (($payload['iss'] ?? '') !== 'https://appleid.apple.com') {
            return [];
        }

        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return [];
        }

        return $payload;
    }
}
