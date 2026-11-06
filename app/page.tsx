import Link from "next/link";
import { BulletinCard } from "@/components/BulletinCard";
import { ArrowRight, Briefcase, MapPin, Star, Trophy } from "@/components/icons";
import type { Opportunity } from "@/lib/types";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { RelativeTime } from "@/components/RelativeTime";
import { SectionHeading } from "@/components/SectionHeading";
import {
  getBulletins,
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
  const [bulletins, leaders, programme, report] = await Promise.all([
    getBulletins(3),
    getLeaders(5),
    getRewardsProgramme(),
    getLeaderboard(),
  ]);
  const { milestoneIncentive: mi } = programme;
  const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

  return (
    <>
      {/* The page opens on announcements; this heading names the page for screen readers. */}
      <h1 className="sr-only">Quant Research Hub</h1>

      {/* Bulletins */}
      <section className="pb-20 pt-14 sm:pt-20">
        <SectionHeading
          title="Announcements"
          badge={
            <span className="rounded border border-line-2 bg-panel-2 px-2 py-0.5 tabular-nums text-[11px] text-muted">
              {bulletins[0] ? <RelativeTime iso={bulletins[0].publishedAt} prefix="Updated " /> : "No bulletins yet"}
            </span>
          }
          action={{ href: "/announcements", label: "All announcements" }}
        />
        <div className={`grid gap-4 ${bulletins.length > 1 ? "md:grid-cols-3" : ""}`}>
          {bulletins.map((b) => (
            <BulletinCard key={b.id} bulletin={b} expanded={bulletins.length === 1} />
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
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <Link
            href="/milestones"
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
                href={`/${o.id}`}
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
