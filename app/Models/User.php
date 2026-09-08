<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable([
    'account_id',
    'full_name',
    'name',
    'email',
    'phone_number',
    'phone',
    'avatar',
    'enable2fa',
    'is_active',
    'is_superuser',
    'user_type',
    'last_login',
    'last_login_at',
    'password',
    'address',
    'status',
    'role',
    'terms',
    'email_2fa_enabled',
    'is_2fa_enabled',
    'stripe_connect_id',
    'stripe_connect_active',
])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token', 'created_at', 'updated_at', 'reset_code', 'reset_code_expires_at'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function (User $user) {
            if (empty($user->account_id)) {
                $user->account_id = (string) Str::uuid();
            }
            if (empty($user->full_name) && !empty($user->name)) {
                $user->full_name = $user->name;
            }
            if (empty($user->name) && !empty($user->full_name)) {
                $user->name = $user->full_name;
            }
            if (empty($user->phone_number) && !empty($user->phone)) {
                $user->phone_number = $user->phone;
            }
            if (empty($user->user_type)) {
                $user->user_type = ($user->role === 'Admin' || $user->is_superuser) ? 'INTERNAL' : 'EXTERNAL';
            }
        });

        static::saving(function (User $user) {
            if (!empty($user->full_name) && empty($user->name)) {
                $user->name = $user->full_name;
            }
            if (!empty($user->name) && empty($user->full_name)) {
                $user->full_name = $user->name;
            }
            if (!empty($user->phone_number) && empty($user->phone)) {
                $user->phone = $user->phone_number;
            }
            if (!empty($user->phone) && empty($user->phone_number)) {
                $user->phone_number = $user->phone;
            }
            if (!empty($user->status)) {
                $user->is_active = ($user->status === 'Active');
            } elseif (isset($user->is_active)) {
                $user->status = $user->is_active ? 'Active' : 'Inactive';
            }
            if (isset($user->enable2fa)) {
                $user->is_2fa_enabled = $user->enable2fa;
            }
            if (isset($user->last_login) && empty($user->last_login_at)) {
                $user->last_login_at = $user->last_login;
            }
        });
    }

    /**
     * Set the status attribute and sync is_active.
     */
    public function setStatusAttribute($value): void
    {
        $this->attributes['status'] = $value;
        $this->attributes['is_active'] = ($value === 'Active');
    }

    /**
     * Set the is_active attribute and sync status.
     */
    public function setIsActiveAttribute($value): void
    {
        $isActive = (bool) $value;
        $this->attributes['is_active'] = $isActive;
        if (empty($this->attributes['status']) || in_array($this->attributes['status'], ['Active', 'Inactive'])) {
            $this->attributes['status'] = $isActive ? 'Active' : 'Inactive';
        }
    }

    /**
     * Get the is_active attribute based on status.
     */
    public function getIsActiveAttribute($value): bool
    {
        if (isset($this->attributes['status'])) {
            return $this->attributes['status'] === 'Active';
        }

        return (bool) $value;
    }

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
            'enable2fa' => 'boolean',
            'is_active' => 'boolean',
            'is_superuser' => 'boolean',
            'stripe_connect_active' => 'boolean',
            'terms' => 'boolean',
            'last_login' => 'datetime',
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
