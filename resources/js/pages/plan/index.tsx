import { Head, router, useForm } from '@inertiajs/react';
import {
    CheckCircle2,
    CreditCard,
    Eye,
    Layers,
    Pencil,
    Plus,
    Sparkles,
    ToggleLeft,
    ToggleRight,
    Trash2,
    XCircle,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
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

export interface Plan {
    id: number;
    name: string;
    description: string | null;
    price: number | string;
    discount_price: number | string | null;
    interval: 'MONTHLY' | 'YEARLY' | 'WEEKLY' | 'DAILY' | 'LIFETIME' | 'CUSTOM';
    call_credit: number;
    report_credit: number;
    playbook_credit: number;
    calibration_credit: number;
    is_active: boolean;
    is_trial: boolean;
    trial_period: number;
    created_at?: string;
    updated_at?: string;
}

type Props = {
    plans: {
        data: Plan[];
        links: any[];
    };
    analytics: {
        total: number;
        active: number;
        inactive: number;
        trials: number;
    };
    filters: {
        search?: string;
        interval?: string;
        status?: string;
    };
};

// --- Stat Card ---
function StatCard({
    title,
    value,
    icon,
    accent,
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
    accent: string;
}) {
    return (
        <div className="rounded-xl border border-sidebar-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">
                        {title}
                    </p>
                    <p className="mt-1 text-2xl font-bold tracking-tight">
                        {value}
                    </p>
                </div>
                <div
                    className={`flex size-11 items-center justify-center rounded-lg ${accent}`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

// --- Create Plan Modal ---
function CreatePlanModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const form = useForm({
        name: '',
        description: '',
        price: '',
        discount_price: '',
        interval: 'MONTHLY',
        call_credit: 0,
        report_credit: 0,
        playbook_credit: 0,
        calibration_credit: 0,
        is_active: true,
        is_trial: false,
        trial_period: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/plan/store', {
            onSuccess: () => {
                form.reset();
                onClose();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Subscription Plan</DialogTitle>
                    <DialogDescription>
                        Set up pricing, billing interval, and feature credits for this plan.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="create-plan-name">Plan Name *</Label>
                            <Input
                                id="create-plan-name"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                placeholder="e.g., Professional Tier, Starter Plan"
                                required
                            />
                            {form.errors.name && (
                                <p className="text-xs text-destructive">{form.errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="create-plan-desc">Description</Label>
                            <textarea
                                id="create-plan-desc"
                                value={form.data.description}
                                onChange={(e) => form.setData('description', e.target.value)}
                                placeholder="Describe what is included in this plan..."
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                rows={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-plan-price">Price ($) *</Label>
                            <Input
                                id="create-plan-price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.data.price}
                                onChange={(e) => form.setData('price', e.target.value)}
                                placeholder="49.00"
                                required
                            />
                            {form.errors.price && (
                                <p className="text-xs text-destructive">{form.errors.price}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-plan-discount">Discount Price ($)</Label>
                            <Input
                                id="create-plan-discount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.data.discount_price}
                                onChange={(e) => form.setData('discount_price', e.target.value)}
                                placeholder="29.00 (optional)"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-plan-interval">Billing Interval *</Label>
                            <select
                                id="create-plan-interval"
                                value={form.data.interval}
                                onChange={(e) => form.setData('interval', e.target.value as any)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-ring focus:ring-1 focus:ring-ring"
                            >
                                <option value="MONTHLY">Monthly</option>
                                <option value="YEARLY">Yearly</option>
                                <option value="WEEKLY">Weekly</option>
                                <option value="DAILY">Daily</option>
                                <option value="LIFETIME">Lifetime</option>
                                <option value="CUSTOM">Custom</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-plan-trial-days">Trial Period (Days)</Label>
                            <Input
                                id="create-plan-trial-days"
                                type="number"
                                min="0"
                                value={form.data.trial_period}
                                onChange={(e) => form.setData('trial_period', Number(e.target.value))}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Credit Limits */}
                    <div className="border-t border-border pt-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                            Feature Credits Allocation
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="create-call-credit" className="text-xs">Call Credits</Label>
                                <Input
                                    id="create-call-credit"
                                    type="number"
                                    min="0"
                                    value={form.data.call_credit}
                                    onChange={(e) => form.setData('call_credit', Number(e.target.value))}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="create-report-credit" className="text-xs">Report Credits</Label>
                                <Input
                                    id="create-report-credit"
                                    type="number"
                                    min="0"
                                    value={form.data.report_credit}
                                    onChange={(e) => form.setData('report_credit', Number(e.target.value))}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="create-playbook-credit" className="text-xs">Playbook Credits</Label>
                                <Input
                                    id="create-playbook-credit"
                                    type="number"
                                    min="0"
                                    value={form.data.playbook_credit}
                                    onChange={(e) => form.setData('playbook_credit', Number(e.target.value))}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="create-calib-credit" className="text-xs">Calibration Credits</Label>
                                <Input
                                    id="create-calib-credit"
                                    type="number"
                                    min="0"
                                    value={form.data.calibration_credit}
                                    onChange={(e) => form.setData('calibration_credit', Number(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="border-t border-border pt-4 flex flex-wrap gap-6">
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                            <input
                                type="checkbox"
                                checked={form.data.is_active}
                                onChange={(e) => form.setData('is_active', e.target.checked)}
                                className="rounded border-input text-primary focus:ring-ring size-4"
                            />
                            Active Status
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                            <input
                                type="checkbox"
                                checked={form.data.is_trial}
                                onChange={(e) => form.setData('is_trial', e.target.checked)}
                                className="rounded border-input text-primary focus:ring-ring size-4"
                            />
                            Enable Trial Plan
                        </label>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? 'Creating...' : 'Create Plan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// --- Edit Plan Modal ---
function EditPlanModal({
    plan,
    open,
    onClose,
}: {
    plan: Plan | null;
    open: boolean;
    onClose: () => void;
}) {
    const form = useForm({
        name: plan?.name ?? '',
        description: plan?.description ?? '',
        price: plan?.price ?? '',
        discount_price: plan?.discount_price ?? '',
        interval: plan?.interval ?? 'MONTHLY',
        call_credit: plan?.call_credit ?? 0,
        report_credit: plan?.report_credit ?? 0,
        playbook_credit: plan?.playbook_credit ?? 0,
        calibration_credit: plan?.calibration_credit ?? 0,
        is_active: plan?.is_active ?? true,
        is_trial: plan?.is_trial ?? false,
        trial_period: plan?.trial_period ?? 0,
    });

    const [prevPlanId, setPrevPlanId] = useState<number | null>(null);

    if (plan && plan.id !== prevPlanId) {
        setPrevPlanId(plan.id);
        form.setData({
            name: plan.name,
            description: plan.description ?? '',
            price: plan.price,
            discount_price: plan.discount_price ?? '',
            interval: plan.interval,
            call_credit: plan.call_credit,
            report_credit: plan.report_credit,
            playbook_credit: plan.playbook_credit,
            calibration_credit: plan.calibration_credit,
            is_active: plan.is_active,
            is_trial: plan.is_trial,
            trial_period: plan.trial_period,
        });
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!plan) return;

        form.patch(`/plan/update/${plan.id}`, {
            onSuccess: () => {
                form.reset();
                onClose();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Subscription Plan</DialogTitle>
                    <DialogDescription>
                        Update plan pricing, billing configuration, and credit allocation.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="edit-plan-name">Plan Name *</Label>
                            <Input
                                id="edit-plan-name"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                required
                            />
                            {form.errors.name && (
                                <p className="text-xs text-destructive">{form.errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="edit-plan-desc">Description</Label>
                            <textarea
                                id="edit-plan-desc"
                                value={form.data.description}
                                onChange={(e) => form.setData('description', e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                rows={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-plan-price">Price ($) *</Label>
                            <Input
                                id="edit-plan-price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.data.price}
                                onChange={(e) => form.setData('price', e.target.value)}
                                required
                            />
                            {form.errors.price && (
                                <p className="text-xs text-destructive">{form.errors.price}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-plan-discount">Discount Price ($)</Label>
                            <Input
                                id="edit-plan-discount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.data.discount_price}
                                onChange={(e) => form.setData('discount_price', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-plan-interval">Billing Interval *</Label>
                            <select
                                id="edit-plan-interval"
                                value={form.data.interval}
                                onChange={(e) => form.setData('interval', e.target.value as any)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-ring focus:ring-1 focus:ring-ring"
                            >
                                <option value="MONTHLY">Monthly</option>
                                <option value="YEARLY">Yearly</option>
                                <option value="WEEKLY">Weekly</option>
                                <option value="DAILY">Daily</option>
                                <option value="LIFETIME">Lifetime</option>
                                <option value="CUSTOM">Custom</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-plan-trial-days">Trial Period (Days)</Label>
                            <Input
                                id="edit-plan-trial-days"
                                type="number"
                                min="0"
                                value={form.data.trial_period}
                                onChange={(e) => form.setData('trial_period', Number(e.target.value))}
                            />
                        </div>
                    </div>

                    {/* Credit Limits */}
                    <div className="border-t border-border pt-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                            Feature Credits Allocation
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-call-credit" className="text-xs">Call Credits</Label>
                                <Input
                                    id="edit-call-credit"
                                    type="number"
                                    min="0"
                                    value={form.data.call_credit}
                                    onChange={(e) => form.setData('call_credit', Number(e.target.value))}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-report-credit" className="text-xs">Report Credits</Label>
                                <Input
                                    id="edit-report-credit"
                                    type="number"
                                    min="0"
                                    value={form.data.report_credit}
                                    onChange={(e) => form.setData('report_credit', Number(e.target.value))}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-playbook-credit" className="text-xs">Playbook Credits</Label>
                                <Input
                                    id="edit-playbook-credit"
                                    type="number"
                                    min="0"
                                    value={form.data.playbook_credit}
                                    onChange={(e) => form.setData('playbook_credit', Number(e.target.value))}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-calib-credit" className="text-xs">Calibration Credits</Label>
                                <Input
                                    id="edit-calib-credit"
                                    type="number"
                                    min="0"
                                    value={form.data.calibration_credit}
                                    onChange={(e) => form.setData('calibration_credit', Number(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="border-t border-border pt-4 flex flex-wrap gap-6">
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                            <input
                                type="checkbox"
                                checked={form.data.is_active}
                                onChange={(e) => form.setData('is_active', e.target.checked)}
                                className="rounded border-input text-primary focus:ring-ring size-4"
                            />
                            Active Status
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                            <input
                                type="checkbox"
                                checked={form.data.is_trial}
                                onChange={(e) => form.setData('is_trial', e.target.checked)}
                                className="rounded border-input text-primary focus:ring-ring size-4"
                            />
                            Enable Trial Plan
                        </label>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// --- View Plan Modal ---
function ViewPlanModal({
    plan,
    open,
    onClose,
}: {
    plan: Plan | null;
    open: boolean;
    onClose: () => void;
}) {
    if (!plan) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold">{plan.name}</DialogTitle>
                        <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                plan.is_active
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-red-500/10 text-red-600 dark:text-red-400'
                            }`}
                        >
                            {plan.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <DialogDescription>
                        {plan.description || 'No description provided.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Pricing summary */}
                    <div className="flex items-baseline gap-3 rounded-lg bg-muted/40 p-4 border border-border">
                        <div className="text-3xl font-extrabold text-[#0EADAB]">
                            ${Number(plan.price).toFixed(2)}
                        </div>
                        <div className="text-sm font-medium text-muted-foreground uppercase">
                            / {plan.interval}
                        </div>
                        {plan.discount_price && Number(plan.discount_price) > 0 && (
                            <div className="ml-auto text-xs bg-amber-500/10 text-amber-600 font-bold px-2 py-1 rounded">
                                Discount: ${Number(plan.discount_price).toFixed(2)}
                            </div>
                        )}
                    </div>

                    {/* Credits breakdown */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                            Feature Credits
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                            <div className="p-3 rounded-lg bg-card border border-border">
                                <div className="text-lg font-bold text-foreground">{plan.call_credit}</div>
                                <div className="text-[11px] text-muted-foreground">Calls</div>
                            </div>
                            <div className="p-3 rounded-lg bg-card border border-border">
                                <div className="text-lg font-bold text-foreground">{plan.report_credit}</div>
                                <div className="text-[11px] text-muted-foreground">Reports</div>
                            </div>
                            <div className="p-3 rounded-lg bg-card border border-border">
                                <div className="text-lg font-bold text-foreground">{plan.playbook_credit}</div>
                                <div className="text-[11px] text-muted-foreground">Playbooks</div>
                            </div>
                            <div className="p-3 rounded-lg bg-card border border-border">
                                <div className="text-lg font-bold text-foreground">{plan.calibration_credit}</div>
                                <div className="text-[11px] text-muted-foreground">Calibrations</div>
                            </div>
                        </div>
                    </div>

                    {/* Trial info */}
                    {plan.is_trial && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-medium">
                            <Sparkles className="size-4 shrink-0" />
                            <span>Free trial enabled for {plan.trial_period} days</span>
                        </div>
                    )}
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

// --- Delete Plan Modal ---
function DeletePlanModal({
    plan,
    open,
    onClose,
}: {
    plan: Plan | null;
    open: boolean;
    onClose: () => void;
}) {
    const [processing, setProcessing] = useState(false);

    const handleDelete = () => {
        if (!plan) return;
        setProcessing(true);

        router.delete(`/plan/destroy/${plan.id}`, {
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
                    <DialogTitle>Delete Plan</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the plan{' '}
                        <span className="font-semibold text-foreground">
                            {plan?.name}
                        </span>
                        ? This cannot be undone.
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
                        {processing ? 'Deleting...' : 'Delete Plan'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// --- Main Page Component ---
export default function PlansPage({ plans, analytics, filters }: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editPlan, setEditPlan] = useState<Plan | null>(null);
    const [viewPlan, setViewPlan] = useState<Plan | null>(null);
    const [deletePlan, setDeletePlan] = useState<Plan | null>(null);

    const handleIntervalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get(
            window.location.pathname,
            {
                ...filters,
                interval: e.target.value,
                page: 1,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get(
            window.location.pathname,
            {
                ...filters,
                status: e.target.value,
                page: 1,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const handleToggle = (id: number) => {
        router.post(`/plan/toggle/${id}`, {}, {
            preserveScroll: true,
        });
    };

    const columns = [
        {
            key: 'sl',
            title: '#',
            render: (row: Plan) => {
                const index = plans.data.findIndex((item) => item.id === row.id);
                return <span className="text-muted-foreground">{index + 1}</span>;
            },
        },
        {
            key: 'name',
            title: 'Plan Name',
            render: (row: Plan) => (
                <div>
                    <div className="font-semibold text-foreground">{row.name}</div>
                    {row.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                            {row.description}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'price',
            title: 'Pricing',
            render: (row: Plan) => (
                <div>
                    <span className="font-bold text-[#0EADAB]">
                        ${Number(row.price).toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                        /{row.interval.toLowerCase()}
                    </span>
                </div>
            ),
        },
        {
            key: 'credits',
            title: 'Credits (Call/Rep/Pb/Cal)',
            sortable: false,
            render: (row: Plan) => (
                <div className="flex items-center gap-1.5 text-xs">
                    <span className="bg-muted px-1.5 py-0.5 rounded font-mono" title="Call Credits">
                        {row.call_credit}
                    </span>
                    <span className="text-muted-foreground">/</span>
                    <span className="bg-muted px-1.5 py-0.5 rounded font-mono" title="Report Credits">
                        {row.report_credit}
                    </span>
                    <span className="text-muted-foreground">/</span>
                    <span className="bg-muted px-1.5 py-0.5 rounded font-mono" title="Playbook Credits">
                        {row.playbook_credit}
                    </span>
                    <span className="text-muted-foreground">/</span>
                    <span className="bg-muted px-1.5 py-0.5 rounded font-mono" title="Calibration Credits">
                        {row.calibration_credit}
                    </span>
                </div>
            ),
        },
        {
            key: 'trial',
            title: 'Trial',
            sortable: false,
            render: (row: Plan) => (
                row.is_trial ? (
                    <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        {row.trial_period} Days Free
                    </span>
                ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                )
            ),
        },
        {
            key: 'is_active',
            title: 'Status',
            render: (row: Plan) => (
                <button
                    onClick={() => handleToggle(row.id)}
                    className="inline-flex items-center gap-1.5 cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-medium transition hover:opacity-80"
                    title="Click to toggle status"
                >
                    {row.is_active ? (
                        <>
                            <span className="size-2 rounded-full bg-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active</span>
                        </>
                    ) : (
                        <>
                            <span className="size-2 rounded-full bg-red-500" />
                            <span className="text-red-600 dark:text-red-400 font-semibold">Inactive</span>
                        </>
                    )}
                </button>
            ),
        },
        {
            key: 'action',
            title: 'Actions',
            sortable: false,
            render: (row: Plan) => (
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-primary"
                        onClick={() => setViewPlan(row)}
                        title="View Plan"
                    >
                        <Eye className="size-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-primary"
                        onClick={() => setEditPlan(row)}
                        title="Edit Plan"
                    >
                        <Pencil className="size-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeletePlan(row)}
                        title="Delete Plan"
                    >
                        <Trash2 className="size-3.5" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Subscription Plans" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Subscription Plans
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Create and manage pricing tiers, feature credits, and trial configurations.
                        </p>
                    </div>

                    <Button onClick={() => setCreateOpen(true)} className="gap-2">
                        <Plus className="size-4" />
                        Create Plan
                    </Button>
                </div>

                {/* Analytics Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Plans"
                        value={analytics.total}
                        icon={<CreditCard className="size-5 text-teal-600 dark:text-teal-400" />}
                        accent="bg-teal-500/10"
                    />
                    <StatCard
                        title="Active Plans"
                        value={analytics.active}
                        icon={<CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />}
                        accent="bg-emerald-500/10"
                    />
                    <StatCard
                        title="Inactive Plans"
                        value={analytics.inactive}
                        icon={<XCircle className="size-5 text-rose-600 dark:text-rose-400" />}
                        accent="bg-rose-500/10"
                    />
                    <StatCard
                        title="Trial Enabled"
                        value={analytics.trials}
                        icon={<Zap className="size-5 text-indigo-600 dark:text-indigo-400" />}
                        accent="bg-indigo-500/10"
                    />
                </div>

                {/* Data Table */}
                <DataTable<Plan>
                    columns={columns}
                    data={plans.data}
                    meta={{ links: plans.links }}
                    filters={filters}
                >
                    <select
                        value={filters.interval || ''}
                        onChange={handleIntervalChange}
                        className="h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring cursor-pointer min-w-[130px]"
                    >
                        <option value="">All Intervals</option>
                        <option value="MONTHLY">Monthly</option>
                        <option value="YEARLY">Yearly</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="DAILY">Daily</option>
                        <option value="LIFETIME">Lifetime</option>
                        <option value="CUSTOM">Custom</option>
                    </select>

                    <select
                        value={filters.status || ''}
                        onChange={handleStatusChange}
                        className="h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring cursor-pointer min-w-[120px]"
                    >
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </DataTable>
            </div>

            {/* Modals */}
            <CreatePlanModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
            />
            <EditPlanModal
                plan={editPlan}
                open={!!editPlan}
                onClose={() => setEditPlan(null)}
            />
            <ViewPlanModal
                plan={viewPlan}
                open={!!viewPlan}
                onClose={() => setViewPlan(null)}
            />
            <DeletePlanModal
                plan={deletePlan}
                open={!!deletePlan}
                onClose={() => setDeletePlan(null)}
            />
        </>
    );
}
