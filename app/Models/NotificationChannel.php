<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class NotificationChannel extends Model
{
    use HasFactory;

    protected $table = 'notification_channels';

    // Channel types constants matching schema enum
    public const TYPE_IN_APP = 'IN APP';
    public const TYPE_CALL_REMAINDER = 'CALL REMAINDER';
    public const TYPE_FOLLOW_UP = 'FOLLOW UP';
    public const TYPE_AI_INSIGHT = 'AI INSIGHT';
    public const TYPE_BILLING = 'BILLING';
    public const TYPE_PRODUCT = 'PRODUCT';

    protected $fillable = [
        'title',
        'description',
        'logo',
        'channel_type',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get all user notification preferences for this channel.
     */
    public function userNotifications(): HasMany
    {
        return $this->hasMany(UserNotification::class, 'notification_channel_id');
    }

    /**
     * Get all users subscribed to this channel.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_notifications')
            ->withPivot('is_active')
            ->withTimestamps();
    }

    /**
     * Accessor for full logo URL.
     */
    public function getLogoAttribute(?string $value): ?string
    {
        if (!$value) {
            return null;
        }

        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }

        return url(ltrim($value, '/'));
    }
}
