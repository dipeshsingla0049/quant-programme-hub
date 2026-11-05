# Quant Research Hub

Central platform for the Newton School of Technology × WorldQuant BRAIN quant programme:
announcements, rankings, milestones, rewards and activities.

Built with Next.js 15 (App Router), React 19, TypeScript and Tailwind CSS v4.

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
| `/` | Hero, current milestone countdown, latest bulletins, top 5, rewards, upcoming activities |
| `/rankings` | Real BRAIN report: podium, search, sort, university/tier filters, pagination |
| `/milestones` | Enrolled → First Alpha → Master → Grandmaster timeline, cohort counts |
| `/rewards` | Goa retreat and other top-performer opportunities |
| `/activities` | Calendar grouped by month |
| `/activities/calendar.ics` | Subscribable iCal feed generated from the same data |
| `/announcements` | Full bulletin archive |

## Project layout

```
app/            routes (server components)
components/     UI pieces; only Countdown, RelativeTime, RankingsBoard, SiteHeader are client components
lib/types.ts    data model
lib/data.ts     data access layer — the ONLY place content comes from
lib/leaderboard.ts  parses the BRAIN report into typed participants
data/leaderboard/   raw reports; index.ts picks the current one
scripts/        import-leaderboard.mjs
lib/format.ts   date/score formatting, pinned to IST so server and client match
app/globals.css design tokens (colors, fonts)
```

## Rankings data

Rankings come from the real WorldQuant BRAIN partnership report
(https://competition-leaderboard-site.vercel.app/), stored as-is in `data/leaderboard/<date>.json`
and parsed by `lib/leaderboard.ts`. Official rank = total simulations; ties share a rank.

To pull a newer report:

```bash
npm run import:leaderboard              # default source URL
npm run import:leaderboard -- <url>     # another report URL
```

It saves a new dated file and points `data/leaderboard/index.ts` at it. Older reports stay in the folder.

## Sample content

Bulletins, milestone criteria, rewards and activities in `lib/data.ts` are still placeholder
content. Replace them with real programme information before launch.

## Next steps

1. **Backend:** swap the bodies of the functions in `lib/data.ts` for Supabase queries.
   Tables map 1:1 to `lib/types.ts` (bulletins, participants, milestones, rewards, activities).
2. **Admin:** a protected `/admin` route so coordinators can post bulletins and events.
3. **Rankings sync:** a scheduled job that pulls scores from the BRAIN API (or a CSV upload)
   into the `participants` table.
4. **Auth:** student sign-in to show a personal dashboard (rank, progress to next milestone).
