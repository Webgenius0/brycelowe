import { Head, router, useForm } from '@inertiajs/react';
import {
    Plus,
    Pencil,
    Trash2,
    HelpCircle,
    CheckCircle2,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import TextEditor from '@/components/textEditor';
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

type FAQ = {
    id: number;
    serial: number;
    question: string;
    answer: string;
    status: 'Active' | 'Inactive';
    created_at?: string;
};

type Props = {
    faqs: {
        data: FAQ[];
        links: any[];
    };
    analytics: {
        total: number;
        active: number;
        inactive: number;
    };
    filters: {
        search?: string;
        sort_by?: string;
        sort_order?: string;
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

function FaqModal({
    open,
    onClose,
    faq,
}: {
    open: boolean;
    onClose: () => void;
    faq?: FAQ;
}) {
    const form = useForm({
        serial: faq?.serial ?? 1,
        question: faq?.question ?? '',
        answer: faq?.answer ?? '',
        status: faq?.status ?? 'Active',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (faq) {
            form.transform((data) => ({
                ...data,
                _method: 'PATCH',
            }));
            form.post(`/faq/update/${faq.id}`, {
                onSuccess: () => {
                    onClose();
                },
                preserveScroll: true,
            });
        } else {
            form.post('/faq/store', {
                onSuccess: () => {
                    form.reset();
                    onClose();
                },
                preserveScroll: true,
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{faq ? 'Edit FAQ' : 'Create FAQ'}</DialogTitle>
                    <DialogDescription>
                        {faq
                            ? 'Update the details of the FAQ.'
                            : 'Create a new Frequently Asked Question.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="faq-serial">Serial</Label>
                        <Input
                            id="faq-serial"
                            type="number"
                            min={1}
                            value={form.data.serial}
                            onChange={(e) =>
                                form.setData('serial', Number(e.target.value))
                            }
                            required
                        />
                        {form.errors.serial && (
                            <p className="text-xs text-destructive">
                                {form.errors.serial}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="faq-question">Question</Label>
                        <Input
                            id="faq-question"
                            value={form.data.question}
                            onChange={(e) =>
                                form.setData('question', e.target.value)
                            }
                            placeholder="e.g., What is your return policy?"
                            required
                        />
                        {form.errors.question && (
                            <p className="text-xs text-destructive">
                                {form.errors.question}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>Answer</Label>
                        <TextEditor
                            value={form.data.answer}
                            onChange={(val) => form.setData('answer', val)}
                        />
                        {form.errors.answer && (
                            <p className="text-xs text-destructive">
                                {form.errors.answer}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="faq-status">Status</Label>
                        <select
                            id="faq-status"
                            value={form.data.status}
                            onChange={(e) =>
                                form.setData(
                                    'status',
                                    e.target.value as 'Active' | 'Inactive',
                                )
                            }
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                        {form.errors.status && (
                            <p className="text-xs text-destructive">
                                {form.errors.status}
                            </p>
                        )}
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
                            {form.processing ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function DeleteFaqModal({
    open,
    onClose,
    faq,
}: {
    open: boolean;
    onClose: () => void;
    faq: FAQ | null;
}) {
    const [processing, setProcessing] = useState(false);

    const handleDelete = () => {
        if (!faq) return;

        setProcessing(true);
        router.delete(`/faq/destroy/${faq.id}`, {
            onSuccess: () => {
                onClose();
            },
            onFinish: () => setProcessing(false),
            preserveScroll: true,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete FAQ</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this FAQ? This action
                        cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={processing}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={processing}
                    >
                        {processing ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function FAQPage({ faqs, analytics, filters }: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editFaq, setEditFaq] = useState<FAQ | null>(null);
    const [deleteFaq, setDeleteFaq] = useState<FAQ | null>(null);

    const columns = [
        {
            key: 'serial',
            title: 'Serial',
            render: (row: FAQ) => (
                <span className="text-muted-foreground">{row.serial}</span>
            ),
        },
        {
            key: 'question',
            title: 'Question',
            render: (row: FAQ) => (
                <span className="font-medium text-foreground">
                    {row.question}
                </span>
            ),
        },
        {
            key: 'answer',
            title: 'Answer',
            render: (row: FAQ) => (
                <span className="line-clamp-2 max-w-md text-xs text-muted-foreground">
                    {row.answer}
                </span>
            ),
        },
        {
            key: 'status',
            title: 'Status',
            render: (row: FAQ) => (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        row.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}
                >
                    {row.status}
                </span>
            ),
        },
        {
            key: 'action',
            title: 'Actions',
            sortable: false,
            render: (row: FAQ) => (
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-primary"
                        onClick={() => setEditFaq(row)}
                    >
                        <Pencil className="size-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteFaq(row)}
                    >
                        <Trash2 className="size-3.5" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="FAQ Management" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            FAQ Management
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Create and manage frequently asked questions for
                            your customer support portal.
                        </p>
                    </div>

                    <Button
                        onClick={() => setCreateOpen(true)}
                        className="gap-2 self-start sm:self-auto"
                    >
                        <Plus className="size-4" />
                        Add FAQ
                    </Button>
                </div>

                {/* Analytics Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <StatCard
                        title="Total FAQs"
                        value={analytics?.total ?? 0}
                        icon={
                            <HelpCircle className="size-5 text-blue-600 dark:text-blue-400" />
                        }
                        accent="bg-blue-500/10"
                    />
                    <StatCard
                        title="Active FAQs"
                        value={analytics?.active ?? 0}
                        icon={
                            <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                        }
                        accent="bg-emerald-500/10"
                    />
                    <StatCard
                        title="Inactive FAQs"
                        value={analytics?.inactive ?? 0}
                        icon={
                            <XCircle className="size-5 text-red-600 dark:text-red-400" />
                        }
                        accent="bg-red-500/10"
                    />
                </div>

                <DataTable
                    data={faqs.data}
                    columns={columns}
                    meta={{ links: faqs.links }}
                    filters={filters}
                />
            </div>

            <FaqModal open={createOpen} onClose={() => setCreateOpen(false)} />
            {editFaq && (
                <FaqModal
                    open={true}
                    onClose={() => setEditFaq(null)}
                    faq={editFaq}
                />
            )}
            <DeleteFaqModal
                open={!!deleteFaq}
                onClose={() => setDeleteFaq(null)}
                faq={deleteFaq}
            />
        </>
    );
}

FAQPage.layout = {
    breadcrumbs: [{ title: 'FAQs', href: '/faq' }],
};
