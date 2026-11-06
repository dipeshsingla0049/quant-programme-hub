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
  MilestoneStage,
  Participant,
  RankingTab,
  RewardsProgramme,
} from "./types";

const bulletins: Bulletin[] = [
  {
    id: "b-4",
    tag: "Deadline",
    title: "Q4 Factor Formulation Dataset Cutoff for Global Sandbox Review",
    body: "All alphas for the Q4 review must be submitted on BRAIN before the cutoff. Late submissions roll into Q1.",
    publishedAt: "2026-11-05T10:00:00+05:30",
    author: "NST Quant Board",
  },
  {
    id: "b-3",
    tag: "Result",
    title: "October Alpha Cup Winners Announced: Top 10 Scholars Awarded Compute Credits",
    body: "Congratulations to the top 10. Credits will be applied to your BRAIN accounts within the week.",
    publishedAt: "2026-11-04T18:00:00+05:30",
    author: "WorldQuant BRAIN Team",
  },
  {
    id: "b-2",
    tag: "Announcement",
    title: "Annual Goa Quant Leadership Retreat 2027 Qualification Criteria Published",
    body: "Qualification is based on Grandmaster status and final leaderboard position. See the Rewards page for details.",
    publishedAt: "2026-11-03T12:00:00+05:30",
    author: "Dean of Research",
  },
  {
    id: "b-1",
    tag: "Announcement",
    title: "Programme Orientation Recording and Slides Now Available",
    body: "Missed orientation? The recording and slides are linked in the BRAIN Guide.",
    publishedAt: "2026-10-29T09:00:00+05:30",
    author: "NST Quant Board",
  },
];

const milestones: MilestoneStage[] = [
  {
    id: "enrolled",
    order: 1,
    name: "Enrolled",
    summary: "You're in the programme and set up on WorldQuant BRAIN.",
    requirement: "Register on BRAIN through the programme link and complete the onboarding module.",
    unlocks: "Access to programme workshops, the BRAIN Guide and the cohort community.",
    prestige: false,
  },
  {
    id: "first-alpha",
    order: 2,
    name: "First Alpha",
    summary: "Your first alpha has passed BRAIN's submission checks.",
    requirement: "Submit at least one alpha that passes all in-sample tests on BRAIN.",
    unlocks: "A place on the programme leaderboard and entry to monthly Alpha Cups.",
    prestige: false,
  },
  {
    id: "master",
    order: 3,
    name: "Master",
    summary: "A consistent, high-quality researcher across datasets.",
    requirement: "Reach Master level on BRAIN by sustained, low-correlation submissions.",
    unlocks: "Research Fellowship eligibility, 1:1 mentor sessions and priority event seats.",
    prestige: true,
  },
  {
    id: "grandmaster",
    order: 4,
    name: "Grandmaster",
    summary: "The programme's top tier.",
    requirement: "Reach Grandmaster level on BRAIN and finish in the programme's top ranks.",
    unlocks: "Qualification for the Goa Quant Leadership Retreat and fast-track researcher interviews.",
    prestige: true,
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
  stipends: {
    daily: { minUsd: 1, maxUsd: 60 },
    quarterly: { minUsd: 100, maxUsd: 25000 },
    minSubmissionDaysPerQuarter: 20,
  },
  tips: [
    {
      title: "Quality over overfitting",
      body: "An alpha tuned until it looks perfect in-sample usually falls apart out-of-sample. Keep ideas simple, check that they hold across periods and regions, and submit fewer, stronger alphas.",
    },
    {
      title: "Aim for Master and Grandmaster",
      body: "Higher BRAIN levels unlock higher payouts. Treat Master and Grandmaster as your targets and build a steady record of quality submissions to get there.",
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

/** Top participants by official report rank. */
export async function getLeaders(limit = 5): Promise<Participant[]> {
  return leaderboard.participants.slice(0, limit);
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

export async function getMilestones(): Promise<MilestoneStage[]> {
  return [...milestones].sort((a, b) => a.order - b.order);
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

/**
 * Rankings page tabs. Both use the same partnership-report leaderboard for
 * now; each tab has its own eligibility rules.
 */
export async function getRankingTabs(): Promise<RankingTab[]> {
  return [
    {
      id: "prod-corr",
      label: "Avg Production Correlation",
      title: currentMilestone.title,
      eligibility: currentMilestone.eligibility,
    },
    {
      id: "qcap",
      label: "QCAP $120",
      title: "QCAP $120",
      eligibility: [{ value: "≥ 20", label: "different days with a submission in the quarter" }],
    },
  ];
}

export async function getCurrentMilestone(): Promise<CurrentMilestone> {
  return currentMilestone;
}

export async function getRewardsProgramme(): Promise<RewardsProgramme> {
  return rewardsProgramme;
}

export async function getActivities(opts: { limit?: number } = {}): Promise<Activity[]> {
  const sorted = [...activities].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  return opts.limit ? sorted.slice(0, opts.limit) : sorted;
}
