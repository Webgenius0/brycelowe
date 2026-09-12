<?php

namespace App\Http\Controllers\API\Admin;

use App\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;

class AdminPlanController extends Controller
{
    use ApiResponse;

    /**
     * List all plans.
     */
    public function index(Request $request)
    {
        $plans = Plan::withCount('subscriptions')->orderBy('id', 'asc')->get();
        return $this->ok('Plans list retrieved successfully.', $plans);
    }

    /**
     * Create a new plan.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'interval' => 'nullable|in:month,year,monthly,yearly,quarterly',
            'call_credit' => 'nullable|integer|min:0',
            'report_credit' => 'nullable|integer|min:0',
            'playbook_credit' => 'nullable|integer|min:0',
            'calibration_credit' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
            'is_trial' => 'nullable|boolean',
            'trial_period' => 'nullable|integer|min:0',
        ]);

        $plan = Plan::create($validated);

        return $this->success('Plan created successfully.', $plan, 201);
    }

    /**
     * Get plan details.
     */
    public function show($id)
    {
        $plan = Plan::withCount('subscriptions')->find($id);

        if (! $plan) {
            return $this->error('Plan not found.', 404);
        }

        return $this->ok('Plan details retrieved successfully.', $plan);
    }

    /**
     * Update an existing plan.
     */
    public function update(Request $request, $id)
    {
        $plan = Plan::find($id);

        if (! $plan) {
            return $this->error('Plan not found.', 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'interval' => 'nullable|string',
            'call_credit' => 'nullable|integer|min:0',
            'report_credit' => 'nullable|integer|min:0',
            'playbook_credit' => 'nullable|integer|min:0',
            'calibration_credit' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
            'is_trial' => 'nullable|boolean',
            'trial_period' => 'nullable|integer|min:0',
        ]);

        $plan->update($validated);

        return $this->ok('Plan updated successfully.', $plan->fresh());
    }

    /**
     * Toggle plan active/inactive status.
     */
    public function toggleStatus($id)
    {
        $plan = Plan::find($id);

        if (! $plan) {
            return $this->error('Plan not found.', 404);
        }

        $plan->is_active = ! $plan->is_active;
        $plan->save();

        return $this->ok('Plan status updated successfully.', [
            'id' => $plan->id,
            'is_active' => $plan->is_active,
        ]);
    }

    /**
     * Delete a plan.
     */
    public function destroy($id)
    {
        $plan = Plan::find($id);

        if (! $plan) {
            return $this->error('Plan not found.', 404);
        }

        $plan->delete();

        return $this->ok('Plan deleted successfully.');
    }
}
