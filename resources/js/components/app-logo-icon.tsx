import { usePage } from '@inertiajs/react';

export default function AppLogo({ className }: any) {
    const { settings } = usePage().props as any;

    const logoUrl = settings?.logo
        ? (settings.logo.startsWith('http://') || settings.logo.startsWith('https://'))
            ? settings.logo
            : (settings.logo.startsWith('/')
                ? settings.logo
                : (settings.logo.startsWith('images/') || settings.logo.startsWith('storage/')
                    ? `/${settings.logo}`
                    : `/storage/${settings.logo}`))
        : null;

    const faviconUrl = settings?.favicon
        ? (settings.favicon.startsWith('http://') || settings.favicon.startsWith('https://'))
            ? settings.favicon
            : (settings.favicon.startsWith('/')
                ? settings.favicon
                : (settings.favicon.startsWith('images/') || settings.favicon.startsWith('storage/')
                    ? `/${settings.favicon}`
                    : `/storage/${settings.favicon}`))
        : null;

    const siteName = settings?.site_name || settings?.site_title || 'Bryce Lowe';

    return (
        <div className="flex items-center justify-center">
            {/* 1. Full Logo (Visible when sidebar is expanded, hidden when collapsed) */}
            <div className="flex items-center group-data-[collapsible=icon]:hidden">
                {logoUrl ? (
                    <img
                        src={logoUrl}
                        alt={siteName}
                        className={`h-9 w-auto object-contain max-h-11 ${className || ''}`}
                    />
                ) : (
                    <span className={`inline-flex items-center gap-2 font-bold text-xl tracking-tight text-foreground ${className || ''}`}>
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0EADAB] to-[#0A807F] text-white font-black text-sm shadow-sm">
                            {siteName.charAt(0).toUpperCase()}
                        </span>
                        <span className="truncate">{siteName}</span>
                    </span>
                )}
            </div>

            {/* 2. Favicon / Monogram Icon (Hidden when expanded, visible when sidebar is collapsed) */}
            <div className="hidden group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center">
                {faviconUrl ? (
                    <img
                        src={faviconUrl}
                        alt={siteName}
                        className="size-7 object-contain rounded-lg"
                    />
                ) : (
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0EADAB] to-[#0A807F] text-white font-black text-sm shadow-sm">
                        {siteName.charAt(0).toUpperCase()}
                    </span>
                )}
            </div>
        </div>
    );
}
