/**
 * Applies the milestone rules (lib/milestones.ts) to the daily reports
 * (lib/reports.ts) and sorts everyone into coloured groups.
 *
 * Reports are cumulative from 7 Nov and stored under the last day they cover,
 * so totals and averages come straight from the newest report in a window.
 * Submission days are BRAIN's own SubmissionDays count (cumulative since
 * 7 Nov), so days in a window are the count at its end minus the count before
 * it. Reports without that column (before 10 Nov) fall back to an estimate
 * from comparing consecutive reports: when a report covers more than one day
 * (the first covered 7–8 Nov), each new alpha counts as one day, up to the
 * number of days covered.
 */
import { formatDay } from "./format";
import { MILESTONES, PROGRAMME_START, periodOf, rulesForPeriod, type MetricId, type Milestone, type MilestoneId, type Period, type Rule } from "./milestones";
import { lowCorrSnapshots, snapshots, twentyDaySnapshots, type Snapshot } from "./reports";
import type { ReportRow, UserTier } from "./types";

const DAY = 86_400_000;
export const addDays = (date: string, n: number) =>
  new Date(Date.parse(`${date}T00:00:00Z`) + n * DAY).toISOString().slice(0, 10);
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / DAY);

/** Reports from the programme start (earlier ones aren't cumulative from 7 Nov). */
const series = snapshots.filter((s) => s.date >= PROGRAMME_START);

/** Last day covered by the newest report, or null before the first one arrives. */
export const latestReportDate: string | null = series.at(-1)?.date ?? null;

/** Per researcher, estimated submission days, for reports without BRAIN's count. */
const submissionDates = new Map<string, string[]>();
series.forEach((s, i) => {
  const prev = series[i - 1];
  const from = prev ? addDays(prev.date, 1) : PROGRAMME_START;
  const covered = daysBetween(from, s.date) + 1;
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

/** Submission days from 7 Nov up to a date: BRAIN's count when the report has it, else the estimate. */
function daysUpTo(alias: string, date: string): number {
  const s = reportOn(date);
  if (!s) return 0;
  const brain = s.rows.get(alias)?.submissionDays;
  if (brain != null) return brain;
  return (submissionDates.get(alias) ?? []).filter((d) => d <= s.date).length;
}

export { periodOf, type Period } from "./milestones";

type Metrics = Record<MetricId, number | null>;

/**
 * Average of a per-alpha value over only the alphas submitted in a period.
 * BRAIN reports a mean over every alpha since 7 Nov, and old alphas' values
 * don't change between reports, so the period's mean is
 * (avg_now × alphas_now − avg_before × alphas_before) ÷ (alphas_now − alphas_before).
 * Null when no alpha was submitted in the period, or a value is missing.
 */
function periodAverage(
  now: ReportRow | undefined,
  before: ReportRow | undefined,
  key: "avgProdCorr" | "datafieldsPerAlpha" | "operatorsPerAlpha",
): number | null {
  const nNow = now?.submissions ?? 0;
  const nBefore = before?.submissions ?? 0;
  const added = nNow - nBefore;
  if (added <= 0) return null;
  const vNow = now?.[key] ?? null;
  const vBefore = nBefore ? (before?.[key] ?? null) : 0;
  if (vNow === null || vBefore === null) return null;
  let total = vNow * nNow - vBefore * nBefore;
  // BRAIN rounds averages to 4 decimals, so the total is off by up to 0.00005 per alpha (≈ 0.003 at 70
  // alphas): enough to show exactly 4 fields as 4.0025 and break the limit. Fields and operators are
  // whole numbers per alpha, so their total is a whole number: snap to it when the gap is within that
  // rounding (it isn't when BRAIN left an alpha out of the average; then keep the raw value).
  if (key !== "avgProdCorr" && Math.abs(total - Math.round(total)) <= 0.00005 * (nNow + nBefore) + 1e-9) total = Math.round(total);
  return Math.max(0, Math.round((total / added) * 1e4) / 1e4);
}

/**
 * `current` is the Baseline period to measure; by default the one `asOf` falls in.
 * With `periodLimits`, avg prod corr, fields and operators per alpha count only
 * the alphas submitted in that period (the Baseline); otherwise every alpha since 7 Nov.
 */
function metricsFor(alias: string, from: string, asOf: string, current?: Period, periodLimits = false): Metrics {
  const row = reportOn(asOf)?.rows.get(alias);
  const period = current ?? periodOf(asOf);
  const beforePeriod = reportOn(addDays(period.start, -1))?.rows.get(alias);
  const days = daysUpTo(alias, asOf);
  const simulations = row?.simulations ?? 0;
  return {
    submissions: row?.submissions ?? 0,
    simulations,
    submissionDays: Math.max(0, days - daysUpTo(alias, addDays(from, -1))),
    periodSubmissionDays: Math.max(0, days - daysUpTo(alias, addDays(period.start, -1))),
    periodSimulations: Math.max(0, simulations - (beforePeriod?.simulations ?? 0)),
    avgProdCorr: periodLimits ? periodAverage(row, beforePeriod, "avgProdCorr") : (row?.avgProdCorr ?? null),
    avgSelfCorr: row?.avgSelfCorr ?? null,
    operatorsPerAlpha: periodLimits ? periodAverage(row, beforePeriod, "operatorsPerAlpha") : (row?.operatorsPerAlpha ?? null),
    datafieldsPerAlpha: periodLimits ? periodAverage(row, beforePeriod, "datafieldsPerAlpha") : (row?.datafieldsPerAlpha ?? null),
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

/**
 * Pace with one day of grace: by day N of an L-day period you need what an
 * even pace gives by day N − 1, i.e. (N − 1)/L of the target (whole days
 * rounded down). Pass N − 1 as periodDay.
 */
export function paceFor(rule: Rule, periodDay: number, length: number): number {
  const pace = (rule.value * periodDay) / length;
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

export type Tone = "green" | "blue" | "yellow" | "red" | "gold" | "plain" | "grey";

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
  /** Baseline board from period 2: did they meet the previous period's baseline? */
  lastPeriod: "met" | "missed" | null;
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
  /** The programme period the standings fall in. */
  period: Period | null;
  /** Day of that period the data reaches, 0 (not started yet) to period.length. */
  periodDay: number | null;
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
    lastPeriod: null,
    ...fields,
  };
}

/** Metrics straight from one report row, for a board with its own report (no day-by-day history). */
function metricsFromRow(row: ReportRow): Metrics {
  return {
    submissions: row.submissions,
    simulations: row.simulations,
    submissionDays: row.submissionDays,
    periodSubmissionDays: null,
    periodSimulations: null,
    avgProdCorr: row.avgProdCorr,
    avgSelfCorr: row.avgSelfCorr,
    operatorsPerAlpha: row.operatorsPerAlpha,
    datafieldsPerAlpha: row.datafieldsPerAlpha,
  };
}

/**
 * A board's own report, if it has one: the Low-Corr Sprint reads data/low-corr
 * and the $120 Challenge reads data/20-day-challenge when they hold a report.
 * Baseline always uses the daily reports.
 */
function ownReport(id: MilestoneId): Snapshot | undefined {
  if (id === "low-corr-sprint") return lowCorrSnapshots.at(-1);
  if (id === "20-day-challenge") return twentyDaySnapshots.at(-1);
  return undefined;
}

export function getStandings(id: MilestoneId): MilestoneStandings {
  const milestone = MILESTONES.find((m) => m.id === id)!;
  const own = ownReport(id);
  const latest = own?.date ?? latestReportDate;
  const asOf =
    latest && latest >= milestone.start
      ? milestone.end && milestone.end < latest
        ? milestone.end
        : latest
      : null;
  const base = { milestone, asOf, final: false, groups: [], total: 0, cutoff: null, period: null, periodDay: null };
  if (!asOf) return base;

  // Baseline: once the data reaches a period's last day, that period is over. The board resets to the
  // next period (everyone starts from zero) and the finished one shows in the last-period column.
  const period = milestone.board === "weekly" && asOf === periodOf(asOf).end ? periodOf(addDays(asOf, 1)) : periodOf(asOf);
  /** Day of the period the data reaches; 0 when the period starts after the latest report. */
  const periodDay = Math.max(0, daysBetween(period.start, asOf) + 1);
  // Baseline targets depend on the period (period 1 had its own); other boards use theirs as is.
  const rules = rulesForPeriod(trackedRules(milestone), period);
  const everyone = own
    ? [...own.rows.values()].map((p) => {
        const m = metricsFromRow(p);
        return { p, m, a: assess(rules, m) };
      })
    : [...people.values()].map((p) => {
        const m = metricsFor(p.alias, milestone.start, asOf, period, milestone.board === "weekly");
        return { p, m, a: assess(rules, m) };
      });
  type Row = (typeof everyone)[number];
  const prize = milestone.reward.replace(" each", "");
  let groups: Group[];
  let cutoff: string | null = null;

  if (milestone.board === "weekly") {
    const left = period.length - periodDay;
    const prev = period.number > 1 ? addDays(period.start, -1) : null;
    const green: Row[] = [];
    const onTrack: Row[] = [];
    const atRisk: Row[] = [];
    const red: Row[] = [];
    const flags = new Map<Row, string[]>();
    const metLast = new Map<Row, boolean>();
    const prevRules = prev ? rulesForPeriod(trackedRules(milestone), periodOf(prev)) : rules;
    if (prev) for (const r of everyone) metLast.set(r, assess(prevRules, metricsFor(r.p.alias, milestone.start, prev, undefined, true)).done);
    /** Missing the previous period moves you one zone down this period: blue to yellow, yellow to red. */
    const missedFlag = prev ? `Missed period ${period.number - 1}` : "";
    for (const r of everyone) {
      if (r.a.done) {
        green.push(r);
        continue;
      }
      const missedLast = !!prev && metLast.get(r) === false;
      const progress = rules.filter((x) => x.op === ">=");
      const unreachable = progress.filter((x) => x.perDay && (r.m[x.metric] ?? 0) + left < x.value);
      const slow = progress.filter((x) => (r.m[x.metric] ?? 0) < paceFor(x, Math.max(0, periodDay - 1), period.length));
      for (const x of [...unreachable, ...slow]) r.a.checks[rules.indexOf(x)].state = "fail";
      const idle = progress.every((x) => !r.m[x.metric]);
      if (!left) {
        // The period is over: completed or missed.
        flags.set(r, [`Missed period ${period.number}`, ...r.a.brokenFlags]);
        red.push(r);
      } else if (unreachable.length || r.a.broken.length || (idle && slow.length)) {
        // Very behind or breaking a rule.
        flags.set(r, [
          ...(idle ? (periodDay ? ["No activity this period"] : []) : unreachable.map((x) => `Can't reach ${num(x.value)} ${x.unit} this period`)),
          ...r.a.brokenFlags,
          ...(missedLast ? [missedFlag] : []),
        ]);
        red.push(r);
      } else if (slow.length) {
        // Behind pace: yellow, or red if they also missed the previous period.
        flags.set(r, ["Behind pace", ...(missedLast ? [missedFlag] : [])]);
        (missedLast ? red : atRisk).push(r);
      } else if (missedLast) {
        // Keeping pace, but missed the previous period: yellow instead of blue.
        flags.set(r, [missedFlag]);
        atRisk.push(r);
      } else onTrack.push(r);
    }
    const bySims = (a: Row, b: Row) => (b.m.periodSimulations ?? 0) - (a.m.periodSimulations ?? 0) || byName(a, b);
    const byDays = (a: Row, b: Row) => (b.m.periodSubmissionDays ?? 0) - (a.m.periodSubmissionDays ?? 0) || bySims(a, b);
    const needed = (r: Row) =>
      r.a.done
        ? `Done for period ${period.number}`
        : sentence([r.a.needs && (left ? `needs ${r.a.needs} by ${formatDay(period.end)}` : `missed by ${r.a.needs}`), ...r.a.fixes]);
    const lastPeriod = (r: Row): Standing["lastPeriod"] => (prev ? (metLast.get(r) ? "met" : "missed") : null);
    const toStanding = (r: Row) =>
      standing(r.p, { checks: r.a.checks, needed: needed(r), good: r.a.done, flags: flags.get(r) ?? [], lastPeriod: lastPeriod(r) });
    groups = [
      {
        id: "green",
        title: `Completed period ${period.number}`,
        tone: "green",
        empty: "No one has completed this period yet.",
        rows: green.sort(bySims).map(toStanding),
      },
      { id: "ontrack", title: "On track", tone: "blue", rows: onTrack.sort(byDays).map(toStanding) },
      {
        id: "atrisk",
        title: prev ? `At risk · behind pace or missed period ${period.number - 1}` : "At risk · behind pace",
        tone: "yellow",
        rows: atRisk.sort(byDays).map(toStanding),
      },
      {
        id: "red",
        title: left ? "Very behind or breaking a rule" : `Missed period ${period.number}`,
        tone: "red",
        rows: red.sort(byDays).map(toStanding),
      },
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
      { id: "ontrack", title: "On track", tone: "blue", rows: yellow.sort(byDays).map(toStanding) },
      { id: "red", title: "Not eligible right now", tone: "red", rows: red.sort(byDays).map(toStanding) },
      { id: "not-started", title: "Not started", tone: "grey", rows: grey.sort(byName).map(toStanding) },
    ];
  } else {
    const ranking = milestone.ranking!;
    const dir = ranking.order === "asc" ? 1 : -1;
    const decimals = ranking.metric === "avgProdCorr" ? 4 : 0;
    const score = (r: Row) => r.m[ranking.metric];
    const byScore = (a: Row, b: Row) =>
      ((score(a) ?? Infinity) - (score(b) ?? Infinity)) * dir || (b.m.simulations ?? 0) - (a.m.simulations ?? 0) || byName(a, b);
    // Breaking a limit (more than 4 data fields or 8 operators) rules you out of the ranking: you can't win.
    const ruledOut = everyone.filter((r) => r.m.submissions && r.a.broken.length > 0);
    const canRank = (r: Row) => (r.m.submissions ?? 0) >= ranking.minAlphas && score(r) !== null && !r.a.broken.length;
    // Minimum alphas to win: everyone with them comes first, lowest score on top; then everyone else by score.
    const qualified = everyone.filter((r) => canRank(r) && (r.m.submissions ?? 0) >= ranking.winAlphas).sort(byScore);
    const belowMin = everyone.filter((r) => canRank(r) && (r.m.submissions ?? 0) < ranking.winAlphas).sort(byScore);
    const ranked = [...qualified, ...belowMin];
    const unranked = everyone.filter((r) => r.m.submissions && !ranked.includes(r) && !ruledOut.includes(r));
    const grey = everyone.filter((r) => !r.m.submissions);
    // Once the window's last day is in the data, the result is final: winners are named, everyone else is closed.
    const closed = !!milestone.end && asOf === milestone.end;
    const toMin = (r: Row) => {
      const n = ranking.winAlphas - (r.m.submissions ?? 0);
      return `${n} more ${n === 1 ? "alpha" : "alphas"} to reach the minimum of ${ranking.winAlphas}`;
    };
    const toRanked = (r: Row, i: number) => {
      const isQualified = i < qualified.length;
      const top = isQualified && i < ranking.winners;
      return standing(r.p, {
        position: i + 1,
        score: formatValue(score(r), decimals),
        checks: r.a.checks,
        good: r.a.done && top,
        needed: closed
          ? r.a.done && top
            ? `${prize} winner`
            : "Challenge closed"
          : !isQualified
            ? `${sentence([toMin(r), ...r.a.fixes])}. Can't win ${prize} until then`
          : r.a.done
            ? top
              ? `Potential ${prize} winner`
              : `Eligible, outside the top ${ranking.winners}`
            : `${sentence([r.a.needs && `complete ${r.a.needs}`, ...r.a.fixes])} to be eligible for ${prize}`,
      });
    };
    const rows = ranked.map(toRanked);
    const qualifiedRows = rows.slice(0, qualified.length);
    cutoff = qualifiedRows[ranking.winners - 1]?.score ?? qualifiedRows.at(-1)?.score ?? null;
    const plain = (r: Row, needed: string) => standing(r.p, { checks: r.a.checks, needed });
    groups = [
      {
        id: "top",
        title: `Top ${ranking.winners} · ${ranking.winAlphas}+ alphas · lowest avg prod corr`,
        tone: "gold",
        empty: `No one has ${ranking.winAlphas} alphas yet. Minimum ${ranking.winAlphas} alphas to win.`,
        rows: qualifiedRows.slice(0, ranking.winners),
      },
      {
        id: "rest",
        title: `${ranking.winAlphas}+ alphas · ranked ${ranking.winners + 1} and below`,
        tone: "plain",
        rows: qualifiedRows.slice(ranking.winners),
      },
      {
        id: "below-min",
        title: `Under ${ranking.winAlphas} alphas · can't win yet · lowest avg prod corr`,
        tone: "yellow",
        rows: rows.slice(qualified.length),
      },
      {
        id: "ruled-out",
        title: "Can't win right now · breaking a rule",
        tone: "red",
        rows: ruledOut.sort(byScore).map((r) => ({
          ...standing(r.p, {
            checks: r.a.checks,
            flags: r.a.brokenFlags,
            needed: closed ? "Challenge closed" : `${sentence(r.a.fixes)} to be ranked and win ${prize}`,
          }),
          score: formatValue(score(r), decimals),
        })),
      },
      {
        id: "not-ranked",
        title: "Not ranked yet",
        tone: "grey",
        rows: unranked
          .sort(byScore)
          .map((r) => ({
            ...plain(r, closed ? "Challenge closed" : score(r) === null ? "No production correlation in the report yet" : "Submit more alphas to be ranked"),
            score: formatValue(score(r), decimals),
          })),
      },
      {
        id: "not-started",
        title: "Not started",
        tone: "grey",
        rows: grey.sort(byName).map((r) => plain(r, closed ? "Challenge closed" : "Submit your first alpha to start")),
      },
    ];
  }

  return {
    ...base,
    final: !!milestone.end && asOf === milestone.end,
    groups,
    total: groups.reduce((n, g) => n + g.rows.length, 0),
    cutoff,
    period,
    periodDay,
  };
}

/** Number of people in one group. */
export const countOf = (s: MilestoneStandings, id: string) => s.groups.find((g) => g.id === id)?.rows.length ?? 0;
