<?php

namespace App\Http\Controllers\API\Admin;

use App\Concerns\ApiResponse;
use App\Helpers\Helper;
use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\Request;

class AdminSystemSettingController extends Controller
{
    use ApiResponse;

    /**
     * Get system settings.
     */
    public function show()
    {
        $setting = SystemSetting::first() ?? new SystemSetting();
        return $this->ok('System settings retrieved successfully.', $setting);
    }

    /**
     * Update system settings.
     */
    public function update(Request $request)
    {
        $setting = SystemSetting::first() ?? new SystemSetting();

        $validated = $request->validate([
            'site_title' => 'nullable|string|max:255',
            'site_name' => 'nullable|string|max:255',
            'copyright_text' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'apple_store_link' => 'nullable|string|max:255',
            'play_store_link' => 'nullable|string|max:255',
            'social_links' => 'nullable|array',
            'logo' => 'nullable|image|mimes:jpg,jpeg,png,webp,svg|max:5120',
            'favicon' => 'nullable|image|mimes:jpg,jpeg,png,webp,ico|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            if (! empty($setting->getRawOriginal('logo'))) {
                Helper::fileDelete($setting->getRawOriginal('logo'));
            }
            $validated['logo'] = Helper::fileUpload($request->file('logo'), 'system', 'logo_' . time());
        }

        if ($request->hasFile('favicon')) {
            if (! empty($setting->getRawOriginal('favicon'))) {
                Helper::fileDelete($setting->getRawOriginal('favicon'));
            }
            $validated['favicon'] = Helper::fileUpload($request->file('favicon'), 'system', 'favicon_' . time());
        }

        $setting->fill($validated);
        $setting->save();

        return $this->ok('System settings updated successfully.', $setting->fresh());
    }
}
