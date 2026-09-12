<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProspectMail extends Model
{
    use HasFactory;

    protected $table = 'prospect_mails';

    protected $fillable = [
        'user_id',
        'to',
        'subject',
        'message',
        'status',
        'is_track',
    ];

    protected $casts = [
        'is_track' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all attachments for this prospect email.
     */
    public function attachments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProspectMailAttachment::class, 'prospect_mail_id');
    }
}
