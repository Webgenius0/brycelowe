<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class SystemSetting extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'system_settings';

    protected $fillable = [
        'site_title',
        'site_name',
        'copyright_text',
        'logo',
        'favicon',
        'phone',
        'email',
        'address',
        'description',
        'social_links',
        'apple_store_link',
        'play_store_link',
    ];

    protected $casts = [
        'social_links' => 'array',
    ];

    protected $appends = [
        'logo_url',
        'favicon_url',
    ];

    public function getLogoAttribute($value)
    {
        if (!$value) {
            return asset('images/logo.png');
        }
        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }
        $clean = ltrim($value, '/');
        if (str_starts_with($clean, 'storage/')) {
            $clean = substr($clean, 8);
        }
        if (str_starts_with($clean, 'images/')) {
            return asset($clean);
        }
        return asset(Storage::url($clean));
    }

    public function getFaviconAttribute($value)
    {
        if (!$value) {
            return asset('images/favicon.png');
        }
        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }
        $clean = ltrim($value, '/');
        if (str_starts_with($clean, 'storage/')) {
            $clean = substr($clean, 8);
        }
        if (str_starts_with($clean, 'images/')) {
            return asset($clean);
        }
        return asset(Storage::url($clean));
    }

    public function getLogoUrlAttribute()
    {
        return $this->logo;
    }

    public function getFaviconUrlAttribute()
    {
        return $this->favicon;
    }

    public function getSmallDescriptionAttribute()
    {
        return $this->description;
    }

    public function getAppleStoreUrlAttribute()
    {
        return $this->apple_store_link;
    }

    public function getPlayStoreUrlAttribute()
    {
        return $this->play_store_link;
    }
}
