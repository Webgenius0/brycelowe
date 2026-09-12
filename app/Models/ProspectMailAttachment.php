<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProspectMailAttachment extends Model
{
    use HasFactory;

    protected $table = 'prospect_mail_attachments';

    protected $fillable = [
        'prospect_mail_id',
        'file',
        'file_name',
        'file_type',
        'file_size',
    ];

    /**
     * Get the parent prospect email.
     */
    public function prospectMail(): BelongsTo
    {
        return $this->belongsTo(ProspectMail::class, 'prospect_mail_id');
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
