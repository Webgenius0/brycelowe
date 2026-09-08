import { Head, router } from '@inertiajs/react';
import {
    ShieldAlert,
    Trash2,
    Search,
    Unlock,
    ShieldCheck,
    AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
    loginAttempts: {
        data: LoginAttemptRecord[];
        links: any[];
        total: number;
    };
    filters: {
        search?: string;
    };
}

export default function LoginAttempts({ loginAttempts, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/settings/login-attempts',
            { search },
            { preserveState: true, replace: true },
        );
    };

    const handleUnblock = (id: number) => {
        router.post(
            `/settings/login-attempts/unblock/${id}`,
            {},
            { preserveScroll: true },
        );
    };

    const handleClearAll = () => {
        if (confirm('Are you sure you want to clear all login attempt logs?')) {
            router.post(
                '/settings/login-attempts/clear-all',
                {},
                { preserveScroll: true },
            );
        }
    };

    const lockedCount = loginAttempts.data.filter((r) => r.is_locked).length;

    return (
        <>
            <Head title="Login Attempts & Security Logs" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        variant="small"
                        title="Login Attempts & Lockouts"
                        description="Track failed authentication attempts, rate limits, and unblock locked IP addresses"
                    />

                    {loginAttempts.data.length > 0 && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleClearAll}
                            className="flex items-center gap-1.5 self-start sm:self-auto"
                        >
                            <Trash2 className="size-4" />
                            Clear All Logs
                        </Button>
                    )}
                </div>

                {/* Stats Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-xl border border-sidebar-border bg-card p-4 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    Total Recorded Attempts
                                </p>
                                <p className="mt-1 text-2xl font-bold">
                                    {loginAttempts.total}
                                </p>
                            </div>
                            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <ShieldCheck className="size-5" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-sidebar-border bg-card p-4 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    Currently Locked IPs
                                </p>
                                <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
                                    {lockedCount}
                                </p>
                            </div>
                            <div className="flex size-10 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
                                <ShieldAlert className="size-5" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search by IP address or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 h-9 text-sm"
                        />
                    </div>
                    <Button type="submit" size="sm" variant="secondary" className="h-9">
                        Search
                    </Button>
                </form>

                {/* Table */}
                {loginAttempts.data.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-sidebar-border bg-card/50 p-12 text-center text-sm text-muted-foreground">
                        <ShieldCheck className="mx-auto size-10 text-muted-foreground/40 mb-3" />
                        No login attempt records found matching criteria.
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-sidebar-border bg-card shadow-2xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-sidebar-border bg-muted/40 text-xs font-semibold text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3">IP Address</th>
                                        <th className="px-4 py-3">Email Attempted</th>
                                        <th className="px-4 py-3">Failed Count</th>
                                        <th className="px-4 py-3">Lock Status</th>
                                        <th className="px-4 py-3">Locked Until</th>
                                        <th className="px-4 py-3">Last Attempt</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border text-xs">
                                    {loginAttempts.data.map((rec) => (
                                        <tr
                                            key={rec.id}
                                            className="transition-colors hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-3 font-mono font-medium text-foreground">
                                                {rec.ip_address}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {rec.email ?? '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center rounded-md px-2 py-0.5 font-bold ${
                                                        rec.attempts >= 10
                                                            ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                                                            : rec.attempts >= 5
                                                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                              : 'bg-muted text-muted-foreground'
                                                    }`}
                                                >
                                                    {rec.attempts} attempts
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {rec.is_locked ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400">
                                                        <AlertTriangle className="size-3" />
                                                        Locked Out
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                                        <ShieldCheck className="size-3" />
                                                        Normal
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground font-mono">
                                                {rec.locked_until ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground font-mono">
                                                {rec.last_attempt_at ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleUnblock(rec.id)}
                                                    className="h-7 px-2.5 text-xs flex items-center gap-1 ml-auto"
                                                >
                                                    <Unlock className="size-3" />
                                                    Unblock IP
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Links */}
                        {loginAttempts.links && loginAttempts.links.length > 3 && (
                            <div className="flex items-center justify-between border-t border-sidebar-border px-4 py-3">
                                <div className="text-xs text-muted-foreground">
                                    Showing {loginAttempts.data.length} of {loginAttempts.total} attempts
                                </div>
                                <div className="flex items-center gap-1">
                                    {loginAttempts.links.map((link, i) => (
                                        <Button
                                            key={i}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url)}
                                            className="h-7 min-w-7 px-2 text-xs"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

LoginAttempts.layout = {
    breadcrumbs: [{ title: 'Login Attempts', href: '/settings/login-attempts' }],
};
