# Quant Research Hub

Central platform for the Newton School of Technology × WorldQuant BRAIN quant programme:
the November milestones with daily standings, announcements, rewards and activities.

Built with Next.js 15 (App Router), React 19, TypeScript and Tailwind CSS v4. The site is static:
it changes only when a new daily report is imported and the site is rebuilt.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck
```

## Pages

| Route | What it shows |
| --- | --- |
| `/` | November milestones (cards and timeline), latest announcements, other opportunities |
| `/weekly-baseline` | **Baseline to Stay**: weekly minimum to keep your account (4 days, 1,500 simulations, ≤ 4 fields/alpha, avg prod corr < 0.8). Green completed this week, blue on track, yellow at risk, red very behind or breaking a rule |
| `/20-day-challenge` | **$120 Challenge**: submit on 20 different days by 31 Dec. Green eligible, blue on track, red not eligible right now, grey not started |
| `/low-corr-sprint` | **Low-Corr Sprint ($50 Challenge)**: 7–21 Nov. Everyone with 2+ alphas ranked by lowest avg prod corr, top 10 in gold; 10 alphas needed to be eligible for $50 |
| `/goa-trip`, `/master`, `/qrap-internship` | Sponsored Goa Trip, Master ($2,000), QRAP Internship. "To be unlocked" until criteria are added |
| `/activities` | Calendar grouped by month (`/activities/calendar.ics` is a subscribable feed) |
| `/announcements` | Full bulletin archive |

## Daily update

From 7 Nov 2026 the BRAIN partnership report is cumulative since 7 Nov. Import each day's report:

```bash
npm run import:report -- ~/Downloads/Newton_School_Partnership_Report_20261110.csv
npm run import:report -- "<Google Sheet 'Publish to web' CSV link>" 2026-11-09
```

A report is stored under the **last day its data covers**: BRAIN sends it the morning after, so
`…Report_20261110.csv` becomes `2026-11-09`. A date given as the second argument is used as is;
with no date in the file name it's yesterday (IST). Importing a day again replaces it. Then commit
`data/reports/` and redeploy.

- Only the columns the site needs are stored. **Email addresses and BRAIN user IDs are dropped.**
- To leave someone off the site, add their alias to `data/excluded.json` and re-import the
  latest report.
- `OperatorsPerAlpha` is optional (BRAIN dropped it on 9 Nov). The 8-operator rule is marked
  `tracked: false` in `lib/milestones.ts`, so it's listed in the criteria but not checked.
- Import every day. Submission days come from comparing consecutive reports. When a report covers
  more than one day (the first one covered 7–8 Nov), each new alpha counts as one day, up to the
  number of days covered.

## Changing the rules

Everything about the milestones (names, dates, rewards, thresholds, number of winners) is in
`lib/milestones.ts`. `lib/standings.ts` applies those rules to the reports and sorts everyone into
coloured groups; pages follow automatically.

| Board | Groups, in order |
| --- | --- |
| Baseline to Stay | green completed this week · blue on track (keeping pace with one day of grace: by day N, (N − 1)/7 of each target) · yellow at risk (behind pace, 4 days still reachable) · red very behind or breaking a rule (no activity, 4 days out of reach, or a limit broken) |
| $120 Challenge | green eligible · blue on track · red not eligible right now (a limit broken or 20 days out of reach) · grey not started |
| Low-Corr Sprint | gold top 10 of everyone with 2+ alphas and ≤ 4 fields/alpha · ranked 11 and below · red can't win (more than 4 fields/alpha, not ranked) · grey not ranked yet · grey not started |

Every row has a "What's needed" line.

## Project layout

```
app/                  routes (server components)
components/           UI. Client components: MilestoneBoard, WindowCountdown, TodayMarker,
                      Countdown, RelativeTime, SiteHeader
lib/milestones.ts     milestone config: windows, rewards, rules
lib/standings.ts      applies the rules to the daily reports
lib/reports.ts        parses data/reports into typed snapshots
lib/data.ts           announcements, opportunities, activities
lib/format.ts         date/number formatting, pinned to IST
data/reports/         one JSON per daily report + generated index.ts
scripts/import-report.mjs
app/globals.css       design tokens (colors, fonts)
```

## Sample content

Activities in `lib/data.ts` are still placeholder content. Replace them before launch.
