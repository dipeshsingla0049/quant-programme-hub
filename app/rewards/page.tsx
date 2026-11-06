import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, CheckCircle, Star, Target, Trophy, Wallet } from "@/components/icons";
import { PageHeader } from "@/components/PageHeader";
import { getRewardsProgramme } from "@/lib/data";

export const metadata: Metadata = { title: "Rewards" };

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

export default async function RewardsPage() {
  const { milestoneIncentive: mi, stipends, tips } = await getRewardsProgramme();

  return (
    <>
      <PageHeader
        eyebrow="Rewards"
        title="What your research earns"
        description="Milestone prizes from the programme, plus BRAIN's own daily and quarterly stipends."
      />

      {/* Milestone incentives */}
      <section aria-labelledby="milestone-incentives" className="mb-20">
        <h2 id="milestone-incentives" className="mb-6 font-semibold tracking-tight text-3xl text-fg sm:text-4xl">Milestone incentives</h2>
        <div className="relative overflow-hidden rounded-2xl border border-gold/40 bg-gold/[0.05] p-6 sm:p-10">
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-gold/10 blur-3xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-8">
            <div>
              <span className="inline-flex items-center gap-2 rounded-md border border-gold/30 bg-gold/10 px-2.5 py-1 tabular-nums text-[11px] text-gold">
                <Trophy size={12} /> Every milestone
              </span>
              <p className="mt-6 font-semibold tracking-tight text-7xl leading-none text-gold sm:text-8xl">{usd(mi.perResearcherUsd)}</p>
              <p className="mt-3 max-w-md text-lg text-fg">
                each for the <span className="text-gold">top {mi.winners} researchers</span> when a milestone closes.
              </p>
            </div>
            <div className="flex flex-col items-start gap-4">
              <dl className="flex gap-8">
                <div>
                  <dt className="text-xs text-muted">Winners</dt>
                  <dd className="mt-1 tabular-nums text-2xl text-fg">{mi.winners}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Prize pool</dt>
                  <dd className="mt-1 tabular-nums text-2xl text-fg">{usd(mi.perResearcherUsd * mi.winners)}</dd>
                </div>
              </dl>
              <Link
                href="/milestones"
                className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-gold px-6 text-sm font-semibold text-ink transition hover:bg-gold/90"
              >
                See the current milestone <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* BRAIN stipends */}
      <section aria-labelledby="brain-stipends" className="mb-20">
        <h2 id="brain-stipends" className="font-semibold tracking-tight text-3xl text-fg sm:text-4xl">BRAIN stipends</h2>
        <p className="mt-2 mb-6 text-[15px] text-muted">Paid by WorldQuant BRAIN for your submitted alphas.</p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col rounded-2xl border border-line bg-panel/60 p-6 sm:p-8">
            <span className="inline-flex size-10 items-center justify-center rounded-lg border border-teal/30 bg-teal/10 text-teal">
              <Wallet size={18} />
            </span>
            <h3 className="mt-5 tabular-nums text-xs uppercase tracking-[0.12em] text-dim">Daily payouts</h3>
            <p className="mt-2 whitespace-nowrap font-semibold tracking-tight text-4xl text-fg sm:text-5xl md:text-4xl lg:text-5xl">
              {usd(stipends.daily.minUsd)}–{usd(stipends.daily.maxUsd)}
            </p>
            <p className="mt-2 text-sm text-muted">per day</p>
          </div>
          <div className="flex flex-col rounded-2xl border border-line bg-panel/60 p-6 sm:p-8">
            <span className="inline-flex size-10 items-center justify-center rounded-lg border border-gold/30 bg-gold/10 text-gold">
              <Star size={18} />
            </span>
            <h3 className="mt-5 tabular-nums text-xs uppercase tracking-[0.12em] text-dim">Quarterly stipends</h3>
            <p className="mt-2 whitespace-nowrap font-semibold tracking-tight text-4xl text-fg sm:text-5xl md:text-4xl lg:text-5xl">
              {usd(stipends.quarterly.minUsd)}–{usd(stipends.quarterly.maxUsd)}
            </p>
            <p className="mt-2 text-sm text-muted">per quarter</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-teal/30 bg-teal/[0.06] p-5">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-teal/40 text-teal">
            <Calendar size={18} />
          </span>
          <p className="min-w-0 flex-1 text-[15px] text-fg">
            <span className="font-medium">Eligibility:</span> submit on at least{" "}
            <span className="tabular-nums text-teal">{stipends.minSubmissionDaysPerQuarter} days</span> every quarter.
          </p>
        </div>
      </section>

      {/* Tips */}
      <section aria-labelledby="earn-more">
        <h2 id="earn-more" className="mb-6 font-semibold tracking-tight text-3xl text-fg sm:text-4xl">Tips to earn more</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {tips.map((t, i) => {
            const Icon = i === 0 ? CheckCircle : Target;
            return (
              <div key={t.title} className="rounded-2xl border border-line bg-panel/60 p-6 sm:p-8">
                <span className="inline-flex size-10 items-center justify-center rounded-lg border border-gold/30 bg-gold/10 text-gold">
                  <Icon size={18} />
                </span>
                <h3 className="mt-5 font-semibold tracking-tight text-2xl text-fg">{t.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{t.body}</p>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
