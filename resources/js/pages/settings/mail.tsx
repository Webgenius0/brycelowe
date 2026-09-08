import { Head, useForm } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
    setting: {
        mailer: string;
        host: string;
        port: string;
        username: string;
        from_address: string;
        encryption: string;
    } | null;
};

export default function MailSettings({ setting }: Props) {
    const form = useForm({
        mailer: setting?.mailer ?? 'smtp',
        host: setting?.host ?? '',
        port: setting?.port ?? '587',
        username: setting?.username ?? '',
        password: '',
        from_address: setting?.from_address ?? '',
        encryption: setting?.encryption ?? 'tls',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        form.patch('/settings/mail', {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Mail Settings" />

            <div className="space-y-6">
                <Heading
                    title="Mail Settings"
                    description="Configure SMTP email sending"
                />

                <form onSubmit={submit} className="space-y-6">

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label>Mailer</Label>
                            <Input
                                value={form.data.mailer}
                                onChange={e => form.setData('mailer', e.target.value)}
                                placeholder="smtp"
                            />
                            <InputError message={form.errors.mailer} />
                        </div>

                        <div>
                            <Label>Host</Label>
                            <Input
                                value={form.data.host}
                                onChange={e => form.setData('host', e.target.value)}
                                placeholder="smtp.mailtrap.io"
                            />
                            <InputError message={form.errors.host} />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <Label>Port</Label>
                            <Input
                                value={form.data.port}
                                onChange={e => form.setData('port', e.target.value)}
                                placeholder="587"
                            />
                            <InputError message={form.errors.port} />
                        </div>

                        <div>
                            <Label>Encryption</Label>
                            <Input
                                value={form.data.encryption}
                                onChange={e => form.setData('encryption', e.target.value)}
                                placeholder="tls"
                            />
                            <InputError message={form.errors.encryption} />
                        </div>

                        <div>
                            <Label>From Email</Label>
                            <Input
                                value={form.data.from_address}
                                onChange={e => form.setData('from_address', e.target.value)}
                                placeholder="noreply@example.com"
                            />
                            <InputError message={form.errors.from_address} />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label>Username</Label>
                            <Input
                                value={form.data.username}
                                onChange={e => form.setData('username', e.target.value)}
                            />
                            <InputError message={form.errors.username} />
                        </div>

                        <div>
                            <Label>Password</Label>
                            <Input
                                type="password"
                                value={form.data.password}
                                onChange={e => form.setData('password', e.target.value)}
                                placeholder="Leave blank to keep existing"
                            />
                            <InputError message={form.errors.password} />
                        </div>
                    </div>

                    <Button disabled={form.processing}>
                        {form.processing ? 'Saving...' : 'Save Mail Settings'}
                    </Button>
                </form>
            </div>
        </>
    );
}

MailSettings.layout = {
    breadcrumbs: [{ title: 'Mail Settings', href: '/settings/mail' }],
};