"use client";

import {
  Gauge,
  ShieldCheck,
  Rocket,
  MagnifyingGlass,
  Lightning,
  CurrencyCircleDollar,
} from "@phosphor-icons/react/dist/ssr";
import type { Priority } from "@/lib/engine/types";

interface Props {
  value: Priority[];
  onChange: (value: Priority[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const options: {
  value: Priority;
  label: string;
  desc: string;
  icon: typeof Gauge;
}[] = [
  {
    value: "performance",
    label: "Performance",
    desc: "Speed and throughput",
    icon: Gauge,
  },
  {
    value: "security",
    label: "Security",
    desc: "Type safety and hardening",
    icon: ShieldCheck,
  },
  {
    value: "dev-speed",
    label: "Dev Speed",
    desc: "Ship faster",
    icon: Rocket,
  },
  {
    value: "seo",
    label: "SEO",
    desc: "Search visibility",
    icon: MagnifyingGlass,
  },
  {
    value: "realtime",
    label: "Real-time",
    desc: "Live data and WebSockets",
    icon: Lightning,
  },
  {
    value: "cost",
    label: "Cost",
    desc: "Minimize expenses",
    icon: CurrencyCircleDollar,
  },
];

export default function PrioritiesStep({
  value,
  onChange,
  onNext,
  onBack,
}: Props) {
  const toggle = (priority: Priority) => {
    if (value.includes(priority)) {
      onChange(value.filter((p) => p !== priority));
    } else if (value.length < 2) {
      onChange([...value, priority]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <span className="text-xs tracking-[0.2em] uppercase text-muted">
          Structural Priorities
        </span>
        <h2 className="font-[family-name:var(--font-serif)] text-3xl font-light italic text-foreground">
          Pick your top two
        </h2>
        <p className="text-sm text-muted">
          What matters most? These heavily influence the algorithm&apos;s weight
          profile.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const Icon = opt.icon;
          const selected = value.includes(opt.value);
          const disabled = !selected && value.length >= 2;
          return (
            <button
              key={opt.value}
              onClick={() => toggle(opt.value)}
              disabled={disabled}
              className={`p-4 rounded-lg border text-left transition-all duration-200 ${
                selected
                  ? "border-accent bg-accent/10"
                  : disabled
                    ? "border-border bg-surface opacity-40 cursor-not-allowed"
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

      <p className="text-xs text-muted-dim">
        {value.length}/2 selected
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
          disabled={value.length !== 2}
          className="flex-1 py-3 rounded-lg text-sm tracking-wide transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 hover:border-accent/50"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
