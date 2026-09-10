<?php

namespace App\Http\Controllers\Web\Plan;

use App\Http\Controllers\Controller;
use App\Models\Discount;
use App\Models\OveragesRate;
use App\Models\Plan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlanController extends Controller
{
    /**
     * Display a listing of the plans.
     */
    public function index(Request $request): Response
    {
        $query = Plan::query()->with(['overagesRates', 'discounts']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('interval', 'like', "%{$search}%");
            });
        }

        if ($request->filled('interval') && $request->interval !== 'all') {
            $query->where('interval', $request->interval);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('is_active', $request->status === 'active');
        }

        $plans = $query->latest('id')->paginate(10)->withQueryString();

        $analytics = [
            'total' => Plan::count(),
            'active' => Plan::where('is_active', true)->count(),
            'inactive' => Plan::where('is_active', false)->count(),
            'trials' => Plan::where('is_trial', true)->count(),
        ];

        return Inertia::render('plan/index', [
            'plans' => $plans,
            'analytics' => $analytics,
            'filters' => $request->only(['search', 'interval', 'status']),
        ]);
    }

    /**
     * Store a newly created plan in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'interval' => 'required|in:MONTHLY,YEARLY,WEEKLY,DAILY,LIFETIME,CUSTOM',
            'call_credit' => 'nullable|integer|min:0',
            'report_credit' => 'nullable|integer|min:0',
            'playbook_credit' => 'nullable|integer|min:0',
            'calibration_credit' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
            'is_trial' => 'boolean',
            'trial_period' => 'nullable|integer|min:0',
            'overages_rates' => 'nullable|array',
            'overages_rates.*.overages_type' => 'required|in:CALL,REPORT,PLAYBOOK,CALIBRATION',
            'overages_rates.*.overages_rate' => 'required|numeric|min:0',
            'discounts' => 'nullable|array',
            'discounts.*.title' => 'required|string|max:255',
            'discounts.*.code' => 'required|string|max:255',
            'discounts.*.percent' => 'nullable|integer|min:0|max:100',
            'discounts.*.amount' => 'nullable|numeric|min:0',
            'discounts.*.valid_until' => 'nullable|date',
            'discounts.*.is_active' => 'nullable|boolean',
        ]);

        $plan = Plan::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'discount_price' => $validated['discount_price'] ?? null,
            'interval' => $validated['interval'],
            'call_credit' => $validated['call_credit'] ?? 0,
            'report_credit' => $validated['report_credit'] ?? 0,
            'playbook_credit' => $validated['playbook_credit'] ?? 0,
            'calibration_credit' => $validated['calibration_credit'] ?? 0,
            'is_active' => $request->boolean('is_active', true),
            'is_trial' => $request->boolean('is_trial', false),
            'trial_period' => $validated['trial_period'] ?? 0,
        ]);

        if (!empty($validated['overages_rates'])) {
            foreach ($validated['overages_rates'] as $rate) {
                $plan->overagesRates()->create([
                    'overages_type' => $rate['overages_type'],
                    'overages_rate' => $rate['overages_rate'] ?? 0.00,
                ]);
            }
        }

        if (!empty($validated['discounts'])) {
            foreach ($validated['discounts'] as $discount) {
                $plan->discounts()->create([
                    'title' => $discount['title'],
                    'code' => $discount['code'],
                    'percent' => $discount['percent'] ?? 0,
                    'amount' => $discount['amount'] ?? 0.00,
                    'valid_until' => !empty($discount['valid_until']) ? $discount['valid_until'] : null,
                    'is_active' => isset($discount['is_active']) ? (bool) $discount['is_active'] : true,
                ]);
            }
        }

        return redirect()->route('plan.index')->with('success', 'Plan created successfully.');
    }

    /**
     * Update the specified plan in storage.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $plan = Plan::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'interval' => 'required|in:MONTHLY,YEARLY,WEEKLY,DAILY,LIFETIME,CUSTOM',
            'call_credit' => 'nullable|integer|min:0',
            'report_credit' => 'nullable|integer|min:0',
            'playbook_credit' => 'nullable|integer|min:0',
            'calibration_credit' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
            'is_trial' => 'boolean',
            'trial_period' => 'nullable|integer|min:0',
            'overages_rates' => 'nullable|array',
            'overages_rates.*.overages_type' => 'required|in:CALL,REPORT,PLAYBOOK,CALIBRATION',
            'overages_rates.*.overages_rate' => 'required|numeric|min:0',
            'discounts' => 'nullable|array',
            'discounts.*.id' => 'nullable|integer',
            'discounts.*.title' => 'required|string|max:255',
            'discounts.*.code' => 'required|string|max:255',
            'discounts.*.percent' => 'nullable|integer|min:0|max:100',
            'discounts.*.amount' => 'nullable|numeric|min:0',
            'discounts.*.valid_until' => 'nullable|date',
            'discounts.*.is_active' => 'nullable|boolean',
        ]);

        $plan->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'discount_price' => $validated['discount_price'] ?? null,
            'interval' => $validated['interval'],
            'call_credit' => $validated['call_credit'] ?? 0,
            'report_credit' => $validated['report_credit'] ?? 0,
            'playbook_credit' => $validated['playbook_credit'] ?? 0,
            'calibration_credit' => $validated['calibration_credit'] ?? 0,
            'is_active' => $request->boolean('is_active', true),
            'is_trial' => $request->boolean('is_trial', false),
            'trial_period' => $validated['trial_period'] ?? 0,
        ]);

        // Sync overages rates
        if ($request->has('overages_rates')) {
            $plan->overagesRates()->delete();
            if (!empty($validated['overages_rates'])) {
                foreach ($validated['overages_rates'] as $rate) {
                    $plan->overagesRates()->create([
                        'overages_type' => $rate['overages_type'],
                        'overages_rate' => $rate['overages_rate'] ?? 0.00,
                    ]);
                }
            }
        }

        // Sync discounts
        if ($request->has('discounts')) {
            $plan->discounts()->delete();
            if (!empty($validated['discounts'])) {
                foreach ($validated['discounts'] as $discount) {
                    $plan->discounts()->create([
                        'title' => $discount['title'],
                        'code' => $discount['code'],
                        'percent' => $discount['percent'] ?? 0,
                        'amount' => $discount['amount'] ?? 0.00,
                        'valid_until' => !empty($discount['valid_until']) ? $discount['valid_until'] : null,
                        'is_active' => isset($discount['is_active']) ? (bool) $discount['is_active'] : true,
                    ]);
                }
            }
        }

        return redirect()->route('plan.index')->with('success', 'Plan updated successfully.');
    }

    /**
     * Toggle active status of the plan.
     */
    public function toggleStatus(int $id): RedirectResponse
    {
        $plan = Plan::findOrFail($id);
        $plan->update(['is_active' => !$plan->is_active]);

        $status = $plan->is_active ? 'activated' : 'deactivated';
        return back()->with('success', "Plan has been {$status}.");
    }

    /**
     * Toggle active status of a discount.
     */
    public function toggleDiscountStatus(int $id): RedirectResponse
    {
        $discount = Discount::findOrFail($id);
        $discount->update(['is_active' => !$discount->is_active]);

        $status = $discount->is_active ? 'activated' : 'deactivated';
        return back()->with('success', "Discount code '{$discount->code}' has been {$status}.");
    }

    /**
     * Remove the specified plan from storage.
     */
    public function destroy(int $id): RedirectResponse
    {
        $plan = Plan::findOrFail($id);
        $plan->delete();

        return redirect()->route('plan.index')->with('success', 'Plan deleted successfully.');
    }
}
