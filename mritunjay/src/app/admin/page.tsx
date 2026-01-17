'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
    ArrowLeft,
    Plus,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    Star,
    LogIn,
    LogOut,
    Loader2,
    Save,
    X,
    FileText,
} from 'lucide-react';
import DotPattern from '@/components/DotPattern';
import { BlogPost, getAllPosts, createPost, updatePost, deletePost, generateSlug, calculateReadingTime } from '@/lib/blog';

// Demo mode flag (set to false when Firebase is configured)
const DEMO_MODE = false;

// Sample posts for demo
const samplePosts: BlogPost[] = [
    {
        id: '1',
        title: 'नवाचार सूर्य हुए उत्तरायण: एक सशक्त भारत का उदय',
        slug: 'navaachar-surya-uttarayan',
        content: 'भारतीय संस्कृति में उत्तरायण का समय...',
        excerpt: 'भारतीय संस्कृति में "उत्तरायण" का समय अंधकार से प्रकाश की ओर गमन का प्रतीक है।',
        category: 'संस्कृति',
        tags: ['भारत', 'नवाचार'],
        published: true,
        featured: true,
        createdAt: new Date('2026-01-13'),
        updatedAt: new Date('2026-01-13'),
        readingTime: 8,
    },
    {
        id: '2',
        title: 'लोहड़ी और दूल्ला भट्टी: एक ऐतिहासिक यात्रा',
        slug: 'lohri-dulla-bhatti',
        content: 'लोहड़ी का त्योहार पंजाब की समृद्ध संस्कृति...',
        excerpt: 'लोहड़ी का त्योहार पंजाब की समृद्ध संस्कृति का अविभाज्य अंग है।',
        category: 'इतिहास',
        tags: ['लोहड़ी', 'पंजाब'],
        published: true,
        featured: false,
        createdAt: new Date('2025-01-09'),
        updatedAt: new Date('2025-01-09'),
        readingTime: 6,
    },
];

interface PostFormData {
    title: string;
    content: string;
    excerpt: string;
    category: string;
    tags: string;
    published: boolean;
    featured: boolean;
}

const emptyForm: PostFormData = {
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    published: false,
    featured: false,
};

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [posts, setPosts] = useState<BlogPost[]>([]); // Initialize empty, fetch on mount
    const [showEditor, setShowEditor] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [formData, setFormData] = useState<PostFormData>(emptyForm);
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [fetchError, setFetchError] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'published' | 'drafts' | 'featured'>('all');

    // Fetch posts on mount
    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                const fetchedPosts = await getAllPosts();
                setPosts(fetchedPosts);
            } catch (error: any) {
                console.error("Failed to fetch posts:", error);
                if (error?.code === 'permission-denied') {
                    setFetchError('Missing permissions. Please update your Firestore Security Rules to allow access.');
                } else if (error?.code === 'failed-precondition') {
                    setFetchError('Database index is building. This may take a few minutes. Please wait and refresh.');
                } else {
                    setFetchError('Failed to load posts. Please check your connection.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated && !DEMO_MODE) {
            fetchPosts();
        } else if (DEMO_MODE) {
            // Use sample data in demo mode
            import('@/lib/blog').then(module => {
                // Accessing private sample data not possible here without exporting it, 
                // but getAllPosts handles demo mode fallback internally in lib/blog.ts
                module.getAllPosts().then(setPosts);
            });
        }
    }, [isAuthenticated]);

    // Simple demo authentication
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Demo password - in production, use Firebase Auth
        if (password === 'mritunjay2024') {
            setIsAuthenticated(true);
            setLoginError('');
        } else {
            setLoginError('Incorrect password');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setPassword('');
    };

    const router = useRouter();

    const handleCreateNew = () => {
        router.push('/admin/editor');
    };

    const handleEdit = (post: BlogPost) => {
        router.push(`/admin/editor?id=${post.id}`);
    };

    // Delete Confirmation State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [postToDelete, setPostToDelete] = useState<string | null>(null);

    const checkDelete = (id: string) => {
        setPostToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!postToDelete) return;

        // Optimistic delete
        const previousPosts = [...posts];
        setPosts(posts.filter(p => p.id !== postToDelete));
        setShowDeleteModal(false);

        try {
            if (!DEMO_MODE) {
                await deletePost(postToDelete);
            }
        } catch (error: any) {
            console.error("Delete failed:", error);
            setPosts(previousPosts); // Revert
            setFetchError(`Delete failed: ${error.message}`);
        } finally {
            setPostToDelete(null);
        }
    };

    const handleTogglePublish = async (post: BlogPost) => {
        if (!post.id) return;

        // Optimistic Update
        const previousPosts = [...posts];
        const updatedPosts = posts.map(p =>
            p.id === post.id ? { ...p, published: !p.published } : p
        );
        setPosts(updatedPosts);

        try {
            if (!DEMO_MODE) {
                await updatePost(post.id, { published: !post.published });
            }
        } catch (error: any) {
            console.error("Failed to toggle publish status:", error);
            setPosts(previousPosts); // Revert on failure
            setFetchError(`Action failed: ${error.message || 'Unknown error'}`);
            setTimeout(() => setFetchError(''), 3000);
        }
    };

    const handleToggleFeatured = async (post: BlogPost) => {
        if (!post.id) return;

        // Optimistic Update
        const previousPosts = [...posts];
        const updatedPosts = posts.map(p =>
            p.id === post.id ? { ...p, featured: !p.featured } : p
        );
        setPosts(updatedPosts);

        try {
            if (!DEMO_MODE) {
                await updatePost(post.id, { featured: !post.featured });
            }
        } catch (error: any) {
            console.error("Failed to toggle featured status:", error);
            setPosts(previousPosts); // Revert
            setFetchError(`Action failed: ${error.message || 'Unknown error'}`);
            setTimeout(() => setFetchError(''), 3000);
        }
    };

    const handleSavePost = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const postData = {
            title: formData.title,
            slug: generateSlug(formData.title),
            content: formData.content,
            excerpt: formData.excerpt || formData.content.slice(0, 150) + '...',
            category: formData.category,
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
            published: formData.published,
            featured: formData.featured,
        };

        const updateData: any = { ...postData };
        if (postData.content) {
            updateData.readingTime = calculateReadingTime(postData.content);
        }


        if (DEMO_MODE) {
            if (editingPost) {
                setPosts(posts.map(p =>
                    p.id === editingPost.id
                        ? { ...p, ...updateData, updatedAt: new Date() }
                        : p
                ));
            } else {
                const newPost: BlogPost = {
                    ...updateData,
                    id: Date.now().toString(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                setPosts([newPost, ...posts]);
            }
        } else {
            try {
                if (editingPost) {
                    await updatePost(editingPost.id!, updateData);
                } else {
                    await createPost(updateData);
                }
                const updatedPosts = await getAllPosts();
                setPosts(updatedPosts);
            } catch (error: any) {
                setFetchError(`Save failed: ${error.message}`);
            }
        }

        setIsLoading(false);
        setShowEditor(false);
        setEditingPost(null);
        setFormData(emptyForm);
    };

    // Login Screen
    if (!isAuthenticated) {
        return (
            <main className="relative min-h-screen flex items-center justify-center p-6">
                <DotPattern width={32} height={32} cr={1.5} className="opacity-40" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    <div className="card p-8">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[hsl(var(--primary))]/10 mb-4">
                                <FileText className="w-8 h-8 text-[hsl(var(--primary))]" />
                            </div>
                            <h1 className="text-2xl font-heading font-bold text-[hsl(var(--foreground))]">
                                Admin Panel
                            </h1>
                            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
                                मृत्युंजय — Blog Management
                            </p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                                    placeholder="Enter admin password"
                                />
                                {loginError && (
                                    <p className="text-sm text-red-500 mt-2">{loginError}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg font-medium transition-all hover:opacity-90"
                            >
                                <LogIn className="w-4 h-4" />
                                Sign In
                            </button>
                        </form>



                        <div className="mt-6 text-center">
                            <Link
                                href="/"
                                className="text-sm text-[hsl(var(--primary))] hover:underline"
                            >
                                ← Back to Home
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </main>
        );
    }

    // Editor Modal
    const EditorModal = () => (
        <AnimatePresence>
            {showEditor && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[hsl(var(--background))] rounded-xl shadow-2xl border border-[hsl(var(--border))]"
                    >
                        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]">
                            <h2 className="text-xl font-heading font-bold text-[hsl(var(--foreground))]">
                                {editingPost ? 'Edit Post' : 'Create New Post'}
                            </h2>
                            <button
                                onClick={() => setShowEditor(false)}
                                className="p-2 rounded-lg hover:bg-[hsl(var(--muted))]/30 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSavePost} className="p-6 space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                                    Title (शीर्षक)
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] font-heading text-lg"
                                    placeholder="Enter post title..."
                                    required
                                />
                            </div>

                            {/* Content */}
                            <div>
                                <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                                    Content (सामग्री)
                                </label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-4 py-3 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] min-h-[300px] resize-y"
                                    placeholder="Write your blog content in Markdown format...

## उपशीर्षक
Your content here...

- List item 1
- List item 2

> Blockquote text"
                                    required
                                />
                                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
                                    Supports Markdown: ## headers, **bold**, - lists, {">"} blockquotes
                                </p>
                            </div>

                            {/* Excerpt */}
                            <div>
                                <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                                    Excerpt (सारांश)
                                </label>
                                <textarea
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    className="w-full px-4 py-3 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] min-h-[80px] resize-y"
                                    placeholder="Brief description for previews..."
                                />
                            </div>

                            {/* Category & Tags */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                                        Category (श्रेणी)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-3 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                                        placeholder="e.g., संस्कृति, इतिहास"
                                        required
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
                                        className="w-full px-4 py-3 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                                        placeholder="tag1, tag2, tag3"
                                    />
                                </div>
                            </div>

                            {/* Toggles */}
                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.published}
                                        onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                                        className="w-5 h-5 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--ring))]"
                                    />
                                    <span className="text-sm text-[hsl(var(--foreground))]">Published</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.featured}
                                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                        className="w-5 h-5 rounded border-[hsl(var(--border))] text-[hsl(var(--accent))] focus:ring-[hsl(var(--ring))]"
                                    />
                                    <span className="text-sm text-[hsl(var(--foreground))]">Featured</span>
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-4 pt-6 border-t border-[hsl(var(--border))]">
                                <button
                                    type="button"
                                    onClick={() => setShowEditor(false)}
                                    className="px-6 py-2.5 text-[hsl(var(--foreground))] border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--muted))]/30 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    {editingPost ? 'Update Post' : 'Create Post'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    // Render Admin Dashboard
    return (
        <main className="relative min-h-screen">
            <DotPattern width={32} height={32} cr={1.5} className="opacity-30" />

            {/* Header */}
            <header className="sticky top-0 z-40 backdrop-blur-md bg-[hsl(var(--background))]/80 border-b border-[hsl(var(--border))]">
                <div className="container mx-auto max-w-6xl px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/"
                                className="flex items-center gap-2 text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Link>
                            <h1 className="font-heading text-xl font-bold text-[hsl(var(--foreground))]">
                                Admin Dashboard
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleCreateNew}
                                className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg font-medium transition-all hover:opacity-90"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">New Post</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Stats - Clickable Filters */}
            <div className="container mx-auto max-w-6xl px-6 py-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <button
                        onClick={() => setActiveFilter('all')}
                        className={`card p-4 text-center transition-all ${activeFilter === 'all' ? 'ring-2 ring-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5' : 'hover:bg-[hsl(var(--muted))]/20'}`}
                    >
                        <p className="text-3xl font-heading font-bold text-[hsl(var(--primary))]">
                            {posts.length}
                        </p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Total Posts</p>
                    </button>
                    <button
                        onClick={() => setActiveFilter('published')}
                        className={`card p-4 text-center transition-all ${activeFilter === 'published' ? 'ring-2 ring-green-500 bg-green-50' : 'hover:bg-[hsl(var(--muted))]/20'}`}
                    >
                        <p className="text-3xl font-heading font-bold text-green-600">
                            {posts.filter(p => p.published).length}
                        </p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Published</p>
                    </button>
                    <button
                        onClick={() => setActiveFilter('drafts')}
                        className={`card p-4 text-center transition-all ${activeFilter === 'drafts' ? 'ring-2 ring-yellow-500 bg-yellow-50' : 'hover:bg-[hsl(var(--muted))]/20'}`}
                    >
                        <p className="text-3xl font-heading font-bold text-yellow-600">
                            {posts.filter(p => !p.published).length}
                        </p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Drafts</p>
                    </button>
                    <button
                        onClick={() => setActiveFilter('featured')}
                        className={`card p-4 text-center transition-all ${activeFilter === 'featured' ? 'ring-2 ring-[hsl(var(--accent))] bg-[hsl(var(--accent))]/5' : 'hover:bg-[hsl(var(--muted))]/20'}`}
                    >
                        <p className="text-3xl font-heading font-bold text-[hsl(var(--accent))]">
                            {posts.filter(p => p.featured).length}
                        </p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Featured</p>
                    </button>
                </div>

                {/* Posts List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-heading font-bold text-[hsl(var(--foreground))]">
                            {activeFilter === 'all' ? 'All Posts' : activeFilter === 'published' ? 'Published Posts' : activeFilter === 'drafts' ? 'Draft Posts' : 'Featured Posts'}
                        </h2>
                        {activeFilter !== 'all' && (
                            <button
                                onClick={() => setActiveFilter('all')}
                                className="text-sm text-[hsl(var(--primary))] hover:underline"
                            >
                                Show All
                            </button>
                        )}
                    </div>

                    {fetchError && (
                        <div className="p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 001 1h.01a1 1 0 001-1V6a1 1 0 00-1-1H10z" clipRule="evenodd" />
                            </svg>
                            <span>{fetchError}</span>
                        </div>
                    )}

                    {posts.length === 0 && !isLoading && !fetchError ? (
                        <div className="card p-12 text-center">
                            <FileText className="w-12 h-12 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
                            <p className="text-[hsl(var(--muted-foreground))]">
                                No posts yet. Create your first post!
                            </p>
                        </div>
                    ) : isLoading ? (
                        <div className="card p-12 text-center">
                            <Loader2 className="w-12 h-12 text-[hsl(var(--primary))] mx-auto mb-4 animate-spin" />
                            <p className="text-[hsl(var(--muted-foreground))]">Loading posts...</p>
                        </div>
                    ) : (() => {
                        const filteredPosts = posts.filter(p => {
                            if (activeFilter === 'published') return p.published;
                            if (activeFilter === 'drafts') return !p.published;
                            if (activeFilter === 'featured') return p.featured;
                            return true; // 'all'
                        });

                        if (filteredPosts.length === 0) {
                            return (
                                <div className="card p-12 text-center">
                                    <FileText className="w-12 h-12 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
                                    <p className="text-[hsl(var(--muted-foreground))]">
                                        No {activeFilter === 'all' ? '' : activeFilter} posts found.
                                    </p>
                                </div>
                            );
                        }

                        return (
                            <div className="space-y-3">
                                {filteredPosts.map((post) => (
                                    <motion.div
                                        key={post.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="card p-4 md:p-6"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {post.featured && (
                                                        <Star className="w-4 h-4 text-[hsl(var(--accent))] fill-current" />
                                                    )}
                                                    <span className={`text-xs px-2 py-0.5 rounded ${post.published
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {post.published ? 'Published' : 'Draft'}
                                                    </span>
                                                    <span className="text-xs px-2 py-0.5 rounded bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
                                                        {post.category}
                                                    </span>
                                                </div>
                                                <h3 className="font-heading font-semibold text-[hsl(var(--foreground))] truncate hindi">
                                                    {post.title}
                                                </h3>
                                                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                                                    {format(post.createdAt, 'dd MMM yyyy')} · {post.readingTime} min read
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleToggleFeatured(post)}
                                                    className={`p-2 rounded-lg transition-colors ${post.featured
                                                        ? 'bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]'
                                                        : 'hover:bg-[hsl(var(--muted))]/30 text-[hsl(var(--muted-foreground))]'
                                                        }`}
                                                    title={post.featured ? 'Remove from featured' : 'Mark as featured'}
                                                >
                                                    <Star className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleTogglePublish(post)}
                                                    className={`p-2 rounded-lg transition-colors ${post.published
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'hover:bg-[hsl(var(--muted))]/30 text-[hsl(var(--muted-foreground))]'
                                                        }`}
                                                    title={post.published ? 'Unpublish' : 'Publish'}
                                                >
                                                    {post.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(post)}
                                                    className="p-2 rounded-lg hover:bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => checkDelete(post.id!)}
                                                    className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Editor Modal */}
            <EditorModal />

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
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
                            className="w-full max-w-sm bg-[hsl(var(--background))] rounded-xl shadow-2xl border border-[hsl(var(--border))] p-6"
                        >
                            <h3 className="text-lg font-heading font-bold text-[hsl(var(--foreground))] mb-2">
                                Delete Post?
                            </h3>
                            <p className="text-[hsl(var(--muted-foreground))] text-sm mb-6">
                                This action cannot be undone. Are you sure you want to permanently delete this post?
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-[hsl(var(--foreground))] border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--muted))]/30 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );

}
