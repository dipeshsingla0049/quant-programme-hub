import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Countdown } from "@/components/Countdown";
import { EligibilityCriteria } from "@/components/EligibilityCriteria";
import { ArrowRight, Lock } from "@/components/icons";
import { PageHeader } from "@/components/PageHeader";
import {
  PROD_CORR_MIN_SUBMISSIONS,
  getCurrentMilestone,
  getLeaderboard,
  getMilestones,
  getProdCorrStandings,
} from "@/lib/data";
import { formatEventStamp, formatMetric } from "@/lib/format";

export const metadata: Metadata = { title: "Milestones" };

export default async function MilestonesPage() {
  const [current, standings, report, stages] = await Promise.all([
    getCurrentMilestone(),
    getProdCorrStandings(5),
    getLeaderboard(),
    getMilestones(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Milestones"
        title={
          <>
            The path to <em className="not-italic text-gold">Master</em> and <em className="not-italic text-gold">Grandmaster</em>
          </>
        }
        description="See what's live right now, and what each stage of the programme takes and unlocks."
      />

      {/* Current milestone */}
      <section aria-labelledby="current-milestone" className="mb-20">
        <h2 id="current-milestone" className="mb-6 flex items-center gap-2 tabular-nums text-[11px] uppercase tracking-[0.14em] text-gold">
          <span className="size-2 rounded-full bg-gold" aria-hidden />
          Current milestone
        </h2>

        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <div className="flex min-w-0 flex-col rounded-2xl border border-gold/40 bg-gold/[0.05] p-6 sm:p-8">
            <h3 className="font-semibold tracking-tight text-3xl leading-tight text-fg sm:text-4xl">{current.title}</h3>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">{current.description}</p>

            <div className="mt-6 rounded-lg border border-line bg-ink/80 p-4">
              <p className="mb-2 tabular-nums text-[10px] uppercase tracking-[0.14em] text-dim">Window closes in:</p>
              <Countdown target={current.closesAt} />
              <p className="mt-2 tabular-nums text-xs text-dim">Closes {formatEventStamp(current.closesAt)}</p>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <dt className="text-xs text-muted">Programme avg prod corr</dt>
                <dd className="mt-1 tabular-nums text-2xl text-fg">
                  {formatMetric(standings.programmeAverage, 3)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Eligible participants</dt>
                <dd className="mt-1 tabular-nums text-2xl text-fg">{standings.eligible}</dd>
              </div>
            </dl>

            <div className="min-h-6 flex-1" />
            <a
              href={current.actionHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-lg bg-gold px-6 text-sm font-semibold text-ink transition hover:bg-gold/90"
            >
              {current.actionLabel} on BRAIN <ArrowRight size={16} />
            </a>
          </div>

          <div className="min-w-0 rounded-2xl border border-line bg-panel/60 p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <h3 className="font-semibold tracking-tight text-2xl text-fg">Leading right now</h3>
              <span className="tabular-nums text-[11px] text-dim">lowest avg prod corr</span>
            </div>
            <ol className="mt-5 divide-y divide-line">
              {standings.leaders.map((p, i) => (
                <li key={p.alias} className="flex items-center gap-3 py-3">
                  <span className={`w-6 tabular-nums text-sm ${i === 0 ? "text-gold" : "text-dim"}`}>{i + 1}</span>
                  <Avatar name={p.name} rank={i + 1} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-fg">{p.name}</div>
                    <div className="tabular-nums text-[11px] text-dim">{p.totalSubmissions} alphas submitted</div>
                  </div>
                  <span className={`tabular-nums text-base tabular-nums ${i === 0 ? "text-gold" : "text-fg"}`}>
                    {formatMetric(p.avgProdCorr, 3)}
                  </span>
                </li>
              ))}
              {standings.leaders.length === 0 && <li className="py-6 text-sm text-muted">No eligible participants yet.</li>}
            </ol>
            <p className="mt-4 text-xs leading-relaxed text-dim">
              Counts participants with at least {PROD_CORR_MIN_SUBMISSIONS} submitted alphas. From the partnership report
              updated {report.updated}.
            </p>
            <Link
              href="/rankings"
              className="mt-5 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-gold transition hover:text-fg"
            >
              View full leaderboard <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <EligibilityCriteria
          id="current-milestone-eligibility"
          title={current.title}
          rules={current.eligibility}
          className="mt-4"
        />
      </section>

      {/* Upcoming milestones */}
      <section aria-labelledby="upcoming-milestones">
        <div className="mb-10">
          <h2 id="upcoming-milestones" className="font-semibold tracking-tight text-3xl text-fg sm:text-4xl">Upcoming milestones</h2>
          <p className="mt-3 font-semibold tracking-tight text-xl text-gold sm:text-2xl">
            Conquer the current milestone to break the next seal.
          </p>
        </div>

        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stages.map((s) => (
            <li
              key={s.id}
              aria-label="Locked milestone"
              className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-line-2 bg-panel/40 sm:aspect-[4/3]"
            >
              <span className="inline-flex size-14 items-center justify-center rounded-full border border-line-2 text-dim">
                <Lock size={22} />
              </span>
            </li>
          ))}
        </ul>
      </section>


    </>
  );
}
