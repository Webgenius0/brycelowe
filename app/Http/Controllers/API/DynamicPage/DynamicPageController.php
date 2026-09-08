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

        $data = DynamicPage::select('id', 'page_title', 'slug', 'status')->where('status', 'Active')->get();
        if ($data) {
            return $this->ok('Data Retrieve Successfully!', $data);
        }

        return $this->error('Data not found', 404);
    }

    public function terms()
    {
        $data = DynamicPage::where('status', 'Active')
            ->where(function ($query) {
                $query->where('slug', 'terms-and-conditions')
                    ->orWhere('id', 1);
            })
            ->firstOrFail();

        return $this->ok('Data Retrieve Successfully!', $data);
    }

    public function privacy()
    {
        $data = DynamicPage::where('status', 'Active')
            ->where(function ($query) {
                $query->where('slug', 'privacy-policy')
                    ->orWhere('id', 2);
            })
            ->firstOrFail();

        return $this->ok('Data retrieved successfully!', $data);
    }

    // public function about()
    // {
    //     $data = \App\Models\AboutUs::first();
    //     if (!$data) {
    //         return $this->error('About Us details not found.', 404);
    //     }

    //     // Maintain backward compatibility
    //     $data->page_title = $data->title;
    //     $data->page_content = $data->content;
    //     $data->why_choose_us = \App\Models\WhyChooseUs::orderBy('sort_order', 'asc')->get();

    //     return $this->ok('Data retrieved successfully!', $data);
    // }

    // public function home()
    // {
    //     $data = \App\Models\HomepageBanner::first();
    //     if (!$data) {
    //         return $this->error('Home page details not found.', 404);
    //     }

    //     // Maintain backward compatibility
    //     $data->page_title = $data->title;
    //     $data->page_content = $data->content;
    //     $data->banner_featuure = \App\Models\BannerFeature::latest()->get();

    //     return $this->ok('Data retrieved successfully!', $data);
    // }

    // public function trustIndicators()
    // {
    //     $data = \App\Models\HomepageBanner::first();
    //     if (!$data) {
    //         return $this->error('Home page details not found.', 404);
    //     }

    //     return $this->ok('Trust indicators retrieved successfully!', $data->trust_indicators_with_urls);
    // }

    // public function customerBuildPage()
    // {
    //     $data = \App\Models\CustomerBuildSetting::first();
    //     if (!$data) {
    //         return $this->error('Customer builds page details not found.', 404);
    //     }

    //     return $this->ok('Data retrieved successfully!', $data);
    // }

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

    // public function platesPage()
    // {
    //     $data = \App\Models\PlateSetting::first();
    //     if (!$data) {
    //         return $this->error('Plates section details not found.', 404);
    //     }

    //     // Maintain backward compatibility
    //     $data->page_title = $data->title;
    //     $data->page_content = $data->content;
    //     $data->why_choose_us = \App\Models\PlateFeature::orderBy('sort_order', 'asc')->get();

    //     return $this->ok('Data retrieved successfully!', $data);
    // }

    // public function pageBanners()
    // {
    //     $banners = \App\Models\PageBanner::all()->keyBy('page');

    //     $data = [
    //         'service' => $banners->get('service'),
    //         'shop' => $banners->get('shop'),
    //         'login' => $banners->get('login'),
    //         'register' => $banners->get('register'),
    //     ];

    //     return $this->ok('Page banners retrieved successfully!', $data);
    // }
}
