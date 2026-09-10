import { Head, router, useForm } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    Calendar,
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    Download,
    Eye,
    FileText,
    Gauge,
    Layers,
    Pencil,
    Plus,
    Receipt,
    RefreshCw,
    ShieldAlert,
    Sparkles,
    Trash2,
    TrendingUp,
    User as UserIcon,
    XCircle,
    Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import DataTable from '@/components/datatable';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plan } from '@/types/plan';
import {
    Billing,
    Overusages,
    Subscription,
    SubscriptionStatus,
    Usages,
} from '@/types/subscription';

type UserOption = {
    id: number;
    name: string;
    email: string;
};

type Props = {
    subscriptions: {
        data: Subscription[];
        links: any[];
    };
    analytics: {
        total: number;
        active: number;
        trialing: number;
        past_due: number;
        canceled: number;
        total_overages: number;
    };
    users: UserOption[];
    plans: Plan[];
    filters: {
        search?: string;
        status?: string;
        plan_id?: string;
    };
};

const STATUS_BADGES: Record<SubscriptionStatus, { label: string; class: string }> = {
    ACTIVE: { label: 'Active', class: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    TRIALING: { label: 'Trialing', class: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
    PAST_DUE: { label: 'Past Due', class: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
    CANCELED: { label: 'Canceled', class: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' },
    EXPIRED: { label: 'Expired', class: 'bg-red-500/10 text-red-600 dark:text-red-400' },
    PENDING: { label: 'Pending', class: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
};

// --- Stat Card ---
function StatCard({
    title,
    value,
    icon,
    accent,
    isCurrency = false,
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
    accent: string;
    isCurrency?: boolean;
}) {
    return (
        <div className="rounded-xl border border-sidebar-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="mt-1 text-2xl font-bold tracking-tight">
                        {isCurrency ? `$${Number(value).toFixed(2)}` : value}
                    </p>
                </div>
                <div className={`flex size-11 items-center justify-center rounded-lg ${accent}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

// --- Create Subscription Modal ---
function CreateSubscriptionModal({
    open,
    onClose,
    users,
    plans,
}: {
    open: boolean;
    onClose: () => void;
    users: UserOption[];
    plans: Plan[];
}) {
    const today = new Date().toISOString().substring(0, 10);
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

    const form = useForm({
        user_id: users.length > 0 ? users[0].id : '',
        plan_id: plans.length > 0 ? plans[0].id : '',
        started_at: today,
        current_period_start: today,
        current_period_end: nextMonth,
        status: 'ACTIVE' as SubscriptionStatus,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/subscription/store', {
            onSuccess: () => {
                form.reset();
                onClose();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Assign New Subscription</DialogTitle>
                    <DialogDescription>
                        Attach a pricing plan and initialize credit allocation and billing for a customer.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="create-sub-user">Customer User *</Label>
                            <select
                                id="create-sub-user"
                                value={form.data.user_id}
                                onChange={(e) => form.setData('user_id', Number(e.target.value))}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-ring focus:ring-1 focus:ring-ring"
                                required
                            >
                                <option value="" disabled>Select Customer</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name} ({u.email})
                                    </option>
                                ))}
                            </select>
                            {form.errors.user_id && (
                                <p className="text-xs text-destructive">{form.errors.user_id}</p>
                            )}
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="create-sub-plan">Subscription Plan *</Label>
                            <select
                                id="create-sub-plan"
                                value={form.data.plan_id}
                                onChange={(e) => form.setData('plan_id', Number(e.target.value))}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-ring focus:ring-1 focus:ring-ring"
                                required
                            >
                                <option value="" disabled>Select Plan</option>
                                {plans.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} - ${Number(p.price).toFixed(2)}/{p.interval}
                                    </option>
                                ))}
                            </select>
                            {form.errors.plan_id && (
                                <p className="text-xs text-destructive">{form.errors.plan_id}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-sub-start">Period Start</Label>
                            <Input
                                id="create-sub-start"
                                type="date"
                                value={form.data.current_period_start}
                                onChange={(e) => form.setData('current_period_start', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-sub-end">Period End</Label>
                            <Input
                                id="create-sub-end"
                                type="date"
                                value={form.data.current_period_end}
                                onChange={(e) => form.setData('current_period_end', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="create-sub-status">Status</Label>
                            <select
                                id="create-sub-status"
                                value={form.data.status}
                                onChange={(e) => form.setData('status', e.target.value as SubscriptionStatus)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-ring focus:ring-1 focus:ring-ring"
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="TRIALING">Trialing</option>
                                <option value="PAST_DUE">Past Due</option>
                                <option value="PENDING">Pending</option>
                                <option value="CANCELED">Canceled</option>
                            </select>
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? 'Assigning...' : 'Assign Subscription'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// --- Record Overusage Modal ---
function RecordOverusageModal({
    subscription,
    open,
    onClose,
}: {
    subscription: Subscription | null;
    open: boolean;
    onClose: () => void;
}) {
    const form = useForm({
        overusages_type: 'CALL',
        credit: 1,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subscription) return;

        form.post(`/subscription/overusage/${subscription.id}`, {
            onSuccess: () => {
                form.reset();
                onClose();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Record Overusage Event</DialogTitle>
                    <DialogDescription>
                        Log additional credit consumption beyond the plan limits for{' '}
                        <span className="font-semibold text-foreground">
                            {subscription?.user?.name}
                        </span>
                        .
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="overusage-type">Overage Credit Category</Label>
                        <select
                            id="overusage-type"
                            value={form.data.overusages_type}
                            onChange={(e) => form.setData('overusages_type', e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-ring focus:ring-1 focus:ring-ring"
                        >
                            <option value="CALL">Call Credits</option>
                            <option value="REPORT">Report Credits</option>
                            <option value="PLAYBOOK">Playbook Credits</option>
                            <option value="CALIBRATION">Calibration Credits</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="overusage-amount">Units Consumed</Label>
                        <Input
                            id="overusage-amount"
                            type="number"
                            min="1"
                            value={form.data.credit}
                            onChange={(e) => form.setData('credit', Number(e.target.value))}
                            required
                        />
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? 'Recording...' : 'Record Overage'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// --- View Subscription Modal ---
function ViewSubscriptionModal({
    subscription,
    open,
    onClose,
}: {
    subscription: Subscription | null;
    open: boolean;
    onClose: () => void;
}) {
    if (!subscription) return null;

    const plan = subscription.plan;
    const usages = subscription.usages;
    const overages = subscription.overusages ?? [];
    const billings = subscription.billings ?? [];

    const handleQuickStatus = (newStatus: SubscriptionStatus) => {
        router.post(`/subscription/status/${subscription.id}`, { status: newStatus }, { preserveScroll: true });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold">{subscription.user?.name}</span>
                            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                                {plan?.name || 'Custom Plan'}
                            </span>
                        </div>
                        <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                STATUS_BADGES[subscription.status].class
                            }`}
                        >
                            {STATUS_BADGES[subscription.status].label}
                        </span>
                    </div>
                    <DialogDescription>
                        Subscription Period:{' '}
                        {subscription.current_period_start
                            ? new Date(subscription.current_period_start).toLocaleDateString()
                            : 'N/A'}{' '}
                        to{' '}
                        {subscription.current_period_end
                            ? new Date(subscription.current_period_end).toLocaleDateString()
                            : 'N/A'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-2 text-sm">
                    {/* Usage vs Allotted Credits */}
                    <div>
                        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Current Period Usage & Limits
                        </h4>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <div className="rounded-lg border border-border bg-card p-3 shadow-xs">
                                <p className="text-xs text-muted-foreground">Calls</p>
                                <div className="mt-1 flex items-baseline gap-1">
                                    <span className="text-lg font-bold text-foreground">
                                        {usages?.call_credit ?? 0}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        / {plan?.call_credit ?? 0}
                                    </span>
                                </div>
                            </div>
                            <div className="rounded-lg border border-border bg-card p-3 shadow-xs">
                                <p className="text-xs text-muted-foreground">Reports</p>
                                <div className="mt-1 flex items-baseline gap-1">
                                    <span className="text-lg font-bold text-foreground">
                                        {usages?.report_credit ?? 0}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        / {plan?.report_credit ?? 0}
                                    </span>
                                </div>
                            </div>
                            <div className="rounded-lg border border-border bg-card p-3 shadow-xs">
                                <p className="text-xs text-muted-foreground">Playbooks</p>
                                <div className="mt-1 flex items-baseline gap-1">
                                    <span className="text-lg font-bold text-foreground">
                                        {usages?.playbook_credit ?? 0}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        / {plan?.playbook_credit ?? 0}
                                    </span>
                                </div>
                            </div>
                            <div className="rounded-lg border border-border bg-card p-3 shadow-xs">
                                <p className="text-xs text-muted-foreground">Calibrations</p>
                                <div className="mt-1 flex items-baseline gap-1">
                                    <span className="text-lg font-bold text-foreground">
                                        {usages?.calibration_credit ?? 0}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        / {plan?.calibration_credit ?? 0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Overages summary alert */}
                        <div className="mt-3 flex items-center justify-between rounded-lg border border-teal-500/20 bg-teal-500/5 p-3">
                            <div className="flex items-center gap-2">
                                <Zap className="size-4 text-teal-600 dark:text-teal-400" />
                                <span className="text-xs font-semibold text-teal-700 dark:text-teal-300">
                                    Accumulated Overages Billed:
                                </span>
                            </div>
                            <span className="text-sm font-extrabold text-teal-700 dark:text-teal-300">
                                ${Number(usages?.get_total_overusages_amount ?? 0).toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Overages Event Log */}
                    <div>
                        <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Overages History ({overages.length})
                        </h4>
                        {overages.length > 0 ? (
                            <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
                                {overages.map((ov, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2 text-xs"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-foreground">
                                                +{ov.credit} {ov.overusages_type}
                                            </span>
                                            {ov.created_at && (

                                                <span className="text-[11px] text-muted-foreground">
                                                    ({new Date(ov.created_at).toLocaleString()})
                                                </span>
                                            )}
                                        </div>
                                        <span
                                            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                                ov.is_paid
                                                    ? 'bg-emerald-500/10 text-emerald-600'
                                                    : 'bg-amber-500/10 text-amber-600'
                                            }`}
                                        >
                                            {ov.is_paid ? 'Paid' : 'Unpaid'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                                No overages registered during this subscription cycle.
                            </div>
                        )}
                    </div>

                    {/* Billing Invoices */}
                    <div>
                        <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Invoices & Billing History ({billings.length})
                        </h4>
                        {billings.length > 0 ? (
                            <div className="space-y-2">
                                {billings.map((bill) => (
                                    <div
                                        key={bill.id}
                                        className="flex items-center justify-between rounded-md border border-border bg-card p-3 text-xs shadow-xs"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Receipt className="size-4 text-primary shrink-0" />
                                            <div>
                                                <span className="font-mono font-bold text-foreground">
                                                    {bill.invoice_number}
                                                </span>
                                                <span className="ml-2 text-muted-foreground">
                                                    {bill.date ? new Date(bill.date).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-600">
                                                {bill.status}
                                            </span>
                                            {bill.pdf && (
                                                <a
                                                    href={bill.pdf_url || `/${bill.pdf}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="font-semibold text-primary hover:underline"
                                                >
                                                    Download PDF
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                                No invoices generated yet.
                            </div>
                        )}
                    </div>

                    {/* Quick status transitions */}
                    <div className="border-t border-border pt-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-medium text-muted-foreground">Quick Status:</span>
                            <div className="flex flex-wrap gap-1.5">
                                {(['ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED'] as SubscriptionStatus[]).map((st) => (
                                    <Button
                                        key={st}
                                        variant={subscription.status === st ? 'default' : 'outline'}
                                        size="sm"
                                        className="text-xs h-7 px-2.5"
                                        onClick={() => handleQuickStatus(st)}
                                    >
                                        {STATUS_BADGES[st].label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// --- Delete Subscription Modal ---
function DeleteSubscriptionModal({
    subscription,
    open,
    onClose,
}: {
    subscription: Subscription | null;
    open: boolean;
    onClose: () => void;
}) {
    const [processing, setProcessing] = useState(false);

    const handleDelete = () => {
        if (!subscription) return;
        setProcessing(true);

        router.delete(`/subscription/destroy/${subscription.id}`, {
            onSuccess: () => {
                onClose();
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cancel / Remove Subscription</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the subscription for{' '}
                        <span className="font-semibold text-foreground">
                            {subscription?.user?.name}
                        </span>
                        ? This will delete all associated usages and invoice records.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={processing}
                    >
                        {processing ? 'Deleting...' : 'Delete Subscription'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// --- Main Page Component ---
export default function SubscriptionIndexPage({
    subscriptions,
    analytics,
    users,
    plans,
    filters,
}: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [viewSub, setViewSub] = useState<Subscription | null>(null);
    const [overageSub, setOverageSub] = useState<Subscription | null>(null);
    const [deleteSub, setDeleteSub] = useState<Subscription | null>(null);

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get(
            window.location.pathname,
            { ...filters, status: e.target.value, page: 1 },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get(
            window.location.pathname,
            { ...filters, plan_id: e.target.value, page: 1 },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const columns = [
        {
            key: 'user',
            title: 'Subscriber',
            render: (row: Subscription) => (
                <div>
                    <div className="font-semibold text-foreground">{row.user?.name || 'Unknown'}</div>
                    <div className="text-xs text-muted-foreground">{row.user?.email}</div>
                </div>
            ),
        },
        {
            key: 'plan',
            title: 'Plan Tier',
            render: (row: Subscription) => (
                <div>
                    <div className="font-semibold text-primary">{row.plan?.name || 'N/A'}</div>
                    <div className="text-xs text-muted-foreground">
                        ${Number(row.plan?.price ?? 0).toFixed(2)} / {row.plan?.interval.toLowerCase()}
                    </div>
                </div>
            ),
        },
        {
            key: 'period',
            title: 'Billing Cycle',
            render: (row: Subscription) => (
                <div className="text-xs">
                    <span className="text-foreground">
                        {row.current_period_start
                            ? new Date(row.current_period_start).toLocaleDateString()
                            : '—'}
                    </span>
                    <span className="text-muted-foreground"> to </span>
                    <span className="text-foreground">
                        {row.current_period_end
                            ? new Date(row.current_period_end).toLocaleDateString()
                            : '—'}
                    </span>
                </div>
            ),
        },
        {
            key: 'usages',
            title: 'Credits (Used / Max)',
            sortable: false,
            render: (row: Subscription) => {
                const u = row.usages;
                const p = row.plan;
                return (
                    <div className="flex items-center gap-1.5 text-xs">
                        <span className="rounded bg-muted px-1.5 py-0.5 font-mono" title="Calls">
                            {u?.call_credit ?? 0}/{p?.call_credit ?? 0}
                        </span>
                        <span className="text-muted-foreground">/</span>
                        <span className="rounded bg-muted px-1.5 py-0.5 font-mono" title="Reports">
                            {u?.report_credit ?? 0}/{p?.report_credit ?? 0}
                        </span>
                        <span className="text-muted-foreground">/</span>
                        <span className="rounded bg-muted px-1.5 py-0.5 font-mono" title="Playbooks">
                            {u?.playbook_credit ?? 0}/{p?.playbook_credit ?? 0}
                        </span>
                    </div>
                );
            },
        },
        {
            key: 'overages',
            title: 'Overages',
            sortable: false,
            render: (row: Subscription) => {
                const amount = Number(row.usages?.get_total_overusages_amount ?? 0);
                return amount > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-teal-500/10 px-2 py-0.5 text-xs font-bold text-teal-700 dark:text-teal-300">
                        <Zap className="size-3" />
                        ${amount.toFixed(2)}
                    </span>
                ) : (
                    <span className="text-xs text-muted-foreground">$0.00</span>
                );
            },
        },
        {
            key: 'status',
            title: 'Status',
            render: (row: Subscription) => (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        STATUS_BADGES[row.status].class
                    }`}
                >
                    {STATUS_BADGES[row.status].label}
                </span>
            ),
        },
        {
            key: 'action',
            title: 'Actions',
            sortable: false,
            render: (row: Subscription) => (
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-primary"
                        onClick={() => setViewSub(row)}
                        title="View Subscription"
                    >
                        <Eye className="size-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-teal-600"
                        onClick={() => setOverageSub(row)}
                        title="Record Overage"
                    >
                        <Zap className="size-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteSub(row)}
                        title="Delete Subscription"
                    >
                        <Trash2 className="size-3.5" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Subscriptions & Billing" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Subscriptions & Billing
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Monitor active subscriptions, feature credit usages, overage fees, and invoices.
                        </p>
                    </div>

                    <Button onClick={() => setCreateOpen(true)} className="gap-2">
                        <Plus className="size-4" />
                        Assign Subscription
                    </Button>
                </div>

                {/* Analytics Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <StatCard
                        title="Total Subscriptions"
                        value={analytics.total}
                        icon={<CreditCard className="size-5 text-indigo-600 dark:text-indigo-400" />}
                        accent="bg-indigo-500/10"
                    />
                    <StatCard
                        title="Active Subscriptions"
                        value={analytics.active}
                        icon={<CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />}
                        accent="bg-emerald-500/10"
                    />
                    <StatCard
                        title="Trial Subscriptions"
                        value={analytics.trialing}
                        icon={<Sparkles className="size-5 text-amber-600 dark:text-amber-400" />}
                        accent="bg-amber-500/10"
                    />
                    <StatCard
                        title="Past Due / Canceled"
                        value={analytics.past_due + analytics.canceled}
                        icon={<AlertCircle className="size-5 text-rose-600 dark:text-rose-400" />}
                        accent="bg-rose-500/10"
                    />
                    <StatCard
                        title="Total Overages Billed"
                        value={analytics.total_overages}
                        icon={<DollarSign className="size-5 text-teal-600 dark:text-teal-400" />}
                        accent="bg-teal-500/10"
                        isCurrency
                    />
                </div>

                {/* Data Table */}
                <DataTable<Subscription>
                    columns={columns}
                    data={subscriptions.data}
                    meta={{ links: subscriptions.links }}
                    filters={filters}
                >
                    <select
                        value={filters.plan_id || ''}
                        onChange={handlePlanChange}
                        className="h-10 min-w-[130px] cursor-pointer rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
                    >
                        <option value="">All Plans</option>
                        {plans.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.status || ''}
                        onChange={handleStatusChange}
                        className="h-10 min-w-[120px] cursor-pointer rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
                    >
                        <option value="">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="TRIALING">Trialing</option>
                        <option value="PAST_DUE">Past Due</option>
                        <option value="CANCELED">Canceled</option>
                        <option value="EXPIRED">Expired</option>
                    </select>
                </DataTable>
            </div>

            {/* Modals */}
            <CreateSubscriptionModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                users={users}
                plans={plans}
            />
            <RecordOverusageModal
                subscription={overageSub}
                open={!!overageSub}
                onClose={() => setOverageSub(null)}
            />
            <ViewSubscriptionModal
                subscription={viewSub}
                open={!!viewSub}
                onClose={() => setViewSub(null)}
            />
            <DeleteSubscriptionModal
                subscription={deleteSub}
                open={!!deleteSub}
                onClose={() => setDeleteSub(null)}
            />
        </>
    );
}
