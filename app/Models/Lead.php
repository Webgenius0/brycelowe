<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lead extends Model
{
    use HasFactory;

    protected $table = 'leads';

    protected $fillable = [
        'full_name',
        'email',
        'phone_number',
        'company_name',
        'property_address',
        'city',
        'state',
        'zip_code',
        'notes',
        'status',
        'lead_type',
        'outcome',
        'last_call',
        'priority',
        'tags',
        'estimated_value',
        'trust_gain',
        'ai_adherance',
        'total_call',
        'source',
        'is_lead',
        'in_followup_queue',
        'lead_by',
    ];

    protected $casts = [
        'tags' => 'array',
        'is_lead' => 'boolean',
        'in_followup_queue' => 'boolean',
        'last_call' => 'datetime',
        'estimated_value' => 'decimal:2',
        'trust_gain' => 'integer',
        'ai_adherance' => 'integer',
        'total_call' => 'integer',
    ];

    /**
     * Accessor alias for address -> property_address.
     */
    public function getAddressAttribute(): ?string
    {
        return $this->property_address;
    }

    /**
     * Mutator alias for address -> property_address.
     */
    public function setAddressAttribute(?string $value): void
    {
        $this->attributes['property_address'] = $value;
    }

    /**
     * Get the user / agent who owns or created this lead.
     */
    public function leadBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'lead_by');
    }

    /**
     * Get all phone numbers associated with this lead.
     */
    public function numbers(): HasMany
    {
        return $this->hasMany(LeadNumber::class);
    }

    /**
     * Get all activities logged for this lead.
     */
    public function activities(): HasMany
    {
        return $this->hasMany(LeadActivity::class);
    }

    /**
     * Get all calls made to or associated with this lead.
     */
    public function calls(): HasMany
    {
        return $this->hasMany(Call::class);
    }

    /**
     * Helper to get primary phone number for this lead.
     */
    public function get_primary_number(): ?string
    {
        return $this->numbers()->where('is_default', true)->value('number')
            ?? $this->numbers()->first()?->number
            ?? $this->phone_number;
    }

    /**
     * Accessor for primary number attribute.
     */
    public function getPrimaryNumberAttribute(): ?string
    {
        return $this->get_primary_number();
    }
}
