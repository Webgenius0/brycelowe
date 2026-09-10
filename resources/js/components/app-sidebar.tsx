import { Link, router } from '@inertiajs/react';

import {
    BookOpen,
    Building2,
    CreditCard,
    FileText,
    HelpCircle,
    LayoutGrid,
    LifeBuoy,
    LogOut,
    Mail,
    Receipt,
    Users,
} from 'lucide-react';



import { useState } from 'react';

import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';

import { Button } from '@/components/ui/button';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Users',
        href: '/user',
        icon: Users,
    },
    {
        title: 'Companies',
        href: '/company',
        icon: Building2,
    },
    {
        title: 'Plans',
        href: '/plan',
        icon: CreditCard,
    },
    {
        title: 'Subscriptions',
        href: '/subscription',
        icon: Receipt,
    },

    {
        title: 'Newsletter',
        href: '/newsletter',
        icon: Mail,
    },
    {
        title: 'Support Tickets',
        href: '/ticket',
        icon: LifeBuoy,
    },
    {
        title: 'Dynamic Pages',
        href: '/dynamic',
        icon: FileText,
    },

    {
        title: 'FAQ',
        href: '/faq',
        icon: HelpCircle,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const [openLogout, setOpenLogout] = useState(false);

    const handleLogout = () => {
        router.post('/logout');
        router.flushAll();
    };

    return (
        <>
            <Sidebar collapsible="icon" variant="inset">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                size="lg"
                                asChild
                                className="hover:bg-transparent justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
                            >
                                <Link href={dashboard()} prefetch className="flex items-center group-data-[collapsible=icon]:justify-center">
                                    <AppLogo />
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent>
                    <NavMain items={mainNavItems} />

                    <SidebarGroup className="px-2 py-0 mt-2">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    tooltip={{ children: 'Logout' }}
                                    onClick={() => setOpenLogout(true)}
                                    className="cursor-pointer transition-all duration-200 ease-in-out text-red-600 hover:bg-red-500/15 hover:text-red-700 dark:text-red-400"
                                >
                                    <LogOut className="size-4 shrink-0" />
                                    <span>Logout</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter>
                    {footerNavItems.length > 0 && (
                        <NavFooter items={footerNavItems} className="mt-auto" />
                    )}
                    <NavUser />
                </SidebarFooter>
            </Sidebar>

            {/* Logout modal */}
            <Dialog open={openLogout} onOpenChange={setOpenLogout}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Logout Account</DialogTitle>

                        <DialogDescription>
                            Are you sure you want to logout from your account?
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpenLogout(false)}
                        >
                            Cancel
                        </Button>

                        <Button variant="destructive" onClick={handleLogout}>
                            Logout
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
