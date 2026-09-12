import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    ArrowUpRight,
    Bold,
    Check,
    ChevronDown,
    Clock,
    Copy,
    FileText,
    Italic,
    Link as LinkIcon,
    Mail,
    Paperclip,
    Plus,
    RefreshCw,
    Search,
    Send,
    ShieldCheck,
    Sparkles,
    Trash2,
    Underline,
    X,
} from 'lucide-react';
import React, { useRef, useState } from 'react';

type EmailTemplate = {
    id: number;
    title: string;
    subject: string;
    body: string;
    category?: string;
    is_system?: boolean;
};

type ProspectEmail = {
    id: number;
    user_id?: number;
    user?: { id: number; name: string; email: string };
    to: string;
    cc?: string | null;
    bcc?: string | null;
    subject: string;
    message: string;
    status: 'Sent' | 'Opened' | 'Draft' | 'Scheduled' | 'Failed';
    is_tracked: boolean;
    opened_at?: string | null;
    scheduled_at?: string | null;
    sent_at?: string | null;
    created_at?: string;
};

type Props = {
    templates: EmailTemplate[];
    recentEmails: ProspectEmail[];
    isSuperAdmin?: boolean;
};

export default function MailSupportPage({ templates = [], recentEmails = [], isSuperAdmin = false }: Props) {
    const [showCc, setShowCc] = useState(false);
    const [showBcc, setShowBcc] = useState(false);
    const [trackEmail, setTrackEmail] = useState(true);
    const [isMergeMenuOpen, setIsMergeMenuOpen] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiTone, setAiTone] = useState('Professional');
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiGenerating, setAiGenerating] = useState(false);
    const [selectedEmailDetail, setSelectedEmailDetail] = useState<ProspectEmail | null>(null);
    const [isAllTemplatesModalOpen, setIsAllTemplatesModalOpen] = useState(false);
    const [isAllRecentModalOpen, setIsAllRecentModalOpen] = useState(false);
    const [statusToast, setStatusToast] = useState<string | null>(null);

    const messageTextareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        to: '',
        cc: '',
        bcc: '',
        subject: '',
        message: '',
        is_tracked: true,
        scheduled_at: '',
    });

    const mergeFields = [
        { label: 'First Name', tag: '{First Name}' },
        { label: 'Last Name', tag: '{Last Name}' },
        { label: 'Company Name', tag: '{Company Name}' },
        { label: 'Property Address', tag: '{Property Address}' },
        { label: 'Email', tag: '{Email}' },
        { label: 'Phone Number', tag: '{Phone}' },
    ];

    const insertMergeField = (tag: string) => {
        const textarea = messageTextareaRef.current;
        if (!textarea) {
            setData('message', data.message + tag);
            setIsMergeMenuOpen(false);
            return;
        }

        const start = textarea.selectionStart || 0;
        const end = textarea.selectionEnd || 0;
        const text = data.message;
        const newText = text.substring(0, start) + tag + text.substring(end);
        setData('message', newText);
        setIsMergeMenuOpen(false);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + tag.length, start + tag.length);
        }, 0);
    };

    const applyFormatting = (prefix: string, suffix: string = '') => {
        const textarea = messageTextareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart || 0;
        const end = textarea.selectionEnd || 0;
        const text = data.message;
        const selected = text.substring(start, end) || 'text';
        const formatted = `${prefix}${selected}${suffix || prefix}`;
        const newText = text.substring(0, start) + formatted + text.substring(end);
        setData('message', newText);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, end + prefix.length);
        }, 0);
    };

    const handleUseTemplate = (template: EmailTemplate) => {
        setData((prev) => ({
            ...prev,
            subject: template.subject,
            message: template.body,
        }));
        showToast(`Template "${template.title}" loaded`);
        if (isAllTemplatesModalOpen) setIsAllTemplatesModalOpen(false);
    };

    const showToast = (msg: string) => {
        setStatusToast(msg);
        setTimeout(() => setStatusToast(null), 3000);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setAttachedFiles((prev) => [...prev, ...filesArray]);
        }
    };

    const removeFile = (index: number) => {
        setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSendEmail = (e: React.FormEvent) => {
        e.preventDefault();
        post('/mail/send', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setAttachedFiles([]);
                showToast('Email sent successfully!');
            },
        });
    };

    const handleSaveDraft = () => {
        router.post(
            '/mail/draft',
            {
                to: data.to,
                cc: data.cc,
                bcc: data.bcc,
                subject: data.subject,
                message: data.message,
                is_tracked: trackEmail,
            },
            {
                preserveScroll: true,
                onSuccess: () => showToast('Draft saved successfully!'),
            },
        );
    };

    const handleGenerateAiCopy = async () => {
        setAiGenerating(true);
        try {
            const res = await fetch('/api/mail/ai-assist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    prompt: aiPrompt || 'Follow up with prospect after initial property inquiry',
                    tone: aiTone,
                    recipient_name: '{First Name}',
                    property_address: '{Property Address}',
                }),
            });
            const json = await res.json();
            if (json.data) {
                setData((prev) => ({
                    ...prev,
                    subject: json.data.subject || prev.subject,
                    message: json.data.message || prev.message,
                }));
                setIsAiModalOpen(false);
                showToast('AI Email generated successfully!');
            }
        } catch {
            showToast('Failed to generate AI email');
        } finally {
            setAiGenerating(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Sent':
                return (
                    <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Sent
                    </span>
                );
            case 'Opened':
                return (
                    <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        Opened
                    </span>
                );
            case 'Draft':
                return (
                    <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                        Draft
                    </span>
                );
            case 'Scheduled':
                return (
                    <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        Scheduled
                    </span>
                );
            default:
                return (
                    <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-slate-500/15 text-slate-500">
                        {status}
                    </span>
                );
        }
    };

    const getStatusDot = (status: string) => {
        switch (status) {
            case 'Sent':
                return 'bg-emerald-500';
            case 'Opened':
                return 'bg-blue-500';
            case 'Draft':
                return 'bg-slate-400';
            case 'Scheduled':
                return 'bg-amber-500';
            default:
                return 'bg-slate-400';
        }
    };

    const formatTimestamp = (email: ProspectEmail) => {
        const time = email.sent_at || email.created_at;
        if (!time) return 'Recent';
        const date = new Date(time);
        const now = new Date();
        const diffHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

        if (diffHours < 24) {
            return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        } else if (diffHours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Mail & Support', href: '/mail' },
            ]}
        >
            <Head title="Mail & Support - PitchProX" />

            <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
                
                {/* Toast Notification */}
                {statusToast && (
                    <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white shadow-xl text-xs font-medium border border-slate-700 animate-in fade-in slide-in-from-top-2">
                        <Check className="size-4 text-[#0EADAB]" />
                        <span>{statusToast}</span>
                    </div>
                )}

                {/* Page Title & Subtitle */}
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Mail & Support
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Send emails to prospects and access support when you need it.
                    </p>
                </div>

                {/* Main 2-Column Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* LEFT COLUMN: Composer & Security Banner (7 cols) */}
                    <div className="lg:col-span-7 space-y-6">
                        
                        {/* Composer Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="p-6 space-y-5">
                                
                                <div className="space-y-0.5">
                                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                        Send email to a prospect
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Email will be sent from your connected mailbox.
                                    </p>
                                </div>

                                <form onSubmit={handleSendEmail} className="space-y-4">
                                    
                                    {/* To Field with CC / BCC toggles */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                To
                                            </label>
                                            <div className="flex items-center gap-2 text-xs font-semibold text-[#0EADAB]">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCc(!showCc)}
                                                    className="hover:underline cursor-pointer"
                                                >
                                                    CC
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowBcc(!showBcc)}
                                                    className="hover:underline cursor-pointer"
                                                >
                                                    BCC
                                                </button>
                                            </div>
                                        </div>
                                        <input
                                            type="email"
                                            value={data.to}
                                            onChange={(e) => setData('to', e.target.value)}
                                            placeholder="Enter prospect email"
                                            required
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#0EADAB] transition shadow-inner"
                                        />
                                        {errors.to && <p className="text-[11px] text-rose-500">{errors.to}</p>}
                                    </div>

                                    {/* CC Input (Conditional) */}
                                    {showCc && (
                                        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
                                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                CC
                                            </label>
                                            <input
                                                type="text"
                                                value={data.cc}
                                                onChange={(e) => setData('cc', e.target.value)}
                                                placeholder="Enter CC email addresses (comma separated)"
                                                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#0EADAB] transition"
                                            />
                                        </div>
                                    )}

                                    {/* BCC Input (Conditional) */}
                                    {showBcc && (
                                        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
                                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                BCC
                                            </label>
                                            <input
                                                type="text"
                                                value={data.bcc}
                                                onChange={(e) => setData('bcc', e.target.value)}
                                                placeholder="Enter BCC email addresses (comma separated)"
                                                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#0EADAB] transition"
                                            />
                                        </div>
                                    )}

                                    {/* Subject Field */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            Subject
                                        </label>
                                        <input
                                            type="text"
                                            value={data.subject}
                                            onChange={(e) => setData('subject', e.target.value)}
                                            placeholder="Enter email subject"
                                            required
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#0EADAB] transition shadow-inner"
                                        />
                                        {errors.subject && <p className="text-[11px] text-rose-500">{errors.subject}</p>}
                                    </div>

                                    {/* Message Rich Area */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            Message
                                        </label>

                                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950 focus-within:border-[#0EADAB] transition shadow-inner">
                                            {/* Editor Toolbar */}
                                            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => applyFormatting('**')}
                                                        className="p-1.5 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
                                                        title="Bold"
                                                    >
                                                        <Bold className="size-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => applyFormatting('*')}
                                                        className="p-1.5 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
                                                        title="Italic"
                                                    >
                                                        <Italic className="size-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => applyFormatting('<u>', '</u>')}
                                                        className="p-1.5 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
                                                        title="Underline"
                                                    >
                                                        <Underline className="size-3.5" />
                                                    </button>

                                                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

                                                    <button
                                                        type="button"
                                                        onClick={() => applyFormatting('')}
                                                        className="p-1.5 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
                                                        title="Align Left"
                                                    >
                                                        <AlignLeft className="size-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => applyFormatting('')}
                                                        className="p-1.5 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
                                                        title="Align Center"
                                                    >
                                                        <AlignCenter className="size-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const url = prompt('Enter link URL:');
                                                            if (url) applyFormatting(`[link](${url})`);
                                                        }}
                                                        className="p-1.5 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
                                                        title="Insert Link"
                                                    >
                                                        <LinkIcon className="size-3.5" />
                                                    </button>
                                                </div>

                                                {/* Merge fields dropdown */}
                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsMergeMenuOpen(!isMergeMenuOpen)}
                                                        className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[#0EADAB] px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                                    >
                                                        <span>Merge fields</span>
                                                        <ChevronDown className="size-3" />
                                                    </button>

                                                    {isMergeMenuOpen && (
                                                        <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-20 animate-in fade-in zoom-in-95">
                                                            <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                                                                Insert Field
                                                            </div>
                                                            {mergeFields.map((f) => (
                                                                <button
                                                                    key={f.tag}
                                                                    type="button"
                                                                    onClick={() => insertMergeField(f.tag)}
                                                                    className="w-full px-3 py-1.5 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-[#0EADAB]/10 hover:text-[#0EADAB] transition cursor-pointer flex items-center justify-between"
                                                                >
                                                                    <span>{f.label}</span>
                                                                    <span className="font-mono text-[10px] text-slate-400">
                                                                        {f.tag}
                                                                    </span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Textarea */}
                                            <textarea
                                                ref={messageTextareaRef}
                                                rows={9}
                                                value={data.message}
                                                onChange={(e) => setData('message', e.target.value)}
                                                placeholder="Type your message..."
                                                required
                                                className="w-full p-3.5 bg-transparent border-none text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-0 focus:outline-none font-sans leading-relaxed resize-y"
                                            />
                                        </div>
                                        {errors.message && <p className="text-[11px] text-rose-500">{errors.message}</p>}
                                    </div>

                                    {/* Attached Files List */}
                                    {attachedFiles.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {attachedFiles.map((file, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0EADAB]/10 text-[#0EADAB] border border-[#0EADAB]/20 text-xs font-medium"
                                                >
                                                    <Paperclip className="size-3" />
                                                    <span className="max-w-[150px] truncate">{file.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(idx)}
                                                        className="text-slate-400 hover:text-rose-500 cursor-pointer ml-1"
                                                    >
                                                        <X className="size-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Hidden File Input */}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        multiple
                                        className="hidden"
                                    />

                                    {/* Bottom Controls Bar */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#0EADAB] transition cursor-pointer"
                                            >
                                                <Paperclip className="size-3.5" />
                                                <span>Attach file</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setIsAiModalOpen(true)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold transition cursor-pointer border border-slate-200 dark:border-slate-700"
                                            >
                                                <Sparkles className="size-3.5 text-[#0EADAB]" />
                                                <span>Use AI assistant</span>
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {/* Track Email Switch */}
                                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-medium select-none">
                                                <span>Track email</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setTrackEmail(!trackEmail)}
                                                    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                                                        trackEmail ? 'bg-[#0EADAB]' : 'bg-slate-300 dark:bg-slate-700'
                                                    }`}
                                                >
                                                    <div
                                                        className={`bg-white size-4 rounded-full shadow-md transform transition-transform ${
                                                            trackEmail ? 'translate-x-4' : 'translate-x-0'
                                                        }`}
                                                    />
                                                </button>
                                                <Clock className="size-3.5 text-slate-400" />
                                            </div>

                                            {/* Send Button */}
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="px-5 py-2.5 rounded-xl bg-[#0EADAB] hover:bg-[#0c9694] text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-[#0EADAB]/25 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                                            >
                                                {processing ? (
                                                    <RefreshCw className="size-4 animate-spin" />
                                                ) : (
                                                    <Send className="size-4" />
                                                )}
                                                <span>Send email</span>
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Security Notice Box */}
                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3">
                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                                <ShieldCheck className="size-5" />
                            </div>
                            <div className="space-y-0.5 text-xs text-slate-600 dark:text-slate-400">
                                <p className="font-semibold text-slate-800 dark:text-slate-200">
                                    Emails are sent securely through your own email provider.
                                </p>
                                <p>
                                    PitchProX does not store, host, or access your email account credentials.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Quick Templates & Recent Emails (5 cols) */}
                    <div className="lg:col-span-5 space-y-6">
                        
                        {/* Quick Templates Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Quick templates
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setIsAllTemplatesModalOpen(true)}
                                    className="text-xs font-semibold text-[#0EADAB] hover:underline cursor-pointer"
                                >
                                    View all
                                </button>
                            </div>

                            <div className="space-y-3">
                                {templates.slice(0, 4).map((tpl) => (
                                    <div
                                        key={tpl.id}
                                        className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 hover:border-[#0EADAB]/30 transition group"
                                    >
                                        <div className="flex items-start gap-3 min-w-0">
                                            <div className="p-2 rounded-lg bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0 group-hover:text-[#0EADAB] group-hover:bg-[#0EADAB]/10 transition">
                                                <Mail className="size-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                                    {tpl.title}
                                                </h3>
                                                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[220px]">
                                                    {tpl.body.substring(0, 50)}...
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleUseTemplate(tpl)}
                                            className="px-2.5 py-1 text-xs font-bold text-[#0EADAB] hover:bg-[#0EADAB]/10 rounded-lg transition cursor-pointer shrink-0"
                                        >
                                            Use
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Emails Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Recent emails
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setIsAllRecentModalOpen(true)}
                                    className="text-xs font-semibold text-[#0EADAB] hover:underline cursor-pointer"
                                >
                                    View all
                                </button>
                            </div>

                            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                                {recentEmails.slice(0, 8).map((email) => (
                                    <div
                                        key={email.id}
                                        onClick={() => setSelectedEmailDetail(email)}
                                        className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded-xl transition cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span
                                                className={`size-2 rounded-full shrink-0 ${getStatusDot(
                                                    email.status,
                                                )}`}
                                            />
                                            <div className="min-w-0">
                                                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate flex items-center gap-1.5">
                                                    <span>{email.to}</span>
                                                    {isSuperAdmin && email.user && (
                                                        <span className="text-[10px] font-medium text-[#0EADAB] bg-[#0EADAB]/10 px-1.5 py-0.2 rounded font-sans shrink-0">
                                                            by {email.user.name}
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[170px]">
                                                    {email.subject}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2.5 shrink-0">
                                            {getStatusBadge(email.status)}
                                            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono w-14 text-right">
                                                {formatTimestamp(email)}
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                {recentEmails.length === 0 && (
                                    <div className="py-6 text-center text-xs text-slate-400">
                                        No recent emails sent yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Assistant Modal */}
            {isAiModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-[#0EADAB]/15 text-[#0EADAB]">
                                    <Sparkles className="size-4" />
                                </div>
                                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                                    AI Email Assistant
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsAiModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="space-y-1.5">
                                <label className="font-semibold text-slate-700 dark:text-slate-300">
                                    What is the purpose of this email?
                                </label>
                                <textarea
                                    rows={3}
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    placeholder="e.g. Write a warm follow-up after an in-person property walkthrough, highlighting the price reduction and asking for a follow-up call..."
                                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#0EADAB]"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-slate-700 dark:text-slate-300">
                                    Tone of voice
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Professional', 'Friendly', 'Persuasive', 'Concise', 'Urgent'].map((tone) => (
                                        <button
                                            key={tone}
                                            type="button"
                                            onClick={() => setAiTone(tone)}
                                            className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer text-center ${
                                                aiTone === tone
                                                    ? 'bg-[#0EADAB]/15 text-[#0EADAB] border-[#0EADAB]/40'
                                                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                                            }`}
                                        >
                                            {tone}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setIsAiModalOpen(false)}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleGenerateAiCopy}
                                disabled={aiGenerating}
                                className="px-4 py-2 rounded-xl bg-[#0EADAB] hover:bg-[#0c9694] text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-[#0EADAB]/20 cursor-pointer disabled:opacity-50"
                            >
                                {aiGenerating ? (
                                    <RefreshCw className="size-3.5 animate-spin" />
                                ) : (
                                    <Sparkles className="size-3.5" />
                                )}
                                <span>Generate & Insert Copy</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Email Detail / Preview Modal */}
            {selectedEmailDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                    <Mail className="size-4" />
                                </div>
                                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                                    Email Details
                                </h3>
                            </div>
                            <button
                                onClick={() => setSelectedEmailDetail(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                                <span className="font-semibold text-slate-500">To:</span>
                                <span className="font-mono text-slate-900 dark:text-white font-medium">
                                    {selectedEmailDetail.to}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                                <span className="font-semibold text-slate-500">Subject:</span>
                                <span className="text-slate-900 dark:text-white font-semibold">
                                    {selectedEmailDetail.subject}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                                <span className="font-semibold text-slate-500">Status:</span>
                                <div>{getStatusBadge(selectedEmailDetail.status)}</div>
                            </div>

                            <div className="space-y-1 pt-1">
                                <span className="font-semibold text-slate-500">Message Content:</span>
                                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans text-xs leading-relaxed max-h-48 overflow-y-auto">
                                    {selectedEmailDetail.message}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => {
                                    setData({
                                        to: selectedEmailDetail.to,
                                        cc: selectedEmailDetail.cc || '',
                                        bcc: selectedEmailDetail.bcc || '',
                                        subject: selectedEmailDetail.subject,
                                        message: selectedEmailDetail.message,
                                        is_tracked: selectedEmailDetail.is_tracked,
                                        scheduled_at: '',
                                    });
                                    setSelectedEmailDetail(null);
                                    showToast('Email loaded into composer');
                                }}
                                className="px-4 py-2 rounded-xl bg-[#0EADAB] hover:bg-[#0c9694] text-white text-xs font-semibold cursor-pointer"
                            >
                                Re-use in Composer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
