<?php

namespace App\Http\Controllers\API\Plan;

use App\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Discount;
use App\Models\Plan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    use ApiResponse;

    /**
     * Get list of active subscription plans with overages and discounts.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Plan::query()->with(['overagesRates', 'discounts']);

        if (!$request->boolean('include_inactive', false)) {
            $query->where('is_active', true);
        }

        if ($request->filled('interval')) {
            $query->where('interval', strtoupper($request->interval));
        }

        $plans = $query->orderBy('price')->get();

        return $this->ok('Plans retrieved successfully.', $plans);
    }

    /**
     * Get a specific plan by ID.
     */
    public function show(int $id): JsonResponse
    {
        $plan = Plan::with(['overagesRates', 'discounts'])->find($id);

        if (!$plan) {
            return $this->error('Plan not found.', 404);
        }

        return $this->ok('Plan retrieved successfully.', $plan);
    }

    /**
     * Store a newly created plan.
     */
    public function store(Request $request): JsonResponse
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
            'is_active' => 'nullable|boolean',
            'is_trial' => 'nullable|boolean',
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
            'is_active' => $validated['is_active'] ?? true,
            'is_trial' => $validated['is_trial'] ?? false,
            'trial_period' => $validated['trial_period'] ?? 0,
        ]);

        if (!empty($validated['overages_rates'])) {
            foreach ($validated['overages_rates'] as $rate) {
                $plan->overagesRates()->create([
                    'overages_type' => $rate['overages_type'],
                    'overages_rate' => $rate['overages_rate'],
                ]);
            }
        }

        if (!empty($validated['discounts'])) {
            foreach ($validated['discounts'] as $discount) {
                $plan->discounts()->create([
                    'title' => $discount['title'],
                    'code' => strtoupper($discount['code']),
                    'percent' => $discount['percent'] ?? 0,
                    'amount' => $discount['amount'] ?? 0.00,
                    'valid_until' => $discount['valid_until'] ?? null,
                    'is_active' => $discount['is_active'] ?? true,
                ]);
            }
        }

        $plan->load(['overagesRates', 'discounts']);

        return $this->success('Plan created successfully.', $plan, 201);
    }

    /**
     * Update an existing plan.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $plan = Plan::find($id);

        if (!$plan) {
            return $this->error('Plan not found.', 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'interval' => 'sometimes|required|in:MONTHLY,YEARLY,WEEKLY,DAILY,LIFETIME,CUSTOM',
            'call_credit' => 'nullable|integer|min:0',
            'report_credit' => 'nullable|integer|min:0',
            'playbook_credit' => 'nullable|integer|min:0',
            'calibration_credit' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
            'is_trial' => 'nullable|boolean',
            'trial_period' => 'nullable|integer|min:0',
            'overages_rates' => 'nullable|array',
            'discounts' => 'nullable|array',
        ]);

        $plan->update($validated);

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

        if ($request->has('discounts')) {
            $plan->discounts()->delete();
            if (!empty($validated['discounts'])) {
                foreach ($validated['discounts'] as $discount) {
                    $plan->discounts()->create([
                        'title' => $discount['title'],
                        'code' => strtoupper($discount['code']),
                        'percent' => $discount['percent'] ?? 0,
                        'amount' => $discount['amount'] ?? 0.00,
                        'valid_until' => $discount['valid_until'] ?? null,
                        'is_active' => $discount['is_active'] ?? true,
                    ]);
                }
            }
        }

        $plan->load(['overagesRates', 'discounts']);

        return $this->ok('Plan updated successfully.', $plan);
    }

    /**
     * Delete a plan.
     */
    public function destroy(int $id): JsonResponse
    {
        $plan = Plan::find($id);

        if (!$plan) {
            return $this->error('Plan not found.', 404);
        }

        $plan->delete();

        return $this->ok('Plan deleted successfully.');
    }

    /**
     * Validate and apply discount coupon code.
     */
    public function checkDiscount(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string',
            'plan_id' => 'required|exists:plans,id',
        ]);

        $discount = Discount::where('code', strtoupper($validated['code']))
            ->where('plan_id', $validated['plan_id'])
            ->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('valid_until')->orWhere('valid_until', '>=', now());
            })
            ->first();

        if (!$discount) {
            return $this->error('Invalid or expired discount code.', 404);
        }

        $plan = Plan::find($validated['plan_id']);
        $originalPrice = (float) $plan->price;
        $discountAmount = 0.0;

        if ($discount->percent && $discount->percent > 0) {
            $discountAmount = round(($originalPrice * $discount->percent) / 100, 2);
        } elseif ($discount->amount && $discount->amount > 0) {
            $discountAmount = (float) $discount->amount;
        }

        $finalPrice = max(0, $originalPrice - $discountAmount);

        return $this->ok('Discount code applied successfully.', [
            'discount' => $discount,
            'original_price' => $originalPrice,
            'discount_amount' => $discountAmount,
            'final_price' => $finalPrice,
        ]);
    }
}
