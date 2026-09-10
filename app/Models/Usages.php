<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'subscription_id',
    'call_credit',
    'report_credit',
    'playbook_credit',
    'calibration_credit',
    'get_total_overusages_amount',
])]
class Usages extends Model
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
            'subscription_id' => 'integer',
            'call_credit' => 'integer',
            'report_credit' => 'integer',
            'playbook_credit' => 'integer',
            'calibration_credit' => 'integer',
            'get_total_overusages_amount' => 'decimal:2',
        ];
    }

    /**
     * Get the subscription that owns the usage record.
     */
    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }
}
