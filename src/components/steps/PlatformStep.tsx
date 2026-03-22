"use client";

import { useMemo } from "react";
import {
  Globe,
  Desktop,
  DeviceMobile,
  AppleLogo,
  AndroidLogo,
  Terminal,
  Code,
  GameController,
  Lightning,
} from "@phosphor-icons/react/dist/ssr";
import type { Platform } from "@/lib/engine/types";
import { detectPlatform } from "@/lib/engine/nlp-signals";

interface Props {
  value: Platform;
  description: string;
  onChange: (value: Platform) => void;
  onNext: () => void;
  onBack: () => void;
}

const options: {
  value: Platform;
  label: string;
  desc: string;
  icon: typeof Globe;
}[] = [
  {
    value: "web",
    label: "Web App",
    desc: "Browser-based application",
    icon: Globe,
  },
  {
    value: "desktop",
    label: "Desktop App",
    desc: "Native window application",
    icon: Desktop,
  },
  {
    value: "mobile-ios",
    label: "iOS App",
    desc: "Native iPhone / iPad",
    icon: AppleLogo,
  },
  {
    value: "mobile-android",
    label: "Android App",
    desc: "Native Android device",
    icon: AndroidLogo,
  },
  {
    value: "mobile-cross",
    label: "Cross-Platform Mobile",
    desc: "iOS + Android from one codebase",
    icon: DeviceMobile,
  },
  {
    value: "game",
    label: "Game",
    desc: "2D / 3D game or interactive experience",
    icon: GameController,
  },
  {
    value: "cli",
    label: "CLI Tool",
    desc: "Command-line interface",
    icon: Terminal,
  },
  {
    value: "script",
    label: "Script / Utility",
    desc: "Standalone program or tool",
    icon: Code,
  },
];

export default function PlatformStep({ value, description, onChange, onNext, onBack }: Props) {
  const detected = useMemo(() => detectPlatform(description), [description]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <span className="text-xs tracking-[0.2em] uppercase text-muted">
          Platform Target
        </span>
        <h2 className="font-[family-name:var(--font-serif)] text-3xl font-light italic text-foreground">
          What are you building?
        </h2>
        <p className="text-sm text-muted">
          Select the platform your project targets.
        </p>
      </div>

      {/* Auto-detected hint */}
      {detected && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-accent/30 bg-accent/5">
          <Lightning className="w-4 h-4 text-accent flex-shrink-0" weight="fill" />
          <p className="text-xs text-accent">
            We detected <span className="font-semibold">{options.find(o => o.value === detected.platform)?.label}</span> from your description. You can change it if needed.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const Icon = opt.icon;
          const selected = value === opt.value;
          const isDetected = detected?.platform === opt.value;
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
              <div className="flex items-center justify-between mb-2">
                <Icon
                  className={`w-5 h-5 ${
                    selected ? "text-accent" : "text-muted"
                  }`}
                  weight="light"
                />
                {isDetected && !selected && (
                  <span className="text-[9px] tracking-wider uppercase text-accent/60">
                    detected
                  </span>
                )}
              </div>
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
          className="flex-1 py-3 rounded-lg text-sm tracking-wide transition-all duration-200 bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 hover:border-accent/50"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
