import Link from "next/link";
import { BulletinCard } from "@/components/BulletinCard";
import { Countdown } from "@/components/Countdown";
import { ArrowRight, Calendar, Star, Trophy, Wallet } from "@/components/icons";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { RelativeTime } from "@/components/RelativeTime";
import { SectionHeading } from "@/components/SectionHeading";
import {
  getBulletins,
  getCurrentMilestone,
  getLeaderboard,
  getLeaders,
  getRewardsProgramme,
} from "@/lib/data";

export default async function HomePage() {
  const [milestone, bulletins, leaders, programme, report] = await Promise.all([
    getCurrentMilestone(),
    getBulletins(3),
    getLeaders(5),
    getRewardsProgramme(),
    getLeaderboard(),
  ]);
  const { milestoneIncentive: mi, stipends } = programme;
  const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

  return (
    <>
      {/* Hero */}
      <section className="grid gap-10 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div>
          <h1 className="font-serif text-5xl leading-[1.02] tracking-tight text-fg sm:text-6xl lg:text-7xl">
            Track Every Alpha.
            <br />
            <em className="text-gold">Master Every Dimension.</em>
          </h1>
          <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-muted sm:text-base">
            The official competitive research portal for Newton School of Technology scholars engineering
            quantitative models on WorldQuant BRAIN.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/rankings"
              className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-gold px-6 text-sm font-semibold text-ink transition hover:bg-gold/90"
            >
              View Rankings <ArrowRight size={16} />
            </Link>
            <Link
              href="/milestones"
              className="inline-flex min-h-12 items-center rounded-lg border border-line-2 bg-panel/60 px-6 text-sm font-medium text-fg transition hover:border-muted"
            >
              See Milestones
            </Link>
          </div>
        </div>

        <aside className="rounded-xl border border-line bg-panel/70 p-6 shadow-2xl shadow-black/30">
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-gold">
            <span className="size-2 rounded-full bg-gold" />
            Current Milestone
          </p>
          <h2 className="mt-5 font-serif text-xl text-fg">{milestone.title}</h2>
          <div className="mt-5 rounded-lg border border-line bg-ink/80 p-4">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-dim">Window closes in:</p>
            <Countdown target={milestone.closesAt} />
          </div>
          <a
            href={milestone.actionHref}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-gold text-sm font-semibold text-ink transition hover:bg-gold/90"
          >
            {milestone.actionLabel} on BRAIN <ArrowRight size={16} />
          </a>
        </aside>
      </section>

      {/* Bulletins */}
      <section className="pb-20">
        <SectionHeading
          title="Official Bulletins"
          badge={
            <span className="rounded border border-line-2 bg-panel-2 px-2 py-0.5 font-mono text-[11px] text-muted">
              {bulletins[0] ? <RelativeTime iso={bulletins[0].publishedAt} prefix="Updated " /> : "No bulletins yet"}
            </span>
          }
          action={{ href: "/announcements", label: "Bulletin Archive" }}
        />
        <div className="grid gap-4 md:grid-cols-3">
          {bulletins.map((b) => (
            <BulletinCard key={b.id} bulletin={b} />
          ))}
        </div>
      </section>

      {/* Leaders */}
      <section className="pb-20">
        <SectionHeading
          title="Current Cohort Leaders"
          subtitle={`Ranked by total simulations · report updated ${report.updated}`}
          action={{ href: "/rankings", label: "View Full Leaderboard" }}
        />
        <LeaderboardTable rows={leaders} />
      </section>

      {/* Rewards */}
      <section className="border-t border-line pb-20 pt-20">
        <SectionHeading
          title="Rewards"
          subtitle="Milestone prizes from the programme, plus BRAIN's own stipends."
          action={{ href: "/rewards", label: "All Rewards" }}
        />
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr]">
          <Link
            href="/rewards"
            className="relative flex flex-col overflow-hidden rounded-xl border border-gold/40 bg-gold/[0.05] p-6 transition hover:border-gold/70 sm:p-8"
          >
            <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-gold/10 blur-3xl" />
            <span className="relative inline-flex items-center gap-2 self-start rounded-md border border-gold/30 bg-gold/10 px-2.5 py-1 font-mono text-[11px] text-gold">
              <Trophy size={12} /> Milestone incentives
            </span>
            <p className="relative mt-6 font-serif text-6xl leading-none text-gold">{usd(mi.perResearcherUsd)}</p>
            <p className="relative mt-3 text-[15px] text-fg">
              each for the <span className="text-gold">top {mi.winners} researchers</span> on every milestone.
            </p>
            <div className="min-h-4 flex-1" />
            <p className="relative mt-4 font-mono text-xs text-dim">
              {usd(mi.perResearcherUsd * mi.winners)} prize pool per milestone
            </p>
          </Link>

          <div className="flex flex-col rounded-xl border border-line bg-panel/60 p-6">
            <span className="inline-flex size-10 items-center justify-center rounded-lg border border-teal/30 bg-teal/10 text-teal">
              <Wallet size={18} />
            </span>
            <h3 className="mt-5 font-mono text-xs uppercase tracking-[0.12em] text-dim">BRAIN daily payouts</h3>
            <p className="mt-2 whitespace-nowrap font-serif text-4xl text-fg">
              {usd(stipends.daily.minUsd)}–{usd(stipends.daily.maxUsd)}
            </p>
            <p className="mt-1 text-sm text-muted">per day</p>
          </div>

          <div className="flex flex-col rounded-xl border border-line bg-panel/60 p-6">
            <span className="inline-flex size-10 items-center justify-center rounded-lg border border-gold/30 bg-gold/10 text-gold">
              <Star size={18} />
            </span>
            <h3 className="mt-5 font-mono text-xs uppercase tracking-[0.12em] text-dim">BRAIN quarterly stipends</h3>
            <p className="mt-2 whitespace-nowrap font-serif text-4xl text-fg">
              {usd(stipends.quarterly.minUsd)}–{usd(stipends.quarterly.maxUsd)}
            </p>
            <p className="mt-1 text-sm text-muted">per quarter</p>
            <div className="min-h-4 flex-1" />
            <p className="mt-4 flex items-center gap-2 text-xs text-teal">
              <Calendar size={14} /> Min {stipends.minSubmissionDaysPerQuarter} submission days per quarter
            </p>
          </div>
        </div>
      </section>

    </>
  );
}
