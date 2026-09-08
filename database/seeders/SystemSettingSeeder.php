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
                'site_title' => 'Bryce Lowe',
                'logo' => null,
                'favicon' => null,
                'copyright_text' => 'Copyright © 2026. All Rights Reserved. Bryce Lowe.',
                'description' => 'Bryce Lowe - Platform & Services',
            ]
        );
    }
}
