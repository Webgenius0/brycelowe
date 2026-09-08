import { Head, router, useForm } from '@inertiajs/react';
import {
    Briefcase,
    Building2,
    Eye,
    Globe,
    Languages,
    Pencil,
    Plus,
    Trash2,
    UserCheck,
    UserX,
    Users,
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

export interface CompanyUser {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role?: string;
}

export interface CompanyProfile {
    id: number;
    user_id: number | null;
    user?: CompanyUser | null;
    company_name: string;
    avatar: string | null;
    industry: string | null;
    industury?: string | null;
    timezone: string | null;
    language: string | null;
    created_at?: string;
    updated_at?: string;
}

type Props = {
    companies: {
        data: CompanyProfile[];
        links: any[];
    };
    analytics: {
        total: number;
        assigned_users: number;
        unassigned: number;
        unique_industries: number;
    };
    users: CompanyUser[];
    industries: string[];
    filters: {
        search?: string;
        industry?: string;
        sort_by?: string;
        sort_order?: string;
    };
};

// Common list of timezones
const COMMON_TIMEZONES = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Dubai',
    'Asia/Dhaka',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Australia/Sydney',
];

// Common list of languages
const COMMON_LANGUAGES = [
    'English',
    'Spanish',
    'French',
    'German',
    'Chinese',
    'Japanese',
    'Arabic',
    'Bengali',
    'Portuguese',
    'Russian',
];

// Common industries
const COMMON_INDUSTRIES = [
    'Software & Technology',
    'Financial Services',
    'Healthcare & Medical',
    'E-commerce & Retail',
    'Real Estate',
    'Marketing & Advertising',
    'Education & EdTech',
    'Manufacturing & Industrial',
    'Consulting & Professional Services',
    'Logistics & Transportation',
];

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

// --- Create Company Modal ---
function CreateCompanyModal({
    open,
    users,
    onClose,
}: {
    open: boolean;
    users: CompanyUser[];
    onClose: () => void;
}) {
    const form = useForm({
        company_name: '',
        user_id: '',
        industry: '',
        timezone: 'America/New_York',
        language: 'English',
        avatar: '' as any,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/company/store', {
            forceFormData: true,
            onSuccess: () => {
                form.reset();
                onClose();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Register Company Profile</DialogTitle>
                    <DialogDescription>
                        Create a company profile and link it to an account holder.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="create-company-name">Company Name *</Label>
                        <Input
                            id="create-company-name"
                            value={form.data.company_name}
                            onChange={(e) => form.setData('company_name', e.target.value)}
                            placeholder="e.g., Acme Innovations Inc."
                            required
                        />
                        {form.errors.company_name && (
                            <p className="text-xs text-destructive">{form.errors.company_name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="create-company-user">Assigned User Account</Label>
                        <select
                            id="create-company-user"
                            value={form.data.user_id}
                            onChange={(e) => form.setData('user_id', e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-ring focus:ring-1 focus:ring-ring"
                        >
                            <option value="">-- Unassigned / Independent --</option>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="create-company-industry">Industry</Label>
                            <Input
                                id="create-company-industry"
                                list="industry-suggestions"
                                value={form.data.industry}
                                onChange={(e) => form.setData('industry', e.target.value)}
                                placeholder="Select or type..."
                            />
                            <datalist id="industry-suggestions">
                                {COMMON_INDUSTRIES.map((ind) => (
                                    <option key={ind} value={ind} />
                                ))}
                            </datalist>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-company-timezone">Timezone</Label>
                            <select
                                id="create-company-timezone"
                                value={form.data.timezone}
                                onChange={(e) => form.setData('timezone', e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-ring focus:ring-1 focus:ring-ring"
                            >
                                {COMMON_TIMEZONES.map((tz) => (
                                    <option key={tz} value={tz}>
                                        {tz}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="create-company-language">Primary Language</Label>
                            <select
                                id="create-company-language"
                                value={form.data.language}
                                onChange={(e) => form.setData('language', e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-ring focus:ring-1 focus:ring-ring"
                            >
                                {COMMON_LANGUAGES.map((lang) => (
                                    <option key={lang} value={lang}>
                                        {lang}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-company-avatar">Company Logo</Label>
                            <Input
                                id="create-company-avatar"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        form.setData('avatar', e.target.files[0]);
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? 'Saving...' : 'Create Company'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// --- Edit Company Modal ---
function EditCompanyModal({
    company,
    users,
    open,
    onClose,
}: {
    company: CompanyProfile | null;
    users: CompanyUser[];
    open: boolean;
    onClose: () => void;
}) {
    const form = useForm({
        company_name: company?.company_name ?? '',
        user_id: company?.user_id ? String(company.user_id) : '',
        industry: company?.industry ?? '',
        timezone: company?.timezone ?? 'America/New_York',
        language: company?.language ?? 'English',
        avatar: '' as any,
    });

    const [prevCompanyId, setPrevCompanyId] = useState<number | null>(null);

    if (company && company.id !== prevCompanyId) {
        setPrevCompanyId(company.id);
        form.setData({
            company_name: company.company_name,
            user_id: company.user_id ? String(company.user_id) : '',
            industry: company.industry ?? '',
            timezone: company.timezone ?? 'America/New_York',
            language: company.language ?? 'English',
            avatar: '',
        });
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!company) return;

        form.patch(`/company/update/${company.id}`, {
            forceFormData: true,
            onSuccess: () => {
                form.reset();
                onClose();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Company Profile</DialogTitle>
                    <DialogDescription>
                        Update company credentials, account association, and preferences.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-company-name">Company Name *</Label>
                        <Input
                            id="edit-company-name"
                            value={form.data.company_name}
                            onChange={(e) => form.setData('company_name', e.target.value)}
                            required
                        />
                        {form.errors.company_name && (
                            <p className="text-xs text-destructive">{form.errors.company_name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-company-user">Assigned User Account</Label>
                        <select
                            id="edit-company-user"
                            value={form.data.user_id}
                            onChange={(e) => form.setData('user_id', e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-ring focus:ring-1 focus:ring-ring"
                        >
                            <option value="">-- Unassigned / Independent --</option>
                            {users.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.name} ({u.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-company-industry">Industry</Label>
                            <Input
                                id="edit-company-industry"
                                list="edit-industry-suggestions"
                                value={form.data.industry}
                                onChange={(e) => form.setData('industry', e.target.value)}
                            />
                            <datalist id="edit-industry-suggestions">
                                {COMMON_INDUSTRIES.map((ind) => (
                                    <option key={ind} value={ind} />
                                ))}
                            </datalist>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-company-timezone">Timezone</Label>
                            <select
                                id="edit-company-timezone"
                                value={form.data.timezone}
                                onChange={(e) => form.setData('timezone', e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-ring focus:ring-1 focus:ring-ring"
                            >
                                {COMMON_TIMEZONES.map((tz) => (
                                    <option key={tz} value={tz}>
                                        {tz}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-company-language">Primary Language</Label>
                            <select
                                id="edit-company-language"
                                value={form.data.language}
                                onChange={(e) => form.setData('language', e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-ring focus:ring-1 focus:ring-ring"
                            >
                                {COMMON_LANGUAGES.map((lang) => (
                                    <option key={lang} value={lang}>
                                        {lang}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-company-avatar">Change Logo</Label>
                            <Input
                                id="edit-company-avatar"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        form.setData('avatar', e.target.files[0]);
                                    }
                                }}
                            />
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

// --- View Company Modal ---
function ViewCompanyModal({
    company,
    open,
    onClose,
}: {
    company: CompanyProfile | null;
    open: boolean;
    onClose: () => void;
}) {
    if (!company) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="sr-only">
                    <DialogTitle>Company Details</DialogTitle>
                    <DialogDescription>Full company profile details.</DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-4 border-b border-border pb-4">
                    {company.avatar ? (
                        <img
                            src={company.avatar}
                            alt={company.company_name}
                            className="size-14 rounded-xl object-cover border border-border shadow-sm"
                        />
                    ) : (
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-[#0EADAB]/10 text-[#0EADAB] text-lg font-bold border border-border shadow-sm">
                            <Building2 className="size-7" />
                        </div>
                    )}
                    <div>
                        <h2 className="text-lg font-bold text-foreground">
                            {company.company_name}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {company.industry || 'No Industry Specified'}
                        </p>
                    </div>
                </div>

                <div className="space-y-3 py-2 text-sm">
                    <div className="rounded-lg bg-muted/30 p-3 border border-border space-y-2">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                                <Users className="size-3.5" /> Owner / User
                            </span>
                            <span className="font-semibold text-foreground">
                                {company.user ? `${company.user.name} (${company.user.email})` : 'Unassigned'}
                            </span>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                                <Globe className="size-3.5" /> Timezone
                            </span>
                            <span className="font-mono text-foreground font-medium">
                                {company.timezone || 'UTC'}
                            </span>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                                <Languages className="size-3.5" /> Language
                            </span>
                            <span className="text-foreground font-medium">
                                {company.language || 'English'}
                            </span>
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

// --- Delete Company Modal ---
function DeleteCompanyModal({
    company,
    open,
    onClose,
}: {
    company: CompanyProfile | null;
    open: boolean;
    onClose: () => void;
}) {
    const [processing, setProcessing] = useState(false);

    const handleDelete = () => {
        if (!company) return;
        setProcessing(true);

        router.delete(`/company/destroy/${company.id}`, {
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
                    <DialogTitle>Delete Company Profile</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete{' '}
                        <span className="font-semibold text-foreground">
                            {company?.company_name}
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
                        {processing ? 'Deleting...' : 'Delete Company'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// --- Main Page Component ---
export default function CompaniesPage({
    companies,
    analytics,
    users,
    industries,
    filters,
}: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editCompany, setEditCompany] = useState<CompanyProfile | null>(null);
    const [viewCompany, setViewCompany] = useState<CompanyProfile | null>(null);
    const [deleteCompany, setDeleteCompany] = useState<CompanyProfile | null>(null);

    const handleIndustryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get(
            window.location.pathname,
            {
                ...filters,
                industry: e.target.value,
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
            render: (row: CompanyProfile) => {
                const index = companies.data.findIndex((item) => item.id === row.id);
                return <span className="text-muted-foreground">{index + 1}</span>;
            },
        },
        {
            key: 'company_name',
            title: 'Company',
            render: (row: CompanyProfile) => (
                <div className="flex items-center gap-3">
                    {row.avatar ? (
                        <img
                            src={row.avatar}
                            alt={row.company_name}
                            className="size-8 rounded-lg object-cover border border-border"
                        />
                    ) : (
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#0EADAB]/10 text-[#0EADAB] font-bold border border-border text-xs">
                            {row.company_name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <div className="font-semibold text-foreground">{row.company_name}</div>
                        <div className="text-xs text-muted-foreground">
                            {row.industry || 'No Industry'}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'user',
            title: 'Assigned User',
            render: (row: CompanyProfile) => (
                row.user ? (
                    <div>
                        <div className="text-sm font-medium text-foreground">{row.user.name}</div>
                        <div className="text-xs text-muted-foreground">{row.user.email}</div>
                    </div>
                ) : (
                    <span className="text-xs text-muted-foreground italic">Unassigned</span>
                )
            ),
        },
        {
            key: 'timezone',
            title: 'Timezone / Lang',
            render: (row: CompanyProfile) => (
                <div className="text-xs">
                    <div className="font-medium text-foreground">{row.timezone || 'UTC'}</div>
                    <div className="text-muted-foreground">{row.language || 'English'}</div>
                </div>
            ),
        },
        {
            key: 'created_at',
            title: 'Created At',
            render: (row: CompanyProfile) => (
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
        {
            key: 'action',
            title: 'Actions',
            sortable: false,
            render: (row: CompanyProfile) => (
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-primary"
                        onClick={() => setViewCompany(row)}
                        title="View Details"
                    >
                        <Eye className="size-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-primary"
                        onClick={() => setEditCompany(row)}
                        title="Edit Company"
                    >
                        <Pencil className="size-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteCompany(row)}
                        title="Delete Company"
                    >
                        <Trash2 className="size-3.5" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Company Profiles" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Company Profiles
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage registered client organizations, industries, and user associations.
                        </p>
                    </div>

                    <Button onClick={() => setCreateOpen(true)} className="gap-2">
                        <Plus className="size-4" />
                        Add Company
                    </Button>
                </div>

                {/* Analytics Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Companies"
                        value={analytics.total}
                        icon={<Building2 className="size-5 text-teal-600 dark:text-teal-400" />}
                        accent="bg-teal-500/10"
                    />
                    <StatCard
                        title="Assigned to Users"
                        value={analytics.assigned_users}
                        icon={<UserCheck className="size-5 text-emerald-600 dark:text-emerald-400" />}
                        accent="bg-emerald-500/10"
                    />
                    <StatCard
                        title="Unassigned Profiles"
                        value={analytics.unassigned}
                        icon={<UserX className="size-5 text-amber-600 dark:text-amber-400" />}
                        accent="bg-amber-500/10"
                    />
                    <StatCard
                        title="Active Industries"
                        value={analytics.unique_industries}
                        icon={<Briefcase className="size-5 text-indigo-600 dark:text-indigo-400" />}
                        accent="bg-indigo-500/10"
                    />
                </div>

                {/* Data Table */}
                <DataTable<CompanyProfile>
                    columns={columns}
                    data={companies.data}
                    meta={{ links: companies.links }}
                    filters={filters}
                >
                    <select
                        value={filters.industry || ''}
                        onChange={handleIndustryChange}
                        className="h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring cursor-pointer min-w-[140px]"
                    >
                        <option value="">All Industries</option>
                        {industries.map((ind) => (
                            <option key={ind} value={ind}>
                                {ind}
                            </option>
                        ))}
                    </select>
                </DataTable>
            </div>

            {/* Modals */}
            <CreateCompanyModal
                open={createOpen}
                users={users}
                onClose={() => setCreateOpen(false)}
            />
            <EditCompanyModal
                company={editCompany}
                users={users}
                open={!!editCompany}
                onClose={() => setEditCompany(null)}
            />
            <ViewCompanyModal
                company={viewCompany}
                open={!!viewCompany}
                onClose={() => setViewCompany(null)}
            />
            <DeleteCompanyModal
                company={deleteCompany}
                open={!!deleteCompany}
                onClose={() => setDeleteCompany(null)}
            />
        </>
    );
}
