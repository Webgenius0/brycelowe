<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'ticket_id',
    'file',
])]
class TicketAttachment extends Model
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
            'ticket_id' => 'integer',
        ];
    }

    /**
     * Get the ticket that owns the attachment.
     */
    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    /**
     * Accessor to return full URL for the attachment file.
     */
    public function getFileUrlAttribute(): string
    {
        if (str_starts_with($this->file, 'http://') || str_starts_with($this->file, 'https://')) {
            return $this->file;
        }

        $path = ltrim($this->file, '/');
        return url($path);
    }

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = ['file_url'];
}
