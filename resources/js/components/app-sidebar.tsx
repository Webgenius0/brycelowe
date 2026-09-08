import { Link, router } from '@inertiajs/react';

import {
    BookOpen,
    Building2,
    ClipboardList,
    Contact,
    CreditCard,
    FileText,
    FolderTree,
    Gift,
    HelpCircle,
    History,
    Layers,
    LayoutGrid,
    LogOut,
    Mail,
    Ticket,
    Users,
    UserCheck,
    Wallet,
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

const footerNavItems: NavItem[] = [
    {
        title: 'Documentation',
        href: '/settings/docs',
        icon: BookOpen,
    },
];

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
                                className="hover:bg-transparent"
                            >
                                <Link href={dashboard()} prefetch>
                                    <AppLogo />
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent>
                    <NavMain items={mainNavItems} />

                    <button
                        onClick={() => setOpenLogout(true)}
                        className="mt-3 flex w-full cursor-pointer items-center gap-2 rounded-md px-5 py-2 text-sm transition hover:bg-red-500/15"
                    >
                        <LogOut className="size-4" />
                        Logout
                    </button>
                </SidebarContent>

                <SidebarFooter>
                    <NavFooter items={footerNavItems} className="mt-auto" />
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
