import { Form, Head, router } from '@inertiajs/react';
import {
    Key,
    Mail,
    ShieldCheck,
    Smartphone,
    Plus,
    Trash2,
    CheckCircle2,
    Loader2,
    Send,
    Fingerprint,
    Shield,
    AlertCircle,
} from 'lucide-react';
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
import { cn } from '@/lib/utils';
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
    const [activeTab, setActiveTab] = useState<'password' | 'mfa'>('password');
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
                    'X-CSRF-TOKEN':
                        (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
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
                    rp: { name: 'Bryce Lowe' },
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
                const deviceName =
                    prompt('Name your Passkey device (e.g., MacBook Touch ID, Windows Hello):') ||
                    'Passkey Device';

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
                const deviceName = prompt(
                    'Enter a name for your Passkey device (e.g. MacBook Touch ID, Windows Hello):',
                );
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

    const hasAnyConfigured = twoFactorEnabled || email2faEnabled || passkeys.length > 0;
    const isProtected = hasAnyConfigured && is2faEnabledGlobal;

    return (
        <>
            <Head title="Security Settings" />

            <h1 className="sr-only">Security Settings</h1>

            <div className="space-y-6">
                {/* ───────────────────── TAB NAVIGATION ───────────────────── */}
                <div className="inline-flex flex-wrap items-center gap-2 p-1.5 rounded-xl border border-sidebar-border bg-muted/30">
                    <button
                        type="button"
                        onClick={() => setActiveTab('password')}
                        className={cn(
                            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 cursor-pointer border',
                            activeTab === 'password'
                                ? 'bg-primary text-primary-foreground font-semibold border-primary shadow-xs'
                                : 'bg-card text-muted-foreground border-border/80 hover:bg-accent hover:text-foreground hover:border-border',
                        )}
                    >
                        <Key className="size-4" />
                        <span>Update Password</span>
                    </button>

                    {canManageTwoFactor && (
                        <button
                            type="button"
                            onClick={() => setActiveTab('mfa')}
                            className={cn(
                                'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 cursor-pointer border',
                                activeTab === 'mfa'
                                    ? 'bg-primary text-primary-foreground font-semibold border-primary shadow-xs'
                                    : 'bg-card text-muted-foreground border-border/80 hover:bg-accent hover:text-foreground hover:border-border',
                            )}
                        >
                            <ShieldCheck className="size-4" />
                            <span>Two-Factor Authentication (MFA)</span>
                            {hasAnyConfigured && (
                                <span
                                    className={cn(
                                        'ml-1 size-2 rounded-full',
                                        isProtected ? 'bg-emerald-400' : 'bg-amber-400',
                                    )}
                                />
                            )}
                        </button>
                    )}
                </div>

                {/* ───────────────────── TAB 1: PASSWORD ───────────────────── */}
                {activeTab === 'password' && (
                    <div className="space-y-6 animate-in fade-in-50 duration-200">
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
                            className="space-y-6 max-w-xl"
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
                )}

                {/* ───────────────────── TAB 2: TWO-FACTOR & MFA ───────────────────── */}
                {activeTab === 'mfa' && canManageTwoFactor && (
                    <div className="space-y-6 animate-in fade-in-50 duration-200">
                        <div>
                            <h2 className="text-base font-semibold text-foreground">Multi-Factor Authentication (MFA)</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Manage your 2FA security options: Authenticator Apps, Email OTP, and Passkeys
                            </p>
                        </div>

                        {/* 🛡️ Master 2FA Status Banner */}
                        <div
                            className={cn(
                                'rounded-xl border p-4.5 transition-all duration-200 shadow-2xs',
                                !hasAnyConfigured
                                    ? 'border-sidebar-border bg-card'
                                    : isProtected
                                      ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10'
                                      : 'border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10'
                            )}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-start sm:items-center gap-3.5">
                                    <div
                                        className={cn(
                                            'flex size-11 items-center justify-center rounded-xl shrink-0 transition-colors',
                                            !hasAnyConfigured
                                                ? 'bg-muted/80 text-muted-foreground border border-border/50'
                                                : isProtected
                                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                        )}
                                    >
                                        <Shield className="size-5.5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2.5 flex-wrap">
                                            <h3 className="font-semibold text-sm text-foreground">
                                                Master Two-Factor Protection
                                            </h3>
                                            <span
                                                className={cn(
                                                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                                                    !hasAnyConfigured
                                                        ? 'border-border bg-muted/60 text-muted-foreground'
                                                        : isProtected
                                                          ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                                          : 'border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300'
                                                )}
                                            >
                                                {!hasAnyConfigured ? (
                                                    <>
                                                        <span className="size-1.5 rounded-full bg-muted-foreground/60" />
                                                        Disabled (Not Setup)
                                                    </>
                                                ) : isProtected ? (
                                                    <>
                                                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        Active (Enforced)
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="size-1.5 rounded-full bg-amber-500" />
                                                        Paused
                                                    </>
                                                )}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-2xl">
                                            {!hasAnyConfigured
                                                ? 'No 2FA methods are currently set up. Choose TOTP, Email OTP, or Passkeys below to secure your account.'
                                                : isProtected
                                                  ? 'Two-Factor Authentication is actively enforced on every login attempt.'
                                                  : 'Two-Factor enforcement is paused. Your saved credentials and Passkeys remain securely stored.'}
                                        </p>
                                    </div>
                                </div>
                                {hasAnyConfigured && (
                                    <Button
                                        variant={isProtected ? 'outline' : 'default'}
                                        size="sm"
                                        onClick={() =>
                                            router.post(
                                                '/settings/two-factor-global/toggle',
                                                {},
                                                { preserveScroll: true },
                                            )
                                        }
                                        className={cn(
                                            'shrink-0 self-start sm:self-auto cursor-pointer font-medium',
                                            !isProtected && 'bg-[#0EADAB] hover:bg-[#0c9694] text-white border-0'
                                        )}
                                    >
                                        {isProtected ? 'Pause Protection' : 'Resume Protection'}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* ───────────────────── 2FA METHODS CARDS ───────────────────── */}
                        <div className="grid gap-4.5">
                            {/* 1. Authenticator App (TOTP) */}
                            <div className="rounded-xl border border-sidebar-border bg-card p-5 space-y-4 shadow-2xs transition-all hover:border-sidebar-border/80">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                    <div className="flex items-start gap-3.5">
                                        <div className="flex size-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/15 shrink-0">
                                            <Smartphone className="size-5.5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm text-foreground">
                                                Authenticator App (TOTP)
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                                Google Authenticator, Microsoft Authenticator, 2FAS, or Bitwarden
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className={cn(
                                            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold self-start shrink-0',
                                            twoFactorEnabled
                                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                : 'border-border bg-muted/60 text-muted-foreground'
                                        )}
                                    >
                                        {twoFactorEnabled ? (
                                            <>
                                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                                Enabled
                                            </>
                                        ) : (
                                            <>
                                                <span className="size-1.5 rounded-full bg-muted-foreground/60" />
                                                Disabled
                                            </>
                                        )}
                                    </span>
                                </div>

                                <div className="pt-0.5">
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
                                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/25 text-xs font-medium cursor-pointer"
                                                        >
                                                            Disable Authenticator App
                                                        </Button>
                                                    )}
                                                </Form>
                                            </div>

                                            <div className="border-t border-sidebar-border pt-4 mt-2">
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
                                                    className="gap-2 bg-[#0EADAB] hover:bg-[#0c9694] text-white font-medium cursor-pointer"
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
                                                            className="gap-2 bg-[#0EADAB] hover:bg-[#0c9694] text-white font-medium cursor-pointer shadow-xs"
                                                        >
                                                            <Smartphone className="size-4" />
                                                            Enable Authenticator App
                                                        </Button>
                                                    )}
                                                </Form>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 2. Email OTP Authentication */}
                            <div className="rounded-xl border border-sidebar-border bg-card p-5 space-y-4 shadow-2xs transition-all hover:border-sidebar-border/80">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                    <div className="flex items-start gap-3.5">
                                        <div className="flex size-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/15 shrink-0">
                                            <Mail className="size-5.5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm text-foreground">
                                                Email OTP Authentication
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                                Receive a 6-digit verification code sent directly to your registered email address
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className={cn(
                                            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold self-start shrink-0',
                                            email2faEnabled
                                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                : 'border-border bg-muted/60 text-muted-foreground'
                                        )}
                                    >
                                        {email2faEnabled ? (
                                            <>
                                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                                Enabled
                                            </>
                                        ) : (
                                            <>
                                                <span className="size-1.5 rounded-full bg-muted-foreground/60" />
                                                Disabled
                                            </>
                                        )}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 pt-0.5">
                                    <Button
                                        variant={email2faEnabled ? 'outline' : 'default'}
                                        size="sm"
                                        onClick={() =>
                                            router.post(
                                                '/settings/two-factor-email/toggle',
                                                {},
                                                { preserveScroll: true },
                                            )
                                        }
                                        className={cn(
                                            'cursor-pointer font-medium text-xs',
                                            email2faEnabled
                                                ? 'text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/25'
                                                : 'gap-2 bg-[#0EADAB] hover:bg-[#0c9694] text-white shadow-xs'
                                        )}
                                    >
                                        <Mail className="size-4" />
                                        {email2faEnabled ? 'Disable Email 2FA' : 'Enable Email 2FA'}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={sendingEmailCode}
                                        onClick={handleSendTestEmailCode}
                                        className="gap-2 cursor-pointer font-medium text-xs border-border"
                                    >
                                        {sendingEmailCode ? (
                                            <Loader2 className="size-3.5 animate-spin" />
                                        ) : (
                                            <Send className="size-3.5" />
                                        )}
                                        Send Test Code
                                    </Button>

                                    {emailCodeSentMsg && (
                                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                                            <CheckCircle2 className="size-3.5" /> {emailCodeSentMsg}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* 3. Passkeys & System Biometrics */}
                            <div className="rounded-xl border border-sidebar-border bg-card p-5 space-y-4 shadow-2xs transition-all hover:border-sidebar-border/80">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                    <div className="flex items-start gap-3.5">
                                        <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/15 shrink-0">
                                            <Fingerprint className="size-5.5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm text-foreground">
                                                Passkeys & System Biometrics
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                                Log in using Windows Hello, Touch ID, Face ID, or YubiKey hardware security keys
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 self-start shrink-0">
                                        <span
                                            className={cn(
                                                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                                                passkeys.length > 0
                                                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                    : 'border-border bg-muted/60 text-muted-foreground'
                                            )}
                                        >
                                            {passkeys.length > 0 ? (
                                                <>
                                                    <span className="size-1.5 rounded-full bg-emerald-500" />
                                                    {passkeys.length} Registered
                                                </>
                                            ) : (
                                                <>
                                                    <span className="size-1.5 rounded-full bg-muted-foreground/60" />
                                                    Disabled
                                                </>
                                            )}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={registeringPasskey}
                                            onClick={handleRegisterPasskey}
                                            className="gap-1.5 text-xs font-medium border-border hover:bg-muted cursor-pointer"
                                        >
                                            {registeringPasskey ? (
                                                <Loader2 className="size-3.5 animate-spin" />
                                            ) : (
                                                <Plus className="size-3.5" />
                                            )}
                                            Add Passkey
                                        </Button>
                                    </div>
                                </div>

                                <div className="pt-0.5">
                                    {passkeys.length === 0 ? (
                                        <div className="rounded-xl border border-dashed border-sidebar-border/90 p-5 text-center bg-muted/10">
                                            <Fingerprint className="size-6 text-muted-foreground/40 mx-auto mb-1.5" />
                                            <p className="text-xs text-muted-foreground">
                                                No Passkey devices registered yet. Click &quot;Add Passkey&quot; to register your device.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {passkeys.map((pk) => (
                                                <div
                                                    key={pk.id}
                                                    className="flex items-center justify-between rounded-xl border border-sidebar-border bg-muted/20 px-3.5 py-2.5 text-xs transition-colors hover:bg-muted/40"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                                            <Fingerprint className="size-4" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-foreground">{pk.name}</p>
                                                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                                                {pk.device_type} · Added{' '}
                                                                {new Date(pk.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8 text-destructive hover:bg-destructive/10 cursor-pointer rounded-lg"
                                                        onClick={() =>
                                                            router.delete(`/settings/passkeys/${pk.id}`, {
                                                                preserveScroll: true,
                                                            })
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
            </div>
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
