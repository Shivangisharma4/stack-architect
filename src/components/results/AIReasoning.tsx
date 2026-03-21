"use client";

import { Brain } from "@phosphor-icons/react/dist/ssr";

interface Props {
  narration: string;
  isStreaming: boolean;
}

export default function AIReasoning({ narration, isStreaming }: Props) {
  if (!narration && !isStreaming) return null;

  // Simple markdown-like rendering
  const renderContent = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith("## ")) {
        elements.push(
          <h4
            key={i}
            className="text-sm font-semibold text-foreground mt-4 mb-2 tracking-wide"
          >
            {line.slice(3)}
          </h4>
        );
      } else if (line.startsWith("- ")) {
        elements.push(
          <p key={i} className="text-sm text-muted leading-relaxed pl-3 mb-1">
            <span className="text-accent mr-2">&bull;</span>
            {renderInlineCode(line.slice(2))}
          </p>
        );
      } else if (line.trim()) {
        elements.push(
          <p key={i} className="text-sm text-muted leading-relaxed mb-2">
            {renderInlineCode(line)}
          </p>
        );
      }
    }

    return elements;
  };

  const renderInlineCode = (text: string) => {
    const parts = text.split(/`([^`]+)`/);
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <code
          key={i}
          className="text-accent font-[family-name:var(--font-mono)] text-xs bg-accent/10 px-1 py-0.5 rounded"
        >
          {part}
        </code>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Brain className="w-4 h-4 text-accent" weight="light" />
        <h3 className="text-xs tracking-[0.15em] uppercase text-muted">
          Architectural Reasoning
        </h3>
        {isStreaming && (
          <span className="text-xs text-accent animate-pulse-glow font-[family-name:var(--font-mono)]">
            streaming
          </span>
        )}
      </div>

      <div className="p-4 rounded-lg border border-border bg-surface">
        {narration ? (
          <div>{renderContent(narration)}</div>
        ) : (
          <div className="animate-shimmer h-4 rounded" />
        )}
        {isStreaming && (
          <span className="inline-block w-2 h-4 bg-accent/60 animate-typewriter-cursor ml-0.5" />
        )}
      </div>
    </div>
  );
}
