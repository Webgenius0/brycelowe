<?php

namespace Database\Seeders;

use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class SystemSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        SystemSetting::updateOrCreate(
            ['id' => 1],
            [
                'site_title' => 'Memoooxy',
                'site_name' => 'Memoooxy',
                'logo' => null,
                'favicon' => null,
                'copyright_text' => 'Copyright © 2026. All Rights Reserved. Powered by Memoooxy.',
                'description' => 'Memoooxy - Modern Platform & Services',
            ]
        );
    }
}
