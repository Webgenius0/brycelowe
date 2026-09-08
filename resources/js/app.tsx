import { createInertiaApp, router } from '@inertiajs/react';
import { Toaster } from 'react-hot-toast';
import GlobalToast from '@/components/global-toast';
import LoadingSpinner from '@/components/loading-spinner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Dynamically update favicon from system settings on each navigation
router.on('navigate', (event) => {
    const settings = event.detail.page.props.settings as { favicon?: string } | null;
    
    if (settings?.favicon) {
        const isAbsolute = settings.favicon.startsWith('http://') || settings.favicon.startsWith('https://');
        const faviconUrl = isAbsolute
            ? settings.favicon
            : (settings.favicon.startsWith('/') || settings.favicon.startsWith('images/')
                ? (settings.favicon.startsWith('/') ? settings.favicon : `/${settings.favicon}`)
                : (settings.favicon.startsWith('storage/') ? `/${settings.favicon}` : `/storage/${settings.favicon}`));
        document.querySelectorAll<HTMLLinkElement>('link[rel="icon"], link[rel="apple-touch-icon"]').forEach((link) => {
            link.href = faviconUrl;
        });
    }
});

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            case name === 'settings/docs':
                return AppLayout;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}

                <LoadingSpinner />
                
                <GlobalToast />

                <Toaster position="top-right" reverseOrder={false} />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
