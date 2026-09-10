<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'user_id',
    'plan_id',
    'started_at',
    'current_period_start',
    'current_period_end',
    'end_at',
    'status',
    'is_active',
])]
class Subscription extends Model
{
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'plan_id' => 'integer',
            'started_at' => 'datetime',
            'current_period_start' => 'datetime',
            'current_period_end' => 'datetime',
            'end_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Booted model hooks.
     */
    protected static function booted(): void
    {
        static::creating(function (Subscription $subscription) {
            if (empty($subscription->started_at)) {
                $subscription->started_at = now();
            }
            if (empty($subscription->current_period_start)) {
                $subscription->current_period_start = now();
            }
            if (empty($subscription->current_period_end)) {
                $subscription->current_period_end = now()->addMonth();
            }
            if (!isset($subscription->is_active)) {
                $subscription->is_active = !in_array($subscription->status, ['CANCELED', 'EXPIRED']);
            }
        });

        static::saving(function (Subscription $subscription) {
            if ($subscription->isDirty('status')) {
                $subscription->is_active = !in_array($subscription->status, ['CANCELED', 'EXPIRED']);
            }
        });
    }

    /**
     * Get the user that owns the subscription.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the plan associated with the subscription.
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    /**
     * Get the billings / invoices for the subscription.
     */
    public function billings(): HasMany
    {
        return $this->hasMany(Billing::class);
    }

    /**
     * Get the usage statistics for the subscription.
     */
    public function usages(): HasOne
    {
        return $this->hasOne(Usages::class);
    }

    /**
     * Get the overusages records for the subscription.
     */
    public function overusages(): HasMany
    {
        return $this->hasMany(Overusages::class);
    }
}
