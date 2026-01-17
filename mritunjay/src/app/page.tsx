'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowDown, BookOpen, Feather, ScrollText } from 'lucide-react';
import Typewriter from '@/components/Typewriter';
import DotPattern from '@/components/DotPattern';
import { BlogPost, getFeaturedPosts } from '@/lib/blog';
import { useEffect, useState } from 'react';

export default function Home() {
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    getFeaturedPosts().then(setFeaturedPosts);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Dot Pattern Background */}
      <DotPattern
        width={32}
        height={32}
        cr={1.5}
        className="opacity-60"
      />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6">
        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute top-20 left-10 text-[12rem] font-heading opacity-5 select-none pointer-events-none"
        >
          क
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="absolute bottom-20 right-10 text-[12rem] font-heading opacity-5 select-none pointer-events-none"
        >
          म
        </motion.div>

        {/* Main Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Small tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm tracking-[0.3em] uppercase text-[hsl(var(--muted-foreground))] mb-8"
          >
            कवि · लेखक · पत्रकार
          </motion.p>

          {/* Main Title with Typewriter */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-6xl md:text-8xl lg:text-9xl font-heading font-bold mb-6 text-[hsl(var(--foreground))]"
          >
            <div className="flex items-center justify-center gap-4">
              <Typewriter
                words={['Mritunjay 13', 'मृत्युंजय १३']}
                typingSpeed={120}
                deletingSpeed={80}
                pauseDuration={3000}
                className="text-[hsl(var(--primary))]"
              />
              <span
                className="text-[0.75em] mb-2"
                style={{
                  color: 'transparent',
                  textShadow: '0 0 0 hsl(var(--primary))'
                }}
              >
                🔱
              </span>
            </div>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-xl md:text-2xl text-[hsl(var(--muted-foreground))] font-body mb-12 leading-relaxed hindi"
          >
            शब्दों में रचता स्वप्न शांति का,
            <br />
            लेखनी से संजोता जगती की रोशनी।
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <Link
              href="/blog"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-lg font-heading text-lg font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              style={{
                backgroundColor: 'hsl(20 65% 22%)',
                color: 'hsl(40 30% 95%)',
              }}
            >
              <ScrollText className="w-5 h-5" />
              <span>पढ़ना शुरू करें</span>
              <span className="text-sm opacity-70">Enter the Archive</span>
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2 text-[hsl(var(--muted-foreground))]"
          >
            <span className="text-xs tracking-wider uppercase">Scroll</span>
            <ArrowDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </section>

      {/* Preview Section - Bento Grid Teaser */}
      <section className="relative py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-[hsl(var(--foreground))]">
              प्रमुख रचनाएँ
            </h2>
            <p className="text-lg text-[hsl(var(--muted-foreground))]">
              Featured Stories
            </p>
          </motion.div>

          {/* Bento Grid Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPosts.length > 0 ? (
              <>
                {/* Featured Large Card */}
                <motion.div
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6 }}
                  className="md:col-span-2 md:row-span-2"
                >
                  <Link href={`/blog/${featuredPosts[0].slug}`} className="block h-full">
                    <article className="card h-full p-8 md:p-12 flex flex-col justify-end min-h-[400px] relative overflow-hidden group">
                      {/* Background decoration */}
                      <div className="absolute top-6 right-6 opacity-10 text-8xl font-heading">
                        १
                      </div>

                      <div className="relative z-10">
                        <span className="inline-block px-3 py-1 text-xs font-medium uppercase tracking-wider bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] rounded-full mb-4">
                          Featured
                        </span>
                        <h3 className="text-2xl md:text-3xl font-heading font-bold mb-3 group-hover:text-[hsl(var(--primary))] transition-colors hindi">
                          {featuredPosts[0].title}
                        </h3>
                        <p className="text-[hsl(var(--muted-foreground))] line-clamp-3 hindi">
                          {featuredPosts[0].excerpt}
                        </p>
                      </div>
                    </article>
                  </Link>
                </motion.div>

                {/* Small Cards */}
                {featuredPosts.slice(1, 3).map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
                  >
                    <Link href={`/blog/${post.slug}`} className="block">
                      <article className="card p-6 group">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${index === 0 ? 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]' : 'bg-[hsl(var(--secondary))]/10 text-[hsl(var(--secondary))]'}`}>
                            {index === 0 ? <Feather className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                          </div>
                          <div>
                            <h3 className="font-heading font-semibold mb-2 group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-2 hindi">
                              {post.title}
                            </h3>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">
                              {post.category || 'Article'}
                            </p>
                          </div>
                        </div>
                      </article>
                    </Link>
                  </motion.div>
                ))}
              </>
            ) : (
              <div className="col-span-full text-center py-12 text-[hsl(var(--muted-foreground))]">
                Loading posts...
              </div>
            )}
          </div>

          {/* View All Link */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[hsl(var(--primary))] font-heading font-medium hover:underline hover:underline-offset-4"
            >
              <span>सभी लेख देखें</span>
              <span className="text-sm opacity-70">View all posts →</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="relative py-24 px-6 bg-[hsl(var(--card))]">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[hsl(var(--primary))]/10 mb-8">
              <Feather className="w-10 h-10 text-[hsl(var(--primary))]" />
            </div>

            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-[hsl(var(--foreground))]">
              About the Author
            </h2>

            <p className="text-lg text-[hsl(var(--muted-foreground))] leading-relaxed mb-8 hindi">
              मृत्युंजय एक कवि, लेखक, और पत्रकार हूँ। मेरी लेखनी में भारतीय संस्कृति,
              सामाजिक मुद्दों, और जीवन के विभिन्न पहलुओं पर विचार मिलते हैं।
            </p>

            <div className="flex items-center justify-center gap-6 text-sm text-[hsl(var(--muted-foreground))] mb-8">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[hsl(var(--accent))]"></span>
                200+ Articles
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[hsl(var(--primary))]"></span>
                Since 2024
              </span>
            </div>

            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-heading font-medium transition-all hover:shadow-lg hover:-translate-y-1"
              style={{
                backgroundColor: 'hsl(20 65% 22%)',
                color: '#ffffff',
              }}
            >
              <span>और जानें</span>
              <span className="text-sm opacity-80">Read More →</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-[hsl(var(--border))]">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="font-heading text-xl font-bold text-[hsl(var(--foreground))]">
                मृत्युंजय
              </p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Crafted with ink & pixels
              </p>
            </div>

            <nav className="flex items-center gap-6 text-sm">
              <Link
                href="/blog"
                className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              >
                Blog
              </Link>
              <Link
                href="/about"
                className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              >
                About
              </Link>
              <Link
                href="/admin"
                className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              >
                Admin
              </Link>
            </nav>

            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              © {new Date().getFullYear()} Mritunjay. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
