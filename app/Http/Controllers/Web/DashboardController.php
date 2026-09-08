<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\DynamicPage;
use App\Models\Faq;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $fromInput = request()->query('from');
        $toInput = request()->query('to');

        if ($fromInput && $toInput) {
            try {
                $from = Carbon::parse($fromInput);
                $to = Carbon::parse($toInput);
            } catch (\Exception $e) {
                $from = Carbon::now()->startOfMonth();
                $to = Carbon::now();
            }
        } else {
            $from = Carbon::now()->startOfMonth();
            $to = Carbon::now();
        }

        if ($from->gt($to)) {
            $temp = $from;
            $from = $to;
            $to = $temp;
        }

        $preset = request()->query('preset', 'this_month');
        $durationInSeconds = max(1, $to->diffInSeconds($from));

        switch ($preset) {
            case 'today':
                $prevFrom = $from->copy()->subDay();
                $prevTo   = $to->copy()->subDay();
                $trendLabel = 'vs yesterday';
                break;

            case 'yesterday':
                $prevFrom = $from->copy()->subDay();
                $prevTo   = $to->copy()->subDay();
                $trendLabel = 'vs 2 days ago';
                break;

            case 'this_week':
                $prevFrom = $from->copy()->subWeek();
                $prevTo   = $to->copy()->subWeek();
                $trendLabel = 'vs last week';
                break;

            case 'this_month':
                $prevFrom = $from->copy()->subMonth()->startOfMonth();
                $prevTo   = $from->copy()->subMonth()->endOfMonth();
                $trendLabel = 'vs last month';
                break;

            case 'last_month':
                $prevFrom = $from->copy()->subMonth()->startOfMonth();
                $prevTo   = $from->copy()->subMonth()->endOfMonth();
                $trendLabel = 'vs prior month';
                break;

            case 'last_30_days':
                $prevFrom = $from->copy()->subDays(30);
                $prevTo   = $to->copy()->subDays(30);
                $trendLabel = 'vs prior 30 days';
                break;

            case 'last_6_months':
                $prevFrom = $from->copy()->subMonths(6);
                $prevTo   = $to->copy()->subMonths(6);
                $trendLabel = 'vs prior 6 months';
                break;

            case 'last_year':
                $prevFrom = $from->copy()->subYear();
                $prevTo   = $to->copy()->subYear();
                $trendLabel = 'vs prior year';
                break;

            default:
                $prevTo   = $from->copy();
                $prevFrom = $from->copy()->subSeconds($durationInSeconds);
                $trendLabel = 'vs previous period';
                break;
        }

        // Helper function for trends
        $calcTrend = function ($current, $prev) {
            if ($prev > 0) {
                return round((($current - $prev) / $prev) * 100, 1);
            }
            return $current > 0 ? 100.0 : 0.0;
        };

        // Users Trend
        $currentUsers = User::whereBetween('created_at', [$from, $to])->count();
        $prevUsers = User::whereBetween('created_at', [$prevFrom, $prevTo])->count();
        $usersTrend = $calcTrend($currentUsers, $prevUsers);

        // Active Users Trend
        $currentActiveUsers = User::where('status', 'Active')->whereBetween('created_at', [$from, $to])->count();
        $prevActiveUsers = User::where('status', 'Active')->whereBetween('created_at', [$prevFrom, $prevTo])->count();
        $activeUsersTrend = $calcTrend($currentActiveUsers, $prevActiveUsers);

        // Dynamic Pages & FAQ counts
        $totalDynamicPages = DynamicPage::count();
        $totalFaqs = Faq::count();

        // Chart data grouping based on range duration
        $diffInHours = $from->diffInHours($to);
        $diffInDays = $from->diffInDays($to);
        $chartData = [];

        if ($diffInHours <= 24) {
            $steps = max(1, (int) $diffInHours);
            for ($i = 0; $i <= $steps; $i++) {
                $start = $from->copy()->addHours($i)->startOfHour();
                $end = $start->copy()->endOfHour();
                if ($end->gt($to)) {
                    $end = $to->copy();
                }

                $usersCount = User::whereBetween('created_at', [$start, $end])->count();

                $chartData[] = [
                    'month' => $start->format('H:i'),
                    'fullMonth' => $start->format('M d, Y g:i A'),
                    'users' => $usersCount,
                ];
            }
        } elseif ($diffInDays <= 31) {
            for ($i = 0; $i <= $diffInDays; $i++) {
                $start = $from->copy()->addDays($i)->startOfDay();
                $end = $start->copy()->endOfDay();
                if ($end->gt($to)) {
                    $end = $to->copy();
                }

                $usersCount = User::whereBetween('created_at', [$start, $end])->count();

                $chartData[] = [
                    'month' => $start->format('M d'),
                    'fullMonth' => $start->format('F d, Y'),
                    'users' => $usersCount,
                ];
            }
        } else {
            $current = $from->copy()->startOfMonth();
            while ($current->lte($to)) {
                $start = $current->copy();
                $end = $current->copy()->endOfMonth();
                if ($start->lt($from)) {
                    $start = $from->copy();
                }
                if ($end->gt($to)) {
                    $end = $to->copy();
                }

                $usersCount = User::whereBetween('created_at', [$start, $end])->count();

                $chartData[] = [
                    'month' => $start->format('M'),
                    'fullMonth' => $start->format('F Y'),
                    'users' => $usersCount,
                ];

                $current->addMonth();
            }
        }

        // Recent signups
        $recentUsers = User::whereBetween('created_at', [$from, $to])
            ->latest('created_at')
            ->limit(5)
            ->get()
            ->map(fn($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role,
                'status' => $u->status,
                'created_at' => $u->created_at?->diffForHumans() ?? 'Just now',
            ]);

        // General global database counts
        $totalUsersGlobal = User::count();
        $activeUsersGlobal = User::where('status', 'Active')->count();

        // Newsletter stats & recent subscribers
        $totalSubscribers = \App\Models\NewsletterSubscriber::count();
        $activeSubscribers = \App\Models\NewsletterSubscriber::where('status', 'subscribed')->count();
        $recentSubscribers = \App\Models\NewsletterSubscriber::latest()
            ->limit(6)
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'email' => $s->email,
                'name' => $s->name,
                'status' => $s->status,
                'source' => $s->source,
                'created_at' => $s->created_at?->diffForHumans() ?? 'Recently',
            ]);

        $recentCampaigns = \App\Models\NewsletterCampaign::latest()
            ->limit(3)
            ->get()
            ->map(fn($c) => [
                'id' => $c->id,
                'subject' => $c->subject,
                'recipients_count' => $c->recipients_count,
                'status' => $c->status,
                'sent_at' => $c->sent_at?->diffForHumans() ?? 'Draft',
            ]);

        return Inertia::render('dashboard', [
            'stats' => [
                'lifetime' => [
                    'total_users' => $totalUsersGlobal,
                    'active_users' => $activeUsersGlobal,
                    'total_businesses' => 0,
                    'active_businesses' => 0,
                    'total_plans' => 0,
                    'active_plans' => 0,
                    'total_redemptions' => 0,
                    'pending_redemptions' => 0,
                    'total_revenue' => 0,
                    'pending_payouts' => 0,
                    'total_admins' => User::whereIn('role', ['SUPERADMIN', 'Admin'])->count(),
                    'total_superadmins' => User::whereIn('role', ['SUPERADMIN', 'Admin'])->count(),
                    'total_managers' => User::where('role', 'MANAGER')->count(),
                    'total_sales' => User::where('role', 'SELS')->count(),
                    'total_auditors' => User::where('role', 'AUDIOTOR')->count(),
                    'total_partners' => User::where('role', 'SELS')->count(),
                    'total_customers' => User::where('role', 'MANAGER')->count(),
                    'total_pages' => $totalDynamicPages,
                    'total_faqs' => $totalFaqs,
                    'total_subscribers' => $totalSubscribers,
                    'active_subscribers' => $activeSubscribers,
                ],
                'period' => [
                    'total_users' => $currentUsers,
                    'active_users' => $currentActiveUsers,
                    'total_businesses' => 0,
                    'active_businesses' => 0,
                    'total_plans' => 0,
                    'active_plans' => 0,
                    'total_redemptions' => 0,
                    'pending_redemptions' => 0,
                    'total_revenue' => 0,
                    'pending_payouts' => 0,
                    'total_admins' => User::whereIn('role', ['SUPERADMIN', 'Admin'])->whereBetween('created_at', [$from, $to])->count(),
                    'total_superadmins' => User::whereIn('role', ['SUPERADMIN', 'Admin'])->whereBetween('created_at', [$from, $to])->count(),
                    'total_managers' => User::where('role', 'MANAGER')->whereBetween('created_at', [$from, $to])->count(),
                    'total_sales' => User::where('role', 'SELS')->whereBetween('created_at', [$from, $to])->count(),
                    'total_auditors' => User::where('role', 'AUDIOTOR')->whereBetween('created_at', [$from, $to])->count(),
                    'total_partners' => User::where('role', 'SELS')->whereBetween('created_at', [$from, $to])->count(),
                    'total_customers' => User::where('role', 'MANAGER')->whereBetween('created_at', [$from, $to])->count(),
                ],
                'users_trend' => $usersTrend,
                'businesses_trend' => 0,
                'redemptions_trend' => 0,
                'revenue_trend' => 0,
                'active_users_trend' => $activeUsersTrend,
                'total_superadmins' => User::whereIn('role', ['SUPERADMIN', 'Admin'])->whereBetween('created_at', [$from, $to])->count(),
                'total_managers' => User::where('role', 'MANAGER')->whereBetween('created_at', [$from, $to])->count(),
                'total_sales' => User::where('role', 'SELS')->whereBetween('created_at', [$from, $to])->count(),
                'total_auditors' => User::where('role', 'AUDIOTOR')->whereBetween('created_at', [$from, $to])->count(),
                'trend_label' => $trendLabel,
            ],
            'chartData' => $chartData,
            'recentUsers' => $recentUsers,
            'newsletter' => [
                'total' => $totalSubscribers,
                'active' => $activeSubscribers,
                'recentSubscribers' => $recentSubscribers,
                'recentCampaigns' => $recentCampaigns,
            ],
            'filters' => [
                'from' => $from->toIso8601String(),
                'to' => $to->toIso8601String(),
                'preset' => $preset,
            ]
        ]);
    }
}
