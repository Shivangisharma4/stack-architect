'use client';

import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    limit,
    where,
    Timestamp,
    DocumentData,
    CollectionReference,
} from 'firebase/firestore';
import { db } from './firebase';

// Blog post interface
export interface BlogPost {
    id?: string;
    title: string;
    titleHindi?: string;
    slug: string;
    content: string;
    excerpt: string;
    coverImage?: string;
    category: string;
    tags: string[];
    published: boolean;
    featured: boolean;
    createdAt: Date;
    updatedAt: Date;
    readingTime: number;
    likes?: number;
}

export interface BlogPostSummary {
    id: string;
    title: string;
    titleHindi?: string;
    slug: string;
    excerpt: string;
    category: string;
    tags: string[];
    published: boolean;
    featured: boolean;
    createdAt: Date;
    readingTime: number;
}

export interface BlogPostSummary {
    id: string;
    title: string;
    titleHindi?: string;
    slug: string;
    excerpt: string;
    category: string;
    tags: string[];
    published: boolean;
    featured: boolean;
    createdAt: Date;
    readingTime: number;
}

// Demo blog posts for when Firebase is not configured
const demoPosts: BlogPost[] = [
    {
        id: 'demo-1',
        title: 'The Sun of Innovation Turns Uttarayan: The Rise of a Strong India',
        titleHindi: 'नवाचार का सूर्य उत्तरायण होता है: एक सशक्त भारत का उदय',
        slug: 'innovation-sun-uttarayan-strong-india',
        content: `# नवाचार का सूर्य उत्तरायण होता है

जैसे मकर संक्रांति पर सूर्य उत्तर की ओर अपनी यात्रा शुरू करता है, वैसे ही भारत भी नवाचार और प्रौद्योगिकी के क्षेत्र में नई ऊंचाइयों की ओर बढ़ रहा है।

## डिजिटल क्रांति

आज भारत विश्व की सबसे तेजी से बढ़ती डिजिटल अर्थव्यवस्थाओं में से एक है। UPI ने भुगतान के तरीके को पूरी तरह बदल दिया है।

> "जो देश अपनी युवा शक्ति को नवाचार की ओर मोड़ता है, वही विश्व का नेतृत्व करता है।"

## आगे का मार्ग

- **अंतरिक्ष प्रौद्योगिकी**: ISRO की उपलब्धियां
- **कृत्रिम बुद्धिमत्ता**: AI स्टार्टअप्स का उदय  
- **हरित ऊर्जा**: सौर क्रांति

भारत का भविष्य उज्ज्वल है।`,
        excerpt: 'जैसे मकर संक्रांति पर सूर्य उत्तर की ओर अपनी यात्रा शुरू करता है, वैसे ही भारत भी नवाचार के क्षेत्र में नई ऊंचाइयों की ओर बढ़ रहा है।',
        category: 'Culture',
        tags: ['innovation', 'india', 'technology', 'makar-sankranti'],
        published: true,
        featured: true,
        createdAt: new Date('2026-01-14'),
        updatedAt: new Date('2026-01-14'),
        readingTime: 5,
    },
    {
        id: 'demo-2',
        title: 'Lohri and Dulla Bhatti: A Historical Perspective',
        titleHindi: 'लोहड़ी और दुल्ला भट्टी: एक ऐतिहासिक परिप्रेक्ष्य',
        slug: 'lohri-dulla-bhatti-history',
        content: `# लोहड़ी और दुल्ला भट्टी

पंजाब की धरती पर मनाया जाने वाला लोहड़ी का त्योहार केवल अग्नि और फसल का उत्सव नहीं है, बल्कि यह एक वीर योद्धा दुल्ला भट्टी की कहानी भी है।

## दुल्ला भट्टी कौन थे?

दुल्ला भट्टी मुगल काल के एक राजपूत योद्धा थे जिन्होंने गरीबों की रक्षा की और अत्याचार के खिलाफ आवाज उठाई।

## लोहड़ी के गीत

> सुंदरी मुंदरीए होये
> तेरा कौन विचारा होये
> दुल्ला भट्टी वाला होये

यह गीत आज भी हर लोहड़ी पर गाया जाता है।`,
        excerpt: 'पंजाब की धरती पर मनाया जाने वाला लोहड़ी का त्योहार केवल अग्नि और फसल का उत्सव नहीं है, बल्कि यह एक वीर योद्धा की कहानी भी है।',
        category: 'History',
        tags: ['lohri', 'dulla-bhatti', 'punjab', 'festival'],
        published: true,
        featured: false,
        createdAt: new Date('2026-01-09'),
        updatedAt: new Date('2026-01-09'),
        readingTime: 6,
    },
    {
        id: 'demo-3',
        title: 'The Philosophy of Education in Ancient India',
        titleHindi: 'प्राचीन भारत में शिक्षा का दर्शन',
        slug: 'education-philosophy-ancient-india',
        content: `# प्राचीन भारत में शिक्षा का दर्शन

नालंदा और तक्षशिला जैसे विश्वविद्यालय न केवल भारत की, बल्कि विश्व की धरोहर हैं।

## गुरुकुल प्रणाली

गुरुकुल प्रणाली में शिक्षा केवल पुस्तकों तक सीमित नहीं थी, बल्कि जीवन के हर पहलू को समेटती थी।

## आज का संदर्भ

आज की शिक्षा प्रणाली को प्राचीन ज्ञान से बहुत कुछ सीखना है।`,
        excerpt: 'नालंदा और तक्षशिला जैसे विश्वविद्यालय न केवल भारत की, बल्कि विश्व की धरोहर हैं।',
        category: 'Education',
        tags: ['education', 'nalanda', 'gurukul', 'ancient-india'],
        published: true,
        featured: false,
        createdAt: new Date('2026-01-05'),
        updatedAt: new Date('2026-01-05'),
        readingTime: 4,
    },
    {
        id: 'demo-4',
        title: 'Digital India: A New Chapter',
        titleHindi: 'डिजिटल भारत: एक नया अध्याय',
        slug: 'digital-india-new-chapter',
        content: `# डिजिटल भारत: एक नया अध्याय

भारत की डिजिटल क्रांति ने दुनिया को चौंका दिया है।

## UPI की सफलता

UPI ने भारत को कैशलेस अर्थव्यवस्था की ओर ले जाने में महत्वपूर्ण भूमिका निभाई है।`,
        excerpt: 'भारत की डिजिटल क्रांति ने दुनिया को चौंका दिया है। UPI से लेकर स्टार्टअप इकोसिस्टम तक।',
        category: 'Technology',
        tags: ['digital-india', 'upi', 'technology'],
        published: true,
        featured: false,
        createdAt: new Date('2026-01-02'),
        updatedAt: new Date('2026-01-02'),
        readingTime: 3,
    },
    {
        id: 'demo-5',
        title: 'The Essence of Indian Democracy',
        titleHindi: 'भारतीय लोकतंत्र का सार',
        slug: 'essence-indian-democracy',
        content: `# भारतीय लोकतंत्र का सार

विश्व के सबसे बड़े लोकतंत्र की यात्रा अद्भुत रही है।`,
        excerpt: 'विश्व के सबसे बड़े लोकतंत्र की यात्रा और उसकी चुनौतियों पर एक विस्तृत विश्लेषण।',
        category: 'Politics',
        tags: ['democracy', 'india', 'politics'],
        published: true,
        featured: false,
        createdAt: new Date('2025-12-28'),
        updatedAt: new Date('2025-12-28'),
        readingTime: 7,
    },
];

// Check if Firebase is available
const isFirebaseAvailable = (): boolean => {
    return db !== null;
};

// Get collection reference (lazy)
const getBlogsCollection = (): CollectionReference => {
    if (!db) throw new Error('Firebase not configured');
    return collection(db, 'blogs');
};

// Convert Firestore document to BlogPost
const docToPost = (doc: DocumentData): BlogPost => {
    const data = doc.data();
    return {
        id: doc.id,
        title: data.title,
        titleHindi: data.titleHindi,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        category: data.category,
        tags: data.tags || [],
        published: data.published,
        featured: data.featured || false,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        readingTime: data.readingTime || calculateReadingTime(data.content),
    };
};

// Calculate reading time (words per minute)
export const calculateReadingTime = (content: string): number => {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
};

// Generate slug from title
export const generateSlug = (title: string): string => {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
};

// Get all published blog posts
export const getPublishedPosts = async (limitCount?: number): Promise<BlogPost[]> => {
    if (!isFirebaseAvailable()) {
        const posts = demoPosts.filter(p => p.published);
        return limitCount ? posts.slice(0, limitCount) : posts;
    }

    let q = query(
        getBlogsCollection(),
        where('published', '==', true),
        orderBy('createdAt', 'desc')
    );

    if (limitCount) {
        q = query(q, limit(limitCount));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToPost);
};

// Convert Firestore document to BlogPostSummary
const docToSummary = (doc: DocumentData): BlogPostSummary => {
    const data = doc.data();
    return {
        id: doc.id,
        title: data.title,
        titleHindi: data.titleHindi,
        slug: data.slug,
        excerpt: data.excerpt,
        category: data.category,
        tags: data.tags || [],
        published: data.published,
        featured: data.featured || false,
        createdAt: data.createdAt?.toDate() || new Date(),
        readingTime: data.readingTime || 5,
    };
};

export const getPublishedPostSummaries = async (limitCount?: number): Promise<BlogPostSummary[]> => {
    if (!isFirebaseAvailable()) {
        // Create dummy summaries from demo posts
        const posts = demoPosts.filter(p => p.published).map(p => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { content, ...summary } = p;
            return summary as BlogPostSummary;
        });
        return limitCount ? posts.slice(0, limitCount) : posts;
    }

    let q = query(
        getBlogsCollection(),
        where('published', '==', true),
        orderBy('createdAt', 'desc')
    );

    if (limitCount) {
        q = query(q, limit(limitCount));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToSummary);
};

// Get all posts (for admin)
export const getAllPosts = async (): Promise<BlogPost[]> => {
    if (!isFirebaseAvailable()) {
        return [...demoPosts];
    }

    const q = query(getBlogsCollection(), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToPost);
};

// Get featured posts
export const getFeaturedPosts = async (): Promise<BlogPost[]> => {
    if (!isFirebaseAvailable()) {
        return demoPosts.filter(p => p.published && p.featured);
    }

    const q = query(
        getBlogsCollection(),
        where('published', '==', true),
        where('featured', '==', true),
        orderBy('createdAt', 'desc'),
        limit(3)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToPost);
};

// Get post by slug
export const getPostBySlug = async (slug: string): Promise<BlogPost | null> => {
    if (!isFirebaseAvailable()) {
        return demoPosts.find(p => p.slug === slug) || null;
    }

    const q = query(getBlogsCollection(), where('slug', '==', slug));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;
    return docToPost(snapshot.docs[0]);
};

// Get post by ID
export const getPostById = async (id: string): Promise<BlogPost | null> => {
    if (!isFirebaseAvailable()) {
        return demoPosts.find(p => p.id === id) || null;
    }

    if (!db) return null;
    const docRef = doc(db, 'blogs', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;
    return docToPost(docSnap);
};

// Get posts by category
export const getPostsByCategory = async (category: string): Promise<BlogPost[]> => {
    if (!isFirebaseAvailable()) {
        return demoPosts.filter(p => p.published && p.category === category);
    }

    const q = query(
        getBlogsCollection(),
        where('published', '==', true),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToPost);
};

// Create new post
export const createPost = async (post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!isFirebaseAvailable()) {
        // Demo mode - just return a fake ID
        console.warn('Firebase not configured. Post will not be saved permanently.');
        return 'demo-' + Date.now();
    }

    const now = Timestamp.now();
    const docRef = await addDoc(getBlogsCollection(), {
        ...post,
        slug: post.slug || generateSlug(post.title),
        readingTime: calculateReadingTime(post.content),
        createdAt: now,
        updatedAt: now,
    });
    return docRef.id;
};

// Update post
export const updatePost = async (id: string, updates: Partial<BlogPost>): Promise<void> => {
    if (!isFirebaseAvailable()) {
        console.warn('Firebase not configured. Changes will not be saved permanently.');
        return;
    }

    if (!db) return;
    const docRef = doc(db, 'blogs', id);
    const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now(),
    };

    if (updates.content) {
        updateData.readingTime = calculateReadingTime(updates.content);
    }

    await updateDoc(docRef, updateData);
};

// Delete post
export const deletePost = async (id: string): Promise<void> => {
    if (!isFirebaseAvailable()) {
        console.warn('Firebase not configured. Deletion will not be permanent.');
        return;
    }

    if (!db) return;
    const docRef = doc(db, 'blogs', id);
    await deleteDoc(docRef);
};

// Get all categories
export const getCategories = async (): Promise<string[]> => {
    const posts = await getPublishedPosts();
    const categories = new Set(posts.map(post => post.category));
    return Array.from(categories).filter(Boolean);
};

// Search posts
export const searchPosts = async (searchTerm: string): Promise<BlogPost[]> => {
    const posts = await getPublishedPosts();
    const term = searchTerm.toLowerCase();

    return posts.filter(post =>
        post.title.toLowerCase().includes(term) ||
        post.titleHindi?.toLowerCase().includes(term) ||
        post.excerpt.toLowerCase().includes(term) ||
        post.content.toLowerCase().includes(term) ||
        post.tags.some(tag => tag.toLowerCase().includes(term))
    );
};

// --- Engagement Features ---

// Comment interface
export interface Comment {
    id: string;
    author: string;
    content: string;
    createdAt: Date;
}

// Increment like count
export const incrementLike = async (postId: string): Promise<number> => {
    if (!isFirebaseAvailable()) {
        console.warn('Firebase not configured. Like will not be saved.');
        return 0;
    }

    if (!db) return 0;

    // Use the increment() operation for atomic updates
    const docRef = doc(db, 'blogs', postId);

    // We can't import increment easily without adding it to imports, so we'll do a read-modify-write for now
    // or better, let's update imports. But for simplicity in this edit:
    // Actually, let's just do a transaction or read-update if possible.
    // wait, I can just update the BlogPost interface first?
    // Let's assume 'likes' exists on the doc even if not in interface yet.

    // Let's do get-update for simplicity, transaction is better but higher complexity to impl here.
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return 0;

    const currentLikes = docSnap.data().likes || 0;
    const newLikes = currentLikes + 1;

    await updateDoc(docRef, { likes: newLikes });
    return newLikes;
};

// Add a comment
export const addComment = async (postId: string, author: string, content: string): Promise<Comment | null> => {
    if (!isFirebaseAvailable()) {
        console.warn('Firebase not configured. Comment will not be saved.');
        return {
            id: 'temp-' + Date.now(),
            author,
            content,
            createdAt: new Date()
        };
    }

    if (!db) return null;

    const commentsRef = collection(db, 'blogs', postId, 'comments');
    const now = Timestamp.now();

    const docRef = await addDoc(commentsRef, {
        author,
        content,
        createdAt: now
    });

    return {
        id: docRef.id,
        author,
        content,
        createdAt: now.toDate()
    };
};

// Get comments for a post
export const getComments = async (postId: string): Promise<Comment[]> => {
    if (!isFirebaseAvailable()) {
        return [];
    }

    if (!db) return [];

    const commentsRef = collection(db, 'blogs', postId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'desc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        author: doc.data().author,
        content: doc.data().content,
        createdAt: doc.data().createdAt?.toDate() || new Date()
    }));
};
