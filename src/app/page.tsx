"use client";

import { useReducer, useCallback } from "react";
import type {
  FormState,
  FormAction,
  FormInputs,
  StackRecommendation,
  ScaleTier,
  Timeline,
  Budget,
  DeploymentPref,
  Priority,
  Platform,
} from "@/lib/engine/types";
import { detectPlatform } from "@/lib/engine/nlp-signals";
import DescriptionStep from "@/components/steps/DescriptionStep";
import ScaleStep from "@/components/steps/ScaleStep";
import TimelineStep from "@/components/steps/TimelineStep";
import ExpertiseStep from "@/components/steps/ExpertiseStep";
import BudgetStep from "@/components/steps/BudgetStep";
import PrioritiesStep from "@/components/steps/PrioritiesStep";
import PlatformStep from "@/components/steps/PlatformStep";
import DeploymentStep from "@/components/steps/DeploymentStep";
import SynthesisLoader from "@/components/SynthesisLoader";
import BlueprintView from "@/components/results/BlueprintView";
import Image from "next/image";

const STEP_LABELS = [
  "Project Intake",
  "Platform Target",
  "Spatial Parameters",
  "Timeline Projection",
  "Material Knowledge",
  "Resource Allocation",
  "Structural Priorities",
  "Foundation Preference",
];

const initialInputs: FormInputs = {
  projectDescription: "",
  platform: "web",
  scale: "startup",
  timeline: "months",
  teamExpertise: [],
  budget: "low",
  deployment: "no-preference",
  priorities: [],
  databasePreference: "no-preference",
};

const initialState: FormState = {
  step: -1, // -1 = landing, 0-7 = form steps, 8 = loading, 9 = results
  inputs: initialInputs,
  isLoading: false,
  recommendation: null,
  aiNarration: "",
  isStreaming: false,
  error: null,
};

function reducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        inputs: { ...state.inputs, [action.field]: action.value },
      };
    case "NEXT_STEP":
      return { ...state, step: state.step + 1 };
    case "PREV_STEP":
      return { ...state, step: Math.max(-1, state.step - 1) };
    case "START_LOADING":
      return { ...state, step: 8, isLoading: true, error: null };
    case "SET_RECOMMENDATION":
      return {
        ...state,
        step: 9,
        isLoading: false,
        recommendation: action.payload,
        isStreaming: true,
      };
    case "APPEND_NARRATION":
      return { ...state, aiNarration: state.aiNarration + action.payload };
    case "FINISH_STREAMING":
      return { ...state, isStreaming: false };
    case "SET_ERROR":
      return {
        ...state,
        step: 7,
        isLoading: false,
        error: action.payload,
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export default function Home() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleSubmit = useCallback(async () => {
    dispatch({ type: "START_LOADING" });

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state.inputs),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Request failed");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE lines
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "scores") {
              dispatch({
                type: "SET_RECOMMENDATION",
                payload: data.data as StackRecommendation,
              });
            } else if (data.type === "narration") {
              dispatch({ type: "APPEND_NARRATION", payload: data.text });
            } else if (data.type === "done") {
              dispatch({ type: "FINISH_STREAMING" });
            } else if (data.type === "error") {
              dispatch({ type: "FINISH_STREAMING" });
            }
          } catch {
            // ignore parse errors on partial chunks
          }
        }
      }

      dispatch({ type: "FINISH_STREAMING" });
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        payload: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  }, [state.inputs]);

  // Landing page
  if (state.step === -1) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Stack Architect" width={24} height={24} className="text-accent" style={{ filter: "brightness(0) invert(0.9)" }} />
            <span className="text-sm font-medium tracking-wide font-[family-name:var(--font-serif)] italic">
              stack architect
            </span>
          </div>
          <span className="text-[10px] tracking-[0.15em] uppercase text-muted-dim">
            120+ technologies · 8 dimensions
          </span>
        </nav>

        {/* Hero */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="max-w-2xl w-full space-y-16">
            {/* Headline */}
            <div className="text-center space-y-5">
              <p className="text-xs tracking-[0.3em] uppercase text-accent">
                Describe it. We&apos;ll architect it.
              </p>
              <h1 className="font-[family-name:var(--font-serif)] text-4xl md:text-5xl lg:text-6xl font-light italic leading-[1.15] text-foreground">
                The right stack
                <br />
                for <span className="text-accent">your</span> project.
              </h1>
              <p className="text-base text-muted max-w-lg mx-auto leading-relaxed">
                Tell us what you&apos;re building and we&apos;ll recommend the exact
                technologies, scored, ranked, and explained. Not the same
                answer for everyone.
              </p>
            </div>

            {/* CTA */}
            <div className="flex justify-center">
              <button
                onClick={() => dispatch({ type: "NEXT_STEP" })}
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-accent/10 border border-accent/30 text-accent text-base tracking-wide hover:bg-accent/20 hover:border-accent/50 transition-all duration-300"
              >
                Start Building
                <span className="text-accent/50 group-hover:translate-x-1 transition-transform duration-200">&rarr;</span>
              </button>
            </div>

            {/* How it works */}
            <div className="space-y-6">
              <p className="text-center text-[10px] tracking-[0.2em] uppercase text-muted-dim">
                How it works
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    step: "01",
                    title: "Describe your project",
                    desc: "A retro game? A Go microservice? A Flutter fitness app? Just tell us what you're making. We detect languages, frameworks, and features from your words.",
                  },
                  {
                    step: "02",
                    title: "Set your constraints",
                    desc: "Platform, scale, timeline, budget, expertise. These shift the weights on our scoring engine so the recommendation fits your reality.",
                  },
                  {
                    step: "03",
                    title: "Get your blueprint",
                    desc: "A primary stack with efficiency score, 3 alternatives, compatibility analysis, and architectural reasoning from an AI that actually read your brief.",
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="p-5 rounded-lg border border-border bg-surface space-y-3"
                  >
                    <span className="text-xs font-[family-name:var(--font-mono)] text-accent">
                      {item.step}
                    </span>
                    <h3 className="text-sm font-medium text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* What makes it different */}
            <div className="space-y-6">
              <p className="text-center text-[10px] tracking-[0.2em] uppercase text-muted-dim">
                Why this isn&apos;t another AI recommender
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { stat: "120+", label: "Technologies", sub: "from Rust to Flutter to Godot" },
                  { stat: "8", label: "Dimensions", sub: "performance, cost, safety, speed..." },
                  { stat: "470+", label: "Compatibility pairs", sub: "knows what works together" },
                  { stat: "~5ms", label: "Engine time", sub: "algorithm picks, AI explains" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-4 rounded-lg border border-border bg-surface text-center space-y-1"
                  >
                    <span className="text-2xl font-[family-name:var(--font-mono)] font-semibold text-foreground">
                      {item.stat}
                    </span>
                    <p className="text-xs text-muted">{item.label}</p>
                    <p className="text-[10px] text-muted-dim">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Example inputs */}
            <div className="space-y-4">
              <p className="text-center text-[10px] tracking-[0.2em] uppercase text-muted-dim">
                Try describing something like
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "a retro pixel-art game",
                  "REST API in Go",
                  "Flutter fitness tracker",
                  "real-time chat with Phoenix",
                  "e-commerce store with Vue",
                  "generative art installation",
                  "Python scraper",
                  "desktop app with Tauri",
                ].map((ex) => (
                  <span
                    key={ex}
                    className="text-[11px] px-3 py-1.5 rounded-full border border-border text-muted hover:text-accent hover:border-accent/30 transition-colors cursor-default"
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-dim">
            <span className="flex items-center gap-1.5 font-[family-name:var(--font-serif)] italic">
              stack architect
            </span>
            <span>Deterministic scoring + AI narration</span>
          </div>
        </footer>
      </div>
    );
  }

  // Loading state
  if (state.step === 8) {
    return (
      <div className="min-h-screen flex flex-col">
        <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Stack Architect" width={24} height={24} className="text-accent" style={{ filter: "brightness(0) invert(0.9)" }} />
            <span className="text-sm font-medium tracking-wide font-[family-name:var(--font-serif)] italic">
              stack architect
            </span>
          </div>
        </nav>
        <main className="flex-1">
          <SynthesisLoader />
        </main>
      </div>
    );
  }

  // Results
  if (state.step === 9 && state.recommendation) {
    return (
      <div className="min-h-screen flex flex-col">
        <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Stack Architect" width={24} height={24} className="text-accent" style={{ filter: "brightness(0) invert(0.9)" }} />
            <span className="text-sm font-medium tracking-wide font-[family-name:var(--font-serif)] italic">
              stack architect
            </span>
          </div>
        </nav>
        <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-8">
          <BlueprintView
            recommendation={state.recommendation}
            aiNarration={state.aiNarration}
            isStreaming={state.isStreaming}
            onReset={() => dispatch({ type: "RESET" })}
          />
        </main>
      </div>
    );
  }

  // Form steps
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Stack Architect" width={20} height={20} style={{ filter: "brightness(0) invert(0.9)" }} />
          <span className="text-sm font-medium tracking-wide font-[family-name:var(--font-serif)] italic">
            stack architect
          </span>
        </div>
        <span className="text-xs text-muted font-[family-name:var(--font-mono)]">
          {state.step + 1} / 8
        </span>
      </nav>

      {/* Step indicator */}
      <div className="px-6 py-3 border-b border-border">
        <div className="max-w-md mx-auto flex items-center gap-1">
          {STEP_LABELS.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-0.5 rounded-full transition-colors duration-300 ${
                i <= state.step ? "bg-accent" : "bg-border"
              }`}
            />
          ))}
        </div>
        <p className="text-center text-[10px] tracking-[0.2em] uppercase text-muted mt-2">
          {STEP_LABELS[state.step]}
        </p>
      </div>

      {/* Error banner */}
      {state.error && (
        <div className="mx-6 mt-4 p-3 rounded-lg bg-danger/10 border border-danger/30 text-sm text-danger">
          {state.error}
        </div>
      )}

      {/* Step content */}
      <main className="flex-1 flex items-start justify-center px-6 py-8">
        <div className="w-full max-w-md">
          {state.step === 0 && (
            <DescriptionStep
              value={state.inputs.projectDescription}
              onChange={(v) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "projectDescription",
                  value: v,
                })
              }
              onNext={() => {
                // Auto-detect platform from description before advancing
                const detected = detectPlatform(state.inputs.projectDescription);
                if (detected) {
                  dispatch({ type: "SET_FIELD", field: "platform", value: detected.platform });
                }
                dispatch({ type: "NEXT_STEP" });
              }}
              onBack={() => dispatch({ type: "PREV_STEP" })}
            />
          )}
          {state.step === 1 && (
            <PlatformStep
              value={state.inputs.platform}
              description={state.inputs.projectDescription}
              onChange={(v) =>
                dispatch({ type: "SET_FIELD", field: "platform", value: v })
              }
              onNext={() => dispatch({ type: "NEXT_STEP" })}
              onBack={() => dispatch({ type: "PREV_STEP" })}
            />
          )}
          {state.step === 2 && (
            <ScaleStep
              value={state.inputs.scale as ScaleTier}
              onChange={(v) =>
                dispatch({ type: "SET_FIELD", field: "scale", value: v })
              }
              onNext={() => dispatch({ type: "NEXT_STEP" })}
              onBack={() => dispatch({ type: "PREV_STEP" })}
            />
          )}
          {state.step === 3 && (
            <TimelineStep
              value={state.inputs.timeline as Timeline}
              onChange={(v) =>
                dispatch({ type: "SET_FIELD", field: "timeline", value: v })
              }
              onNext={() => dispatch({ type: "NEXT_STEP" })}
              onBack={() => dispatch({ type: "PREV_STEP" })}
            />
          )}
          {state.step === 4 && (
            <ExpertiseStep
              value={state.inputs.teamExpertise}
              onChange={(v) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "teamExpertise",
                  value: v,
                })
              }
              onNext={() => dispatch({ type: "NEXT_STEP" })}
              onBack={() => dispatch({ type: "PREV_STEP" })}
            />
          )}
          {state.step === 5 && (
            <BudgetStep
              value={state.inputs.budget as Budget}
              onChange={(v) =>
                dispatch({ type: "SET_FIELD", field: "budget", value: v })
              }
              onNext={() => dispatch({ type: "NEXT_STEP" })}
              onBack={() => dispatch({ type: "PREV_STEP" })}
            />
          )}
          {state.step === 6 && (
            <PrioritiesStep
              value={state.inputs.priorities as Priority[]}
              onChange={(v) =>
                dispatch({ type: "SET_FIELD", field: "priorities", value: v })
              }
              onNext={() => dispatch({ type: "NEXT_STEP" })}
              onBack={() => dispatch({ type: "PREV_STEP" })}
            />
          )}
          {state.step === 7 && (
            <DeploymentStep
              value={state.inputs.deployment as DeploymentPref}
              onChange={(v) =>
                dispatch({ type: "SET_FIELD", field: "deployment", value: v })
              }
              onSubmit={handleSubmit}
              onBack={() => dispatch({ type: "PREV_STEP" })}
              isLoading={state.isLoading}
            />
          )}
        </div>
      </main>
    </div>
  );
}
