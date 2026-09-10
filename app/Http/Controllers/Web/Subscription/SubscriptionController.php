<?php

namespace App\Http\Controllers\Web\Subscription;

use App\Http\Controllers\Controller;
use App\Models\Billing;
use App\Models\Overusages;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Usages;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    /**
     * Display a listing of the subscriptions.
     */
    public function index(Request $request): Response
    {
        $query = Subscription::query()->with([
            'user',
            'plan.overagesRates',
            'usages',
            'overusages',
            'billings',
        ]);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($uq) use ($search) {
                    $uq->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })->orWhereHas('plan', function ($pq) use ($search) {
                    $pq->where('name', 'like', "%{$search}%");
                });
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('plan_id') && $request->plan_id !== 'all') {
            $query->where('plan_id', $request->plan_id);
        }

        $subscriptions = $query->latest('id')->paginate(10)->withQueryString();

        $analytics = [
            'total' => Subscription::count(),
            'active' => Subscription::where('status', 'ACTIVE')->count(),
            'trialing' => Subscription::where('status', 'TRIALING')->count(),
            'past_due' => Subscription::where('status', 'PAST_DUE')->count(),
            'canceled' => Subscription::where('status', 'CANCELED')->count(),
            'total_overages' => (float) Usages::sum('get_total_overusages_amount'),
        ];

        $users = User::select('id', 'name', 'email')->orderBy('name')->get();
        $plans = Plan::where('is_active', true)->with('overagesRates')->orderBy('name')->get();

        return Inertia::render('subscription/index', [
            'subscriptions' => $subscriptions,
            'analytics' => $analytics,
            'users' => $users,
            'plans' => $plans,
            'filters' => $request->only(['search', 'status', 'plan_id']),
        ]);
    }

    /**
     * Store a newly created subscription in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'plan_id' => 'required|exists:plans,id',
            'started_at' => 'nullable|date',
            'current_period_start' => 'nullable|date',
            'current_period_end' => 'nullable|date',
            'status' => 'required|in:ACTIVE,TRIALING,PAST_DUE,CANCELED,EXPIRED,PENDING',
        ]);

        $plan = Plan::findOrFail($validated['plan_id']);
        $start = !empty($validated['current_period_start']) ? $validated['current_period_start'] : now();
        $end = !empty($validated['current_period_end']) ? $validated['current_period_end'] : (
            $plan->interval === 'YEARLY' ? now()->addYear() : now()->addMonth()
        );

        $subscription = Subscription::create([
            'user_id' => $validated['user_id'],
            'plan_id' => $validated['plan_id'],
            'started_at' => $validated['started_at'] ?? now(),
            'current_period_start' => $start,
            'current_period_end' => $end,
            'status' => $validated['status'],
            'is_active' => in_array($validated['status'], ['ACTIVE', 'TRIALING']),
        ]);

        // Initialize empty usages
        $subscription->usages()->create([
            'call_credit' => 0,
            'report_credit' => 0,
            'playbook_credit' => 0,
            'calibration_credit' => 0,
            'get_total_overusages_amount' => 0.00,
        ]);

        // Generate initial billing invoice
        Billing::create([
            'user_id' => $subscription->user_id,
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

        return redirect()->route('subscription.index')->with('success', 'Subscription created successfully.');
    }

    /**
     * Update the specified subscription in storage.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $subscription = Subscription::findOrFail($id);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'plan_id' => 'required|exists:plans,id',
            'started_at' => 'nullable|date',
            'current_period_start' => 'nullable|date',
            'current_period_end' => 'nullable|date',
            'status' => 'required|in:ACTIVE,TRIALING,PAST_DUE,CANCELED,EXPIRED,PENDING',
        ]);

        $subscription->update([
            'user_id' => $validated['user_id'],
            'plan_id' => $validated['plan_id'],
            'started_at' => $validated['started_at'],
            'current_period_start' => $validated['current_period_start'],
            'current_period_end' => $validated['current_period_end'],
            'status' => $validated['status'],
            'is_active' => in_array($validated['status'], ['ACTIVE', 'TRIALING']),
        ]);

        return redirect()->route('subscription.index')->with('success', 'Subscription updated successfully.');
    }

    /**
     * Update status of the subscription.
     */
    public function updateStatus(Request $request, int $id): RedirectResponse
    {
        $subscription = Subscription::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:ACTIVE,TRIALING,PAST_DUE,CANCELED,EXPIRED,PENDING',
        ]);

        $status = $validated['status'];
        $subscription->update([
            'status' => $status,
            'is_active' => in_array($status, ['ACTIVE', 'TRIALING']),
        ]);

        return back()->with('success', "Subscription status changed to {$status}.");
    }

    /**
     * Record overusage for a subscription.
     */
    public function recordOverusage(Request $request, int $id): RedirectResponse
    {
        $subscription = Subscription::with(['plan.overagesRates', 'usages'])->findOrFail($id);

        $validated = $request->validate([
            'overusages_type' => 'required|in:CALL,REPORT,PLAYBOOK,CALIBRATION',
            'credit' => 'required|integer|min:1',
        ]);

        // Find rate
        $rateItem = $subscription->plan->overagesRates->firstWhere('overages_type', $validated['overusages_type']);
        $unitRate = $rateItem ? (float) $rateItem->overages_rate : 0.00;
        $addedCost = $unitRate * $validated['credit'];

        // Create Overusages record
        $subscription->overusages()->create([
            'overusages_type' => $validated['overusages_type'],
            'credit' => $validated['credit'],
            'is_paid' => false,
            'created_at' => now(),
        ]);

        // Update Usages record
        $usages = $subscription->usages ?? $subscription->usages()->create();
        $typeField = strtolower($validated['overusages_type']) . '_credit';
        $usages->increment($typeField, $validated['credit']);
        $usages->increment('get_total_overusages_amount', $addedCost);

        return back()->with('success', "Recorded {$validated['credit']} overage credits ({$validated['overusages_type']}).");
    }

    /**
     * Remove the specified subscription from storage.
     */
    public function destroy(int $id): RedirectResponse
    {
        $subscription = Subscription::findOrFail($id);
        $subscription->delete();

        return redirect()->route('subscription.index')->with('success', 'Subscription deleted successfully.');
    }
}
