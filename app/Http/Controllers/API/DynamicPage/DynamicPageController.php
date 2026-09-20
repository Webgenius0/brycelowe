<?php

namespace App\Http\Controllers\API\DynamicPage;

use App\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\DynamicPage;
use App\Models\Faq;
use Illuminate\Http\Request;

class DynamicPageController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        if ($request->has('slug')) {
            $data = DynamicPage::where('status', 'Active')->where('slug', $request->slug)->firstOrFail();
            if ($data) {
                return $this->ok('Data Retrieve Successfully!', $data);
            }
        }

        $data = DynamicPage::where('status', 'Active')->get();
        if ($data) {
            return $this->ok('Data Retrieve Successfully!', $data);
        }

        return $this->error('Data not found', 404);
    }

    public function show(string $slug)
    {
        $data = DynamicPage::where('status', 'Active')
            ->where('slug', $slug)
            ->firstOrFail();

        return $this->ok('Data retrieved successfully!', $data);
    }

    public function faq()
    {
        $data = Faq::where('status', 'Active')
            ->orderBy('serial')
            ->orderBy('id')
            ->get();
        if ($data) {
            return $this->ok('Data Retrieve Successfully!', $data);
        }

        return $this->error('Data not found', 404);
    }
}
