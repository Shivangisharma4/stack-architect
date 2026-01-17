import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Helper to decode HTML entities
function unescapeHtml(safe: string) {
    if (!safe) return "";
    return safe
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, "\"")
        .replace(/&#039;/g, "'")
        .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)))
        .replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
        // Handle double encoded entities if any
        .replace(/&amp;/g, "&");
}

// Helper to clean title
function cleanTitle(title: string) {
    let cleaned = unescapeHtml(title);
    // Remove common prefixes like 'mritunjay13 ✍️ :'
    // The previous regex was generic, let's be specific to the user's issue
    cleaned = cleaned.replace(/^mritunjay13\s*.*?:/i, '').trim();
    // Also remove generic 'mritunjay13 :' if emojis are gone
    cleaned = cleaned.replace(/^mritunjay13\s*:/i, '').trim();
    return cleaned;
}

// Archive months from the blog
const archiveMonths = [
    '2026/01', '2025/12', '2025/11', '2025/10', '2025/09',
    '2025/08', '2025/07', '2025/06', '2025/05', '2025/04',
    '2025/03', '2025/02', '2025/01', '2024/12', '2024/11',
    '2024/10', '2024/09'
];

interface BlogPost {
    title: string;
    content: string;
    excerpt: string;
    slug: string;
    publishedAt: string;
    category: string;
    tags: string[];
    isPublished: boolean;
    isFeatured: boolean;
    sourceUrl: string;
}

// Helper to create slug from title
function createSlug(title: string): string {
    // Create a transliterated slug for Hindi titles
    const hindiToLatinMap: { [key: string]: string } = {
        'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
        'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'ऋ': 'ri',
        'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'n',
        'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'n',
        'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
        'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
        'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
        'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh',
        'ष': 'sh', 'स': 's', 'ह': 'h',
        'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo',
        'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
        'ं': 'n', 'ः': 'h', '्': '', 'ृ': 'ri',
        '।': '', '॥': '', '़': ''
    };

    let slug = '';
    for (const char of title) {
        if (hindiToLatinMap[char] !== undefined) {
            slug += hindiToLatinMap[char];
        } else if (/[a-zA-Z0-9]/.test(char)) {
            slug += char.toLowerCase();
        } else if (char === ' ' || char === '-') {
            slug += '-';
        }
    }

    return slug
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 80) || 'untitled-' + Date.now();
}

// Helper to create excerpt from content
function createExcerpt(content: string, maxLength = 200): string {
    const plainText = content.replace(/[#*_\[\]()]/g, '').trim();
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength).trim() + '...';
}

// Fetch posts list from archive page
async function fetchArchivePosts(month: string): Promise<{ urls: string[], debug: string }> {
    try {
        const archiveUrl = `https://mritunjaysharma13.blogspot.com/${month}/`;
        console.log(`Fetching archive: ${archiveUrl}`);

        const response = await fetch(archiveUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
        });

        if (!response.ok) {
            return { urls: [], debug: `HTTP ${response.status}: ${response.statusText}` };
        }

        const html = await response.text();
        console.log(`HTML length: ${html.length}`);

        // Extract unique post links - multiple patterns
        const links = new Set<string>();

        // Pattern 1: href="URL.html"
        const linkRegex1 = /href=["'](https?:\/\/mritunjaysharma13\.blogspot\.com\/\d{4}\/\d{2}\/[^"']+\.html)["']/gi;
        let match;
        while ((match = linkRegex1.exec(html)) !== null) {
            links.add(match[1]);
        }

        // Pattern 2: href='URL' with single quotes  
        const linkRegex2 = /href='(https?:\/\/mritunjaysharma13\.blogspot\.com\/\d{4}\/\d{2}\/[^']+\.html)'/gi;
        while ((match = linkRegex2.exec(html)) !== null) {
            links.add(match[1]);
        }

        // Pattern 3: data-url or other attributes
        const linkRegex3 = /["'](https?:\/\/mritunjaysharma13\.blogspot\.com\/\d{4}\/\d{2}\/[^"'\s]+\.html)["']/gi;
        while ((match = linkRegex3.exec(html)) !== null) {
            links.add(match[1]);
        }

        console.log(`Found ${links.size} post URLs`);

        return {
            urls: Array.from(links),
            debug: `HTML: ${html.length} chars, URLs found: ${links.size}, Sample: ${html.substring(0, 500)}`
        };
    } catch (error) {
        console.error(`Error fetching archive ${month}:`, error);
        return { urls: [], debug: `Error: ${String(error)}` };
    }
}

// Fetch and parse a single post
// Helper to extract nested div content by balancing tags
function extractNestedDiv(html: string, className: string): string {
    const classRegex = new RegExp(`class=["'][^"']*${className}[^"']*["']`, 'i');
    const startMatch = html.match(classRegex);
    if (!startMatch) return '';

    const startIndex = startMatch.index!;
    // Find the opening tag start "<div" before the class match
    let openTagStart = html.lastIndexOf('<div', startIndex);
    if (openTagStart === -1) return '';

    let depth = 0;
    let currentIndex = openTagStart;
    let contentStart = -1;
    let contentEnd = -1;

    // Iterate through the string to balance divs
    while (currentIndex < html.length) {
        const nextOpen = html.indexOf('<div', currentIndex);
        const nextClose = html.indexOf('</div>', currentIndex);

        if (nextClose === -1) break; // formatting broken

        if (nextOpen !== -1 && nextOpen < nextClose) {
            // Found opening tag
            if (depth === 0) contentStart = html.indexOf('>', nextOpen) + 1;
            depth++;
            currentIndex = nextOpen + 1;
        } else {
            // Found closing tag
            depth--;
            currentIndex = nextClose + 1;
            if (depth === 0) {
                contentEnd = nextClose;
                break;
            }
        }
    }

    if (contentStart !== -1 && contentEnd !== -1) {
        return html.substring(contentStart, contentEnd);
    }
    return '';
}

async function fetchPost(url: string): Promise<BlogPost | null> {
    try {
        const response = await fetch(url);
        const html = await response.text();

        // Extract title - try multiple patterns
        let title = 'Untitled Post';
        const titlePatterns = [
            /<h3[^>]*class="[^"]*post-title[^"]*"[^>]*>([\s\S]*?)<\/h3>/i,
            /<h1[^>]*class="[^"]*post-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i,
            /<title>([^<]+)<\/title>/i
        ];

        for (const pattern of titlePatterns) {
            const match = html.match(pattern);
            if (match) {
                title = match[1]
                    .replace(/<[^>]+>/g, '')
                    .replace(/\s+/g, ' ')
                    .trim();
                if (title && title !== 'Untitled Post') break;
            }
        }

        // Extract content using robust nested div extractor
        let rawContent = extractNestedDiv(html, 'post-body');
        console.log(`[Migrate] extractNestedDiv 'post-body' result length: ${rawContent.length}`);

        if (!rawContent) {
            rawContent = extractNestedDiv(html, 'entry-content');
            console.log(`[Migrate] extractNestedDiv 'entry-content' result length: ${rawContent.length}`);
        }

        let content = '';
        if (rawContent) {
            content = rawContent
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<\/p>/gi, '\n\n')
                .replace(/<p[^>]*>/gi, '')
                .replace(/<h(\d)[^>]*>/gi, (_, n) => '\n' + '#'.repeat(parseInt(n)) + ' ')
                .replace(/<\/h\d>/gi, '\n')
                .replace(/<li[^>]*>/gi, '- ')
                .replace(/<\/li>/gi, '\n')
                .replace(/<[^>]+>/g, '') // Strip remaining tags
                .replace(/&nbsp;/g, ' ');

            content = unescapeHtml(content).trim();
            console.log(`[Migrate] Final content length: ${content.length}`);
        } else {
            console.warn(`[Migrate] FAILED to extract content for ${url}`);
            const titleIndex = html.indexOf(title);
            console.log(`[Migrate] Context snippet: ${html.substring(titleIndex, titleIndex + 500)}`);
        }

        // Clean Title
        console.log(`[Migrate] Raw Title: "${title}"`);
        title = cleanTitle(title);
        console.log(`[Migrate] Cleaned Title: "${title}"`);

        // Extract date from URL
        const dateMatch = url.match(/\/(\d{4})\/(\d{2})\//);
        const publishedAt = dateMatch
            ? new Date(parseInt(dateMatch[1]), parseInt(dateMatch[2]) - 1, 15)
            : new Date();

        // Extract labels/tags
        const tagsMatch = html.match(/<a[^>]*rel="tag"[^>]*>([^<]+)<\/a>/g);
        const tags = tagsMatch
            ? tagsMatch.map(tag => tag.replace(/<[^>]+>/g, '').trim())
            : [];

        // Determine category based on content or tags
        let category = 'General';
        if (tags.length > 0) {
            category = tags[0];
        } else if (content.includes('संस्कृति') || content.includes('त्योहार')) {
            category = 'संस्कृति';
        } else if (content.includes('इतिहास') || content.includes('ऐतिहासिक')) {
            category = 'इतिहास';
        } else if (content.includes('राजनीति') || content.includes('सरकार')) {
            category = 'राजनीति';
        }

        return {
            title,
            content,
            excerpt: createExcerpt(content),
            slug: createSlug(title),
            publishedAt: publishedAt.toISOString(),
            category,
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

// GET: Fetch all posts from Blogspot (returns list)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const limit = parseInt(searchParams.get('limit') || '50');

    try {
        if (month) {
            // Fetch posts from a specific month
            const result = await fetchArchivePosts(month);
            const posts: BlogPost[] = [];

            for (const url of result.urls.slice(0, limit)) {
                const post = await fetchPost(url);
                if (post) posts.push(post);
                await new Promise(r => setTimeout(r, 100)); // Rate limiting
            }

            return NextResponse.json({
                success: true,
                month,
                count: posts.length,
                totalUrls: result.urls.length,
                debug: result.debug,
                posts
            });
        } else {
            // Return list of archive months
            return NextResponse.json({
                success: true,
                archiveMonths,
                totalMonths: archiveMonths.length
            });
        }
    } catch (error) {
        return NextResponse.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}

// POST: Migrate posts to Firebase
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        // Default to all archive months and high limit per month
        const { months = archiveMonths, maxPerMonth = 50 } = body;

        if (!db) {
            return NextResponse.json(
                { success: false, error: 'Firebase not configured' },
                { status: 500 }
            );
        }

        // Use 'blogs' collection instead of 'posts' to match the frontend
        const blogsCollection = collection(db, 'blogs');

        const results = {
            fetched: 0,
            saved: 0,
            skipped: 0,
            errors: 0,
            posts: [] as { title: string; url: string; status: string }[]
        };

        for (const month of months) {
            const result = await fetchArchivePosts(month);

            for (const url of result.urls.slice(0, maxPerMonth)) {
                results.fetched++;

                try {
                    const post = await fetchPost(url);
                    if (!post) {
                        results.errors++;
                        results.posts.push({ title: 'Parse error', url, status: 'error' });
                        continue;
                    }

                    // Check if already exists in 'blogs' collection by SLUG
                    const existingQuery = query(blogsCollection, where('slug', '==', post.slug));
                    const existing = await getDocs(existingQuery);

                    if (!existing.empty) {
                        results.skipped++;
                        results.posts.push({ title: post.title, url, status: 'skipped' });
                        continue;
                    }

                    // Map migration post format to our app's BlogPost format
                    await addDoc(blogsCollection, {
                        title: post.title,
                        // Ensure titleHindi is optional or generated? For now leave undefined.
                        slug: post.slug,
                        content: post.content,
                        excerpt: post.excerpt,
                        category: post.category,
                        tags: post.tags,
                        published: true, // Default to published
                        featured: false,
                        createdAt: new Date(post.publishedAt), // Convert to Firestore Timestamp or Date
                        updatedAt: new Date(post.publishedAt),
                        readingTime: Math.ceil(post.content.split(/\s+/).length / 200),
                        sourceUrl: post.sourceUrl // Keep track of source
                    });
                    results.saved++;
                    results.posts.push({ title: post.title, url, status: 'saved' });
                } catch (error) {
                    console.error("Error saving post:", error);
                    results.errors++;
                    results.posts.push({ title: String(error), url, status: 'error' });
                }

                await new Promise(r => setTimeout(r, 200)); // Rate limiting
            }
        }

        return NextResponse.json({
            success: true,
            message: `Migration complete: ${results.saved} saved, ${results.skipped} skipped, ${results.errors} errors`,
            results
        });
    } catch (error) {
        console.error("Migration error:", error);
        return NextResponse.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}
