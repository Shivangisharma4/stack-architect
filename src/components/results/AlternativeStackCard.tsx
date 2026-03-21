"use client";

import type { AlternativeStack, ScoredTechnology, SelectedStack } from "@/lib/engine/types";

interface Props {
  alternative: AlternativeStack;
  index: number;
}

function getStackTechs(stack: SelectedStack): ScoredTechnology[] {
  const techs: ScoredTechnology[] = [];
  const slots: (ScoredTechnology | null)[] = [
    stack.frontend, stack.backend, stack.database, stack.hosting,
    stack.language, stack.mobile, stack.desktop, stack.buildTool,
    stack.orm, stack.auth, stack.cache, stack.cms,
  ];
  for (const s of slots) {
    if (s) techs.push(s);
  }
  return techs;
}

export default function AlternativeStackCard({ alternative, index }: Props) {
  const techs = getStackTechs(alternative.stack);

  return (
    <div className="p-4 rounded-lg border border-border bg-surface hover:border-border-light transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-[10px] tracking-[0.15em] uppercase text-muted-dim">
            Option {index + 2}
          </span>
          <p className="text-sm font-medium text-foreground mt-0.5">
            {alternative.label}
          </p>
        </div>
        <div className="text-right">
          <span className="text-lg font-[family-name:var(--font-mono)] font-semibold text-foreground">
            {alternative.efficiencyScore}
          </span>
          <span className="text-xs text-muted">%</span>
        </div>
      </div>

      {/* Tech pills */}
      <div className="flex flex-wrap gap-1.5">
        {techs.map((t) => (
          <span
            key={t.technology.id}
            className="text-xs px-2 py-1 rounded-md bg-surface-2 border border-border text-muted font-[family-name:var(--font-mono)]"
          >
            {t.technology.name}
          </span>
        ))}
      </div>

      {/* Compatibility bar */}
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-accent/50 rounded-full"
            style={{ width: `${alternative.compatibilityScore}%` }}
          />
        </div>
        <span className="text-[10px] text-muted-dim font-[family-name:var(--font-mono)]">
          {alternative.compatibilityScore}% compat
        </span>
      </div>
    </div>
  );
}
