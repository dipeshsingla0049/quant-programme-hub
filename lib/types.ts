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

export interface CurrentMilestone {
  title: string;
  closesAt: string; // ISO 8601
  actionLabel: string;
  actionHref: string;
}

export interface Reward {
  id: string;
  title: string;
  badge: string;
  period: string;
  description: string;
  perks: string[];
  featured: boolean;
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
