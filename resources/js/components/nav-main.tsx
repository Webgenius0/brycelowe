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
            <SidebarGroupLabel className="text-[11px] font-bold tracking-widest text-[#64748b] dark:text-[#94a3b8] uppercase font-sans">
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
                                <SidebarMenuItem className="mt-1">
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            tooltip={{ children: item.title }}
                                            className="cursor-pointer font-semibold text-[#334155] dark:text-[#cbd5e1] transition-all duration-200 ease-in-out hover:bg-[#0EADAB]/15 hover:text-[#0EADAB] data-[state=open]:bg-[#0EADAB]/15 data-[state=open]:text-[#0EADAB]"
                                        >
                                            {item.icon && <item.icon className="size-4.5 shrink-0" />}
                                            <span>{item.title}</span>
                                            <ChevronDown className="ml-auto transition-transform duration-300 ease-in-out group-data-[state=open]/collapsible:rotate-180 size-4" />
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
                                                        className="cursor-pointer font-medium text-[#334155] dark:text-[#cbd5e1] transition-colors duration-200 hover:bg-[#0EADAB]/15 hover:text-[#0EADAB] data-[active=true]:bg-gradient-to-r data-[active=true]:from-[#0EADAB] data-[active=true]:to-[#0A807F] data-[active=true]:text-white data-[active=true]:font-bold data-[active=true]:shadow-sm"
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
                                                                <subItem.icon className="size-4 shrink-0" />
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
                            className="mt-1"
                            onClick={() => setOpenMenu(null)}
                        >
                            <SidebarMenuButton
                                asChild
                                isActive={
                                    item.href ? isCurrentUrl(item.href) : false
                                }
                                tooltip={{ children: item.title }}
                                className="cursor-pointer font-semibold text-[#334155] dark:text-[#cbd5e1] transition-all duration-200 ease-in-out hover:bg-[#0EADAB]/15 hover:text-[#0EADAB] data-[active=true]:bg-gradient-to-r data-[active=true]:from-[#0EADAB] data-[active=true]:to-[#0A807F] data-[active=true]:text-white data-[active=true]:font-bold data-[active=true]:shadow-md data-[active=true]:shadow-[#0EADAB]/20"
                                onClick={handleLinkClick}
                            >
                                <Link href={item.href || '#'} prefetch>
                                    {item.icon && <item.icon className="size-4.5 shrink-0" />}
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
