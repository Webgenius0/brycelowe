<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Carbon\CarbonInterface;

class LoginAttempt extends Model
{
    protected $fillable = [
        'ip_address',
        'email',
        'attempts',
        'locked_until',
        'last_attempt_at',
    ];

    protected $casts = [
        'locked_until'    => 'datetime',
        'last_attempt_at' => 'datetime',
    ];

    /**
     * Check if the given IP (+ optional email) is currently locked.
     */
    public static function isLocked(string $ip, ?string $email = null): bool
    {
        $record = static::where('ip_address', $ip)
            ->where('email', $email)
            ->first();

        if (!$record || !$record->locked_until) {
            return false;
        }

        if (Carbon::now()->greaterThan($record->locked_until)) {
            // Lock expired — reset
            $record->update([
                'attempts'     => 0,
                'locked_until' => null,
            ]);
            return false;
        }

        return true;
    }

    /**
     * Get seconds remaining on lockout for the given IP.
     */
    public static function lockoutSecondsRemaining(string $ip, ?string $email = null): int
    {
        $record = static::where('ip_address', $ip)
            ->where('email', $email)
            ->first();

        if (!$record || !$record->locked_until) {
            return 0;
        }

        $seconds = Carbon::now()->diffInSeconds($record->locked_until, false);
        return max(0, $seconds);
    }

    /**
     * Record a failed attempt and apply lockout if threshold exceeded.
     */
    public static function recordFailure(string $ip, ?string $email = null): void
    {
        $record = static::firstOrCreate(
            ['ip_address' => $ip, 'email' => $email],
            ['attempts' => 0]
        );

        $record->attempts += 1;
        $record->last_attempt_at = Carbon::now();

        if ($record->attempts >= 10) {
            // 60 minute lockout
            $record->locked_until = Carbon::now()->addMinutes(60);
        } elseif ($record->attempts >= 5) {
            // 15 minute lockout
            $record->locked_until = Carbon::now()->addMinutes(15);
        }

        $record->save();
    }

    /**
     * Clear attempt record on successful login.
     */
    public static function clearRecord(string $ip, ?string $email = null): void
    {
        static::where('ip_address', $ip)
            ->where('email', $email)
            ->delete();
    }

    /**
     * Check whether IP is locked (by IP alone, any email).
     */
    public static function isIpLocked(string $ip): bool
    {
        $record = static::where('ip_address', $ip)
            ->whereNotNull('locked_until')
            ->where('locked_until', '>', Carbon::now())
            ->first();

        return (bool) $record;
    }

    /**
     * Get the locked_until datetime for an IP.
     */
    public static function getLockoutTime(string $ip, ?string $email = null): ?\DateTimeInterface
    {
        $record = static::where('ip_address', $ip)
            ->where('email', $email)
            ->first();

        return $record?->locked_until;
    }

    public function isCurrentlyLocked(): bool
    {
        return $this->locked_until && Carbon::now()->lessThan($this->locked_until);
    }
}
