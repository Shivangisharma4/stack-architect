"use client";

import {
  UserCircle,
  UsersThree,
  ChartLineUp,
  Buildings,
} from "@phosphor-icons/react/dist/ssr";
import type { ScaleTier } from "@/lib/engine/types";

interface Props {
  value: ScaleTier | null;
  onChange: (value: ScaleTier) => void;
  onNext: () => void;
  onBack: () => void;
}

const options: {
  value: ScaleTier;
  label: string;
  desc: string;
  icon: typeof UserCircle;
}[] = [
  {
    value: "hobby",
    label: "Hobby",
    desc: "Under 1,000 users",
    icon: UserCircle,
  },
  {
    value: "startup",
    label: "Startup",
    desc: "1K \u2013 100K users",
    icon: UsersThree,
  },
  {
    value: "growth",
    label: "Growth",
    desc: "100K \u2013 1M users",
    icon: ChartLineUp,
  },
  {
    value: "enterprise",
    label: "Enterprise",
    desc: "1M+ users",
    icon: Buildings,
  },
];

export default function ScaleStep({ value, onChange, onNext, onBack }: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <span className="text-xs tracking-[0.2em] uppercase text-muted">
          Spatial Parameters
        </span>
        <h2 className="font-[family-name:var(--font-serif)] text-3xl font-light italic text-foreground">
          Target scale
        </h2>
        <p className="text-sm text-muted">
          How many users will this serve at peak?
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const Icon = opt.icon;
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`p-4 rounded-lg border text-left transition-all duration-200 ${
                selected
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-border-light bg-surface"
              }`}
            >
              <Icon
                className={`w-5 h-5 mb-2 ${
                  selected ? "text-accent" : "text-muted"
                }`}
                weight="light"
              />
              <div className="text-sm font-medium text-foreground">
                {opt.label}
              </div>
              <div className="text-xs text-muted mt-0.5">{opt.desc}</div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-lg text-sm text-muted border border-border hover:border-border-light transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!value}
          className="flex-1 py-3 rounded-lg text-sm tracking-wide transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 hover:border-accent/50"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
