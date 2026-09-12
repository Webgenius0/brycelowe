<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainingContent extends Model
{
    use HasFactory;

    protected $table = 'training_contents';

    protected $fillable = [
        'user_id',
        'content_category',
        'type',
        'file',
        'size',
        'status',
        'upload_at',
        'is_active',
    ];

    protected $casts = [
        'upload_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    /**
     * Get the user who uploaded or owns this training content.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Accessor for full file URL.
     */
    public function getFileUrlAttribute(): ?string
    {
        if (!$this->file) {
            return null;
        }

        if (str_starts_with($this->file, 'http://') || str_starts_with($this->file, 'https://')) {
            return $this->file;
        }

        return url(ltrim($this->file, '/'));
    }
}
