import { Head } from '@inertiajs/react';
import {
    LayoutGrid,
    Users,
    Layers,
    Building2,
    Gift,
    CreditCard,
    Settings,
    FileText,
    CheckCircle2,
    Calendar,
    Filter,
    Shield,
    BarChart3,
    BookOpen,
    Search,
} from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type DocSection = {
    id: string;
    title: string;
    icon: React.ReactNode;
    description: string;
    content: React.ReactNode;
};

export default function Docs() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    const sections: DocSection[] = [
        {
            id: 'overview',
            title: 'System Overview & Architecture',
            icon: <LayoutGrid className="size-5 text-violet-500" />,
            description: 'Core platform architecture and technology stack overview.',
            content: (
                <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                    <p>
                        The Admin Dashboard is engineered using <strong>Laravel 13</strong> on the backend, <strong>Inertia.js v3</strong> for single-page routing without API overhead, and <strong>React 18</strong> with <strong>TypeScript</strong> and <strong>TailwindCSS</strong> for a fluid UI.
                    </p>
                    <div className="grid gap-3 pt-2 sm:grid-cols-3">
                        <div className="rounded-lg border border-border/60 bg-muted/40 p-3">
                            <p className="font-semibold text-foreground">Backend Stack</p>
                            <p className="text-xs text-muted-foreground">Laravel 13 / PHP 8.3+ / MySQL</p>
                        </div>
                        <div className="rounded-lg border border-border/60 bg-muted/40 p-3">
                            <p className="font-semibold text-foreground">Frontend Stack</p>
                            <p className="text-xs text-muted-foreground">React 18 / Inertia.js v3 / Vite</p>
                        </div>
                        <div className="rounded-lg border border-border/60 bg-muted/40 p-3">
                            <p className="font-semibold text-foreground">UI Design System</p>
                            <p className="text-xs text-muted-foreground">TailwindCSS v4 / Lucide / Recharts</p>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: 'dashboard-filters',
            title: 'Dashboard & Date Filtering Guide',
            icon: <BarChart3 className="size-5 text-cyan-500" />,
            description: 'How dashboard metrics, date presets, and Lifetime vs. Period modes work.',
            content: (
                <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                    <p>
                        The main dashboard provides real-time tracking of platform activity with flexible date filtering modes:
                    </p>
                    <div className="space-y-2">
                        <div className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-background p-3">
                            <Filter className="mt-0.5 size-4 shrink-0 text-violet-500" />
                            <div>
                                <span className="font-semibold text-foreground">Lifetime Total vs. Selected Period Mode:</span>
                                <p className="text-xs">
                                    Use the segmented control top-right to toggle between <strong>Lifetime Total</strong> (all-time system metrics) and <strong>Selected Period</strong> (metrics filtered strictly to the selected date range).
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-background p-3">
                            <Calendar className="mt-0.5 size-4 shrink-0 text-cyan-500" />
                            <div>
                                <span className="font-semibold text-foreground">Quick Presets & Custom Range:</span>
                                <p className="text-xs">
                                    Choose from <em>Today, Yesterday, This Week, This Month, Previous Month, Last 30 Days, Last 6 Months, Last Year</em>, or pick custom <code>From</code> and <code>To</code> dates. Selecting any filter automatically switches the view mode to Selected Period.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-background p-3">
                            <Shield className="mt-0.5 size-4 shrink-0 text-amber-500" />
                            <div>
                                <span className="font-semibold text-foreground">User Roles Breakdown Chips:</span>
                                <p className="text-xs">
                                    Displays role signups (Admins, Partners, Users/Customers) dynamically synced with the active filter period and view mode.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: 'marketing-support',
            title: 'Marketing & Support',
            icon: <Gift className="size-5 text-rose-500" />,
            description: 'Contact Us requests with admin email notifications, and support tools.',
            content: (
                <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                    <p>
                        The <strong>Marketing & Support</strong> section in the sidebar contains tools for managing inbound contact requests from the public-facing site.
                    </p>
                    <div className="grid gap-3 pt-1 sm:grid-cols-2">
                        <div className="rounded-lg border border-border/50 bg-background p-3">
                            <p className="font-semibold text-foreground text-xs">📬 Contact Us Requests (<code>/contact-us</code>)</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                View all inbound contact form submissions with sender name, email, subject, and message. Each row can be expanded for full detail.
                            </p>
                        </div>
                        <div className="rounded-lg border border-border/50 bg-background p-3">
                            <p className="font-semibold text-foreground text-xs">🔔 Admin Email Notifications</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                When a visitor submits a contact request, an automatic notification email is dispatched to the configured admin address containing the full submission details.
                            </p>
                        </div>
                    </div>
                    <div className="rounded-lg border border-border/50 bg-background p-3 text-xs">
                        <span className="font-semibold text-foreground">Sidebar Behaviour:</span>{' '}
                        The <em>Marketing & Support</em> collapsible menu auto-expands when any of its child routes are active, keeping the navigation context clear.
                    </div>
                </div>
            ),
        },
        {
            id: 'passes',
            title: 'Membership Passes Management',
            icon: <Layers className="size-5 text-emerald-500" />,
            description: 'Creating, updating, and associating membership passes with attractions.',
            content: (
                <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                    <p>
                        Manage subscription tiers and membership passes available to customers. Access via <strong>Passes</strong> in the sidebar (<code>/plans</code>).
                    </p>
                    <ul className="ml-4 space-y-1.5 list-disc text-xs">
                        <li><strong>Pass Titles & Types:</strong> Define pass titles (e.g. VIP Gold Pass) and billing frequencies (Monthly, Annual).</li>
                        <li><strong>Pricing & Discounts:</strong> Set standard base prices, discount prices, and discount display text.</li>
                        <li><strong>HTML Rich Text Description:</strong> Use the rich HTML editor to highlight key features, benefits, and usage rules.</li>
                        <li><strong>Attraction Linking:</strong> Select participating business attractions linked to each pass tier.</li>
                    </ul>
                </div>
            ),
        },
        {
            id: 'users',
            title: 'Users & Account Analytics',
            icon: <Users className="size-5 text-indigo-500" />,
            description: 'Managing user accounts, roles, status, filters, and export reports.',
            content: (
                <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                    <p>
                        Manage registered platform accounts from the <strong>Users</strong> page (<code>/user</code>).
                    </p>
                    <div className="grid gap-3 pt-1 sm:grid-cols-2">
                        <div className="rounded-lg border border-border/50 bg-background p-3">
                            <p className="font-semibold text-foreground text-xs">📊 Expanded Analytics Grid</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Top stat cards show live counts for <em>Total Users, Active Users, Admins, Partners</em>, and <em>New Registrations This Month</em>.
                            </p>
                        </div>
                        <div className="rounded-lg border border-border/50 bg-background p-3">
                            <p className="font-semibold text-foreground text-xs">🔍 Role Filter Dropdown</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                A <strong>Role</strong> select filter sits beside the search input. Filter the user list instantly by <em>All Roles, Admin, Partner, User</em>.
                            </p>
                        </div>
                        <div className="rounded-lg border border-border/50 bg-background p-3">
                            <p className="font-semibold text-foreground text-xs">📥 Export Utilities</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Export complete or filtered user listings directly to <strong>CSV</strong> or <strong>Excel (.xlsx)</strong> spreadsheets.
                            </p>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: 'subscribers',
            title: 'Subscribers & Pass Filter',
            icon: <CreditCard className="size-5 text-teal-500" />,
            description: 'Viewing, searching, and filtering active subscribers by membership pass type.',
            content: (
                <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                    <p>
                        The <strong>Subscribers</strong> page (<code>/subscriber</code>) lists all active membership subscribers with rich detail and filtering tools.
                    </p>
                    <ul className="ml-4 space-y-1.5 list-disc text-xs">
                        <li><strong>Pass-Wise Dropdown Filter:</strong> A <em>All Passes</em> select dropdown beside the search bar lets admins filter the subscriber list by specific membership/pass type. Available options are dynamically fetched from the database.</li>
                        <li><strong>Search + Filter Combined:</strong> The pass filter and search query can be used simultaneously — results update via URL parameters, keeping the filter state on refresh.</li>
                        <li><strong>Subscriber Details:</strong> Each row shows subscriber name, email, active pass, subscription start/end dates, and status badges.</li>
                    </ul>
                </div>
            ),
        },
        {
            id: 'businesses',
            title: 'Business Attractions & Redemptions',
            icon: <Building2 className="size-5 text-amber-500" />,
            description: 'Attraction partner management, detail view modal, point redemptions, and payouts.',
            content: (
                <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                    <p>
                        Oversee business partners, customer visit point redemptions, and payout disbursements.
                    </p>
                    <ul className="ml-4 space-y-1.5 list-disc text-xs">
                        <li><strong>Business Listings (<code>/businesses</code>):</strong> Manage partner profiles, locations, status, and categories.</li>
                        <li><strong>👁 Details Eye Modal:</strong> Click the <em>Eye</em> icon in the Actions column to open a rich detail modal showing the business banner, logo, key metrics (capacity, points, status), description, contact info, opening hours, social links, and media gallery — all without leaving the page.</li>
                        <li><strong>Redeem Points (<code>/redeem-points</code>):</strong> Review and approve or decline customer point redemptions at attractions.</li>
                        <li><strong>Payout History (<code>/payouts</code>):</strong> Track partner revenue settlements, pending payouts, and approval statuses.</li>
                    </ul>
                </div>
            ),
        },
        {
            id: 'settings',
            title: 'Settings & Integrations',
            icon: <Settings className="size-5 text-pink-500" />,
            description: 'Stripe keys, email configurations, appearance, and CMS content.',
            content: (
                <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                    <p>
                        Configure global system behaviors and third-party integrations under <strong>Settings</strong>:
                    </p>
                    <div className="grid gap-2 text-xs sm:grid-cols-2">
                        <div className="rounded-md border p-2.5">
                            <span className="font-semibold text-foreground">Stripe Integration:</span> API keys, webhook endpoints, and live mode toggles.
                        </div>
                        <div className="rounded-md border p-2.5">
                            <span className="font-semibold text-foreground">Mail Settings:</span> SMTP credentials, sender email, and email templates.
                        </div>
                        <div className="rounded-md border p-2.5">
                            <span className="font-semibold text-foreground">Dynamic Pages:</span> CMS content editor for FAQ, Terms, and Privacy Policy.
                        </div>
                        <div className="rounded-md border p-2.5">
                            <span className="font-semibold text-foreground">Contact & Banner:</span> Manage contact details, social links, and homepage banners.
                        </div>
                    </div>
                </div>
            ),
        },
    ];


    const filteredSections = sections.filter((sec) => {
        const matchesSearch =
            sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sec.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'all' || sec.id === activeTab;
        return matchesSearch && matchesTab;
    });

    return (
        <>
            <Head title="Admin Dashboard Documentation" />
            <div className="container mx-auto max-w-6xl space-y-6 p-6">
                {/* Header Banner */}
                <div className="relative overflow-hidden rounded-2xl border border-sidebar-border bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 p-8 text-white shadow-md">
                    <div className="relative z-10 max-w-2xl space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-md">
                            <BookOpen className="size-3.5" />
                            Admin Knowledge Base
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                            Admin Dashboard Documentation
                        </h1>
                        <p className="text-sm text-white/80">
                            Complete operational guide for managing analytics, membership passes, users, attractions, redemptions, and system settings.
                        </p>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab('all')}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                                activeTab === 'all'
                                    ? 'bg-violet-600 text-white shadow-xs'
                                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
                            }`}
                        >
                            All Sections
                        </button>
                        {sections.map((sec) => (
                            <button
                                key={sec.id}
                                type="button"
                                onClick={() => setActiveTab(sec.id)}
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                                    activeTab === sec.id
                                        ? 'bg-violet-600 text-white shadow-xs'
                                        : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
                                }`}
                            >
                                {sec.title.split(' ')[0]}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search documentation..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 text-xs"
                        />
                    </div>
                </div>

                {/* Documentation Sections Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    {filteredSections.map((sec) => (
                        <Card key={sec.id} className="border-sidebar-border transition-all duration-200 hover:shadow-md">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-muted/60">
                                        {sec.icon}
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-bold">{sec.title}</CardTitle>
                                        <CardDescription className="text-xs">{sec.description}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="border-t border-border/40 pt-4">
                                {sec.content}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredSections.length === 0 && (
                    <div className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
                        No documentation sections found matching your search.
                    </div>
                )}
            </div>
        </>
    );
}

Docs.layout = {
    breadcrumbs: [{ title: 'Documentation', href: '/settings/docs' }],
};
