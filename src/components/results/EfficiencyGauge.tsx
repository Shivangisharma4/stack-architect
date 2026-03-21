"use client";

import { useEffect, useState } from "react";

interface Props {
  score: number;
  compatibilityScore: number;
}

export default function EfficiencyGauge({
  score,
  compatibilityScore,
}: Props) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const duration = 1500;

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(score * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  // SVG circle calculations
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="flex items-center gap-8">
      {/* Circular gauge */}
      <div className="relative w-32 h-32 flex-shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="3"
          />
          {/* Score arc */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.1s ease-out" }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-[family-name:var(--font-mono)] font-semibold text-foreground">
            {animatedScore}
          </span>
          <span className="text-xs text-muted -mt-0.5">%</span>
        </div>
      </div>

      {/* Labels */}
      <div className="space-y-3">
        <div>
          <p className="text-xs tracking-[0.15em] uppercase text-muted">
            Efficiency Score
          </p>
          <p className="text-sm text-foreground mt-0.5">
            Weighted match across all dimensions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <span className="text-xs text-muted font-[family-name:var(--font-mono)]">
            {compatibilityScore}% stack compatibility
          </span>
        </div>
      </div>
    </div>
  );
}
