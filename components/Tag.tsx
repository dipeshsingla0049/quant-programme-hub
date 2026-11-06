import type { TagKind } from "@/lib/types";

const STYLES: Record<TagKind, string> = {
  Deadline: "text-gold border-gold/30 bg-gold/10",
  Announcement: "text-gold border-gold/30 bg-gold/10",
  Result: "text-teal border-teal/30 bg-teal/10",
  Workshop: "text-sky border-sky/30 bg-sky/10",
  "Guest Session": "text-violet border-violet/30 bg-violet/10",
  Contest: "text-teal border-teal/30 bg-teal/10",
  Prestige: "text-gold border-gold/40 bg-gold/10",
};

export function Tag({ kind, children }: { kind: TagKind; children?: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 tabular-nums text-[11px] leading-5 ${STYLES[kind]}`}
    >
      {children ?? kind}
    </span>
  );
}
