<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'subscription_id',
    'invoice_number',
    'date',
    'status',
    'pdf',
    'call_credit',
    'report_credit',
    'playbook_credit',
    'calibration_credit',
    'overusages_amount',
])]
class Billing extends Model
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
            'subscription_id' => 'integer',
            'date' => 'datetime',
            'call_credit' => 'integer',
            'report_credit' => 'integer',
            'playbook_credit' => 'integer',
            'calibration_credit' => 'integer',
            'overusages_amount' => 'decimal:2',
        ];
    }

    /**
     * Get the user that owns the billing record.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the subscription associated with the billing.
     */
    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    /**
     * Return the full URL for the invoice PDF if present.
     */
    public function getPdfUrlAttribute(): ?string
    {
        if (!$this->pdf) {
            return null;
        }

        if (str_starts_with($this->pdf, 'http://') || str_starts_with($this->pdf, 'https://')) {
            return $this->pdf;
        }

        $path = ltrim($this->pdf, '/');
        return url($path);
    }

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = ['pdf_url'];
}
