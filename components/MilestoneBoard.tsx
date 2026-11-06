"use client";

import { useMemo, useState } from "react";
import type { Standing, Zone } from "@/lib/standings";
import { Avatar } from "./Avatar";
import { CheckCircle, XCircle } from "./icons";

export interface BoardColumn {
  label: string;
  /** e.g. "≥ 10", shown under the label. */
  target?: string;
  /** For ≥ rules: show "7 / 10". */
  of?: number;
}

type Tone = "gold" | "green" | "red" | "plain";

const TONE = {
  gold: { body: "bg-gold/[0.05]", edge: "border-l-gold", heading: "text-gold", pill: "border-gold/40 bg-gold/10 text-gold" },
  green: { body: "bg-teal/[0.09]", edge: "border-l-teal", heading: "text-teal", pill: "border-teal/40 bg-teal/10 text-teal" },
  red: { body: "bg-rose/[0.08]", edge: "border-l-rose", heading: "text-rose", pill: "border-rose/40 bg-rose/10 text-rose" },
  plain: { body: "", edge: "border-l-transparent", heading: "text-muted", pill: "" },
} satisfies Record<Tone, Record<string, string>>;

/**
 * A milestone leaderboard with a search box on top.
 *
 * - prize: rewarded places first (gold), then the rest who qualify, then those
 *   still working on it with what they're missing.
 * - passFail: everyone, green if they've cleared every rule, red if not.
 */
export function MilestoneBoard({
  standings,
  style,
  scoreLabel,
  columns,
  zoneLabels,
  prizeStatus,
  winners,
}: {
  standings: Standing[];
  style: "prize" | "passFail";
  /** Ranking metric column, when it isn't already one of the rule columns. */
  scoreLabel: string | null;
  /** One per milestone rule, in rule order. */
  columns: BoardColumn[];
  zoneLabels: Record<Zone, { title: string; empty?: string }>;
  /** Status text for rows in the top group, e.g. "Potential $50 winner". */
  prizeStatus: string;
  /** Rewarded places, if limited. */
  winners?: number;
}) {
  const [query, setQuery] = useState("");
  const passFail = style === "passFail";
  const toneOf = (zone: Zone): Tone =>
    zone === "prize" ? (passFail ? "green" : "gold") : zone === "pending" && passFail ? "red" : "plain";

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = standings.filter(
      (s) => !q || s.name.toLowerCase().includes(q) || s.alias.toLowerCase().includes(q) || s.university.toLowerCase().includes(q),
    );
    return (["prize", "qualified", "pending"] as Zone[]).map((zone) => ({ zone, rows: rows.filter((r) => r.zone === zone) }));
  }, [standings, query]);

  const showPosition = !passFail;
  const colCount = (showPosition ? 1 : 0) + 2 + (scoreLabel ? 1 : 0) + columns.length;
  const shown = groups.reduce((n, g) => n + g.rows.length, 0);

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="sr-only">Search by name</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your name, alias or university"
          className="min-h-11 w-full rounded-lg border border-line-2 bg-panel px-4 text-sm text-fg placeholder:text-dim focus:border-gold/60 focus:outline-none sm:max-w-md"
        />
      </label>

      <div className="relative overflow-x-auto rounded-xl border border-line bg-panel/60">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[11px] uppercase tracking-[0.08em] text-dim">
              {showPosition && <th scope="col" className="w-12 px-4 py-3 font-medium">#</th>}
              <th scope="col" className="px-4 py-3 font-medium">Researcher</th>
              {scoreLabel && <th scope="col" className="px-4 py-3 text-right font-medium">{scoreLabel}</th>}
              {columns.map((c) => (
                <th key={c.label} scope="col" className="px-4 py-3 text-right font-medium">
                  {c.label}
                  {c.target && <span className="block normal-case tracking-normal text-dim/80">{c.target}</span>}
                </th>
              ))}
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          {groups.map(({ zone, rows }) => {
            const label = zoneLabels[zone];
            // Hide empty groups while searching, and groups with no empty-state text always.
            if (!rows.length && (query || !label.empty)) return null;
            const tone = TONE[toneOf(zone)];
            const top = zone === "prize";
            return (
              <tbody key={zone} className={tone.body}>
                <tr className="border-b border-line">
                  <th
                    colSpan={colCount}
                    scope="colgroup"
                    className={`border-l-2 px-4 py-2.5 text-left text-xs font-semibold ${tone.edge} ${tone.heading}`}
                  >
                    {label.title} <span className="ml-1 font-normal tabular-nums text-dim">· {rows.length}</span>
                  </th>
                </tr>
                {!rows.length && (
                  <tr className="border-b border-line">
                    <td colSpan={colCount} className="px-4 py-5 text-sm text-muted">{label.empty}</td>
                  </tr>
                )}
                {rows.map((s) => (
                  <tr key={s.alias} className={`border-b border-l-2 border-line last:border-b-0 ${tone.edge}`}>
                    {showPosition && (
                      <td className={`px-4 py-3 tabular-nums ${top ? "font-semibold text-gold" : "text-dim"}`}>
                        {s.position ?? "—"}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={s.name} rank={!passFail && s.position === 1 ? 1 : 0} />
                        <div className="min-w-0">
                          <div className="truncate font-medium text-fg">{s.name}</div>
                          <div className="truncate text-[11px] text-dim">
                            <span className="tabular-nums">{s.alias}</span> · {s.university}
                          </div>
                        </div>
                      </div>
                    </td>
                    {scoreLabel && (
                      <td className={`px-4 py-3 text-right text-base tabular-nums ${top ? "font-semibold text-gold" : "text-fg"}`}>
                        {s.score}
                      </td>
                    )}
                    {s.checks.map((c) => {
                      const col = columns[c.rule];
                      return (
                        <td key={c.rule} className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                          <span className={`inline-flex items-center gap-1.5 ${c.pass ? "text-fg" : "text-rose"}`}>
                            {c.value}
                            {col?.of !== undefined && <span className="text-dim">/ {col.of.toLocaleString("en-US")}</span>}
                            {c.pass ? <CheckCircle size={14} className="text-teal" /> : <XCircle size={14} />}
                            <span className="sr-only">{c.pass ? "meets the rule" : "does not meet the rule"}</span>
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-xs">
                      {top ? (
                        <span className={`inline-flex whitespace-nowrap rounded-md border px-2 py-0.5 font-medium ${tone.pill}`}>
                          {prizeStatus}
                        </span>
                      ) : zone === "qualified" ? (
                        <span className="text-muted">Qualified, outside the top {winners}</span>
                      ) : (
                        <span className={passFail ? "text-rose" : "text-muted"}>
                          {[...new Set(s.checks.filter((c) => !c.pass).map((c) => c.gap))].join(" · ")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            );
          })}
          {shown === 0 && query && (
            <tbody>
              <tr>
                <td colSpan={colCount} className="px-4 py-8 text-center text-sm text-muted">
                  No one matches “{query}”.
                  {!passFail && " Only researchers with at least one submission in the window are listed."}
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
}
