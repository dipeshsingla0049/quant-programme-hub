"use client";

import { useMemo, useState } from "react";
import { formatDayRange } from "@/lib/format";
import type { BaselineRecord, WeekResult } from "@/lib/standings";
import { CheckCircle, XCircle } from "./icons";

export interface LookupRule {
  label: string;
  target: string;
  /** For ≥ rules: show "2 / 4". */
  of?: number;
}

function WeekStatus({ week }: { week: WeekResult }) {
  const [text, tone] = week.pass
    ? [week.complete ? "Met" : "Met so far", "border-teal/40 bg-teal/10 text-teal"]
    : week.complete
      ? ["Missed", "border-rose/40 bg-rose/10 text-rose"]
      : ["Not met yet", "border-gold/40 bg-gold/10 text-gold"];
  return <span className={`inline-flex whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium ${tone}`}>{text}</span>;
}

/** Researchers look up their own Weekly Baseline status; there's no public list of names. */
export function BaselineLookup({ records, rules }: { records: BaselineRecord[]; rules: LookupRule[] }) {
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return records.filter((r) => r.alias.toLowerCase() === q || r.name.toLowerCase().includes(q) || r.alias.toLowerCase().startsWith(q)).slice(0, 5);
  }, [records, query]);

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-2 block text-sm text-muted">Enter your BRAIN alias or name</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. AB12345"
          className="min-h-11 w-full rounded-lg border border-line-2 bg-panel px-4 text-sm text-fg placeholder:text-dim focus:border-gold/60 focus:outline-none sm:max-w-md"
        />
      </label>

      {query.trim().length >= 2 && matches.length === 0 && (
        <p className="text-sm text-muted">No researcher matches “{query}”.</p>
      )}

      {matches.map((r) => {
        const [current, ...earlier] = r.weeks;
        return (
          <article key={r.alias} className="rounded-xl border border-line bg-panel/60 p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-fg">{r.name}</h3>
                <p className="text-xs text-dim">
                  <span className="tabular-nums">{r.alias}</span> · {r.university}
                </p>
              </div>
              {current && <WeekStatus week={current} />}
            </div>

            {current && (
              <>
                <p className="mt-4 text-xs text-muted">
                  Week {current.number} · {formatDayRange(current.start, current.end)}
                  {!current.complete && " · so far"}
                </p>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {current.checks.map((c) => {
                    const rule = rules[c.rule];
                    return (
                      <li
                        key={c.rule}
                        className={`rounded-lg border p-4 ${c.pass ? "border-line-2 bg-ink/60" : "border-rose/30 bg-rose/[0.04]"}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-muted">{rule.label}</span>
                          {c.pass ? <CheckCircle size={16} className="text-teal" /> : <XCircle size={16} className="text-rose" />}
                        </div>
                        <p className={`mt-2 text-2xl tabular-nums ${c.pass ? "text-fg" : "text-rose"}`}>
                          {c.value}
                          {rule.of !== undefined && <span className="text-base text-dim"> / {rule.of.toLocaleString("en-US")}</span>}
                        </p>
                        <p className="mt-1 text-[11px] text-dim">{c.pass ? `Needs ${rule.target}` : c.gap}</p>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            {earlier.length > 0 && (
              <div className="mt-5 border-t border-line pt-4">
                <p className="mb-2 text-xs text-muted">Earlier weeks</p>
                <ul className="space-y-2">
                  {earlier.map((w) => (
                    <li key={w.number} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="text-fg">
                        Week {w.number} <span className="text-dim">· {formatDayRange(w.start, w.end)}</span>
                      </span>
                      <span className="flex items-center gap-3">
                        {!w.pass && (
                          <span className="text-xs text-muted">
                            {w.checks
                              .filter((c) => !c.pass)
                              .map((c) => c.gap)
                              .join(" · ")}
                          </span>
                        )}
                        <WeekStatus week={w} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
