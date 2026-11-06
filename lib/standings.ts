/**
 * Applies the milestone rules (lib/milestones.ts) to the daily reports
 * (lib/reports.ts).
 *
 * Reports are cumulative from 7 Nov, so totals and averages come straight from
 * the latest report in a milestone's window. Submission days come from
 * comparing consecutive reports: if your submission count went up since the
 * previous report, you submitted on that report's date. A missing report merges
 * two days into one, so missing dates are listed on the pages.
 */
import { MILESTONES, PROGRAMME_START, type MetricId, type Milestone, type MilestoneId, type Rule } from "./milestones";
import { snapshots, type Snapshot } from "./reports";
import type { ReportRow, UserTier } from "./types";

const DAY = 86_400_000;
export const addDays = (date: string, n: number) =>
  new Date(Date.parse(`${date}T00:00:00Z`) + n * DAY).toISOString().slice(0, 10);
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / DAY);

/** Reports from the programme start (earlier ones aren't cumulative from 7 Nov). */
const series = snapshots.filter((s) => s.date >= PROGRAMME_START);

/** Date of the newest report, or null before the first one arrives. */
export const latestReportDate: string | null = series.at(-1)?.date ?? null;

/** Days between the programme start and the newest report that have no report. */
export const missingReportDates: string[] = (() => {
  if (!latestReportDate) return [];
  const have = new Set(series.map((s) => s.date));
  const out: string[] = [];
  for (let d = PROGRAMME_START; d <= latestReportDate; d = addDays(d, 1)) if (!have.has(d)) out.push(d);
  return out;
})();

/** Per researcher, the report dates on which their submission count went up. */
const submissionDates = new Map<string, string[]>();
series.forEach((s, i) => {
  const prev = series[i - 1];
  for (const [alias, row] of s.rows) {
    const before = prev?.rows.get(alias)?.submissions ?? 0;
    if (row.submissions > before) {
      const list = submissionDates.get(alias) ?? [];
      list.push(s.date);
      submissionDates.set(alias, list);
    }
  }
});

/** Everyone in any report, with their details from the newest report they appear in. */
const people = new Map<string, ReportRow>();
for (const s of series) for (const [alias, row] of s.rows) people.set(alias, row);

/** The newest report on or before a date. */
function reportOn(date: string): Snapshot | undefined {
  for (let i = series.length - 1; i >= 0; i--) if (series[i].date <= date) return series[i];
  return undefined;
}

export interface Week {
  number: number;
  start: string;
  end: string;
}

/** Programme weeks run 7 days at a time from the programme start. */
export function weekOf(date: string): Week {
  const n = Math.max(0, Math.floor(daysBetween(PROGRAMME_START, date) / 7));
  const start = addDays(PROGRAMME_START, 7 * n);
  return { number: n + 1, start, end: addDays(start, 6) };
}

type Metrics = Record<MetricId, number | null>;

function metricsFor(alias: string, from: string, asOf: string): Metrics {
  const row = reportOn(asOf)?.rows.get(alias);
  const week = weekOf(asOf);
  const beforeWeek = reportOn(addDays(week.start, -1))?.rows.get(alias);
  const dates = submissionDates.get(alias) ?? [];
  const simulations = row?.simulations ?? 0;
  return {
    submissions: row?.submissions ?? 0,
    simulations,
    submissionDays: dates.filter((d) => d >= from && d <= asOf).length,
    weekSubmissionDays: dates.filter((d) => d >= week.start && d <= asOf).length,
    weekSimulations: Math.max(0, simulations - (beforeWeek?.simulations ?? 0)),
    avgProdCorr: row?.avgProdCorr ?? null,
    avgSelfCorr: row?.avgSelfCorr ?? null,
    operatorsPerAlpha: row?.operatorsPerAlpha ?? null,
    datafieldsPerAlpha: row?.datafieldsPerAlpha ?? null,
  };
}

export function formatValue(v: number | null, decimals = 0): string {
  if (v === null) return "—";
  return v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function ruleTarget(rule: Rule): string {
  const op = rule.op === ">=" ? "≥" : rule.op === "<=" ? "≤" : "<";
  return `${op} ${formatValue(rule.value, rule.value % 1 ? 1 : 0)}`;
}

export interface Check {
  /** Index into the milestone's rules. */
  rule: number;
  value: string;
  pass: boolean;
  /** What's wrong, e.g. "needs 3 more days". Empty when passing. */
  gap: string;
}

function check(rule: Rule, index: number, m: Metrics): Check {
  const v = m[rule.metric];
  const value = formatValue(v, rule.decimals);
  if (rule.op === ">=") {
    const have = v ?? 0;
    const pass = have >= rule.value;
    return { rule: index, value, pass, gap: pass ? "" : `needs ${formatValue(rule.value - have)} more ${rule.unit ?? ""}`.trim() };
  }
  if (v === null) return { rule: index, value, pass: false, gap: "no alphas submitted yet" };
  const pass = rule.op === "<=" ? v <= rule.value : v < rule.value;
  return { rule: index, value, pass, gap: pass ? "" : `${rule.short.toLowerCase()} must be ${ruleTarget(rule)}` };
}

export type Zone = "prize" | "qualified" | "pending";

export interface Standing {
  alias: string;
  name: string;
  university: string;
  tier: UserTier;
  /** Place among qualified researchers; null if not qualified. */
  position: number | null;
  zone: Zone;
  /** The ranking metric, formatted. */
  score: string;
  submissions: number;
  checks: Check[];
}

export interface MilestoneStandings {
  milestone: Milestone;
  /** Report date the standings are based on; null before the first report. */
  asOf: string | null;
  /** Final: the window has closed and the last report in it is in. */
  final: boolean;
  /** Researchers with at least one submission in the window, best first. */
  standings: Standing[];
  /** Researchers in the reports who haven't submitted in the window. */
  notStarted: number;
  prize: number;
  qualified: number;
  /** Ranking value of the last place in the prize zone. */
  cutoff: string | null;
}

const ZONE_ORDER: Record<Zone, number> = { prize: 0, qualified: 1, pending: 2 };

export function getStandings(id: MilestoneId): MilestoneStandings {
  const milestone = MILESTONES.find((m) => m.id === id)!;
  const asOf =
    latestReportDate && latestReportDate >= milestone.start
      ? milestone.end && milestone.end < latestReportDate
        ? milestone.end
        : latestReportDate
      : null;
  const empty = { milestone, asOf, final: false, standings: [], notStarted: people.size, prize: 0, qualified: 0, cutoff: null };
  if (!asOf) return empty;

  const ranking = milestone.ranking;
  const dir = ranking?.order === "asc" ? 1 : -1;
  const rankDecimals = milestone.rules.find((r) => r.metric === ranking?.metric)?.decimals ?? (ranking?.metric === "avgProdCorr" ? 4 : 0);

  const rows = [...people.values()].map((p) => {
    const m = metricsFor(p.alias, milestone.start, asOf);
    const checks = milestone.rules.map((r, i) => check(r, i, m));
    const score = ranking ? m[ranking.metric] : null;
    // Ranked milestones need a ranking value to qualify (no avg prod corr = nothing to rank).
    const qualified = checks.every((c) => c.pass) && (!ranking || score !== null);
    return { p, m, checks, score, qualified };
  });

  const active = rows.filter((r) => (r.m.submissions ?? 0) > 0);
  active.sort((a, b) => {
    if (a.qualified !== b.qualified) return a.qualified ? -1 : 1;
    if (a.score !== b.score) {
      if (a.score === null) return 1;
      if (b.score === null) return -1;
      return (a.score - b.score) * dir;
    }
    // Tie-break: more simulations first, then name.
    return (b.m.simulations ?? 0) - (a.m.simulations ?? 0) || a.p.name.localeCompare(b.p.name);
  });

  let place = 0;
  const standings: Standing[] = active.map((r) => {
    const position = r.qualified ? ++place : null;
    const winners = ranking?.winners;
    const zone: Zone = !r.qualified ? "pending" : winners === undefined || position! <= winners ? "prize" : "qualified";
    return {
      alias: r.p.alias,
      name: r.p.name,
      university: r.p.university,
      tier: r.p.tier,
      position,
      zone,
      score: formatValue(r.score, rankDecimals),
      submissions: r.m.submissions ?? 0,
      checks: r.checks,
    };
  });
  standings.sort((a, b) => ZONE_ORDER[a.zone] - ZONE_ORDER[b.zone]);

  const prizeRows = standings.filter((s) => s.zone === "prize");
  return {
    milestone,
    asOf,
    final: !!milestone.end && asOf === milestone.end,
    standings,
    notStarted: people.size - active.length,
    prize: prizeRows.length,
    qualified: standings.filter((s) => s.zone !== "pending").length,
    cutoff: ranking?.winners && prizeRows.length ? prizeRows.at(-1)!.score : null,
  };
}

export interface WeekResult extends Week {
  /** The week's last day has a report. */
  complete: boolean;
  checks: Check[];
  pass: boolean;
}

export interface BaselineRecord {
  alias: string;
  name: string;
  university: string;
  tier: UserTier;
  /** Newest week first. */
  weeks: WeekResult[];
}

/** Every researcher's Weekly Baseline result for each week so far. */
export function getBaselineRecords(): { asOf: string | null; records: BaselineRecord[]; thisWeek: Week | null } {
  const milestone = MILESTONES.find((m) => m.id === "weekly-baseline")!;
  if (!latestReportDate) return { asOf: null, records: [], thisWeek: null };
  const latest = latestReportDate;

  const weeks: Week[] = [];
  for (let w = weekOf(PROGRAMME_START); w.start <= latest; w = weekOf(addDays(w.end, 1))) weeks.unshift(w);

  const records = [...people.values()]
    .map((p) => ({
      alias: p.alias,
      name: p.name,
      university: p.university,
      tier: p.tier,
      weeks: weeks.map((w) => {
        const asOf = w.end < latest ? w.end : latest;
        const checks = milestone.rules.map((r, i) => check(r, i, metricsFor(p.alias, w.start, asOf)));
        return { ...w, complete: w.end <= latest, checks, pass: checks.every((c) => c.pass) };
      }),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return { asOf: latest, records, thisWeek: weeks[0] ?? null };
}
