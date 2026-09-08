<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'company_name',
    'avatar',
    'industry',
    'industury',
    'timezone',
    'language',
])]
class CompanyProfile extends Model
{
    use HasFactory;

    /**
     * Booted model hooks to sync industry and industury fields.
     */
    protected static function booted(): void
    {
        static::saving(function (CompanyProfile $profile) {
            if (!empty($profile->industry) && empty($profile->industury)) {
                $profile->industury = $profile->industry;
            }
            if (!empty($profile->industury) && empty($profile->industry)) {
                $profile->industry = $profile->industury;
            }
        });
    }

    /**
     * Get the user that owns the company profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
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

        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }

        $path = ltrim($value, '/');
        return url($path);
    }
}
