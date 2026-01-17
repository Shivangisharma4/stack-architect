'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowLeft, Search, Calendar, Clock, Tag, Loader2 } from 'lucide-react';
import DotPattern from '@/components/DotPattern';
import { getPublishedPostSummaries, getCategories, BlogPostSummary } from '@/lib/blog';

// Sample data for initial display (fallback)
const samplePosts: BlogPostSummary[] = [
    {
        id: '1',
        title: 'नवाचार सूर्य हुए उत्तरायण: एक सशक्त भारत का उदय',
        titleHindi: 'नवाचार सूर्य हुए उत्तरायण',
        slug: 'navaachar-surya-uttarayan',
        excerpt: 'भारतीय संस्कृति में "उत्तरायण" का समय अंधकार से प्रकाश की ओर गमन का प्रतीक है। जब सूर्य उत्तर की ओर गमन करता है, तो वह न केवल शीत को समाप्त करता है, बल्कि जीवन में नई ऊर्जा का संचार भी करता है।',
        category: 'संस्कृति',
        tags: ['भारत', 'नवाचार', 'उत्तरायण'],
        published: true,
        featured: true,
        createdAt: new Date('2026-01-13'),
        readingTime: 8,
    },
    {
        id: '2',
        title: 'लोहड़ी और दूल्ला भट्टी: एक ऐतिहासिक और सांस्कृतिक यात्रा',
        slug: 'lohri-dulla-bhatti',
        excerpt: 'लोहड़ी का त्योहार पंजाब की समृद्ध संस्कृति का अविभाज्य अंग है। इस त्योहार के साथ दूल्ला भट्टी की वीरगाथा जुड़ी है जो आज भी लोकगीतों में गूंजती है।',
        category: 'इतिहास',
        tags: ['लोहड़ी', 'पंजाब', 'त्योहार'],
        published: true,
        featured: false,
        createdAt: new Date('2025-01-09'),
        readingTime: 6,
    },
];

const sampleCategories = ['संस्कृति', 'इतिहास', 'राजनीति', 'शिक्षा', 'आध्यात्म', 'प्रौद्योगिकी'];

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPostSummary[]>([]);
    const [categories, setCategories] = useState<string[]>(sampleCategories);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const POSTS_PER_PAGE = 50;

    // Fetch posts on mount
    useEffect(() => {
        const fetchData = async () => {
            // ... existing fetch logic ...
            // (I will keep the existing logic, just referring to where I am inserting)
            setIsLoading(true);
            try {
                // Fetch posts
                const fetchedPosts = await getPublishedPostSummaries();
                if (fetchedPosts.length > 0) {
                    setPosts(fetchedPosts);
                } else {
                    setPosts(samplePosts); // Fallback to sample if empty
                }

                // Fetch categories
                const fetchedCategories = await getCategories();
                if (fetchedCategories.length > 0) {
                    setCategories(fetchedCategories);
                }
            } catch (error: any) {
                console.error("Failed to fetch blog data:", error);
                setPosts(samplePosts);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Reset page on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, searchQuery]);

    // Filter posts based on category and search
    const filteredPosts = posts.filter(post => {
        const matchesCategory = !selectedCategory || post.category === selectedCategory;
        const matchesSearch = !searchQuery ||
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const featuredPost = filteredPosts.find(post => post.featured);
    const regularPosts = filteredPosts.filter(post => !post.featured);

    // Pagination Logic
    const totalPages = Math.ceil(regularPosts.length / POSTS_PER_PAGE);
    const paginatedPosts = regularPosts.slice(
        (currentPage - 1) * POSTS_PER_PAGE,
        currentPage * POSTS_PER_PAGE
    );

    // Loading state
    if (isLoading && posts.length === 0) {
        return (
            <main className="relative min-h-screen flex items-center justify-center">
                <DotPattern width={32} height={32} cr={1.5} className="opacity-40" />
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" />
                    <p className="text-[hsl(var(--muted-foreground))]">Loading posts...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="relative min-h-screen">
            <DotPattern width={32} height={32} cr={1.5} className="opacity-40" />

            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-[hsl(var(--background))]/80 border-b border-[hsl(var(--border))]">
                <div className="container mx-auto max-w-6xl px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="font-heading text-xl font-bold">मृत्युंजय</span>
                        </Link>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                            <input
                                type="text"
                                placeholder="खोजें..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] w-48 md:w-64"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Page Content */}
            <div className="container mx-auto max-w-6xl px-6 py-12">
                {/* Page Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-[hsl(var(--foreground))]">
                        लेखन संग्रह
                    </h1>
                    <p className="text-lg text-[hsl(var(--muted-foreground))]">
                        The Archive — All writings in one place
                    </p>
                </motion.div>

                {/* Categories */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="flex flex-wrap items-center justify-center gap-3 mb-12"
                >
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!selectedCategory
                            ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                            : 'bg-[hsl(var(--muted))]/20 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/40'
                            }`}
                    >
                        सभी
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === category
                                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                                : 'bg-[hsl(var(--muted))]/20 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/40'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </motion.div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Featured Post (Large) */}
                    {featuredPost && (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="md:col-span-2 lg:col-span-2 lg:row-span-2"
                        >
                            <Link href={`/blog/${featuredPost.slug}`} className="block h-full">
                                <article className="card h-full p-8 md:p-10 flex flex-col justify-end min-h-[350px] lg:min-h-[500px] relative overflow-hidden group">
                                    {/* Background number decoration */}
                                    <div className="absolute top-6 right-8 opacity-5 text-[10rem] font-heading leading-none">
                                        १
                                    </div>

                                    <div className="relative z-10 mt-auto">
                                        <div className="flex items-center gap-4 mb-4">
                                            <span className="inline-block px-3 py-1 text-xs font-medium uppercase tracking-wider bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] rounded-full">
                                                Featured
                                            </span>
                                            <span className="inline-block px-3 py-1 text-xs font-medium bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] rounded-full">
                                                {featuredPost.category}
                                            </span>
                                        </div>

                                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold mb-4 group-hover:text-[hsl(var(--primary))] transition-colors hindi leading-tight">
                                            {featuredPost.title}
                                        </h2>

                                        <p className="text-[hsl(var(--muted-foreground))] line-clamp-3 mb-6 text-base md:text-lg hindi">
                                            {featuredPost.excerpt}
                                        </p>

                                        <div className="flex items-center gap-4 text-sm text-[hsl(var(--muted-foreground))]">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {format(featuredPost.createdAt, 'dd MMM yyyy')}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {featuredPost.readingTime} min read
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        </motion.div>
                    )}

                    {/* Regular Posts (Paginated) */}
                    {paginatedPosts.map((post, index) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                        >
                            <Link href={`/blog/${post.slug}`} className="block h-full">
                                <article className="card h-full p-6 flex flex-col group min-h-[220px]">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="inline-block px-2 py-0.5 text-xs font-medium bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] rounded">
                                            {post.category}
                                        </span>
                                    </div>

                                    <h3 className="text-lg md:text-xl font-heading font-semibold mb-3 group-hover:text-[hsl(var(--primary))] transition-colors hindi line-clamp-2 flex-grow">
                                        {post.title}
                                    </h3>

                                    <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2 mb-4 hindi">
                                        {post.excerpt}
                                    </p>

                                    <div className="flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))] mt-auto">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {format(post.createdAt, 'dd MMM')}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {post.readingTime} min
                                        </span>
                                    </div>
                                </article>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-12">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => {
                                    setCurrentPage(page);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${currentPage === page
                                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                                    : 'bg-[hsl(var(--secondary))]/10 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]/20'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {filteredPosts.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <p className="text-lg text-[hsl(var(--muted-foreground))]">
                            कोई लेख नहीं मिला
                        </p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]/70 mt-2">
                            No posts found. Try adjusting your search or filters.
                        </p>
                    </motion.div>
                )}
            </div>

            {/* Footer */}
            <footer className="border-t border-[hsl(var(--border))] py-8 px-6 mt-12">
                <div className="container mx-auto max-w-6xl text-center">
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        © {new Date().getFullYear()} मृत्युंजय | Mritunjay. All rights reserved.
                    </p>
                </div>
            </footer>
        </main>
    );
}
