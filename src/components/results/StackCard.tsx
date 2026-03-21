"use client";

import type { ScoredTechnology, TechAttributes } from "@/lib/engine/types";
import {
  Browser,
  HardDrives,
  Database,
  CloudArrowUp,
  Key,
  Lightning,
  Table,
  Article,
  DeviceMobile,
  Desktop,
  Code,
  Wrench,
  GameController,
} from "@phosphor-icons/react/dist/ssr";

interface Props {
  label: string;
  scored: ScoredTechnology;
}

const CATEGORY_CONFIG: Record<
  string,
  { icon: typeof Browser; accent: string }
> = {
  frontend: { icon: Browser, accent: "text-blue-400" },
  backend: { icon: HardDrives, accent: "text-violet-400" },
  database: { icon: Database, accent: "text-emerald-400" },
  hosting: { icon: CloudArrowUp, accent: "text-amber-400" },
  orm: { icon: Table, accent: "text-cyan-400" },
  auth: { icon: Key, accent: "text-rose-400" },
  cache: { icon: Lightning, accent: "text-orange-400" },
  cms: { icon: Article, accent: "text-pink-400" },
  mobile: { icon: DeviceMobile, accent: "text-teal-400" },
  desktop: { icon: Desktop, accent: "text-indigo-400" },
  language: { icon: Code, accent: "text-yellow-400" },
  "build-tool": { icon: Wrench, accent: "text-lime-400" },
  game: { icon: GameController, accent: "text-red-400" },
};

const TOP_DIMS: (keyof TechAttributes)[] = [
  "performanceAtScale",
  "timeToMVP",
  "ecosystemMaturity",
  "typeSafety",
];

const DIM_SHORT: Record<string, string> = {
  performanceAtScale: "Scale",
  timeToMVP: "Speed",
  ecosystemMaturity: "Ecosystem",
  typeSafety: "Type Safe",
};

export default function StackCard({ label, scored }: Props) {
  const config = CATEGORY_CONFIG[scored.technology.category] ?? {
    icon: Browser,
    accent: "text-muted",
  };
  const Icon = config.icon;

  return (
    <div className="p-4 rounded-lg border border-border bg-surface hover:border-border-light transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <Icon className={`w-4 h-4 ${config.accent}`} weight="light" />
          <div>
            <p className="text-xs text-muted uppercase tracking-wider">
              {label}
            </p>
            <p className="text-base font-medium text-foreground">
              {scored.technology.name}
            </p>
          </div>
        </div>
        <span className="text-xs font-[family-name:var(--font-mono)] text-accent">
          {scored.rawScore.toFixed(1)}
        </span>
      </div>

      {/* Dimension bars */}
      <div className="space-y-1.5">
        {TOP_DIMS.map((dim) => {
          const val = scored.technology.attributes[dim];
          return (
            <div key={dim} className="flex items-center gap-2">
              <span className="text-[10px] text-muted-dim w-16 text-right font-[family-name:var(--font-mono)]">
                {DIM_SHORT[dim]}
              </span>
              <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent/60 rounded-full transition-all duration-700"
                  style={{ width: `${val * 10}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-dim w-4 font-[family-name:var(--font-mono)]">
                {val}
              </span>
            </div>
          );
        })}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mt-3">
        {scored.technology.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-muted-dim border border-border"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
