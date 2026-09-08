<?php

namespace App\Http\Controllers\Web\Dynamic;

use App\Http\Controllers\Controller;
use App\Models\DynamicPage;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class DynamicPageController extends Controller
{
    public function index(Request $request)
    {
        $query = DynamicPage::query();

        if ($request->search) {
            $query->where('page_title', 'like', "%{$request->search}%");
        }

        if ($request->sort_by) {
            $query->orderBy($request->sort_by, $request->sort_order ?? 'asc');
        } else {
            $query->latest();
        }

        $pages = $query->paginate(10)->withQueryString();

        $analytics = [
            'total' => DynamicPage::count(),
            'active' => DynamicPage::where('status', 'Active')->count(),
            'inactive' => DynamicPage::where('status', 'Inactive')->count(),
        ];

        return Inertia::render('dynamic/index', [
            'pages' => $pages,
            'analytics' => $analytics,
            'filters' => $request->only(['search', 'sort_by', 'sort_order']),
        ]);
    }

    public function store(Request $request)
    {
        if (empty($request->slug)) {
            $request->merge(['slug' => Str::slug($request->page_title)]);
        } else {
            $request->merge(['slug' => Str::slug($request->slug)]);
        }

        $request->validate([
            'page_title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:dynamic_pages,slug',
            'page_content' => 'required|string',
            'status' => 'required|in:Active,Inactive',
            'page_subtitle' => 'nullable|string|max:255',
        ]);

        $data = $request->only(['page_title', 'slug', 'page_content', 'status', 'page_subtitle']);

        DynamicPage::create($data);

        return redirect()->route('dynamic.index')->with('success', 'Page created successfully.');
    }

    public function update(Request $request, int $id)
    {
        $page = DynamicPage::findOrFail($id);

        if (empty($request->slug)) {
            $request->merge(['slug' => Str::slug($request->page_title)]);
        } else {
            $request->merge(['slug' => Str::slug($request->slug)]);
        }

        $request->validate([
            'page_title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:dynamic_pages,slug,' . $id,
            'page_content' => 'required|string',
            'status' => 'required|in:Active,Inactive',
            'page_subtitle' => 'nullable|string|max:255',
        ]);

        $data = $request->only(['page_title', 'slug', 'page_content', 'status', 'page_subtitle']);

        $page->update($data);

        return redirect()->route('dynamic.index')->with('success', 'Page updated successfully.');
    }

    public function destroy(int $id)
    {
        $page = DynamicPage::findOrFail($id);
        $page->delete();

        return redirect()->route('dynamic.index')->with('success', 'Page deleted successfully.');
    }
}
