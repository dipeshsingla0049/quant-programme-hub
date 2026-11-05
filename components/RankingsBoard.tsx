"use client";

import { useMemo, useState } from "react";
import { formatInt, formatMetric } from "@/lib/format";
import type { Participant, UserTier } from "@/lib/types";
import { Avatar } from "./Avatar";
import { LeaderboardTable } from "./LeaderboardTable";
import { TierBadge } from "./TierBadge";

const PAGE_SIZE = 25;

type SortKey = "rank" | "submissions" | "sharpe" | "prodCorr";

const SORTS: { id: SortKey; label: string }[] = [
  { id: "rank", label: "Official rank (simulations)" },
  { id: "submissions", label: "Most submissions" },
  { id: "sharpe", label: "Highest avg Sharpe" },
  { id: "prodCorr", label: "Lowest avg prod correlation" },
];

/** Nulls (no submitted alphas) always sort last. */
function byNullable(a: number | null, b: number | null, dir: 1 | -1) {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return (a - b) * dir;
}

const COMPARATORS: Record<SortKey, (a: Participant, b: Participant) => number> = {
  rank: (a, b) => a.rank - b.rank,
  submissions: (a, b) => b.totalSubmissions - a.totalSubmissions || a.rank - b.rank,
  sharpe: (a, b) => byNullable(a.avgSharpe, b.avgSharpe, -1) || a.rank - b.rank,
  prodCorr: (a, b) => byNullable(a.avgProdCorr, b.avgProdCorr, 1) || a.rank - b.rank,
};

function Podium({ top }: { top: Participant[] }) {
  // Visual order 2 · 1 · 3 on wide screens, 1 · 2 · 3 when stacked.
  const order = ["md:order-2", "md:order-1", "md:order-3"];
  const height = ["md:min-h-64", "md:min-h-56", "md:min-h-52"];
  return (
    <div className="grid gap-4 md:grid-cols-3 md:items-end">
      {top.map((p, i) => {
        const first = p.rank === 1;
        return (
          <div
            key={p.alias}
            className={`flex flex-col rounded-xl border p-6 ${order[i]} ${height[i]} ${
              first ? "border-gold/40 bg-gold/[0.06]" : "border-line bg-panel/60"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`font-serif text-5xl ${first ? "text-gold" : p.rank === 3 ? "text-gold-deep" : "text-fg"}`}>
                {String(p.rank).padStart(2, "0")}
              </span>
              <Avatar name={p.name} rank={p.rank} />
            </div>
            <div className="mt-4 text-lg font-medium text-fg">{p.name}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
              <span className="font-mono text-xs">{p.alias}</span>
              <TierBadge tier={p.tier} />
            </div>
            <div className="min-h-4 flex-1" />
            <dl className="grid grid-cols-3 gap-2 border-t border-line pt-4">
              <div>
                <dt className="text-[11px] text-muted">Simulations</dt>
                <dd className={`font-mono text-lg tabular-nums ${first ? "text-gold" : "text-fg"}`}>
                  {formatInt(p.totalSimulations)}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-muted">Submissions</dt>
                <dd className="font-mono text-lg tabular-nums text-fg">{p.totalSubmissions}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-muted">Avg Sharpe</dt>
                <dd className="font-mono text-lg tabular-nums text-fg">{formatMetric(p.avgSharpe)}</dd>
              </div>
            </dl>
          </div>
        );
      })}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-11 whitespace-nowrap rounded-lg border px-4 text-sm transition ${
        active ? "border-gold/50 bg-gold/10 text-gold" : "border-line-2 text-muted hover:text-fg"
      }`}
    >
      {children}
    </button>
  );
}

export function RankingsBoard({ participants, universities }: { participants: Participant[]; universities: string[] }) {
  const [query, setQuery] = useState("");
  const [university, setUniversity] = useState("all");
  const [tier, setTier] = useState<"all" | UserTier>("all");
  const [sort, setSort] = useState<SortKey>("rank");
  const [activeOnly, setActiveOnly] = useState(false);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return participants
      .filter((p) => university === "all" || p.university === university)
      .filter((p) => tier === "all" || p.tier === tier)
      .filter((p) => !activeOnly || p.totalSimulations > 0)
      .filter((p) => !q || p.name.toLowerCase().includes(q) || p.alias.toLowerCase().includes(q))
      .sort(COMPARATORS[sort]);
  }, [participants, query, university, tier, sort, activeOnly]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const rows = filtered.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);

  // Any filter change goes back to the first page.
  const reset = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(0);
  };

  return (
    <div className="space-y-8">
      <Podium top={participants.slice(0, 3)} />

      <div className="space-y-4 rounded-xl border border-line bg-panel/40 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="min-w-0 flex-1 basis-64">
            <span className="sr-only">Search by name or alias</span>
            <input
              type="search"
              value={query}
              onChange={(e) => reset(setQuery)(e.target.value)}
              placeholder="Search name or alias"
              className="min-h-11 w-full rounded-lg border border-line-2 bg-ink px-4 text-sm text-fg placeholder:text-dim focus:border-gold/60 focus:outline-none"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">
            <span>Sort</span>
            <select
              value={sort}
              onChange={(e) => reset(setSort)(e.target.value as SortKey)}
              className="min-h-11 rounded-lg border border-line-2 bg-ink px-3 text-sm text-fg focus:border-gold/60 focus:outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => reset(setActiveOnly)(e.target.checked)}
              className="size-4 accent-[#f5c26b]"
            />
            Hide 0 simulations
          </label>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="University">
          <Chip active={university === "all"} onClick={() => reset(setUniversity)("all")}>All universities</Chip>
          {universities.map((u) => (
            <Chip key={u} active={university === u} onClick={() => reset(setUniversity)(u)}>{u}</Chip>
          ))}
          <span className="mx-1 hidden w-px self-stretch bg-line sm:block" aria-hidden />
          <Chip active={tier === "all"} onClick={() => reset(setTier)("all")}>All tiers</Chip>
          <Chip active={tier === "CONSULTANT"} onClick={() => reset(setTier)("CONSULTANT")}>Consultant</Chip>
          <Chip active={tier === "CONDITIONALCONSULTANT"} onClick={() => reset(setTier)("CONDITIONALCONSULTANT")}>
            Conditional
          </Chip>
        </div>
      </div>

      <LeaderboardTable rows={rows} detailed />

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
        <span className="font-mono text-xs">
          {filtered.length === 0
            ? "0 of 0"
            : `${current * PAGE_SIZE + 1}–${current * PAGE_SIZE + rows.length} of ${filtered.length}`}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage(current - 1)}
            disabled={current === 0}
            className="min-h-11 rounded-lg border border-line-2 px-4 text-fg transition hover:border-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage(current + 1)}
            disabled={current >= pages - 1}
            className="min-h-11 rounded-lg border border-line-2 px-4 text-fg transition hover:border-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
