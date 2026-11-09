"use client";

import { useMemo, useState } from "react";
import type { Group, Tone } from "@/lib/standings";
import { Avatar } from "./Avatar";
import { CheckCircle, XCircle } from "./icons";

export interface BoardColumn {
  label: string;
  /** e.g. "≥ 10", shown under the label. */
  target?: string;
  /** For ≥ rules: show "7 / 10". */
  of?: number;
}

const TONE: Record<Tone, { body: string; edge: string; heading: string; pill: string; text: string }> = {
  green: {
    body: "bg-teal/[0.09]",
    edge: "border-l-teal",
    heading: "text-teal",
    pill: "border-teal/40 bg-teal/10 text-teal",
    text: "text-teal",
  },
  blue: {
    body: "bg-sky/[0.07]",
    edge: "border-l-sky",
    heading: "text-sky",
    pill: "border-sky/40 bg-sky/10 text-sky",
    text: "text-sky",
  },
  yellow: {
    body: "bg-amber-bright/[0.13]",
    edge: "border-l-amber-bright",
    heading: "text-amber",
    pill: "border-amber/40 bg-amber-bright/15 text-amber",
    text: "text-amber",
  },
  red: { body: "bg-rose/[0.08]", edge: "border-l-rose", heading: "text-rose", pill: "border-rose/40 bg-rose/10 text-rose", text: "text-rose" },
  gold: {
    body: "bg-linear-to-r from-amber-bright/30 via-amber-bright/[0.12] to-amber-bright/[0.04]",
    edge: "border-l-amber-bright",
    heading: "text-gold-deep",
    pill: "border-gold/50 bg-amber-bright/25 text-gold-deep",
    text: "text-fg",
  },
  plain: { body: "", edge: "border-l-transparent", heading: "text-muted", pill: "", text: "text-muted" },
  grey: { body: "bg-panel-2/50", edge: "border-l-line-2", heading: "text-dim", pill: "", text: "text-dim" },
};

/**
 * A milestone leaderboard: coloured groups in a fixed order, a search box on
 * top, and a "What's needed" line for every researcher. Grey groups (not
 * started, not ranked) are collapsed until opened or searched.
 */
export function MilestoneBoard({
  groups,
  ranked,
  scoreLabel,
  columns,
  lastWeekLabel,
}: {
  groups: Group[];
  /** Show the # column. */
  ranked: boolean;
  /** Ranking metric column, e.g. "Avg prod corr". */
  scoreLabel: string | null;
  /** One per tracked rule, in rule order. */
  columns: BoardColumn[];
  /** Header for the previous week's result column, when there is one. */
  lastWeekLabel: string | null;
}) {
  const [query, setQuery] = useState("");
  const [opened, setOpened] = useState<Set<string>>(new Set());
  const q = query.trim().toLowerCase();
  const hasLastWeek = !!lastWeekLabel;

  const shownGroups = useMemo(
    () =>
      groups.map((g) => ({
        ...g,
        rows: g.rows.filter(
          (s) => !q || s.name.toLowerCase().includes(q) || s.alias.toLowerCase().includes(q) || s.university.toLowerCase().includes(q),
        ),
      })),
    [groups, q],
  );

  const colCount = (ranked ? 1 : 0) + 1 + (scoreLabel ? 1 : 0) + columns.length + (hasLastWeek ? 1 : 0) + 1;
  const shown = shownGroups.reduce((n, g) => n + g.rows.length, 0);
  const toggle = (id: string) =>
    setOpened((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

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
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[11px] uppercase tracking-[0.08em] text-dim">
              {ranked && <th scope="col" className="w-12 px-4 py-3 font-medium">#</th>}
              <th scope="col" className="px-4 py-3 font-medium">Researcher</th>
              {scoreLabel && <th scope="col" className="px-4 py-3 text-right font-medium">{scoreLabel}</th>}
              {columns.map((c) => (
                <th key={c.label} scope="col" className="whitespace-nowrap px-4 py-3 text-right font-medium">
                  {c.label}
                  {c.target && <span className="block normal-case tracking-normal text-dim/80">{c.target}</span>}
                </th>
              ))}
              {hasLastWeek && <th scope="col" className="whitespace-nowrap px-4 py-3 font-medium">{lastWeekLabel}</th>}
              <th scope="col" className="min-w-56 px-4 py-3 font-medium">What&apos;s needed</th>
            </tr>
          </thead>
          {shownGroups.map((g, gi) => {
            const total = groups[gi].rows.length;
            // Hide empty groups while searching, and empty groups with no empty-state text always.
            if (!g.rows.length && (q || !g.empty)) return null;
            const tone = TONE[g.tone];
            const collapsible = g.tone === "grey" && !q && g.rows.length > 0;
            const open = !collapsible || opened.has(g.id);
            return (
              <tbody key={g.id} className={tone.body}>
                <tr className="border-b border-line">
                  <th
                    colSpan={colCount}
                    scope="colgroup"
                    className={`border-l-4 px-4 py-2.5 text-left text-xs font-semibold ${tone.edge} ${tone.heading}`}
                  >
                    {g.tone === "gold" && <span aria-hidden>🏆 </span>}
                    {g.title} <span className="ml-1 font-normal tabular-nums text-dim">· {q ? `${g.rows.length} of ${total}` : total}</span>
                    {collapsible && (
                      <button
                        type="button"
                        onClick={() => toggle(g.id)}
                        aria-expanded={open}
                        className="ml-3 inline-flex min-h-8 items-center rounded-md border border-line-2 bg-panel px-2.5 text-[11px] font-medium text-muted hover:border-gold/60 hover:text-gold"
                      >
                        {open ? "Hide" : "Show"}
                      </button>
                    )}
                  </th>
                </tr>
                {!g.rows.length && (
                  <tr className="border-b border-line">
                    <td colSpan={colCount} className={`border-l-4 px-4 py-5 text-sm text-muted ${tone.edge}`}>
                      {g.empty}
                    </td>
                  </tr>
                )}
                {open &&
                  g.rows.map((s) => (
                    <tr key={s.alias} className={`border-b border-l-4 border-line last:border-b-0 ${tone.edge}`}>
                      {ranked && (
                        <td className={`px-4 py-3 tabular-nums ${g.tone === "gold" ? "font-bold text-gold-deep" : "text-dim"}`}>
                          {s.position ?? "—"}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={s.name} rank={s.position === 1 ? 1 : 0} />
                          <div className="min-w-0">
                            <div
                              className={`truncate ${
                                g.tone === "gold" ? "font-semibold text-gold-deep" : g.tone === "grey" ? "font-medium text-muted" : "font-medium text-fg"
                              }`}
                            >
                              {s.name}
                              {g.tone === "gold" && (
                                <span role="img" aria-label="top 10" className="ml-1.5">
                                  🏆
                                </span>
                              )}
                            </div>
                            <div className="truncate text-[11px] text-dim">
                              <span className="tabular-nums">{s.alias}</span> · {s.university}
                            </div>
                          </div>
                        </div>
                      </td>
                      {scoreLabel && (
                        <td
                          className={`px-4 py-3 text-right text-base tabular-nums ${
                            g.tone === "gold" ? "font-bold text-gold-deep" : g.tone === "grey" ? "text-dim" : "text-fg"
                          }`}
                        >
                          {s.score ?? "—"}
                        </td>
                      )}
                      {s.checks.map((c, i) => {
                        const col = columns[i];
                        // A target not reached yet but still on course: plain progress, no icon.
                        if (c.state === "open")
                          return (
                            <td key={col.label} className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-fg">
                              {c.value} <span className="text-dim">/ {col.of!.toLocaleString("en-US")}</span>
                              <span className="sr-only">so far</span>
                            </td>
                          );
                        return (
                          <td key={col.label} className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                            {c.state === "na" ? (
                              <span className="text-dim">
                                —<span className="sr-only">not checked yet, no alphas</span>
                              </span>
                            ) : (
                              <span className={`inline-flex items-center gap-1.5 ${c.state === "pass" ? "text-fg" : "text-rose"}`}>
                                {c.value}
                                {col.of !== undefined && <span className="text-dim">/ {col.of.toLocaleString("en-US")}</span>}
                                {c.state === "pass" ? <CheckCircle size={14} className="text-teal" /> : <XCircle size={14} />}
                                <span className="sr-only">{c.state === "pass" ? "meets the rule" : "does not meet the rule"}</span>
                              </span>
                            )}
                          </td>
                        );
                      })}
                      {hasLastWeek && (
                        <td className="whitespace-nowrap px-4 py-3 text-xs">
                          {s.lastWeek === "met" ? (
                            <span className="text-teal">Met</span>
                          ) : s.lastWeek === "missed" ? (
                            <span className="font-medium text-rose">Missed</span>
                          ) : (
                            <span className="text-dim">—</span>
                          )}
                        </td>
                      )}
                      <td className="px-4 py-3 text-xs leading-relaxed">
                        {s.flags.length > 0 && (
                          <div className={`font-semibold ${g.tone === "yellow" ? "text-amber" : "text-rose"}`}>{s.flags.join(" · ")}</div>
                        )}
                        {s.good ? (
                          <span className={`inline-flex whitespace-nowrap rounded-md border px-2 py-0.5 font-medium ${tone.pill}`}>
                            {s.needed}
                          </span>
                        ) : (
                          <span className={g.tone === "red" ? "text-fg" : tone.text}>{s.needed}</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            );
          })}
          {shown === 0 && q && (
            <tbody>
              <tr>
                <td colSpan={colCount} className="px-4 py-8 text-center text-sm text-muted">
                  No one matches “{query}”.
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
}
