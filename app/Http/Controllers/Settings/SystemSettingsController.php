<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SystemSettingsController extends Controller
{
    public function edit()
    {
        $setting = SystemSetting::first();

        return Inertia::render('settings/system', [
            'setting' => $setting ? [
                'site_title' => $setting->getRawOriginal('site_title'),
                'site_name' => $setting->getRawOriginal('site_name'),
                'system_name' => $setting->system_name,
                'description' => $setting->description,
                'copyright_text' => $setting->copyright_text,
                'phone' => $setting->phone,
                'email' => $setting->email,
                'address' => $setting->address,
                'logo' => $setting->logo,
                'favicon' => $setting->favicon,
                'social_links' => $setting->social_links ?? [],
            ] : null,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'site_title' => 'nullable|string|max:255',
            'site_name' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'copyright_text' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'logo' => 'nullable|image|max:20480',
            'favicon' => 'nullable|image|max:20480',
            'social_links' => 'nullable|array',
            'social_links.*.platform' => 'required|string|max:100',
            'social_links.*.url' => 'required|url|max:255',
            'social_links.*.icon' => 'nullable|string|max:100',
        ]);

        $setting = SystemSetting::firstOrNew();

        $setting->site_title = $request->site_title;
        $setting->site_name = $request->site_name;
        $setting->description = $request->description;
        $setting->copyright_text = $request->copyright_text;
        $setting->phone = $request->phone;
        $setting->email = $request->email;
        $setting->address = $request->address;
        $setting->social_links = $request->social_links ?? [];

        if ($request->hasFile('logo')) {
            $setting->logo = $request->file('logo')->store('uploads/logo', 'public');
        }

        if ($request->hasFile('favicon')) {
            $setting->favicon = $request->file('favicon')->store('uploads/favicon', 'public');
        }

        $setting->save();

        return back()->with('success', 'System settings updated successfully.');
    }
}
