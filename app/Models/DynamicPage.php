<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DynamicPage extends Model
{
    use HasFactory;

    protected $fillable = [
        'page_title',
        'page_subtitle',
        'slug',
        'page_slug',
        'page_content',
        'status',
    ];

    protected $hidden = [
        'created_at',
    ];

    /**
     * Accessor for page_slug attribute.
     */
    public function getPageSlugAttribute(): ?string
    {
        return $this->slug;
    }

    /**
     * Mutator for page_slug attribute.
     */
    public function setPageSlugAttribute($value): void
    {
        $this->attributes['slug'] = $value;
    }
}
