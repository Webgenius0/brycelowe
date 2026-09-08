<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'avatar', 'password', 'phone', 'address', 'status', 'role', 'terms', 'last_login_at', 'email_2fa_enabled', 'is_2fa_enabled', 'stripe_connect_id', 'stripe_connect_active'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token', 'created_at', 'updated_at', 'reset_code', 'reset_code_expires_at'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'email_2fa_enabled' => 'boolean',
            'is_2fa_enabled' => 'boolean',
            'stripe_connect_active' => 'boolean',
            'terms' => 'boolean',
            'last_login_at' => 'datetime',
        ];
    }

    /**
     * Check if 2FA protection is globally active for this user.
     */
    public function is2faActive(): bool
    {
        return (bool) ($this->is_2fa_enabled && $this->hasAny2faConfigured());
    }

    /**
     * Check if user has configured at least one 2FA method.
     */
    public function hasAny2faConfigured(): bool
    {
        return !empty($this->two_factor_secret) || (bool) $this->email_2fa_enabled || $this->passkeys()->exists();
    }

    /**
     * Get user registered passkeys.
     */
    public function passkeys(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(UserPasskey::class);
    }

    /**
     * Return the full URL for the avatar so the API always exposes
     * an absolute URL instead of a raw storage path.
     */
    public function getAvatarAttribute(?string $value): ?string
    {
        if (!$value) {
            return null;
        }

        // Already a full URL (e.g. Google/social login avatars)
        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }

        // Strip leading slash if present
        $path = ltrim($value, '/');

        // Resolve from public disk
        return url($path);
    }
}
