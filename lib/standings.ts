/**
 * Applies the milestone rules (lib/milestones.ts) to the daily reports
 * (lib/reports.ts) and sorts everyone into coloured groups.
 *
 * Reports are cumulative from 7 Nov and stored under the last day they cover,
 * so totals and averages come straight from the newest report in a window.
 * Submission days come from comparing consecutive reports. When a report
 * covers more than one day (the first report covered 7–8 Nov), each new alpha
 * counts as one day, up to the number of days covered: 2+ alphas = 2 days,
 * 1 alpha = 1 day, none = 0.
 */
import { formatDay } from "./format";
import { MILESTONES, PROGRAMME_START, type MetricId, type Milestone, type MilestoneId, type Rule } from "./milestones";
import { snapshots, type Snapshot } from "./reports";
import type { ReportRow, UserTier } from "./types";

const DAY = 86_400_000;
export const addDays = (date: string, n: number) =>
  new Date(Date.parse(`${date}T00:00:00Z`) + n * DAY).toISOString().slice(0, 10);
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / DAY);

/** Reports from the programme start (earlier ones aren't cumulative from 7 Nov). */
const series = snapshots.filter((s) => s.date >= PROGRAMME_START);

/** Last day covered by the newest report, or null before the first one arrives. */
export const latestReportDate: string | null = series.at(-1)?.date ?? null;

/** Reports that covered more than one day, so submission days in them are estimated. */
export const mergedReports: { from: string; to: string }[] = [];

/** Per researcher, the days counted as submission days. */
const submissionDates = new Map<string, string[]>();
series.forEach((s, i) => {
  const prev = series[i - 1];
  const from = prev ? addDays(prev.date, 1) : PROGRAMME_START;
  const covered = daysBetween(from, s.date) + 1;
  if (covered > 1) mergedReports.push({ from, to: s.date });
  for (const [alias, row] of s.rows) {
    const added = row.submissions - (prev?.rows.get(alias)?.submissions ?? 0);
    if (added <= 0) continue;
    const list = submissionDates.get(alias) ?? [];
    // Each new alpha is at most one day; credit the latest days in the span.
    for (let k = 0; k < Math.min(added, covered); k++) list.push(addDays(s.date, -k));
    submissionDates.set(alias, list.sort());
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

/** Programme weeks run 7 days at a time (Saturday to Friday) from the programme start. */
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

const OP = { ">=": "≥", "<=": "≤", "<": "<" } as const;
/** The opposite of a limit, for "Avg prod corr ≥ 0.8". */
const BROKEN = { ">=": "<", "<=": ">", "<": "≥" } as const;
const num = (v: number) => formatValue(v, v % 1 ? 1 : 0);

export function ruleTarget(rule: Rule): string {
  return `${OP[rule.op]} ${num(rule.value)}`;
}

/** Weekly pace: by day N of the week, N/7 of the target (whole days rounded down). */
export function paceFor(rule: Rule, weekDay: number): number {
  const pace = (rule.value * weekDay) / 7;
  return rule.perDay ? Math.floor(pace) : Math.round(pace);
}

/** Rules the site can check. Others are listed in the criteria only. */
export const trackedRules = (m: Milestone) => m.rules.filter((r) => r.tracked !== false);

export interface Check {
  value: string;
  /**
   * open: a target not reached yet but still on course. fail: a broken limit,
   * or a target that's behind pace or out of reach. na: a limit with nothing
   * to check yet (no alphas).
   */
  state: "pass" | "fail" | "open" | "na";
}

export type Tone = "green" | "yellow" | "red" | "gold" | "plain" | "grey";

export interface Standing {
  alias: string;
  name: string;
  university: string;
  tier: UserTier;
  /** Place in the ranking (ranked boards only). */
  position: number | null;
  /** The ranking metric, formatted (ranked boards only). */
  score: string | null;
  /** One per tracked rule, in rule order. */
  checks: Check[];
  /** Short reasons for a red row, e.g. "Behind pace". */
  flags: string[];
  /** What's needed, in one line. */
  needed: string;
  /** The needed line is good news (completed, eligible, potential winner). */
  good: boolean;
  /** Weekly boards from week 2: did they meet last week's baseline? */
  lastWeek: "met" | "missed" | null;
}

export interface Group {
  id: string;
  title: string;
  tone: Tone;
  /** Shown when the group has no one. Groups without it are hidden when empty. */
  empty?: string;
  rows: Standing[];
}

export interface MilestoneStandings {
  milestone: Milestone;
  /** Last day of data the standings use; null before the first report. */
  asOf: string | null;
  /** The window has closed and its last day is in the data. */
  final: boolean;
  groups: Group[];
  /** Everyone on the board. */
  total: number;
  /** Ranking value of the last highlighted place (ranked boards). */
  cutoff: string | null;
  /** The programme week the standings fall in. */
  week: Week | null;
  /** Day of that week the data reaches, 1–7. */
  weekDay: number | null;
}

/** Where one researcher stands against the tracked rules. */
function assess(rules: Rule[], m: Metrics) {
  const checks: Check[] = rules.map((r) => {
    const v = m[r.metric];
    const value = formatValue(r.op === ">=" ? (v ?? 0) : v, r.decimals);
    if (r.op === ">=") return { value, state: (v ?? 0) >= r.value ? "pass" : "open" };
    if (v === null) return { value, state: "na" };
    return { value, state: (r.op === "<=" ? v <= r.value : v < r.value) ? "pass" : "fail" };
  });
  const missing = rules
    .filter((r) => r.op === ">=")
    .map((r) => ({ rule: r, need: r.value - (m[r.metric] ?? 0) }))
    .filter((x) => x.need > 0);
  const broken = rules.filter((r, i) => r.op !== ">=" && checks[i].state === "fail");
  return {
    checks,
    missing,
    broken,
    done: missing.length === 0 && broken.length === 0,
    /** "3 more days and 1,071 more simulations" */
    needs: missing.map((x) => `${formatValue(x.need)} more ${x.rule.unit ?? x.rule.short.toLowerCase()}`).join(" and "),
    fixes: broken.map((r) => r.fix ?? `${r.short.toLowerCase()} must be ${ruleTarget(r)}`),
    brokenFlags: broken.map((r) => `${r.short} ${BROKEN[r.op]} ${num(r.value)}`),
  };
}

const sentence = (parts: string[]) => {
  const s = parts.filter(Boolean).join(" · ");
  return s.charAt(0).toUpperCase() + s.slice(1);
};
const byName = (a: { p: ReportRow }, b: { p: ReportRow }) => a.p.name.localeCompare(b.p.name);

function standing(p: ReportRow, fields: Partial<Standing> & Pick<Standing, "checks" | "needed">): Standing {
  return {
    alias: p.alias,
    name: p.name,
    university: p.university,
    tier: p.tier,
    position: null,
    score: null,
    flags: [],
    good: false,
    lastWeek: null,
    ...fields,
  };
}

export function getStandings(id: MilestoneId): MilestoneStandings {
  const milestone = MILESTONES.find((m) => m.id === id)!;
  const asOf =
    latestReportDate && latestReportDate >= milestone.start
      ? milestone.end && milestone.end < latestReportDate
        ? milestone.end
        : latestReportDate
      : null;
  const base = { milestone, asOf, final: false, groups: [], total: 0, cutoff: null, week: null, weekDay: null };
  if (!asOf) return base;

  const rules = trackedRules(milestone);
  const everyone = [...people.values()].map((p) => {
    const m = metricsFor(p.alias, milestone.start, asOf);
    return { p, m, a: assess(rules, m) };
  });
  type Row = (typeof everyone)[number];
  const week = weekOf(asOf);
  const weekDay = daysBetween(week.start, asOf) + 1;
  const prize = milestone.reward.replace(" each", "");
  let groups: Group[];
  let cutoff: string | null = null;

  if (milestone.board === "weekly") {
    const left = 7 - weekDay;
    const prev = week.number > 1 ? addDays(week.start, -1) : null;
    const green: Row[] = [];
    const yellow: Row[] = [];
    const red: Row[] = [];
    const flags = new Map<Row, string[]>();
    for (const r of everyone) {
      if (r.a.done) {
        green.push(r);
        continue;
      }
      const progress = rules.filter((x) => x.op === ">=");
      const unreachable = progress.filter((x) => x.perDay && (r.m[x.metric] ?? 0) + left < x.value);
      const slow = progress.filter((x) => (r.m[x.metric] ?? 0) < paceFor(x, weekDay));
      const behind = slow.length > 0;
      for (const x of [...unreachable, ...slow]) r.a.checks[rules.indexOf(x)].state = "fail";
      const idle = progress.every((x) => !r.m[x.metric]);
      const f = idle
        ? ["No activity this week"]
        : [
            ...unreachable.map((x) => `Can't reach ${num(x.value)} ${x.unit} this week`),
            ...(behind && !unreachable.length ? ["Behind pace"] : []),
            ...r.a.brokenFlags,
          ];
      if (f.length) {
        flags.set(r, f);
        red.push(r);
      } else yellow.push(r);
    }
    const bySims = (a: Row, b: Row) => (b.m.weekSimulations ?? 0) - (a.m.weekSimulations ?? 0) || byName(a, b);
    const byDays = (a: Row, b: Row) => (b.m.weekSubmissionDays ?? 0) - (a.m.weekSubmissionDays ?? 0) || bySims(a, b);
    const needed = (r: Row) =>
      r.a.done
        ? `Done for week ${week.number}`
        : sentence([r.a.needs && (left ? `needs ${r.a.needs} by ${formatDay(week.end)}` : `missed by ${r.a.needs}`), ...r.a.fixes]);
    const lastWeek = (r: Row): Standing["lastWeek"] =>
      prev ? (assess(rules, metricsFor(r.p.alias, milestone.start, prev)).done ? "met" : "missed") : null;
    const toStanding = (r: Row) =>
      standing(r.p, { checks: r.a.checks, needed: needed(r), good: r.a.done, flags: flags.get(r) ?? [], lastWeek: lastWeek(r) });
    groups = [
      {
        id: "green",
        title: `Completed week ${week.number}`,
        tone: "green",
        empty: "No one has completed this week yet.",
        rows: green.sort(bySims).map(toStanding),
      },
      { id: "yellow", title: "On track", tone: "yellow", rows: yellow.sort(byDays).map(toStanding) },
      { id: "red", title: "At risk of removal", tone: "red", rows: red.sort(byDays).map(toStanding) },
    ];
  } else if (milestone.board === "target") {
    const left = milestone.end ? Math.max(0, daysBetween(asOf, milestone.end)) : Infinity;
    const green: Row[] = [];
    const yellow: Row[] = [];
    const red: Row[] = [];
    const grey: Row[] = [];
    const flags = new Map<Row, string[]>();
    for (const r of everyone) {
      if (!r.m.submissions) grey.push(r);
      else if (r.a.done) green.push(r);
      else {
        const unreachable = rules.filter((x) => x.op === ">=" && x.perDay && (r.m[x.metric] ?? 0) + left < x.value);
        for (const x of unreachable) r.a.checks[rules.indexOf(x)].state = "fail";
        const f = [
          ...unreachable.map((x) => `Can't reach ${num(x.value)} ${x.unit} by ${formatDay(milestone.end!)}`),
          ...r.a.brokenFlags,
        ];
        if (f.length) {
          flags.set(r, f);
          red.push(r);
        } else yellow.push(r);
      }
    }
    const byDays = (a: Row, b: Row) =>
      (b.m.submissionDays ?? 0) - (a.m.submissionDays ?? 0) || (b.m.simulations ?? 0) - (a.m.simulations ?? 0) || byName(a, b);
    const needed = (r: Row) =>
      !r.m.submissions
        ? "Submit your first alpha to start"
        : r.a.done
          ? `Eligible for ${prize}`
          : `${sentence([r.a.needs && `needs ${r.a.needs}`, ...r.a.fixes])} to be eligible for ${prize}`;
    const toStanding = (r: Row) =>
      standing(r.p, { checks: r.a.checks, needed: needed(r), good: r.a.done, flags: flags.get(r) ?? [] });
    groups = [
      {
        id: "green",
        title: `Eligible for ${prize}`,
        tone: "green",
        empty: "No one is eligible yet.",
        rows: green.sort(byDays).map(toStanding),
      },
      { id: "yellow", title: "On track", tone: "yellow", rows: yellow.sort(byDays).map(toStanding) },
      { id: "red", title: "Not eligible right now", tone: "red", rows: red.sort(byDays).map(toStanding) },
      { id: "not-started", title: "Not started", tone: "grey", rows: grey.sort(byName).map(toStanding) },
    ];
  } else {
    const ranking = milestone.ranking!;
    const dir = ranking.order === "asc" ? 1 : -1;
    const decimals = ranking.metric === "avgProdCorr" ? 4 : 0;
    const score = (r: Row) => r.m[ranking.metric];
    const ranked = everyone
      .filter((r) => (r.m.submissions ?? 0) >= ranking.minAlphas && score(r) !== null)
      .sort((a, b) => (score(a)! - score(b)!) * dir || (b.m.simulations ?? 0) - (a.m.simulations ?? 0) || byName(a, b));
    const unranked = everyone.filter((r) => r.m.submissions && !ranked.includes(r));
    const grey = everyone.filter((r) => !r.m.submissions);
    const toRanked = (r: Row, i: number) => {
      const top = i < ranking.winners;
      return standing(r.p, {
        position: i + 1,
        score: formatValue(score(r), decimals),
        checks: r.a.checks,
        good: r.a.done && top,
        needed: r.a.done
          ? top
            ? `Potential ${prize} winner`
            : `Eligible, outside the top ${ranking.winners}`
          : `${sentence([r.a.needs && `complete ${r.a.needs}`, ...r.a.fixes])} to be eligible for ${prize}`,
      });
    };
    const rows = ranked.map(toRanked);
    cutoff = rows[ranking.winners - 1]?.score ?? rows.at(-1)?.score ?? null;
    const plain = (r: Row, needed: string) => standing(r.p, { checks: r.a.checks, needed });
    groups = [
      {
        id: "top",
        title: `Top ${ranking.winners} · lowest avg prod corr`,
        tone: "gold",
        empty: `No one has ${ranking.minAlphas} alphas yet.`,
        rows: rows.slice(0, ranking.winners),
      },
      { id: "rest", title: `Ranked ${ranking.winners + 1} and below`, tone: "plain", rows: rows.slice(ranking.winners) },
      {
        id: "not-ranked",
        title: "Not ranked yet",
        tone: "grey",
        rows: unranked
          .sort((a, b) => ((score(a) ?? Infinity) - (score(b) ?? Infinity)) * dir || byName(a, b))
          .map((r) => ({
            ...plain(r, score(r) === null ? "No production correlation in the report yet" : "Submit more alphas to be ranked"),
            score: formatValue(score(r), decimals),
          })),
      },
      {
        id: "not-started",
        title: "Not started",
        tone: "grey",
        rows: grey.sort(byName).map((r) => plain(r, "Submit your first alpha to start")),
      },
    ];
  }

  return {
    ...base,
    final: !!milestone.end && asOf === milestone.end,
    groups,
    total: groups.reduce((n, g) => n + g.rows.length, 0),
    cutoff,
    week,
    weekDay,
  };
}

/** Number of people in one group. */
export const countOf = (s: MilestoneStandings, id: string) => s.groups.find((g) => g.id === id)?.rows.length ?? 0;
