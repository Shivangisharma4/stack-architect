'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowLeft,
    Eye,
    EyeOff,
    Save,
    Loader2,
    Bold,
    Italic,
    List,
    Quote,
    Heading2,
    Heading3,
    Link2,
    Check,
    X,
    Send,
} from 'lucide-react';
import DotPattern from '@/components/DotPattern';
import {
    BlogPost,
    getPostById,
    createPost,
    updatePost,
    generateSlug,
    calculateReadingTime,
} from '@/lib/blog';

// Markdown preview renderer (matches blog post display)
const renderContent = (content: string) => {
    if (!content) return '<p class="text-[hsl(var(--muted-foreground))] italic">Start writing to see preview...</p>';

    let html = content
        .replace(/^## (.+)$/gm, '<h2 class="text-2xl md:text-3xl font-heading font-bold mt-12 mb-6 text-[hsl(var(--foreground))]">$1</h2>')
        .replace(/^### (.+)$/gm, '<h3 class="text-xl md:text-2xl font-heading font-semibold mt-8 mb-4 text-[hsl(var(--foreground))]">$1</h3>')
        .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[hsl(var(--foreground))]">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
        .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-[hsl(var(--accent))] pl-6 my-8 italic text-[hsl(var(--muted-foreground))] text-lg">$1</blockquote>')
        .replace(/^- (.+)$/gm, '<li class="ml-6 mb-2 list-disc">$1</li>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-[hsl(var(--primary))] underline hover:opacity-80" target="_blank" rel="noopener noreferrer">$1</a>')
        .split('\n\n')
        .map(para => {
            if (para.startsWith('<')) return para;
            if (para.trim().startsWith('<li')) return `<ul class="my-6">${para}</ul>`;
            return `<p class="mb-6 leading-relaxed">${para}</p>`;
        })
        .join('');

    return html;
};

interface EditorFormData {
    title: string;
    content: string;
    excerpt: string;
    category: string;
    tags: string;
    published: boolean;
    featured: boolean;
}

const emptyForm: EditorFormData = {
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    published: false,
    featured: false,
};

export default function EditorPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('id');

    const [formData, setFormData] = useState<EditorFormData>(emptyForm);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Load existing post if editing
    useEffect(() => {
        if (editId) {
            setIsLoading(true);
            getPostById(editId)
                .then((post) => {
                    if (post) {
                        setFormData({
                            title: post.title,
                            content: post.content,
                            excerpt: post.excerpt,
                            category: post.category,
                            tags: post.tags.join(', '),
                            published: post.published,
                            featured: post.featured,
                        });
                    }
                })
                .catch((err) => {
                    console.error('Failed to load post:', err);
                    setErrorMessage('Failed to load post for editing.');
                })
                .finally(() => setIsLoading(false));
        }
    }, [editId]);

    // Insert text at cursor position
    const insertText = useCallback((before: string, after: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = formData.content.substring(start, end);
        const newText =
            formData.content.substring(0, start) +
            before +
            selectedText +
            after +
            formData.content.substring(end);

        setFormData({ ...formData, content: newText });

        // Restore cursor position
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + before.length + selectedText.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    }, [formData]);

    // Toolbar actions
    const toolbarActions = [
        { icon: Bold, label: 'Bold (Ctrl+B)', action: () => insertText('**', '**') },
        { icon: Italic, label: 'Italic (Ctrl+I)', action: () => insertText('*', '*') },
        { icon: Heading2, label: 'Heading 2', action: () => insertText('\n## ', '') },
        { icon: Heading3, label: 'Heading 3', action: () => insertText('\n### ', '') },
        { icon: List, label: 'List', action: () => insertText('\n- ', '') },
        { icon: Quote, label: 'Quote', action: () => insertText('\n> ', '') },
        { icon: Link2, label: 'Link', action: () => insertText('[', '](url)') },
    ];

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'b') {
                    e.preventDefault();
                    insertText('**', '**');
                } else if (e.key === 'i') {
                    e.preventDefault();
                    insertText('*', '*');
                } else if (e.key === 's') {
                    e.preventDefault();
                    setShowPublishModal(true);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [insertText]);

    // Open publish modal
    const handlePublishClick = () => {
        if (!formData.title.trim() || !formData.content.trim()) {
            setErrorMessage('Title and content are required.');
            return;
        }
        setShowPublishModal(true);
    };

    // Save post
    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus('saving');
        setErrorMessage('');

        try {
            const postData = {
                title: formData.title,
                slug: generateSlug(formData.title),
                content: formData.content,
                excerpt: formData.excerpt || formData.content.slice(0, 150) + '...',
                category: formData.category || 'Uncategorized',
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                published: formData.published,
                featured: formData.featured,
                readingTime: calculateReadingTime(formData.content),
            };

            if (editId) {
                await updatePost(editId, postData);
            } else {
                await createPost(postData);
            }

            setSaveStatus('saved');
            setShowPublishModal(false);
            setTimeout(() => {
                router.push('/admin');
            }, 800);
        } catch (error: any) {
            console.error('Save failed:', error);
            setSaveStatus('error');
            setErrorMessage(error.message || 'Failed to save post.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[hsl(var(--background))]">
            <DotPattern width={32} height={32} cr={1.2} className="opacity-10 fixed inset-0 pointer-events-none" />

            {/* Minimal Header */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-[hsl(var(--background))]/95 border-b border-[hsl(var(--border))]">
                <div className="flex items-center justify-between px-4 md:px-8 py-3">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin"
                            className="p-2 rounded-lg hover:bg-[hsl(var(--muted))]/30 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <span className="text-sm text-[hsl(var(--muted-foreground))]">
                            {editId ? 'Editing' : 'New Post'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Preview Toggle */}
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${showPreview
                                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                                : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/30'
                                }`}
                        >
                            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            <span className="hidden sm:inline">{showPreview ? 'Edit' : 'Preview'}</span>
                        </button>

                        {/* Publish Button */}
                        <button
                            onClick={handlePublishClick}
                            className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg font-medium transition-all hover:opacity-90"
                        >
                            <Send className="w-4 h-4" />
                            <span className="hidden sm:inline">Publish</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Error Display */}
            {errorMessage && (
                <div className="mx-4 md:mx-8 mt-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg flex items-center justify-between text-sm">
                    <span>{errorMessage}</span>
                    <button onClick={() => setErrorMessage('')}>
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Main Editor Area */}
            <div className="flex h-[calc(100vh-60px)]">
                {/* Editor Panel - Clean, Spacious */}
                <div className={`flex-1 flex flex-col transition-all duration-300 ${showPreview ? 'hidden' : 'block'}`}>
                    {/* Toolbar */}
                    <div className="flex items-center gap-1 px-4 md:px-8 py-2 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/5">
                        {toolbarActions.map((tool) => (
                            <button
                                key={tool.label}
                                onClick={tool.action}
                                title={tool.label}
                                className="p-2.5 rounded-lg hover:bg-[hsl(var(--muted))]/50 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                            >
                                <tool.icon className="w-4 h-4" />
                            </button>
                        ))}
                    </div>

                    {/* Title Input - Large, Clean */}
                    <div className="px-4 md:px-8 lg:px-16 xl:px-32 pt-8">
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="शीर्षक / Title..."
                            className="w-full text-3xl md:text-4xl lg:text-5xl font-heading font-bold bg-transparent border-none outline-none placeholder:text-[hsl(var(--muted-foreground))]/40 hindi leading-tight"
                            style={{ fontFamily: "'Noto Serif Devanagari', 'Cormorant Garamond', serif" }}
                        />
                    </div>

                    {/* Content Textarea - Full Space, Clean */}
                    <div className="flex-1 px-4 md:px-8 lg:px-16 xl:px-32 py-6 overflow-y-auto">
                        <textarea
                            ref={textareaRef}
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            placeholder="यहाँ लिखना शुरू करें... / Start writing here..."
                            className="w-full h-full min-h-[60vh] bg-transparent border-none outline-none resize-none text-lg md:text-xl leading-relaxed placeholder:text-[hsl(var(--muted-foreground))]/40 hindi"
                            style={{ fontFamily: "'Noto Serif Devanagari', 'Spectral', serif" }}
                        />
                    </div>

                    {/* Word count footer */}
                    <div className="px-4 md:px-8 py-2 border-t border-[hsl(var(--border))] text-xs text-[hsl(var(--muted-foreground))]">
                        {formData.content.split(/\s+/).filter(Boolean).length} words · {calculateReadingTime(formData.content)} min read
                    </div>
                </div>

                {/* Preview Panel - Full Width when active */}
                <div className={`flex-1 overflow-y-auto bg-[hsl(var(--card))] transition-all duration-300 ${showPreview ? 'block' : 'hidden'}`}>
                    <div className="px-4 md:px-8 lg:px-16 xl:px-32 py-12 max-w-4xl mx-auto">
                        <h1
                            className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-8 text-[hsl(var(--foreground))] leading-tight hindi"
                            style={{ fontFamily: "'Noto Serif Devanagari', 'Cormorant Garamond', serif" }}
                        >
                            {formData.title || 'Untitled'}
                        </h1>
                        <div className="flex items-center gap-4 mb-10 text-sm text-[hsl(var(--muted-foreground))]">
                            <span>{calculateReadingTime(formData.content)} min read</span>
                        </div>
                        <div
                            className="prose prose-lg max-w-none hindi"
                            style={{ fontFamily: "'Noto Serif Devanagari', 'Spectral', serif" }}
                            dangerouslySetInnerHTML={{ __html: renderContent(formData.content) }}
                        />
                    </div>
                </div>
            </div>

            {/* Publish Modal - Metadata on Save */}
            <AnimatePresence>
                {showPublishModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-lg bg-[hsl(var(--background))] rounded-xl shadow-2xl border border-[hsl(var(--border))] overflow-hidden"
                        >
                            <div className="p-6 border-b border-[hsl(var(--border))]">
                                <h2 className="text-xl font-heading font-bold text-[hsl(var(--foreground))]">
                                    Publish Settings
                                </h2>
                                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                                    Add details before publishing
                                </p>
                            </div>

                            <div className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                                        Category (श्रेणी)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        placeholder="e.g., संस्कृति, इतिहास, कविता"
                                        className="w-full px-4 py-3 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                                        Tags (टैग)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        placeholder="tag1, tag2, tag3"
                                        className="w-full px-4 py-3 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                                        Excerpt (सारांश) — Optional
                                    </label>
                                    <textarea
                                        value={formData.excerpt}
                                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                        placeholder="Brief description for previews..."
                                        className="w-full px-4 py-3 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none h-24"
                                    />
                                </div>

                                <div className="flex items-center gap-6 pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.published}
                                            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                                            className="w-5 h-5 rounded"
                                        />
                                        <span className="text-sm">Publish Now</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.featured}
                                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                            className="w-5 h-5 rounded"
                                        />
                                        <span className="text-sm">Featured</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 p-6 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/10">
                                <button
                                    onClick={() => setShowPublishModal(false)}
                                    className="px-5 py-2.5 text-sm font-medium text-[hsl(var(--foreground))] border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--muted))]/30 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : saveStatus === 'saved' ? (
                                        <Check className="w-4 h-4" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    {isSaving ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Post'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
