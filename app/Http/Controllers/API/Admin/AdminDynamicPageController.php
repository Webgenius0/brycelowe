<?php

namespace App\Http\Controllers\API\Admin;

use App\Concerns\ApiResponse;
use App\Helpers\Helper;
use App\Http\Controllers\Controller;
use App\Models\DynamicPage;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminDynamicPageController extends Controller
{
    use ApiResponse;

    /**
     * List all dynamic pages.
     */
    public function index()
    {
        $pages = DynamicPage::orderBy('id', 'asc')->get();
        return $this->ok('Dynamic pages retrieved successfully.', $pages);
    }

    /**
     * Store new dynamic page.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'page_title' => 'required|string|max:255',
            'page_subtitle' => 'nullable|string|max:255',
            'slug' => 'nullable|string|max:255|unique:dynamic_pages,slug',
            'page_content' => 'required|string',
            'status' => 'nullable|in:Active,Inactive',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Helper::makeSlug(DynamicPage::class, $validated['page_title']);
        }

        $page = DynamicPage::create($validated);

        return $this->success('Dynamic page created successfully.', $page, 201);
    }

    /**
     * Show single dynamic page.
     */
    public function show($id)
    {
        $page = DynamicPage::find($id);

        if (! $page) {
            return $this->error('Dynamic page not found.', 404);
        }

        return $this->ok('Dynamic page retrieved successfully.', $page);
    }

    /**
     * Update dynamic page.
     */
    public function update(Request $request, $id)
    {
        $page = DynamicPage::find($id);

        if (! $page) {
            return $this->error('Dynamic page not found.', 404);
        }

        $validated = $request->validate([
            'page_title' => 'sometimes|required|string|max:255',
            'page_subtitle' => 'nullable|string|max:255',
            'slug' => 'nullable|string|max:255|unique:dynamic_pages,slug,' . $page->id,
            'page_content' => 'sometimes|required|string',
            'status' => 'nullable|in:Active,Inactive',
        ]);

        $page->update($validated);

        return $this->ok('Dynamic page updated successfully.', $page->fresh());
    }

    /**
     * Delete dynamic page.
     */
    public function destroy($id)
    {
        $page = DynamicPage::find($id);

        if (! $page) {
            return $this->error('Dynamic page not found.', 404);
        }

        $page->delete();

        return $this->ok('Dynamic page deleted successfully.');
    }
}
