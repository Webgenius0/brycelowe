<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Call extends Model
{
    use HasFactory;

    protected $table = 'calls';

    protected $fillable = [
        'call_id',
        'lead_id',
        'timestamp',
        'trust_gain',
        'ai_adherance',
        'outcome',
        'agent_id',
        'duration',
        'duration_formatted',
        'in_queue',
        'next_call',
    ];

    protected $casts = [
        'timestamp' => 'datetime',
        'next_call' => 'datetime',
        'trust_gain' => 'integer',
        'ai_adherance' => 'integer',
        'duration' => 'integer',
        'in_queue' => 'boolean',
    ];

    /**
     * Get the lead associated with this call.
     */
    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class, 'lead_id');
    }

    /**
     * Get the agent / user who handled this call.
     */
    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    /**
     * Get the detailed call report for this call.
     */
    public function report(): HasOne
    {
        return $this->hasOne(CallReport::class, 'call_id');
    }

    /**
     * Alias for report relation.
     */
    public function callReport(): HasOne
    {
        return $this->hasOne(CallReport::class, 'call_id');
    }
}
