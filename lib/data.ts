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
    id: "operators-and-days",
    tag: "Announcement",
    title: "Leaderboards now check operators per alpha and use BRAIN's submission days",
    body: "Every milestone needs 8 or fewer operators per alpha, and the leaderboards now check it: over 8 turns your row red on Baseline to Stay and the $120 Challenge, and moves you out of the Low-Corr Sprint ranking until it's fixed. Submission days now come straight from BRAIN's report instead of being estimated, so your day count matches BRAIN exactly.",
    publishedAt: "2026-11-10T12:00:00+05:30",
    author: "Programme team",
    links: [
      { href: "/weekly-baseline", label: "Baseline to Stay" },
      { href: "/low-corr-sprint", label: "Low-Corr Sprint" },
    ],
  },
  {
    id: "baseline-prod-corr",
    tag: "Announcement",
    title: "Baseline to Stay: average production correlation must be below 0.8",
    body: "Baseline to Stay now also needs your average production correlation below 0.8, on top of 4 submission days and 1,500 simulations a week with at most 4 data fields per alpha. The Baseline leaderboard is colour-coded: green has completed this week, blue is on track, yellow is at risk (behind pace), red is very behind or breaking a rule. Find your name and see exactly what you still need.",
    publishedAt: "2026-11-09T12:00:00+05:30",
    author: "Programme team",
    links: [{ href: "/weekly-baseline", label: "Baseline to Stay" }],
  },
  {
    id: "november-milestones",
    tag: "Announcement",
    title: "November milestones are here",
    body: "Three milestones start on 7 November. Baseline to Stay is the weekly minimum to keep your account (4 submission days, 1,500 simulations, average production correlation below 0.8): miss it and you get banned. The $120 Challenge pays $120 for submitting on 20 different days by 31 December. The Low-Corr Sprint ($50 Challenge) pays $50 each to the 10 researchers with the lowest average production correlation from 7 to 21 November. Standings update daily.",
    publishedAt: "2026-11-06T18:00:00+05:30",
    author: "Programme team",
    links: [
      { href: "/weekly-baseline", label: "Baseline to Stay" },
      { href: "/20-day-challenge", label: "$120 Challenge" },
      { href: "/low-corr-sprint", label: "Low-Corr Sprint" },
    ],
  },
];

const rewardsProgramme: RewardsProgramme = {
  // The UI shows "To be unlocked" while a criteria list is empty.
  opportunities: [
    {
      id: "qrap-elective",
      title: "QRAP Internship Elective",
      summary:
        "Top 40 students from NST-RU and top 30 from NST-ADYPU (2nd and 3rd year) will be chosen for this elective-based internship next semester.",
      criteria: [
        {
          heading: "Who's chosen",
          items: [
            { label: "Top 40 students from NST-RU (2nd and 3rd year)" },
            { label: "Top 30 students from NST-ADYPU (2nd and 3rd year)" },
          ],
        },
        {
          heading: "How you're selected",
          items: [
            { label: "QCAP performance", weight: "40%" },
            { label: "Test (in December)", weight: "40%" },
            { label: "Interview", weight: "20%" },
          ],
        },
      ],
      reward: "$2,000 to $8,000",
      notice: {
        heading: "First-year students",
        body: "A separate Audit programme will launch next semester, aimed at reaching Master and Grandmaster levels on WorldQuant BRAIN.",
      },
    },
    {
      id: "goa-trip",
      title: "Sponsored Goa Trip",
      summary: "A sponsored trip to Goa for the programme's top performers.",
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
