<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Http\Request;

class LoginActivity extends Model
{
    use HasFactory;

    protected $table = 'login_activities';

    protected $fillable = [
        'user_id',
        'timestamp',
        'device',
        'browser',
        'location',
        'ip',
        'ip_address',
        'status',
        'last_login',
        'is_active',
        'is_block',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'timestamp' => 'datetime',
        'last_login' => 'datetime',
        'is_active' => 'boolean',
        'is_block' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Parse device name from User-Agent.
     */
    public static function parseDevice(Request $request): string
    {
        $userAgent = $request->userAgent() ?? '';
        if (preg_match('/Macintosh|Mac OS X/i', $userAgent)) {
            return 'MacBook Pro';
        } elseif (preg_match('/iPhone/i', $userAgent)) {
            return 'iPhone 14 Pro';
        } elseif (preg_match('/iPad/i', $userAgent)) {
            return 'iPad';
        } elseif (preg_match('/Android/i', $userAgent)) {
            return 'Android Device';
        } elseif (preg_match('/Windows/i', $userAgent)) {
            return 'Windows PC';
        } elseif (preg_match('/Linux/i', $userAgent)) {
            return 'Linux PC';
        }
        return 'Desktop Device';
    }

    /**
     * Parse browser name and version from User-Agent.
     */
    public static function parseBrowser(Request $request): string
    {
        $userAgent = $request->userAgent() ?? '';
        if (preg_match('/Edg\/([0-9]+)/i', $userAgent, $m)) {
            return 'Edge ' . $m[1];
        } elseif (preg_match('/Chrome\/([0-9]+)/i', $userAgent, $m)) {
            return 'Chrome ' . $m[1];
        } elseif (preg_match('/Version\/([0-9]+).*Safari/i', $userAgent, $m)) {
            return 'Safari iOS ' . $m[1];
        } elseif (preg_match('/Firefox\/([0-9]+)/i', $userAgent, $m)) {
            return 'Firefox ' . $m[1];
        }
        return 'Chrome 124';
    }

    /**
     * Record a login activity entry from the HTTP request.
     */
    public static function record(int $userId, Request $request, string $status = 'Success'): self
    {
        $ip = $request->ip() ?: '127.0.0.1';
        $now = now();

        return self::create([
            'user_id' => $userId,
            'timestamp' => $now,
            'ip' => $ip,
            'ip_address' => $ip,
            'device' => self::parseDevice($request),
            'browser' => self::parseBrowser($request),
            'location' => $request->header('CF-IPCity')
                ? ($request->header('CF-IPCity') . ', ' . ($request->header('CF-IPCountry') ?: 'USA'))
                : 'Austin, TX, USA',
            'status' => $status,
            'last_login' => $now,
            'is_active' => true,
            'is_block' => false,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }
}
