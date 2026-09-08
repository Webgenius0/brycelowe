import { Head, useForm } from '@inertiajs/react';
import {
    Plus,
    Pencil,
    Trash2,
    FileText,
    CheckCircle2,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import DataTable from '@/components/datatable';
import TextEditor from '@/components/textEditor';
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
    index as dynamicIndex,
    store as dynamicStore,
    update as dynamicUpdate,
    destroy as dynamicDestroy,
} from '@/routes/dynamic';

type DynamicPage = {
    id: number;
    page_title: string;
    slug: string;
    page_content: string;
    status: string;
    created_at: string;
    page_subtitle?: string;
};

type Props = {
    pages: { data: DynamicPage[]; links: any[] };
    analytics: {
        total: number;
        active: number;
        inactive: number;
    };
    filters: { search?: string; sort_by?: string; sort_order?: string };
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

function PageModal({
    open,
    onClose,
    page,
}: {
    open: boolean;
    onClose: () => void;
    page?: DynamicPage;
}) {
    const form = useForm({
        page_title: page?.page_title ?? '',
        slug: page?.slug ?? '',
        page_content: page?.page_content ?? '',
        status: page?.status ?? 'Active',
        page_subtitle: page?.page_subtitle ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (page) {
            form.patch(dynamicUpdate.url(page.id), {
                onSuccess: onClose,
            });
        } else {
            form.post(dynamicStore.url(), {
                onSuccess: () => {
                    form.reset();
                    onClose();
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] w-full overflow-y-auto sm:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>
                        {page ? 'Edit Page' : 'Create Page'}
                    </DialogTitle>
                    <DialogDescription>
                        {page
                            ? 'Update the dynamic page content.'
                            : 'Create a new dynamic page (FAQ, Terms, Privacy, etc.).'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="page-title">Page Title</Label>
                        <Input
                            id="page-title"
                            value={form.data.page_title}
                            onChange={(e) => {
                                form.setData((data) => ({
                                    ...data,
                                    page_title: e.target.value,
                                    slug: page
                                        ? data.slug
                                        : e.target.value
                                              .toLowerCase()
                                              .replace(/[^a-z0-9]+/g, '-')
                                              .replace(/(^-|-$)/g, ''),
                                }));
                            }}
                            placeholder="e.g. FAQ, Terms & Conditions"
                        />
                        {form.errors.page_title && (
                            <p className="text-xs text-destructive">
                                {form.errors.page_title}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="page-subtitle">Subtitle</Label>
                        <Input
                            id="page-subtitle"
                            value={form.data.page_subtitle}
                            onChange={(e) =>
                                form.setData('page_subtitle', e.target.value)
                            }
                            placeholder="e.g. Frequently Asked Questions"
                        />
                        {form.errors.page_subtitle && (
                            <p className="text-xs text-destructive">
                                {form.errors.page_subtitle}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="page-slug">Page Slug</Label>
                        <Input
                            id="page-slug"
                            value={form.data.slug}
                            onChange={(e) =>
                                form.setData('slug', e.target.value)
                            }
                            placeholder="e.g. faq, terms-and-conditions"
                        />
                        {form.errors.slug && (
                            <p className="text-xs text-destructive">
                                {form.errors.slug}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="page-content">Content</Label>
                        <TextEditor
                            value={form.data.page_content}
                            onChange={(value) =>
                                form.setData('page_content', value)
                            }
                        />

                        {form.errors.page_content && (
                            <p className="text-xs text-destructive">
                                {form.errors.page_content}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="page-status">Status</Label>
                        <select
                            id="page-status"
                            value={form.data.status}
                            onChange={(e) =>
                                form.setData('status', e.target.value)
                            }
                            className="flex h-9 w-full cursor-pointer rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
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
                            {form.processing
                                ? 'Saving...'
                                : page
                                  ? 'Save Changes'
                                  : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function DynamicPages({ pages, analytics, filters }: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editPage, setEditPage] = useState<DynamicPage | null>(null);
    const [deletePage, setDeletePage] = useState<DynamicPage | null>(null);
    const deleteForm = useForm({});

    const columns = [
        {
            key: 'sl',
            title: '#',
            render: (row: DynamicPage) => {
                const index = pages.data.findIndex(
                    (item) => item.id === row.id,
                );

                return (
                    <span className="text-muted-foreground">{index + 1}</span>
                );
            },
        },
        { key: 'page_title', title: 'Title' },
        { key: 'slug', title: 'Slug' },
        {
            key: 'page_content',
            title: 'Content Preview',
            sortable: false,
            render: (row: DynamicPage) => (
                <span className="line-clamp-1 max-w-xs text-muted-foreground">
                    {row.page_content?.replace(/<[^>]*>/g, '').slice(0, 80)}...
                </span>
            ),
        },
        {
            key: 'status',
            title: 'Status',
            sortable: false,
            render: (row: DynamicPage) => (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${row.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}
                >
                    {row.status}
                </span>
            ),
        },
        {
            key: 'action',
            title: 'Actions',
            sortable: false,
            render: (row: DynamicPage) => (
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-primary"
                        onClick={() => setEditPage(row)}
                    >
                        <Pencil className="size-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeletePage(row)}
                    >
                        <Trash2 className="size-3.5" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Dynamic Pages" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Dynamic Pages
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage FAQ, Terms, Privacy Policy and other content
                            pages.
                        </p>
                    </div>
                    <Button
                        onClick={() => setCreateOpen(true)}
                        className="gap-2"
                    >
                        <Plus className="size-4" />
                        Add Page
                    </Button>
                </div>

                {/* Analytics Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <StatCard
                        title="Total Pages"
                        value={analytics?.total ?? 0}
                        icon={
                            <FileText className="size-5 text-blue-600 dark:text-blue-400" />
                        }
                        accent="bg-blue-500/10"
                    />
                    <StatCard
                        title="Active Pages"
                        value={analytics?.active ?? 0}
                        icon={
                            <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                        }
                        accent="bg-emerald-500/10"
                    />
                    <StatCard
                        title="Inactive Pages"
                        value={analytics?.inactive ?? 0}
                        icon={
                            <XCircle className="size-5 text-red-600 dark:text-red-400" />
                        }
                        accent="bg-red-500/10"
                    />
                </div>

                <DataTable<DynamicPage>
                    columns={columns}
                    data={pages.data}
                    meta={{ links: pages.links }}
                    filters={filters}
                />
            </div>

            <PageModal open={createOpen} onClose={() => setCreateOpen(false)} />
            {editPage && (
                <PageModal
                    open={!!editPage}
                    onClose={() => setEditPage(null)}
                    page={editPage}
                />
            )}

            <Dialog
                open={!!deletePage}
                onOpenChange={() => setDeletePage(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Page</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete{' '}
                            <span className="font-semibold text-foreground">
                                {deletePage?.page_title}
                            </span>
                            ?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeletePage(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={deleteForm.processing}
                            onClick={() => {
                                if (deletePage) {
                                    deleteForm.delete(
                                        dynamicDestroy.url(deletePage.id),
                                        {
                                            onSuccess: () =>
                                                setDeletePage(null),
                                        },
                                    );
                                }
                            }}
                        >
                            {deleteForm.processing ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

DynamicPages.layout = {
    breadcrumbs: [{ title: 'Dynamic Pages', href: dynamicIndex.url() }],
};
