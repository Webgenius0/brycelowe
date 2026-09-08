<?php

namespace App\Http\Controllers\Web\Faq;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FaqController extends Controller
{
    public function index(Request $request)
    {
        $query = Faq::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('question', 'like', "%{$request->search}%")
                    ->orWhere('answer', 'like', "%{$request->search}%");
            });
        }

        if ($request->sort_by && in_array($request->sort_by, ['serial', 'question', 'status', 'created_at'], true)) {
            $query->orderBy($request->sort_by, $request->sort_order ?? 'asc');
        } else {
            $query->orderBy('serial')->orderBy('id');
        }

        $faqs = $query->paginate(10)->withQueryString();

        $analytics = [
            'total' => Faq::count(),
            'active' => Faq::where('status', 'Active')->count(),
            'inactive' => Faq::where('status', 'Inactive')->count(),
        ];

        return Inertia::render('faq/index', [
            'faqs' => $faqs,
            'analytics' => $analytics,
            'filters' => $request->only(['search', 'sort_by', 'sort_order']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'serial' => 'required|integer|min:1',
            'question' => 'required|string',
            'answer' => 'required|string',
            'status' => 'required|in:Active,Inactive',
        ]);

        Faq::create([
            'serial' => $request->serial,
            'question' => $request->question,
            'answer' => $request->answer,
            'status' => $request->status,
        ]);

        return redirect()->route('faq.index')->with('success', 'FAQ created successfully.');
    }

    public function update(Request $request, $id)
    {
        $faq = Faq::findOrFail($id);

        $request->validate([
            'serial' => 'required|integer|min:1',
            'question' => 'required|string',
            'answer' => 'required|string',
            'status' => 'required|in:Active,Inactive',
        ]);

        $faq->update([
            'serial' => $request->serial,
            'question' => $request->question,
            'answer' => $request->answer,
            'status' => $request->status,
        ]);

        return redirect()->route('faq.index')->with('success', 'FAQ updated successfully.');
    }

    public function destroy($id)
    {
        $faq = Faq::findOrFail($id);
        $faq->delete();

        return redirect()->route('faq.index')->with('success', 'FAQ deleted successfully.');
    }
}
