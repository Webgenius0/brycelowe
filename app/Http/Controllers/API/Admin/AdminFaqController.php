<?php

namespace App\Http\Controllers\API\Admin;

use App\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Faq;
use Illuminate\Http\Request;

class AdminFaqController extends Controller
{
    use ApiResponse;

    /**
     * List all FAQs.
     */
    public function index()
    {
        $faqs = Faq::orderBy('serial', 'asc')->orderBy('id', 'desc')->get();
        return $this->ok('FAQs retrieved successfully.', $faqs);
    }

    /**
     * Store new FAQ.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'question' => 'required|string',
            'answer' => 'required|string',
            'serial' => 'nullable|integer|min:0',
            'status' => 'nullable|in:Active,Inactive',
        ]);

        if (! isset($validated['serial'])) {
            $validated['serial'] = (Faq::max('serial') ?? 0) + 1;
        }

        $faq = Faq::create($validated);

        return $this->success('FAQ created successfully.', $faq, 201);
    }

    /**
     * Show single FAQ.
     */
    public function show($id)
    {
        $faq = Faq::find($id);

        if (! $faq) {
            return $this->error('FAQ not found.', 404);
        }

        return $this->ok('FAQ retrieved successfully.', $faq);
    }

    /**
     * Update FAQ.
     */
    public function update(Request $request, $id)
    {
        $faq = Faq::find($id);

        if (! $faq) {
            return $this->error('FAQ not found.', 404);
        }

        $validated = $request->validate([
            'question' => 'sometimes|required|string',
            'answer' => 'sometimes|required|string',
            'serial' => 'nullable|integer|min:0',
            'status' => 'nullable|in:Active,Inactive',
        ]);

        $faq->update($validated);

        return $this->ok('FAQ updated successfully.', $faq->fresh());
    }

    /**
     * Delete FAQ.
     */
    public function destroy($id)
    {
        $faq = Faq::find($id);

        if (! $faq) {
            return $this->error('FAQ not found.', 404);
        }

        $faq->delete();

        return $this->ok('FAQ deleted successfully.');
    }
}
