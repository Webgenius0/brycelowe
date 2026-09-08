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

    const siteName = settings?.site_name || settings?.site_title || 'Memoooxy';

    return (
        <>
            {logoUrl ? (
                <img
                    src={logoUrl}
                    alt={siteName}
                    className={`h-10 w-auto bg-none object-contain max-h-12 ${className || ''}`}
                />
            ) : (
                <span className={`inline-flex items-center gap-2 font-bold text-xl tracking-tight text-foreground ${className || ''}`}>
                    <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-black text-base shadow-sm">
                        {siteName.charAt(0).toUpperCase()}
                    </span>
                    <span className="truncate">{siteName}</span>
                </span>
            )}
        </>
    );
}
