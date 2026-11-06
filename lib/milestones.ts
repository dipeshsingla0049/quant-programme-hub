/**
 * The November milestones: names, windows, rewards and the rules the
 * leaderboards apply. Change a threshold here and every page follows.
 * Dates are calendar days in IST, inclusive.
 */

/** Daily reports are cumulative from this day. Weeks are counted from it too. */
export const PROGRAMME_START = "2026-11-07";

/** What a rule can measure for one researcher. See lib/standings.ts. */
export type MetricId =
  | "submissions"
  | "simulations"
  | "submissionDays"
  | "weekSubmissionDays"
  | "weekSimulations"
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
    /** Rewarded places. Omit when everyone who qualifies is rewarded. */
    winners?: number;
  };
  /**
   * prize: ranked leaderboard with the rewarded places highlighted.
   * passFail: everyone listed, green if they've cleared every rule, red if not.
   */
  board: "prize" | "passFail";
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
};

const maxOperators: Rule = {
  metric: "operatorsPerAlpha",
  op: "<=",
  value: 8,
  label: "operators in any alpha",
  short: "Operators/alpha",
  decimals: 2,
  note: AVERAGE_NOTE,
};

export const MILESTONES: Milestone[] = [
  {
    id: "weekly-baseline",
    name: "Baseline to Stay",
    navLabel: "Baseline to Stay",
    badge: { text: "Important", tone: "rose" },
    goal: "Meet the minimum every week, or your account is banned.",
    summary:
      "The minimum every researcher must meet each week, checked individually within each of the four teams. Weeks run Saturday to Friday, starting 7 November.",
    start: PROGRAMME_START,
    end: null,
    reward: "Keep your account",
    rewardDetail: "Don't get banned",
    stakes: "Accounts that miss the baseline will be banned. The team mentor's decision is final.",
    rules: [
      {
        metric: "weekSubmissionDays",
        op: ">=",
        value: 4,
        label: "days with a submission each week",
        short: "Days",
        unit: "days",
      },
      {
        metric: "weekSimulations",
        op: ">=",
        value: 1500,
        label: "simulations each week",
        short: "Simulations",
        unit: "simulations",
      },
      maxFields,
      maxOperators,
    ],
    board: "passFail",
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
      },
    ],
    ranking: { metric: "submissionDays", order: "desc" },
    board: "prize",
  },
  {
    id: "low-corr-sprint",
    name: "Low-Corr Sprint",
    navLabel: "Low-Corr Sprint ($50)",
    badge: { text: "$50 Challenge", tone: "gold" },
    goal: "Lowest average production correlation, with at least 10 alphas.",
    summary:
      "A two-week sprint for original ideas. Submit at least 10 alphas between 7 and 21 November, within the data field and operator limits. The 10 researchers with the lowest average production correlation win.",
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
        short: "Submissions",
        unit: "submissions",
      },
      maxFields,
      maxOperators,
    ],
    ranking: { metric: "avgProdCorr", order: "asc", winners: 10 },
    board: "prize",
  },
];

export function getMilestone(id: MilestoneId): Milestone {
  const m = MILESTONES.find((x) => x.id === id);
  if (!m) throw new Error(`Unknown milestone ${id}`);
  return m;
}
