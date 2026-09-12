<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Calibration extends Model
{
    use HasFactory;

    protected $table = 'calibrations';

    protected $fillable = [
        'user_id',
        'title',
        'timestamp',
        'total_time',
        'total_time_formatted',
        'overall_score',
        'round_complted',
        'round_completed',
        'status',
        'completed_at',
    ];

    protected $casts = [
        'timestamp' => 'datetime',
        'completed_at' => 'datetime',
        'total_time' => 'integer',
        'overall_score' => 'decimal:2',
        'round_complted' => 'integer',
        'round_completed' => 'integer',
    ];

    /**
     * Get the user who owns this calibration session.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the rounds associated with this calibration session.
     */
    public function rounds(): HasMany
    {
        return $this->hasMany(CalibrationRound::class, 'calibration_id');
    }

    /**
     * Accessor for round_completed with fallback to round_complted.
     */
    public function getRoundCompletedAttribute($value): int
    {
        return $value ?? $this->attributes['round_complted'] ?? 0;
    }

    /**
     * Accessor for round_complted with fallback to round_completed.
     */
    public function getRoundCompltedAttribute($value): int
    {
        return $value ?? $this->attributes['round_completed'] ?? 0;
    }
}
