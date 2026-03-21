"use client";

import { useState, useMemo } from "react";
import { Notepad } from "@phosphor-icons/react/dist/ssr";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
}

// Common English words to check description quality
const COMMON_WORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "need", "dare", "ought",
  "and", "but", "or", "nor", "for", "yet", "so", "in", "on", "at",
  "to", "of", "with", "by", "from", "up", "about", "into", "over",
  "after", "that", "this", "it", "not", "no", "all", "each", "every",
  "both", "few", "more", "most", "other", "some", "such", "than",
  "too", "very", "just", "because", "as", "if", "when", "while",
  "i", "we", "you", "he", "she", "they", "me", "us", "him", "her",
  "my", "our", "your", "his", "its", "their", "what", "which", "who",
  // Tech-common words
  "app", "application", "build", "create", "make", "want", "using",
  "like", "data", "user", "users", "api", "web", "mobile", "system",
  "platform", "tool", "service", "server", "client", "database",
  "project", "feature", "page", "site", "website", "simple", "basic",
]);

function validateDescription(text: string): { valid: boolean; hint: string } {
  const trimmed = text.trim();

  if (trimmed.length < 20) {
    return { valid: false, hint: `${20 - trimmed.length} more characters needed` };
  }

  // Check word count
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length < 4) {
    return { valid: false, hint: "Describe your project in a few more words" };
  }

  // Check for gibberish: at least 30% of words should be recognizable
  const recognizedCount = words.filter(
    (w) => COMMON_WORDS.has(w.toLowerCase().replace(/[^a-z]/g, ""))
  ).length;
  const recognizedRatio = recognizedCount / words.length;
  if (recognizedRatio < 0.25 && words.length >= 4) {
    return { valid: false, hint: "That doesn't look like a project description — try explaining what you're building" };
  }

  // Check for repeated characters (e.g. "aaaaaaa")
  if (/(.)\1{5,}/.test(trimmed)) {
    return { valid: false, hint: "Please describe a real project you want to build" };
  }

  // Check for too many special characters
  const alphaRatio = (trimmed.match(/[a-zA-Z]/g)?.length ?? 0) / trimmed.length;
  if (alphaRatio < 0.5) {
    return { valid: false, hint: "Use words to describe your project, not just symbols" };
  }

  return { valid: true, hint: "" };
}

export default function DescriptionStep({ value, onChange, onNext }: Props) {
  const [focused, setFocused] = useState(false);
  const validation = useMemo(() => validateDescription(value), [value]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3 mb-4">
          <Notepad className="w-5 h-5 text-accent" weight="light" />
          <span className="text-xs tracking-[0.2em] uppercase text-muted">
            Project Intake
          </span>
        </div>
        <h2 className="font-[family-name:var(--font-serif)] text-3xl font-light italic text-foreground">
          Describe your vision
        </h2>
        <p className="text-sm text-muted">
          What are you building? Include features, audience, and any technical
          requirements you know.
        </p>
      </div>

      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && validation.valid) {
              onNext();
            }
          }}
          placeholder="e.g., A marketplace for vintage furniture where sellers can list items with photos, buyers can browse and filter by style/era, add to cart, and checkout with Stripe. Needs user auth, seller dashboards, and real-time chat between buyer and seller..."
          rows={6}
          className={`w-full bg-surface border rounded-lg p-4 text-foreground placeholder:text-muted-dim resize-none focus:outline-none transition-colors font-light text-sm leading-relaxed ${
            focused
              ? "border-accent"
              : "border-border hover:border-border-light"
          }`}
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-3">
          <span
            className={`text-xs font-[family-name:var(--font-mono)] ${
              !validation.valid ? "text-muted-dim" : "text-accent"
            }`}
          >
            {value.length}/2000
          </span>
        </div>
      </div>

      {value.length > 0 && !validation.valid && validation.hint && (
        <p className="text-xs text-muted-dim">
          {validation.hint}
        </p>
      )}

      <button
        onClick={onNext}
        disabled={!validation.valid}
        className="w-full py-3 rounded-lg text-sm tracking-wide transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 hover:border-accent/50"
      >
        Continue
      </button>
    </div>
  );
}
