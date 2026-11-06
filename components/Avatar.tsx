import { initials } from "@/lib/format";

export function Avatar({ name, rank }: { name: string; rank: number }) {
  const tone =
    rank === 1
      ? "bg-gold/15 text-gold border-gold/40"
      : rank === 3
        ? "bg-gold-deep/15 text-gold-deep border-gold-deep/40"
        : "bg-panel-2 text-muted border-line-2";
  return (
    <span
      className={`inline-flex size-9 shrink-0 items-center justify-center rounded-lg border tabular-nums text-xs font-medium ${tone}`}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
