import { router } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Search,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type Column<T> = {
    key: keyof T | string;
    title: React.ReactNode;
    sortable?: boolean;
    render?: (row: T) => React.ReactNode;
};

type Meta = {
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
};

type Props<T> = {
    columns: Column<T>[];
    data: T[];
    meta?: Meta;
    filters?: {
        search?: string;
        status?: string;
        sort_by?: string;
        sort_order?: string;
        role?: string;
    };
    placeholder?: string;
    children?: React.ReactNode;
};

export default function DataTable<T>({
    columns,
    data,
    meta = { links: [] },
    filters = {},
    placeholder = 'Search...',
    children,
}: Props<T>) {
    const [search, setSearch] = useState(
        filters?.search || '',
    );

    /*
    |--------------------------------------------------------------------------
    | Debounced Search
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (Object.keys(filters).length === 0) return;

        const timeout = setTimeout(() => {
            router.get(
                window.location.pathname,
                {
                    ...filters,
                    search,
                    page: 1,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 400);

        return () => clearTimeout(timeout);
    }, [search]);

    /*
    |--------------------------------------------------------------------------
    | Sorting
    |--------------------------------------------------------------------------
    */

    const handleSort = (column: string) => {
        if (Object.keys(filters).length === 0) return;

        router.get(
            window.location.pathname,
            {
                ...filters,
                sort_by: column,
                sort_order:
                    filters.sort_by === column &&
                    filters.sort_order === 'asc'
                        ? 'desc'
                        : 'asc',
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Sort Icons
    |--------------------------------------------------------------------------
    */

    const getSortIcon = (columnKey: string) => {
        if (filters.sort_by !== columnKey) {
            return (
                <ArrowUpDown className="size-3.5 opacity-40" />
            );
        }

        return filters.sort_order === 'asc' ? (
            <ArrowUp className="size-3.5" />
        ) : (
            <ArrowDown className="size-3.5" />
        );
    };

    return (
        <div className="space-y-4">
            {/* SEARCH */}
            <div className="flex items-center gap-3">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <input
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        placeholder={placeholder}
                        className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
                    />
                </div>
                {children}
            </div>

            {/* TABLE */}
            <div className="overflow-hidden rounded-xl border border-sidebar-border bg-card shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        {/* HEADER */}
                        <thead>
                            <tr className="border-b border-sidebar-border bg-muted/50">
                                {columns.map((col) => {
                                    const sortable =
                                        col.sortable !== false;

                                    return (
                                        <th
                                            key={String(col.key)}
                                            onClick={() =>
                                                sortable &&
                                                handleSort(
                                                    String(col.key),
                                                )
                                            }
                                            className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground ${
                                                sortable
                                                    ? 'cursor-pointer select-none transition-colors hover:text-foreground'
                                                    : ''
                                            }`}
                                        >
                                            <span className="inline-flex items-center gap-1.5">
                                                {col.title}

                                                {sortable &&
                                                    getSortIcon(
                                                        String(
                                                            col.key,
                                                        ),
                                                    )}
                                            </span>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>

                        {/* BODY */}
                        <tbody className="divide-y divide-sidebar-border">
                            {(() => {
                                const filteredData = Object.keys(filters).length === 0 && search
                                    ? data.filter(item => {
                                        return Object.values(item as any).some(val => 
                                            String(val).toLowerCase().includes(search.toLowerCase())
                                        );
                                      })
                                    : data;

                                return filteredData.length > 0 ? (
                                    filteredData.map((row, i) => (
                                        <tr
                                            key={i}
                                            className="transition-colors hover:bg-muted/40"
                                        >
                                            {columns.map((col) => (
                                                <td
                                                    key={String(col.key)}
                                                    className="whitespace-nowrap px-4 py-3 text-foreground"
                                                >
                                                    {col.render
                                                        ? col.render(row)
                                                        : (row as any)[col.key]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={columns.length}
                                            className="px-4 py-12 text-center text-muted-foreground"
                                        >
                                            No results found.
                                        </td>
                                    </tr>
                                );
                            })()}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PAGINATION */}
            {meta.links.length > 0 && (
                <div className="flex flex-wrap items-center justify-end gap-1">
                    {meta.links.map((link, i) => (
                        <button
                            key={i}
                            disabled={
                                !link.url || link.active
                            }
                            dangerouslySetInnerHTML={{
                                __html: link.label,
                            }}
                            onClick={() => {
                                if (link.url) {
                                    router.get(link.url, {}, {
                                        preserveState: true,
                                        preserveScroll: true,
                                    });
                                }
                            }}
                            className={`inline-flex h-8 min-w-8 items-center justify-center rounded-md px-3 text-xs font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 ${
                                link.active
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}