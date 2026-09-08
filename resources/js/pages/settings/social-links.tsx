import { Head, useForm } from '@inertiajs/react';
import {
    Globe,
    Plus,
    Trash2,
    Smartphone,
    Apple,
    Play,
    Link as LinkIcon,
} from 'lucide-react';
import React from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type SocialLink = {
    platform: string;
    url: string;
    icon?: string;
};

type Props = {
    social_links?: SocialLink[];
    apple_store_link?: string;
    play_store_link?: string;
};

function PlatformIcon({ platform }: { platform: string }) {
    switch (platform) {
        case 'Facebook':
            return (
                <svg className="size-5" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
            );
        case 'Instagram':
            return (
                <svg className="size-5" viewBox="0 0 24 24" fill="#E4405F">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
            );
        case 'Twitter':
            return (
                <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            );
        case 'YouTube':
            return (
                <svg className="size-5" viewBox="0 0 24 24" fill="#FF0000">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
            );
        case 'LinkedIn':
            return (
                <svg className="size-5" viewBox="0 0 24 24" fill="#0A66C2">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c-.97 0-1.75-.79-1.75-1.76s.78-1.75 1.75-1.75 1.75.78 1.75 1.75-.78 1.76-1.75 1.76m1.4 9.74v-8.37H5.06v8.37h2.8z" />
                </svg>
            );
        case 'TikTok':
            return (
                <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
            );
        case 'Pinterest':
            return (
                <svg className="size-5" viewBox="0 0 24 24" fill="#BD081C">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.171-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
                </svg>
            );
        case 'WhatsApp':
            return (
                <svg className="size-5" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M17.472 14.382c-.301-.15-1.778-.877-2.054-.977-.275-.1-.476-.15-.676.15-.2.3-.777.977-.952 1.177-.175.2-.35.225-.651.075s-1.272-.469-2.422-1.495c-.896-.799-1.501-1.786-1.677-2.087-.175-.301-.019-.464.131-.613.136-.134.301-.35.451-.525.15-.175.2-.301.301-.501.1-.2.05-.375-.025-.525s-.676-1.628-.927-2.228c-.244-.585-.492-.505-.676-.515-.175-.008-.375-.01-.576-.01s-.526.075-.801.375c-.276.3-1.052 1.028-1.052 2.507s1.078 2.908 1.228 3.109c.15.2 2.122 3.24 5.141 4.544.718.31 1.278.495 1.716.634.721.229 1.377.197 1.895.12.578-.087 1.778-.727 2.029-1.429.251-.702.251-1.303.175-1.429-.075-.125-.276-.2-.576-.35zM12 21.84c-1.802 0-3.568-.485-5.116-1.405l-.367-.218-3.805.998 1.015-3.71-.239-.38A9.77 9.77 0 0 1 2.16 12c0-5.426 4.414-9.84 9.84-9.84s9.84 4.414 9.84 9.84-4.414 9.84-9.84 9.84zm0-21.84C5.373 0 0 5.373 0 12c0 2.115.553 4.103 1.523 5.845L0 24l6.326-1.66A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                </svg>
            );
        case 'Discord':
            return (
                <svg className="size-5" viewBox="0 0 24 24" fill="#5865F2">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
            );
        default:
            return <LinkIcon className="size-5 text-muted-foreground" />;
    }
}

export default function SocialLinksSettings({
    social_links = [],
    apple_store_link = '',
    play_store_link = '',
}: Props) {
    const form = useForm({
        apple_store_link: apple_store_link || '',
        play_store_link: play_store_link || '',
        social_links: (social_links || []) as SocialLink[],
    });

    const addSocialLink = () => {
        form.setData('social_links', [
            ...form.data.social_links,
            { platform: 'Facebook', url: '', icon: 'facebook' },
        ]);
    };

    const removeSocialLink = (index: number) => {
        form.setData(
            'social_links',
            form.data.social_links.filter((_, i) => i !== index),
        );
    };

    const updateSocialLink = (
        index: number,
        key: keyof SocialLink,
        value: string,
    ) => {
        const updated = [...form.data.social_links];
        updated[index] = {
            ...updated[index],
            [key]: value,
        };

        if (key === 'platform') {
            const platformIcons: Record<string, string> = {
                Facebook: 'facebook',
                Instagram: 'instagram',
                Twitter: 'twitter',
                YouTube: 'youtube',
                LinkedIn: 'linkedin',
                TikTok: 'music',
                Pinterest: 'pin',
                WhatsApp: 'message-circle',
                Discord: 'message-square',
                Custom: 'link',
            };
            updated[index].icon = platformIcons[value] || 'link';
        }

        form.setData('social_links', updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.patch('/settings/social-links', {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Social & Store Links" />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Social & Store Links"
                    description="Configure mobile app download links and social media channels"
                />

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ───────────────────── APP STORE LINKS ───────────────────── */}
                    <div className="space-y-4 rounded-xl border border-sidebar-border bg-card p-5 shadow-sm">
                        <div className="flex items-center gap-3 border-b border-border/50 pb-3">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10">
                                <Smartphone className="size-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">
                                    Mobile App Download Links
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    URLs for iOS App Store and Android Google Play Store apps
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 pt-1">
                            <div className="grid gap-2">
                                <Label htmlFor="apple_store_link" className="flex items-center gap-1.5">
                                    <Apple className="size-4 text-foreground" />
                                    <span>Apple App Store URL</span>
                                </Label>
                                <Input
                                    id="apple_store_link"
                                    type="url"
                                    value={form.data.apple_store_link}
                                    onChange={(e) =>
                                        form.setData('apple_store_link', e.target.value)
                                    }
                                    placeholder="https://apps.apple.com/app/id..."
                                />
                                <InputError message={form.errors.apple_store_link} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="play_store_link" className="flex items-center gap-1.5">
                                    <Play className="size-4 text-emerald-600 fill-emerald-600" />
                                    <span>Google Play Store URL</span>
                                </Label>
                                <Input
                                    id="play_store_link"
                                    type="url"
                                    value={form.data.play_store_link}
                                    onChange={(e) =>
                                        form.setData('play_store_link', e.target.value)
                                    }
                                    placeholder="https://play.google.com/store/apps/details?id=..."
                                />
                                <InputError message={form.errors.play_store_link} />
                            </div>
                        </div>
                    </div>

                    {/* ───────────────────── SOCIAL MEDIA LINKS ───────────────────── */}
                    <div className="space-y-4 rounded-xl border border-sidebar-border bg-card p-5 shadow-sm">
                        <div className="flex items-center justify-between border-b border-border/50 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                                    <Globe className="size-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">
                                        Social Media Links
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Public social channel links displayed on site footer & apps
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addSocialLink}
                                className="flex items-center gap-1.5"
                            >
                                <Plus className="size-4" />
                                Add Link
                            </Button>
                        </div>

                        {form.data.social_links.length === 0 ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                                No social links added yet. Click &quot;Add Link&quot; to
                                get started.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {form.data.social_links.map((link, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col gap-3 rounded-lg border border-border/60 bg-muted/20 p-3.5 sm:flex-row sm:items-center sm:gap-4"
                                    >
                                        {/* Icon Badge */}
                                        <div className="flex size-10 items-center justify-center rounded-lg border border-border/70 bg-card shadow-2xs shrink-0">
                                            <PlatformIcon platform={link.platform} />
                                        </div>

                                        {/* Platform Selector */}
                                        <div className="grid gap-1 sm:w-48">
                                            <Label className="text-xs font-medium">
                                                Platform
                                            </Label>
                                            <select
                                                value={link.platform}
                                                onChange={(e) =>
                                                    updateSocialLink(
                                                        index,
                                                        'platform',
                                                        e.target.value,
                                                    )
                                                }
                                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                                            >
                                                <option value="Facebook">
                                                    Facebook
                                                </option>
                                                <option value="Instagram">
                                                    Instagram
                                                </option>
                                                <option value="Twitter">
                                                    Twitter / X
                                                </option>
                                                <option value="YouTube">
                                                    YouTube
                                                </option>
                                                <option value="LinkedIn">
                                                    LinkedIn
                                                </option>
                                                <option value="TikTok">
                                                    TikTok
                                                </option>
                                                <option value="Pinterest">
                                                    Pinterest
                                                </option>
                                                <option value="WhatsApp">
                                                    WhatsApp
                                                </option>
                                                <option value="Discord">
                                                    Discord
                                                </option>
                                                <option value="Custom">
                                                    Custom Link
                                                </option>
                                            </select>
                                        </div>

                                        {/* URL Input */}
                                        <div className="grid flex-1 gap-1">
                                            <Label className="text-xs font-medium">
                                                Profile URL
                                            </Label>
                                            <Input
                                                type="url"
                                                value={link.url}
                                                onChange={(e) =>
                                                    updateSocialLink(
                                                        index,
                                                        'url',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="https://example.com/username"
                                                className="h-9"
                                            />
                                            {form.errors[
                                                `social_links.${index}.url` as any
                                            ] && (
                                                <p className="text-xs text-red-500">
                                                    {
                                                        form.errors[
                                                            `social_links.${index}.url` as any
                                                        ]
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        {link.platform === 'Custom' && (
                                            <div className="grid gap-1 sm:w-36">
                                                <Label className="text-xs font-medium">
                                                    Icon Name
                                                </Label>
                                                <Input
                                                    type="text"
                                                    value={link.icon || ''}
                                                    onChange={(e) =>
                                                        updateSocialLink(
                                                            index,
                                                            'icon',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="e.g. link"
                                                    className="h-9"
                                                />
                                            </div>
                                        )}

                                        {/* Remove Button */}
                                        <div className="flex items-end justify-end sm:pt-4">
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                onClick={() =>
                                                    removeSocialLink(index)
                                                }
                                                className="h-9 w-9 shrink-0"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={form.processing}>
                            {form.processing ? 'Saving...' : 'Save links'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

SocialLinksSettings.layout = {
    breadcrumbs: [{ title: 'Social & Store Links', href: '/settings/social-links' }],
};
