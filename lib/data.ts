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
  Reward,
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
  closesAt: "2026-11-08T00:00:00+05:30",
  actionLabel: "Simulate",
  actionHref: "https://platform.worldquantbrain.com",
};

const rewards: Reward[] = [
  {
    id: "goa",
    title: "The Annual Goa Quant Leadership Retreat 2027",
    badge: "Grandmaster & Top 3 Summit",
    period: "Q1 2027 Residency",
    description:
      "An all-expenses-paid 4-day residency in Goa with senior WorldQuant quantitative researchers, keynotes and industry leaders.",
    perks: ["Full travel & stay sponsored", "1:1 strategy advisories", "Fast-track researcher contracts"],
    featured: true,
  },
  {
    id: "fellowship",
    title: "Global Research Fellowship & Stipend",
    badge: "Master & above",
    period: "Per semester",
    description: "Paid research grants for high-Sharpe factor engineering, with a semester stipend and compute allocation.",
    perks: ["Semester stipend", "Extra compute allocation", "Faculty research supervisor"],
    featured: false,
  },
  {
    id: "alpha-cup",
    title: "Monthly Alpha Cup",
    badge: "All ranked participants",
    period: "Monthly",
    description: "Top 10 on the monthly leaderboard receive BRAIN compute credits and a feature in the bulletin.",
    perks: ["Compute credits", "Bulletin feature"],
    featured: false,
  },
];

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

/**
 * Participants per milestone, derived from the report where the report can
 * tell us. Master / Grandmaster aren't in the report yet, so they are null.
 */
export async function getStageCounts(): Promise<Record<MilestoneStage["id"], number | null>> {
  const ps = leaderboard.participants;
  return {
    enrolled: ps.length,
    "first-alpha": ps.filter((p) => p.totalSubmissions > 0).length,
    master: null,
    grandmaster: null,
  };
}

export async function getCurrentMilestone(): Promise<CurrentMilestone> {
  return currentMilestone;
}

export async function getRewards(): Promise<Reward[]> {
  return rewards;
}

export async function getActivities(opts: { limit?: number } = {}): Promise<Activity[]> {
  const sorted = [...activities].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  return opts.limit ? sorted.slice(0, opts.limit) : sorted;
}
