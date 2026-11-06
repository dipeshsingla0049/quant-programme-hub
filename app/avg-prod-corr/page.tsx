import type { Metadata } from "next";
import { Avatar } from "@/components/Avatar";
import { Countdown } from "@/components/Countdown";
import { EligibilityCriteria } from "@/components/EligibilityCriteria";
import { ArrowRight } from "@/components/icons";
import { PageHeader } from "@/components/PageHeader";
import { RankingsBoard } from "@/components/RankingsBoard";
import {
  PROD_CORR_MIN_SUBMISSIONS,
  getCurrentMilestone,
  getLeaderboard,
  getLeaderboardStats,
  getProdCorrStandings,
  getUniversities,
} from "@/lib/data";
import { formatEventStamp, formatInt, formatMetric } from "@/lib/format";

export const metadata: Metadata = { title: "Avg Prod Corr" };

/** Everything about the Minimum Average Production Correlation milestone, on one page. */
export default async function AvgProdCorrPage() {
  const [milestone, standings, report, stats, universities] = await Promise.all([
    getCurrentMilestone(),
    getProdCorrStandings(5),
    getLeaderboard(),
    getLeaderboardStats(),
    getUniversities(),
  ]);

  const tiles = [
    { label: "Participants", value: formatInt(stats.participants) },
    { label: "Active (≥1 simulation)", value: formatInt(stats.active) },
    { label: "Total simulations", value: formatInt(stats.totalSimulations) },
    { label: "Total submissions", value: formatInt(stats.totalSubmissions) },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Current milestone"
        title={milestone.title}
        description={milestone.description}
        meta={<>Report updated {report.updated}</>}
      />

      {/* Jump links within this page */}
      <nav aria-label="On this page" className="mb-10 flex flex-wrap gap-2">
        {[
          ["#overview", "Overview"],
          ["#eligibility", "Eligibility"],
          ["#leaderboard", "Leaderboard"],
        ].map(([href, label]) => (
          <a
            key={href}
            href={href}
            className="inline-flex min-h-11 items-center rounded-lg border border-line-2 bg-panel/60 px-4 text-sm text-fg transition hover:border-gold/60 hover:text-gold"
          >
            {label}
          </a>
        ))}
      </nav>

      {/* Overview: countdown + current standings */}
      <section id="overview" aria-label="Overview" className="scroll-mt-40 lg:scroll-mt-24">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="flex min-w-0 flex-col rounded-2xl border border-gold/40 bg-gold/[0.05] p-6 sm:p-8">
            <div className="rounded-lg border border-line bg-panel p-4">
              <p className="mb-2 text-[11px] uppercase tracking-[0.12em] text-dim">Window closes in</p>
              <Countdown target={milestone.closesAt} />
              <p className="mt-2 text-xs text-dim">Closes {formatEventStamp(milestone.closesAt)}</p>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <dt className="text-xs text-muted">Programme avg prod corr</dt>
                <dd className="mt-1 text-3xl tabular-nums text-fg">{formatMetric(standings.programmeAverage, 3)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Eligible participants</dt>
                <dd className="mt-1 text-3xl tabular-nums text-fg">{standings.eligible}</dd>
              </div>
            </dl>

            <div className="min-h-6 flex-1" />
            <a
              href={milestone.actionHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-lg bg-gold px-6 text-sm font-semibold text-ink transition hover:bg-gold/90"
            >
              {milestone.actionLabel} on BRAIN <ArrowRight size={16} />
            </a>
          </div>

          <div className="min-w-0 rounded-2xl border border-line bg-panel/60 p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <h2 className="text-2xl font-semibold tracking-tight text-fg">Leading right now</h2>
              <span className="text-[11px] text-dim">lowest avg prod corr</span>
            </div>
            <ol className="mt-5 divide-y divide-line">
              {standings.leaders.map((p, i) => (
                <li key={p.alias} className="flex items-center gap-3 py-3">
                  <span className={`w-6 text-sm tabular-nums ${i === 0 ? "text-gold" : "text-dim"}`}>{i + 1}</span>
                  <Avatar name={p.name} rank={i + 1} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-fg">{p.name}</div>
                    <div className="text-[11px] tabular-nums text-dim">{p.totalSubmissions} alphas submitted</div>
                  </div>
                  <span className={`text-base tabular-nums ${i === 0 ? "text-gold" : "text-fg"}`}>
                    {formatMetric(p.avgProdCorr, 3)}
                  </span>
                </li>
              ))}
              {standings.leaders.length === 0 && <li className="py-6 text-sm text-muted">No eligible participants yet.</li>}
            </ol>
            <p className="mt-4 text-xs leading-relaxed text-dim">
              Counts participants with at least {PROD_CORR_MIN_SUBMISSIONS} submitted alphas.
            </p>
          </div>
        </div>
      </section>

      <EligibilityCriteria
        id="eligibility-title"
        title="Who qualifies"
        rules={milestone.eligibility}
        className="mt-12 scroll-mt-40 lg:scroll-mt-24"
        sectionId="eligibility"
      />

      {/* Full leaderboard */}
      <section id="leaderboard" aria-labelledby="leaderboard-title" className="mt-16 scroll-mt-40 lg:scroll-mt-24">
        <h2 id="leaderboard-title" className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
          Leaderboard
        </h2>
        <p className="mt-2 mb-6 text-sm text-muted">Partnership report updated {report.updated}.</p>

        <dl className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {tiles.map((t) => (
            <div key={t.label} className="rounded-xl border border-line bg-panel/60 p-5">
              <dt className="text-xs text-muted">{t.label}</dt>
              <dd className="mt-2 text-2xl tabular-nums text-fg sm:text-3xl">{t.value}</dd>
            </div>
          ))}
        </dl>

        <RankingsBoard participants={report.participants} universities={universities} />
      </section>
    </>
  );
}
