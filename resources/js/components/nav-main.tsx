import { Link } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import * as React from 'react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    useSidebar,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();
    const { isMobile, setOpenMobile } = useSidebar();
    const [openMenu, setOpenMenu] = React.useState<string | null>(() => {
        const activeItem = items.find((item) =>
            item.children?.some((subItem) =>
                subItem.href ? isCurrentUrl(subItem.href) : false,
            ),
        );
        return activeItem ? activeItem.title : null;
    });

    const handleLinkClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel className="font-mono text-sm font-bold tracking-widest italic">
                Menu
            </SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    if (item.children && item.children.length > 0) {
                        const hasActiveChild = item.children.some((subItem) =>
                            subItem.href ? isCurrentUrl(subItem.href) : false,
                        );

                        const isOpen = openMenu === item.title;

                        return (
                            <Collapsible
                                key={item.title}
                                open={isOpen}
                                onOpenChange={(open) => {
                                    setOpenMenu(open ? item.title : null);
                                }}
                                defaultOpen={hasActiveChild}
                                asChild
                                className="group/collapsible"
                            >
                                <SidebarMenuItem className="mt-2">
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            tooltip={{ children: item.title }}
                                            className="cursor-pointer transition-all duration-300 ease-in-out hover:bg-red-500/15 data-[state=open]:bg-red-500/15"
                                        >
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                            <ChevronDown className="ml-auto transition-transform duration-400 ease-in-out group-data-[state=open]/collapsible:rotate-180" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="submenu-collapsible-content">
                                        <SidebarMenuSub className="py-1">
                                            {item.children.map((subItem) => (
                                                <SidebarMenuSubItem
                                                    key={subItem.title}
                                                >
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={
                                                            subItem.href
                                                                ? isCurrentUrl(
                                                                      subItem.href,
                                                                  )
                                                                : false
                                                        }
                                                        className="cursor-pointer transition-colors duration-200 hover:bg-red-500/10"
                                                        onClick={
                                                            handleLinkClick
                                                        }
                                                    >
                                                        <Link
                                                            href={
                                                                subItem.href ||
                                                                '#'
                                                            }
                                                            prefetch
                                                        >
                                                            {subItem.icon && (
                                                                <subItem.icon />
                                                            )}
                                                            <span>
                                                                {subItem.title}
                                                            </span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        );
                    }

                    return (
                        <SidebarMenuItem
                            key={item.title}
                            className="mt-2"
                            onClick={() => setOpenMenu(null)}
                        >
                            <SidebarMenuButton
                                asChild
                                isActive={
                                    item.href ? isCurrentUrl(item.href) : false
                                }
                                tooltip={{ children: item.title }}
                                className="cursor-pointer transition-all duration-200 ease-in-out hover:bg-red-500/15"
                                onClick={handleLinkClick}
                            >
                                <Link href={item.href || '#'} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
