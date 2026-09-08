<?php

namespace App\Http\Controllers\API\SystemSetting;

use App\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\ContactDetails;
use App\Models\SystemSetting;

class SystemSettingController extends Controller
{
    use ApiResponse;

    public function systemSetting()
    {
        $systemSetting = SystemSetting::first();
        if ($systemSetting) {
            return $this->ok('Data Retrieve Successfully!', $systemSetting);
        }

        return $this->error('System Setting not found', 500);
    }

    public function contact()
    {
        $contactDetails = ContactDetails::first();
        if ($contactDetails) {
            return $this->ok('Data Retrieve Successfully!', $contactDetails);
        }

        return $this->error('System Setting not found', 500);
    }
}
