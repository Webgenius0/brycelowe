import { Head, router } from '@inertiajs/react';
import {
    Users,
    TrendingUp,
    TrendingDown,
    Calendar,
    ChevronDown,
    Building2,
    Gift,
    DollarSign,
    Layers,
    UserCheck,
    Shield,
    Store,
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import {
    ComposedChart,
    Line,
    Area,
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
    businesses: number;
    redemptions: number;
};

type Props = {
    stats: Stats;
    chartData: ChartPoint[];
    recentUsers: RecentUser[];
    filters?: {
        from?: string;
        to?: string;
        preset?: string;
    };
};

const BAR_COLORS = [
    '#8b5cf6', // violet
    '#06b6d4', // cyan
    '#f59e0b', // amber
    '#ec4899', // pink
    '#10b981', // emerald
    '#3b82f6', // blue
];

const ANIMATION = {
    isAnimationActive: true,
    animationDuration: 1400,
    animationEasing: 'ease-out' as const,
    animationBegin: 200,
};

function useChartTheme() {
    const [colors, setColors] = useState({
        tick: 'oklch(0.556 0 0)',
        grid: 'oklch(0.922 0 0)',
        cursor: 'rgba(0, 0, 0, 0.08)',
        legend: 'oklch(0.556 0 0)',
        dotStroke: 'oklch(1 0 0)',
        foreground: 'oklch(0.145 0 0)',
        card: 'oklch(1 0 0)',
        border: 'oklch(0.922 0 0)',
    });

    useEffect(() => {
        const read = () => {
            const s = getComputedStyle(document.documentElement);
            const pick = (name: string, fallback: string) => {
                const v = s.getPropertyValue(name).trim();
                return v || fallback;
            };
            const isDark = document.documentElement.classList.contains('dark');

            setColors({
                tick: pick(
                    '--muted-foreground',
                    isDark ? 'oklch(0.75 0 0)' : 'oklch(0.45 0 0)',
                ),
                grid: pick(
                    '--border',
                    isDark ? 'oklch(0.32 0 0)' : 'oklch(0.9 0 0)',
                ),
                cursor: isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.06)',
                legend: pick(
                    '--muted-foreground',
                    isDark ? 'oklch(0.75 0 0)' : 'oklch(0.45 0 0)',
                ),
                dotStroke: pick(
                    '--card',
                    isDark ? 'oklch(0.2 0 0)' : 'oklch(1 0 0)',
                ),
                foreground: pick(
                    '--foreground',
                    isDark ? 'oklch(0.98 0 0)' : 'oklch(0.15 0 0)',
                ),
                card: pick(
                    '--card',
                    isDark ? 'oklch(0.2 0 0)' : 'oklch(1 0 0)',
                ),
                border: pick(
                    '--border',
                    isDark ? 'oklch(0.32 0 0)' : 'oklch(0.9 0 0)',
                ),
            });
        };

        read();

        const observer = new MutationObserver(read);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        mq.addEventListener('change', read);

        return () => {
            observer.disconnect();
            mq.removeEventListener('change', read);
        };
    }, []);

    return colors;
}

type AxisTickProps = {
    x?: number;
    y?: number;
    payload?: { value: string };
    fill: string;
};

function XAxisTick({ x = 0, y = 0, payload, fill }: AxisTickProps) {
    return (
        <text
            x={x}
            y={y}
            dy={14}
            textAnchor="middle"
            fill={fill}
            fontSize={12}
            fontWeight={600}
            className="select-none"
        >
            {payload?.value}
        </text>
    );
}

function YAxisTick({
    x = 0,
    y = 0,
    payload,
    fill,
}: AxisTickProps & { payload?: { value: number } }) {
    const v = Number(payload?.value ?? 0);
    const label = v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v;

    return (
        <text
            x={x}
            y={y}
            dx={-4}
            textAnchor="end"
            fill={fill}
            fontSize={11}
            className="select-none"
        >
            {label}
        </text>
    );
}

function CustomTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: {
        name: string;
        value: number;
        color: string;
        dataKey: string;
        payload?: any;
    }[];
    label?: string;
}) {
    if (!active || !payload?.length) return null;

    const point = payload[0]?.payload as ChartPoint | undefined;

    return (
        <div className="animate-in rounded-xl border border-border/50 bg-card/80 px-4 py-3 shadow-2xl backdrop-blur-md duration-200 zoom-in-95 fade-in dark:shadow-black/50">
            <p className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                {point?.fullMonth ?? label}
            </p>
            <div className="space-y-1.5">
                {payload.map((entry, index) => (
                    <div
                        key={`${entry.dataKey}-${entry.name}-${index}`}
                        className="flex items-center justify-between gap-6"
                    >
                        <span className="flex items-center gap-2 text-sm text-foreground">
                            <span
                                className="size-2.5 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            {entry.name}
                        </span>
                        <span className="text-sm font-bold text-foreground tabular-nums">
                            {entry.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SystemActivityChart({ data }: { data: ChartPoint[] }) {
    const [mounted, setMounted] = useState(false);
    const theme = useChartTheme();

    useEffect(() => {
        const t = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(t);
    }, []);

    if (!mounted) {
        return (
            <div className="flex h-[320px] w-full items-center justify-center">
                <div className="flex gap-2">
                    {BAR_COLORS.map((c, i) => (
                        <div
                            key={i}
                            className="h-8 w-3 animate-pulse rounded-full"
                            style={{
                                backgroundColor: c,
                                animationDelay: `${i * 120}ms`,
                            }}
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
                data={data}
                margin={{ top: 12, right: 12, left: 4, bottom: 8 }}
            >
                <defs>
                    <linearGradient id="usersAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="businessesAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                </defs>

                <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={theme.grid}
                    strokeOpacity={0.85}
                />

                <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={<XAxisTick fill={theme.tick} />}
                    height={36}
                />

                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={<YAxisTick fill={theme.tick} />}
                    width={36}
                    allowDecimals={false}
                />

                <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: theme.cursor, radius: 8 }}
                />

                <Legend
                    wrapperStyle={{
                        paddingTop: 16,
                        fontSize: 12,
                        color: theme.legend,
                    }}
                    iconType="circle"
                    formatter={(value) => (
                        <span style={{ color: theme.legend, fontWeight: 500 }}>
                            {value}
                        </span>
                    )}
                />

                <Area
                    type="monotone"
                    dataKey="subscribers"
                    fill="url(#usersAreaGrad)"
                    stroke="none"
                    tooltipType="none"
                    legendType="none"
                    {...ANIMATION}
                />

                <Line
                    type="monotone"
                    dataKey="subscribers"
                    name="Subscribers"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{
                        r: 5,
                        fill: '#8b5cf6',
                        stroke: theme.dotStroke,
                        strokeWidth: 2,
                    }}
                    activeDot={{
                        r: 8,
                        fill: '#8b5cf6',
                        stroke: theme.dotStroke,
                        strokeWidth: 2,
                    }}
                    {...ANIMATION}
                />

                <Line
                    type="monotone"
                    dataKey="redemptions"
                    name="Redemptions"
                    stroke="#ec4899"
                    strokeWidth={3}
                    dot={{
                        r: 5,
                        fill: '#ec4899',
                        stroke: theme.dotStroke,
                        strokeWidth: 2,
                    }}
                    activeDot={{
                        r: 8,
                        fill: '#ec4899',
                        stroke: theme.dotStroke,
                        strokeWidth: 2,
                    }}
                    {...ANIMATION}
                />

                <Line
                    type="monotone"
                    dataKey="businesses"
                    name="Businesses"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    dot={{
                        r: 5,
                        fill: '#06b6d4',
                        stroke: theme.dotStroke,
                        strokeWidth: 2,
                    }}
                    activeDot={{
                        r: 8,
                        fill: '#06b6d4',
                        stroke: theme.dotStroke,
                        strokeWidth: 2,
                    }}
                    {...ANIMATION}
                />
            </ComposedChart>
        </ResponsiveContainer>
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
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC',
    };
    return `${fromDate.toLocaleDateString('en-US', options)} - ${toDate.toLocaleDateString('en-US', options)}`;
};

export default function Dashboard({
    stats,
    chartData,
    recentUsers,
    filters,
}: Props) {
    const formatTrend = (v: number) => (v >= 0 ? `+${v}%` : `${v}%`);
    const [viewMode, setViewMode] = useState<'lifetime' | 'period'>('period');

    const detectCurrentPreset = () => {
        if (filters?.preset) {
            return filters.preset;
        }
        return 'this_month';
    };

    const [isOpen, setIsOpen] = useState(false);
    const [tempFrom, setTempFrom] = useState('');
    const [tempTo, setTempTo] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

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
                <div className="flex animate-in items-center justify-between duration-500 fade-in slide-in-from-top-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            System Overview & Analytics
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            System overview, user analytics, and platform activity.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Segmented Control for Lifetime vs Period Mode */}
                        <div className="inline-flex rounded-lg border border-input bg-muted/50 p-1">
                            <button
                                type="button"
                                onClick={() => setViewMode('lifetime')}
                                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                                    viewMode === 'lifetime'
                                        ? 'bg-card text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Lifetime Total
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('period')}
                                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                                    viewMode === 'period'
                                        ? 'bg-card text-foreground shadow-xs'
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
                                className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3.5 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-accent hover:shadow-md"
                            >
                                <Calendar className="size-4 text-[#0EADAB]" />
                                <span className="max-w-[280px] truncate">
                                    {formatDateRange(filters?.from, filters?.to, filters?.preset)}
                                </span>
                                <ChevronDown
                                    className={`size-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {isOpen && (
                                <div className="absolute right-0 z-50 mt-2 w-[340px] animate-in rounded-xl border border-sidebar-border bg-card p-4 shadow-2xl backdrop-blur-md duration-200 fade-in slide-in-from-top-2 sm:w-[400px]">
                                    <div className="mb-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                        Quick Presets
                                    </div>
                                    <div className="mb-4 grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handlePreset('today')}
                                            className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background/50 px-2.5 py-2 text-left text-xs font-semibold text-foreground transition hover:bg-accent"
                                        >
                                            <span className="size-2 rounded-full bg-[#0EADAB]" />
                                            Today
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handlePreset('yesterday')}
                                            className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background/50 px-2.5 py-2 text-left text-xs font-semibold text-foreground transition hover:bg-accent"
                                        >
                                            <span className="size-2 rounded-full bg-cyan-500" />
                                            Yesterday
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handlePreset('this_week')}
                                            className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background/50 px-2.5 py-2 text-left text-xs font-semibold text-foreground transition hover:bg-accent"
                                        >
                                            <span className="size-2 rounded-full bg-pink-500" />
                                            This Week
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handlePreset('this_month')}
                                            className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background/50 px-2.5 py-2 text-left text-xs font-semibold text-foreground transition hover:bg-accent"
                                        >
                                            <span className="size-2 rounded-full bg-amber-500" />
                                            This Month
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handlePreset('last_month')}
                                            className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background/50 px-2.5 py-2 text-left text-xs font-semibold text-foreground transition hover:bg-accent"
                                        >
                                            <span className="size-2 rounded-full bg-blue-500" />
                                            Previous Month
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handlePreset('last_30_days')}
                                            className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background/50 px-2.5 py-2 text-left text-xs font-semibold text-foreground transition hover:bg-accent"
                                        >
                                            <span className="size-2 rounded-full bg-emerald-500" />
                                            Last 30 Days
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handlePreset('last_6_months')}
                                            className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background/50 px-2.5 py-2 text-left text-xs font-semibold text-foreground transition hover:bg-accent"
                                        >
                                            <span className="size-2 rounded-full bg-indigo-500" />
                                            Last 6 Months
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handlePreset('last_year')}
                                            className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background/50 px-2.5 py-2 text-left text-xs font-semibold text-foreground transition hover:bg-accent"
                                        >
                                            <span className="size-2 rounded-full bg-orange-500" />
                                            Last Year
                                        </button>
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

                {/* Primary Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Total Revenue - Commented out
                    <div className="animate-in duration-500 fill-mode-both fade-in slide-in-from-bottom-4">
                        <StatCard
                            title="Total Revenue"
                            value={`$${stats[viewMode].total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                            subtext={`${stats[viewMode].pending_payouts} Pending Payouts`}
                            trend={formatTrend(stats.revenue_trend)}
                            trendPositive={stats.revenue_trend >= 0}
                            icon={<DollarSign className="size-4" />}
                            accent="from-amber-500/20 to-amber-500/5"
                            iconBg="bg-amber-500/15 text-amber-600 dark:text-amber-400"
                            trendLabel={viewMode === 'lifetime' ? 'All Time' : stats.trend_label}
                        />
                    </div>
                    */}

                    <div className="animate-in duration-500 fill-mode-both fade-in slide-in-from-bottom-4">
                        <StatCard
                            title="Total Users"
                            value={stats[viewMode].total_users.toLocaleString()}
                            subtext={`${stats[viewMode].active_users} Active registered users`}
                            trend={formatTrend(stats.users_trend)}
                            trendPositive={stats.users_trend >= 0}
                            icon={<Users className="size-4" />}
                            accent="from-[#0EADAB]/20 to-[#0EADAB]/5"
                            iconBg="bg-[#0EADAB]/15 text-[#0EADAB] dark:text-[#0EADAB]"
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
                            accent="from-emerald-500/20 to-emerald-500/5"
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
                            accent="from-amber-500/20 to-amber-500/5"
                            iconBg="bg-amber-500/15 text-amber-600 dark:text-amber-400"
                            trendLabel="System Access"
                        />
                    </div>

                    {/* Businesses - Commented out
                    <div className="animate-in duration-500 fill-mode-both fade-in slide-in-from-bottom-4" style={{ animationDelay: '160ms' }}>
                        <StatCard
                            title="Businesses"
                            value={stats[viewMode].total_businesses.toLocaleString()}
                            subtext={`${stats[viewMode].active_businesses} Active Attractions`}
                            trend={formatTrend(stats.businesses_trend)}
                            trendPositive={stats.businesses_trend >= 0}
                            icon={<Building2 className="size-4" />}
                            accent="from-cyan-500/20 to-cyan-500/5"
                            iconBg="bg-cyan-500/15 text-cyan-600 dark:text-cyan-400"
                            trendLabel={viewMode === 'lifetime' ? 'All Time' : stats.trend_label}
                        />
                    </div>
                    */}

                    {/* Passes - Commented out
                    <div className="animate-in duration-500 fill-mode-both fade-in slide-in-from-bottom-4" style={{ animationDelay: '240ms' }}>
                        <StatCard
                            title="Passes"
                            value={stats[viewMode].total_plans.toLocaleString()}
                            subtext={`${stats[viewMode].active_plans} Active Membership Passes`}
                            trend="+100%"
                            trendPositive={true}
                            icon={<Layers className="size-4" />}
                            accent="from-emerald-500/20 to-emerald-500/5"
                            iconBg="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            trendLabel="Active passes"
                        />
                    </div>
                    */}

                    {/* Redemptions / Visits - Commented out
                    <div className="animate-in duration-500 fill-mode-both fade-in slide-in-from-bottom-4" style={{ animationDelay: '320ms' }}>
                        <StatCard
                            title="Redemptions / Visits"
                            value={stats[viewMode].total_redemptions.toLocaleString()}
                            subtext={`${stats[viewMode].pending_redemptions} Pending Approvals`}
                            trend={formatTrend(stats.redemptions_trend)}
                            trendPositive={stats.redemptions_trend >= 0}
                            icon={<Gift className="size-4" />}
                            accent="from-pink-500/20 to-pink-500/5"
                            iconBg="bg-pink-500/15 text-pink-600 dark:text-pink-400"
                            trendLabel={viewMode === 'lifetime' ? 'All Time' : stats.trend_label}
                        />
                    </div>
                    */}
                </div>

                {/* Secondary section: User Roles & Recent Signups */}
                <div className="grid gap-6">
                    {/* Activity & Growth Overview Chart - Commented out for now
                    <div className="animate-in overflow-hidden rounded-xl border border-sidebar-border bg-card p-6 shadow-sm duration-700 fill-mode-both fade-in slide-in-from-left-6 lg:col-span-4">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h3 className="text-lg font-semibold">
                                    Activity & Growth Overview
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Comparison of subscribers, point redemptions, and registered businesses
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3 text-xs">
                                <span className="flex items-center gap-1.5 rounded-full bg-violet-500/10 px-2.5 py-1 font-medium text-violet-700 dark:text-violet-300">
                                    <span className="size-2 rounded-sm bg-violet-500" />
                                    Subscribers
                                </span>
                                <span className="flex items-center gap-1.5 rounded-full bg-pink-500/10 px-2.5 py-1 font-medium text-pink-700 dark:text-pink-300">
                                    <span className="size-2 rounded-sm bg-pink-500" />
                                    Redemptions
                                </span>
                                <span className="flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-2.5 py-1 font-medium text-cyan-700 dark:text-cyan-300">
                                    <span className="size-2 rounded-sm bg-cyan-500" />
                                    Businesses
                                </span>
                            </div>
                        </div>
                        <div className="relative h-[320px] w-full rounded-lg bg-gradient-to-b from-muted/40 to-transparent p-2 pb-0 dark:from-muted/25 dark:to-transparent">
                            <SystemActivityChart data={chartData} />
                        </div>
                    </div>
                    */}

                    <div className="animate-in rounded-xl border border-sidebar-border bg-card p-6 shadow-sm duration-700 fill-mode-both fade-in slide-in-from-bottom-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <div>
                                <h3 className="text-lg font-semibold">
                                    User Roles & Recent Registrations
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    User accounts breakdown and recent signup activity
                                </p>
                            </div>
                        </div>
                        
                        {/* Role breakdown chips */}
                        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="rounded-lg border border-border/50 bg-background/50 p-3 text-center">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Admins</p>
                                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{stats[viewMode].total_admins}</p>
                            </div>
                            <div className="rounded-lg border border-border/50 bg-background/50 p-3 text-center">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Partners</p>
                                <p className="text-xl font-bold text-[#0EADAB]">{stats[viewMode].total_partners}</p>
                            </div>
                            <div className="rounded-lg border border-border/50 bg-background/50 p-3 text-center">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Users</p>
                                <p className="text-xl font-bold text-[#0EADAB]">{stats[viewMode].total_customers}</p>
                            </div>
                        </div>

                        {recentUsers.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No new signups in this range.
                            </p>
                        ) : (
                            <div className="space-y-1">
                                {recentUsers.map((u) => {
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
                                            className="group relative -mx-2 flex animate-in items-center justify-between rounded-lg border-b border-border/40 px-2 py-2.5 transition-all duration-300 fill-mode-both fade-in slide-in-from-right-4 last:border-0 hover:bg-muted/30"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="flex size-9 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ring-1 ring-border"
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
                                                <p className="mt-1 text-[10px] text-muted-foreground">
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
