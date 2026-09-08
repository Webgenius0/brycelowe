import { useRef, useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
    Copy,
    RefreshCw,
    Trash2,
    AlertCircle,
    UploadCloud,
    CheckCircle2,
    Sparkles,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImageUploadProps {
    label?: string;

    /** New file the user picked — pass `form.data.image` */
    value?: File | string | null;

    /** Called when user picks / clears a new file */
    onChange: (file: File | null) => void;

    /**
     * Existing image URL from the database (edit mode only).
     * Pass `product.image_url` (or undefined on create).
     */
    existingImageUrl?: string | null;

    /**
     * Called when the user removes the existing DB image.
     * Use this to set a `delete_image: true` flag in your form.
     * Only fires when there is an existingImageUrl and no new file selected.
     */
    onRemoveExisting?: () => void;

    accept?: string;
    maxSize?: number;
    disabled?: boolean;
    className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DEFAULT_MAX_SIZE = 20 * 1024 * 1024;

function formatBytes(bytes: number): string {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileType(file: File): string {
    return file.type.split('/')[1]?.toUpperCase() ?? 'IMAGE';
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ImageUpload({
    label,
    value,
    onChange,
    existingImageUrl,
    onRemoveExisting,
    accept = 'image/*',
    maxSize = DEFAULT_MAX_SIZE,
    disabled = false,
    className,
}: ImageUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const replaceRef = useRef<HTMLInputElement>(null);

    const [objectUrl, setObjectUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Sync object URL when value changes
    useEffect(() => {
        if (value instanceof File) {
            const url = URL.createObjectURL(value);
            setObjectUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setObjectUrl(null);
        }
    }, [value]);

    // What to show in the thumbnail:
    //   1. Fresh object URL  (user just picked a new file)
    //   2. Existing DB image (edit mode, no new file yet)
    //   3. null              (create mode, or existing was removed)
    const preview =
        objectUrl ??
        (typeof value === 'string' && value ? value : null) ??
        (existingImageUrl || null);

    // Is the preview coming from the DB (not a newly picked file)?
    const isExistingPreview =
        !objectUrl && !(value instanceof File) && !!existingImageUrl;

    // ── File handling ─────────────────────────────────────────────────────────

    function handleFile(file: File | null) {
        setError(null);
        if (!file) {
            clearNewFile();
            return;
        }

        if (file.size > maxSize) {
            setError(`File too large — max allowed is ${formatBytes(maxSize)}.`);
            return;
        }

        onChange(file);
    }

    function clearNewFile() {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        setObjectUrl(null);
        onChange(null);
        if (inputRef.current) inputRef.current.value = '';
        if (replaceRef.current) replaceRef.current.value = '';
    }

    function handleRemove() {
        clearNewFile();
        setError(null);

        // If the preview was the existing DB image, notify the parent
        if (isExistingPreview) {
            onRemoveExisting?.();
        }
    }

    // ── Drag & drop ───────────────────────────────────────────────────────────

    function onDragOver(e: React.DragEvent) {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
    }

    function onDragLeave(e: React.DragEvent) {
        if (!e.currentTarget.contains(e.relatedTarget as Node))
            setIsDragging(false);
    }

    function onDrop(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(false);
        if (disabled) return;
        handleFile(e.dataTransfer.files?.[0] ?? null);
    }

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className={cn('space-y-1.5 min-w-0 w-full', className)}>
            {label && (
                <Label className="text-xs font-semibold text-foreground block truncate">
                    {label}
                </Label>
            )}

            {/* ── Error ── */}
            {error ? (
                <div className="flex flex-col items-center gap-2.5 rounded-xl border-2 border-dashed border-destructive/50 bg-destructive/5 p-4 text-center min-w-0 w-full">
                    <span className="flex size-9 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                        <AlertCircle className="size-5" />
                    </span>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-destructive">
                            Upload failed
                        </p>
                        <p className="mt-0.5 text-[11px] text-destructive/80 line-clamp-2">
                            {error}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setError(null)}
                        className="rounded-lg border border-destructive/30 bg-background px-3 py-1 text-xs font-medium text-destructive transition hover:bg-destructive/10 active:scale-95 cursor-pointer"
                    >
                        Try again
                    </button>
                </div>
            ) : preview ? (
                // ── Preview (new file OR existing DB image) ──
                <div className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-3 shadow-2xs transition hover:shadow-xs min-w-0 w-full">
                    {/* Header: Badge on left + Copy button on right */}
                    <div className="mb-2.5 flex items-center justify-between gap-1 min-w-0">
                        {isExistingPreview ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 min-w-0">
                                <CheckCircle2 className="size-3 shrink-0" />
                                <span className="truncate">Current image</span>
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400 min-w-0">
                                <Sparkles className="size-3 shrink-0" />
                                <span className="truncate">New image</span>
                            </span>
                        )}

                        {(typeof value === 'string' || (!value && existingImageUrl)) && (
                            <button
                                type="button"
                                onClick={() => {
                                    const urlToCopy =
                                        typeof value === 'string'
                                            ? value
                                            : existingImageUrl;
                                    if (urlToCopy) {
                                        navigator.clipboard.writeText(urlToCopy);
                                        toast.success('Image URL copied!');
                                    }
                                }}
                                title="Copy image URL"
                                className="inline-flex size-6 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/40 text-muted-foreground transition hover:bg-primary/10 hover:text-primary hover:border-primary/30 active:scale-95 cursor-pointer"
                            >
                                <Copy className="size-3" />
                            </button>
                        )}
                    </div>

                    {/* Thumbnail + Meta Info */}
                    <div className="flex items-center gap-3 min-w-0 mb-3">
                        <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/30 shadow-2xs">
                            <img
                                src={preview}
                                alt="Preview"
                                className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                            />
                        </div>

                        <div className="min-w-0 flex-1 overflow-hidden">
                            <p
                                className="truncate text-xs font-semibold text-foreground"
                                title={
                                    value instanceof File
                                        ? value.name
                                        : typeof value === 'string'
                                          ? value
                                          : 'Saved image'
                                }
                            >
                                {value instanceof File
                                    ? value.name
                                    : typeof value === 'string'
                                      ? value.split('/').pop()
                                      : 'Saved image'}
                            </p>
                            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                                {value instanceof File
                                    ? `${formatBytes(value.size)} · ${getFileType(value)}`
                                    : isExistingPreview
                                      ? 'Active on section'
                                      : 'Ready to save'}
                            </p>
                        </div>
                    </div>

                    {/* Actions Row: Exactly 2 equal buttons */}
                    {!disabled && (
                        <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-border/50 min-w-0">
                            <label className="flex items-center justify-center gap-1 rounded-lg border border-border bg-background py-1.5 px-2 text-xs font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground active:scale-[0.98] cursor-pointer min-w-0">
                                <RefreshCw className="size-3 shrink-0" />
                                <span className="truncate">Replace</span>
                                <input
                                    ref={replaceRef}
                                    type="file"
                                    accept={accept}
                                    className="hidden"
                                    onChange={(e) =>
                                        handleFile(e.target.files?.[0] ?? null)
                                    }
                                />
                            </label>

                            <button
                                type="button"
                                onClick={handleRemove}
                                className="flex items-center justify-center gap-1 rounded-lg border border-destructive/20 bg-destructive/5 py-1.5 px-2 text-xs font-medium text-destructive transition hover:bg-destructive/15 active:scale-[0.98] cursor-pointer min-w-0"
                            >
                                <Trash2 className="size-3 shrink-0" />
                                <span className="truncate">Remove</span>
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                // ── Empty / drag ──
                <div
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className={cn(
                        'group relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-center transition-all duration-200 min-w-0 w-full',
                        disabled
                            ? 'cursor-not-allowed border-border/50 bg-muted/10 opacity-50'
                            : isDragging
                              ? 'border-primary bg-primary/5 shadow-sm scale-[1.01]'
                              : 'border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40',
                    )}
                >
                    <div
                        className={cn(
                            'flex size-9 items-center justify-center rounded-full border transition-colors duration-200',
                            isDragging
                                ? 'border-primary/30 bg-primary/10 text-primary'
                                : 'border-border bg-background text-muted-foreground group-hover:text-primary group-hover:border-primary/30',
                        )}
                    >
                        <UploadCloud className="size-4.5" />
                    </div>

                    <div className="space-y-0.5 min-w-0 px-1">
                        <p
                            className={cn(
                                'text-xs font-semibold truncate transition-colors',
                                isDragging ? 'text-primary' : 'text-foreground',
                            )}
                        >
                            {isDragging ? 'Drop to upload' : 'Upload image'}
                        </p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">
                            PNG, JPG, WEBP · up to {formatBytes(maxSize)}
                        </p>
                    </div>

                    {!disabled && (
                        <label className="mt-0.5 inline-flex cursor-pointer items-center justify-center gap-1 rounded-lg bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow-2xs transition hover:bg-primary/90 active:scale-95">
                            <span>Browse</span>
                            <input
                                ref={inputRef}
                                type="file"
                                accept={accept}
                                className="hidden"
                                onChange={(e) =>
                                    handleFile(e.target.files?.[0] ?? null)
                                }
                            />
                        </label>
                    )}
                </div>
            )}
        </div>
    );
}