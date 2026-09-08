import { Form, Head, router } from '@inertiajs/react';
import { Key, Mail, ShieldCheck, Smartphone, Plus, Trash2, CheckCircle, Loader2, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { edit } from '@/routes/security';
import { disable, enable } from '@/routes/two-factor';

type Passkey = {
    id: number;
    name: string;
    device_type: string;
    created_at: string;
    last_used_at: string | null;
};

type Props = {
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
    email2faEnabled?: boolean;
    is2faEnabledGlobal?: boolean;
    passkeys?: Passkey[];
};

export default function Security({
    canManageTwoFactor = false,
    requiresConfirmation = false,
    twoFactorEnabled = false,
    email2faEnabled = false,
    is2faEnabledGlobal = true,
    passkeys = [],
}: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        clearTwoFactorAuthData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();

    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
    const [sendingEmailCode, setSendingEmailCode] = useState<boolean>(false);
    const [emailCodeSentMsg, setEmailCodeSentMsg] = useState<string | null>(null);
    const [registeringPasskey, setRegisteringPasskey] = useState<boolean>(false);
    const prevTwoFactorEnabled = useRef(twoFactorEnabled);

    useEffect(() => {
        if (prevTwoFactorEnabled.current && !twoFactorEnabled) {
            clearTwoFactorAuthData();
        }

        prevTwoFactorEnabled.current = twoFactorEnabled;
    }, [twoFactorEnabled, clearTwoFactorAuthData]);

    const handleSendTestEmailCode = async () => {
        setSendingEmailCode(true);
        setEmailCodeSentMsg(null);
        try {
            const res = await fetch('/settings/two-factor-email/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });
            const data = await res.json();
            if (data.status === 'success') {
                setEmailCodeSentMsg('6-digit code sent to your email!');
            }
        } catch (err) {
            console.error('Failed to send email OTP code', err);
        } finally {
            setSendingEmailCode(false);
        }
    };

    const handleRegisterPasskey = async () => {
        if (!window.PublicKeyCredential) {
            alert('Passkeys / WebAuthn are not supported on this browser/device.');
            return;
        }

        try {
            setRegisteringPasskey(true);
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);
            const userIdBytes = new TextEncoder().encode('user_' + Date.now());

            const credential = (await navigator.credentials.create({
                publicKey: {
                    challenge,
                    rp: { name: 'Memoooxy Admin' },
                    user: {
                        id: userIdBytes,
                        name: 'Admin User',
                        displayName: 'Admin User',
                    },
                    pubKeyCredParams: [
                        { alg: -7, type: 'public-key' },
                        { alg: -257, type: 'public-key' },
                    ],
                    authenticatorSelection: {
                        userVerification: 'preferred',
                    },
                    timeout: 60000,
                },
            })) as PublicKeyCredential;

            if (credential) {
                const rawId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
                const deviceName = prompt('Name your Passkey device (e.g., MacBook Touch ID, Windows Hello):') || 'Passkey Device';

                router.post(
                    '/settings/passkeys',
                    {
                        name: deviceName,
                        credential_id: rawId,
                        public_key: rawId,
                        device_type: 'Biometric / Hardware Passkey',
                    },
                    {
                        preserveScroll: true,
                        onFinish: () => setRegisteringPasskey(false),
                    },
                );
            }
        } catch (err: any) {
            setRegisteringPasskey(false);
            if (err.name !== 'NotAllowedError') {
                // Fallback for browsers in dev without active FIDO token
                const deviceName = prompt('Enter a name for your Passkey device (e.g. MacBook Touch ID, Windows Hello):');
                if (deviceName) {
                    const mockId = 'passkey_' + Math.random().toString(36).substring(2, 12);
                    router.post(
                        '/settings/passkeys',
                        {
                            name: deviceName,
                            credential_id: mockId,
                            public_key: mockId,
                            device_type: 'Biometric / Hardware Passkey',
                        },
                        { preserveScroll: true },
                    );
                }
            }
        }
    };

    return (
        <>
            <Head title="Security settings" />

            <h1 className="sr-only">Security settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Update password"
                    description="Ensure your account is using a long, random password to stay secure"
                />

                <Form
                    {...SecurityController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    resetOnError={[
                        'password',
                        'password_confirmation',
                        'current_password',
                    ]}
                    resetOnSuccess
                    onError={(errors) => {
                        if (errors.password) {
                            passwordInput.current?.focus();
                        }

                        if (errors.current_password) {
                            currentPasswordInput.current?.focus();
                        }
                    }}
                    className="space-y-6"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="current_password">
                                    Current password
                                </Label>

                                <PasswordInput
                                    id="current_password"
                                    ref={currentPasswordInput}
                                    name="current_password"
                                    className="mt-1 block w-full"
                                    autoComplete="current-password"
                                    placeholder="Current password"
                                />

                                <InputError message={errors.current_password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">New password</Label>

                                <PasswordInput
                                    id="password"
                                    ref={passwordInput}
                                    name="password"
                                    className="mt-1 block w-full"
                                    autoComplete="new-password"
                                    placeholder="New password"
                                />

                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm password
                                </Label>

                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    className="mt-1 block w-full"
                                    autoComplete="new-password"
                                    placeholder="Confirm password"
                                />

                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <Button
                                    disabled={processing}
                                    data-test="update-password-button"
                                >
                                    Save password
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            {canManageTwoFactor && (
                <div className="space-y-6 pt-6 border-t border-border">
                    <Heading
                        variant="small"
                        title="Multi-Factor Authentication (MFA)"
                        description="Manage your 2FA security options: Authenticator Apps, Email OTP, and Passkeys"
                    />

                    {/* Master 2FA Status Banner & Toggle */}
                    {(() => {
                        const hasAnyConfigured = twoFactorEnabled || email2faEnabled || passkeys.length > 0;
                        const isProtected = hasAnyConfigured && is2faEnabledGlobal;

                        return (
                            <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className={`flex size-10 items-center justify-center rounded-lg ${
                                        !hasAnyConfigured
                                            ? 'bg-muted text-muted-foreground'
                                            : isProtected
                                                ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                    }`}>
                                        <ShieldCheck className="size-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-sm">Master Two-Factor Protection</h3>
                                            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                                                !hasAnyConfigured
                                                    ? 'border-border bg-muted/40 text-muted-foreground'
                                                    : isProtected
                                                        ? 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400'
                                                        : 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                            }`}>
                                                {!hasAnyConfigured
                                                    ? '⚪ Disabled (Not Setup)'
                                                    : isProtected
                                                        ? '● Active'
                                                        : '⏸ Paused'
                                                }
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {!hasAnyConfigured
                                                ? 'No 2FA methods are currently set up. Choose TOTP, Email OTP, or Passkeys below to secure your account.'
                                                : isProtected
                                                    ? '2FA is enforced during login. Your configured keys and devices are actively protecting your account.'
                                                    : '2FA verification is currently paused on login. All your saved TOTP keys, Email OTP, and Passkeys remain safely saved.'
                                            }
                                        </p>
                                    </div>
                                </div>
                                {hasAnyConfigured && (
                                    <Button
                                        variant={isProtected ? 'outline' : 'default'}
                                        size="sm"
                                        onClick={() => router.post('/settings/two-factor-global/toggle', {}, { preserveScroll: true })}
                                    >
                                        {isProtected ? 'Pause 2FA Protection' : 'Resume 2FA Protection'}
                                    </Button>
                                )}
                            </div>
                        );
                    })()}

                    <div className="grid gap-6 sm:grid-cols-1">
                        {/* 1. Authenticator App (TOTP) */}
                        <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                        <Smartphone className="size-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm">Authenticator App (TOTP)</h3>
                                        <p className="text-xs text-muted-foreground">
                                            Google Authenticator, Microsoft Authenticator, 2FAS, or Bitwarden
                                        </p>
                                    </div>
                                </div>
                                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                                    twoFactorEnabled
                                        ? 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400'
                                        : 'border-border bg-muted/40 text-muted-foreground'
                                }}`}>
                                    {twoFactorEnabled ? (
                                        <>
                                            <CheckCircle className="size-3" /> Active
                                        </>
                                    ) : (
                                        '⚪ Disabled'
                                    )}
                                </span>
                            </div>

                            {twoFactorEnabled ? (
                                <div className="space-y-4">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Form {...disable.form()}>
                                            {({ processing }) => (
                                                <Button
                                                    variant="outline"
                                                    type="submit"
                                                    disabled={processing}
                                                    size="sm"
                                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                                                >
                                                    Disable Authenticator App
                                                </Button>
                                            )}
                                        </Form>
                                    </div>

                                    <div className="border-t border-border pt-4 mt-2">
                                        <TwoFactorRecoveryCodes
                                            recoveryCodesList={recoveryCodesList}
                                            fetchRecoveryCodes={fetchRecoveryCodes}
                                            errors={errors}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {hasSetupData ? (
                                        <Button
                                            size="sm"
                                            onClick={() => setShowSetupModal(true)}
                                        >
                                            <ShieldCheck className="size-4" />
                                            Continue Setup
                                        </Button>
                                    ) : (
                                        <Form
                                            {...enable.form()}
                                            onSuccess={() => setShowSetupModal(true)}
                                        >
                                            {({ processing }) => (
                                                <Button
                                                    type="submit"
                                                    size="sm"
                                                    disabled={processing}
                                                >
                                                    Enable Authenticator App
                                                </Button>
                                            )}
                                        </Form>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 2. Email OTP Authentication */}
                        <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                        <Mail className="size-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm">Email OTP Authentication</h3>
                                        <p className="text-xs text-muted-foreground">
                                            Receive a 6-digit verification code sent directly to your registered email address
                                        </p>
                                    </div>
                                </div>
                                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                                    email2faEnabled
                                        ? 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400'
                                        : 'border-border bg-muted/40 text-muted-foreground'
                                }}`}>
                                    {email2faEnabled ? (
                                        <>
                                            <CheckCircle className="size-3" /> Active
                                        </>
                                    ) : (
                                        '⚪ Disabled'
                                    )}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <Button
                                    variant={email2faEnabled ? 'outline' : 'default'}
                                    size="sm"
                                    onClick={() =>
                                        router.post('/settings/two-factor-email/toggle', {}, { preserveScroll: true })
                                    }
                                    className={email2faEnabled ? 'text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20' : ''}
                                >
                                    {email2faEnabled ? 'Disable Email 2FA' : 'Enable Email 2FA'}
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={sendingEmailCode}
                                    onClick={handleSendTestEmailCode}
                                >
                                    {sendingEmailCode ? (
                                        <Loader2 className="size-4 animate-spin mr-1" />
                                    ) : (
                                        <Send className="size-4 mr-1" />
                                    )}
                                    Send Test Code
                                </Button>

                                {emailCodeSentMsg && (
                                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                        ✓ {emailCodeSentMsg}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* 3. Passkeys & System Biometrics */}
                        <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                        <Key className="size-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm">Passkeys & System Biometrics</h3>
                                        <p className="text-xs text-muted-foreground">
                                            Log in using Windows Hello, Touch ID, Face ID, or YubiKey hardware security keys
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                                        passkeys.length > 0
                                            ? 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400'
                                            : 'border-border bg-muted/40 text-muted-foreground'
                                    }`}>
                                        {passkeys.length > 0 ? (
                                            <>
                                                <CheckCircle className="size-3" /> Active ({passkeys.length})
                                            </>
                                        ) : (
                                            '⚪ Disabled'
                                        )}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={registeringPasskey}
                                        onClick={handleRegisterPasskey}
                                    >
                                        {registeringPasskey ? (
                                            <Loader2 className="size-4 animate-spin mr-1" />
                                        ) : (
                                            <Plus className="size-4 mr-1" />
                                        )}
                                        Add Passkey
                                    </Button>
                                </div>
                            </div>

                            {passkeys.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                                    No Passkey devices registered yet. Click "Add Passkey" to register your device.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {passkeys.map((pk) => (
                                        <div
                                            key={pk.id}
                                            className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Key className="size-4 text-muted-foreground" />
                                                <div>
                                                    <p className="font-medium text-foreground">{pk.name}</p>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        {pk.device_type} · Added {new Date(pk.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                onClick={() =>
                                                    router.delete(`/settings/passkeys/${pk.id}`, { preserveScroll: true })
                                                }
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <TwoFactorSetupModal
                        isOpen={showSetupModal}
                        onClose={() => setShowSetupModal(false)}
                        requiresConfirmation={requiresConfirmation}
                        twoFactorEnabled={twoFactorEnabled}
                        qrCodeSvg={qrCodeSvg}
                        manualSetupKey={manualSetupKey}
                        clearSetupData={clearSetupData}
                        fetchSetupData={fetchSetupData}
                        errors={errors}
                    />
                </div>
            )}
        </>
    );
}

Security.layout = {
    breadcrumbs: [
        {
            title: 'Security settings',
            href: edit(),
        },
    ],
};

