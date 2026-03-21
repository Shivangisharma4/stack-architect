"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const PHASES = [
  "Parsing project signals",
  "Calculating weight profile",
  "Scoring technology candidates",
  "Evaluating compatibility matrix",
  "Selecting optimal stack",
  "Synthesizing architectural blueprint",
];

export default function SynthesisLoader() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((p) => (p < PHASES.length - 1 ? p + 1 : p));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      {/* Geometric diamond animation */}
      <motion.div
        className="relative w-20 h-20"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-0 border border-accent/30 rotate-45" />
        <motion.div
          className="absolute inset-2 border border-accent/60 rotate-45"
          animate={{ scale: [1, 0.8, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-4 bg-accent/10 border border-accent rotate-45"
          animate={{ scale: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* Title */}
      <div className="text-center space-y-3">
        <h2 className="font-[family-name:var(--font-serif)] text-2xl italic text-foreground">
          Synthesizing Your
          <br />
          Architectural Blueprint.
        </h2>

        {/* Phase indicator */}
        <div className="space-y-2">
          <p className="text-sm text-accent font-[family-name:var(--font-mono)]">
            {PHASES[phase]}
            <span className="animate-typewriter-cursor ml-0.5">|</span>
          </p>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5">
            {PHASES.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                  i <= phase ? "bg-accent" : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
