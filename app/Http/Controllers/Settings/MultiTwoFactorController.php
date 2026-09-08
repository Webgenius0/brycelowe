<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Mail\TwoFactorCodeMail;
use App\Models\User;
use App\Models\UserPasskey;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class MultiTwoFactorController extends Controller
{
    /**
     * Toggle Master 2FA status (Enables/Pauses 2FA without wiping secret keys).
     */
    public function toggleGlobal2fa(Request $request): RedirectResponse
    {
        $user = $request->user();
        $user->is_2fa_enabled = !$user->is_2fa_enabled;
        $user->save();

        $status = $user->is_2fa_enabled ? 'active' : 'paused';
        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Two-Factor Protection is now {$status}. Your configured keys and devices remain safely saved.",
        ]);

        return back();
    }

    /**
     * Toggle Email 2FA status for the user.
     */
    public function toggleEmail2fa(Request $request): RedirectResponse
    {
        $user = $request->user();
        $user->email_2fa_enabled = !$user->email_2fa_enabled;
        $user->save();

        $status = $user->email_2fa_enabled ? 'enabled' : 'disabled';
        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Email two-factor authentication has been {$status}.",
        ]);

        return back();
    }

    /**
     * Send a 6-digit OTP code to the user's email.
     */
    public function sendEmailCode(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $code = (string) random_int(100000, 999999);
        $cacheKey = "email_2fa_otp_{$user->id}";

        // Cache code for 5 minutes
        Cache::put($cacheKey, $code, now()->addMinutes(5));

        // Mail code to user
        Mail::to($user->email)->send(new TwoFactorCodeMail($code, $user->name));

        return response()->json([
            'status' => 'success',
            'message' => 'Verification code sent to your email address.',
        ]);
    }

    /**
     * Verify the 6-digit Email OTP code.
     */
    public function verifyEmailCode(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();
        $cacheKey = "email_2fa_otp_{$user->id}";
        $cachedCode = Cache::get($cacheKey);

        if (!$cachedCode || $cachedCode !== $request->code) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid or expired verification code.',
            ], 422);
        }

        // Clear code after successful verification
        Cache::forget($cacheKey);

        return response()->json([
            'status' => 'success',
            'message' => 'Email 2FA verification successful.',
        ]);
    }

    /**
     * Store a registered Passkey device credential.
     */
    public function storePasskey(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'credential_id' => 'required|string|max:500',
            'public_key' => 'required|string',
            'device_type' => 'nullable|string|max:50',
        ]);

        $request->user()->passkeys()->create([
            'name' => $request->name,
            'credential_id' => $request->credential_id,
            'public_key' => $request->public_key,
            'device_type' => $request->device_type ?? 'Passkey Device',
            'last_used_at' => now(),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Passkey device registered successfully.',
        ]);

        return back();
    }

    /**
     * Delete a registered Passkey.
     */
    public function deletePasskey(Request $request, $id): RedirectResponse
    {
        $passkey = $request->user()->passkeys()->findOrFail($id);
        $passkey->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Passkey removed successfully.',
        ]);

        return back();
    }

    /**
     * Send email code during 2FA login challenge.
     */
    public function sendLoginEmailCode(Request $request)
    {
        $userId = $request->session()->get('login.id');
        $user = $userId ? User::find($userId) : null;

        if (!$user) {
            return response()->json(['message' => 'Session expired. Please log in again.'], 422);
        }

        $code = (string) random_int(100000, 999999);
        $cacheKey = "email_2fa_otp_{$user->id}";

        Cache::put($cacheKey, $code, now()->addMinutes(5));

        Mail::to($user->email)->send(new TwoFactorCodeMail($code, $user->name));

        return response()->json([
            'status' => 'success',
            'message' => 'Verification code sent to your email address.',
        ]);
    }

    /**
     * Verify email code during 2FA login challenge.
     */
    public function verifyLoginEmailCode(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $userId = $request->session()->get('login.id');
        $user = $userId ? User::find($userId) : null;

        if (!$user) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'code' => ['Session expired. Please log in again.'],
            ]);
        }

        $cacheKey = "email_2fa_otp_{$user->id}";
        $cachedCode = Cache::get($cacheKey);

        if (!$cachedCode || $cachedCode !== $request->code) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'code' => ['Invalid or expired verification code.'],
            ]);
        }

        Cache::forget($cacheKey);

        // Clear Fortify's two factor session variables
        $request->session()->forget('login.id');

        // Log the user in
        Auth::login($user, $request->boolean('remember'));

        // Regenerate session to prevent session fixation
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    /**
     * Get registered passkeys for 2FA login challenge.
     */
    public function getLoginPasskeys(Request $request)
    {
        $userId = $request->session()->get('login.id');
        $user = $userId ? User::find($userId) : null;

        if (!$user) {
            return response()->json([], 422);
        }

        $passkeys = $user->passkeys()->select('id', 'name', 'credential_id')->get();

        return response()->json($passkeys);
    }

    /**
     * Verify passkey credential during 2FA login challenge.
     */
    public function verifyLoginPasskey(Request $request)
    {
        $request->validate([
            'credential_id' => 'required|string|max:500',
        ]);

        $userId = $request->session()->get('login.id');
        $user = $userId ? User::find($userId) : null;

        if (!$user) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'credential_id' => ['Session expired. Please log in again.'],
            ]);
        }

        // Verify the credential matches one of the user's stored passkeys
        $passkey = $user->passkeys()->where('credential_id', $request->credential_id)->first();

        if (!$passkey) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'credential_id' => ['Passkey validation failed.'],
            ]);
        }

        // Update last used at
        $passkey->update(['last_used_at' => now()]);

        // Clear Fortify's session login variables
        $request->session()->forget('login.id');

        // Log the user in
        Auth::login($user, $request->boolean('remember'));

        // Regenerate session
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }
}
