import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    Download,
    Eye,
    FileText,
    FolderPlus,
    Inbox,
    Layers,
    LifeBuoy,
    Paperclip,
    Pencil,
    Plus,
    Search,
    ShieldAlert,
    Tag,
    Trash2,
    UploadCloud,
    User as UserIcon,
    X,
    XCircle,
    Zap,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
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
import {
    Ticket,
    TicketCategory,
    TicketPriority,
    TicketStatus,
} from '@/types/ticket';

type UserOption = {
    id: number;
    name: string;
    email: string;
};

type Props = {
    tickets: {
        data: Ticket[];
        links: any[];
    };
    analytics: {
        total: number;
        open: number;
        in_progress: number;
        resolved: number;
        urgent: number;
    };
    users: UserOption[];
    filters: {
        search?: string;
        category?: string;
        priority?: string;
        status?: string;
    };
};

const CATEGORY_COLORS: Record<TicketCategory, string> = {
    TECHNICAL: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
    BILLING: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    ACCOUNT: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    GENERAL: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20',
    FEATURE_REQUEST: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
};

const PRIORITY_BADGES: Record<TicketPriority, { label: string; class: string }> = {
    LOW: { label: 'Low', class: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' },
    MEDIUM: { label: 'Medium', class: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    HIGH: { label: 'High', class: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    URGENT: { label: 'Urgent', class: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 animate-pulse' },
};

const STATUS_BADGES: Record<TicketStatus, { label: string; class: string }> = {
    OPEN: { label: 'Open', class: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    IN_PROGRESS: { label: 'In Progress', class: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    RESOLVED: { label: 'Resolved', class: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    CLOSED: { label: 'Closed', class: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' },
    PENDING: { label: 'Pending', class: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
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
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
                </div>
                <div className={`flex size-11 items-center justify-center rounded-lg ${accent}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

// --- Create Ticket Modal ---
function CreateTicketModal({
    open,
    onClose,
    users,
}: {
    open: boolean;
    onClose: () => void;
    users: UserOption[];
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const form = useForm({
        user_id: users.length > 0 ? users[0].id : '',
        category: 'GENERAL' as TicketCategory,
        priority: 'MEDIUM' as TicketPriority,
        subject: '',
        message: '',
        status: 'OPEN' as TicketStatus,
        files: [] as File[],
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArr = Array.from(e.target.files);
            setSelectedFiles((prev) => [...prev, ...filesArr]);
            form.setData('files', [...selectedFiles, ...filesArr]);
        }
    };

    const handleRemoveFile = (index: number) => {
        const updated = [...selectedFiles];
        updated.splice(index, 1);
        setSelectedFiles(updated);
        form.setData('files', updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/ticket/store', {
            forceFormData: true,
            onSuccess: () => {
                form.reset();
                setSelectedFiles([]);
                onClose();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Open New Support Ticket</DialogTitle>
                    <DialogDescription>
                        Create a support ticket on behalf of a user or system issue.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="create-ticket-user">Requester User *</Label>
                            <select
                                id="create-ticket-user"
                                value={form.data.user_id}
                                onChange={(e) => form.setData('user_id', Number(e.target.value))}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-ring focus:ring-1 focus:ring-ring"
                                required
                            >
                                <option value="" disabled>Select User</option>
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

                        <div className="space-y-2">
                            <Label htmlFor="create-ticket-category">Category *</Label>
                            <select
                                id="create-ticket-category"
                                value={form.data.category}
                                onChange={(e) => form.setData('category', e.target.value as TicketCategory)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-ring focus:ring-1 focus:ring-ring"
                            >
                                <option value="GENERAL">General Support</option>
                                <option value="TECHNICAL">Technical Issue</option>
                                <option value="BILLING">Billing & Subscription</option>
                                <option value="ACCOUNT">Account Access</option>
                                <option value="FEATURE_REQUEST">Feature Request</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-ticket-priority">Priority *</Label>
                            <select
                                id="create-ticket-priority"
                                value={form.data.priority}
                                onChange={(e) => form.setData('priority', e.target.value as TicketPriority)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-ring focus:ring-1 focus:ring-ring"
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent 🔥</option>
                            </select>
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="create-ticket-subject">Subject *</Label>
                            <Input
                                id="create-ticket-subject"
                                value={form.data.subject}
                                onChange={(e) => form.setData('subject', e.target.value)}
                                placeholder="Brief summary of the issue..."
                                required
                            />
                            {form.errors.subject && (
                                <p className="text-xs text-destructive">{form.errors.subject}</p>
                            )}
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="create-ticket-message">Detailed Message *</Label>
                            <textarea
                                id="create-ticket-message"
                                value={form.data.message}
                                onChange={(e) => form.setData('message', e.target.value)}
                                placeholder="Describe the problem, steps to reproduce, or requested assistance..."
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                rows={4}
                                required
                            />
                            {form.errors.message && (
                                <p className="text-xs text-destructive">{form.errors.message}</p>
                            )}
                        </div>

                        {/* File Attachments */}
                        <div className="space-y-2 sm:col-span-2">
                            <Label>Attachments (Screenshots / Logs / Documents)</Label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border p-4 transition-colors hover:border-primary/50 hover:bg-muted/30"
                            >
                                <UploadCloud className="size-6 text-muted-foreground" />
                                <span className="mt-1 text-xs font-medium text-foreground">
                                    Click to browse files
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                    Images, PDF, TXT, LOG up to 10MB
                                </span>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>

                            {selectedFiles.length > 0 && (
                                <div className="mt-2 space-y-1.5">
                                    {selectedFiles.map((file, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-1.5 text-xs"
                                        >
                                            <div className="flex items-center gap-2 truncate">
                                                <Paperclip className="size-3.5 text-muted-foreground shrink-0" />
                                                <span className="truncate font-medium">{file.name}</span>
                                                <span className="text-muted-foreground">
                                                    ({(file.size / 1024).toFixed(1)} KB)
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFile(idx)}
                                                className="text-muted-foreground hover:text-destructive"
                                            >
                                                <X className="size-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? 'Submitting...' : 'Create Ticket'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// --- Edit Ticket Modal ---
function EditTicketModal({
    ticket,
    open,
    onClose,
    users,
}: {
    ticket: Ticket | null;
    open: boolean;
    onClose: () => void;
    users: UserOption[];
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const form = useForm({
        user_id: ticket?.user_id ?? (users[0]?.id || 1),
        category: ticket?.category ?? ('GENERAL' as TicketCategory),
        priority: ticket?.priority ?? ('MEDIUM' as TicketPriority),
        subject: ticket?.subject ?? '',
        message: ticket?.message ?? '',
        status: ticket?.status ?? ('OPEN' as TicketStatus),
        files: [] as File[],
    });

    const [prevId, setPrevId] = useState<number | null>(null);

    if (ticket && ticket.id !== prevId) {
        setPrevId(ticket.id);
        form.setData({
            user_id: ticket.user_id,
            category: ticket.category,
            priority: ticket.priority,
            subject: ticket.subject,
            message: ticket.message,
            status: ticket.status,
            files: [],
        });
        setSelectedFiles([]);
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArr = Array.from(e.target.files);
            setSelectedFiles((prev) => [...prev, ...filesArr]);
            form.setData('files', [...selectedFiles, ...filesArr]);
        }
    };

    const handleRemoveFile = (index: number) => {
        const updated = [...selectedFiles];
        updated.splice(index, 1);
        setSelectedFiles(updated);
        form.setData('files', updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticket) return;

        form.post(`/ticket/update/${ticket.id}`, {
            forceFormData: true,
            onSuccess: () => {
                form.reset();
                setSelectedFiles([]);
                onClose();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Edit Ticket {ticket?.ticket_id}</DialogTitle>
                    <DialogDescription>
                        Update ticket priority, status, category, or add additional file attachments.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="edit-ticket-user">Requester User *</Label>
                            <select
                                id="edit-ticket-user"
                                value={form.data.user_id}
                                onChange={(e) => form.setData('user_id', Number(e.target.value))}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-ring focus:ring-1 focus:ring-ring"
                                required
                            >
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name} ({u.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-ticket-category">Category *</Label>
                            <select
                                id="edit-ticket-category"
                                value={form.data.category}
                                onChange={(e) => form.setData('category', e.target.value as TicketCategory)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-ring focus:ring-1 focus:ring-ring"
                            >
                                <option value="GENERAL">General Support</option>
                                <option value="TECHNICAL">Technical Issue</option>
                                <option value="BILLING">Billing & Subscription</option>
                                <option value="ACCOUNT">Account Access</option>
                                <option value="FEATURE_REQUEST">Feature Request</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-ticket-priority">Priority *</Label>
                            <select
                                id="edit-ticket-priority"
                                value={form.data.priority}
                                onChange={(e) => form.setData('priority', e.target.value as TicketPriority)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-ring focus:ring-1 focus:ring-ring"
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent 🔥</option>
                            </select>
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="edit-ticket-status">Ticket Status *</Label>
                            <select
                                id="edit-ticket-status"
                                value={form.data.status}
                                onChange={(e) => form.setData('status', e.target.value as TicketStatus)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-ring focus:ring-1 focus:ring-ring"
                            >
                                <option value="OPEN">Open</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="PENDING">Pending</option>
                                <option value="RESOLVED">Resolved</option>
                                <option value="CLOSED">Closed</option>
                            </select>
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="edit-ticket-subject">Subject *</Label>
                            <Input
                                id="edit-ticket-subject"
                                value={form.data.subject}
                                onChange={(e) => form.setData('subject', e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="edit-ticket-message">Message *</Label>
                            <textarea
                                id="edit-ticket-message"
                                value={form.data.message}
                                onChange={(e) => form.setData('message', e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                rows={4}
                                required
                            />
                        </div>

                        {/* Existing attachments */}
                        {ticket?.attachments && ticket.attachments.length > 0 && (
                            <div className="space-y-2 sm:col-span-2">
                                <Label>Current Attachments ({ticket.attachments.length})</Label>
                                <div className="space-y-1.5">
                                    {ticket.attachments.map((att) => (
                                        <div
                                            key={att.id}
                                            className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2 text-xs"
                                        >
                                            <div className="flex items-center gap-2 truncate">
                                                <Paperclip className="size-3.5 text-primary shrink-0" />
                                                <span className="truncate font-mono">{att.file}</span>
                                            </div>
                                            <a
                                                href={att.file_url || `/${att.file}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                                            >
                                                <Download className="size-3" /> View
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Add more attachments */}
                        <div className="space-y-2 sm:col-span-2">
                            <Label>Add More Attachments</Label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border p-3 transition-colors hover:border-primary/50"
                            >
                                <UploadCloud className="size-5 text-muted-foreground" />
                                <span className="mt-1 text-xs text-muted-foreground">
                                    Click to attach files
                                </span>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>

                            {selectedFiles.length > 0 && (
                                <div className="mt-2 space-y-1.5">
                                    {selectedFiles.map((file, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-1.5 text-xs"
                                        >
                                            <span className="truncate font-medium">{file.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFile(idx)}
                                                className="text-muted-foreground hover:text-destructive"
                                            >
                                                <X className="size-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
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

// --- View Ticket Modal ---
function ViewTicketModal({
    ticket,
    open,
    onClose,
}: {
    ticket: Ticket | null;
    open: boolean;
    onClose: () => void;
}) {
    if (!ticket) return null;

    const handleQuickStatus = (newStatus: TicketStatus) => {
        router.post(`/ticket/status/${ticket.id}`, { status: newStatus }, { preserveScroll: true });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <span className="rounded-md bg-muted px-2.5 py-1 font-mono text-sm font-bold text-primary">
                                {ticket.ticket_id}
                            </span>
                            <span
                                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                                    CATEGORY_COLORS[ticket.category]
                                }`}
                            >
                                {ticket.category.replace('_', ' ')}
                            </span>
                        </div>
                        <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                STATUS_BADGES[ticket.status].class
                            }`}
                        >
                            {STATUS_BADGES[ticket.status].label}
                        </span>
                    </div>
                    <DialogTitle className="pt-2 text-xl font-bold">{ticket.subject}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2 text-sm">
                    {/* User & Meta info */}
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 p-3">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                                {ticket.user?.name ? ticket.user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                                <p className="font-semibold text-foreground">{ticket.user?.name || 'Unknown User'}</p>
                                <p className="text-xs text-muted-foreground">{ticket.user?.email || 'No email'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div>
                                <span className="font-medium">Priority:</span>{' '}
                                <span className={`font-semibold ${PRIORITY_BADGES[ticket.priority].class} px-1.5 py-0.5 rounded`}>
                                    {PRIORITY_BADGES[ticket.priority].label}
                                </span>
                            </div>
                            {ticket.created_at && (
                                <div>
                                    <span className="font-medium">Created:</span>{' '}
                                    {new Date(ticket.created_at).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ticket message */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Issue Description
                        </h4>
                        <div className="rounded-lg border border-border bg-card p-4 whitespace-pre-wrap leading-relaxed text-foreground">
                            {ticket.message}
                        </div>
                    </div>

                    {/* Attachments */}
                    {ticket.attachments && ticket.attachments.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Attached Files ({ticket.attachments.length})
                            </h4>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {ticket.attachments.map((att) => (
                                    <a
                                        key={att.id}
                                        href={att.file_url || `/${att.file}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 rounded-lg border border-border bg-card p-2.5 text-xs transition-colors hover:border-primary/50 hover:bg-muted/30"
                                    >
                                        <Paperclip className="size-4 text-primary shrink-0" />
                                        <span className="truncate font-mono font-medium">{att.file.split('/').pop()}</span>
                                        <Download className="size-3.5 ml-auto text-muted-foreground" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick status transitions */}
                    <div className="border-t border-border pt-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-medium text-muted-foreground">Change Status:</span>
                            <div className="flex flex-wrap gap-1.5">
                                {(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as TicketStatus[]).map((st) => (
                                    <Button
                                        key={st}
                                        variant={ticket.status === st ? 'default' : 'outline'}
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

// --- Delete Ticket Modal ---
function DeleteTicketModal({
    ticket,
    open,
    onClose,
}: {
    ticket: Ticket | null;
    open: boolean;
    onClose: () => void;
}) {
    const [processing, setProcessing] = useState(false);

    const handleDelete = () => {
        if (!ticket) return;
        setProcessing(true);

        router.delete(`/ticket/destroy/${ticket.id}`, {
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
                    <DialogTitle>Delete Support Ticket</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete ticket{' '}
                        <span className="font-semibold text-foreground">{ticket?.ticket_id}</span>?
                        This will permanently remove the ticket and its attachments.
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
                        {processing ? 'Deleting...' : 'Delete Ticket'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// --- Main Page Component ---
export default function TicketIndexPage({
    tickets,
    analytics,
    users,
    filters,
}: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editTicket, setEditTicket] = useState<Ticket | null>(null);
    const [viewTicket, setViewTicket] = useState<Ticket | null>(null);
    const [deleteTicket, setDeleteTicket] = useState<Ticket | null>(null);

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get(
            window.location.pathname,
            { ...filters, category: e.target.value, page: 1 },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get(
            window.location.pathname,
            { ...filters, priority: e.target.value, page: 1 },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get(
            window.location.pathname,
            { ...filters, status: e.target.value, page: 1 },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const columns = [
        {
            key: 'ticket_id',
            title: 'Ticket ID',
            render: (row: Ticket) => (
                <span className="font-mono text-xs font-bold text-primary">
                    {row.ticket_id}
                </span>
            ),
        },
        {
            key: 'subject',
            title: 'Subject & Requester',
            render: (row: Ticket) => (
                <div>
                    <div className="font-semibold text-foreground line-clamp-1">{row.subject}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>{row.user?.name || 'Unknown'}</span>
                        {row.attachments && row.attachments.length > 0 && (
                            <span className="inline-flex items-center gap-1 font-medium text-primary">
                                <Paperclip className="size-3" />
                                {row.attachments.length}
                            </span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'category',
            title: 'Category',
            render: (row: Ticket) => (
                <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        CATEGORY_COLORS[row.category]
                    }`}
                >
                    {row.category.replace('_', ' ')}
                </span>
            ),
        },
        {
            key: 'priority',
            title: 'Priority',
            render: (row: Ticket) => (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        PRIORITY_BADGES[row.priority].class
                    }`}
                >
                    {PRIORITY_BADGES[row.priority].label}
                </span>
            ),
        },
        {
            key: 'status',
            title: 'Status',
            render: (row: Ticket) => (
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
            key: 'created_at',
            title: 'Date',
            render: (row: Ticket) => (
                <span className="text-xs text-muted-foreground">
                    {row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}
                </span>
            ),
        },
        {
            key: 'action',
            title: 'Actions',
            sortable: false,
            render: (row: Ticket) => (
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-primary"
                        onClick={() => setViewTicket(row)}
                        title="View Ticket"
                    >
                        <Eye className="size-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-primary"
                        onClick={() => setEditTicket(row)}
                        title="Edit Ticket"
                    >
                        <Pencil className="size-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteTicket(row)}
                        title="Delete Ticket"
                    >
                        <Trash2 className="size-3.5" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Support Tickets" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Support Tickets</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage user inquiries, technical reports, and customer service requests.
                        </p>
                    </div>

                    <Button onClick={() => setCreateOpen(true)} className="gap-2">
                        <Plus className="size-4" />
                        Open Ticket
                    </Button>
                </div>

                {/* Analytics Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <StatCard
                        title="Total Tickets"
                        value={analytics.total}
                        icon={<LifeBuoy className="size-5 text-indigo-600 dark:text-indigo-400" />}
                        accent="bg-indigo-500/10"
                    />
                    <StatCard
                        title="Open Tickets"
                        value={analytics.open}
                        icon={<Inbox className="size-5 text-emerald-600 dark:text-emerald-400" />}
                        accent="bg-emerald-500/10"
                    />
                    <StatCard
                        title="In Progress"
                        value={analytics.in_progress}
                        icon={<Clock className="size-5 text-amber-600 dark:text-amber-400" />}
                        accent="bg-amber-500/10"
                    />
                    <StatCard
                        title="Resolved"
                        value={analytics.resolved}
                        icon={<CheckCircle2 className="size-5 text-blue-600 dark:text-blue-400" />}
                        accent="bg-blue-500/10"
                    />
                    <StatCard
                        title="Urgent Priority"
                        value={analytics.urgent}
                        icon={<ShieldAlert className="size-5 text-rose-600 dark:text-rose-400" />}
                        accent="bg-rose-500/10"
                    />
                </div>

                {/* Data Table */}
                <DataTable<Ticket>
                    columns={columns}
                    data={tickets.data}
                    meta={{ links: tickets.links }}
                    filters={filters}
                >
                    <select
                        value={filters.category || ''}
                        onChange={handleCategoryChange}
                        className="h-10 min-w-[130px] cursor-pointer rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
                    >
                        <option value="">All Categories</option>
                        <option value="GENERAL">General</option>
                        <option value="TECHNICAL">Technical</option>
                        <option value="BILLING">Billing</option>
                        <option value="ACCOUNT">Account</option>
                        <option value="FEATURE_REQUEST">Feature Request</option>
                    </select>

                    <select
                        value={filters.priority || ''}
                        onChange={handlePriorityChange}
                        className="h-10 min-w-[120px] cursor-pointer rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
                    >
                        <option value="">All Priorities</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                    </select>

                    <select
                        value={filters.status || ''}
                        onChange={handleStatusChange}
                        className="h-10 min-w-[120px] cursor-pointer rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
                    >
                        <option value="">All Statuses</option>
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="PENDING">Pending</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                </DataTable>
            </div>

            {/* Modals */}
            <CreateTicketModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                users={users}
            />
            <EditTicketModal
                ticket={editTicket}
                open={!!editTicket}
                onClose={() => setEditTicket(null)}
                users={users}
            />
            <ViewTicketModal
                ticket={viewTicket}
                open={!!viewTicket}
                onClose={() => setViewTicket(null)}
            />
            <DeleteTicketModal
                ticket={deleteTicket}
                open={!!deleteTicket}
                onClose={() => setDeleteTicket(null)}
            />
        </>
    );
}
