<?php

namespace App\Http\Controllers\API\Admin;

use App\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Overusages;
use App\Models\Subscription;
use Illuminate\Http\Request;

class AdminSubscriptionController extends Controller
{
    use ApiResponse;

    /**
     * List all user subscriptions with relations and filtering.
     */
    public function index(Request $request)
    {
        $query = Subscription::with(['user:id,name,email,avatar', 'plan:id,name,price,interval'])
            ->latest('id');

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($userId = $request->input('user_id')) {
            $query->where('user_id', $userId);
        }

        if ($planId = $request->input('plan_id')) {
            $query->where('plan_id', $planId);
        }

        if ($search = $request->input('search')) {
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $perPage = min(100, max(5, (int) $request->input('per_page', 15)));
        $subscriptions = $query->paginate($perPage);

        return $this->pagination('Subscriptions list retrieved successfully.', $subscriptions);
    }

    /**
     * Get single subscription details.
     */
    public function show($id)
    {
        $subscription = Subscription::with(['user', 'plan', 'usages', 'overusages', 'billings'])
            ->find($id);

        if (! $subscription) {
            return $this->error('Subscription not found.', 404);
        }

        return $this->ok('Subscription details retrieved successfully.', $subscription);
    }

    /**
     * Update subscription status.
     */
    public function updateStatus(Request $request, $id)
    {
        $subscription = Subscription::find($id);

        if (! $subscription) {
            return $this->error('Subscription not found.', 404);
        }

        $validated = $request->validate([
            'status' => 'required|in:Active,Inactive,CANCELED,EXPIRED,Trial',
        ]);

        $subscription->status = $validated['status'];
        $subscription->is_active = ! in_array(strtoupper($validated['status']), ['CANCELED', 'EXPIRED', 'INACTIVE']);
        $subscription->save();

        return $this->ok('Subscription status updated successfully.', $subscription->fresh());
    }

    /**
     * Record plan overusage on behalf of user.
     */
    public function recordOverusage(Request $request, $id)
    {
        $subscription = Subscription::find($id);

        if (! $subscription) {
            return $this->error('Subscription not found.', 404);
        }

        $validated = $request->validate([
            'overusages_type' => 'required|string|max:50',
            'credit' => 'required|integer|min:1',
            'amount' => 'nullable|numeric|min:0',
        ]);

        $overusage = Overusages::create([
            'subscription_id' => $subscription->id,
            'overusages_type' => $validated['overusages_type'],
            'credit' => $validated['credit'],
            'amount' => $validated['amount'] ?? 0,
        ]);

        return $this->success('Plan overusage recorded successfully.', $overusage, 201);
    }

    /**
     * Cancel or delete subscription.
     */
    public function destroy($id)
    {
        $subscription = Subscription::find($id);

        if (! $subscription) {
            return $this->error('Subscription not found.', 404);
        }

        $subscription->status = 'CANCELED';
        $subscription->is_active = false;
        $subscription->end_at = now();
        $subscription->save();

        return $this->ok('Subscription canceled successfully.');
    }
}
