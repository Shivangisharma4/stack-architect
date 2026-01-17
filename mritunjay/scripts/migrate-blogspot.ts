/**
 * Blogspot to Firebase Migration Script
 * 
 * This script scrapes posts from mritunjaysharma13.blogspot.com
 * and saves them to Firebase Firestore.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-key",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:000000000000:web:000000000000"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Archive months from the blog
const archiveMonths = [
    '2026/01', // 3 posts
    '2025/12', // 10 posts
    '2025/11', // 8 posts
    '2025/10', // 10 posts
    '2025/09', // 9 posts
    '2025/08', // 11 posts
    '2025/07', // 12 posts
    '2025/06', // 11 posts
    '2025/05', // 12 posts
    '2025/04', // 16 posts
    '2025/03', // 20 posts
    '2025/02', // 17 posts
    '2025/01', // 16 posts
    '2024/12', // 23 posts
    '2024/11', // 22 posts
    '2024/10', // 27 posts
    '2024/09', // 20 posts
];

interface BlogPost {
    title: string;
    content: string;
    excerpt: string;
    slug: string;
    publishedAt: Date;
    category: string;
    tags: string[];
    isPublished: boolean;
    isFeatured: boolean;
    sourceUrl: string;
}

// Helper to create slug from title
function createSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .substring(0, 60);
}

// Helper to create excerpt from content
function createExcerpt(content: string, maxLength = 200): string {
    const plainText = content.replace(/[#*_\[\]()]/g, '').trim();
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength).trim() + '...';
}

// Parse date from blogspot URL or text
function parseDate(dateString: string): Date {
    const months: { [key: string]: number } = {
        'January': 0, 'February': 1, 'March': 2, 'April': 3,
        'May': 4, 'June': 5, 'July': 6, 'August': 7,
        'September': 8, 'October': 9, 'November': 10, 'December': 11
    };

    // Try parsing "Month Day, Year" format
    const match = dateString.match(/(\w+)\s+(\d+),?\s+(\d{4})/);
    if (match) {
        const month = months[match[1]] || 0;
        const day = parseInt(match[2]);
        const year = parseInt(match[3]);
        return new Date(year, month, day);
    }

    // Try parsing YYYY/MM format
    const urlMatch = dateString.match(/(\d{4})\/(\d{2})/);
    if (urlMatch) {
        return new Date(parseInt(urlMatch[1]), parseInt(urlMatch[2]) - 1, 1);
    }

    return new Date();
}

// Fetch and parse a single post
async function fetchPost(url: string): Promise<BlogPost | null> {
    try {
        const response = await fetch(url);
        const html = await response.text();

        // Extract title
        const titleMatch = html.match(/<h3[^>]*class="[^"]*post-title[^"]*"[^>]*>([\s\S]*?)<\/h3>/);
        const title = titleMatch
            ? titleMatch[1].replace(/<[^>]+>/g, '').trim()
            : 'Untitled Post';

        // Extract content
        const contentMatch = html.match(/<div[^>]*class="[^"]*post-body[^"]*"[^>]*>([\s\S]*?)<\/div>/);
        let content = contentMatch
            ? contentMatch[1]
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<\/p>/gi, '\n\n')
                .replace(/<[^>]+>/g, '')
                .trim()
            : '';

        // Extract date
        const dateMatch = html.match(/<abbr[^>]*class="[^"]*published[^"]*"[^>]*title="([^"]+)"/);
        const publishedAt = dateMatch
            ? new Date(dateMatch[1])
            : parseDate(url);

        // Extract labels/tags
        const tagsMatch = html.match(/<a[^>]*rel="tag"[^>]*>([^<]+)<\/a>/g);
        const tags = tagsMatch
            ? tagsMatch.map(tag => tag.replace(/<[^>]+>/g, '').trim())
            : [];

        return {
            title,
            content,
            excerpt: createExcerpt(content),
            slug: createSlug(title),
            publishedAt,
            category: tags[0] || 'General',
            tags,
            isPublished: true,
            isFeatured: false,
            sourceUrl: url
        };
    } catch (error) {
        console.error(`Error fetching post ${url}:`, error);
        return null;
    }
}

// Save post to Firebase
async function savePostToFirebase(post: BlogPost): Promise<boolean> {
    try {
        // Check if post already exists
        const postsRef = collection(db, 'posts');
        const q = query(postsRef, where('sourceUrl', '==', post.sourceUrl));
        const existing = await getDocs(q);

        if (!existing.empty) {
            console.log(`Post already exists: ${post.title}`);
            return false;
        }

        await addDoc(postsRef, {
            ...post,
            publishedAt: post.publishedAt.toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        console.log(`Saved: ${post.title}`);
        return true;
    } catch (error) {
        console.error(`Error saving post ${post.title}:`, error);
        return false;
    }
}

// Main migration function
async function migrateAllPosts() {
    console.log('Starting Blogspot migration...\n');

    let totalPosts = 0;
    let savedPosts = 0;

    for (const month of archiveMonths) {
        console.log(`\nFetching posts from ${month}...`);

        try {
            const archiveUrl = `https://mritunjaysharma13.blogspot.com/${month}/`;
            const response = await fetch(archiveUrl);
            const html = await response.text();

            // Extract post links
            const linkRegex = /href="(https:\/\/mritunjaysharma13\.blogspot\.com\/\d{4}\/\d{2}\/[^"]+\.html)"/g;
            const links = new Set<string>();
            let match;

            while ((match = linkRegex.exec(html)) !== null) {
                links.add(match[1]);
            }

            console.log(`Found ${links.size} posts in ${month}`);

            for (const url of links) {
                totalPosts++;
                const post = await fetchPost(url);

                if (post) {
                    const saved = await savePostToFirebase(post);
                    if (saved) savedPosts++;
                }

                // Small delay to be respectful
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        } catch (error) {
            console.error(`Error processing ${month}:`, error);
        }
    }

    console.log(`\n========================================`);
    console.log(`Migration complete!`);
    console.log(`Total posts found: ${totalPosts}`);
    console.log(`Posts saved to Firebase: ${savedPosts}`);
    console.log(`========================================\n`);
}

// Export for use
export { migrateAllPosts, fetchPost, savePostToFirebase };

// Run if called directly
if (typeof window === 'undefined' && require.main === module) {
    migrateAllPosts();
}
