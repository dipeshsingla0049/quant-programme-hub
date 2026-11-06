import Link from "next/link";
import { BulletinCard } from "@/components/BulletinCard";
import { Countdown } from "@/components/Countdown";
import { ArrowRight, Briefcase, MapPin, Star, Trophy } from "@/components/icons";
import type { Opportunity } from "@/lib/types";
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

const OPPORTUNITY_ICON: Record<Opportunity["id"], typeof Star> = {
  "goa-trip": MapPin,
  master: Star,
  "qrap-internship": Briefcase,
};

export default async function HomePage() {
  const [milestone, bulletins, leaders, programme, report] = await Promise.all([
    getCurrentMilestone(),
    getBulletins(3),
    getLeaders(5),
    getRewardsProgramme(),
    getLeaderboard(),
  ]);
  const { milestoneIncentive: mi } = programme;
  const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

  return (
    <>
      {/* Hero */}
      <section className="grid gap-10 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div>
          <h1 className="font-semibold tracking-tight text-5xl leading-[1.02] tracking-tight text-fg sm:text-6xl lg:text-7xl">
            Track Every Alpha.
            <br />
            <em className="not-italic text-gold">Master Every Dimension.</em>
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
          <p className="flex items-center gap-2 tabular-nums text-[11px] uppercase tracking-[0.12em] text-gold">
            <span className="size-2 rounded-full bg-gold" />
            Current Milestone
          </p>
          <h2 className="mt-5 font-semibold tracking-tight text-xl text-fg">{milestone.title}</h2>
          <div className="mt-5 rounded-lg border border-line bg-ink/80 p-4">
            <p className="mb-2 tabular-nums text-[10px] uppercase tracking-[0.14em] text-dim">Window closes in:</p>
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
            <span className="rounded border border-line-2 bg-panel-2 px-2 py-0.5 tabular-nums text-[11px] text-muted">
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
          title="Avg Production Correlation Leaderboard"
          subtitle={`Ranked by total simulations · report updated ${report.updated}`}
          action={{ href: "/rankings", label: "View Full Leaderboard" }}
        />
        <LeaderboardTable rows={leaders} />
      </section>

      {/* Rewards */}
      <section className="border-t border-line pb-20 pt-20">
        <SectionHeading
          title="Rewards"
          subtitle="Milestone prizes and opportunities for top performers."
          action={{ href: "/rewards", label: "All Rewards" }}
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <Link
            href="/rewards"
            className="relative flex flex-col overflow-hidden rounded-xl border border-gold/40 bg-gold/[0.05] p-6 transition hover:border-gold/70 sm:p-8"
          >
            <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-gold/10 blur-3xl" />
            <span className="relative inline-flex items-center gap-2 self-start rounded-md border border-gold/30 bg-gold/10 px-2.5 py-1 tabular-nums text-[11px] text-gold">
              <Trophy size={12} /> Milestone incentives
            </span>
            <p className="relative mt-6 font-semibold tracking-tight text-6xl leading-none text-gold">{usd(mi.perResearcherUsd)}</p>
            <p className="relative mt-3 text-[15px] text-fg">
              each for the <span className="text-gold">top {mi.winners} researchers</span> on every milestone.
            </p>
            <div className="min-h-4 flex-1" />
            <p className="relative mt-4 tabular-nums text-xs text-dim">
              {usd(mi.perResearcherUsd * mi.winners)} prize pool per milestone
            </p>
          </Link>

          {programme.opportunities.map((o) => {
            const Icon = OPPORTUNITY_ICON[o.id];
            return (
              <Link
                key={o.id}
                href={`/rewards#${o.id}`}
                className="group flex flex-col rounded-xl border border-line bg-panel/60 p-6 transition hover:border-gold/50"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-lg border border-gold/30 bg-gold/10 text-gold">
                  <Icon size={18} />
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-fg">{o.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{o.summary}</p>
                {o.reward && (
                  <p className="mt-3 inline-flex items-center gap-1.5 self-start rounded-md border border-gold/30 bg-gold/10 px-2.5 py-1 text-xs font-medium text-gold">
                    <Trophy size={12} /> {o.reward}
                  </p>
                )}
                <div className="min-h-4 flex-1" />
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gold">
                  {o.criteria.length ? "See criteria" : "Criteria coming soon"}
                  <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

    </>
  );
}
