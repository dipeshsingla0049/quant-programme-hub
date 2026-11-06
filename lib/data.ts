/**
 * Data access layer.
 *
 * Every page reads through these async functions, so moving to a real backend
 * (Supabase, a CMS, or a BRAIN API sync job) means changing only this file.
 *
 * Rankings come from the real WorldQuant BRAIN partnership report in
 * data/leaderboard (see lib/leaderboard.ts).
 *
 * Everything else below (bulletins, milestones, rewards, activities) is
 * SAMPLE DATA. Replace it with real programme content.
 */
import { leaderboard } from "./leaderboard";
import type {
  Activity,
  Bulletin,
  CurrentMilestone,
  LeaderboardReport,
  Opportunity,
  Participant,
  RewardsProgramme,
} from "./types";

const bulletins: Bulletin[] = [
  {
    id: "avg-prod-corr-leaderboard-updated",
    tag: "Announcement",
    title: "Average Production Correlation leaderboard updated",
    body: `The leaderboard now reflects the latest partnership report (${leaderboard.updated}). See where you stand, then check the milestone's eligibility criteria before the window closes.`,
    publishedAt: "2026-11-06T11:53:00+05:30",
    author: "Programme team",
    links: [
      { href: "/avg-prod-corr", label: "View milestone" },
      { href: "/avg-prod-corr#leaderboard", label: "View leaderboard" },
    ],
  },
];

const currentMilestone: CurrentMilestone = {
  title: "Minimum Average Production Correlation",
  description:
    "Production correlation measures how similar your alphas are to ones already in BRAIN production. Lower is better: it means your ideas are new. This milestone rewards the lowest average production correlation across your submitted alphas.",
  eligibility: [
    { value: "≥ 1,500", label: "alphas simulated per week" },
    { value: "≥ 4", label: "different days with a submission each week" },
    { value: "≤ 3", label: "average data fields used per alpha" },
    { value: "≤ 8", label: "operators used per alpha" },
  ],
  closesAt: "2026-11-08T00:00:00+05:30",
  actionLabel: "Simulate",
  actionHref: "https://platform.worldquantbrain.com",
};

const rewardsProgramme: RewardsProgramme = {
  milestoneIncentive: { perResearcherUsd: 50, winners: 10 },
  // TODO(programme team): fill in each criteria list; the UI shows
  // "Criteria coming soon" while a list is empty.
  opportunities: [
    {
      id: "goa-trip",
      title: "Goa Trip",
      summary: "A trip to Goa for the programme's top performers.",
      criteria: [],
    },
    {
      id: "master",
      title: "Master Criteria",
      summary: "What it takes to reach Master level on BRAIN and unlock higher payouts. All within one quarter.",
      criteria: [
        {
          heading: "Required",
          items: [
            { label: "Submit at least 120 alphas", mandatory: true },
            { label: "Complete 30 pyramids", mandatory: true },
          ],
        },
        {
          heading: "Combined performance",
          note: "Only one of these four needs to meet the base criteria of ≥ 1.",
          items: [
            { label: "Combined Alpha Performance" },
            { label: "Combined Selected Alpha Performance" },
            { label: "Combined Power Pool Alpha Performance" },
            { label: "Combined Osmosis Performance" },
          ],
        },
      ],
      reward: "Eligible for a $2,000 quarterly stipend",
    },
    {
      id: "qrap-internship",
      title: "QRAP Internship",
      summary: "An internship opportunity for leading researchers.",
      criteria: [],
    },
  ],
};

const activities: Activity[] = [
  {
    id: "a1",
    kind: "Workshop",
    title: "High-Frequency Factor Construction Using Tick Data",
    description: "Hands-on session on building and testing intraday factors.",
    startsAt: "2026-11-16T17:00:00+05:30",
    durationMinutes: 120,
    location: "Lab 402 & Webcast",
    locationType: "venue",
  },
  {
    id: "a2",
    kind: "Guest Session",
    title: "Fireside Chat with a Senior Quant Researcher",
    description: "Career paths in quantitative research, with open Q&A.",
    startsAt: "2026-11-19T19:30:00+05:30",
    durationMinutes: 60,
    location: "Virtual BRAIN Lounge",
    locationType: "virtual",
  },
  {
    id: "a3",
    kind: "Deadline",
    title: "Bi-Weekly Alpha Benchmark Submission Cycle #14",
    description: "Submit your alphas on BRAIN before the cycle closes.",
    startsAt: "2026-11-22T23:59:00+05:30",
    durationMinutes: 1,
    location: "WorldQuant Portal",
    locationType: "portal",
  },
  {
    id: "a4",
    kind: "Contest",
    title: "Newton 48-Hour Quantathon: Cross-Asset Statistical Arbitrage",
    description: "Team contest over 48 hours. Prizes for the top three teams.",
    startsAt: "2026-11-28T10:00:00+05:30",
    durationMinutes: 2880,
    location: "Main Innovation Arena",
    locationType: "venue",
  },
  {
    id: "a5",
    kind: "Workshop",
    title: "Reducing Self-Correlation: Diversifying Your Alpha Pool",
    description: "Techniques for keeping production correlation low.",
    startsAt: "2026-12-03T17:00:00+05:30",
    durationMinutes: 90,
    location: "Lab 402 & Webcast",
    locationType: "venue",
  },
];

export async function getBulletins(limit?: number): Promise<Bulletin[]> {
  const sorted = [...bulletins].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return limit ? sorted.slice(0, limit) : sorted;
}

export async function getLeaderboard(): Promise<LeaderboardReport> {
  return leaderboard;
}

export async function getParticipants(): Promise<Participant[]> {
  return leaderboard.participants;
}

export async function getUniversities(): Promise<string[]> {
  return [...new Set(leaderboard.participants.map((p) => p.university))].sort();
}

export interface LeaderboardStats {
  participants: number;
  active: number;
  totalSimulations: number;
  totalSubmissions: number;
  consultants: number;
}

export async function getLeaderboardStats(): Promise<LeaderboardStats> {
  const ps = leaderboard.participants;
  return {
    participants: ps.length,
    active: ps.filter((p) => p.totalSimulations > 0).length,
    totalSimulations: ps.reduce((n, p) => n + p.totalSimulations, 0),
    totalSubmissions: ps.reduce((n, p) => n + p.totalSubmissions, 0),
    consultants: ps.filter((p) => p.tier === "CONSULTANT").length,
  };
}

/** Minimum submitted alphas for an average to count toward the current milestone. */
export const PROD_CORR_MIN_SUBMISSIONS = 3;

/**
 * Standings for the current milestone: lowest average production correlation.
 * A value of exactly 0 means the report had no correlation for those alphas,
 * so it's left out rather than counted as a perfect score.
 */
export async function getProdCorrStandings(limit = 5): Promise<{
  leaders: Participant[];
  eligible: number;
  programmeAverage: number | null;
}> {
  const eligible = leaderboard.participants.filter(
    (p) => p.totalSubmissions >= PROD_CORR_MIN_SUBMISSIONS && p.avgProdCorr !== null && p.avgProdCorr > 0,
  );
  const sorted = [...eligible].sort((a, b) => a.avgProdCorr! - b.avgProdCorr! || a.rank - b.rank);
  const programmeAverage = eligible.length
    ? eligible.reduce((n, p) => n + p.avgProdCorr!, 0) / eligible.length
    : null;
  return { leaders: sorted.slice(0, limit), eligible: eligible.length, programmeAverage };
}

export async function getCurrentMilestone(): Promise<CurrentMilestone> {
  return currentMilestone;
}

export async function getRewardsProgramme(): Promise<RewardsProgramme> {
  return rewardsProgramme;
}

export async function getOpportunity(id: Opportunity["id"]): Promise<Opportunity | undefined> {
  return rewardsProgramme.opportunities.find((o) => o.id === id);
}

export async function getActivities(opts: { limit?: number } = {}): Promise<Activity[]> {
  const sorted = [...activities].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  return opts.limit ? sorted.slice(0, opts.limit) : sorted;
}
