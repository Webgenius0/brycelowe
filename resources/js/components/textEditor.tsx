import { Color } from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Code,
    Heading1,
    Heading2,
    Heading3,
    Pilcrow,
    List,
    ListOrdered,
    Quote,
    Code2,
    Minus,
    Undo,
    Redo,
    RemoveFormatting,
    Palette,
    Type,
} from 'lucide-react';
import { useEffect } from 'react';

// Custom TipTap Extension for Font Size
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        fontSize: {
            setFontSize: (size: string) => ReturnType;
            unsetFontSize: () => ReturnType;
        };
    }
}

const FontSize = Extension.create({
    name: 'fontSize',

    addOptions() {
        return {
            types: ['textStyle'],
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: (element) => element.style.fontSize?.replace(/['"]+/g, ''),
                        renderHTML: (attributes) => {
                            if (!attributes.fontSize) {
                                return {};
                            }
                            return {
                                style: `font-size: ${attributes.fontSize}`,
                            };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            setFontSize:
                (fontSize: string) =>
                ({ chain }) => {
                    return chain().setMark('textStyle', { fontSize }).run();
                },
            unsetFontSize:
                () =>
                ({ chain }) => {
                    return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
                },
        };
    },
});

type Props = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
};

const PRESET_COLORS = [
    { label: 'Default', value: '' },
    { label: 'Red', value: '#ef4444' },
    { label: 'Orange', value: '#f97316' },
    { label: 'Amber', value: '#f59e0b' },
    { label: 'Emerald', value: '#10b981' },
    { label: 'Cyan', value: '#06b6d4' },
    { label: 'Blue', value: '#3b82f6' },
    { label: 'Violet', value: '#8b5cf6' },
    { label: 'Pink', value: '#ec4899' },
    { label: 'Dark', value: '#0f172a' },
];

const FONT_SIZES = [
    { label: 'Normal Size', value: '' },
    { label: 'Small (12px)', value: '12px' },
    { label: 'Regular (14px)', value: '14px' },
    { label: 'Medium (16px)', value: '16px' },
    { label: 'Large (18px)', value: '18px' },
    { label: 'XL (20px)', value: '20px' },
    { label: '2XL (24px)', value: '24px' },
    { label: '3XL (30px)', value: '30px' },
    { label: '4XL (36px)', value: '36px' },
];

export default function TextEditor({
    value,
    onChange,
    placeholder = 'Write something...',
}: Props) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            TextStyle,
            Color,
            FontSize,
            Underline,
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: value || '',
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'min-h-[220px] p-4 focus:outline-none prose dark:prose-invert max-w-none text-base leading-relaxed',
            },
        },
    });

    // external value update (edit mode fix)
    useEffect(() => {
        if (!editor) {
            return;
        }

        if (value !== undefined && editor.getHTML() !== value) {
            editor.commands.setContent(value || '', {
                emitUpdate: false,
            });
        }
    }, [editor, value]);

    if (!editor) {
        return null;
    }

    const btnClass = (isActive: boolean, disabled: boolean = false) =>
        `inline-flex size-8 items-center justify-center rounded-md text-xs transition cursor-pointer ${
            disabled
                ? 'opacity-40 cursor-not-allowed text-muted-foreground'
                : isActive
                  ? 'bg-violet-600/15 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 font-bold shadow-xs'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        }`;

    const activeColor = editor.getAttributes('textStyle').color || '';
    const activeFontSize = editor.getAttributes('textStyle').fontSize || '';

    return (
        <div className="overflow-hidden rounded-lg border border-input bg-card shadow-xs transition-colors focus-within:border-violet-500/50 focus-within:ring-2 focus-within:ring-violet-500/20">
            {/* Rich HTML Toolbar */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-border/60 bg-muted/30 p-2">
                {/* Font Size Selector */}
                <div className="flex items-center gap-1">
                    <Type className="size-4 text-muted-foreground ml-1" />
                    <select
                        value={activeFontSize}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val) {
                                editor.chain().focus().setFontSize(val).run();
                            } else {
                                editor.chain().focus().unsetFontSize().run();
                            }
                        }}
                        className="h-8 rounded-md border border-input bg-background px-2 py-0 text-xs font-medium text-foreground focus:border-violet-500 focus:outline-none cursor-pointer"
                        title="Text Font Size"
                    >
                        {FONT_SIZES.map((size) => (
                            <option key={size.value} value={size.value}>
                                {size.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Text Color Picker & Palette */}
                <div className="flex items-center gap-1">
                    <Palette className="size-4 text-muted-foreground ml-1" />
                    <div className="flex items-center gap-1 rounded-md border border-input bg-background p-1">
                        <input
                            type="color"
                            value={activeColor || '#000000'}
                            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                            className="size-5 rounded border-0 cursor-pointer p-0 bg-transparent"
                            title="Custom Color Picker"
                        />
                        <div className="flex items-center gap-0.5">
                            {PRESET_COLORS.slice(1, 8).map((c) => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => editor.chain().focus().setColor(c.value).run()}
                                    className={`size-4 rounded-full border transition cursor-pointer ${
                                        activeColor === c.value
                                            ? 'ring-2 ring-violet-500 ring-offset-1 scale-110'
                                            : 'border-border/60 hover:scale-110'
                                    }`}
                                    style={{ backgroundColor: c.value }}
                                    title={c.label}
                                />
                            ))}
                            {activeColor && (
                                <button
                                    type="button"
                                    onClick={() => editor.chain().focus().unsetColor().run()}
                                    className="ml-1 rounded px-1 text-[10px] font-bold text-destructive hover:bg-destructive/10"
                                    title="Reset Color"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mx-1 h-4 w-px bg-border/60" />

                {/* Formatting Group */}
                <div className="flex items-center gap-0.5">
                    <button
                        type="button"
                        title="Bold (Ctrl+B)"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={btnClass(editor.isActive('bold'))}
                    >
                        <Bold className="size-4" />
                    </button>
                    <button
                        type="button"
                        title="Italic (Ctrl+I)"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={btnClass(editor.isActive('italic'))}
                    >
                        <Italic className="size-4" />
                    </button>
                    <button
                        type="button"
                        title="Underline (Ctrl+U)"
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        className={btnClass(editor.isActive('underline'))}
                    >
                        <UnderlineIcon className="size-4" />
                    </button>
                    <button
                        type="button"
                        title="Strikethrough"
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={btnClass(editor.isActive('strike'))}
                    >
                        <Strikethrough className="size-4" />
                    </button>
                    <button
                        type="button"
                        title="Inline Code"
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        className={btnClass(editor.isActive('code'))}
                    >
                        <Code className="size-4" />
                    </button>
                </div>

                <div className="mx-1 h-4 w-px bg-border/60" />

                {/* Headings & Paragraph */}
                <div className="flex items-center gap-0.5">
                    <button
                        type="button"
                        title="Heading 1"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={btnClass(editor.isActive('heading', { level: 1 }))}
                    >
                        <Heading1 className="size-4" />
                    </button>
                    <button
                        type="button"
                        title="Heading 2"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={btnClass(editor.isActive('heading', { level: 2 }))}
                    >
                        <Heading2 className="size-4" />
                    </button>
                    <button
                        type="button"
                        title="Heading 3"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        className={btnClass(editor.isActive('heading', { level: 3 }))}
                    >
                        <Heading3 className="size-4" />
                    </button>
                    <button
                        type="button"
                        title="Paragraph"
                        onClick={() => editor.chain().focus().setParagraph().run()}
                        className={btnClass(editor.isActive('paragraph'))}
                    >
                        <Pilcrow className="size-4" />
                    </button>
                </div>

                <div className="mx-1 h-4 w-px bg-border/60" />

                {/* Lists & Block Quotes */}
                <div className="flex items-center gap-0.5">
                    <button
                        type="button"
                        title="Bullet List"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={btnClass(editor.isActive('bulletList'))}
                    >
                        <List className="size-4" />
                    </button>
                    <button
                        type="button"
                        title="Numbered List"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={btnClass(editor.isActive('orderedList'))}
                    >
                        <ListOrdered className="size-4" />
                    </button>
                    <button
                        type="button"
                        title="Blockquote"
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={btnClass(editor.isActive('blockquote'))}
                    >
                        <Quote className="size-4" />
                    </button>
                    <button
                        type="button"
                        title="Code Block"
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        className={btnClass(editor.isActive('codeBlock'))}
                    >
                        <Code2 className="size-4" />
                    </button>
                    <button
                        type="button"
                        title="Horizontal Rule"
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        className={btnClass(false)}
                    >
                        <Minus className="size-4" />
                    </button>
                </div>

                <div className="mx-1 h-4 w-px bg-border/60" />

                {/* History & Clear Formatting */}
                <div className="flex items-center gap-0.5">
                    <button
                        type="button"
                        title="Undo (Ctrl+Z)"
                        disabled={!editor.can().undo()}
                        onClick={() => editor.chain().focus().undo().run()}
                        className={btnClass(false, !editor.can().undo())}
                    >
                        <Undo className="size-4" />
                    </button>
                    <button
                        type="button"
                        title="Redo (Ctrl+Y)"
                        disabled={!editor.can().redo()}
                        onClick={() => editor.chain().focus().redo().run()}
                        className={btnClass(false, !editor.can().redo())}
                    >
                        <Redo className="size-4" />
                    </button>
                    <button
                        type="button"
                        title="Clear Formatting"
                        onClick={() => editor.chain().focus().unsetAllMarks().unsetColor().unsetFontSize().clearNodes().run()}
                        className={btnClass(false)}
                    >
                        <RemoveFormatting className="size-4" />
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <EditorContent editor={editor} />
        </div>
    );
}
