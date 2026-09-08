import { useEffect, useRef, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    AlertCircle,
    CheckCircle,
    Loader2,
    RefreshCw,
    RotateCcw,
    Trash2,
    Zap,
} from 'lucide-react';

interface LogLine {
    text: string;
    level:
        | 'error'
        | 'critical'
        | 'alert'
        | 'emergency'
        | 'warning'
        | 'info'
        | 'notice'
        | 'debug';
}

interface LoginAttemptRecord {
    id: number;
    ip_address: string;
    email: string | null;
    attempts: number;
    locked_until: string | null;
    last_attempt_at: string | null;
    is_locked: boolean;
}

interface Props {
    logStats: {
        size: string;
        lines: number;
    };
    loginAttempts: LoginAttemptRecord[];
}

const LEVEL_STYLES: Record<string, string> = {
    error: 'text-red-400',
    critical: 'text-red-500 font-semibold',
    alert: 'text-red-500 font-semibold',
    emergency: 'text-red-600 font-bold',
    warning: 'text-amber-400',
    info: 'text-blue-400',
    notice: 'text-cyan-400',
    debug: 'text-slate-400',
};

const LEVEL_BADGE: Record<string, string> = {
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    debug: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

type ToolKey = 'optimize-clear' | 'optimize' | 'clear-logs';

export default function SystemTools({ logStats, loginAttempts }: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>()
        .props as any;
    const [loading, setLoading] = useState<Record<ToolKey, boolean>>({
        'optimize-clear': false,
        optimize: false,
        'clear-logs': false,
    });
    const [logLines, setLogLines] = useState<LogLine[]>([]);
    const [logFilter, setLogFilter] = useState('');
    const [logLoading, setLogLoading] = useState(false);
    const logRef = useRef<HTMLDivElement>(null);

    const fetchLogs = async () => {
        setLogLoading(true);
        try {
            const res = await fetch('/settings/system-tools/logs');
            const data = await res.json();
            setLogLines(data.lines || []);
            setTimeout(() => {
                logRef.current?.scrollTo({
                    top: logRef.current.scrollHeight,
                    behavior: 'smooth',
                });
            }, 50);
        } catch {
            setLogLines([]);
        } finally {
            setLogLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const runTool = (key: ToolKey, url: string) => {
        setLoading((prev) => ({ ...prev, [key]: true }));
        router.post(
            url,
            {},
            {
                onFinish: () => {
                    setLoading((prev) => ({ ...prev, [key]: false }));
                    if (key === 'clear-logs') fetchLogs();
                },
                preserveScroll: true,
            },
        );
    };

    const filteredLines = logLines.filter((l) =>
        l.text.toLowerCase().includes(logFilter.toLowerCase()),
    );

    const tools: {
        key: ToolKey;
        label: string;
        description: string;
        icon: React.ReactNode;
        url: string;
        variant: 'default' | 'destructive' | 'outline';
    }[] = [
        {
            key: 'optimize-clear',
            label: 'Optimize:Clear',
            description:
                'Clears all caches — application, config, views, and routes in one shot.',
            icon: <RotateCcw className="size-5" />,
            url: '/settings/system-tools/optimize-clear',
            variant: 'default',
        },
        {
            key: 'optimize',
            label: 'Optimize',
            description:
                'Re-caches config and routes for faster production performance.',
            icon: <Zap className="size-5" />,
            url: '/settings/system-tools/optimize',
            variant: 'default',
        },
        {
            key: 'clear-logs',
            label: 'Clear Log File',
            description: 'Empties the Laravel log file. Cannot be undone.',
            icon: <Trash2 className="size-5" />,
            url: '/settings/system-tools/clear-logs',
            variant: 'destructive',
        },
    ];

    return (
        <>
            <Head title="System Tools" />

            <div className="space-y-8">
                <Heading
                    title="System Tools"
                    description="Manage Laravel caches, optimization, and view application logs."
                />

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle className="size-4 shrink-0" />
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                        <AlertCircle className="size-4 shrink-0" />
                        {flash.error}
                    </div>
                )}

                {/* Quick Actions */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                        Quick Actions
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-3">
                        {tools.map((tool) => (
                            <div
                                key={tool.key}
                                className="flex h-full flex-col justify-between gap-4 rounded-xl border border-border bg-card p-5 shadow-sm"
                            >
                                <div className="flex flex-1 items-start gap-3">
                                    <div className="mt-0.5 shrink-0 rounded-lg border border-border bg-muted p-2 text-muted-foreground">
                                        {tool.icon}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">
                                            {tool.label}
                                        </p>
                                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                                            {tool.description}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    id={`btn-${tool.key}`}
                                    variant={tool.variant}
                                    size="sm"
                                    disabled={loading[tool.key]}
                                    onClick={() => runTool(tool.key, tool.url)}
                                    className="mt-auto w-full"
                                >
                                    {loading[tool.key] ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" />
                                            Running...
                                        </>
                                    ) : (
                                        tool.label
                                    )}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Laravel Log Viewer */}
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                Laravel Log Viewer
                            </h3>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Last 300 lines · {logStats.size} ·{' '}
                                {logStats.lines.toLocaleString()} total lines
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Filter logs..."
                                value={logFilter}
                                onChange={(e) => setLogFilter(e.target.value)}
                                className="h-8 w-48 rounded-md border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-ring focus:outline-none"
                            />
                            <Button
                                id="btn-refresh-logs"
                                variant="outline"
                                size="sm"
                                onClick={fetchLogs}
                                disabled={logLoading}
                            >
                                {logLoading ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="size-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Level legend */}
                    <div className="flex flex-wrap gap-2">
                        {['error', 'warning', 'info', 'debug'].map((lvl) => (
                            <span
                                key={lvl}
                                className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${LEVEL_BADGE[lvl]}`}
                            >
                                {lvl.toUpperCase()}
                            </span>
                        ))}
                    </div>

                    {/* Log terminal */}
                    <div
                        ref={logRef}
                        className="h-[460px] overflow-y-auto rounded-xl border border-border bg-[#0d0d0d] p-4 font-mono text-xs leading-5 shadow-inner"
                    >
                        {logLoading ? (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                                <Loader2 className="mr-2 size-5 animate-spin" />{' '}
                                Loading logs...
                            </div>
                        ) : filteredLines.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                                {logLines.length === 0
                                    ? 'Log file is empty.'
                                    : 'No lines match your filter.'}
                            </div>
                        ) : (
                            filteredLines.map((line, i) => (
                                <div
                                    key={i}
                                    className={`break-all whitespace-pre-wrap ${LEVEL_STYLES[line.level] ?? 'text-slate-300'}`}
                                >
                                    {line.text}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="flex justify-end">
                        <Button
                            id="btn-scroll-bottom"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                                logRef.current?.scrollTo({
                                    top: logRef.current.scrollHeight,
                                    behavior: 'smooth',
                                })
                            }
                        >
                            ↓ Scroll to Bottom
                        </Button>
                    </div>
                </div>

                {/* Login Attempts */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                Login Attempts
                            </h3>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Last 50 records · IP-based lockout tracker
                            </p>
                        </div>
                        {loginAttempts.length > 0 && (
                            <Button
                                id="btn-clear-attempts"
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                    router.post(
                                        '/settings/system-tools/clear-attempts',
                                        {},
                                        { preserveScroll: true },
                                    )
                                }
                            >
                                <Trash2 className="mr-1 size-4" />
                                Clear All
                            </Button>
                        )}
                    </div>

                    {loginAttempts.length === 0 ? (
                        <div className="rounded-xl border border-border bg-muted/30 py-10 text-center text-sm text-muted-foreground">
                            No login attempts recorded yet.
                        </div>
                    ) : (
                        <div className="overflow-auto rounded-xl border border-border">
                            <table className="w-full text-xs">
                                <thead className="bg-muted/50 text-left">
                                    <tr>
                                        <th className="px-4 py-2 font-semibold text-muted-foreground">
                                            IP Address
                                        </th>
                                        <th className="px-4 py-2 font-semibold text-muted-foreground">
                                            Email
                                        </th>
                                        <th className="px-4 py-2 font-semibold text-muted-foreground">
                                            Attempts
                                        </th>
                                        <th className="px-4 py-2 font-semibold text-muted-foreground">
                                            Status
                                        </th>
                                        <th className="px-4 py-2 font-semibold text-muted-foreground">
                                            Locked Until
                                        </th>
                                        <th className="px-4 py-2 font-semibold text-muted-foreground">
                                            Last Attempt
                                        </th>
                                        <th className="px-4 py-2 font-semibold text-muted-foreground">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {loginAttempts.map((rec) => (
                                        <tr
                                            key={rec.id}
                                            className="bg-card transition-colors hover:bg-muted/20"
                                        >
                                            <td className="px-4 py-2 font-mono">
                                                {rec.ip_address}
                                            </td>
                                            <td className="px-4 py-2 text-muted-foreground">
                                                {rec.email ?? '—'}
                                            </td>
                                            <td className="px-4 py-2">
                                                <span
                                                    className={`font-semibold ${
                                                        rec.attempts >= 10
                                                            ? 'text-red-500'
                                                            : rec.attempts >= 5
                                                              ? 'text-amber-500'
                                                              : 'text-foreground'
                                                    }`}
                                                >
                                                    {rec.attempts}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">
                                                {rec.is_locked ? (
                                                    <span className="inline-flex items-center rounded border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
                                                        🔒 Locked
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-400">
                                                        ✓ Active
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-muted-foreground">
                                                {rec.locked_until ?? '—'}
                                            </td>
                                            <td className="px-4 py-2 text-muted-foreground">
                                                {rec.last_attempt_at ?? '—'}
                                            </td>
                                            <td className="px-4 py-2">
                                                <Button
                                                    id={`btn-unblock-${rec.id}`}
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        router.post(
                                                            `/settings/system-tools/unblock-ip/${rec.id}`,
                                                            {},
                                                            {
                                                                preserveScroll: true,
                                                            },
                                                        )
                                                    }
                                                >
                                                    Unblock
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

SystemTools.layout = {
    breadcrumbs: [{ title: 'System Tools', href: '/settings/system-tools' }],
};
