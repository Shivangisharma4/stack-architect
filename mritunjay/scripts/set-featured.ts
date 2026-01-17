
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc, query, where, limit } from 'firebase/firestore';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.resolve(__dirname, '../.env.local') });

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

async function setFeaturedPosts() {
    console.log('Setting featured posts...');
    const blogsRef = collection(db, 'blogs');

    // Pick 3 random or specific posts to feature
    // Let's feature some recent ones
    const q = query(blogsRef, limit(5));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        console.log('No posts found.');
        return;
    }

    const postsToFeature = snapshot.docs.slice(0, 3);

    for (const postDoc of postsToFeature) {
        console.log(`Featuring: ${postDoc.data().title}`);
        await updateDoc(doc(db, 'blogs', postDoc.id), {
            featured: true
        });
    }

    console.log('Done! 3 posts marked as featured.');
    process.exit(0);
}

setFeaturedPosts().catch(console.error);
