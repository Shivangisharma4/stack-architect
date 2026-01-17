'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, MapPin, Briefcase, BookOpen, Heart, Pen } from 'lucide-react';
import DotPattern from '@/components/DotPattern';

export default function AboutPage() {
    return (
        <main className="relative min-h-screen">
            <DotPattern width={32} height={32} cr={1.2} className="opacity-30" />

            {/* Header */}
            <header className="sticky top-0 z-40 backdrop-blur-md bg-[hsl(var(--background))]/80 border-b border-[hsl(var(--border))]">
                <div className="container mx-auto max-w-4xl px-6 py-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-heading font-medium">Home</span>
                    </Link>
                </div>
            </header>

            <article className="container mx-auto max-w-4xl px-6 py-12">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="relative w-44 h-44 mx-auto mb-8">
                        {/* Animated glow ring */}
                        <div
                            className="absolute inset-0 rounded-full animate-pulse"
                            style={{
                                background: 'linear-gradient(135deg, hsl(42 85% 45% / 0.6), hsl(20 65% 22% / 0.5))',
                                filter: 'blur(20px)',
                                transform: 'scale(1.2)',
                            }}
                        />
                        {/* Photo container */}
                        <div className="relative w-full h-full rounded-full overflow-hidden ring-4 ring-[hsl(var(--primary))]/40 shadow-2xl">
                            <img
                                src="/author.jpg"
                                alt="निशांत शर्मा मृत्युंजय"
                                className="w-full h-full object-cover object-top"
                            />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-heading font-bold text-[hsl(var(--foreground))] mb-4 hindi">
                        निशांत शर्मा "मृत्युंजय"
                    </h1>
                    <p className="text-xl text-[hsl(var(--muted-foreground))] hindi">
                        स्वतंत्र लेखक, पत्रकार और ब्लॉगर
                    </p>
                </motion.div>

                {/* Quick Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16"
                >
                    <div className="card p-6 text-center">
                        <Briefcase className="w-6 h-6 mx-auto mb-3 text-[hsl(var(--primary))]" />
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Occupation</p>
                        <p className="font-heading font-semibold text-[hsl(var(--foreground))]">MEDIA</p>
                    </div>
                    <div className="card p-6 text-center">
                        <MapPin className="w-6 h-6 mx-auto mb-3 text-[hsl(var(--accent))]" />
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Location</p>
                        <p className="font-heading font-semibold text-[hsl(var(--foreground))]">Madhya Pradesh, India</p>
                    </div>
                    <div className="card p-6 text-center">
                        <Heart className="w-6 h-6 mx-auto mb-3 text-red-500" />
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Interests</p>
                        <p className="font-heading font-semibold text-[hsl(var(--foreground))]">Writing, Poetry, Music, Cricket</p>
                    </div>
                </motion.div>

                {/* Introduction */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-16"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <Pen className="w-5 h-5 text-[hsl(var(--primary))]" />
                        <h2 className="text-2xl font-heading font-bold text-[hsl(var(--foreground))]">परिचय</h2>
                    </div>
                    <div className="prose prose-lg max-w-none hindi leading-relaxed space-y-6">
                        <p className="text-[hsl(var(--foreground))]">
                            मैं निशांत शर्मा "मृत्युंजय" — एक स्वतंत्र लेखक, पत्रकार और ब्लॉगर हूँ। समाज, राजनीति और समसामयिक मुद्दों पर लिखने की कोशिश करता हूँ। मेरी लेखनी में गहन विश्लेषण, व्यंग्य और स्पष्टता लाने का प्रयास रहता है, ताकि पाठक नए दृष्टिकोण से सोचने के लिए प्रेरित हों।
                        </p>
                        <p className="text-[hsl(var(--foreground))]">
                            करियर की शुरुआत विपणन (मार्केटिंग) में हुई थी, जहाँ कुछ अनुभव मिला। लेकिन मेरा असली प्रेम हमेशा सृजन और लेखन में रहा। लेखन ने मुझे वह शांति दी, जिसकी तलाश थी।
                        </p>
                    </div>
                </motion.div>

                {/* Philosophy */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mb-16"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <BookOpen className="w-5 h-5 text-[hsl(var(--accent))]" />
                        <h2 className="text-2xl font-heading font-bold text-[hsl(var(--foreground))]">दर्शन और प्रेरणा</h2>
                    </div>
                    <div className="prose prose-lg max-w-none hindi leading-relaxed space-y-6">
                        <p className="text-[hsl(var(--foreground))]">
                            धार्मिक ग्रंथों और दर्शनों का मेरे जीवन पर गहरा प्रभाव है। <strong>वेद, उपनिषद, इस्लाम, बौद्ध और ईसाई दर्शनों</strong> का अध्ययन किया है। इन सभी का मूल संदेश—प्रेम, शांति और करुणा—मेरी लेखनी का आधार है।
                        </p>
                        <p className="text-[hsl(var(--foreground))]">
                            <strong>भगवद गीता</strong> के उपदेश, जैसे कर्मयोग और निष्काम कर्म, मेरे जीवन को दिशा देते हैं।
                        </p>
                    </div>
                </motion.div>

                {/* Vision */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mb-16"
                >
                    <div className="card p-8 md:p-12 bg-gradient-to-br from-[hsl(var(--primary))]/5 to-[hsl(var(--accent))]/5 border-[hsl(var(--primary))]/20">
                        <h2 className="text-2xl font-heading font-bold text-[hsl(var(--foreground))] mb-6 text-center">सपना</h2>
                        <p className="text-lg text-[hsl(var(--foreground))] hindi leading-relaxed text-center mb-8">
                            मृत्युंजय का सपना है कि संसार प्रेम, शांति और एकता से भरा हो, जहाँ सभी सुखी हों। उनका लेखन इसी आदर्श को जीवंत करने का प्रयास है।
                        </p>
                        <blockquote className="text-center">
                            <p className="text-xl md:text-2xl font-heading italic text-[hsl(var(--primary))] mb-4 hindi">
                                "सर्वे भवन्तु सुखिनः, सर्वे सन्तु निरामयाः।<br />
                                सर्वे भद्राणि पश्यन्तु, मा कश्चिद् दुःखभाग्भवेत्।"
                            </p>
                            <footer className="text-sm text-[hsl(var(--muted-foreground))]">
                                — शान्ति मन्त्र
                            </footer>
                        </blockquote>
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-center"
                >
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-[hsl(var(--primary))] rounded-full font-medium transition-all hover:opacity-90 shadow-lg hover:no-underline"
                        style={{ color: '#ffffff' }}
                    >
                        <BookOpen className="w-5 h-5" />
                        रचनाएँ पढ़ें
                    </Link>
                </motion.div>
            </article>

            {/* Footer */}
            <footer className="container mx-auto max-w-4xl px-6 py-12 border-t border-[hsl(var(--border))]">
                <div className="text-center text-sm text-[hsl(var(--muted-foreground))]">
                    <p>© {new Date().getFullYear()} मृत्युंजय — All rights reserved.</p>
                </div>
            </footer>
        </main>
    );
}
