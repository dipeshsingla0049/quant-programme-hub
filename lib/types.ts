export type BulletinTag = "Deadline" | "Result" | "Announcement";
export type ActivityKind = "Workshop" | "Guest Session" | "Deadline" | "Contest";
export type TagKind = BulletinTag | ActivityKind | "Prestige";

export interface Bulletin {
  id: string;
  tag: BulletinTag;
  title: string;
  body: string;
  publishedAt: string; // ISO 8601
  author: string;
}

export type UserTier = "CONSULTANT" | "CONDITIONALCONSULTANT";

/** One row of the WorldQuant BRAIN partnership report. Null = no submitted alphas to average. */
export interface Participant {
  rank: number;
  alias: string;
  tier: UserTier;
  firstName: string;
  lastName: string;
  /** First + last name exactly as published. */
  name: string;
  university: string;
  totalSimulations: number;
  totalSubmissions: number;
  alphasByRegion: { usa: number; eur: number; asi: number; glb: number; other: number };
  avgProdCorr: number | null;
  avgSelfCorr: number | null;
  lowestProdCorr: number | null;
  highestProdCorr: number | null;
  avgSharpe: number | null;
  avgTurnover: number | null;
  avgReturns: number | null;
  avgDrawdown: number | null;
  avgMargin: number | null;
  totalOperatorsUsed: number;
  operatorsPerAlpha: number | null;
  totalDatafieldsUsed: number;
  datafieldsPerAlpha: number | null;
}

export interface LeaderboardReport {
  title: string;
  /** As printed by the source, e.g. "Nov 5, 2026, 5:23 PM". */
  updated: string;
  source: string;
  /** Column the source ranks by. */
  scoreLabel: string;
  participants: Participant[];
}

export interface MilestoneStage {
  id: "enrolled" | "first-alpha" | "master" | "grandmaster";
  order: number;
  name: string;
  summary: string;
  requirement: string;
  unlocks: string;
  prestige: boolean;
}

export interface EligibilityRule {
  /** Shown big, e.g. "≥ 1,500". */
  value: string;
  /** What the value counts, e.g. "simulations per week". */
  label: string;
}

/** One tab on the Rankings page: a leaderboard plus its eligibility rules. */
export interface RankingTab {
  /** Used in the URL: /rankings?tab=<id>. */
  id: string;
  label: string;
  title: string;
  eligibility: EligibilityRule[];
}

export interface CurrentMilestone {
  title: string;
  description: string;
  eligibility: EligibilityRule[];
  closesAt: string; // ISO 8601
  actionLabel: string;
  actionHref: string;
}

export interface Opportunity {
  /** Anchor on the Rewards page: /rewards#<id>. */
  id: "goa-trip" | "master" | "qrap-internship";
  title: string;
  summary: string;
  /** Empty until the programme team publishes the criteria. */
  criteria: string[];
  /** What meeting the criteria earns, e.g. "Eligible for a $2,000 quarterly stipend". */
  reward?: string;
}

export interface RewardsProgramme {
  milestoneIncentive: { perResearcherUsd: number; winners: number };
  opportunities: Opportunity[];
  stipends: {
    daily: { minUsd: number; maxUsd: number };
    quarterly: { minUsd: number; maxUsd: number };
    minSubmissionDaysPerQuarter: number;
  };
  tips: { title: string; body: string }[];
}

export type LocationType = "venue" | "virtual" | "portal";

export interface Activity {
  id: string;
  kind: ActivityKind;
  title: string;
  description: string;
  startsAt: string; // ISO 8601
  durationMinutes: number;
  location: string;
  locationType: LocationType;
}
