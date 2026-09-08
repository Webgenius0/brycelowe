import { Head, Link, router } from '@inertiajs/react';
import {
    Users,
    TrendingUp,
    TrendingDown,
    Calendar,
    ChevronDown,
    UserCheck,
    Shield,
    Activity,
    PieChart as PieChartIcon,
    Sparkles,
    ShieldAlert,
    CheckCircle2,
    Lock,
    Globe,
    Zap,
    Mail,
    CreditCard,
    Wallet,
    DollarSign,
    ArrowUpRight,
    ArrowRight,
    Clock,
} from 'lucide-react';
import { useEffect, useState, useRef, useMemo } from 'react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { dashboard } from '@/routes';

type StatBreakdown = {
    total_users: number;
    active_users: number;
    total_businesses: number;
    active_businesses: number;
    total_plans: number;
    active_plans: number;
    total_redemptions: number;
    pending_redemptions: number;
    total_revenue: number;
    pending_payouts: number;
    total_admins: number;
    total_partners: number;
    total_customers: number;
    total_subscribers?: number;
    active_subscribers?: number;
};

type Stats = {
    lifetime: StatBreakdown;
    period: StatBreakdown;
    users_trend: number;
    businesses_trend: number;
    redemptions_trend: number;
    revenue_trend: number;
    total_admins: number;
    total_partners: number;
    total_customers: number;
    trend_label?: string;
    active_users_trend?: number;
};

type RecentUser = {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    created_at: string;
};

type ChartPoint = {
    month: string;
    fullMonth?: string;
    subscribers?: number;
    users: number;
    businesses?: number;
    redemptions?: number;
};

type Subscriber = {
    id: number;
    email: string;
    name: string | null;
    status: string;
    source: string;
    created_at: string;
};

type Campaign = {
    id: number;
    subject: string;
    recipients_count: number;
    status: string;
    sent_at: string;
};

type Props = {
    stats: Stats;
    chartData: ChartPoint[];
    recentUsers: RecentUser[];
    newsletter?: {
        total: number;
        active: number;
        recentSubscribers: Subscriber[];
        recentCampaigns: Campaign[];
    };
    filters?: {
        from?: string;
        to?: string;
        preset?: string;
    };
};

// ───────────────────── MOCK DATA FOR CHARTS ─────────────────────

const MONTHLY_MOCK_DATA = [
    { period: 'Jan', fullPeriod: 'January 2026', totalUsers: 450, activeUsers: 380, newSignups: 95, securityEvents: 14 },
    { period: 'Feb', fullPeriod: 'February 2026', totalUsers: 620, activeUsers: 510, newSignups: 170, securityEvents: 22 },
    { period: 'Mar', fullPeriod: 'March 2026', totalUsers: 840, activeUsers: 720, newSignups: 220, securityEvents: 18 },
    { period: 'Apr', fullPeriod: 'April 2026', totalUsers: 1100, activeUsers: 940, newSignups: 260, securityEvents: 31 },
    { period: 'May', fullPeriod: 'May 2026', totalUsers: 1450, activeUsers: 1220, newSignups: 350, securityEvents: 25 },
    { period: 'Jun', fullPeriod: 'June 2026', totalUsers: 1890, activeUsers: 1610, newSignups: 440, securityEvents: 40 },
    { period: 'Jul', fullPeriod: 'July 2026', totalUsers: 2340, activeUsers: 1980, newSignups: 450, securityEvents: 36 },
    { period: 'Aug', fullPeriod: 'August 2026', totalUsers: 2850, activeUsers: 2420, newSignups: 510, securityEvents: 48 },
    { period: 'Sep', fullPeriod: 'September 2026', totalUsers: 3420, activeUsers: 2950, newSignups: 570, securityEvents: 52 },
    { period: 'Oct', fullPeriod: 'October 2026', totalUsers: 4100, activeUsers: 3580, newSignups: 680, securityEvents: 60 },
    { period: 'Nov', fullPeriod: 'November 2026', totalUsers: 4890, activeUsers: 4250, newSignups: 790, securityEvents: 68 },
    { period: 'Dec', fullPeriod: 'December 2026', totalUsers: 5750, activeUsers: 5040, newSignups: 860, securityEvents: 75 },
];

const WEEKLY_MOCK_DATA = [
    { period: 'W1', fullPeriod: 'Week 1', totalUsers: 3820, activeUsers: 3200, newSignups: 140, securityEvents: 15 },
    { period: 'W2', fullPeriod: 'Week 2', totalUsers: 4010, activeUsers: 3450, newSignups: 190, securityEvents: 20 },
    { period: 'W3', fullPeriod: 'Week 3', totalUsers: 4250, activeUsers: 3680, newSignups: 240, securityEvents: 18 },
    { period: 'W4', fullPeriod: 'Week 4', totalUsers: 4520, activeUsers: 3910, newSignups: 270, securityEvents: 24 },
    { period: 'W5', fullPeriod: 'Week 5', totalUsers: 4810, activeUsers: 4150, newSignups: 290, securityEvents: 22 },
    { period: 'W6', fullPeriod: 'Week 6', totalUsers: 5120, activeUsers: 4460, newSignups: 310, securityEvents: 30 },
    { period: 'W7', fullPeriod: 'Week 7', totalUsers: 5460, activeUsers: 4780, newSignups: 340, securityEvents: 28 },
    { period: 'W8', fullPeriod: 'Week 8', totalUsers: 5750, activeUsers: 5040, newSignups: 390, securityEvents: 35 },
];

const DAILY_MOCK_DATA = [
    { period: 'Day 1', fullPeriod: 'Mar 1', totalUsers: 5100, activeUsers: 4520, newSignups: 42, securityEvents: 5 },
    { period: 'Day 2', fullPeriod: 'Mar 2', totalUsers: 5145, activeUsers: 4560, newSignups: 45, securityEvents: 7 },
    { period: 'Day 3', fullPeriod: 'Mar 3', totalUsers: 5195, activeUsers: 4610, newSignups: 50, securityEvents: 4 },
    { period: 'Day 4', fullPeriod: 'Mar 4', totalUsers: 5240, activeUsers: 4650, newSignups: 45, securityEvents: 8 },
    { period: 'Day 5', fullPeriod: 'Mar 5', totalUsers: 5298, activeUsers: 4710, newSignups: 58, securityEvents: 6 },
    { period: 'Day 6', fullPeriod: 'Mar 6', totalUsers: 5360, activeUsers: 4780, newSignups: 62, securityEvents: 9 },
    { period: 'Day 7', fullPeriod: 'Mar 7', totalUsers: 5430, activeUsers: 4840, newSignups: 70, securityEvents: 5 },
    { period: 'Day 8', fullPeriod: 'Mar 8', totalUsers: 5490, activeUsers: 4890, newSignups: 60, securityEvents: 8 },
    { period: 'Day 9', fullPeriod: 'Mar 9', totalUsers: 5555, activeUsers: 4940, newSignups: 65, securityEvents: 7 },
    { period: 'Day 10', fullPeriod: 'Mar 10', totalUsers: 5625, activeUsers: 4990, newSignups: 70, securityEvents: 10 },
    { period: 'Day 11', fullPeriod: 'Mar 11', totalUsers: 5690, activeUsers: 5020, newSignups: 65, securityEvents: 6 },
    { period: 'Day 12', fullPeriod: 'Mar 12', totalUsers: 5750, activeUsers: 5040, newSignups: 75, securityEvents: 8 },
];

const ROLE_DONUT_DATA = [
    { name: 'Standard Users', value: 3450, color: '#0EADAB' },
    { name: 'Business Partners', value: 890, color: '#3b82f6' },
    { name: 'Administrators', value: 120, color: '#f59e0b' },
    { name: 'Staff & Moderators', value: 280, color: '#8b5cf6' },
];

const MOCK_PAYMENTS = [
    {
        id: 'tx_101',
        customer: 'Johnathan Miller',
        email: 'johnathan@example.com',
        description: 'Enterprise Tier Subscription',
        amount: '$249.00',
        method: 'Visa •••• 4242',
        status: 'Completed',
        date: '5m ago',
    },
    {
        id: 'tx_102',
        customer: 'Sophia Rodriguez',
        email: 'sophia.r@techcorp.io',
        description: 'Pro Monthly Plan Renewal',
        amount: '$89.00',
        method: 'Mastercard •••• 8819',
        status: 'Completed',
        date: '24m ago',
    },
    {
        id: 'tx_103',
        customer: 'Alexander Wright',
        email: 'wright.alex@designhub.co',
        description: 'Partner Commission Payout',
        amount: '$145.50',
        method: 'Stripe Direct',
        status: 'Processing',
        date: '1h ago',
    },
    {
        id: 'tx_104',
        customer: 'David Chen',
        email: 'david.chen@cloudstack.net',
        description: 'Developer Add-on Tier',
        amount: '$39.00',
        method: 'Visa •••• 1092',
        status: 'Completed',
        date: '2h ago',
    },
    {
        id: 'tx_105',
        customer: 'Emma Watson',
        email: 'emma.w@startupventures.com',
        description: 'Custom Domain SSL Pack',
        amount: '$15.00',
        method: 'PayPal •••• 7721',
        status: 'Completed',
        date: '3h ago',
    },
];

const ANIMATION_CONFIG = {
    isAnimationActive: true,
    animationDuration: 1200,
    animationEasing: 'ease-out' as const,
};

function useChartTheme() {
    const [colors, setColors] = useState({
        tick: '#64748b',
        grid: 'rgba(203, 213, 225, 0.4)',
        cursor: 'rgba(14, 173, 171, 0.08)',
        legend: '#64748b',
        dotStroke: '#ffffff',
        foreground: '#0f172a',
        card: '#ffffff',
        border: '#e2e8f0',
    });

    useEffect(() => {
        const updateTheme = () => {
            const isDark = document.documentElement.classList.contains('dark');
            setColors({
                tick: isDark ? '#94a3b8' : '#64748b',
                grid: isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.6)',
                cursor: isDark ? 'rgba(14, 173, 171, 0.15)' : 'rgba(14, 173, 171, 0.08)',
                legend: isDark ? '#94a3b8' : '#64748b',
                dotStroke: isDark ? '#1e293b' : '#ffffff',
                foreground: isDark ? '#f8fafc' : '#0f172a',
                card: isDark ? '#0f172a' : '#ffffff',
                border: isDark ? '#334155' : '#e2e8f0',
            });
        };

        updateTheme();
        const observer = new MutationObserver(updateTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    return colors;
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;

    const dataPoint = payload[0]?.payload;

    return (
        <div className="rounded-xl border border-border/80 bg-card/95 p-3.5 shadow-xl backdrop-blur-md transition-all">
            <p className="mb-2 text-xs font-bold tracking-wide text-foreground">
                {dataPoint?.fullPeriod || label}
            </p>
            <div className="space-y-1.5">
                {payload.map((entry: any, index: number) => (
                    <div
                        key={`${entry.dataKey}-${index}`}
                        className="flex items-center justify-between gap-5 text-xs"
                    >
                        <span className="flex items-center gap-2 text-muted-foreground">
                            <span
                                className="size-2.5 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            {entry.name}:
                        </span>
                        <span className="font-bold text-foreground tabular-nums">
                            {entry.value?.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

const toLocalISOString = (date: Date): string => {
    return date.toISOString().slice(0, 16);
};

const PRESET_LABELS: Record<string, string> = {
    today: 'Today',
    yesterday: 'Yesterday',
    this_week: 'This Week',
    this_month: 'This Month',
    last_month: 'Previous Month',
    last_30_days: 'Last 30 Days',
    last_6_months: 'Last 6 Months',
    last_year: 'Last Year',
};

const formatDateRange = (fromStr?: string, toStr?: string, preset?: string) => {
    if (preset && preset !== 'custom' && PRESET_LABELS[preset]) {
        return PRESET_LABELS[preset];
    }

    if (!fromStr || !toStr) return 'This Month';

    const fromDate = new Date(fromStr);
    const toDate = new Date(toStr);
    const now = new Date();

    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
    if (
        fromDate.getUTCFullYear() === startOfMonth.getUTCFullYear() &&
        fromDate.getUTCMonth() === startOfMonth.getUTCMonth() &&
        fromDate.getUTCDate() === startOfMonth.getUTCDate()
    ) {
        return 'This Month';
    }

    const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
    };
    return `${fromDate.toLocaleDateString('en-US', options)} - ${toDate.toLocaleDateString('en-US', options)}`;
};

export default function Dashboard({
    stats,
    chartData: _serverChartData,
    recentUsers,
    newsletter,
    filters,
}: Props) {
    const formatTrend = (v: number) => (v >= 0 ? `+${v}%` : `${v}%`);
    const [viewMode, setViewMode] = useState<'lifetime' | 'period'>('period');
    const [timeframe, setTimeframe] = useState<'monthly' | 'weekly' | 'daily'>('monthly');
    const [activeMetric, setActiveMetric] = useState<'all' | 'users' | 'signups' | 'security'>('all');

    const theme = useChartTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [tempFrom, setTempFrom] = useState('');
    const [tempTo, setTempTo] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const activeChartData = useMemo(() => {
        if (timeframe === 'weekly') return WEEKLY_MOCK_DATA;
        if (timeframe === 'daily') return DAILY_MOCK_DATA;
        return MONTHLY_MOCK_DATA;
    }, [timeframe]);

    const totalDonutUsers = useMemo(() => {
        return ROLE_DONUT_DATA.reduce((acc, curr) => acc + curr.value, 0);
    }, []);

    useEffect(() => {
        if (filters?.from && filters?.to) {
            setTempFrom(toLocalISOString(new Date(filters.from)));
            setTempTo(toLocalISOString(new Date(filters.to)));
        } else {
            const now = new Date();
            const startOfMonth = new Date(
                Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0),
            );
            setTempFrom(toLocalISOString(startOfMonth));
            setTempTo(toLocalISOString(now));
        }
    }, [filters]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleApply = (fromVal: string, toVal: string) => {
        const fromUTC = fromVal
            ? new Date(fromVal).toISOString()
            : new Date(Date.now() - 30 * 24 * 3600000).toISOString();
        const toUTC = toVal ? new Date(toVal).toISOString() : new Date().toISOString();

        setViewMode('period');
        router.get(
            dashboard(),
            {
                from: fromUTC,
                to: toUTC,
                preset: 'custom',
            },
            { preserveState: true },
        );
        setIsOpen(false);
    };

    const handlePreset = (preset: string) => {
        const now = new Date();
        let fromDate: Date;
        let toDate: Date;

        switch (preset) {
            case 'today':
                fromDate = new Date(
                    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0),
                );
                toDate = new Date();
                break;
            case 'yesterday':
                fromDate = new Date(
                    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1, 0, 0, 0),
                );
                toDate = new Date(
                    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1, 23, 59, 59),
                );
                break;
            case 'this_week':
                const day = now.getUTCDay();
                const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1);
                fromDate = new Date(
                    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff, 0, 0, 0),
                );
                toDate = new Date();
                break;
            case 'this_month':
                fromDate = new Date(
                    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0),
                );
                toDate = new Date();
                break;
            case 'last_month':
                fromDate = new Date(
                    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1, 0, 0, 0),
                );
                toDate = new Date(
                    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59),
                );
                break;
            case 'last_30_days':
                fromDate = new Date(
                    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 30, 0, 0, 0),
                );
                toDate = new Date();
                break;
            case 'last_6_months':
                fromDate = new Date(
                    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1, 0, 0, 0),
                );
                toDate = new Date();
                break;
            case 'last_year':
                fromDate = new Date(
                    Date.UTC(now.getUTCFullYear() - 1, now.getUTCMonth(), now.getUTCDate(), 0, 0, 0),
                );
                toDate = new Date();
                break;
            default:
                return;
        }

        setViewMode('period');
        router.get(
            dashboard(),
            {
                from: fromDate.toISOString(),
                to: toDate.toISOString(),
                preset,
            },
            { preserveState: true },
        );
        setIsOpen(false);
    };

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* ───────────────────── HEADER & FILTERS ───────────────────── */}
                <div className="flex animate-in items-center justify-between duration-500 fade-in slide-in-from-top-4 flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            System Overview & Analytics
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            System overview, user analytics, and platform activity.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Segmented Control for Lifetime vs Period Mode */}
                        <div className="inline-flex rounded-xl border border-sidebar-border bg-card p-1 shadow-2xs">
                            <button
                                type="button"
                                onClick={() => setViewMode('lifetime')}
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                                    viewMode === 'lifetime'
                                        ? 'bg-[#0EADAB] text-white shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Lifetime Total
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('period')}
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                                    viewMode === 'period'
                                        ? 'bg-[#0EADAB] text-white shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Selected Period
                            </button>
                        </div>

                        <div className="relative" ref={containerRef}>
                            <button
                                type="button"
                                onClick={() => setIsOpen(!isOpen)}
                                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-sidebar-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground shadow-2xs transition-all hover:bg-accent"
                            >
                                <Calendar className="size-4 text-[#0EADAB]" />
                                <span className="max-w-[280px] truncate">
                                    {formatDateRange(filters?.from, filters?.to, filters?.preset)}
                                </span>
                                <ChevronDown
                                    className={`size-3.5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {isOpen && (
                                <div className="absolute right-0 z-50 mt-2 w-[340px] animate-in rounded-xl border border-sidebar-border bg-card p-4 shadow-2xl backdrop-blur-md duration-200 fade-in slide-in-from-top-2 sm:w-[380px]">
                                    <div className="mb-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                        Quick Presets
                                    </div>
                                    <div className="mb-4 grid grid-cols-2 gap-2">
                                        {[
                                            { id: 'today', label: 'Today', color: 'bg-[#0EADAB]' },
                                            { id: 'yesterday', label: 'Yesterday', color: 'bg-cyan-500' },
                                            { id: 'this_week', label: 'This Week', color: 'bg-pink-500' },
                                            { id: 'this_month', label: 'This Month', color: 'bg-amber-500' },
                                            { id: 'last_month', label: 'Previous Month', color: 'bg-blue-500' },
                                            { id: 'last_30_days', label: 'Last 30 Days', color: 'bg-emerald-500' },
                                            { id: 'last_6_months', label: 'Last 6 Months', color: 'bg-indigo-500' },
                                            { id: 'last_year', label: 'Last Year', color: 'bg-orange-500' },
                                        ].map((p) => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => handlePreset(p.id)}
                                                className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/80 bg-background/50 px-2.5 py-2 text-left text-xs font-semibold text-foreground transition hover:bg-accent"
                                            >
                                                <span className={`size-2 rounded-full ${p.color}`} />
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="my-3 border-t border-border/50" />

                                    <div className="mb-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                        Custom Range
                                    </div>

                                    <div className="mb-4 grid gap-3">
                                        <div>
                                            <label
                                                htmlFor="from-date"
                                                className="mb-1.5 block text-[10px] font-bold tracking-wider text-muted-foreground uppercase"
                                            >
                                                From
                                            </label>
                                            <input
                                                type="datetime-local"
                                                id="from-date"
                                                value={tempFrom}
                                                onChange={(e) => setTempFrom(e.target.value)}
                                                className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-xs text-foreground focus:border-[#0EADAB] focus:ring-2 focus:ring-[#0EADAB]/20 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label
                                                htmlFor="to-date"
                                                className="mb-1.5 block text-[10px] font-bold tracking-wider text-muted-foreground uppercase"
                                            >
                                                To
                                            </label>
                                            <input
                                                type="datetime-local"
                                                id="to-date"
                                                value={tempTo}
                                                onChange={(e) => setTempTo(e.target.value)}
                                                className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-xs text-foreground focus:border-[#0EADAB] focus:ring-2 focus:ring-[#0EADAB]/20 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 border-t border-border/50 pt-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsOpen(false)}
                                            className="cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-accent"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleApply(tempFrom, tempTo)}
                                            className="cursor-pointer rounded-lg bg-[#0EADAB] px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#0C9896]"
                                        >
                                            Apply Range
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ───────────────────── TOP STATS CARDS ───────────────────── */}
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="animate-in duration-500 fill-mode-both fade-in slide-in-from-bottom-4">
                        <StatCard
                            title="Total Users"
                            value={stats[viewMode].total_users.toLocaleString()}
                            subtext={`${stats[viewMode].active_users} Active registered users`}
                            trend={formatTrend(stats.users_trend)}
                            trendPositive={stats.users_trend >= 0}
                            icon={<Users className="size-4" />}
                            accent="from-[#0EADAB]/15 to-transparent"
                            iconBg="bg-[#0EADAB]/15 text-[#0EADAB]"
                            trendLabel={viewMode === 'lifetime' ? 'All Time' : stats.trend_label}
                        />
                    </div>

                    <div className="animate-in duration-500 fill-mode-both fade-in slide-in-from-bottom-4" style={{ animationDelay: '80ms' }}>
                        <StatCard
                            title="Active Users"
                            value={stats[viewMode].active_users.toLocaleString()}
                            subtext={`${stats[viewMode].total_users} Total in system`}
                            trend={formatTrend(stats.active_users_trend || stats.users_trend)}
                            trendPositive={(stats.active_users_trend || stats.users_trend) >= 0}
                            icon={<UserCheck className="size-4" />}
                            accent="from-emerald-500/15 to-transparent"
                            iconBg="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            trendLabel={viewMode === 'lifetime' ? 'All Time' : stats.trend_label}
                        />
                    </div>

                    <div className="animate-in duration-500 fill-mode-both fade-in slide-in-from-bottom-4" style={{ animationDelay: '160ms' }}>
                        <StatCard
                            title="Administrators"
                            value={stats[viewMode].total_admins.toLocaleString()}
                            subtext="System Admin Accounts"
                            trend="+0%"
                            trendPositive={true}
                            icon={<Shield className="size-4" />}
                            accent="from-amber-500/15 to-transparent"
                            iconBg="bg-amber-500/15 text-amber-600 dark:text-amber-400"
                            trendLabel="System Access"
                        />
                    </div>

                    <div className="animate-in duration-500 fill-mode-both fade-in slide-in-from-bottom-4" style={{ animationDelay: '240ms' }}>
                        <Link href="/newsletter" className="block cursor-pointer">
                            <StatCard
                                title="Newsletter Subscribers"
                                value={(newsletter?.total ?? 0).toLocaleString()}
                                subtext={`${newsletter?.active ?? 0} Active Audience (Manage)`}
                                trend="+100%"
                                trendPositive={true}
                                icon={<Mail className="size-4" />}
                                accent="from-purple-500/15 to-transparent"
                                iconBg="bg-purple-500/15 text-purple-600 dark:text-purple-400"
                                trendLabel="View Page →"
                            />
                        </Link>
                    </div>
                </div>

                {/* ───────────────────── ANIMATED MOCK CHARTS SECTION ───────────────────── */}
                <div className="grid gap-6 lg:grid-cols-12">
                    {/* 📊 Main Growth & Activity Chart (8 cols) */}
                    <div className="animate-in rounded-2xl border border-sidebar-border bg-card p-6 shadow-2xs duration-700 fill-mode-both fade-in slide-in-from-left-4 lg:col-span-8 flex flex-col justify-between">
                        <div>
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex size-7 items-center justify-center rounded-lg bg-[#0EADAB]/15 text-[#0EADAB]">
                                            <Activity className="size-4" />
                                        </div>
                                        <h3 className="text-base font-bold text-foreground">
                                            User Growth & Activity Analytics
                                        </h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Real-time interactive trend of total users, active sessions, and new registrations
                                    </p>
                                </div>

                                {/* Timeframe Selector */}
                                <div className="inline-flex rounded-xl border border-border/80 bg-muted/40 p-1">
                                    {(['monthly', 'weekly', 'daily'] as const).map((tf) => (
                                        <button
                                            key={tf}
                                            type="button"
                                            onClick={() => setTimeframe(tf)}
                                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition-all cursor-pointer ${
                                                timeframe === tf
                                                    ? 'bg-card text-foreground shadow-2xs border border-border/60'
                                                    : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            {tf}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Metric Filter Badges */}
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setActiveMetric('all')}
                                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer border ${
                                        activeMetric === 'all'
                                            ? 'bg-foreground text-background border-foreground'
                                            : 'bg-card text-muted-foreground border-border hover:bg-accent'
                                    }`}
                                >
                                    <span>All Metrics</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveMetric('users')}
                                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer border ${
                                        activeMetric === 'users'
                                            ? 'bg-[#0EADAB] text-white border-[#0EADAB]'
                                            : 'bg-[#0EADAB]/10 text-[#0EADAB] border-[#0EADAB]/20 hover:bg-[#0EADAB]/20'
                                    }`}
                                >
                                    <span className="size-2 rounded-full bg-[#0EADAB]" />
                                    <span>Total Users</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveMetric('signups')}
                                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer border ${
                                        activeMetric === 'signups'
                                            ? 'bg-sky-500 text-white border-sky-500'
                                            : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 hover:bg-sky-500/20'
                                    }`}
                                >
                                    <span className="size-2 rounded-full bg-sky-500" />
                                    <span>New Signups</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveMetric('security')}
                                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer border ${
                                        activeMetric === 'security'
                                            ? 'bg-purple-500 text-white border-purple-500'
                                            : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 hover:bg-purple-500/20'
                                    }`}
                                >
                                    <span className="size-2 rounded-full bg-purple-500" />
                                    <span>Auth & Security</span>
                                </button>
                            </div>
                        </div>

                        {/* Chart Render Area */}
                        <div className="relative h-[290px] w-full pt-2">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <AreaChart data={activeChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#0EADAB" stopOpacity={0.35} />
                                            <stop offset="100%" stopColor="#0EADAB" stopOpacity={0.0} />
                                        </linearGradient>
                                        <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#0284c7" stopOpacity={0.3} />
                                            <stop offset="100%" stopColor="#0284c7" stopOpacity={0.0} />
                                        </linearGradient>
                                        <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>

                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.grid} />
                                    <XAxis
                                        dataKey="period"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: theme.tick, fontSize: 11, fontWeight: 500 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: theme.tick, fontSize: 11 }}
                                        tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val)}
                                    />
                                    <Tooltip content={<CustomTooltip />} />

                                    {(activeMetric === 'all' || activeMetric === 'users') && (
                                        <Area
                                            type="monotone"
                                            dataKey="totalUsers"
                                            name="Total Users"
                                            stroke="#0EADAB"
                                            strokeWidth={3}
                                            fill="url(#tealGradient)"
                                            dot={{ r: 4, fill: '#0EADAB', stroke: theme.dotStroke, strokeWidth: 2 }}
                                            activeDot={{ r: 7, fill: '#0EADAB', stroke: theme.dotStroke, strokeWidth: 2 }}
                                            {...ANIMATION_CONFIG}
                                        />
                                    )}

                                    {(activeMetric === 'all' || activeMetric === 'signups') && (
                                        <Area
                                            type="monotone"
                                            dataKey="newSignups"
                                            name="New Signups"
                                            stroke="#0284c7"
                                            strokeWidth={2.5}
                                            fill="url(#skyGradient)"
                                            dot={{ r: 3.5, fill: '#0284c7', stroke: theme.dotStroke, strokeWidth: 2 }}
                                            activeDot={{ r: 6, fill: '#0284c7', stroke: theme.dotStroke, strokeWidth: 2 }}
                                            {...ANIMATION_CONFIG}
                                        />
                                    )}

                                    {(activeMetric === 'all' || activeMetric === 'security') && (
                                        <Area
                                            type="monotone"
                                            dataKey="securityEvents"
                                            name="Security Events"
                                            stroke="#8b5cf6"
                                            strokeWidth={2.5}
                                            fill="url(#purpleGradient)"
                                            dot={{ r: 3.5, fill: '#8b5cf6', stroke: theme.dotStroke, strokeWidth: 2 }}
                                            activeDot={{ r: 6, fill: '#8b5cf6', stroke: theme.dotStroke, strokeWidth: 2 }}
                                            {...ANIMATION_CONFIG}
                                        />
                                    )}
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 🍩 User Roles & Platform Breakdown Donut Chart (4 cols) */}
                    <div className="animate-in rounded-2xl border border-sidebar-border bg-card p-6 shadow-2xs duration-700 fill-mode-both fade-in slide-in-from-right-4 lg:col-span-4 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex size-7 items-center justify-center rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400">
                                        <PieChartIcon className="size-4" />
                                    </div>
                                    <h3 className="text-base font-bold text-foreground">Role Distribution</h3>
                                </div>
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#0EADAB]/10 px-2 py-0.5 text-[10px] font-bold text-[#0EADAB]">
                                    <Sparkles className="size-3" /> Live Ratio
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Breakdown of active roles across all registered accounts
                            </p>
                        </div>

                        {/* Donut Chart Container */}
                        <div className="relative h-[200px] w-full my-2 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <PieChart>
                                    <Pie
                                        data={ROLE_DONUT_DATA}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={80}
                                        paddingAngle={4}
                                        dataKey="value"
                                        {...ANIMATION_CONFIG}
                                    >
                                        {ROLE_DONUT_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke={theme.dotStroke} strokeWidth={2} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-xl font-extrabold text-foreground tracking-tight">
                                    {totalDonutUsers.toLocaleString()}
                                </span>
                                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                    Accounts
                                </span>
                            </div>
                        </div>

                        {/* Donut Legend Items */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs">
                            {ROLE_DONUT_DATA.map((item) => (
                                <div key={item.name} className="flex items-center justify-between p-1.5 rounded-lg bg-muted/20">
                                    <div className="flex items-center gap-1.5 truncate">
                                        <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                        <span className="truncate text-muted-foreground text-[11px] font-medium">{item.name}</span>
                                    </div>
                                    <span className="font-bold text-foreground text-[11px] ml-1">
                                        {Math.round((item.value / totalDonutUsers) * 100)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ───────────────────── BOTTOM ROW: RECENT SIGNUPS & PAYMENT TRANSACTIONS ───────────────────── */}
                <div className="grid gap-6 lg:grid-cols-12">
                    {/* 👤 Recent Signups & User Breakdown (6 cols) */}
                    <div className="animate-in rounded-2xl border border-sidebar-border bg-card p-6 shadow-2xs duration-700 fill-mode-both fade-in slide-in-from-bottom-4 lg:col-span-6 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex size-7 items-center justify-center rounded-lg bg-[#0EADAB]/15 text-[#0EADAB]">
                                        <Users className="size-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-foreground">
                                            Recent Signups & Users
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            Latest account registrations and role permissions
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href="/user"
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#0EADAB] hover:underline"
                                >
                                    <span>All Users</span>
                                    <ArrowRight className="size-3" />
                                </Link>
                            </div>

                            {/* Role breakdown chips */}
                            <div className="mb-4 grid grid-cols-3 gap-2">
                                <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5 text-center">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Admins</p>
                                    <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                                        {stats[viewMode].total_admins}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5 text-center">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Partners</p>
                                    <p className="text-lg font-bold text-[#0EADAB] mt-0.5">
                                        {stats[viewMode].total_partners}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5 text-center">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Users</p>
                                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                                        {stats[viewMode].total_customers}
                                    </p>
                                </div>
                            </div>

                            {recentUsers.length === 0 ? (
                                <p className="py-8 text-center text-xs text-muted-foreground">
                                    No new signups found in this date range.
                                </p>
                            ) : (
                                <div className="space-y-1">
                                    {recentUsers.slice(0, 5).map((u) => {
                                        const roleLower = u.role?.toLowerCase();
                                        const isAdmin = roleLower === 'admin';
                                        const isPartner = roleLower === 'partner';

                                        const badgeClass = isAdmin
                                            ? 'bg-amber-500/10 text-amber-600 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-400 dark:ring-amber-400/30'
                                            : isPartner
                                              ? 'bg-cyan-500/10 text-cyan-600 ring-cyan-600/20 dark:bg-cyan-400/10 dark:text-cyan-400 dark:ring-cyan-400/30'
                                              : 'bg-violet-500/10 text-violet-600 ring-violet-600/20 dark:bg-violet-400/10 dark:text-violet-400 dark:ring-violet-400/30';

                                        const avatarGrad = isAdmin
                                            ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                                            : isPartner
                                              ? 'linear-gradient(135deg, #06b6d4, #0284c7)'
                                              : 'linear-gradient(135deg, #8b5cf6, #6d28d9)';

                                        return (
                                            <div
                                                key={u.id}
                                                className="group relative -mx-2 flex items-center justify-between rounded-xl border-b border-border/40 px-3 py-2 transition-all duration-200 last:border-0 hover:bg-muted/30"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div
                                                        className="flex size-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs ring-1 ring-border"
                                                        style={{
                                                            background: avatarGrad,
                                                        }}
                                                    >
                                                        {u.name
                                                            .split(' ')
                                                            .map((n) => n[0])
                                                            .join('')
                                                            .slice(0, 2)}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-foreground">
                                                            {u.name}
                                                        </p>
                                                        <p className="text-[11px] text-muted-foreground">
                                                            {u.email}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${badgeClass}`}>
                                                        {u.role}
                                                    </span>
                                                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                                                        {u.created_at}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 💳 Payment & Billing Activity Mockup (6 cols) */}
                    <div className="animate-in rounded-2xl border border-sidebar-border bg-card p-6 shadow-2xs duration-700 fill-mode-both fade-in slide-in-from-bottom-4 lg:col-span-6 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                        <CreditCard className="size-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-foreground">
                                            Payment & Transaction Activity
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            Recent Stripe checkouts, subscription billing, and payouts
                                        </p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold">
                                    <Sparkles className="size-3" /> Live Sync
                                </span>
                            </div>

                            {/* Revenue quick metrics */}
                            <div className="mb-4 grid grid-cols-3 gap-2">
                                <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5 text-center">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Revenue</p>
                                    <p className="text-lg font-bold text-foreground mt-0.5">$24,850</p>
                                </div>
                                <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5 text-center">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Success Rate</p>
                                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">99.2%</p>
                                </div>
                                <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5 text-center">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Subscribers</p>
                                    <p className="text-lg font-bold text-[#0EADAB] mt-0.5">142 Active</p>
                                </div>
                            </div>

                            {/* Transaction List */}
                            <div className="space-y-1">
                                {MOCK_PAYMENTS.map((tx) => {
                                    const isDone = tx.status === 'Completed';
                                    return (
                                        <div
                                            key={tx.id}
                                            className="group relative -mx-2 flex items-center justify-between rounded-xl border-b border-border/40 px-3 py-2 transition-all duration-200 last:border-0 hover:bg-muted/30"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-foreground border border-border/60 font-semibold text-xs shrink-0">
                                                    <DollarSign className="size-4 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-foreground">
                                                        {tx.description}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                                        <span>{tx.customer}</span>
                                                        <span>•</span>
                                                        <span>{tx.method}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-extrabold text-foreground">
                                                    {tx.amount}
                                                </p>
                                                <div className="mt-0.5 flex items-center justify-end gap-1">
                                                    <span
                                                        className={`inline-flex items-center rounded-md px-1.5 py-0.2 text-[10px] font-semibold ${
                                                            isDone
                                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                        }`}
                                                    >
                                                        {tx.status}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {tx.date}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}

function StatCard({
    title,
    value,
    subtext,
    trend,
    trendPositive,
    icon,
    accent,
    iconBg,
    trendLabel = 'vs previous period',
}: {
    title: string;
    value: string;
    subtext?: string;
    trend: string;
    trendPositive: boolean;
    icon: React.ReactNode;
    accent: string;
    iconBg: string;
    trendLabel?: string;
}) {
    return (
        <div
            className={`rounded-xl border border-sidebar-border bg-card bg-gradient-to-br ${accent} p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:shadow-black/20`}
        >
            <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-medium text-muted-foreground">
                    {title}
                </span>
                <div
                    className={`flex size-8 items-center justify-center rounded-lg ${iconBg}`}
                >
                    {icon}
                </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
                {value}
            </div>
            {subtext && (
                <p className="mt-0.5 text-xs font-medium text-foreground/80 truncate">
                    {subtext}
                </p>
            )}
            <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                {trendPositive ? (
                    <TrendingUp className="size-3 text-emerald-500" />
                ) : (
                    <TrendingDown className="size-3 text-red-500" />
                )}
                <span
                    className={
                        trendPositive
                            ? 'font-medium text-emerald-500'
                            : 'font-medium text-red-500'
                    }
                >
                    {trend}
                </span>{' '}
                {trendLabel}
            </p>
        </div>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
