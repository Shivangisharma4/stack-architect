"use client";

import {
  Lightning,
  Timer,
  CalendarBlank,
  Hourglass,
} from "@phosphor-icons/react/dist/ssr";
import type { Timeline } from "@/lib/engine/types";

interface Props {
  value: Timeline | null;
  onChange: (value: Timeline) => void;
  onNext: () => void;
  onBack: () => void;
}

const options: {
  value: Timeline;
  label: string;
  desc: string;
  icon: typeof Lightning;
}[] = [
  {
    value: "hackathon",
    label: "Hackathon",
    desc: "Days \u2014 ship yesterday",
    icon: Lightning,
  },
  {
    value: "weeks",
    label: "Sprint",
    desc: "Weeks \u2014 move fast",
    icon: Timer,
  },
  {
    value: "months",
    label: "Standard",
    desc: "Months \u2014 do it right",
    icon: CalendarBlank,
  },
  {
    value: "no-rush",
    label: "No Rush",
    desc: "Build for the long haul",
    icon: Hourglass,
  },
];

export default function TimelineStep({
  value,
  onChange,
  onNext,
  onBack,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <span className="text-xs tracking-[0.2em] uppercase text-muted">
          Timeline Projection
        </span>
        <h2 className="font-[family-name:var(--font-serif)] text-3xl font-light italic text-foreground">
          When does it ship?
        </h2>
        <p className="text-sm text-muted">
          Your timeline shapes which technologies make sense.
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
