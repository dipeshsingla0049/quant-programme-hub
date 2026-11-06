import type { Milestone } from "@/lib/milestones";

/** The small tag next to a milestone's name, e.g. "Important" or "$50 Challenge". */
export function MilestoneBadge({ badge, size = "sm" }: { badge: Milestone["badge"]; size?: "sm" | "lg" }) {
  if (!badge) return null;
  const tone = badge.tone === "rose" ? "border-rose/40 bg-rose/10 text-rose" : "border-gold/40 bg-gold/10 text-gold";
  const scale = size === "lg" ? "px-2.5 py-1 text-sm" : "px-2 py-0.5 text-[11px]";
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-md border align-middle font-semibold uppercase tracking-wide ${tone} ${scale}`}>
      {badge.text}
    </span>
  );
}
