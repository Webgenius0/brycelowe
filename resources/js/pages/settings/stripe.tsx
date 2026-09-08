import { Head, useForm } from '@inertiajs/react';
import { CreditCard, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
    stripe: {
        publishable_key: string;
        secret_key: string;
        webhook_secret: string;
    };
};

export default function StripeSettings({ stripe }: Props) {
    const [showSecret, setShowSecret] = useState(false);
    const [showWebhook, setShowWebhook] = useState(false);

    const form = useForm({
        publishable_key: '',
        secret_key: '',
        webhook_secret: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.patch('/settings/stripe', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <>
            <Head title="Stripe settings" />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Stripe settings"
                    description="Configure your Stripe payment gateway credentials"
                />

                <div className="rounded-xl border border-sidebar-border bg-card p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-violet-500/10">
                            <CreditCard className="size-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Current Configuration</h3>
                            <p className="text-xs text-muted-foreground">Masked values from your environment</p>
                        </div>
                    </div>
                    <div className="grid gap-2 text-sm">
                        <div className="flex justify-between py-1.5 border-b border-sidebar-border">
                            <span className="text-muted-foreground">Publishable Key</span>
                            <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{stripe.publishable_key}</code>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-sidebar-border">
                            <span className="text-muted-foreground">Secret Key</span>
                            <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{stripe.secret_key}</code>
                        </div>
                        <div className="flex justify-between py-1.5">
                            <span className="text-muted-foreground">Webhook Secret</span>
                            <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{stripe.webhook_secret}</code>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="publishable_key">Publishable Key</Label>
                        <Input
                            id="publishable_key"
                            value={form.data.publishable_key}
                            onChange={(e) => form.setData('publishable_key', e.target.value)}
                            placeholder="pk_test_..."
                            autoComplete="off"
                        />
                        <p className="text-xs text-muted-foreground">Starts with <code className="bg-muted px-1 rounded">pk_test_</code> or <code className="bg-muted px-1 rounded">pk_live_</code></p>
                        <InputError message={form.errors.publishable_key} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="secret_key">Secret Key</Label>
                        <div className="relative">
                            <Input
                                id="secret_key"
                                type={showSecret ? 'text' : 'password'}
                                value={form.data.secret_key}
                                onChange={(e) => form.setData('secret_key', e.target.value)}
                                placeholder="sk_test_..."
                                autoComplete="off"
                            />
                            <button type="button" onClick={() => setShowSecret(!showSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer">
                                {showSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground">Starts with <code className="bg-muted px-1 rounded">sk_test_</code> or <code className="bg-muted px-1 rounded">sk_live_</code></p>
                        <InputError message={form.errors.secret_key} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="webhook_secret">Webhook Secret</Label>
                        <div className="relative">
                            <Input
                                id="webhook_secret"
                                type={showWebhook ? 'text' : 'password'}
                                value={form.data.webhook_secret}
                                onChange={(e) => form.setData('webhook_secret', e.target.value)}
                                placeholder="whsec_..."
                                autoComplete="off"
                            />
                            <button type="button" onClick={() => setShowWebhook(!showWebhook)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer">
                                {showWebhook ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground">Found in your <a href="https://dashboard.stripe.com/webhooks" target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2 inline-flex items-center gap-1">Stripe Dashboard <ExternalLink className="size-3" /></a></p>
                        <InputError message={form.errors.webhook_secret} />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={form.processing}>
                            {form.processing ? 'Saving...' : 'Save credentials'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

StripeSettings.layout = {
    breadcrumbs: [{ title: 'Stripe settings', href: '/settings/stripe' }],
};
