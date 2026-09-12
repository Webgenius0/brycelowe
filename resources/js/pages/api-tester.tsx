import { Head } from '@inertiajs/react';
import {
    Activity,
    Check,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    ChevronsUpDown,
    Clock,
    Code2,
    Copy,
    Folder,
    FolderOpen,
    Globe,
    Key,
    Layers,
    Lock,
    Play,
    RefreshCw,
    Search,
    Shield,
    Trash2,
    User,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type Endpoint = {
    id: string;
    group: string;
    title: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    path: string;
    auth: boolean;
    description?: string;
    payload: Record<string, any>;
    isFileUpload?: boolean;
    fileParamName?: string;
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

    // 2. User Profile, Preferences & Security
    {
        id: 'profile_user',
        group: '2. User Profile & Preferences',
        title: 'Get User Details',
        method: 'GET',
        path: '/user-detail',
        auth: true,
        payload: {},
    },
    {
        id: 'profile_update_name',
        group: '2. User Profile & Preferences',
        title: 'Update Profile Name (Full Name Only)',
        method: 'POST',
        path: '/profile/update',
        auth: true,
        payload: {
            full_name: 'John Lowe Updated',
        },
    },
    {
        id: 'profile_upload_avatar',
        group: '2. User Profile & Preferences',
        title: 'Upload Profile Avatar',
        method: 'POST',
        path: '/profile/avatar',
        auth: true,
        isFileUpload: true,
        fileParamName: 'avatar',
        payload: {
            note: 'Attach an image file (.jpg, .jpeg, .png, .webp, .gif) to upload as user avatar.',
        },
    },
    {
        id: 'profile_delete_avatar',
        group: '2. User Profile & Preferences',
        title: 'Delete Avatar',
        method: 'DELETE',
        path: '/profile/avatar',
        auth: true,
        payload: {},
    },
    {
        id: 'profile_get_preferences',
        group: '2. User Profile & Preferences',
        title: 'Get Language & Timezone Preferences',
        method: 'GET',
        path: '/profile/preferences',
        auth: true,
        payload: {},
    },
    {
        id: 'profile_update_preferences',
        group: '2. User Profile & Preferences',
        title: 'Update Language & Timezone',
        method: 'POST',
        path: '/profile/preferences',
        auth: true,
        payload: {
            language: 'en',
            timezone: 'America/Chicago',
        },
    },
    {
        id: 'profile_get_notifications',
        group: '2. User Profile & Preferences',
        title: 'Get Notification Preferences',
        method: 'GET',
        path: '/profile/notifications',
        auth: true,
        payload: {},
    },
    {
        id: 'profile_update_notifications',
        group: '2. User Profile & Preferences',
        title: 'Update Notification Preferences',
        method: 'POST',
        path: '/profile/notifications',
        auth: true,
        payload: {
            in_app_notifications: true,
            call_reminders: true,
            follow_up_reminders: true,
            ai_insight_alerts: true,
            billing_alerts: true,
            product_updates: true,
        },
    },
    {
        id: 'profile_2fa_status',
        group: '2. User Profile & Preferences',
        title: 'Get 2FA Security Status',
        method: 'GET',
        path: '/profile/2fa',
        auth: true,
        payload: {},
    },
    {
        id: 'profile_2fa_toggle',
        group: '2. User Profile & Preferences',
        title: 'Toggle / Enable 2FA',
        method: 'POST',
        path: '/profile/2fa/toggle',
        auth: true,
        payload: {
            enable: true,
        },
    },
    {
        id: 'profile_login_activity',
        group: '2. User Profile & Preferences',
        title: 'Get Login Activity History',
        method: 'GET',
        path: '/profile/login-activity',
        auth: true,
        payload: {},
    },
    {
        id: 'profile_devices_list',
        group: '2. User Profile & Preferences',
        title: 'Get Active Devices & Sessions',
        method: 'GET',
        path: '/profile/devices',
        auth: true,
        payload: {},
    },
    {
        id: 'profile_logout_other_devices',
        group: '2. User Profile & Preferences',
        title: 'Log out of all other devices',
        method: 'POST',
        path: '/profile/devices/logout-others',
        auth: true,
        payload: {},
    },
    {
        id: 'profile_change_pwd',
        group: '2. User Profile & Preferences',
        title: 'Change Password',
        method: 'POST',
        path: '/change-password',
        auth: true,
        payload: {
            old_password: 'password',
            password: 'newpassword123',
            password_confirmation: 'newpassword123',
        },
    },
    {
        id: 'auth_logout',
        group: '2. User Profile & Preferences',
        title: 'User Logout',
        method: 'POST',
        path: '/logout',
        auth: true,
        payload: {},
    },
    {
        id: 'profile_delete',
        group: '2. User Profile & Preferences',
        title: 'Delete Account',
        method: 'POST',
        path: '/account-delete',
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

    // 6. Prospect Mail & Support
    {
        id: 'mail_send',
        group: '6. Prospect Mail & Support',
        title: 'Send Prospect Email (with Tracking & CC/BCC)',
        method: 'POST',
        path: '/mail/send',
        auth: true,
        payload: {
            to: 'prospect@example.com',
            cc: 'team@pitchprox.com',
            subject: 'Exclusive update on your property valuation',
            message: 'Hi {First Name},\n\nI wanted to share the latest market insights for {Property Address}.\n\nBest regards,\nPitchProX Team',
            is_tracked: true,
        },
    },
    {
        id: 'mail_recents',
        group: '6. Prospect Mail & Support',
        title: 'List Recent Prospect Emails',
        method: 'GET',
        path: '/mail/recents',
        auth: true,
        payload: {},
    },
    {
        id: 'mail_templates',
        group: '6. Prospect Mail & Support',
        title: 'Get Quick Email Templates',
        method: 'GET',
        path: '/mail/templates',
        auth: true,
        payload: {},
    },
    {
        id: 'mail_ai_assist',
        group: '6. Prospect Mail & Support',
        title: 'AI Email Assistant Copy Generator',
        method: 'POST',
        path: '/mail/ai-assist',
        auth: true,
        payload: {
            prompt: 'Follow up after an initial phone consultation regarding property listing',
            tone: 'Professional',
            recipient_name: 'Sarah',
            property_address: '742 Evergreen Terrace',
        },
    },

    // 7. System & Pages (Public)
    {
        id: 'system_settings',
        group: '7. System & Pages (Public)',
        title: 'Get System Settings',
        method: 'GET',
        path: '/system-setting',
        auth: false,
        payload: {},
    },
    {
        id: 'faq_list',
        group: '7. System & Pages (Public)',
        title: 'List FAQs',
        method: 'GET',
        path: '/faq',
        auth: false,
        payload: {},
    },
    {
        id: 'pages_list',
        group: '7. System & Pages (Public)',
        title: 'List Dynamic Pages',
        method: 'GET',
        path: '/dynamic-pages',
        auth: false,
        payload: {},
    },

    // ==========================================
    // ADMIN APIs (Requires SUPERADMIN / Admin)
    // ==========================================

    // Admin 1. Dashboard & Analytics
    {
        id: 'admin_dashboard_stats',
        group: 'Admin 1. Dashboard & Analytics',
        title: 'Get Admin Dashboard Stats & KPIs',
        method: 'GET',
        path: '/admin/dashboard/stats',
        auth: true,
        payload: {},
    },
    {
        id: 'admin_dashboard_charts',
        group: 'Admin 1. Dashboard & Analytics',
        title: 'Get Admin Timeline & Charts Analytics',
        method: 'GET',
        path: '/admin/dashboard/charts',
        auth: true,
        payload: {},
    },

    // Admin 2. User & Role Management
    {
        id: 'admin_users_list',
        group: 'Admin 2. User & Role Management',
        title: 'List All Users (Paginated & Filterable)',
        method: 'GET',
        path: '/admin/users?page=1&per_page=15',
        auth: true,
        payload: {},
    },
    {
        id: 'admin_users_create',
        group: 'Admin 2. User & Role Management',
        title: 'Create User / Admin Account',
        method: 'POST',
        path: '/admin/users',
        auth: true,
        payload: {
            name: 'New Admin User',
            email: `admin_${Math.floor(Math.random() * 1000)}@pitchprox.com`,
            password: 'secretPassword123',
            role: 'Admin',
            status: 'Active',
            phone: '+1 555-0199',
            address: '100 Main St, Austin, TX',
        },
    },
    {
        id: 'admin_users_roles',
        group: 'Admin 2. User & Role Management',
        title: 'List Available Roles',
        method: 'GET',
        path: '/admin/users/roles/list',
        auth: true,
        payload: {},
    },
    {
        id: 'admin_users_show',
        group: 'Admin 2. User & Role Management',
        title: 'Get User Details',
        method: 'GET',
        path: '/admin/users/1',
        auth: true,
        payload: {},
    },
    {
        id: 'admin_users_update',
        group: 'Admin 2. User & Role Management',
        title: 'Update User Profile / Role',
        method: 'PATCH',
        path: '/admin/users/1',
        auth: true,
        payload: {
            name: 'Updated Admin Name',
            role: 'SUPERADMIN',
            status: 'Active',
        },
    },
    {
        id: 'admin_users_status',
        group: 'Admin 2. User & Role Management',
        title: 'Update User Status (Active / Inactive / Banned)',
        method: 'POST',
        path: '/admin/users/1/status',
        auth: true,
        payload: {
            status: 'Active',
        },
    },
    {
        id: 'admin_users_delete',
        group: 'Admin 2. User & Role Management',
        title: 'Delete User Account',
        method: 'DELETE',
        path: '/admin/users/1',
        auth: true,
        payload: {},
    },

    // Admin 3. Plans & Pricing
    {
        id: 'admin_plans_list',
        group: 'Admin 3. Plans & Pricing Management',
        title: 'List All Pricing Plans',
        method: 'GET',
        path: '/admin/plans',
        auth: true,
        payload: {},
    },
    {
        id: 'admin_plans_create',
        group: 'Admin 3. Plans & Pricing Management',
        title: 'Create Pricing Plan',
        method: 'POST',
        path: '/admin/plans',
        auth: true,
        payload: {
            name: 'Enterprise Plus',
            description: 'Custom plan with unlimited call credits and 24/7 dedicated support.',
            price: 299.00,
            discount_price: 249.00,
            interval: 'monthly',
            call_credit: 1000,
            report_credit: 50,
            playbook_credit: 25,
            calibration_credit: 20,
            is_active: true,
        },
    },
    {
        id: 'admin_plans_update',
        group: 'Admin 3. Plans & Pricing Management',
        title: 'Update Plan Details',
        method: 'PATCH',
        path: '/admin/plans/1',
        auth: true,
        payload: {
            price: 199.00,
            discount_price: 149.00,
            call_credit: 500,
        },
    },
    {
        id: 'admin_plans_toggle',
        group: 'Admin 3. Plans & Pricing Management',
        title: 'Toggle Plan Active Status',
        method: 'POST',
        path: '/admin/plans/1/toggle',
        auth: true,
        payload: {},
    },
    {
        id: 'admin_plans_delete',
        group: 'Admin 3. Plans & Pricing Management',
        title: 'Delete Pricing Plan',
        method: 'DELETE',
        path: '/admin/plans/1',
        auth: true,
        payload: {},
    },

    // Admin 4. Subscriptions & Billing Monitoring
    {
        id: 'admin_subs_list',
        group: 'Admin 4. Subscriptions & Billing Monitoring',
        title: 'List All Subscriptions',
        method: 'GET',
        path: '/admin/subscriptions',
        auth: true,
        payload: {},
    },
    {
        id: 'admin_subs_show',
        group: 'Admin 4. Subscriptions & Billing Monitoring',
        title: 'Get Subscription Details & Invoices',
        method: 'GET',
        path: '/admin/subscriptions/1',
        auth: true,
        payload: {},
    },
    {
        id: 'admin_subs_status',
        group: 'Admin 4. Subscriptions & Billing Monitoring',
        title: 'Update Subscription Status',
        method: 'POST',
        path: '/admin/subscriptions/1/status',
        auth: true,
        payload: {
            status: 'Active',
        },
    },
    {
        id: 'admin_subs_overusage',
        group: 'Admin 4. Subscriptions & Billing Monitoring',
        title: 'Record Plan Overusage Credit',
        method: 'POST',
        path: '/admin/subscriptions/1/overusage',
        auth: true,
        payload: {
            overusages_type: 'CALL',
            credit: 50,
            amount: 15.00,
        },
    },

    // Admin 5. Company Profiles
    {
        id: 'admin_companies_list',
        group: 'Admin 5. Company Profiles',
        title: 'List Registered Companies',
        method: 'GET',
        path: '/admin/companies',
        auth: true,
        payload: {},
    },
    {
        id: 'admin_companies_show',
        group: 'Admin 5. Company Profiles',
        title: 'Get Company Details',
        method: 'GET',
        path: '/admin/companies/1',
        auth: true,
        payload: {},
    },
    {
        id: 'admin_companies_update',
        group: 'Admin 5. Company Profiles',
        title: 'Update Company Profile',
        method: 'PATCH',
        path: '/admin/companies/1',
        auth: true,
        payload: {
            company_name: 'Acme Corp Global',
            industry: 'SaaS Technology',
        },
    },

    // Admin 6. Support Tickets
    {
        id: 'admin_tickets_list',
        group: 'Admin 6. Support Tickets Resolution',
        title: 'List Support Tickets (Admin View)',
        method: 'GET',
        path: '/admin/tickets?status=OPEN',
        auth: true,
        payload: {},
    },
    {
        id: 'admin_tickets_show',
        group: 'Admin 6. Support Tickets Resolution',
        title: 'Get Ticket Details & Thread',
        method: 'GET',
        path: '/admin/tickets/1',
        auth: true,
        payload: {},
    },
    {
        id: 'admin_tickets_status',
        group: 'Admin 6. Support Tickets Resolution',
        title: 'Update Ticket Status & Priority',
        method: 'POST',
        path: '/admin/tickets/1/status',
        auth: true,
        payload: {
            status: 'RESOLVED',
            priority: 'MEDIUM',
        },
    },

    // Admin 7. System, Dynamic Pages & FAQs
    {
        id: 'admin_system_show',
        group: 'Admin 7. System, Pages & FAQs',
        title: 'Get System Settings',
        method: 'GET',
        path: '/admin/system-settings',
        auth: true,
        payload: {},
    },
    {
        id: 'admin_system_update',
        group: 'Admin 7. System, Pages & FAQs',
        title: 'Update System Settings',
        method: 'POST',
        path: '/admin/system-settings',
        auth: true,
        payload: {
            site_name: 'Pitchprox Platform',
            site_title: 'AI Sales Analytics & Training Platform',
            email: 'support@pitchprox.com',
            phone: '+1 800-555-0199',
            address: '123 Tech Blvd, San Francisco, CA',
        },
    },
    {
        id: 'admin_pages_list',
        group: 'Admin 7. System, Pages & FAQs',
        title: 'List Dynamic Pages (Admin)',
        method: 'GET',
        path: '/admin/pages',
        auth: true,
        payload: {},
    },
    {
        id: 'admin_pages_create',
        group: 'Admin 7. System, Pages & FAQs',
        title: 'Create Dynamic Page',
        method: 'POST',
        path: '/admin/pages',
        auth: true,
        payload: {
            page_title: 'Privacy Policy',
            page_subtitle: 'Our commitment to data privacy',
            page_content: '<p>This is the official privacy policy of Pitchprox...</p>',
            status: 'Active',
        },
    },
    {
        id: 'admin_faqs_list',
        group: 'Admin 7. System, Pages & FAQs',
        title: 'List FAQs (Admin)',
        method: 'GET',
        path: '/admin/faqs',
        auth: true,
        payload: {},
    },
    {
        id: 'admin_faqs_create',
        group: 'Admin 7. System, Pages & FAQs',
        title: 'Create FAQ',
        method: 'POST',
        path: '/admin/faqs',
        auth: true,
        payload: {
            question: 'How do call credits work?',
            answer: 'Call credits are consumed based on the duration and model analyzed per audio call.',
            serial: 1,
            status: 'Active',
        },
    },

    // Admin 8. Prospect Emails & Template Management
    {
        id: 'admin_mail_list',
        group: 'Admin 8. Prospect Emails & Templates',
        title: 'List All Prospect Emails (Global Platform View)',
        method: 'GET',
        path: '/admin/mail/emails?page=1&per_page=15',
        auth: true,
        payload: {},
    },
    {
        id: 'admin_mail_show',
        group: 'Admin 8. Prospect Emails & Templates',
        title: 'Get Prospect Email Details',
        method: 'GET',
        path: '/admin/mail/emails/1',
        auth: true,
        payload: {},
    },
    {
        id: 'admin_mail_templates_list',
        group: 'Admin 8. Prospect Emails & Templates',
        title: 'List Email Templates (Admin)',
        method: 'GET',
        path: '/admin/mail/templates',
        auth: true,
        payload: {},
    },
    {
        id: 'admin_mail_templates_create',
        group: 'Admin 8. Prospect Emails & Templates',
        title: 'Create Global Email Template (Admin)',
        method: 'POST',
        path: '/admin/mail/templates',
        auth: true,
        payload: {
            title: 'Q3 Market Opportunity',
            subject: 'Exclusive investment updates for {Property Address}',
            body: 'Hi {First Name},\n\nWe have identified prime buyer demand for {Property Address}...\n\nBest regards,\nPitchProX Team',
            category: 'Marketing',
            is_system: true,
        },
    },
    {
        id: 'admin_mail_send',
        group: 'Admin 8. Prospect Emails & Templates',
        title: 'Send Prospect Email (as Superadmin)',
        method: 'POST',
        path: '/admin/mail/send',
        auth: true,
        payload: {
            to: 'client@company.com',
            subject: 'System Announcement & Market Report',
            message: 'Hello {First Name},\n\nHere is your requested monthly analysis.\n\nBest regards,\nExecutive Team',
            is_tracked: true,
        },
    },
];

// Helper to normalize base URL for storage key
const normalizeBase = (url: string) => url.trim().replace(/\/+$/, '').toLowerCase();

type EnvironmentConfig = {
    id: string;
    name: string;
    baseUrl: string;
    token: string;
};

const DEFAULT_ENVIRONMENTS: Record<string, EnvironmentConfig> = {
    local: {
        id: 'local',
        name: 'Local',
        baseUrl: typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:8000',
        token: '',
    },
    live: {
        id: 'live',
        name: 'Live / Staging',
        baseUrl: 'https://staging.pitchprox.com',
        token: '',
    },
    production: {
        id: 'production',
        name: 'Production',
        baseUrl: 'https://api.pitchprox.com',
        token: '',
    },
};

export default function ApiTesterPage() {
    const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>(ENDPOINTS[0]);
    
    // Active Environment ID ('local' | 'live' | 'production')
    const [activeEnv, setActiveEnv] = useState<string>(() => {
        return localStorage.getItem('pitchprox_active_env') || 'local';
    });

    // Persistent multi-environment map: { [envId]: EnvironmentConfig }
    const [environments, setEnvironments] = useState<Record<string, EnvironmentConfig>>(() => {
        try {
            const saved = localStorage.getItem('pitchprox_environments_v3');
            if (saved) {
                return JSON.parse(saved);
            }
            const legacyBaseUrl = localStorage.getItem('pitchprox_base_url') || (typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:8000');
            const legacyTokens = JSON.parse(localStorage.getItem('pitchprox_tokens_map') || '{}');
            const legacyToken = legacyTokens[normalizeBase(legacyBaseUrl)] || '';

            return {
                ...DEFAULT_ENVIRONMENTS,
                local: {
                    ...DEFAULT_ENVIRONMENTS.local,
                    baseUrl: legacyBaseUrl,
                    token: legacyToken,
                },
            };
        } catch {
            return DEFAULT_ENVIRONMENTS;
        }
    });

    // Active environment's Base URL and Bearer Token
    const currentEnv = environments[activeEnv] || environments['local'] || DEFAULT_ENVIRONMENTS.local;
    const baseUrl = currentEnv.baseUrl || '';
    const token = currentEnv.token || '';

    // Switch active environment variant
    const handleEnvChange = (newEnvKey: string) => {
        setActiveEnv(newEnvKey);
        localStorage.setItem('pitchprox_active_env', newEnvKey);
    };

    // Update Base URL for active environment & persist
    const handleBaseUrlChange = (newUrl: string) => {
        setEnvironments((prev) => {
            const updated = {
                ...prev,
                [activeEnv]: {
                    ...(prev[activeEnv] || { id: activeEnv, name: activeEnv, token: '' }),
                    baseUrl: newUrl,
                },
            };
            localStorage.setItem('pitchprox_environments_v3', JSON.stringify(updated));
            return updated;
        });
    };

    // Update Token for active environment & persist
    const handleTokenChange = (newToken: string) => {
        setEnvironments((prev) => {
            const updated = {
                ...prev,
                [activeEnv]: {
                    ...(prev[activeEnv] || { id: activeEnv, name: activeEnv, baseUrl: '' }),
                    token: newToken.trim(),
                },
            };
            localStorage.setItem('pitchprox_environments_v3', JSON.stringify(updated));
            return updated;
        });
    };

    // Clear Token for active environment
    const clearTokenForCurrentEnv = () => {
        setEnvironments((prev) => {
            const updated = {
                ...prev,
                [activeEnv]: {
                    ...(prev[activeEnv] || { id: activeEnv, name: activeEnv, baseUrl: '' }),
                    token: '',
                },
            };
            localStorage.setItem('pitchprox_environments_v3', JSON.stringify(updated));
            return updated;
        });
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
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Endpoint switch handler
    useEffect(() => {
        const saved = savedData[selectedEndpoint.id];
        const initialPath = saved?.path || selectedEndpoint.path;
        setCustomPath(initialPath);
        setSelectedFile(null);

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

    // Manual & Shortcut Save Handler (Ctrl+S)
    const handleSaveCurrent = () => {
        const updated = {
            ...savedData,
            [selectedEndpoint.id]: {
                ...savedData[selectedEndpoint.id],
                path: customPath,
                payload: payloadText,
            },
        };
        setSavedData(updated);
        localStorage.setItem('pitchprox_custom_data', JSON.stringify(updated));
        triggerAutoSaved();
    };

    // Global Keydown Listener to intercept Ctrl+S across the entire page
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                e.preventDefault(); // Prevent browser "Save webpage" dialog
                handleSaveCurrent();
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [selectedEndpoint.id, customPath, payloadText, savedData]);

    // Textarea keyboard shortcuts: Ctrl+S save, Tab indentation & Undo/Redo
    const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
            e.preventDefault();
            handleSaveCurrent();
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
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

    // Tab state: 'user' | 'admin' | 'all'
    const [activeTab, setActiveTab] = useState<'user' | 'admin' | 'all'>('user');

    const userEndpoints = useMemo(
        () => ENDPOINTS.filter((ep) => !ep.group.startsWith('Admin') && !ep.path.startsWith('/admin')),
        [],
    );
    const adminEndpoints = useMemo(
        () => ENDPOINTS.filter((ep) => ep.group.startsWith('Admin') || ep.path.startsWith('/admin')),
        [],
    );

    const currentTabEndpoints = useMemo(() => {
        if (activeTab === 'user') return userEndpoints;
        if (activeTab === 'admin') return adminEndpoints;
        return ENDPOINTS;
    }, [activeTab, userEndpoints, adminEndpoints]);

    const filteredEndpoints = useMemo(() => {
        if (!searchQuery.trim()) return currentTabEndpoints;
        const q = searchQuery.toLowerCase();
        return currentTabEndpoints.filter(
            (ep) =>
                ep.title.toLowerCase().includes(q) ||
                ep.path.toLowerCase().includes(q) ||
                ep.method.toLowerCase().includes(q) ||
                ep.group.toLowerCase().includes(q),
        );
    }, [searchQuery, currentTabEndpoints]);

    // Grouping
    const groupedEndpoints = useMemo(() => {
        const groups: Record<string, Endpoint[]> = {};
        filteredEndpoints.forEach((ep) => {
            if (!groups[ep.group]) groups[ep.group] = [];
            groups[ep.group].push(ep);
        });
        return groups;
    }, [filteredEndpoints]);

    // Environment Dropdown menu state & ref
    const [isEnvMenuOpen, setIsEnvMenuOpen] = useState(false);
    const envMenuRef = useRef<HTMLDivElement>(null);

    // Section collapse toggle state
    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (envMenuRef.current && !envMenuRef.current.contains(e.target as Node)) {
                setIsEnvMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleGroup = (groupTitle: string) => {
        setCollapsedGroups((prev) => ({
            ...prev,
            [groupTitle]: !prev[groupTitle],
        }));
    };

    const toggleAllGroups = () => {
        const allCollapsed = Object.keys(groupedEndpoints).every((key) => !!collapsedGroups[key]);
        if (allCollapsed) {
            setCollapsedGroups({});
        } else {
            const next: Record<string, boolean> = {};
            Object.keys(groupedEndpoints).forEach((key) => {
                next[key] = true;
            });
            setCollapsedGroups(next);
        }
    };

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
        };

        if (token.trim()) {
            headers['Authorization'] = `Bearer ${token.trim()}`;
        }

        const options: RequestInit = {
            method: selectedEndpoint.method,
            headers,
        };

        if (selectedEndpoint.isFileUpload && selectedFile) {
            const formData = new FormData();
            formData.append(selectedEndpoint.fileParamName || 'avatar', selectedFile);
            options.body = formData;
        } else if (selectedEndpoint.method !== 'GET' && selectedEndpoint.method !== 'HEAD') {
            headers['Content-Type'] = 'application/json';
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
                handleTokenChange(extractedToken);
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

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                    height: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(148, 163, 184, 0.25);
                    border-radius: 9999px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(14, 173, 171, 0.6);
                }
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(148, 163, 184, 0.25) transparent;
                }
            `}</style>

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
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                        {/* Custom Environment Variant Selector */}
                        <div className="relative" ref={envMenuRef}>
                            <button
                                type="button"
                                onClick={() => setIsEnvMenuOpen(!isEnvMenuOpen)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-[#0EADAB]/50 dark:hover:border-[#0EADAB]/50 shadow-sm transition cursor-pointer text-xs group"
                            >
                                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 font-mono">Env:</span>
                                <span
                                    className={`size-2 rounded-full shrink-0 ${
                                        activeEnv === 'local'
                                            ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                                            : activeEnv === 'live'
                                            ? 'bg-amber-500 shadow-sm shadow-amber-500/50'
                                            : 'bg-rose-500 shadow-sm shadow-rose-500/50'
                                    }`}
                                />
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    {environments[activeEnv]?.name || activeEnv}
                                </span>
                                <ChevronDown className={`size-3.5 text-slate-400 transition-transform duration-200 ${isEnvMenuOpen ? 'rotate-180 text-[#0EADAB]' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isEnvMenuOpen && (
                                <div className="absolute left-0 mt-1.5 w-60 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 mb-1">
                                        Select Environment
                                    </div>
                                    {Object.entries(environments).map(([key, env]) => {
                                        const isSelected = activeEnv === key;
                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => {
                                                    handleEnvChange(key);
                                                    setIsEnvMenuOpen(false);
                                                }}
                                                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-[#0EADAB]/10 text-[#0EADAB] font-semibold'
                                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span
                                                        className={`size-2 rounded-full shrink-0 ${
                                                            key === 'local'
                                                                ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                                                                : key === 'live'
                                                                ? 'bg-amber-500 shadow-sm shadow-amber-500/50'
                                                                : 'bg-rose-500 shadow-sm shadow-rose-500/50'
                                                        }`}
                                                    />
                                                    <div className="min-w-0">
                                                        <div className="text-xs truncate">{env.name}</div>
                                                        <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate max-w-[140px]">
                                                            {env.baseUrl || 'No base URL'}
                                                        </div>
                                                    </div>
                                                </div>
                                                {isSelected && <Check className="size-3.5 text-[#0EADAB] shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Base URL Input */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm flex-1 sm:flex-initial">
                            <Globe className="size-3.5 text-slate-400 shrink-0" />
                            <span className="text-slate-500 dark:text-slate-400 font-mono">Base:</span>
                            <input
                                type="text"
                                value={baseUrl}
                                onChange={(e) => handleBaseUrlChange(e.target.value)}
                                placeholder="http://127.0.0.1:8000"
                                className="bg-transparent border-none p-0 text-[#0EADAB] font-mono text-xs flex-1 sm:w-40 md:w-52 focus:ring-0 outline-none truncate font-medium"
                            />
                        </div>

                        {/* Bearer Token Input */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm flex-1 sm:flex-initial">
                            <Key className="size-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                            <span className="text-slate-500 dark:text-slate-400 font-mono">Bearer:</span>
                            <input
                                type="password"
                                placeholder={`Token (${environments[activeEnv]?.name || 'Env'})`}
                                value={token}
                                onChange={(e) => handleTokenChange(e.target.value)}
                                className="bg-transparent border-none p-0 text-emerald-600 dark:text-emerald-400 font-mono text-xs flex-1 sm:w-36 md:w-44 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-0 outline-none"
                            />
                            {token && (
                                <button
                                    onClick={clearTokenForCurrentEnv}
                                    title={`Clear Token for ${environments[activeEnv]?.name || 'active'} environment`}
                                    className="text-slate-400 hover:text-rose-500 ml-1 shrink-0 cursor-pointer transition"
                                >
                                    <Trash2 className="size-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content Layout (Sidebar + Request Area) */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    
                    {/* Endpoints Sidebar (Fixed Width, Collapsible Sections & Sleek Scrollbar) */}
                    <div className={`w-full lg:w-[320px] xl:w-[340px] lg:min-w-[320px] lg:max-w-[340px] border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1e293b]/40 flex flex-col shrink-0 ${
                        isSidebarOpenOnMobile ? 'max-h-80' : 'hidden lg:flex'
                    } lg:max-h-none`}>
                        {/* Search & Collapse All Header */}
                        <div className="p-3 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-slate-50 dark:bg-[#1e293b] z-10 space-y-2.5">
                            {/* API Scope Tabs: User vs Admin */}
                            <div className="flex p-1 bg-slate-200/70 dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs font-medium gap-1">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('user')}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition cursor-pointer text-xs ${
                                        activeTab === 'user'
                                            ? 'bg-white dark:bg-slate-800 text-[#0EADAB] font-bold shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    <User className="size-3.5" />
                                    <span>User APIs</span>
                                    <span
                                        className={`px-1.5 py-0.2 text-[10px] font-mono rounded-full font-semibold ${
                                            activeTab === 'user'
                                                ? 'bg-[#0EADAB]/15 text-[#0EADAB]'
                                                : 'bg-slate-300/70 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400'
                                        }`}
                                    >
                                        {userEndpoints.length}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('admin')}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition cursor-pointer text-xs ${
                                        activeTab === 'admin'
                                            ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 font-bold shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    <Shield className="size-3.5 text-amber-500" />
                                    <span>Admin APIs</span>
                                    <span
                                        className={`px-1.5 py-0.2 text-[10px] font-mono rounded-full font-semibold ${
                                            activeTab === 'admin'
                                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                                : 'bg-slate-300/70 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400'
                                        }`}
                                    >
                                        {adminEndpoints.length}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('all')}
                                    className={`flex items-center justify-center py-1.5 px-2.5 rounded-lg transition cursor-pointer text-xs ${
                                        activeTab === 'all'
                                            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-sm'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                    title="View All Endpoints"
                                >
                                    <Layers className="size-3.5" />
                                </button>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 size-3.5 text-slate-400 dark:text-slate-500" />
                                <input
                                    type="text"
                                    placeholder={
                                        activeTab === 'admin'
                                            ? 'Search Admin APIs...'
                                            : activeTab === 'user'
                                            ? 'Search User APIs...'
                                            : 'Search all endpoints...'
                                    }
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-[#0EADAB] shadow-sm"
                                />
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-0.5">
                                <span>{filteredEndpoints.length} endpoints shown</span>
                                <button
                                    type="button"
                                    onClick={toggleAllGroups}
                                    className="flex items-center gap-1 text-[#0EADAB] hover:underline cursor-pointer font-medium"
                                >
                                    <Layers className="size-3" />
                                    <span>
                                        {Object.keys(groupedEndpoints).every((k) => !!collapsedGroups[k]) ? 'Expand All' : 'Collapse All'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Collapsible Section List with Custom Scrollbar */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs max-h-72 lg:max-h-none custom-scrollbar">
                            {Object.entries(groupedEndpoints).map(([groupTitle, endpoints]) => {
                                const isCollapsed = !searchQuery.trim() && !!collapsedGroups[groupTitle];
                                return (
                                    <div key={groupTitle} className="rounded-xl border border-slate-200/70 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/40 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                        <button
                                            type="button"
                                            onClick={() => toggleGroup(groupTitle)}
                                            className="w-full flex items-center justify-between px-3 py-2 text-left bg-slate-100/50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 transition cursor-pointer select-none"
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                {isCollapsed ? (
                                                    <Folder className="size-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                                                ) : (
                                                    <FolderOpen className="size-3.5 text-[#0EADAB] shrink-0" />
                                                )}
                                                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300 truncate">
                                                    {groupTitle}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                                <span className="px-1.5 py-0.2 text-[10px] font-mono font-semibold rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                    {endpoints.length}
                                                </span>
                                                <ChevronDown className={`size-3.5 text-slate-400 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : 'rotate-0'}`} />
                                            </div>
                                        </button>

                                        {!isCollapsed && (
                                            <div className="p-1.5 space-y-1 bg-transparent">
                                                {endpoints.map((ep) => {
                                                    const isSelected = selectedEndpoint.id === ep.id;
                                                    return (
                                                        <button
                                                            key={ep.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedEndpoint(ep);
                                                                setIsSidebarOpenOnMobile(false);
                                                            }}
                                                            className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2 transition cursor-pointer ${
                                                                isSelected
                                                                    ? 'bg-[#0EADAB]/15 text-[#0EADAB] border border-[#0EADAB]/30 font-semibold shadow-sm'
                                                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
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
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Request & Response Work Area */}
                    <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 gap-4 sm:gap-6 bg-slate-100/60 dark:bg-slate-950 custom-scrollbar">
                        
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
                                    {selectedEndpoint.path.startsWith('/admin') ? (
                                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                                            <Shield className="size-3 text-amber-500" />
                                            Admin API
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-teal-500/15 text-[#0EADAB] border border-teal-500/30 flex items-center gap-1">
                                            <User className="size-3 text-[#0EADAB]" />
                                            User API
                                        </span>
                                    )}
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
                                <div className="h-9 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
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
                                                    className="h-6 px-2 text-[10px] font-mono rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 transition flex items-center justify-center cursor-pointer"
                                                >
                                                    Undo
                                                </button>
                                                <button
                                                    onClick={handleRedo}
                                                    disabled={historyIndex >= history.length - 1}
                                                    title="Redo (Ctrl+Y)"
                                                    className="h-6 px-2 text-[10px] font-mono rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 transition flex items-center justify-center cursor-pointer"
                                                >
                                                    Redo
                                                </button>
                                            </div>
                                        )}
                                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">JSON</span>
                                    </div>
                                </div>
                                {selectedEndpoint.isFileUpload && (
                                    <div className="mb-3 p-3 bg-teal-500/5 dark:bg-teal-500/10 border border-[#0EADAB]/30 rounded-lg flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-[#0EADAB] flex items-center gap-1.5">
                                                📁 Select File to Upload ({selectedEndpoint.fileParamName || 'avatar'})
                                            </span>
                                            {selectedFile && (
                                                <button
                                                    onClick={() => setSelectedFile(null)}
                                                    className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                                                >
                                                    Remove file
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setSelectedFile(e.target.files[0]);
                                                }
                                            }}
                                            className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#0EADAB] file:text-white hover:file:bg-[#0EADAB]/90 text-slate-700 dark:text-slate-300 cursor-pointer"
                                        />
                                        {selectedFile && (
                                            <div className="text-[11px] text-slate-600 dark:text-slate-400">
                                                Selected: <strong className="text-slate-800 dark:text-slate-200">{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)
                                            </div>
                                        )}
                                    </div>
                                )}
                                <textarea
                                    value={payloadText}
                                    onChange={(e) => updatePayloadWithHistory(e.target.value)}
                                    onKeyDown={handleTextareaKeyDown}
                                    disabled={selectedEndpoint.method === 'GET'}
                                    spellCheck={false}
                                    className="flex-1 w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 font-mono text-xs text-emerald-600 dark:text-emerald-400 leading-relaxed outline-none focus:border-[#0EADAB] transition resize-y min-h-[220px] lg:min-h-[280px] disabled:opacity-50 shadow-inner custom-scrollbar"
                                />
                                <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                                    <span className="text-[10px] text-slate-400">Ctrl+S: Save | Ctrl+Z: Undo | Tab: Indent</span>
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
                                <div className="h-9 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
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
                                            className="h-6 px-2.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] transition flex items-center gap-1 border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer"
                                        >
                                            {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                                            <span>{copied ? 'Copied' : 'Copy'}</span>
                                        </button>
                                    </div>
                                </div>
                                <pre className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-800 dark:text-slate-200 overflow-y-auto leading-relaxed select-text min-h-[220px] lg:min-h-[280px] whitespace-pre-wrap break-words shadow-inner custom-scrollbar">
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
