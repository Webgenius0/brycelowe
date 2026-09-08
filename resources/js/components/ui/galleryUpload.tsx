import { useEffect, useRef, useState } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExistingImage {
    /** Raw storage path e.g. "products/gallery/abc.jpg" */
    path: string;
    /** Full URL to display in <img src> */
    url: string;
}

interface GalleryUploadProps {
    label?: string;

    /** New files the user picked — pass `form.data.gallery` */
    value: File[];

    /** Called whenever the new-file list changes */
    onChange: (files: File[]) => void;

    /**
     * Existing images from DB (edit mode).
     * Each item needs both `path` (sent to backend for deletion) and `url` (displayed).
     * Example: product.gallery.map(path => ({ path, url: `/storage/${path}` }))
     */
    existingImages?: ExistingImage[];

    /**
     * Called when an existing image is marked for deletion.
     * Receives the updated full list of paths to delete.
     * Use this to set `form.data.delete_gallery`.
     */
    onDeleteExisting?: (pathsToDelete: string[]) => void;

    /** Max files allowed in total (new + existing). Default: 10 */
    maxFiles?: number;

    /** Max size per file in bytes. Default: 5 MB */
    maxSize?: number;

    accept?: string;
    disabled?: boolean;
    className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DEFAULT_MAX_SIZE = 20 * 1024 * 1024;

function formatBytes(bytes: number): string {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function UploadIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"
            strokeLinejoin="round" className={className} aria-hidden="true">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M7 18a4.6 4.4 0 0 1 0 -9a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7h-1" />
            <path d="M9 15l3 -3l3 3" /><path d="M12 12l0 9" />
        </svg>
    );
}

function XIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} strokeLinecap="round"
            strokeLinejoin="round" className={className} aria-hidden="true">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M18 6l-12 12" /><path d="M6 6l12 12" />
        </svg>
    );
}

function ImageIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"
            strokeLinejoin="round" className={className} aria-hidden="true">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M15 8h.01" />
            <path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z" />
            <path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l4 4" />
            <path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3" />
        </svg>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GalleryUpload({
    label,
    value,
    onChange,
    existingImages = [],
    onDeleteExisting,
    maxFiles = 10,
    maxSize = DEFAULT_MAX_SIZE,
    accept = 'image/*',
    disabled = false,
    className,
}: GalleryUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    // Object URLs for new files — tracked so we can revoke them on unmount
    const [objectUrls, setObjectUrls] = useState<string[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    // Paths of existing images marked for deletion
    const [markedForDeletion, setMarkedForDeletion] = useState<string[]>([]);

    // Revoke object URLs when component unmounts to prevent memory leaks
    useEffect(() => {
        return () => objectUrls.forEach(URL.revokeObjectURL);
    }, [objectUrls]);

    // ── File handling ─────────────────────────────────────────────────────────

    function addFiles(incoming: File[]) {
        setErrors([]);
        const newErrors: string[] = [];

        const remaining =
            maxFiles -
            value.length -
            (existingImages.length - markedForDeletion.length);

        const allowed = incoming.slice(0, Math.max(0, remaining));

        if (incoming.length > allowed.length) {
            newErrors.push(`Max ${maxFiles} images allowed.`);
        }

        const valid: File[] = [];
        const newUrls: string[] = [];

        for (const file of allowed) {
            if (file.size > maxSize) {
                newErrors.push(
                    `"${file.name}" is too large (max ${formatBytes(maxSize)}).`,
                );
                continue;
            }
            valid.push(file);
            newUrls.push(URL.createObjectURL(file));
        }

        if (newErrors.length) setErrors(newErrors);
        if (!valid.length) return;

        setObjectUrls((prev) => [...prev, ...newUrls]);
        onChange([...value, ...valid]);
    }

    function removeNewFile(index: number) {
        URL.revokeObjectURL(objectUrls[index]);
        setObjectUrls((prev) => prev.filter((_, i) => i !== index));
        onChange(value.filter((_, i) => i !== index));
        if (inputRef.current) inputRef.current.value = '';
    }

    function toggleDeleteExisting(path: string) {
        const updated = markedForDeletion.includes(path)
            ? markedForDeletion.filter((p) => p !== path)   // undo removal
            : [...markedForDeletion, path];                  // mark for deletion

        setMarkedForDeletion(updated);
        onDeleteExisting?.(updated);
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
        addFiles(Array.from(e.dataTransfer.files));
    }

    // ── Derived ───────────────────────────────────────────────────────────────

    const activeExisting = existingImages.filter(
        (img) => !markedForDeletion.includes(img.path),
    );
    const totalCount = value.length + activeExisting.length;
    const hasAny = totalCount > 0 || markedForDeletion.length > 0;

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className={cn('space-y-1.5', className)}>
            {label && <Label className="text-sm font-medium">{label}</Label>}

            {/* ── Drop zone ── */}
            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={cn(
                    'flex flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors duration-200',
                    disabled
                        ? 'cursor-not-allowed border-border/50 bg-muted/20 opacity-50'
                        : isDragging
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40',
                )}
            >
                <span className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-200',
                    isDragging
                        ? 'border-primary/30 bg-primary/10 text-primary'
                        : 'border-border bg-background text-muted-foreground',
                )}>
                    <UploadIcon className="h-5 w-5" />
                </span>

                <div>
                    <p className={cn(
                        'text-sm font-medium transition-colors',
                        isDragging ? 'text-primary' : 'text-foreground',
                    )}>
                        {isDragging ? 'Drop images here' : 'Click to upload or drag & drop'}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        PNG, JPG, WEBP — up to {formatBytes(maxSize)} each · max {maxFiles} images
                    </p>
                </div>

                {!disabled && (
                    <label className="mt-1 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-xs font-medium text-primary-foreground transition hover:bg-primary/90 active:scale-95">
                        <ImageIcon className="h-3.5 w-3.5" />
                        Browse images
                        <input
                            ref={inputRef}
                            type="file"
                            accept={accept}
                            multiple
                            className="hidden"
                            onChange={(e) =>
                                addFiles(Array.from(e.target.files ?? []))
                            }
                        />
                    </label>
                )}
            </div>

            {/* ── Errors ── */}
            {errors.length > 0 && (
                <div className="space-y-1">
                    {errors.map((err, i) => (
                        <p key={i} className="text-xs text-destructive">{err}</p>
                    ))}
                </div>
            )}

            {/* ── Grid preview ── */}
            {hasAny && (
                <div className="space-y-3">

                    {/* New files */}
                    {value.length > 0 && (
                        <div className="space-y-2">
                            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                    {value.length}
                                </span>
                                New
                            </p>

                            <div className="grid grid-cols-3 gap-2 sm:grid-cols-10">
                                {value.map((file, index) => (
                                    <div
                                        key={index}
                                        className="group relative overflow-hidden rounded-lg border border-border bg-muted aspect-square"
                                    >
                                        <img
                                            src={objectUrls[index]}
                                            alt={file.name}
                                            className="h-full w-full object-cover transition group-hover:brightness-75"
                                        />

                                        {/* Filename on hover */}
                                        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent px-2 pb-1.5 pt-4 opacity-0 transition group-hover:opacity-100">
                                            <p className="truncate text-[10px] text-white">
                                                {file.name}
                                            </p>
                                        </div>

                                        {!disabled && (
                                            <button
                                                type="button"
                                                onClick={() => removeNewFile(index)}
                                                className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition hover:bg-black/80 group-hover:opacity-100"
                                                aria-label="Remove image"
                                            >
                                                <XIcon className="h-3 w-3" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Existing images */}
                    {existingImages.length > 0 && (
                        <div className="space-y-2">
                            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-muted-foreground/15 text-muted-foreground text-[10px] font-bold">
                                    {activeExisting.length}
                                </span>
                                Saved
                                {markedForDeletion.length > 0 && (
                                    <span className="ml-1 text-destructive">
                                        · {markedForDeletion.length} will be removed
                                    </span>
                                )}
                            </p>

                            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                                {existingImages.map((img) => {
                                    const isDeleted = markedForDeletion.includes(img.path);
                                    return (
                                        <div
                                            key={img.path}
                                            className={cn(
                                                'group relative overflow-hidden rounded-lg border aspect-square transition-all duration-200',
                                                isDeleted
                                                    ? 'border-destructive/50 bg-destructive/5 opacity-50'
                                                    : 'border-border bg-muted',
                                            )}
                                        >
                                            <img
                                                src={img.url}
                                                alt=""
                                                className={cn(
                                                    'h-full w-full object-cover transition',
                                                    isDeleted
                                                        ? 'grayscale'
                                                        : 'group-hover:brightness-75',
                                                )}
                                            />

                                            {/* "Will be removed" overlay */}
                                            {isDeleted && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="rounded-md bg-destructive/80 px-2 py-0.5 text-[10px] font-medium text-white">
                                                        Removing
                                                    </span>
                                                </div>
                                            )}

                                            {!isDeleted && (
                                                <button
                                                    type="button"
                                                    title="Copy Image URL"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(img.path);
                                                        toast.success('Copied gallery image URL!');
                                                    }}
                                                    className="absolute top-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition hover:bg-black/80 group-hover:opacity-100 cursor-pointer"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                                                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                                                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                                                    </svg>
                                                </button>
                                            )}

                                            {!disabled && (
                                                <button
                                                    type="button"
                                                    onClick={() => toggleDeleteExisting(img.path)}
                                                    className={cn(
                                                        'absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-white transition',
                                                        isDeleted
                                                            ? 'bg-primary/80 opacity-100 hover:bg-primary'
                                                            : 'bg-black/60 opacity-0 hover:bg-black/80 group-hover:opacity-100',
                                                    )}
                                                    aria-label={isDeleted ? 'Undo remove' : 'Remove image'}
                                                >
                                                    {isDeleted ? (
                                                        // Undo icon
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                                            stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"
                                                            strokeLinejoin="round" className="h-3 w-3" aria-hidden="true">
                                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                            <path d="M9 11l-4 4l4 4m-4 -4h11a4 4 0 0 0 0 -8h-1" />
                                                        </svg>
                                                    ) : (
                                                        <XIcon className="h-3 w-3" />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}