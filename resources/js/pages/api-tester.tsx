import { Head } from '@inertiajs/react';
import {
    Activity,
    Check,
    ChevronRight,
    Clock,
    Code2,
    Copy,
    Globe,
    Key,
    Lock,
    Play,
    RefreshCw,
    Search,
    Shield,
    Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type Endpoint = {
    id: string;
    group: string;
    title: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    path: string;
    auth: boolean;
    description?: string;
    payload: Record<string, any>;
};

const ENDPOINTS: Endpoint[] = [
    // 1. Authentication
    {
        id: 'auth_login',
        group: '1. Authentication',
        title: 'User Login',
        method: 'POST',
        path: '/login',
        auth: false,
        payload: {
            email: 'admin@admin.com',
            password: 'password',
        },
    },
    {
        id: 'auth_register',
        group: '1. Authentication',
        title: 'User Registration',
        method: 'POST',
        path: '/register',
        auth: false,
        payload: {
            name: 'John Doe',
            email: `johndoe_${Math.floor(Math.random() * 1000)}@example.com`,
            password: 'password123',
            password_confirmation: 'password123',
        },
    },
    {
        id: 'auth_verify_otp',
        group: '1. Authentication',
        title: 'Verify Registration OTP',
        method: 'POST',
        path: '/verify_otp',
        auth: false,
        payload: {
            email: 'john@example.com',
            otp: '1234',
        },
    },
    {
        id: 'auth_resend_otp',
        group: '1. Authentication',
        title: 'Resend OTP',
        method: 'POST',
        path: '/resend_otp',
        auth: false,
        payload: {
            email: 'john@example.com',
        },
    },
    {
        id: 'auth_social',
        group: '1. Authentication',
        title: 'Social Login (Google/Apple)',
        method: 'POST',
        path: '/login/social',
        auth: false,
        payload: {
            provider: 'google',
            provider_id: 'google_123456789',
            email: 'socialuser@example.com',
            name: 'Social User',
            avatar: 'https://via.placeholder.com/150',
        },
    },
    {
        id: 'auth_forgot',
        group: '1. Authentication',
        title: 'Forgot Password - Send OTP',
        method: 'POST',
        path: '/forgot-password',
        auth: false,
        payload: {
            email: 'john@example.com',
        },
    },
    {
        id: 'auth_forgot_otp',
        group: '1. Authentication',
        title: 'Forgot Password - Verify OTP',
        method: 'POST',
        path: '/forgot-verify-otp',
        auth: false,
        payload: {
            email: 'john@example.com',
            otp: '1234',
        },
    },
    {
        id: 'auth_reset',
        group: '1. Authentication',
        title: 'Reset Password',
        method: 'POST',
        path: '/reset-password',
        auth: false,
        payload: {
            email: 'john@example.com',
            password: 'newpassword123',
            password_confirmation: 'newpassword123',
        },
    },

    // 2. User Profile
    {
        id: 'profile_user',
        group: '2. User Profile',
        title: 'Get User Details',
        method: 'GET',
        path: '/user-detail',
        auth: true,
        payload: {},
    },
    {
        id: 'profile_update',
        group: '2. User Profile',
        title: 'Update Profile',
        method: 'POST',
        path: '/profile/update',
        auth: true,
        payload: {
            name: 'John Lowe Updated',
            phone: '+1987654321',
        },
    },
    {
        id: 'profile_change_pwd',
        group: '2. User Profile',
        title: 'Change Password',
        method: 'POST',
        path: '/change-password',
        auth: true,
        payload: {
            current_password: 'password123',
            password: 'newpassword456',
            password_confirmation: 'newpassword456',
        },
    },
    {
        id: 'profile_delete',
        group: '2. User Profile',
        title: 'Delete Account',
        method: 'POST',
        path: '/account-delete',
        auth: true,
        payload: {
            password: 'password123',
        },
    },
    {
        id: 'auth_logout',
        group: '2. User Profile',
        title: 'User Logout',
        method: 'POST',
        path: '/logout',
        auth: true,
        payload: {},
    },

    // 3. Plans & Discounts
    {
        id: 'plans_list',
        group: '3. Plans & Discounts',
        title: 'List All Subscription Plans',
        method: 'GET',
        path: '/plans',
        auth: false,
        payload: {},
    },
    {
        id: 'plans_single',
        group: '3. Plans & Discounts',
        title: 'Get Single Plan Details',
        method: 'GET',
        path: '/plans/1',
        auth: false,
        payload: {},
    },
    {
        id: 'plans_check_discount',
        group: '3. Plans & Discounts',
        title: 'Validate Coupon/Discount Code',
        method: 'POST',
        path: '/plans/check-discount',
        auth: false,
        payload: {
            code: 'LAUNCH20',
            plan_id: 1,
        },
    },
    {
        id: 'plans_create',
        group: '3. Plans & Discounts',
        title: 'Create Plan (Admin)',
        method: 'POST',
        path: '/plans',
        auth: true,
        payload: {
            name: 'Enterprise Pro',
            description: 'Full suite for enterprise',
            price: 99.0,
            discount_price: 79.0,
            interval: 'MONTHLY',
            call_credit: 5000,
            report_credit: 1000,
            playbook_credit: 200,
            calibration_credit: 50,
            is_active: true,
            is_trial: true,
            trial_period: 14,
            overages_rates: [
                { overages_type: 'CALL', overages_rate: 0.05 },
                { overages_type: 'REPORT', overages_rate: 0.15 },
            ],
        },
    },

    // 4. Subscriptions & Billing
    {
        id: 'sub_list',
        group: '4. Subscriptions & Billing',
        title: 'List User Subscriptions',
        method: 'GET',
        path: '/subscriptions',
        auth: true,
        payload: {},
    },
    {
        id: 'sub_create',
        group: '4. Subscriptions & Billing',
        title: 'Subscribe to Plan',
        method: 'POST',
        path: '/subscriptions',
        auth: true,
        payload: {
            plan_id: 1,
            discount_code: 'LAUNCH20',
        },
    },
    {
        id: 'sub_details',
        group: '4. Subscriptions & Billing',
        title: 'Subscription Details & Usages',
        method: 'GET',
        path: '/subscriptions/1',
        auth: true,
        payload: {},
    },
    {
        id: 'sub_overage',
        group: '4. Subscriptions & Billing',
        title: 'Record Plan Overusage',
        method: 'POST',
        path: '/subscriptions/1/overusage',
        auth: true,
        payload: {
            overusages_type: 'CALL',
            credit: 25,
        },
    },
    {
        id: 'sub_cancel',
        group: '4. Subscriptions & Billing',
        title: 'Cancel Subscription',
        method: 'POST',
        path: '/subscriptions/1/cancel',
        auth: true,
        payload: {},
    },
    {
        id: 'sub_billings',
        group: '4. Subscriptions & Billing',
        title: 'List Billing Invoices',
        method: 'GET',
        path: '/billings',
        auth: true,
        payload: {},
    },

    // 5. Support Tickets
    {
        id: 'ticket_list',
        group: '5. Support Tickets',
        title: 'List Support Tickets',
        method: 'GET',
        path: '/tickets',
        auth: true,
        payload: {},
    },
    {
        id: 'ticket_create',
        group: '5. Support Tickets',
        title: 'Create Support Ticket',
        method: 'POST',
        path: '/tickets',
        auth: true,
        payload: {
            category: 'TECHNICAL',
            priority: 'HIGH',
            subject: 'Test Issue with API',
            message: 'Testing the ticket creation endpoint via API tester.',
        },
    },
    {
        id: 'ticket_show',
        group: '5. Support Tickets',
        title: 'Get Ticket Details',
        method: 'GET',
        path: '/tickets/1',
        auth: true,
        payload: {},
    },
    {
        id: 'ticket_status',
        group: '5. Support Tickets',
        title: 'Update Ticket Status',
        method: 'PATCH',
        path: '/tickets/1/status',
        auth: true,
        payload: {
            status: 'RESOLVED',
        },
    },

    // 6. System & Pages
    {
        id: 'system_settings',
        group: '6. System & Pages',
        title: 'Get System Settings',
        method: 'GET',
        path: '/system-setting',
        auth: false,
        payload: {},
    },
    {
        id: 'faq_list',
        group: '6. System & Pages',
        title: 'List FAQs',
        method: 'GET',
        path: '/faq',
        auth: false,
        payload: {},
    },
    {
        id: 'pages_list',
        group: '6. System & Pages',
        title: 'List Dynamic Pages',
        method: 'GET',
        path: '/dynamic-pages',
        auth: false,
        payload: {},
    },
];

// Helper to normalize base URL for storage key
const normalizeBase = (url: string) => url.trim().replace(/\/+$/, '').toLowerCase();

export default function ApiTesterPage() {
    const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>(ENDPOINTS[0]);
    
    // Persistent Base URL
    const [baseUrl, setBaseUrlState] = useState<string>(() => {
        return localStorage.getItem('pitchprox_base_url') || window.location.origin;
    });

    // Persistent token mapping per Base URL: { [normalizedBaseUrl]: token }
    const [tokensMap, setTokensMap] = useState<Record<string, string>>(() => {
        try {
            return JSON.parse(localStorage.getItem('pitchprox_tokens_map') || '{}');
        } catch {
            return {};
        }
    });

    // Active token dynamically computed for current Base URL
    const token = useMemo(() => {
        const key = normalizeBase(baseUrl);
        return tokensMap[key] || '';
    }, [baseUrl, tokensMap]);

    // Update Base URL handler & persist
    const handleBaseUrlChange = (newUrl: string) => {
        setBaseUrlState(newUrl);
        localStorage.setItem('pitchprox_base_url', newUrl);
    };

    // Update Token for active Base URL & persist
    const saveTokenForCurrentBase = (newToken: string) => {
        const key = normalizeBase(baseUrl);
        const updated = { ...tokensMap, [key]: newToken.trim() };
        setTokensMap(updated);
        localStorage.setItem('pitchprox_tokens_map', JSON.stringify(updated));
    };

    // Clear Token for active Base URL
    const clearTokenForCurrentBase = () => {
        const key = normalizeBase(baseUrl);
        const updated = { ...tokensMap };
        delete updated[key];
        setTokensMap(updated);
        localStorage.setItem('pitchprox_tokens_map', JSON.stringify(updated));
    };
    
    // Persistent saved custom data per endpoint ID
    const [savedData, setSavedData] = useState<Record<string, { payload?: string; path?: string }>>(() => {
        try {
            return JSON.parse(localStorage.getItem('pitchprox_custom_data') || '{}');
        } catch {
            return {};
        }
    });

    const [customPath, setCustomPath] = useState<string>(() => {
        const saved = savedData[ENDPOINTS[0].id];
        return saved?.path || ENDPOINTS[0].path;
    });

    const [payloadText, setPayloadText] = useState<string>(() => {
        const saved = savedData[ENDPOINTS[0].id];
        if (saved?.payload !== undefined) return saved.payload;
        return JSON.stringify(ENDPOINTS[0].payload, null, 4);
    });

    // History stack for Undo / Redo (Ctrl+Z / Ctrl+Y)
    const [history, setHistory] = useState<string[]>([payloadText]);
    const [historyIndex, setHistoryIndex] = useState<number>(0);

    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [responseStatus, setResponseStatus] = useState<number | null>(null);
    const [responseTime, setResponseTime] = useState<number | null>(null);
    const [responseBody, setResponseBody] = useState<string>('// Select an endpoint and click "Send Request"');
    const [copied, setCopied] = useState(false);
    const [isAutoSaved, setIsAutoSaved] = useState(false);

    // Endpoint switch handler
    useEffect(() => {
        const saved = savedData[selectedEndpoint.id];
        const initialPath = saved?.path || selectedEndpoint.path;
        setCustomPath(initialPath);

        let initialPayload = '';
        if (saved?.payload !== undefined) {
            initialPayload = saved.payload;
        } else if (selectedEndpoint.method === 'GET' || Object.keys(selectedEndpoint.payload).length === 0) {
            initialPayload = selectedEndpoint.method === 'GET' ? '// GET request (No body payload required)' : '{}';
        } else {
            initialPayload = JSON.stringify(selectedEndpoint.payload, null, 4);
        }

        setPayloadText(initialPayload);
        setHistory([initialPayload]);
        setHistoryIndex(0);
    }, [selectedEndpoint.id]);

    // Save changes to localStorage
    const updatePayloadWithHistory = (newText: string) => {
        setPayloadText(newText);

        // Update Undo History stack (trim forward redo history if branching)
        const updatedHistory = history.slice(0, historyIndex + 1);
        if (updatedHistory[updatedHistory.length - 1] !== newText) {
            updatedHistory.push(newText);
            if (updatedHistory.length > 50) updatedHistory.shift(); // Limit to 50 entries
            setHistory(updatedHistory);
            setHistoryIndex(updatedHistory.length - 1);
        }

        // Save to persistent storage
        const updated = {
            ...savedData,
            [selectedEndpoint.id]: {
                ...savedData[selectedEndpoint.id],
                payload: newText,
            },
        };
        setSavedData(updated);
        localStorage.setItem('pitchprox_custom_data', JSON.stringify(updated));
        triggerAutoSaved();
    };

    const updateCustomPath = (newPath: string) => {
        setCustomPath(newPath);
        const updated = {
            ...savedData,
            [selectedEndpoint.id]: {
                ...savedData[selectedEndpoint.id],
                path: newPath,
            },
        };
        setSavedData(updated);
        localStorage.setItem('pitchprox_custom_data', JSON.stringify(updated));
        triggerAutoSaved();
    };

    const triggerAutoSaved = () => {
        setIsAutoSaved(true);
        setTimeout(() => setIsAutoSaved(false), 1500);
    };

    // Undo (Ctrl+Z)
    const handleUndo = () => {
        if (historyIndex > 0) {
            const prevIndex = historyIndex - 1;
            const prevText = history[prevIndex];
            setHistoryIndex(prevIndex);
            setPayloadText(prevText);

            const updated = {
                ...savedData,
                [selectedEndpoint.id]: { ...savedData[selectedEndpoint.id], payload: prevText },
            };
            setSavedData(updated);
            localStorage.setItem('pitchprox_custom_data', JSON.stringify(updated));
        }
    };

    // Redo (Ctrl+Y or Ctrl+Shift+Z)
    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            const nextIndex = historyIndex + 1;
            const nextText = history[nextIndex];
            setHistoryIndex(nextIndex);
            setPayloadText(nextText);

            const updated = {
                ...savedData,
                [selectedEndpoint.id]: { ...savedData[selectedEndpoint.id], payload: nextText },
            };
            setSavedData(updated);
            localStorage.setItem('pitchprox_custom_data', JSON.stringify(updated));
        }
    };

    // Textarea keyboard shortcuts: Tab indentation & Undo/Redo
    const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            if (e.shiftKey) {
                handleRedo();
            } else {
                handleUndo();
            }
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
            e.preventDefault();
            handleRedo();
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const textarea = e.currentTarget;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const value = textarea.value;
            const newValue = value.substring(0, start) + '    ' + value.substring(end);
            updatePayloadWithHistory(newValue);
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + 4;
            }, 0);
        }
    };

    // Reset current endpoint to default
    const handleResetDefault = () => {
        const defaultPayload =
            selectedEndpoint.method === 'GET' || Object.keys(selectedEndpoint.payload).length === 0
                ? selectedEndpoint.method === 'GET'
                    ? '// GET request (No body payload required)'
                    : '{}'
                : JSON.stringify(selectedEndpoint.payload, null, 4);

        setCustomPath(selectedEndpoint.path);
        setPayloadText(defaultPayload);
        setHistory([defaultPayload]);
        setHistoryIndex(0);

        const updated = { ...savedData };
        delete updated[selectedEndpoint.id];
        setSavedData(updated);
        localStorage.setItem('pitchprox_custom_data', JSON.stringify(updated));
    };

    const filteredEndpoints = useMemo(() => {
        if (!searchQuery.trim()) return ENDPOINTS;
        const q = searchQuery.toLowerCase();
        return ENDPOINTS.filter(
            (ep) =>
                ep.title.toLowerCase().includes(q) ||
                ep.path.toLowerCase().includes(q) ||
                ep.method.toLowerCase().includes(q),
        );
    }, [searchQuery]);

    // Grouping
    const groupedEndpoints = useMemo(() => {
        const groups: Record<string, Endpoint[]> = {};
        filteredEndpoints.forEach((ep) => {
            if (!groups[ep.group]) groups[ep.group] = [];
            groups[ep.group].push(ep);
        });
        return groups;
    }, [filteredEndpoints]);

    const handleSendRequest = async () => {
        setLoading(true);
        setResponseBody('// Sending request...');
        setResponseStatus(null);
        setResponseTime(null);

        const cleanBase = baseUrl.replace(/\/$/, '');
        const cleanPath = customPath.startsWith('/') ? customPath : `/${customPath}`;
        const fullUrl = `${cleanBase}/api${cleanPath}`;

        const headers: Record<string, string> = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };

        if (token.trim()) {
            headers['Authorization'] = `Bearer ${token.trim()}`;
        }

        const options: RequestInit = {
            method: selectedEndpoint.method,
            headers,
        };

        if (selectedEndpoint.method !== 'GET' && selectedEndpoint.method !== 'HEAD') {
            try {
                if (payloadText && !payloadText.startsWith('//')) {
                    options.body = JSON.stringify(JSON.parse(payloadText));
                }
            } catch (err: any) {
                setLoading(false);
                setResponseBody(`// JSON Syntax Error:\n${err.message}`);
                return;
            }
        }

        const startTime = performance.now();
        try {
            const res = await fetch(fullUrl, options);
            const duration = Math.round(performance.now() - startTime);
            setResponseTime(duration);
            setResponseStatus(res.status);

            const json = await res.json().catch(() => null);

            // Auto-store token per active Base URL on login/register/social response
            const extractedToken =
                json?.token ||
                json?.data?.token ||
                json?.access_token ||
                json?.data?.access_token ||
                json?.plainTextToken ||
                json?.data?.plainTextToken;

            if (extractedToken && typeof extractedToken === 'string') {
                saveTokenForCurrentBase(extractedToken);
            }

            setResponseBody(json ? JSON.stringify(json, null, 2) : `Status: ${res.status} ${res.statusText}`);
        } catch (error: any) {
            const duration = Math.round(performance.now() - startTime);
            setResponseTime(duration);
            setResponseStatus(0);
            setResponseBody(`// Network / Server Error:\n${error.message}\n\nPlease ensure your server is running.`);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(responseBody);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getMethodBadgeClass = (method: string) => {
        switch (method) {
            case 'GET':
                return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
            case 'POST':
                return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30';
            case 'PUT':
            case 'PATCH':
                return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
            case 'DELETE':
                return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
            default:
                return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
        }
    };

    const [isSidebarOpenOnMobile, setIsSidebarOpenOnMobile] = useState(false);

    return (
        <>
            <Head title="API Tester & Documentation" />

            <div className="flex flex-col flex-1 w-full min-h-[calc(100vh-5rem)] bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 lg:overflow-hidden font-sans rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                
                {/* Header Subbar (Responsive, Light & Dark Theme) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-[#1e293b]/70 backdrop-blur shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-gradient-to-tr from-[#0EADAB] to-teal-500 text-white shadow-md shadow-[#0EADAB]/20 shrink-0">
                                <Code2 className="size-5" />
                            </div>
                            <div>
                                <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span>REST API Tester & Console</span>
                                    <span className="px-2 py-0.5 text-[10px] font-mono uppercase rounded-full bg-[#0EADAB]/15 text-[#0EADAB] border border-[#0EADAB]/30 font-semibold">
                                        Live
                                    </span>
                                </h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Test backend endpoints directly from the browser</p>
                            </div>
                        </div>

                        {/* Mobile Sidebar Toggle Button */}
                        <button
                            onClick={() => setIsSidebarOpenOnMobile(!isSidebarOpenOnMobile)}
                            className="lg:hidden px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                        >
                            <span>Endpoints</span>
                            <ChevronRight className={`size-3.5 transition-transform duration-200 ${isSidebarOpenOnMobile ? 'rotate-90' : ''}`} />
                        </button>
                    </div>

                    {/* Global Configuration Inputs */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <Globe className="size-3.5 text-slate-400 shrink-0" />
                            <span className="text-slate-500 dark:text-slate-400 font-mono">Base:</span>
                            <input
                                type="text"
                                value={baseUrl}
                                onChange={(e) => handleBaseUrlChange(e.target.value)}
                                className="bg-transparent border-none p-0 text-[#0EADAB] font-mono text-xs flex-1 sm:w-40 md:w-48 focus:ring-0 outline-none truncate font-medium"
                            />
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <Key className="size-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                            <span className="text-slate-500 dark:text-slate-400 font-mono">Bearer:</span>
                            <input
                                type="password"
                                placeholder="Auto on Login / Token"
                                value={token}
                                onChange={(e) => saveTokenForCurrentBase(e.target.value)}
                                className="bg-transparent border-none p-0 text-emerald-600 dark:text-emerald-400 font-mono text-xs flex-1 sm:w-40 md:w-48 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-0 outline-none"
                            />
                            {token && (
                                <button
                                    onClick={clearTokenForCurrentBase}
                                    title="Clear Token for this Base URL"
                                    className="text-slate-400 hover:text-rose-500 ml-1 shrink-0 cursor-pointer"
                                >
                                    <Trash2 className="size-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content Layout (Sidebar + Request Area) */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    
                    {/* Endpoints Sidebar (Responsive Drawer/Panel) */}
                    <div className={`w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1e293b]/40 flex flex-col shrink-0 ${
                        isSidebarOpenOnMobile ? 'max-h-80' : 'hidden lg:flex'
                    } lg:max-h-none`}>
                        <div className="p-3 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-slate-50 dark:bg-[#1e293b] z-10">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 size-3.5 text-slate-400 dark:text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search endpoints..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-[#0EADAB] shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs max-h-72 lg:max-h-none">
                            {Object.entries(groupedEndpoints).map(([groupTitle, endpoints]) => (
                                <div key={groupTitle}>
                                    <div className="font-bold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 mb-1.5">
                                        {groupTitle}
                                    </div>
                                    <div className="space-y-1">
                                        {endpoints.map((ep) => {
                                            const isSelected = selectedEndpoint.id === ep.id;
                                            return (
                                                <button
                                                    key={ep.id}
                                                    onClick={() => {
                                                        setSelectedEndpoint(ep);
                                                        setIsSidebarOpenOnMobile(false);
                                                    }}
                                                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2 transition cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-[#0EADAB]/15 text-[#0EADAB] border border-[#0EADAB]/30 font-semibold shadow-sm'
                                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/80'
                                                    }`}
                                                >
                                                    <span
                                                        className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded border shrink-0 ${getMethodBadgeClass(
                                                            ep.method,
                                                        )}`}
                                                    >
                                                        {ep.method}
                                                    </span>
                                                    <span className="truncate flex-1 font-mono text-[11px]">{ep.path}</span>
                                                    {ep.auth && <Lock className="size-3 text-slate-400 dark:text-slate-500 shrink-0" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Request & Response Work Area */}
                    <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 gap-4 sm:gap-6 bg-slate-100/60 dark:bg-slate-950">
                        
                        {/* URL Bar & Execution Controls */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col gap-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                    <span
                                        className={`px-2.5 py-1 font-mono font-bold text-xs rounded-lg border shrink-0 ${getMethodBadgeClass(
                                            selectedEndpoint.method,
                                        )}`}
                                    >
                                        {selectedEndpoint.method}
                                    </span>
                                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{selectedEndpoint.title}</span>
                                </div>
                                <span
                                    className={`text-[10px] sm:text-[11px] px-2.5 py-1 rounded-md font-medium border w-fit ${
                                        selectedEndpoint.auth
                                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                    }`}
                                >
                                    {selectedEndpoint.auth ? '🔒 Requires Bearer Token' : '🌐 Public / Guest Endpoint'}
                                </span>
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 font-mono text-xs text-slate-800 dark:text-slate-300 focus-within:border-[#0EADAB] shadow-inner">
                                    <span className="text-slate-400 dark:text-slate-500 select-none mr-1 font-semibold">/api</span>
                                    <input
                                        type="text"
                                        value={customPath}
                                        onChange={(e) => updateCustomPath(e.target.value)}
                                        className="bg-transparent border-0 outline-none w-full text-slate-900 dark:text-white font-mono text-xs p-0 focus:ring-0"
                                    />
                                </div>

                                <button
                                    onClick={handleSendRequest}
                                    disabled={loading}
                                    className="px-5 py-2.5 bg-gradient-to-r from-[#0EADAB] to-teal-600 hover:from-[#0EADAB]/90 hover:to-teal-500 text-white font-semibold text-xs rounded-lg shadow-md shadow-[#0EADAB]/20 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer"
                                >
                                    {loading ? (
                                        <RefreshCw className="size-4 animate-spin text-white" />
                                    ) : (
                                        <Play className="size-4 fill-current" />
                                    )}
                                    <span>Send Request</span>
                                </button>
                            </div>
                        </div>

                        {/* Request Payload & Response Panes (Fully Responsive Grid) */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 flex-1">
                            
                            {/* Request Payload */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col min-h-[300px] shadow-sm">
                                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">Request Body (JSON)</span>
                                        {isAutoSaved && (
                                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 animate-pulse">
                                                Saved
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {selectedEndpoint.method !== 'GET' && (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={handleUndo}
                                                    disabled={historyIndex <= 0}
                                                    title="Undo (Ctrl+Z)"
                                                    className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 transition cursor-pointer"
                                                >
                                                    Undo
                                                </button>
                                                <button
                                                    onClick={handleRedo}
                                                    disabled={historyIndex >= history.length - 1}
                                                    title="Redo (Ctrl+Y)"
                                                    className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 transition cursor-pointer"
                                                >
                                                    Redo
                                                </button>
                                            </div>
                                        )}
                                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">JSON</span>
                                    </div>
                                </div>
                                <textarea
                                    value={payloadText}
                                    onChange={(e) => updatePayloadWithHistory(e.target.value)}
                                    onKeyDown={handleTextareaKeyDown}
                                    disabled={selectedEndpoint.method === 'GET'}
                                    spellCheck={false}
                                    className="flex-1 w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 font-mono text-xs text-emerald-600 dark:text-emerald-400 leading-relaxed outline-none focus:border-[#0EADAB] transition resize-y min-h-[220px] lg:min-h-[280px] disabled:opacity-50 shadow-inner"
                                />
                                <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                                    <span className="text-[10px] text-slate-400">Ctrl+Z: Undo | Tab: Indent</span>
                                    {selectedEndpoint.method !== 'GET' && (
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={handleResetDefault}
                                                className="text-slate-400 hover:text-rose-500 transition text-[11px] cursor-pointer"
                                            >
                                                Reset Default
                                            </button>
                                            <button
                                                onClick={() => {
                                                    try {
                                                        const formatted = JSON.stringify(JSON.parse(payloadText), null, 4);
                                                        updatePayloadWithHistory(formatted);
                                                    } catch (e: any) {
                                                        alert('Invalid JSON: ' + e.message);
                                                    }
                                                }}
                                                className="text-slate-600 dark:text-slate-300 hover:text-[#0EADAB] transition font-medium text-[11px] cursor-pointer"
                                            >
                                                Format JSON
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Response Pane */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col min-h-[300px] shadow-sm">
                                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">Response</span>
                                        {responseStatus !== null && (
                                            <span
                                                className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${
                                                    responseStatus >= 200 && responseStatus < 300
                                                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                                                }`}
                                            >
                                                {responseStatus}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {responseTime !== null && (
                                            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                <Clock className="size-3" />
                                                {responseTime} ms
                                            </span>
                                        )}
                                        <button
                                            onClick={copyToClipboard}
                                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs transition flex items-center gap-1 border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer"
                                        >
                                            {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                                            <span>{copied ? 'Copied' : 'Copy'}</span>
                                        </button>
                                    </div>
                                </div>
                                <pre className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-800 dark:text-slate-200 overflow-y-auto leading-relaxed select-text min-h-[220px] lg:min-h-[280px] whitespace-pre-wrap break-words shadow-inner">
                                    {responseBody}
                                </pre>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}
