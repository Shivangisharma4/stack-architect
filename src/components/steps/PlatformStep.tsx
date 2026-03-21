"use client";

import {
  Globe,
  Desktop,
  DeviceMobile,
  AppleLogo,
  AndroidLogo,
  Terminal,
  Code,
  GameController,
} from "@phosphor-icons/react/dist/ssr";
import type { Platform } from "@/lib/engine/types";

interface Props {
  value: Platform;
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

export default function PlatformStep({ value, onChange, onNext, onBack }: Props) {
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
          className="flex-1 py-3 rounded-lg text-sm tracking-wide transition-all duration-200 bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 hover:border-accent/50"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
