<?php

namespace App\Http\Middleware;

use App\Models\LoginAttempt;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Symfony\Component\HttpFoundation\Response;

class CheckIpLoginThrottle
{
    public function handle(Request $request, Closure $next): Response
    {
        $ip    = $request->ip();
        $email = strtolower($request->input('email', ''));

        $record = LoginAttempt::where('ip_address', $ip)
            ->where('email', $email)
            ->first();

        if ($record && $record->locked_until && Carbon::now()->lessThan($record->locked_until)) {
            $minutesLeft = ceil(Carbon::now()->diffInSeconds($record->locked_until) / 60);
            $lockedUntil = $record->locked_until->format('H:i');

            $message = "Too many failed login attempts from your IP address. "
                . "Your account is locked until {$lockedUntil} ({$minutesLeft} minute(s) remaining).";

            if ($request->wantsJson() || $request->hasHeader('X-Inertia')) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'email' => $message,
                ]);
            }

            return redirect()->back()->withErrors(['email' => $message]);
        }

        return $next($request);
    }
}
