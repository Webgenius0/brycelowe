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

interface Props {
    logStats: {
        size: string;
        lines: number;
    };
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

export default function SystemTools({ logStats }: Props) {
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

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="System Tools & Maintenance"
                    description="Manage Laravel caches, optimization commands, and inspect application logs"
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
                    <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        Quick Maintenance Actions
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-3">
                        {tools.map((tool) => (
                            <div
                                key={tool.key}
                                className="flex h-full flex-col justify-between gap-4 rounded-xl border border-sidebar-border bg-card p-5 shadow-2xs"
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
                                            <Loader2 className="size-4 animate-spin mr-1.5" />
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
                <div className="space-y-3 pt-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
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
                                className="h-8 w-56 rounded-md border border-input bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-ring focus:outline-none"
                            />
                            <Button
                                id="btn-refresh-logs"
                                variant="outline"
                                size="sm"
                                disabled={logLoading}
                                onClick={fetchLogs}
                                className="h-8 gap-1 text-xs"
                            >
                                <RefreshCw
                                    className={`size-3.5 ${
                                        logLoading ? 'animate-spin' : ''
                                    }`}
                                />
                                Refresh
                            </Button>
                        </div>
                    </div>

                    {/* Filter level chips */}
                    <div className="flex flex-wrap gap-1.5">
                        {['error', 'warning', 'info', 'debug'].map((lvl) => (
                            <button
                                key={lvl}
                                type="button"
                                onClick={() =>
                                    setLogFilter((prev) =>
                                        prev.toLowerCase() === lvl ? '' : lvl,
                                    )
                                }
                                className={`rounded border px-2 py-0.5 text-xs font-mono font-medium transition cursor-pointer ${
                                    logFilter.toLowerCase() === lvl
                                        ? LEVEL_BADGE[lvl]
                                        : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted'
                                }`}
                            >
                                {lvl.toUpperCase()}
                            </button>
                        ))}
                        {logFilter && (
                            <button
                                type="button"
                                onClick={() => setLogFilter('')}
                                className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                                Clear filter
                            </button>
                        )}
                    </div>

                    {/* Terminal Window */}
                    <div
                        ref={logRef}
                        className="h-[520px] overflow-auto rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-zinc-100 shadow-inner"
                    >
                        {logLoading && logLines.length === 0 ? (
                            <div className="flex h-full items-center justify-center gap-2 text-zinc-400">
                                <Loader2 className="size-4 animate-spin" />
                                Loading logs...
                            </div>
                        ) : filteredLines.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-zinc-500">
                                {logLines.length === 0
                                    ? 'Log file is currently empty.'
                                    : 'No lines match your filter.'}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {filteredLines.map((line, idx) => (
                                    <div
                                        key={idx}
                                        className={`leading-relaxed whitespace-pre-wrap break-all ${
                                            LEVEL_STYLES[line.level] ||
                                            'text-zinc-300'
                                        }`}
                                    >
                                        {line.text}
                                    </div>
                                ))}
                            </div>
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
                            className="text-xs text-muted-foreground"
                        >
                            ↓ Scroll to Bottom
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

SystemTools.layout = {
    breadcrumbs: [{ title: 'System Tools', href: '/settings/system-tools' }],
};
