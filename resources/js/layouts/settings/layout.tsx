import { Link } from '@inertiajs/react';
import {
    User,
    ShieldCheck,
    Palette,
    CreditCard,
    SlidersHorizontal,
    Globe,
    Mail,
    ShieldAlert,
    Wrench,
} from 'lucide-react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';

const sidebarNavItems = [
    {
        title: 'Profile',
        href: edit(),
        icon: User,
    },
    {
        title: 'Security',
        href: editSecurity(),
        icon: ShieldCheck,
    },
    {
        title: 'Appearance',
        href: editAppearance(),
        icon: Palette,
    },
    {
        title: 'Stripe',
        href: '/settings/stripe',
        icon: CreditCard,
    },
    {
        title: 'System Settings',
        href: '/settings/system',
        icon: SlidersHorizontal,
    },
    {
        title: 'Social Links',
        href: '/settings/social-links',
        icon: Globe,
    },
    {
        title: 'Mail Settings',
        href: '/settings/mail',
        icon: Mail,
    },
    {
        title: 'Login Attempts',
        href: '/settings/login-attempts',
        icon: ShieldAlert,
    },
    {
        title: 'System Tools',
        href: '/settings/system-tools',
        icon: Wrench,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <div className="px-6 py-6 w-full space-y-6">
            <Heading
                title="Settings"
                description="Manage your profile, account, security, and system preferences"
            />

            <div className="flex flex-col lg:flex-row lg:space-x-10 items-start">
                <aside className="w-full max-w-xl lg:w-56 shrink-0">
                    <nav
                        className="flex flex-col space-y-1 space-x-0"
                        aria-label="Settings"
                    >
                        {sidebarNavItems.map((item, index) => {
                            const active = isCurrentUrl(item.href);
                            const Icon = item.icon;
                            return (
                                <Button
                                    key={`${toUrl(item.href)}-${index}`}
                                    size="sm"
                                    variant="ghost"
                                    asChild
                                    className={cn(
                                        'w-full justify-start gap-2.5 transition-colors',
                                        active
                                            ? 'bg-primary text-primary-foreground font-semibold hover:bg-primary/90 hover:text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                    )}
                                >
                                    <Link href={item.href}>
                                        {Icon && (
                                            <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-primary-foreground' : 'text-muted-foreground')} />
                                        )}
                                        {item.title}
                                    </Link>
                                </Button>
                            );
                        })}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="w-full flex-1 min-w-0">
                    <section className="w-full space-y-8">{children}</section>
                </div>
            </div>
        </div>
    );
}
