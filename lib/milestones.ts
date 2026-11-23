/**
 * The November milestones: names, windows, rewards and the rules the
 * leaderboards apply. Change a threshold here and every page follows.
 * Dates are calendar days in IST, inclusive.
 */

/** Daily reports are cumulative from this day. Baseline periods are counted from it too. */
export const PROGRAMME_START = "2026-11-07";

/**
 * Baseline to Stay is checked per period. The first period runs 7–21 Nov
 * (alongside the Low-Corr Sprint); after that every period is 14 days:
 * 22 Nov–5 Dec, 6–19 Dec, and so on.
 */
export const FIRST_PERIOD_END = "2026-11-21";
export const PERIOD_DAYS = 14;

export interface Period {
  number: number;
  start: string;
  end: string;
  /** Days in the period, start and end included. */
  length: number;
}

const DAY_MS = 86_400_000;
const shift = (date: string, n: number) => new Date(Date.parse(`${date}T00:00:00Z`) + n * DAY_MS).toISOString().slice(0, 10);
const gap = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / DAY_MS);

/** The Baseline period a calendar day (YYYY-MM-DD, IST) falls in. */
export function periodOf(date: string): Period {
  if (date <= FIRST_PERIOD_END) {
    return { number: 1, start: PROGRAMME_START, end: FIRST_PERIOD_END, length: gap(PROGRAMME_START, FIRST_PERIOD_END) + 1 };
  }
  const n = Math.floor(gap(shift(FIRST_PERIOD_END, 1), date) / PERIOD_DAYS);
  const start = shift(FIRST_PERIOD_END, 1 + n * PERIOD_DAYS);
  return { number: n + 2, start, end: shift(start, PERIOD_DAYS - 1), length: PERIOD_DAYS };
}

/** What a rule can measure for one researcher. See lib/standings.ts. */
export type MetricId =
  | "submissions"
  | "simulations"
  | "submissionDays"
  | "periodSubmissionDays"
  | "periodSimulations"
  | "avgProdCorr"
  | "avgSelfCorr"
  | "operatorsPerAlpha"
  | "datafieldsPerAlpha";

export interface Rule {
  metric: MetricId;
  op: ">=" | "<=" | "<";
  value: number;
  /** What the value counts, on the criteria card. */
  label: string;
  /** Short name in leaderboards, e.g. "Fields/alpha". */
  short: string;
  /** Used in "needs 3 more days". */
  unit?: string;
  /** Decimals for showing a researcher's value. */
  decimals?: number;
  note?: string;
  /** What to fix when a limit is broken, e.g. "avg prod corr must be below 0.8". */
  fix?: string;
  /** Counts calendar days, so at most one more per day left in the window. */
  perDay?: boolean;
  /** false: listed in the criteria but not checked on the site (no data for it). */
  tracked?: boolean;
}

export type MilestoneId = "weekly-baseline" | "20-day-challenge" | "low-corr-sprint";

export interface Milestone {
  /** Also the page route: /<id>. */
  id: MilestoneId;
  name: string;
  /** Label in the site navigation. */
  navLabel: string;
  /** Small tag next to the name, e.g. "Important". */
  badge?: { text: string; tone: "rose" | "gold" };
  /** One line: what you have to do. */
  goal: string;
  summary: string;
  start: string;
  /** Last day, inclusive. Null = ongoing. */
  end: string | null;
  /** Big reward line, e.g. "$50 each". */
  reward: string;
  rewardDetail: string;
  /** What happens if you miss it. */
  stakes?: string;
  /** All must be met to qualify. */
  rules: Rule[];
  ranking?: {
    metric: MetricId;
    order: "asc" | "desc";
    /** Places highlighted as potential winners. */
    winners: number;
    /** Alphas needed to appear in the ranking (eligibility for the reward is a rule). */
    minAlphas: number;
    /**
     * Alphas needed to win. Everyone with this many is ranked above everyone
     * without, whatever their score.
     */
    winAlphas: number;
  };
  /**
   * weekly: everyone, per Baseline period: green (completed) / blue (on track) / yellow (at risk) / red.
   * target: green (eligible) / yellow (on track) / red (not eligible) / grey (not started).
   * ranked: everyone with minAlphas ranked, top places gold, then grey groups.
   */
  board: "weekly" | "target" | "ranked";
}

const AVERAGE_NOTE =
  "The report gives an average per alpha, so the site checks your average. One alpha over the limit still breaks the rule: check each alpha on BRAIN.";

const maxFields: Rule = {
  metric: "datafieldsPerAlpha",
  op: "<=",
  value: 4,
  label: "data fields in any alpha",
  short: "Fields/alpha",
  decimals: 2,
  note: AVERAGE_NOTE,
  fix: "data fields must be 4 or fewer",
};

const maxOperators: Rule = {
  metric: "operatorsPerAlpha",
  op: "<=",
  value: 8,
  label: "operators in any alpha",
  short: "Operators/alpha",
  decimals: 2,
  note: AVERAGE_NOTE,
  fix: "operators must be 8 or fewer",
};

export const MILESTONES: Milestone[] = [
  {
    id: "weekly-baseline",
    name: "Baseline to Stay",
    navLabel: "Baseline to Stay",
    badge: { text: "Important", tone: "rose" },
    goal: "Meet the minimum every two weeks, including average production correlation below 0.8, or your account is banned.",
    summary:
      "The minimum every researcher must meet each two-week period, checked individually within each of the four teams: 7 submission days, 2,500 simulations, at most 4 data fields and 8 operators per alpha, and average production correlation below 0.8. The first period runs 7 to 21 November, then every 14 days: 22 November to 5 December, and so on.",
    start: PROGRAMME_START,
    end: null,
    reward: "Keep your account",
    rewardDetail: "Don't get banned",
    stakes: "Accounts that miss the baseline will be banned. The team mentor's decision is final.",
    rules: [
      {
        metric: "periodSubmissionDays",
        op: ">=",
        value: 7,
        label: "days with a submission each period",
        short: "Days",
        unit: "days",
        perDay: true,
      },
      {
        metric: "periodSimulations",
        op: ">=",
        value: 2500,
        label: "simulations each period",
        short: "Simulations",
        unit: "simulations",
      },
      {
        metric: "avgProdCorr",
        op: "<",
        value: 0.8,
        label: "average production correlation",
        short: "Avg prod corr",
        decimals: 3,
        fix: "avg prod corr must be below 0.8",
        note: "Across the alphas you submit in the current period only. Checked once you've submitted an alpha this period.",
      },
      { ...maxFields, note: `Only alphas submitted in the current period count. ${AVERAGE_NOTE}` },
      { ...maxOperators, note: `Only alphas submitted in the current period count. ${AVERAGE_NOTE}` },
    ],
    board: "weekly",
  },
  {
    id: "20-day-challenge",
    name: "$120 Challenge",
    navLabel: "$120 Challenge",
    goal: "Submit on 20 different days by 31 December.",
    summary:
      "A long-term test of consistency. Submit alphas on 20 different days between 7 November and 31 December, keep every alpha simple, and keep your alphas different from each other.",
    start: "2026-11-07",
    end: "2026-12-31",
    reward: "$120",
    rewardDetail: "for completing the challenge",
    rules: [
      {
        metric: "submissionDays",
        op: ">=",
        value: 20,
        label: "different days with a submission",
        short: "Days",
        unit: "days",
        perDay: true,
        note: "The days don't need to be in a row.",
      },
      maxFields,
      maxOperators,
      {
        metric: "avgSelfCorr",
        op: "<",
        value: 0.7,
        label: "average self-correlation",
        short: "Self-corr",
        decimals: 3,
        fix: "self-corr must be below 0.7",
      },
    ],
    board: "target",
  },
  {
    id: "low-corr-sprint",
    name: "Low-Corr Sprint",
    navLabel: "Low-Corr Sprint ($50)",
    badge: { text: "$50 Challenge", tone: "gold" },
    goal: "Minimum 10 alphas to win. Lowest average production correlation among them takes the top 10.",
    summary:
      "A two-period sprint for original ideas. Minimum 10 alphas to win: submit at least 10 alphas between 7 and 21 November, within the data field and operator limits. Among researchers with 10 or more alphas, the 10 with the lowest average production correlation win.",
    start: "2026-11-07",
    end: "2026-11-21",
    reward: "$50 each",
    rewardDetail: "for the top 10",
    rules: [
      {
        metric: "submissions",
        op: ">=",
        value: 10,
        label: "alphas submitted from 7 Nov",
        short: "Alphas",
        unit: "alphas",
        note: "Minimum 10 alphas to win. Everyone with 10 or more is ranked first, lowest avg prod corr on top. Researchers with 2 to 9 alphas are listed below them and can't win until they reach 10.",
      },
      maxFields,
      maxOperators,
    ],
    ranking: { metric: "avgProdCorr", order: "asc", winners: 10, minAlphas: 2, winAlphas: 10 },
    board: "ranked",
  },
];

export function getMilestone(id: MilestoneId): Milestone {
  const m = MILESTONES.find((x) => x.id === id);
  if (!m) throw new Error(`Unknown milestone ${id}`);
  return m;
}
