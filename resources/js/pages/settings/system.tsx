import { Head, useForm } from '@inertiajs/react';
import { Settings2, Globe, Plus, Trash2 } from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import ImageUpload from '@/components/ui/imageUpload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type SocialLink = {
    platform: string;
    url: string;
    icon?: string;
};

type Props = {
    setting: {
        site_title: string;
        site_name: string;
        system_name: string;
        description: string;
        copyright_text: string;
        logo: string;
        favicon: string;
        phone: string;
        email: string;
        address: string;
        social_links?: SocialLink[];
    } | null;
};

export default function SystemSettings({ setting }: Props) {
    const form = useForm({
        site_title: setting?.site_title ?? '',
        site_name: setting?.site_name ?? '',
        system_name: setting?.system_name ?? '',
        description: setting?.description ?? '',
        copyright_text: setting?.copyright_text ?? '',
        logo: null as File | null,
        favicon: null as File | null,
        phone: setting?.phone ?? '',
        email: setting?.email ?? '',
        address: setting?.address ?? '',
        social_links: (setting?.social_links ?? []) as SocialLink[],
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
                Custom: 'link',
            };
            updated[index].icon = platformIcons[value] || 'link';
        }

        form.setData('social_links', updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.transform((data) => ({
            ...data,
            _method: 'PATCH',
        }));
        form.post('/settings/system', {
            preserveScroll: true,
        });
    };

    const formatMediaUrl = (url?: string | null) => {
        if (!url) return null;
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        if (url.startsWith('/storage/') || url.startsWith('/images/'))
            return url;
        if (url.startsWith('storage/') || url.startsWith('images/'))
            return `/${url}`;
        return `/storage/${url}`;
    };

    return (
        <>
            <Head title="System settings" />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="System settings"
                    description="Configure your site name, branding, and general preferences"
                />

                {(setting?.logo || setting?.favicon) && (
                    <div className="rounded-xl border border-sidebar-border bg-card p-5 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
                                <Settings2 className="size-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex items-center gap-4">
                                {setting.logo && (
                                    <div>
                                        <p className="mb-1 text-xs text-muted-foreground">
                                            Current Logo
                                        </p>
                                        <img
                                            src={
                                                formatMediaUrl(setting.logo) ||
                                                ''
                                            }
                                            alt="Logo"
                                            className="h-10 rounded object-contain"
                                        />
                                    </div>
                                )}
                                {setting.favicon && (
                                    <div>
                                        <p className="mb-1 text-xs text-muted-foreground">
                                            Favicon
                                        </p>
                                        <img
                                            src={
                                                formatMediaUrl(
                                                    setting.favicon,
                                                ) || ''
                                            }
                                            alt="Favicon"
                                            className="h-8 rounded object-contain"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="site_name">Site Title</Label>
                            <Input
                                id="site_name"
                                value={form.data.site_name}
                                onChange={(e) =>
                                    form.setData('site_name', e.target.value)
                                }
                                placeholder="My Store"
                            />
                            <InputError message={form.errors.site_name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="copyright_text">
                                Copyright Text
                            </Label>
                            <Input
                                id="copyright_text"
                                value={form.data.copyright_text}
                                onChange={(e) =>
                                    form.setData(
                                        'copyright_text',
                                        e.target.value,
                                    )
                                }
                                placeholder="© 2026. All rights reserved."
                            />
                            <InputError message={form.errors.copyright_text} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <textarea
                            id="description"
                            value={form.data.description}
                            onChange={(e) =>
                                form.setData('description', e.target.value)
                            }
                            rows={3}
                            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                            placeholder="A short description of your site..."
                        />
                        <InputError message={form.errors.description} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="address">Address</Label>
                        <textarea
                            id="address"
                            value={form.data.address}
                            onChange={(e) =>
                                form.setData('address', e.target.value)
                            }
                            rows={3}
                            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                            placeholder="A short address of your site..."
                        />
                        <InputError message={form.errors.address} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={form.data.phone}
                                onChange={(e) =>
                                    form.setData('phone', e.target.value)
                                }
                                placeholder="+01711-111111"
                            />
                            <InputError message={form.errors.phone} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                value={form.data.email}
                                onChange={(e) =>
                                    form.setData('email', e.target.value)
                                }
                                placeholder="info@example.com"
                            />
                            <InputError message={form.errors.email} />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <ImageUpload
                                label="Logo"
                                value={form.data.logo}
                                existingImageUrl={formatMediaUrl(setting?.logo)}
                                onChange={(e) => form.setData('logo', e)}
                            />
                            <InputError message={form.errors.logo} />
                        </div>
                        <div className="grid gap-2">
                            <ImageUpload
                                label="Favicon"
                                value={form.data.favicon}
                                existingImageUrl={formatMediaUrl(
                                    setting?.favicon,
                                )}
                                onChange={(e) => form.setData('favicon', e)}
                            />
                            <InputError message={form.errors.favicon} />
                        </div>
                    </div>

                    {/* ───────────────────── SOCIAL LINKS ───────────────────── */}
                    <div className="space-y-4 rounded-xl border border-sidebar-border bg-card p-5 shadow-sm">
                        <div className="flex items-center justify-between border-b border-border/50 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-violet-500/10">
                                    <Globe className="size-5 text-violet-600 dark:text-violet-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">
                                        Social Links
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Manage your website social media profile
                                        links
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
                                No social links added yet. Click "Add Link" to
                                get started.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {form.data.social_links.map((link, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/20 p-3 sm:flex-row sm:items-center sm:gap-4"
                                    >
                                        <div className="grid gap-1 sm:w-1/4">
                                            <Label className="text-xs">
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
                                                <option value="Custom">
                                                    Custom
                                                </option>
                                            </select>
                                        </div>

                                        <div className="grid flex-1 gap-1">
                                            <Label className="text-xs">
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
                                            <div className="grid gap-1 sm:w-1/5">
                                                <Label className="text-xs">
                                                    Icon Name (Lucide)
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
                                                    placeholder="e.g. facebook"
                                                    className="h-9"
                                                />
                                            </div>
                                        )}

                                        <div className="flex items-end justify-end sm:h-14">
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                onClick={() =>
                                                    removeSocialLink(index)
                                                }
                                                className="h-9 w-9"
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
                            {form.processing ? 'Saving...' : 'Save settings'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

SystemSettings.layout = {
    breadcrumbs: [{ title: 'System settings', href: '/settings/system' }],
};
