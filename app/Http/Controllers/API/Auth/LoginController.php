<?php

namespace App\Http\Controllers\API\Auth;

use App\Concerns\ApiResponse;
use App\Helpers\Helper;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class LoginController extends Controller
{
    use ApiResponse;

    public function login(Request $request)
    {
        $request->merge([
            'remember_token' => filter_var($request->remember_token, FILTER_VALIDATE_BOOLEAN),
        ]);

        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if (! Auth::attempt(['email' => $request->email, 'password' => $request->password])) {
            return Helper::jsonErrorResponse('The provided credentials do not match our records.', 401, [
                'email' => 'The provided credentials do not match our records.',
            ]);
        }

        if (Auth::user()->email_verified_at === null) {
            return Helper::jsonErrorResponse('Email not verified.', 403, []);
        }

        if (Auth::user()->status === 'Inactive') {
            Auth::logout();

            return Helper::jsonErrorResponse('Your account is inactive. Please contact support.', 403, []);
        }

        if (Auth::user()->status === 'Banned') {
            Auth::logout();

            return Helper::jsonErrorResponse('Your account has been banned.', 403, []);
        }

        $user = Auth::user();

        // handle nullable remember_token
        if ($request->remember_token) {
            $user->setRememberToken(Str::random(60));
        }

        $user->save();

        return response()->json([
            'status' => true,
            'message' => 'Login Successful',
            'token_type' => 'Bearer',
            'token' => $user->createToken('AuthToken')->plainTextToken,
            'data' => $user,
        ]);
    }

    public function logout(Request $request)
    {
        try {
            // Revoke the current user’s token
            $request->user()->currentAccessToken()->delete();

            // Return a response indicating the user was logged out
            return $this->ok('Logged out successfully.');
        } catch (\Exception $exception) {
            return $this->error($exception->getMessage(), 500);
        }
    }

    public function userDetails()
    {
        $user = Auth::user();

        return $this->ok('User Details fetch successfully.', $user);
    }
}
