<?php

namespace App\Http\Controllers\API\Auth;

use App\Concerns\ApiResponse;
use App\Helpers\Helper;
use App\Http\Controllers\Controller;
use App\Models\User;
use Carbon\Carbon;
use Ichtrojan\Otp\Otp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class RegisterController extends Controller
{
    use ApiResponse;

    public function register(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'name' => 'required|string|max:255',
            'password' => 'required|min:6|confirmed',
            'role' => 'required|in:User,Partner',
        ]);

        DB::beginTransaction();

        try {

            $user = User::where('email', $request->email)->first();

            // Email already exists
            if ($user) {

                // Already verified user
                if ($user->hasVerifiedEmail()) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Email already registered and verified.',
                    ], 422);
                }

                // Update unverified user data
                $user->update([
                    'name' => $request->name,
                    'password' => Hash::make($request->password),
                ]);
            } else {

                // Create new user
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'role' => $request->role,
                    'password' => Hash::make($request->password),
                ]);
            }

            DB::commit();

            $otpToken = null;

            try {
                $otp = $this->send_otp($user);
                $otpToken = $otp->token ?? null;
            } catch (\Exception $e) {
                Log::error('OTP issue: ' . $e->getMessage());
            }

            $user->refresh();

            return response()->json([
                'status' => true,
                'message' => '6 digit OTP sent successfully.',
                'data' => $user,
                'otp' => $otpToken,
            ], 201);
        } catch (\Exception $exception) {

            DB::rollBack();

            return response()->json([
                'status' => false,
                'message' => $exception->getMessage(),
            ], 500);
        }
    }

    public function send_otp(User $user, $mailType = 'verify')
    {
        $otp = (new Otp)->generate($user->email, 'numeric', 6, 5);
        $message = $mailType === 'verify' ? 'Verify Your Email Address' : 'Reset Your Password';
        Mail::to($user->email)->send(new \App\Mail\OTP($otp->token, $user, $message, $mailType));
        return $otp;
    }

    public function resend_otp(Request $request, $mailType = 'verify')
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        try {
            $user = User::where('email', $request->email)->first();
            $otp = (new Otp)->generate($request->email, 'numeric', 6, 5);
            $message = $mailType === 'verify' ? 'Verify Your Email Address' : 'Reset Your Password';

            Mail::to($request->email)->send(new \App\Mail\OTP($otp->token, $user, $message, $mailType));

            return $this->success('OTP sent successfully', [
                'otp' => $otp->token, // ⚠️ production e eta return korba na
            ], 200);
        } catch (\Exception $exception) {
            return $this->error($exception->getMessage(), 500);
        }
    }

    public function verify_otp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|digits:6',
        ]);

        $verify = (new Otp)->validate($request->email, $request->otp);

        if (!$verify->status) {
            return $this->error($verify->message, 400);
        }

        // Mark user as verified
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return $this->error('User not found', 404);
        }

        if ($user->status === 'Inactive') {
            return Helper::jsonErrorResponse('Your account is inactive. Please contact support.', 403, []);
        }

        if ($user->status === 'Banned') {
            return Helper::jsonErrorResponse('Your account has been banned.', 403, []);
        }

        if (!$user->email_verified_at) {
            $user->forceFill(['email_verified_at' => now()])->save();
        }

        return response()->json([
            'status' => true,
            'message' => 'Email verified successfully.',
            'token_type' => 'Bearer',
            'token' => $user->createToken('AuthToken')->plainTextToken,
            'data' => $user,
        ]);
    }

    public function forgot_password(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        try {
            $user = User::where('email', $request->email)->first();
            if (!$user) {
                return $this->error('Email not found', 404);
            }
            $otp = $this->send_otp($user, 'forget');

            return $this->success('OTP send successfully.', ['otp' => $otp->token], 201);
        } catch (\Exception $exception) {
            return $this->error($exception->getMessage(), 500);
        }
    }

    public function forgot_verify_otp(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'otp' => 'required|string|digits:6',
        ]);

        $verify = (new Otp)->validate($request->email, $request->otp);
        if ($verify->status) {
            $user = User::where('email', $request->email)->first();
            if (!$user) {
                return Helper::jsonErrorResponse('Email not found', 404);
            }
            $user->reset_code = \Str::random(40);
            $user->reset_code_expires_at = Carbon::now()->addDays(1);
            $user->save();

            return $this->success('OTP verified successfully', [
                'token' => $user->reset_code,
            ], 201);
        } else {
            return $this->error($verify->message, 404);
        }
    }

    public function reset_password(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'password' => 'required|string|confirmed',
        ]);

        try {
            $user = User::where('reset_code', $request->token)->first();

            if (!$user) {
                return $this->error('Invalid Token', 404);
            }

            if ($user->reset_code_expires_at < Carbon::now()) {
                return $this->error('Token expired', 404);
            }

            $user->password = Hash::make($request->password);
            $user->reset_code = null;
            $user->reset_code_expires_at = null;
            $user->save();

            return $this->ok('Password reset successfully');
        } catch (\Exception $exception) {
            return $this->error($exception->getMessage(), 404);
        }
    }
}
