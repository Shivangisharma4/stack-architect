
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Manual env parser
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

async function verifyPosts() {
    console.log('Verifying posts in Firestore...');
    try {
        const blogsRef = collection(db, 'blogs');
        const snapshot = await getDocs(blogsRef);
        console.log(`Found ${snapshot.size} posts in 'blogs' collection.`);

        if (snapshot.size > 0) {
            console.log('--- Titles & Content Check ---');
            snapshot.docs.forEach((doc, index) => {
                const data = doc.data();
                const contentLen = data.content ? data.content.length : 0;
                const isFeatured = data.featured ? '★' : '☆';
                console.log(`${index + 1}. ${isFeatured} [${contentLen} chars] ${data.title}`);
                if (contentLen < 50) {
                    console.warn(`   WARNING: Short content! ID: ${doc.id}`);
                    console.warn(`   URL: ${data.sourceUrl}`);
                }
            });
            const featuredCount = snapshot.docs.filter(d => d.data().featured).length;
            console.log(`Total Featured Posts: ${featuredCount}`);
            console.log('-------------------');
        }
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

verifyPosts();
