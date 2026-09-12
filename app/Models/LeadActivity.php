<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeadActivity extends Model
{
    use HasFactory;

    protected $table = 'lead_activities';

    protected $fillable = [
        'lead_id',
        'activity_type',
        'timestamp',
        'tmiestamp',
        'description',
        'is_completed',
    ];

    protected $casts = [
        'timestamp' => 'datetime',
        'tmiestamp' => 'datetime',
        'is_completed' => 'boolean',
    ];

    /**
     * Get the parent lead.
     */
    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }
}
