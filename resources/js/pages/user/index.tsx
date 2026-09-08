import { Head, router, useForm } from '@inertiajs/react';
import { Users, UserCheck, Shield, Building2, UserPlus, Pencil, Trash2, Plus, Download, Eye } from 'lucide-react';
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
import type { User } from '@/types/user';

type Props = {
    users: {
        data: User[];
        links: any[];
    };
    analytics: {
        total_users: number;
        active_users: number;
        total_admins: number;
        total_partners: number;
        total_customers: number;
        new_this_month: number;
    };
    filters: {
        search?: string;
        sort_by?: string;
        sort_order?: string;
        role?: string;
    };
};

const formatPhone = (phone?: string | number | null): string => {
    if (!phone) return '';
    const str = String(phone).replace(/\s+/g, '');
    if (/^[1-9]\d{9}$/.test(str)) {
        return '0' + str;
    }
    return String(phone);
};

// --- Analytics Card ---
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

// --- Create User Modal ---
function CreateUserModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const form = useForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'User',
        status: 'Active',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/user/store', {
            onSuccess: () => {
                form.reset();
                onClose();
            },

            // onError: () => {
            //     toast.error('Failed to create user');
            // },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to create a new user account.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="create-name">Name</Label>
                        <Input
                            id="create-name"
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData('name', e.target.value)
                            }
                            placeholder="Full name"
                        />
                        {form.errors.name && (
                            <p className="text-xs text-destructive">
                                {form.errors.name}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="create-email">Email</Label>
                        <Input
                            id="create-email"
                            type="email"
                            value={form.data.email}
                            onChange={(e) =>
                                form.setData('email', e.target.value)
                            }
                            placeholder="user@example.com"
                        />
                        {form.errors.email && (
                            <p className="text-xs text-destructive">
                                {form.errors.email}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="create-password">Password</Label>
                        <Input
                            id="create-password"
                            type="password"
                            value={form.data.password}
                            onChange={(e) =>
                                form.setData('password', e.target.value)
                            }
                            placeholder="Minimum 6 characters"
                        />
                        {form.errors.password && (
                            <p className="text-xs text-destructive">
                                {form.errors.password}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="create-phone">Phone</Label>
                        <Input
                            id="create-phone"
                            value={form.data.phone}
                            onChange={(e) =>
                                form.setData('phone', e.target.value)
                            }
                            placeholder="Optional"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="create-role">Role</Label>
                            <select
                                id="create-role"
                                value={form.data.role}
                                onChange={(e) =>
                                    form.setData('role', e.target.value)
                                }
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="">Select Role</option>
                                <option value="User">User</option>
                                <option value="Admin">Admin</option>
                                <option value="Partner">Partner</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="create-status">Status</Label>
                            <select
                                id="create-status"
                                value={form.data.status}
                                onChange={(e) =>
                                    form.setData('status', e.target.value)
                                }
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Banned">Banned</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? 'Creating...' : 'Create User'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// --- Edit User Modal ---
function EditUserModal({
    user,
    open,
    onClose,
}: {
    user: User | null;
    open: boolean;
    onClose: () => void;
}) {
    const form = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        phone: user?.phone ?? '',
        password: '',
        role: user?.role ?? 'User',
        status: user?.status ?? 'Active',
    });

    // Sync form when user changes
    const prevUserId = useState<number | null>(null);

    if (user && user.id !== prevUserId[0]) {
        prevUserId[1](user.id);
        form.setData({
            name: user.name,
            email: user.email,
            phone: user.phone ?? '',
            password: '',
            role: user.role ?? 'User',
            status: user.status ?? 'Active',
        });
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            return;
        }

        form.patch(`/user/update/${user.id}`, {
            onSuccess: () => {
                // toast.success('User updated successfully');

                form.reset();
                onClose();
            },

            // onError: () => {
            //     toast.error('Failed to create user');
            // },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>
                        Update the user details below.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-name">Name</Label>
                        <Input
                            id="edit-name"
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData('name', e.target.value)
                            }
                        />
                        {form.errors.name && (
                            <p className="text-xs text-destructive">
                                {form.errors.name}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-email">Email</Label>
                        <Input
                            id="edit-email"
                            type="email"
                            value={form.data.email}
                            onChange={(e) =>
                                form.setData('email', e.target.value)
                            }
                        />
                        {form.errors.email && (
                            <p className="text-xs text-destructive">
                                {form.errors.email}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-password">Password</Label>
                        <Input
                            id="edit-password"
                            type="password"
                            value={form.data.password}
                            onChange={(e) =>
                                form.setData('password', e.target.value)
                            }
                            placeholder="Leave empty to keep current"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-phone">Phone</Label>
                        <Input
                            id="edit-phone"
                            value={form.data.phone}
                            onChange={(e) =>
                                form.setData('phone', e.target.value)
                            }
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-role">Role</Label>
                            <select
                                id="edit-role"
                                value={form.data.role}
                                onChange={(e) =>
                                    form.setData('role', e.target.value)
                                }
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="">Select Role</option>
                                <option value="User">User</option>
                                <option value="Admin">Admin</option>
                                <option value="Partner">Partner</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-status">Status</Label>
                            <select
                                id="edit-status"
                                value={form.data.status}
                                onChange={(e) =>
                                    form.setData('status', e.target.value)
                                }
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Banned">Banned</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
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

// --- Delete Confirmation Modal ---
function DeleteUserModal({
    user,
    open,
    onClose,
}: {
    user: User | null;
    open: boolean;
    onClose: () => void;
}) {
    const [processing, setProcessing] = useState(false);

    const handleDelete = () => {
        if (!user) {
            return;
        }

        setProcessing(true);

        router.delete(`/user/destroy/${user.id}`, {
            onSuccess: () => {
                // toast.success('User deleted successfully');
                onClose();
            },

            // onError: () => {
            //     toast.error('Failed to create user');
            // },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete User</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete{' '}
                        <span className="font-semibold text-foreground">
                            {user?.name}
                        </span>
                        ? This action cannot be undone.
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
                        {processing ? 'Deleting...' : 'Delete User'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

const getSubscriptionStatus = (user: User) => {
    if (!user.subscriptions || user.subscriptions.length === 0) {
        return { hasPlan: false, planName: 'None', status: 'None', isActive: false };
    }

    // Find first active subscription if any exists
    const activeSub = user.subscriptions.find(sub => {
        const isStatusActive = sub.stripe_status === 'active';
        const endsAtDate = sub.ends_at ? new Date(sub.ends_at) : null;
        const isFuture = endsAtDate ? endsAtDate > new Date() : false;
        return isStatusActive && isFuture;
    });

    if (activeSub) {
        return {
            hasPlan: true,
            planName: activeSub.type || 'Standard',
            status: 'Active',
            isActive: true
        };
    }

    // Fallback to the latest non-active subscription if any exists
    const latestSub = user.subscriptions[0];
    let statusText = 'Expired';
    if (latestSub.stripe_status === 'canceled') statusText = 'Canceled';
    else if (latestSub.stripe_status === 'unpaid') statusText = 'Unpaid';

    return {
        hasPlan: true,
        planName: latestSub.type || 'Standard',
        status: statusText,
        isActive: false
    };
};

// --- Subscription History Modal ---
function SubscriptionHistoryModal({
    user,
    open,
    onClose,
}: {
    user: User | null;
    open: boolean;
    onClose: () => void;
}) {
    if (!user) return null;

    const subs = user.subscriptions ?? [];

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader className="sr-only">
                    <DialogTitle>User Profile & Subscription History</DialogTitle>
                    <DialogDescription>
                        Detailed profile details and subscription purchases.
                    </DialogDescription>
                </DialogHeader>

                {/* Profile Header with Avatar */}
                <div className="flex items-center gap-4 border-b border-border pb-4">
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="size-14 rounded-full object-cover border border-border shadow-sm"
                        />
                    ) : (
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-lg font-bold border border-border shadow-sm">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <h2 className="text-lg font-bold text-foreground">
                            {user.name}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {user.email}
                        </p>
                    </div>
                </div>

                {/* User Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-border bg-muted/20 text-sm mt-2">
                    <div>
                        <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Role</span>
                        <span className="font-medium text-foreground mt-0.5 block">{user.role ?? 'User'}</span>
                    </div>
                    <div>
                        <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mt-0.5 ${
                            user.status === 'Active'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-red-500/10 text-red-600 dark:text-red-400'
                        }`}>
                            {user.status ?? 'Active'}
                        </span>
                    </div>
                    <div>
                        <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Points Balance</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400 mt-0.5 block">
                            {user.points ?? 0} pts (€{Number(user.points ?? 0).toFixed(2)})
                        </span>
                    </div>
                    <div>
                        <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Phone</span>
                        <span className="text-foreground mt-0.5 block">{user.phone ? formatPhone(user.phone) : '—'}</span>
                    </div>
                    <div>
                        <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Registered</span>
                        <span className="text-xs text-muted-foreground mt-0.5 block">
                            {user.created_at
                                ? new Date(user.created_at).toLocaleDateString('en-GB', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                  })
                                : '—'}
                        </span>
                    </div>
                    <div>
                        <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Last Login</span>
                        <span className="text-xs text-muted-foreground mt-0.5 block">
                            {user.last_login_at
                                ? new Date(user.last_login_at).toLocaleDateString('en-GB', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                  })
                                : '—'}
                        </span>
                    </div>
                </div>

                <div className="space-y-3 mt-4">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider px-1">Subscription History</h3>
                    {subs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                            No subscription history found for this user.
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-lg border border-border">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="bg-muted/50 border-b border-border">
                                        <th className="p-3 font-semibold text-muted-foreground text-xs uppercase">Membership ID</th>
                                        <th className="p-3 font-semibold text-muted-foreground text-xs uppercase">Type / Plan</th>
                                        <th className="p-3 font-semibold text-muted-foreground text-xs uppercase">Quantity</th>
                                        <th className="p-3 font-semibold text-muted-foreground text-xs uppercase">Status</th>
                                        <th className="p-3 font-semibold text-muted-foreground text-xs uppercase">Valid Till</th>
                                        <th className="p-3 font-semibold text-muted-foreground text-xs uppercase">Purchased</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {subs.map((sub) => {
                                        const endsAtDate = sub.ends_at ? new Date(sub.ends_at) : null;
                                        const isStatusActive = sub.stripe_status === 'active';
                                        const isActive = isStatusActive && (endsAtDate ? endsAtDate > new Date() : false);

                                        let statusLabel = 'Expired';
                                        if (isActive) statusLabel = 'Active';
                                        else if (sub.stripe_status === 'canceled') statusLabel = 'Canceled';
                                        else if (sub.stripe_status === 'unpaid') statusLabel = 'Unpaid';

                                        return (
                                            <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="p-3 font-mono text-xs">{sub.membership_id || `SUB-${sub.id}`}</td>
                                                <td className="p-3 font-medium text-foreground">{sub.type}</td>
                                                <td className="p-3">{sub.quantity ?? 1}</td>
                                                <td className="p-3">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                            isActive
                                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                                : 'bg-red-500/10 text-red-600 dark:text-red-400'
                                                        }`}
                                                    >
                                                        {statusLabel}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-xs text-muted-foreground">
                                                    {sub.ends_at
                                                        ? new Date(sub.ends_at).toLocaleDateString('en-GB', {
                                                              day: '2-digit',
                                                              month: 'short',
                                                              year: 'numeric',
                                                          })
                                                        : '—'}
                                                </td>
                                                <td className="p-3 text-xs text-muted-foreground">
                                                    {new Date(sub.created_at).toLocaleDateString('en-GB', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
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

// --- Main Page ---
export default function UsersPage({ users, analytics, filters }: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [deleteUser, setDeleteUser] = useState<User | null>(null);
    const [viewingUserSubscriptions, setViewingUserSubscriptions] = useState<User | null>(null);

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get(
            window.location.pathname,
            {
                ...filters,
                role: e.target.value,
                page: 1,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const columns = [
        {
            key: 'sl',
            title: '#',
            render: (row: User) => {
                const index = users.data.findIndex(
                    (item) => item.id === row.id,
                );

                return (
                    <span className="text-muted-foreground">{index + 1}</span>
                );
            },
        },
        { key: 'name', title: 'Name' },
        { key: 'email', title: 'Email' },
        { key: 'role', title: 'Role' },
        {
            key: 'subscription',
            title: 'Plan / Subscription',
            sortable: false,
            render: (row: User) => {
                const subInfo = getSubscriptionStatus(row);
                return (
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-foreground">
                            {subInfo.planName}
                        </span>
                        <span
                            className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-semibold mt-0.5 ${
                                subInfo.isActive
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    : subInfo.hasPlan
                                      ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                                      : 'bg-muted text-muted-foreground'
                            }`}
                        >
                            {subInfo.hasPlan ? subInfo.status : 'No Plan'}
                        </span>
                    </div>
                );
            }
        },
        {
            key: 'points',
            title: 'Points Balance',
            sortable: true,
            render: (row: User) => (
                <span className="font-semibold text-xs text-amber-600 dark:text-amber-400">
                    {row.points ?? 0} pts (€{Number(row.points ?? 0).toFixed(2)})
                </span>
            ),
        },
        {
            key: 'phone',
            title: 'Phone',
            render: (row: User) => (
                <span className="text-xs text-muted-foreground">
                    {row.phone ? formatPhone(row.phone) : '—'}
                </span>
            ),
        },
        {
            key: 'created_at',
            title: 'Registered',
            render: (row: User) => (
                <span className="text-xs text-muted-foreground">
                    {row.created_at
                        ? new Date(row.created_at).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                            })
                        : '—'}
                </span>
            ),
        },
        // {
        //     key: 'orders_count',
        //     title: 'Orders',
        //     render: (row: User) => (
        //         <span className="font-semibold text-xs text-foreground">
        //             {row.orders_count ?? 0}
        //         </span>
        //     ),
        // },
        // {
        //     key: 'orders_sum_total',
        //     title: 'Total Value',
        //     render: (row: User) => (
        //         <span className="font-bold text-xs text-violet-600 dark:text-violet-400">
        //             £{row.orders_sum_total ? Number(row.orders_sum_total).toFixed(2) : '0.00'}
        //         </span>
        //     ),
        // },
        // {
        //     key: 'status',
        // ...
        // },
        {
            key: 'status',
            title: 'Status',
            sortable: false,
            render: (row: User) => (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        row.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : row.status === 'Banned'
                              ? 'bg-gray-500/10 text-gray-600'
                              : 'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}
                >
                    {row.status ?? 'Active'}
                </span>
            ),
        },
        {
            key: 'action',
            title: 'Actions',
            sortable: false,
            render: (row: User) => (
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-primary"
                        onClick={() => setViewingUserSubscriptions(row)}
                        title="View Subscription History"
                    >
                        <Eye className="size-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-primary"
                        onClick={() => setEditUser(row)}
                    >
                        <Pencil className="size-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteUser(row)}
                    >
                        <Trash2 className="size-3.5" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Users" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Users
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage your users and their account details.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <a href="/users/export?format=csv" download>
                            <Button variant="outline" className="gap-2">
                                <Download className="size-4" />
                                Export CSV
                            </Button>
                        </a>
                        <a href="/users/export?format=xlsx" download>
                            <Button variant="outline" className="gap-2">
                                <Download className="size-4" />
                                Export Excel
                            </Button>
                        </a>
                        <Button
                            onClick={() => setCreateOpen(true)}
                            className="gap-2"
                        >
                            <Plus className="size-4" />
                            Add User
                        </Button>
                    </div>
                </div>

                {/* Analytics Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <StatCard
                        title="Total Users"
                        value={analytics.total_users}
                        icon={
                            <Users className="size-5 text-violet-600 dark:text-violet-400" />
                        }
                        accent="bg-violet-500/10"
                    />
                    <StatCard
                        title="Active Users"
                        value={analytics.active_users}
                        icon={
                            <UserCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
                        }
                        accent="bg-emerald-500/10"
                    />
                    <StatCard
                        title="Admins"
                        value={analytics.total_admins}
                        icon={
                            <Shield className="size-5 text-amber-600 dark:text-amber-400" />
                        }
                        accent="bg-amber-500/10"
                    />
                    <StatCard
                        title="Partners"
                        value={analytics.total_partners}
                        icon={
                            <Building2 className="size-5 text-cyan-600 dark:text-cyan-400" />
                        }
                        accent="bg-cyan-500/10"
                    />
                    <StatCard
                        title="New This Month"
                        value={analytics.new_this_month}
                        icon={
                            <UserPlus className="size-5 text-indigo-600 dark:text-indigo-400" />
                        }
                        accent="bg-indigo-500/10"
                    />
                </div>

                {/* Data Table */}
                <DataTable<User>
                    columns={columns}
                    data={users.data}
                    meta={{ links: users.links }}
                    filters={filters}
                >
                    <select
                        value={filters.role || ''}
                        onChange={handleRoleChange}
                        className="h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring cursor-pointer min-w-[120px]"
                    >
                        <option value="">All Roles</option>
                        <option value="User">User</option>
                        <option value="Admin">Admin</option>
                        <option value="Partner">Partner</option>
                    </select>
                </DataTable>
            </div>

            {/* Modals */}
            <CreateUserModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
            />
            <EditUserModal
                user={editUser}
                open={!!editUser}
                onClose={() => setEditUser(null)}
            />
            <DeleteUserModal
                user={deleteUser}
                open={!!deleteUser}
                onClose={() => setDeleteUser(null)}
            />
            <SubscriptionHistoryModal
                user={viewingUserSubscriptions}
                open={!!viewingUserSubscriptions}
                onClose={() => setViewingUserSubscriptions(null)}
            />
        </>
    );
}

UsersPage.layout = {
    breadcrumbs: [{ title: 'Users', href: '/user' }],
};
