'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, CalendarBlank, Clock, Tag, ShareNetwork, ThumbsUp, ChatCircle } from '@phosphor-icons/react/dist/ssr';
import DotPattern from '@/components/DotPattern';
import { getPostBySlug, BlogPost, incrementLike, addComment, getComments, Comment } from '@/lib/blog';

// Remove samplePost completely to avoid confusion
// ...

export default function BlogPostPage() {
    const params = useParams();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [readingProgress, setReadingProgress] = useState(0);

    // Engagement State
    const [likes, setLikes] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState({ author: '', content: '' });
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            if (!params?.slug) {
                setIsLoading(false);
                return;
            }

            try {
                // Fetch Post
                const fetchedPost = await getPostBySlug(params.slug as string);
                setPost(fetchedPost);

                if (fetchedPost) {
                    setLikes(fetchedPost.likes || 0);

                    // Fetch Comments
                    if (fetchedPost.id) {
                        try {
                            const fetchedComments = await getComments(fetchedPost.id);
                            setComments(fetchedComments);
                        } catch (e) {
                            console.error("Failed to load comments", e);
                        }

                        // Check local storage for like status
                        const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]');
                        // FIX: If server says 0 likes, our local "liked" state is definitely stale/wrong.
                        if (likedPosts.includes(fetchedPost.id) && (fetchedPost.likes || 0) > 0) {
                            setIsLiked(true);
                        } else if (likedPosts.includes(fetchedPost.id) && (fetchedPost.likes || 0) === 0) {
                            // Clean up stale local state
                            const newLikedPosts = likedPosts.filter((id: string) => id !== fetchedPost.id);
                            localStorage.setItem('liked_posts', JSON.stringify(newLikedPosts));
                            setIsLiked(false);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching post:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPost();
    }, [params]);

    // Reading progress bar
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollTop / docHeight) * 100;
            setReadingProgress(Math.min(progress, 100));
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLike = async () => {
        if (!post?.id || isLiked) return;

        // Optimistic update
        setLikes(prev => prev + 1);
        setIsLiked(true);

        try {
            // Save to local storage
            const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]');
            localStorage.setItem('liked_posts', JSON.stringify([...likedPosts, post.id]));

            // Sync with backend
            const newCount = await incrementLike(post.id);
            if (newCount === 0) {
                // Backend failure (e.g. invalid permissions/ID)
                throw new Error("Failed to update likes on server");
            }
        } catch (error) {
            console.error("Like failed:", error);
            // Revert optimistic update
            setLikes(prev => prev - 1);
            setIsLiked(false);

            // Remove from local storage
            const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]');
            localStorage.setItem('liked_posts', JSON.stringify(likedPosts.filter((id: string) => id !== post?.id)));

            alert("Couldn't like the post. Please try again.");
        }
    };

    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);
        if (!post?.id || !newComment.author.trim() || !newComment.content.trim()) return;

        setIsSubmittingComment(true);
        try {
            const addedComment = await addComment(post.id, newComment.author, newComment.content);
            if (addedComment) {
                setComments([addedComment, ...comments]);
                setNewComment({ author: '', content: '' });
            } else {
                setSubmitError("Failed to add comment. Please check your connection.");
            }
        } catch (error: any) {
            console.error("Failed to post comment:", error);
            setSubmitError(error.message || "Something went wrong. Please try again.");
        } finally {
            setIsSubmittingComment(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--primary))]"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Post not found</h1>
                <Link href="/blog" className="text-[hsl(var(--primary))] hover:underline">
                    Back to Blog
                </Link>
            </div>
        );
    }

    // Parse markdown-like content to HTML
    const renderContent = (content: string) => {
        // Simple markdown parsing
        let html = content
            // Headers
            .replace(/^## (.+)$/gm, '<h2 class="text-2xl md:text-3xl font-heading font-bold mt-12 mb-6 text-[hsl(var(--foreground))]">$1</h2>')
            .replace(/^### (.+)$/gm, '<h3 class="text-xl md:text-2xl font-heading font-semibold mt-8 mb-4 text-[hsl(var(--foreground))]">$1</h3>')
            // Bold
            .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[hsl(var(--foreground))]">$1</strong>')
            // Blockquotes
            .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-[hsl(var(--accent))] pl-6 my-8 italic text-[hsl(var(--muted-foreground))] text-lg">$1</blockquote>')
            // Lists
            .replace(/^- (.+)$/gm, '<li class="ml-6 mb-2 list-disc">$1</li>')
            // Paragraphs
            .split('\n\n')
            .map(para => {
                if (para.startsWith('<')) return para;
                if (para.trim().startsWith('<li')) return `<ul class="my-6">${para}</ul>`;
                return `<p class="mb-6 leading-relaxed">${para}</p>`;
            })
            .join('');

        return html;
    };

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `पढ़ें: ${post.title}`;

    return (
        <main className="relative min-h-screen overflow-x-hidden pb-20">
            <DotPattern width={32} height={32} cr={1.2} className="opacity-30" />

            {/* Reading Progress Bar */}
            <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-[hsl(var(--muted))]/20">
                <motion.div
                    className="h-full bg-[hsl(var(--accent))]"
                    style={{ width: `${readingProgress}%` }}
                />
            </div>

            {/* Header */}
            <header className="sticky top-1 z-40 backdrop-blur-md bg-[hsl(var(--background))]/80 border-b border-[hsl(var(--border))]">
                <div className="container mx-auto max-w-4xl px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/blog"
                            className="flex items-center gap-2 text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors"
                        >
                            <ArrowLeft weight="bold" className="w-4 h-4" />
                            <span className="font-heading font-medium">Back to Archive</span>
                        </Link>

                        {/* Share Buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigator.share?.({ title: post.title, url: shareUrl })}
                                className="p-2 rounded-full hover:bg-[hsl(var(--muted))]/30 transition-colors"
                                title="Share"
                            >
                                <ShareNetwork weight="bold" className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Article */}
            <article className="container mx-auto max-w-4xl px-6 py-12">
                {/* Article Header */}
                <motion.header
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <span className="inline-block px-3 py-1 text-sm font-medium bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] rounded-full">
                            {post.category}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-6 text-[hsl(var(--foreground))] leading-tight hindi">
                        {post.title}
                    </h1>

                    <div className="flex items-center justify-center gap-6 text-sm text-[hsl(var(--muted-foreground))]">
                        <span className="flex items-center gap-2">
                            <CalendarBlank weight="bold" className="w-4 h-4" />
                            {format(post.createdAt, 'dd MMMM yyyy')}
                        </span>
                        <span className="flex items-center gap-2">
                            <Clock weight="bold" className="w-4 h-4" />
                            {post.readingTime} min read
                        </span>
                    </div>
                </motion.header>

                {/* Article Content */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="prose prose-lg max-w-none hindi"
                    dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
                />

                {/* Tags & Likes */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-12 pt-8 border-t border-[hsl(var(--border))]"
                >
                    <div className="flex items-center gap-4 flex-wrap">
                        {/* Integrated Like Button */}
                        <button
                            onClick={handleLike}
                            disabled={isLiked}
                            className="group flex items-center gap-2 transition-all mr-2"
                            title="Like this post"
                        >
                            <div className={`p-2 rounded-full transition-all duration-300 ${isLiked
                                ? 'text-primary bg-primary/10'
                                : 'text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))]/10 group-hover:text-primary group-hover:bg-primary/10'
                                }`}>
                                <ThumbsUp
                                    weight={isLiked ? "fill" : "bold"}
                                    className={`w-4 h-4 transition-transform duration-300 ${isLiked ? 'scale-110' : 'group-hover:scale-110'}`}
                                />
                            </div>
                            <span className={`text-sm font-medium transition-colors ${isLiked ? 'text-primary' : 'text-[hsl(var(--muted-foreground))] group-hover:text-primary'
                                }`}>
                                {likes}
                            </span>
                        </button>

                        <div className="h-4 w-px bg-[hsl(var(--border))]" />

                        {post.tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-3 py-1 text-sm bg-[hsl(var(--muted))]/20 text-[hsl(var(--muted-foreground))] rounded-full"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                </motion.div>

                {/* Comments */}
                <div className="mt-24">
                    <h3 className="text-xl font-heading font-bold mb-8 flex items-center gap-3 text-[hsl(var(--foreground))]">
                        <ChatCircle weight="bold" className="w-6 h-6" />
                        Discussion <span className="text-[hsl(var(--muted-foreground))] font-normal">({comments.length})</span>
                    </h3>

                    <form onSubmit={handleCommentSubmit} className="mb-12">
                        {submitError && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
                                {submitError}
                            </div>
                        )}
                        <div className="space-y-6">
                            <div>
                                <input
                                    type="text"
                                    required
                                    value={newComment.author}
                                    onChange={(e) => setNewComment({ ...newComment, author: e.target.value })}
                                    placeholder="Name"
                                    className="w-full py-2 bg-transparent border-b border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] outline-none transition-colors placeholder:text-[hsl(var(--muted-foreground))]/50 font-heading"
                                />
                            </div>
                            <div>
                                <textarea
                                    required
                                    value={newComment.content}
                                    onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                                    placeholder="Add to the discussion..."
                                    rows={1}
                                    className="w-full py-2 bg-transparent border-b border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] outline-none transition-colors placeholder:text-[hsl(var(--muted-foreground))]/50 resize-none min-h-[40px]"
                                    onInput={(e) => {
                                        const target = e.target as HTMLTextAreaElement;
                                        target.style.height = 'auto';
                                        target.style.height = `${target.scrollHeight}px`;
                                    }}
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmittingComment || !newComment.content.trim()}
                                    className="px-6 py-2 text-sm font-medium bg-[hsl(var(--foreground))] text-[hsl(var(--background))] rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-8">
                        {comments.length === 0 ? (
                            <p className="text-[hsl(var(--muted-foreground))] text-sm italic">
                                No comments yet. Start the conversation.
                            </p>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="group">
                                    <div className="flex items-baseline justify-between mb-2">
                                        <span className="font-heading font-medium text-[hsl(var(--foreground))]">
                                            {comment.author}
                                        </span>
                                        <span className="text-xs text-[hsl(var(--muted-foreground))]">
                                            {format(comment.createdAt, 'MMM d')}
                                        </span>
                                    </div>
                                    <p className="text-[hsl(var(--muted-foreground))] leading-relaxed text-sm group-hover:text-[hsl(var(--foreground))] transition-colors">
                                        {comment.content}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Author Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="mt-24 p-8 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-[hsl(var(--primary))]/10 flex items-center justify-center">
                            <span className="text-2xl font-heading font-bold text-[hsl(var(--primary))]">म</span>
                        </div>
                        <div>
                            <h3 className="font-heading font-bold text-lg text-[hsl(var(--foreground))]">
                                मृत्युंजय
                            </h3>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                कवि · लेखक · पत्रकार
                            </p>
                        </div>
                    </div>
                    <p className="mt-4 text-[hsl(var(--muted-foreground))] hindi">
                        शब्दों में रचता स्वप्न शांति का, लेखनी से संजोता जगती की रोशनी।
                    </p>
                </motion.div>
            </article>

            {/* Footer */}
            <footer className="border-t border-[hsl(var(--border))] py-8 px-6 mt-12">
                <div className="container mx-auto max-w-4xl text-center">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-[hsl(var(--primary))] font-heading font-medium hover:underline"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        और लेख पढ़ें — Back to Archive
                    </Link>
                </div>
            </footer>
        </main >
    );
}
