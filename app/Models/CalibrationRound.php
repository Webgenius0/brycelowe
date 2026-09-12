<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CalibrationRound extends Model
{
    use HasFactory;

    protected $table = 'calibration_rounds';

    protected $fillable = [
        'calibration_id',
        'word_choice',
        'pacing',
        'sentiment',
        'tone',
        'paus',
        'pause',
        'energy',
        'score',
        'status',
    ];

    protected $casts = [
        'word_choice' => 'decimal:2',
        'pacing' => 'decimal:2',
        'sentiment' => 'decimal:2',
        'tone' => 'decimal:2',
        'paus' => 'decimal:2',
        'pause' => 'decimal:2',
        'energy' => 'decimal:2',
        'score' => 'decimal:2',
    ];

    /**
     * Get the parent calibration session.
     */
    public function calibration(): BelongsTo
    {
        return $this->belongsTo(Calibration::class, 'calibration_id');
    }

    /**
     * Accessor for pause with fallback to paus.
     */
    public function getPauseAttribute($value): ?float
    {
        return $value !== null ? (float) $value : ($this->attributes['paus'] !== null ? (float) $this->attributes['paus'] : null);
    }

    /**
     * Accessor for paus with fallback to pause.
     */
    public function getPausAttribute($value): ?float
    {
        return $value !== null ? (float) $value : ($this->attributes['pause'] !== null ? (float) $this->attributes['pause'] : null);
    }
}
