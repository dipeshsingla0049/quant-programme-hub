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
| `/weekly-baseline` | **Baseline to Stay**: weekly minimum to keep your account. Everyone listed, green if cleared this week, red if not |
| `/20-day-challenge` | **$120 Challenge**: submit on 20 different days by 31 Dec. Leaderboard with progress and limits |
| `/low-corr-sprint` | **Low-Corr Sprint ($50 Challenge)**: 7–21 Nov, top 10 lowest avg prod corr are potential $50 winners |
| `/goa-trip`, `/master`, `/qrap-internship` | Sponsored Goa Trip, Master ($2,000), QRAP Internship. "To be unlocked" until criteria are added |
| `/activities` | Calendar grouped by month (`/activities/calendar.ics` is a subscribable feed) |
| `/announcements` | Full bulletin archive |

## Daily update

From 7 Nov 2026 the BRAIN partnership report is cumulative since 7 Nov. Import each day's report:

```bash
npm run import:report -- ~/Downloads/Newton_School_Partnership_Report_20261107.csv
npm run import:report -- "<Google Sheet 'Publish to web' CSV link>" 2026-11-08
```

The date comes from the second argument, else the `YYYYMMDD` in the file name, else today (IST).
Importing a date again replaces it. Then commit `data/reports/` and redeploy.

- Only the columns the site needs are stored. **Email addresses and BRAIN user IDs are dropped.**
- Import every day. Submission days are worked out by comparing consecutive reports, so a
  missing day merges two days into one. Missing dates are listed on the milestone pages.

## Changing the rules

Everything about the milestones (names, dates, rewards, thresholds, number of winners) is in
`lib/milestones.ts`. `lib/standings.ts` applies those rules to the reports; pages follow automatically.

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
