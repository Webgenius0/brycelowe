<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'subscription_id',
    'overusages_type',
    'credit',
    'is_paid',
    'created_at',
])]
class Overusages extends Model
{
    use HasFactory;

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'subscription_id' => 'integer',
            'credit' => 'integer',
            'is_paid' => 'boolean',
            'created_at' => 'datetime',
        ];
    }

    /**
     * Booted model hooks.
     */
    protected static function booted(): void
    {
        static::creating(function (Overusages $overusage) {
            if (empty($overusage->created_at)) {
                $overusage->created_at = now();
            }
        });
    }

    /**
     * Get the subscription that owns the overusage record.
     */
    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }
}
