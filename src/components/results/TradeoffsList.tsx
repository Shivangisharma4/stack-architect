"use client";

import { Warning } from "@phosphor-icons/react/dist/ssr";

interface Props {
  tradeoffs: string[];
}

export default function TradeoffsList({ tradeoffs }: Props) {
  if (tradeoffs.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Warning className="w-4 h-4 text-warning" weight="light" />
        <h3 className="text-xs tracking-[0.15em] uppercase text-muted">
          Trade-offs
        </h3>
      </div>

      <div className="space-y-2">
        {tradeoffs.map((t, i) => (
          <p key={i} className="text-sm text-muted leading-relaxed pl-6">
            {t}
          </p>
        ))}
      </div>
    </div>
  );
}
