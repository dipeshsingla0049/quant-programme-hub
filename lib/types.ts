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
  /** Pages the announcement points to, shown as buttons. */
  links?: { href: string; label: string }[];
}

export type UserTier = "CONSULTANT" | "CONDITIONALCONSULTANT";

/** One researcher in one daily partnership report. Totals are cumulative since 7 Nov 2026. */
export interface ReportRow {
  alias: string;
  tier: UserTier;
  /** First + last name as published. */
  name: string;
  university: string;
  simulations: number;
  submissions: number;
  /** Null when there are no submitted alphas to average. */
  avgProdCorr: number | null;
  avgSelfCorr: number | null;
  operatorsPerAlpha: number | null;
  datafieldsPerAlpha: number | null;
  /** BRAIN's count of days with a submission since 7 Nov. Null in reports before 10 Nov. */
  submissionDays: number | null;
}

export interface EligibilityRule {
  /** Shown big, e.g. "≥ 1,500". */
  value: string;
  /** What the value counts, e.g. "simulations per week". */
  label: string;
  /** Small print under the label, e.g. how the report measures it. */
  note?: string;
}

export interface CriteriaItem {
  label: string;
  /** Shows a "Mandatory" tag. */
  mandatory?: boolean;
  /** Shows a weightage tag, e.g. "40%". */
  weight?: string;
}

/** A set of criteria, e.g. "Mandatory" or "Combined performance (any one ≥ 1)". */
export interface CriteriaGroup {
  heading: string;
  /** Explains how the group is met, e.g. "At least one of these four must be ≥ 1." */
  note?: string;
  items: CriteriaItem[];
}

export interface Opportunity {
  /** Also the page route: /<id>. */
  id: "goa-trip" | "qrap-elective";
  title: string;
  summary: string;
  /** Empty until the programme team publishes the criteria. */
  criteria: CriteriaGroup[];
  /** What meeting the criteria earns, e.g. "$2,000 to $8,000". */
  reward?: string;
  /** A boxed note under the criteria, e.g. what first-year students get instead. */
  notice?: { heading: string; body: string };
}

export interface RewardsProgramme {
  opportunities: Opportunity[];
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
