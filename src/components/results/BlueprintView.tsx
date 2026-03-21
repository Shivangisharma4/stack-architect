"use client";

import type { StackRecommendation } from "@/lib/engine/types";
import EfficiencyGauge from "./EfficiencyGauge";
import StackCard from "./StackCard";
import AlternativeStackCard from "./AlternativeStackCard";
import TradeoffsList from "./TradeoffsList";
import AIReasoning from "./AIReasoning";
import { ArrowCounterClockwise, Crown } from "@phosphor-icons/react/dist/ssr";

interface Props {
  recommendation: StackRecommendation;
  aiNarration: string;
  isStreaming: boolean;
  onReset: () => void;
}

export default function BlueprintView({
  recommendation,
  aiNarration,
  isStreaming,
  onReset,
}: Props) {
  const { stack } = recommendation;

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs tracking-[0.2em] uppercase text-muted block mb-2">
            Analysis Complete
          </span>
          <h1 className="font-[family-name:var(--font-serif)] text-3xl md:text-4xl font-light italic text-foreground">
            Your Architectural
            <br />
            Blueprint
          </h1>
        </div>
        <button
          onClick={onReset}
          className="p-2 rounded-lg border border-border text-muted hover:text-foreground hover:border-border-light transition-colors"
          title="Start over"
        >
          <ArrowCounterClockwise className="w-4 h-4" weight="light" />
        </button>
      </div>

      {/* Project understanding */}
      {recommendation.projectSummary && (
        <div className="p-4 rounded-lg border border-border bg-surface">
          <p className="text-xs tracking-[0.15em] uppercase text-muted mb-1.5">
            We understood your project as
          </p>
          <p className="text-sm text-foreground leading-relaxed">
            {recommendation.projectSummary}
          </p>
        </div>
      )}

      {/* Primary recommendation header */}
      <div className="flex items-center gap-2">
        <Crown className="w-4 h-4 text-accent" weight="fill" />
        <h3 className="text-xs tracking-[0.15em] uppercase text-muted">
          Best Match for Your Project
        </h3>
        {recommendation.archetypeMatch && (
          <span className="ml-auto text-xs text-accent font-[family-name:var(--font-mono)]">
            {recommendation.archetypeMatch}
          </span>
        )}
      </div>

      {/* Efficiency gauge */}
      <div className="p-6 rounded-lg border border-accent/20 bg-accent/5">
        <EfficiencyGauge
          score={recommendation.efficiencyScore}
          compatibilityScore={recommendation.compatibilityScore}
        />
      </div>

      {/* Primary stack cards */}
      <div>
        <h3 className="text-xs tracking-[0.15em] uppercase text-muted mb-3">
          Recommended Stack
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {stack.frontend && <StackCard label="Frontend" scored={stack.frontend} />}
          {stack.backend && <StackCard label="Backend" scored={stack.backend} />}
          {stack.database && <StackCard label="Database" scored={stack.database} />}
          {stack.hosting && <StackCard label="Hosting" scored={stack.hosting} />}
          {stack.language && <StackCard label="Language" scored={stack.language} />}
          {stack.game && <StackCard label="Game Engine" scored={stack.game} />}
          {stack.mobile && <StackCard label="Mobile Framework" scored={stack.mobile} />}
          {stack.desktop && <StackCard label="Desktop Framework" scored={stack.desktop} />}
          {stack.buildTool && <StackCard label="Build Tool" scored={stack.buildTool} />}
          {stack.orm && <StackCard label="ORM" scored={stack.orm} />}
          {stack.auth && <StackCard label="Auth" scored={stack.auth} />}
          {stack.cache && <StackCard label="Cache" scored={stack.cache} />}
          {stack.cms && <StackCard label="CMS" scored={stack.cms} />}
        </div>
      </div>

      {/* Alternatives */}
      {recommendation.alternatives.length > 0 && (
        <div>
          <h3 className="text-xs tracking-[0.15em] uppercase text-muted mb-3">
            Other Options to Consider
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {recommendation.alternatives.map((alt, i) => (
              <AlternativeStackCard key={i} alternative={alt} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Trade-offs */}
      <TradeoffsList tradeoffs={recommendation.tradeoffs} />

      {/* AI Reasoning */}
      <AIReasoning narration={aiNarration} isStreaming={isStreaming} />

      {/* Footer reset */}
      <div className="pt-4 border-t border-border">
        <button
          onClick={onReset}
          className="w-full py-3 rounded-lg text-sm text-muted border border-border hover:border-border-light hover:text-foreground transition-colors"
        >
          Synthesize Another Blueprint
        </button>
      </div>
    </div>
  );
}
