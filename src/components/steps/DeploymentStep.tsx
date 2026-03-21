"use client";

import {
  Cloud,
  Cube,
  HardDrives,
  Gear,
  Shuffle,
} from "@phosphor-icons/react/dist/ssr";
import type { DeploymentPref } from "@/lib/engine/types";

interface Props {
  value: DeploymentPref | null;
  onChange: (value: DeploymentPref) => void;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
}

const options: {
  value: DeploymentPref;
  label: string;
  desc: string;
  icon: typeof Cloud;
}[] = [
  {
    value: "serverless",
    label: "Serverless",
    desc: "Functions, auto-scaling",
    icon: Cloud,
  },
  {
    value: "containers",
    label: "Containers",
    desc: "Docker, Kubernetes",
    icon: Cube,
  },
  {
    value: "vps",
    label: "VPS",
    desc: "Virtual private server",
    icon: HardDrives,
  },
  {
    value: "managed",
    label: "Managed PaaS",
    desc: "Platform handles infra",
    icon: Gear,
  },
  {
    value: "no-preference",
    label: "No Preference",
    desc: "Algorithm decides",
    icon: Shuffle,
  },
];

export default function DeploymentStep({
  value,
  onChange,
  onSubmit,
  onBack,
  isLoading,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <span className="text-xs tracking-[0.2em] uppercase text-muted">
          Foundation Preference
        </span>
        <h2 className="font-[family-name:var(--font-serif)] text-3xl font-light italic text-foreground">
          Deployment model
        </h2>
        <p className="text-sm text-muted">
          How do you want to run this in production?
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
              disabled={isLoading}
              className={`p-4 rounded-lg border text-left transition-all duration-200 ${
                selected
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-border-light bg-surface"
              } ${opt.value === "no-preference" ? "col-span-2" : ""}`}
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
          disabled={isLoading}
          className="flex-1 py-3 rounded-lg text-sm text-muted border border-border hover:border-border-light transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={!value || isLoading}
          className="flex-1 py-3 rounded-lg text-sm tracking-wide transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed bg-accent border border-accent text-background font-medium hover:bg-accent-light"
        >
          {isLoading ? "Synthesizing..." : "Generate Blueprint"}
        </button>
      </div>
    </div>
  );
}
