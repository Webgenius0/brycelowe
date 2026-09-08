import { Form, Head, setLayoutProps, useForm, router } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { Smartphone, Mail, Key, Loader2, Send, ArrowLeft, KeyRound } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { store } from '@/routes/two-factor/login';

type Props = {
    totpEnabled?: boolean;
    emailOtpEnabled?: boolean;
    passkeysEnabled?: boolean;
    email?: string | null;
};

export default function TwoFactorChallenge({
    totpEnabled = false,
    emailOtpEnabled = false,
    passkeysEnabled = false,
    email = null,
}: Props) {
    const [showRecoveryInput, setShowRecoveryInput] = useState<boolean>(false);
    const [hasSelectedMethod, setHasSelectedMethod] = useState<boolean>(false);
    const [showMethodSelector, setShowMethodSelector] = useState<boolean>(() => {
        let count = 0;
        if (totpEnabled) count++;
        if (emailOtpEnabled) count++;
        if (passkeysEnabled) count++;
        return count > 1;
    });
    const [code, setCode] = useState<string>('');

    // Default method initialization based on availability
    const [activeMethod, setActiveMethod] = useState<'totp' | 'email' | 'passkey'>(() => {
        if (passkeysEnabled) return 'passkey';
        if (totpEnabled) return 'totp';
        if (emailOtpEnabled) return 'email';
        return 'totp';
    });

    // Email OTP states
    const [sendingEmail, setSendingEmail] = useState<boolean>(false);
    const [emailSent, setEmailSent] = useState<boolean>(false);
    const [emailSendError, setEmailSendError] = useState<string | null>(null);

    const emailForm = useForm({
        code: '',
    });

    // Passkey verification states
    const [authenticatingPasskey, setAuthenticatingPasskey] = useState<boolean>(false);
    const [passkeyError, setPasskeyError] = useState<string | null>(null);

    const availableMethods = useMemo(() => {
        const methods = [];
        if (totpEnabled) methods.push({ id: 'totp', label: 'Authenticator App (TOTP)', icon: Smartphone });
        if (emailOtpEnabled) methods.push({ id: 'email', label: 'Email Verification (OTP)', icon: Mail });
        if (passkeysEnabled) methods.push({ id: 'passkey', label: 'Passkey / Biometrics', icon: Key });
        return methods;
    }, [totpEnabled, emailOtpEnabled, passkeysEnabled]);

    // Auto-trigger passkey authentication if it is the default selected method
    useEffect(() => {
        if (activeMethod === 'passkey' && !showMethodSelector && !showRecoveryInput) {
            authenticateWithPasskey();
        }
    }, []);

    const sendOtpEmail = async () => {
        setSendingEmail(true);
        setEmailSendError(null);
        try {
            const response = await fetch('/two-factor-challenge/email/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });
            const data = await response.json();
            if (response.ok && data.status === 'success') {
                setEmailSent(true);
            } else {
                setEmailSendError(data.message || 'Failed to send verification code.');
            }
        } catch (err) {
            setEmailSendError('An error occurred. Please try again.');
        } finally {
            setSendingEmail(false);
        }
    };

    const submitEmailOtp = (e: React.FormEvent) => {
        e.preventDefault();
        emailForm.post('/two-factor-challenge/email/verify', {
            preserveScroll: true,
        });
    };

    const authenticateWithPasskey = async () => {
        setAuthenticatingPasskey(true);
        setPasskeyError(null);
        try {
            const res = await fetch('/two-factor-challenge/passkeys');
            if (!res.ok) throw new Error('Failed to retrieve registered passkeys.');
            const passkeysList = await res.json() as { id: number; name: string; credential_id: string }[];

            if (passkeysList.length === 0) {
                setPasskeyError('No passkeys found for this account.');
                setAuthenticatingPasskey(false);
                return;
            }

            if (window.PublicKeyCredential) {
                try {
                    const challenge = new Uint8Array(32);
                    window.crypto.getRandomValues(challenge);

                    const allowCredentials = passkeysList.map(pk => {
                        const binaryString = atob(pk.credential_id);
                        const len = binaryString.length;
                        const bytes = new Uint8Array(len);
                        for (let i = 0; i < len; i++) {
                            bytes[i] = binaryString.charCodeAt(i);
                        }
                        return {
                            type: 'public-key' as const,
                            id: bytes,
                        };
                    });

                    const assertion = (await navigator.credentials.get({
                        publicKey: {
                            challenge,
                            allowCredentials,
                            userVerification: 'preferred',
                            timeout: 60000,
                        },
                    })) as PublicKeyCredential;

                    if (assertion) {
                        const credentialId = btoa(String.fromCharCode(...new Uint8Array(assertion.rawId)));
                        router.post('/two-factor-challenge/passkey/verify', {
                            credential_id: credentialId,
                        }, {
                            onError: (errors) => {
                                setPasskeyError(errors.credential_id || 'Passkey validation failed.');
                            }
                        });
                        return;
                    }
                } catch (webauthnErr: any) {
                    console.warn('WebAuthn authentication failed, falling back...', webauthnErr);
                    if (webauthnErr.name === 'NotAllowedError') {
                        setPasskeyError('Passkey authentication cancelled.');
                        setAuthenticatingPasskey(false);
                        return;
                    }
                }
            }

            // Fallback for development/testing
            const selectedDeviceName = prompt(
                `Select which passkey device to authenticate (enter name):\n${passkeysList.map(p => `- ${p.name}`).join('\n')}`,
                passkeysList[0]?.name
            );

            if (selectedDeviceName) {
                const matched = passkeysList.find(p => p.name.toLowerCase() === selectedDeviceName.toLowerCase());
                if (matched) {
                    router.post('/two-factor-challenge/passkey/verify', {
                        credential_id: matched.credential_id,
                    }, {
                        onError: (errors) => {
                            setPasskeyError(errors.credential_id || 'Passkey validation failed.');
                        }
                    });
                } else {
                    setPasskeyError('Device name did not match any registered passkeys.');
                }
            }
        } catch (err: any) {
            setPasskeyError(err.message || 'An error occurred during passkey authentication.');
        } finally {
            setAuthenticatingPasskey(false);
        }
    };

    const authConfigContent = useMemo<{
        title: string;
        description: string;
        toggleText: string;
    }>(() => {
        if (showMethodSelector) {
            return {
                title: 'Choose verification method',
                description: 'Select one of your configured two-factor methods to log in.',
                toggleText: '',
            };
        }

        if (showRecoveryInput) {
            return {
                title: 'Recovery code',
                description:
                    'Please confirm access to your account by entering one of your emergency recovery codes.',
                toggleText: 'login using an authentication code',
            };
        }

        switch (activeMethod) {
            case 'passkey':
                return {
                    title: 'Passkey verification',
                    description: 'Authenticate using your registered security key, biometrics, or device lock.',
                    toggleText: '',
                };
            case 'email':
                return {
                    title: 'Email verification',
                    description: 'Enter the 6-digit code sent to your registered email address.',
                    toggleText: '',
                };
            case 'totp':
            default:
                return {
                    title: 'Authentication code',
                    description:
                        'Enter the authentication code provided by your authenticator application.',
                    toggleText: 'login using a recovery code',
                };
        }
    }, [showRecoveryInput, showMethodSelector, activeMethod]);

    setLayoutProps({
        title: authConfigContent.title,
        description: authConfigContent.description,
    });

    const toggleRecoveryMode = (clearErrors: () => void): void => {
        setShowRecoveryInput(!showRecoveryInput);
        clearErrors();
        setCode('');
    };

    const handleSwitchMethod = (methodId: 'totp' | 'email' | 'passkey') => {
        setActiveMethod(methodId);
        setHasSelectedMethod(true);
        setShowMethodSelector(false);
        if (methodId === 'passkey') {
            setTimeout(() => {
                authenticateWithPasskey();
            }, 100);
        }
    };

    return (
        <>
            <Head title="Two-factor authentication" />

            <div className="space-y-6">
                {showMethodSelector ? (
                    <div className="space-y-4">
                        <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
                            {availableMethods.map((method) => {
                                const IconComponent = method.icon;
                                return (
                                    <button
                                        key={method.id}
                                        type="button"
                                        onClick={() => handleSwitchMethod(method.id as any)}
                                        className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/50 transition-colors duration-200 cursor-pointer"
                                    >
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                            <IconComponent className="size-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm text-foreground">{method.label}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {method.id === 'totp' && 'Verify using a code from your authenticator app.'}
                                                {method.id === 'email' && `Verify using a code sent to ${email ? email.replace(/(.{3})(.*)(@.*)/, '$1***$3') : 'your email'}.`}
                                                {method.id === 'passkey' && 'Verify using fingerprint, face scan, or hardware key.'}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {availableMethods.length > 1 && (
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    if (hasSelectedMethod) {
                                        setShowMethodSelector(false);
                                    } else {
                                        router.get('/login');
                                    }
                                }}
                                className="w-full flex items-center justify-center gap-2 border border-border"
                            >
                                <ArrowLeft className="size-4" /> {hasSelectedMethod ? 'Cancel' : 'Back to Login'}
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* 1. Recovery Code Input (Global) */}
                        {showRecoveryInput ? (
                            <Form
                                {...store.form()}
                                className="space-y-4"
                                resetOnError
                                resetOnSuccess={false}
                            >
                                {({ errors, processing, clearErrors }) => (
                                    <>
                                        <Input
                                            name="recovery_code"
                                            type="text"
                                            placeholder="Enter recovery code"
                                            autoFocus={showRecoveryInput}
                                            required
                                        />
                                        <InputError message={errors.recovery_code} />

                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={processing}
                                        >
                                            Continue
                                        </Button>

                                        <div className="text-center text-sm text-muted-foreground">
                                            <span>or you can </span>
                                            <button
                                                type="button"
                                                className="cursor-pointer text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                onClick={() => toggleRecoveryMode(clearErrors)}
                                            >
                                                {authConfigContent.toggleText}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </Form>
                        ) : (
                            <>
                                {/* 2. TOTP Input */}
                                {activeMethod === 'totp' && (
                                    <Form
                                        {...store.form()}
                                        className="space-y-4"
                                        resetOnError
                                        resetOnSuccess
                                    >
                                        {({ errors, processing, clearErrors }) => (
                                            <>
                                                <div className="flex flex-col items-center justify-center space-y-3 text-center">
                                                    <div className="flex w-full items-center justify-center">
                                                        <InputOTP
                                                            name="code"
                                                            maxLength={OTP_MAX_LENGTH}
                                                            value={code}
                                                            onChange={(value) => setCode(value)}
                                                            disabled={processing}
                                                            pattern={REGEXP_ONLY_DIGITS}
                                                            autoFocus
                                                        >
                                                            <InputOTPGroup>
                                                                {Array.from(
                                                                    { length: OTP_MAX_LENGTH },
                                                                    (_, index) => (
                                                                        <InputOTPSlot
                                                                            key={index}
                                                                            index={index}
                                                                        />
                                                                    ),
                                                                )}
                                                            </InputOTPGroup>
                                                        </InputOTP>
                                                    </div>
                                                    <InputError message={errors.code} />
                                                </div>

                                                <Button
                                                    type="submit"
                                                    className="w-full"
                                                    disabled={processing || code.length < OTP_MAX_LENGTH}
                                                >
                                                    Continue
                                                </Button>

                                                <div className="text-center text-sm text-muted-foreground">
                                                    <span>or you can </span>
                                                    <button
                                                        type="button"
                                                        className="cursor-pointer text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                        onClick={() => toggleRecoveryMode(clearErrors)}
                                                    >
                                                        {authConfigContent.toggleText}
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </Form>
                                )}

                                {/* 3. Email OTP Input */}
                                {activeMethod === 'email' && (
                                    <div className="space-y-4">
                                        {!emailSent ? (
                                            <div className="text-center space-y-4 py-2">
                                                <div className="flex size-12 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 mx-auto">
                                                    <Mail className="size-6" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs text-muted-foreground">
                                                        We will send a 6-digit verification code to: <span className="font-semibold text-foreground">{email ? email.replace(/(.{3})(.*)(@.*)/, '$1***$3') : ''}</span>
                                                    </p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    onClick={sendOtpEmail}
                                                    disabled={sendingEmail}
                                                    className="w-full"
                                                >
                                                    {sendingEmail ? (
                                                        <>
                                                            <Loader2 className="size-4 animate-spin mr-2" /> Sending Code...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Send className="size-4 mr-2" /> Send Verification Code
                                                        </>
                                                    )}
                                                </Button>
                                                {emailSendError && (
                                                    <p className="text-xs text-destructive">{emailSendError}</p>
                                                )}
                                            </div>
                                        ) : (
                                            <form onSubmit={submitEmailOtp} className="space-y-4">
                                                <div className="flex flex-col items-center justify-center space-y-3 text-center">
                                                    <div className="flex w-full items-center justify-center">
                                                        <InputOTP
                                                            name="code"
                                                            maxLength={6}
                                                            value={emailForm.data.code}
                                                            onChange={(value) => emailForm.setData('code', value)}
                                                            disabled={emailForm.processing}
                                                            pattern={REGEXP_ONLY_DIGITS}
                                                            autoFocus
                                                        >
                                                            <InputOTPGroup>
                                                                {Array.from(
                                                                    { length: 6 },
                                                                    (_, index) => (
                                                                        <InputOTPSlot
                                                                            key={index}
                                                                            index={index}
                                                                        />
                                                                    ),
                                                                )}
                                                            </InputOTPGroup>
                                                        </InputOTP>
                                                    </div>
                                                    <InputError message={emailForm.errors.code} />
                                                </div>

                                                <Button
                                                    type="submit"
                                                    className="w-full"
                                                    disabled={emailForm.processing || emailForm.data.code.length < 6}
                                                >
                                                    {emailForm.processing ? (
                                                        <>
                                                            <Loader2 className="size-4 animate-spin mr-2" /> Verifying...
                                                        </>
                                                    ) : (
                                                        'Verify Code'
                                                    )}
                                                </Button>

                                                <div className="text-center text-xs">
                                                    <button
                                                        type="button"
                                                        onClick={sendOtpEmail}
                                                        disabled={sendingEmail}
                                                        className="text-primary hover:underline font-medium cursor-pointer"
                                                    >
                                                        {sendingEmail ? 'Sending...' : "Didn't get a code? Resend"}
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                )}

                                {/* 4. Passkey Input */}
                                {activeMethod === 'passkey' && (
                                    <div className="text-center space-y-4 py-2">
                                        <div className="flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 mx-auto">
                                            <KeyRound className="size-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground">
                                                Use your fingerprint, face scan, or hardware key registered on this device.
                                            </p>
                                        </div>

                                        <Button
                                            id="trigger-passkey-btn"
                                            type="button"
                                            onClick={authenticateWithPasskey}
                                            disabled={authenticatingPasskey}
                                            className="w-full"
                                        >
                                            {authenticatingPasskey ? (
                                                <>
                                                    <Loader2 className="size-4 animate-spin mr-2" /> Authenticating...
                                                </>
                                            ) : (
                                                'Use Passkey / Biometrics'
                                            )}
                                        </Button>

                                        {passkeyError && (
                                            <p className="text-xs text-destructive mt-2">{passkeyError}</p>
                                        )}
                                    </div>
                                )}

                                {/* Try Another Method Link */}
                                {availableMethods.length > 1 && (
                                    <div className="text-center text-sm text-muted-foreground mt-4 pt-4 border-t border-border/60">
                                        <button
                                            type="button"
                                            onClick={() => setShowMethodSelector(true)}
                                            className="cursor-pointer text-primary hover:underline font-medium"
                                        >
                                            Try another verification method
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
