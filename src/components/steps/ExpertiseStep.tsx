"use client";

import { Code } from "@phosphor-icons/react/dist/ssr";

interface Props {
  value: string[];
  onChange: (value: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const LANGUAGES = [
  "typescript",
  "javascript",
  "python",
  "java",
  "go",
  "ruby",
  "rust",
  "php",
  "csharp",
  "swift",
  "kotlin",
];

const DISPLAY: Record<string, string> = {
  typescript: "TypeScript",
  javascript: "JavaScript",
  python: "Python",
  java: "Java",
  go: "Go",
  ruby: "Ruby",
  rust: "Rust",
  php: "PHP",
  csharp: "C#",
  swift: "Swift",
  kotlin: "Kotlin",
};

export default function ExpertiseStep({
  value,
  onChange,
  onNext,
  onBack,
}: Props) {
  const toggle = (lang: string) => {
    if (value.includes(lang)) {
      onChange(value.filter((l) => l !== lang));
    } else {
      onChange([...value, lang]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3 mb-1">
          <Code className="w-5 h-5 text-accent" weight="light" />
          <span className="text-xs tracking-[0.2em] uppercase text-muted">
            Material Knowledge
          </span>
        </div>
        <h2 className="font-[family-name:var(--font-serif)] text-3xl font-light italic text-foreground">
          Your team&apos;s expertise
        </h2>
        <p className="text-sm text-muted">
          Select languages your team knows. This gives a soft bonus, not a hard
          filter.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {LANGUAGES.map((lang) => {
          const selected = value.includes(lang);
          return (
            <button
              key={lang}
              onClick={() => toggle(lang)}
              className={`px-4 py-2 rounded-lg text-sm font-[family-name:var(--font-mono)] transition-all duration-200 ${
                selected
                  ? "bg-accent/15 border border-accent/40 text-accent"
                  : "bg-surface border border-border text-muted hover:border-border-light hover:text-foreground"
              }`}
            >
              {DISPLAY[lang]}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted-dim">
        {value.length === 0
          ? "Skip if you\u2019re open to any language"
          : `${value.length} selected`}
      </p>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-lg text-sm text-muted border border-border hover:border-border-light transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 rounded-lg text-sm tracking-wide transition-all duration-200 bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 hover:border-accent/50"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
