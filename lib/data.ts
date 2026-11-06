/**
 * Data access layer.
 *
 * Every page reads through these async functions, so moving to a real backend
 * (Supabase, a CMS, or a BRAIN API sync job) means changing only this file.
 *
 * Milestone rules live in lib/milestones.ts and the standings are computed
 * from the daily reports by lib/standings.ts.
 *
 * Activities below are still SAMPLE DATA. Replace them with real programme content.
 */
import type { Activity, Bulletin, Opportunity, RewardsProgramme } from "./types";

const bulletins: Bulletin[] = [
  {
    id: "november-milestones",
    tag: "Announcement",
    title: "November milestones are here",
    body: "Three milestones start on 7 November. The Weekly Baseline is the minimum to keep your account. The 20-Day Challenge pays $120 for submitting on 20 different days by 31 December. The Low-Corr Sprint pays $50 each to the 10 researchers with the lowest average production correlation from 7 to 21 November. Standings update daily.",
    publishedAt: "2026-11-06T18:00:00+05:30",
    author: "Programme team",
    links: [
      { href: "/weekly-baseline", label: "Weekly Baseline" },
      { href: "/20-day-challenge", label: "20-Day Challenge" },
      { href: "/low-corr-sprint", label: "Low-Corr Sprint" },
    ],
  },
];

const rewardsProgramme: RewardsProgramme = {
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
