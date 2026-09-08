import { Head, router, useForm } from '@inertiajs/react';
import {
    Mail,
    UserCheck,
    UserX,
    Megaphone,
    Plus,
    Download,
    Trash2,
    Search,
    Send,
    Loader2,
    ShieldCheck,
    Users,
    Eye,
    Filter,
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

type Subscriber = {
    id: number;
    email: string;
    name: string | null;
    status: 'subscribed' | 'unsubscribed';
    source: string;
    ip_address?: string | null;
    created_at: string;
    subscribed_at?: string | null;
};

type Campaign = {
    id: number;
    subject: string;
    content: string;
    recipients_count: number;
    status: string;
    sent_at: string;
};

type Props = {
    subscribers: {
        data: Subscriber[];
        links: any[];
        total: number;
    };
    stats: {
        total: number;
        subscribed: number;
        unsubscribed: number;
        campaigns: number;
    };
    recentCampaigns: Campaign[];
    filters: {
        search?: string;
        status?: string;
    };
};

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

export default function NewsletterIndex({
    subscribers,
    stats,
    recentCampaigns,
    filters,
}: Props) {
    const [activeTab, setActiveTab] = useState<'subscribers' | 'campaigns'>('subscribers');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);
    const [viewCampaign, setViewCampaign] = useState<Campaign | null>(null);
    const [deleteSub, setDeleteSub] = useState<Subscriber | null>(null);

    // Add Subscriber Form
    const addForm = useForm({
        email: '',
        name: '',
        source: 'Admin Panel',
    });

    // Broadcast Form
    const broadcastForm = useForm({
        subject: '',
        content: '',
    });

    const handleAddSubscriber = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post('/newsletter/subscribers', {
            preserveScroll: true,
            onSuccess: () => {
                addForm.reset();
                setShowAddModal(false);
            },
        });
    };

    const handleBroadcastSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        broadcastForm.post('/newsletter/broadcast', {
            preserveScroll: true,
            onSuccess: () => {
                broadcastForm.reset();
                setShowBroadcastModal(false);
            },
        });
    };

    const handleToggleStatus = (id: number) => {
        router.post(`/newsletter/subscribers/${id}/toggle`, {}, { preserveScroll: true });
    };

    const handleDeleteConfirm = () => {
        if (!deleteSub) return;
        router.delete(`/newsletter/subscribers/${deleteSub.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteSub(null),
        });
    };

    const handleStatusFilter = (statusVal: string) => {
        router.get(
            '/newsletter',
            {
                search: filters?.search || undefined,
                status: statusVal === 'all' ? undefined : statusVal,
            },
            { preserveState: true },
        );
    };

    const subscriberColumns = [
        {
            key: 'sl',
            title: '#',
            render: (row: Subscriber) => {
                const index = subscribers.data.findIndex((s) => s.id === row.id);
                return <span className="text-xs text-muted-foreground font-medium">{index + 1}</span>;
            },
        },
        {
            key: 'email',
            title: 'Subscriber',
            render: (row: Subscriber) => {
                return (
                    <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#0EADAB]/15 text-[#0EADAB] font-bold text-xs">
                            <Mail className="size-4" />
                        </div>
                        <div>
                            <p className="font-semibold text-xs text-foreground">{row.email}</p>
                            {row.name && (
                                <p className="text-[11px] text-muted-foreground">{row.name}</p>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'status',
            title: 'Status',
            render: (row: Subscriber) => {
                const isSubbed = row.status === 'subscribed';
                return (
                    <button
                        type="button"
                        onClick={() => handleToggleStatus(row.id)}
                        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border transition-all ${
                            isSubbed
                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                                : 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20'
                        }`}
                        title="Click to toggle status"
                    >
                        <span className={`size-1.5 rounded-full ${isSubbed ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {isSubbed ? 'Subscribed' : 'Unsubscribed'}
                    </button>
                );
            },
        },
        {
            key: 'source',
            title: 'Source',
            render: (row: Subscriber) => (
                <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                    {row.source || 'Website'}
                </span>
            ),
        },
        {
            key: 'subscribed_at',
            title: 'Date Joined',
            render: (row: Subscriber) => (
                <span className="text-xs text-muted-foreground">
                    {row.subscribed_at ? new Date(row.subscribed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
            ),
        },
        {
            key: 'actions',
            title: 'Actions',
            render: (row: Subscriber) => (
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteSub(row)}
                        title="Delete subscriber"
                    >
                        <Trash2 className="size-3.5" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Newsletter Management" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* ───────────────────── HEADER & ACTIONS ───────────────────── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-in fade-in slide-in-from-top-4 duration-500">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-[#0EADAB]/15 text-[#0EADAB]">
                                <Mail className="size-5" />
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Newsletter Management
                            </h1>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manage audience subscribers, monitor campaigns, and send email broadcasts.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <a
                            href="/newsletter/export"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-sidebar-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground transition-all hover:bg-accent shadow-2xs"
                        >
                            <Download className="size-3.5 text-[#0EADAB]" />
                            <span>Export CSV</span>
                        </a>

                        <button
                            type="button"
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#0EADAB]/30 bg-[#0EADAB]/10 px-3.5 py-2 text-xs font-semibold text-[#0EADAB] transition-all hover:bg-[#0EADAB]/20 shadow-2xs"
                        >
                            <Plus className="size-3.5" />
                            <span>Add Subscriber</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowBroadcastModal(true)}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#0EADAB] hover:bg-[#0c9694] px-4 py-2 text-xs font-semibold text-white transition-all shadow-xs"
                        >
                            <Megaphone className="size-3.5" />
                            <span>Broadcast Campaign</span>
                        </button>
                    </div>
                </div>

                {/* ───────────────────── STATS CARDS ───────────────────── */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <StatCard
                        title="Total Subscribers"
                        value={stats.total}
                        icon={<Users className="size-5 text-purple-600 dark:text-purple-400" />}
                        accent="bg-purple-500/10"
                    />
                    <StatCard
                        title="Active Subscribed"
                        value={stats.subscribed}
                        icon={<UserCheck className="size-5 text-emerald-600 dark:text-emerald-400" />}
                        accent="bg-emerald-500/10"
                    />
                    <StatCard
                        title="Unsubscribed"
                        value={stats.unsubscribed}
                        icon={<UserX className="size-5 text-rose-600 dark:text-rose-400" />}
                        accent="bg-rose-500/10"
                    />
                    <StatCard
                        title="Broadcasts Sent"
                        value={stats.campaigns}
                        icon={<Megaphone className="size-5 text-[#0EADAB]" />}
                        accent="bg-[#0EADAB]/10"
                    />
                </div>

                {/* ───────────────────── SAFETY & SANITIZER BADGE ───────────────────── */}
                <div className="flex items-center justify-between rounded-xl border border-[#0EADAB]/30 bg-[#0EADAB]/5 p-3.5 text-xs text-foreground">
                    <div className="flex items-center gap-2.5">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-[#0EADAB]/20 text-[#0EADAB]">
                            <ShieldCheck className="size-4" />
                        </div>
                        <div>
                            <span className="font-semibold text-foreground">Email Sanitizer & Safety Guard Active:</span>{' '}
                            <span className="text-muted-foreground">
                                Test accounts and dummy emails (like user@user.com, admin@admin.com, test@gmail.com) are automatically blocked from receiving outgoing emails.
                            </span>
                        </div>
                    </div>
                </div>

                {/* ───────────────────── TABS & FILTER BAR ───────────────────── */}
                <div className="flex items-center justify-between border-b border-sidebar-border pb-3 flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab('subscribers')}
                            className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                                activeTab === 'subscribers'
                                    ? 'bg-[#0EADAB] text-white shadow-xs'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            <Users className="size-3.5" />
                            <span>Subscribers Directory ({stats.total})</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('campaigns')}
                            className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                                activeTab === 'campaigns'
                                    ? 'bg-[#0EADAB] text-white shadow-xs'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            <Megaphone className="size-3.5" />
                            <span>Campaign History ({recentCampaigns.length})</span>
                        </button>
                    </div>

                    {activeTab === 'subscribers' && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                                <Filter className="size-3" /> Status:
                            </span>
                            {(['all', 'subscribed', 'unsubscribed'] as const).map((st) => (
                                <button
                                    key={st}
                                    type="button"
                                    onClick={() => handleStatusFilter(st)}
                                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition-all cursor-pointer border ${
                                        (filters.status || 'all') === st
                                            ? 'bg-foreground text-background border-foreground'
                                            : 'bg-card text-muted-foreground border-border hover:bg-accent'
                                    }`}
                                >
                                    {st}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ───────────────────── TAB 1: SUBSCRIBERS TABLE ───────────────────── */}
                {activeTab === 'subscribers' && (
                    <div className="rounded-2xl border border-sidebar-border bg-card p-4 shadow-2xs animate-in fade-in duration-300">
                        <DataTable<Subscriber>
                            columns={subscriberColumns}
                            data={subscribers.data}
                            meta={{ links: subscribers.links }}
                            filters={filters}
                            placeholder="Search by email, name, source..."
                        />
                    </div>
                )}

                {/* ───────────────────── TAB 2: CAMPAIGN HISTORY ───────────────────── */}
                {activeTab === 'campaigns' && (
                    <div className="rounded-2xl border border-sidebar-border bg-card p-5 shadow-2xs animate-in fade-in duration-300">
                        {recentCampaigns.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground text-sm">
                                <Megaphone className="mx-auto size-8 text-muted-foreground/50 mb-2" />
                                No broadcast campaigns sent yet. Click &quot;Broadcast Campaign&quot; to send your first newsletter.
                            </div>
                        ) : (
                            <div className="divide-y divide-border/40">
                                {recentCampaigns.map((camp) => (
                                    <div
                                        key={camp.id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm text-foreground">
                                                    {camp.subject}
                                                </span>
                                                <span className="inline-flex items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[11px] font-semibold border border-emerald-500/20">
                                                    {camp.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-xl">
                                                {camp.content}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4 text-xs shrink-0">
                                            <div className="text-right">
                                                <p className="font-semibold text-foreground">
                                                    {camp.recipients_count} Recipients
                                                </p>
                                                <p className="text-muted-foreground text-[11px]">{camp.sent_at}</p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-1.5 text-xs rounded-xl"
                                                onClick={() => setViewCampaign(camp)}
                                            >
                                                <Eye className="size-3.5 text-[#0EADAB]" />
                                                View
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ───────────────────── MODAL: ADD SUBSCRIBER ───────────────────── */}
                <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                    <DialogContent className="max-w-md rounded-2xl">
                        <DialogHeader>
                            <div className="flex items-center gap-2.5">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-[#0EADAB]/15 text-[#0EADAB]">
                                    <Plus className="size-4" />
                                </div>
                                <DialogTitle>Add Newsletter Subscriber</DialogTitle>
                            </div>
                            <DialogDescription>
                                Add a new email recipient directly into the newsletter subscription list.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleAddSubscriber} className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="sub-email">
                                    Email Address <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="sub-email"
                                    type="email"
                                    required
                                    placeholder="audience@example.com"
                                    value={addForm.data.email}
                                    onChange={(e) => addForm.setData('email', e.target.value)}
                                />
                                {addForm.errors.email && (
                                    <p className="text-xs text-destructive">{addForm.errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="sub-name">Subscriber Name (Optional)</Label>
                                <Input
                                    id="sub-name"
                                    placeholder="John Doe"
                                    value={addForm.data.name}
                                    onChange={(e) => addForm.setData('name', e.target.value)}
                                />
                                {addForm.errors.name && (
                                    <p className="text-xs text-destructive">{addForm.errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="sub-source">Subscription Source</Label>
                                <Input
                                    id="sub-source"
                                    placeholder="Admin Panel, Lead Magnet, etc."
                                    value={addForm.data.source}
                                    onChange={(e) => addForm.setData('source', e.target.value)}
                                />
                            </div>

                            <DialogFooter className="pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={addForm.processing || !addForm.data.email}
                                    className="bg-[#0EADAB] hover:bg-[#0c9694] text-white"
                                >
                                    {addForm.processing && <Loader2 className="mr-2 size-3.5 animate-spin" />}
                                    Add Subscriber
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* ───────────────────── MODAL: BROADCAST CAMPAIGN ───────────────────── */}
                <Dialog open={showBroadcastModal} onOpenChange={setShowBroadcastModal}>
                    <DialogContent className="max-w-lg rounded-2xl">
                        <DialogHeader>
                            <div className="flex items-center gap-2.5">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-[#0EADAB]/15 text-[#0EADAB]">
                                    <Megaphone className="size-4" />
                                </div>
                                <div>
                                    <DialogTitle>Broadcast Newsletter Campaign</DialogTitle>
                                    <DialogDescription className="text-xs">
                                        Send email blast to {stats.subscribed} active subscribers
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <form onSubmit={handleBroadcastSubmit} className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="camp-subject">
                                    Subject Line <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="camp-subject"
                                    required
                                    placeholder="e.g. Bryce Lowe Platform Updates & Feature Highlights"
                                    value={broadcastForm.data.subject}
                                    onChange={(e) => broadcastForm.setData('subject', e.target.value)}
                                />
                                {broadcastForm.errors.subject && (
                                    <p className="text-xs text-destructive">{broadcastForm.errors.subject}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="camp-content">
                                    Email Message Content <span className="text-destructive">*</span>
                                </Label>
                                <textarea
                                    id="camp-content"
                                    rows={6}
                                    required
                                    placeholder="Write your email body content here..."
                                    value={broadcastForm.data.content}
                                    onChange={(e) => broadcastForm.setData('content', e.target.value)}
                                    className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground focus:border-[#0EADAB] focus:ring-2 focus:ring-[#0EADAB]/20 focus:outline-none"
                                />
                                {broadcastForm.errors.content && (
                                    <p className="text-xs text-destructive">{broadcastForm.errors.content}</p>
                                )}
                            </div>

                            <div className="rounded-xl border border-border/80 bg-muted/30 p-3 text-[11px] text-muted-foreground flex items-center gap-2">
                                <ShieldCheck className="size-4 text-[#0EADAB] shrink-0" />
                                <span>
                                    <strong>Sanitization Guaranteed:</strong> Dummy or test email addresses are automatically filtered out and safely skipped.
                                </span>
                            </div>

                            <DialogFooter className="pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowBroadcastModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={
                                        broadcastForm.processing ||
                                        !broadcastForm.data.subject ||
                                        !broadcastForm.data.content
                                    }
                                    className="bg-[#0EADAB] hover:bg-[#0c9694] text-white"
                                >
                                    {broadcastForm.processing ? (
                                        <>
                                            <Loader2 className="mr-2 size-3.5 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 size-3.5" />
                                            Send Broadcast
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* ───────────────────── MODAL: VIEW CAMPAIGN ───────────────────── */}
                {viewCampaign && (
                    <Dialog open={!!viewCampaign} onOpenChange={() => setViewCampaign(null)}>
                        <DialogContent className="max-w-lg rounded-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-base">{viewCampaign.subject}</DialogTitle>
                                <DialogDescription className="text-xs">
                                    Sent to {viewCampaign.recipients_count} subscribers on {viewCampaign.sent_at}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="my-2 max-h-60 overflow-y-auto rounded-xl border border-border bg-muted/20 p-4 text-xs whitespace-pre-wrap text-foreground">
                                {viewCampaign.content}
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setViewCampaign(null)}
                                >
                                    Close
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}

                {/* ───────────────────── MODAL: DELETE CONFIRMATION ───────────────────── */}
                <Dialog open={!!deleteSub} onOpenChange={() => setDeleteSub(null)}>
                    <DialogContent className="max-w-md rounded-2xl">
                        <DialogHeader>
                            <DialogTitle>Remove Subscriber</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to remove{' '}
                                <span className="font-semibold text-foreground">{deleteSub?.email}</span> from the newsletter audience list?
                            </DialogDescription>
                        </DialogHeader>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDeleteSub(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDeleteConfirm}
                            >
                                Delete Subscriber
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

NewsletterIndex.layout = {
    breadcrumbs: [{ title: 'Newsletter', href: '/newsletter' }],
};
