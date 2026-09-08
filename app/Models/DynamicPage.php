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
        'page_content',
        'status',
    ];

    protected $hidden = [
        'created_at',
    ];
}
