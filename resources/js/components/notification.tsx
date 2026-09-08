import { Bell, Trash2, Check, CheckCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Notification {
    id: string;
    type: string;
    data: any;
    read_at: string | null;
    created_at: string;
    updated_at: string;
}

export default function NotificationDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchNotifications();

        const interval = setInterval(() => {
            fetchNotifications();
        }, 30000); // 30 sec

        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await fetch('/notifications/list');
            const data = await response.json();
            setNotifications(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();

        try {
            const response = await fetch(`/notifications/${id}/read`, {
                method: 'PUT',
                headers: {
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setNotifications(
                    notifications.map((n) =>
                        n.id === id
                            ? { ...n, read_at: new Date().toISOString() }
                            : n,
                    ),
                );
            }
        } catch (error) {
            console.error(error);
        }
    };

    const markAllAsRead = async (e: React.MouseEvent) => {
        e.stopPropagation();

        try {
            const response = await fetch('/notifications/read-all', {
                method: 'PUT',
                headers: {
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setNotifications(
                    notifications.map((n) => ({
                        ...n,
                        read_at: new Date().toISOString(),
                    })),
                );
            }
        } catch (error) {
            console.error(error);
        }
    };

    const deleteNotification = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();

        try {
            const response = await fetch(`/notifications/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                setNotifications(notifications.filter((n) => n.id !== id));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const unreadCount = notifications.filter((n) => !n.read_at).length;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                    <Bell className="h-4 w-4 cursor-pointer" />

                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                            {unreadCount}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-96">
                <div className="flex items-center justify-between px-4 py-2">
                    <DropdownMenuLabel className="flex-1">
                        Notifications
                    </DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="h-auto px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
                        >
                            <CheckCheck className="mr-1 h-3 w-3" />
                            Mark all
                        </Button>
                    )}
                </div>

                <DropdownMenuSeparator />

                {loading ? (
                    <div className="px-4 py-3 text-center text-sm text-muted-foreground">
                        Loading...
                    </div>
                ) : notifications.length > 0 ? (
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notification) => {
                            const isRead = notification.read_at !== null;

                            return (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className={`flex cursor-default items-center justify-between px-3 py-2 transition border mb-2 ${
                                        isRead
                                            ? 'bg-white hover:bg-gray-50'
                                            : 'border-l-2 border-blue-500 bg-blue-50/40 hover:bg-blue-50'
                                    }`}
                                >
                                    <div className="flex min-w-0 flex-1 flex-col">
                                        <span
                                            className={`text-sm ${
                                                isRead
                                                    ? 'text-muted-foreground'
                                                    : 'font-semibold text-foreground'
                                            }`}
                                        >
                                            {notification.data?.title}
                                        </span>

                                        <span className="mt-1 text-xs text-muted-foreground">
                                            {notification.data?.message}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(
                                                notification.created_at,
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="ml-2 flex items-center gap-1">
                                        {!isRead && (
                                            <button
                                                onClick={(e) =>
                                                    markAsRead(
                                                        notification.id,
                                                        e,
                                                    )
                                                }
                                                className="rounded p-1 transition hover:bg-blue-100 cursor-pointer"
                                                title="Mark as read"
                                            >
                                                <Check className="h-4 w-4 text-blue-600" />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) =>
                                                deleteNotification(
                                                    notification.id,
                                                    e,
                                                )
                                            }
                                            className="rounded p-1 transition hover:bg-red-100 cursor-pointer"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                        </button>
                                    </div>
                                </DropdownMenuItem>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        No notifications found
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
