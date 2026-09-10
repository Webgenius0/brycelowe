<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

#[Fillable([
    'ticket_id',
    'user_id',
    'category',
    'priority',
    'subject',
    'message',
    'status',
    'is_open',
])]
class Ticket extends Model
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
            'user_id' => 'integer',
            'is_open' => 'boolean',
        ];
    }

    /**
     * Booted model hooks.
     */
    protected static function booted(): void
    {
        static::creating(function (Ticket $ticket) {
            if (empty($ticket->ticket_id)) {
                $ticket->ticket_id = 'TKT-' . strtoupper(Str::random(8));
            }
            if (!isset($ticket->is_open)) {
                $ticket->is_open = !in_array($ticket->status, ['RESOLVED', 'CLOSED']);
            }
        });

        static::saving(function (Ticket $ticket) {
            if ($ticket->isDirty('status')) {
                $ticket->is_open = !in_array($ticket->status, ['RESOLVED', 'CLOSED']);
            }
        });
    }

    /**
     * Get the user who opened the ticket.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the attachments for the ticket.
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(TicketAttachment::class);
    }
}
