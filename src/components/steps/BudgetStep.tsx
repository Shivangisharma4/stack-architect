"use client";

import {
  CurrencyCircleDollar,
  Coin,
  CreditCard,
  Vault,
} from "@phosphor-icons/react/dist/ssr";
import type { Budget } from "@/lib/engine/types";

interface Props {
  value: Budget | null;
  onChange: (value: Budget) => void;
  onNext: () => void;
  onBack: () => void;
}

const options: {
  value: Budget;
  label: string;
  desc: string;
  icon: typeof Coin;
}[] = [
  {
    value: "free",
    label: "Free Tier",
    desc: "$0 \u2014 open source only",
    icon: CurrencyCircleDollar,
  },
  {
    value: "low",
    label: "Low",
    desc: "Under $50/month",
    icon: Coin,
  },
  {
    value: "moderate",
    label: "Moderate",
    desc: "$50 \u2013 $500/month",
    icon: CreditCard,
  },
  {
    value: "enterprise",
    label: "Enterprise",
    desc: "$500+/month",
    icon: Vault,
  },
];

export default function BudgetStep({
  value,
  onChange,
  onNext,
  onBack,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <span className="text-xs tracking-[0.2em] uppercase text-muted">
          Resource Allocation
        </span>
        <h2 className="font-[family-name:var(--font-serif)] text-3xl font-light italic text-foreground">
          Infrastructure budget
        </h2>
        <p className="text-sm text-muted">
          Monthly hosting and service costs you can sustain.
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
