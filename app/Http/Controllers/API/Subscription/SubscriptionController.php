<?php

namespace App\Http\Controllers\API\Subscription;

use App\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Billing;
use App\Models\Discount;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Usages;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    use ApiResponse;

    /**
     * Get user's active/current subscriptions.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Subscription::with([
            'plan.overagesRates',
            'usages',
            'overusages',
            'billings',
        ]);

        if (!in_array($user->role, ['Admin', 'SUPERADMIN']) && !$user->is_superuser) {
            $query->where('user_id', $user->id);
        }

        $subscriptions = $query->latest('id')->get();

        return $this->ok('Subscriptions retrieved successfully.', $subscriptions);
    }

    /**
     * Get details of a single subscription.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $subscription = Subscription::with([
            'plan.overagesRates',
            'usages',
            'overusages',
            'billings',
            'user:id,name,email',
        ])->find($id);

        if (!$subscription) {
            return $this->error('Subscription not found.', 404);
        }

        if (!in_array($user->role, ['Admin', 'SUPERADMIN']) && !$user->is_superuser && $subscription->user_id !== $user->id) {
            return $this->error('Unauthorized.', 403);
        }

        return $this->ok('Subscription retrieved successfully.', $subscription);
    }

    /**
     * Subscribe customer to a plan.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'discount_code' => 'nullable|string',
        ]);

        $plan = Plan::with(['overagesRates', 'discounts'])->findOrFail($validated['plan_id']);

        // Check if discount code applied
        $discountAmount = 0.00;
        if (!empty($validated['discount_code'])) {
            $discount = Discount::where('code', strtoupper($validated['discount_code']))
                ->where('plan_id', $plan->id)
                ->where('is_active', true)
                ->where(function ($q) {
                    $q->whereNull('valid_until')->orWhere('valid_until', '>=', now());
                })
                ->first();

            if ($discount) {
                if ($discount->percent > 0) {
                    $discountAmount = round(((float)$plan->price * $discount->percent) / 100, 2);
                } elseif ($discount->amount > 0) {
                    $discountAmount = (float)$discount->amount;
                }
            }
        }

        $finalPrice = max(0, (float)$plan->price - $discountAmount);

        $isTrial = (bool)$plan->is_trial;
        $status = $isTrial ? 'TRIALING' : 'ACTIVE';
        $periodStart = now();
        $periodEnd = $isTrial
            ? now()->addDays($plan->trial_period ?: 14)
            : ($plan->interval === 'YEARLY' ? now()->addYear() : now()->addMonth());

        $subscription = Subscription::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'started_at' => now(),
            'current_period_start' => $periodStart,
            'current_period_end' => $periodEnd,
            'status' => $status,
            'is_active' => true,
        ]);

        // Initialize empty usages
        $subscription->usages()->create([
            'call_credit' => 0,
            'report_credit' => 0,
            'playbook_credit' => 0,
            'calibration_credit' => 0,
            'get_total_overusages_amount' => 0.00,
        ]);

        // Create billing invoice
        $billing = Billing::create([
            'user_id' => $user->id,
            'subscription_id' => $subscription->id,
            'invoice_number' => 'INV-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4)),
            'date' => now(),
            'status' => 'PAID',
            'call_credit' => $plan->call_credit,
            'report_credit' => $plan->report_credit,
            'playbook_credit' => $plan->playbook_credit,
            'calibration_credit' => $plan->calibration_credit,
            'overusages_amount' => 0.00,
        ]);

        $subscription->load(['plan.overagesRates', 'usages', 'billings']);

        return $this->success('Subscribed to plan successfully.', [
            'subscription' => $subscription,
            'final_price' => $finalPrice,
            'discount_applied' => $discountAmount,
            'invoice' => $billing,
        ], 201);
    }

    /**
     * Record overage usage credits.
     */
    public function recordOverusage(Request $request, int $id): JsonResponse
    {
        $subscription = Subscription::with(['plan.overagesRates', 'usages'])->find($id);

        if (!$subscription) {
            return $this->error('Subscription not found.', 404);
        }

        $type = strtoupper($request->input('overusages_type') ?? $request->input('overages_type') ?? '');
        $request->merge(['overusages_type' => $type]);

        $validated = $request->validate([
            'overusages_type' => 'required|in:CALL,REPORT,PLAYBOOK,CALIBRATION',
            'credit' => 'required|integer|min:1',
        ]);


        // Calculate rate
        $rateItem = $subscription->plan->overagesRates->firstWhere('overages_type', $validated['overusages_type']);
        $unitRate = $rateItem ? (float) $rateItem->overages_rate : 0.00;
        $addedCost = $unitRate * $validated['credit'];

        // Create Overusages record
        $overusage = $subscription->overusages()->create([
            'overusages_type' => $validated['overusages_type'],
            'credit' => $validated['credit'],
            'is_paid' => false,
            'created_at' => now(),
        ]);

        // Increment usages
        $usages = $subscription->usages ?? $subscription->usages()->create();
        $typeField = strtolower($validated['overusages_type']) . '_credit';
        $usages->increment($typeField, $validated['credit']);
        $usages->increment('get_total_overusages_amount', $addedCost);

        return $this->ok('Overusage recorded successfully.', [
            'overusage' => $overusage,
            'unit_rate' => $unitRate,
            'added_cost' => $addedCost,
            'total_overage_cost' => (float) $usages->refresh()->get_total_overusages_amount,
        ]);
    }

    /**
     * Cancel an active subscription.
     */
    public function cancel(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $subscription = Subscription::find($id);

        if (!$subscription) {
            return $this->error('Subscription not found.', 404);
        }

        if (!in_array($user->role, ['Admin', 'SUPERADMIN']) && !$user->is_superuser && $subscription->user_id !== $user->id) {
            return $this->error('Unauthorized.', 403);
        }

        $subscription->update([
            'status' => 'CANCELED',
            'is_active' => false,
            'end_at' => now(),
        ]);

        return $this->ok('Subscription canceled successfully.', $subscription);
    }

    /**
     * Get list of user's billing invoices.
     */
    public function billings(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Billing::with(['subscription.plan']);

        if (!in_array($user->role, ['Admin', 'SUPERADMIN']) && !$user->is_superuser) {
            $query->where('user_id', $user->id);
        }

        $billings = $query->latest('date')->paginate($request->integer('per_page', 15));

        return $this->pagination('Invoices retrieved successfully.', $billings);
    }
}
