<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CallReport extends Model
{
    use HasFactory;

    protected $table = 'call_reports';

    protected $fillable = [
        'call_id',
        'agent',
        'lead_source',
        'timestamp',
        'duration',
        'summery',
        'summary',
        'response_tiem',
        'response_time',
        'prompt_utilization',
        'cache_insight',
        'response_timing_insight',
        'key_moment_log',
        'agent_tone_and_feedback',
        'conversion_indicators',
        'talk_ratio',
        'listen_ratio',
        'trust_score',
        'key_insights',
        'objections',
        'sentiment',
        'next_step',
        'ai_performance',
        'recording_file_url',
    ];

    protected $casts = [
        'timestamp' => 'datetime',
        'response_tiem' => 'array',
        'response_time' => 'array',
        'prompt_utilization' => 'array',
        'key_moment_log' => 'array',
        'agent_tone_and_feedback' => 'array',
        'conversion_indicators' => 'array',
        'talk_ratio' => 'integer',
        'listen_ratio' => 'integer',
        'trust_score' => 'integer',
        'key_insights' => 'array',
        'objections' => 'array',
        'sentiment' => 'array',
        'next_step' => 'array',
        'ai_performance' => 'array',
    ];

    /**
     * Get the parent call record.
     */
    public function call(): BelongsTo
    {
        return $this->belongsTo(Call::class, 'call_id');
    }

    /**
     * Accessor for summary with fallback to summery.
     */
    public function getSummaryAttribute($value): ?string
    {
        return $value ?? $this->attributes['summery'] ?? null;
    }

    /**
     * Accessor for summery with fallback to summary.
     */
    public function getSummeryAttribute($value): ?string
    {
        return $value ?? $this->attributes['summary'] ?? null;
    }
}
