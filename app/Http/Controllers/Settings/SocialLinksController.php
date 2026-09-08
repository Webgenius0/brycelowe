<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SocialLinksController extends Controller
{
    public function edit()
    {
        $setting = SystemSetting::first();

        return Inertia::render('settings/social-links', [
            'social_links' => $setting->social_links ?? [],
            'apple_store_link' => $setting->apple_store_link ?? '',
            'play_store_link' => $setting->play_store_link ?? '',
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'apple_store_link' => 'nullable|url|max:255',
            'play_store_link' => 'nullable|url|max:255',
            'social_links' => 'nullable|array',
            'social_links.*.platform' => 'required|string|max:100',
            'social_links.*.url' => 'required|url|max:255',
            'social_links.*.icon' => 'nullable|string|max:100',
        ]);

        $setting = SystemSetting::firstOrNew();

        $setting->apple_store_link = $request->apple_store_link;
        $setting->play_store_link = $request->play_store_link;
        $setting->social_links = $request->social_links ?? [];

        $setting->save();

        return back()->with('success', 'Social and store links updated successfully.');
    }
}
