'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TypewriterProps {
    words: string[];
    typingSpeed?: number;
    deletingSpeed?: number;
    pauseDuration?: number;
    className?: string;
    cursorClassName?: string;
}

export default function Typewriter({
    words,
    typingSpeed = 100,
    deletingSpeed = 50,
    pauseDuration = 2000,
    className = '',
    cursorClassName = '',
}: TypewriterProps) {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentText, setCurrentText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const currentWord = words[currentWordIndex];

        if (isPaused) {
            const pauseTimeout = setTimeout(() => {
                setIsPaused(false);
                setIsDeleting(true);
            }, pauseDuration);
            return () => clearTimeout(pauseTimeout);
        }

        if (!isDeleting && currentText === currentWord) {
            setIsPaused(true);
            return;
        }

        if (isDeleting && currentText === '') {
            setIsDeleting(false);
            setCurrentWordIndex((prev) => (prev + 1) % words.length);
            return;
        }

        const timeout = setTimeout(
            () => {
                setCurrentText((prev) =>
                    isDeleting
                        ? prev.slice(0, -1)
                        : currentWord.slice(0, prev.length + 1)
                );
            },
            isDeleting ? deletingSpeed : typingSpeed
        );

        return () => clearTimeout(timeout);
    }, [
        currentText,
        isDeleting,
        isPaused,
        currentWordIndex,
        words,
        typingSpeed,
        deletingSpeed,
        pauseDuration,
    ]);

    return (
        <span className={`inline-flex items-baseline ${className}`}>
            <AnimatePresence mode="wait">
                <motion.span
                    key={currentText}
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                    className="typewriter"
                >
                    {currentText}
                </motion.span>
            </AnimatePresence>
            <motion.span
                className={`inline-block w-[3px] h-[1em] bg-current ml-1 ${cursorClassName}`}
                animate={{ opacity: [1, 1, 0, 0] }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    times: [0, 0.5, 0.5, 1],
                }}
            />
        </span>
    );
}
