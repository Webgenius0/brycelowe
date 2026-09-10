<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name',
    'description',
    'descripton',
    'price',
    'discount_price',
    'interval',
    'call_credit',
    'report_credit',
    'playbook_credit',
    'calibration_credit',
    'is_active',
    'is_trial',
    'trial_period',
])]
class Plan extends Model
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
            'price' => 'decimal:2',
            'discount_price' => 'decimal:2',
            'call_credit' => 'integer',
            'report_credit' => 'integer',
            'playbook_credit' => 'integer',
            'calibration_credit' => 'integer',
            'is_active' => 'boolean',
            'is_trial' => 'boolean',
            'trial_period' => 'integer',
        ];
    }

    /**
     * Booted model hooks to sync description and descripton fields.
     */
    protected static function booted(): void
    {
        static::saving(function (Plan $plan) {
            if (!empty($plan->description) && empty($plan->descripton)) {
                $plan->descripton = $plan->description;
            }
            if (!empty($plan->descripton) && empty($plan->description)) {
                $plan->description = $plan->descripton;
            }
        });
    }

    /**
     * Get the overages rates for the plan.
     */
    public function overagesRates(): HasMany
    {
        return $this->hasMany(OveragesRate::class);
    }

    /**
     * Get the discounts for the plan.
     */
    public function discounts(): HasMany
    {
        return $this->hasMany(Discount::class);
    }

    /**
     * Get the subscriptions for the plan.
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }
}


