import { TIER_LABEL } from "@/lib/leaderboard";
import type { UserTier } from "@/lib/types";

export function TierBadge({ tier }: { tier: UserTier }) {
  const full = tier === "CONSULTANT";
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded border px-2 py-0.5 tabular-nums text-[11px] ${
        full ? "border-gold/40 bg-gold/10 text-gold" : "border-line-2 bg-panel-2 text-muted"
      }`}
      title={full ? "BRAIN Consultant" : "BRAIN Conditional Consultant"}
    >
      {TIER_LABEL[tier] ?? tier}
    </span>
  );
}
