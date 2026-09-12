<?php

namespace App\Http\Controllers\API\Admin;

use App\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Billing;
use App\Models\CompanyProfile;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Ticket;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    use ApiResponse;

    /**
     * Get aggregate dashboard stats & KPIs.
     */
    public function stats(Request $request)
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();

        // Users stats
        $totalUsers = User::count();
        $activeUsers = User::where('is_active', true)->where('status', 'Active')->count();
        $newUsersThisMonth = User::where('created_at', '>=', $startOfMonth)->count();

        // Subscriptions & Revenue
        $totalSubscriptions = Subscription::count();
        $activeSubscriptions = Subscription::where('status', 'Active')->count();
        $totalRevenue = (float) Billing::sum('amount');
        $revenueThisMonth = (float) Billing::where('created_at', '>=', $startOfMonth)->sum('amount');

        // Tickets
        $totalTickets = Ticket::count();
        $openTickets = Ticket::whereIn('status', ['OPEN', 'IN_PROGRESS', 'PENDING'])->count();
        $resolvedTickets = Ticket::where('status', 'RESOLVED')->count();

        // Companies & Plans
        $totalCompanies = CompanyProfile::count();
        $totalPlans = Plan::count();

        return $this->ok('Admin dashboard statistics retrieved successfully.', [
            'users' => [
                'total' => $totalUsers,
                'active' => $activeUsers,
                'new_this_month' => $newUsersThisMonth,
            ],
            'revenue' => [
                'total' => $totalRevenue,
                'this_month' => $revenueThisMonth,
                'currency' => 'USD',
            ],
            'subscriptions' => [
                'total' => $totalSubscriptions,
                'active' => $activeSubscriptions,
            ],
            'tickets' => [
                'total' => $totalTickets,
                'open' => $openTickets,
                'resolved' => $resolvedTickets,
            ],
            'companies_count' => $totalCompanies,
            'plans_count' => $totalPlans,
        ]);
    }

    /**
     * Get chart analytics data (monthly registrations, revenue timeline, plan breakdown).
     */
    public function charts(Request $request)
    {
        $months = [];
        $registrations = [];
        $revenue = [];

        // Last 6 months trend
        for ($i = 5; $i >= 0; $i--) {
            $monthDate = Carbon::now()->subMonths($i);
            $monthKey = $monthDate->format('M Y');
            $months[] = $monthKey;

            $start = $monthDate->copy()->startOfMonth();
            $end = $monthDate->copy()->endOfMonth();

            $registrations[] = User::whereBetween('created_at', [$start, $end])->count();
            $revenue[] = (float) Billing::whereBetween('created_at', [$start, $end])->sum('amount');
        }

        // Subscriptions by plan breakdown
        $planBreakdown = Plan::withCount('subscriptions')->get()->map(function ($plan) {
            return [
                'plan_id' => $plan->id,
                'name' => $plan->name,
                'subscriptions_count' => $plan->subscriptions_count,
            ];
        });

        // User status distribution
        $statusBreakdown = [
            'active' => User::where('status', 'Active')->count(),
            'inactive' => User::where('status', 'Inactive')->count(),
            'banned' => User::where('status', 'Banned')->count(),
        ];

        return $this->ok('Admin dashboard chart metrics retrieved successfully.', [
            'timeline' => [
                'labels' => $months,
                'user_registrations' => $registrations,
                'revenue' => $revenue,
            ],
            'plan_breakdown' => $planBreakdown,
            'user_status_breakdown' => $statusBreakdown,
        ]);
    }
}
