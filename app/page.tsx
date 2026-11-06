import Link from "next/link";
import { BulletinCard } from "@/components/BulletinCard";
import { ArrowRight, Briefcase, MapPin, Star, Trophy } from "@/components/icons";
import { MilestoneCards, MilestoneTimeline } from "@/components/MilestoneOverview";
import type { Opportunity } from "@/lib/types";
import { RelativeTime } from "@/components/RelativeTime";
import { SectionHeading } from "@/components/SectionHeading";
import { getBulletins, getRewardsProgramme } from "@/lib/data";
import { formatDay } from "@/lib/format";
import { latestReportDate } from "@/lib/standings";

const OPPORTUNITY_ICON: Record<Opportunity["id"], typeof Star> = {
  "goa-trip": MapPin,
  master: Star,
  "qrap-internship": Briefcase,
};

export default async function HomePage() {
  const [bulletins, programme] = await Promise.all([getBulletins(3), getRewardsProgramme()]);

  return (
    <>
      {/* November milestones: what to do, by when, for what */}
      <section aria-labelledby="milestones-title" className="pb-20 pt-14 sm:pt-20">
        <p className="text-[11px] uppercase tracking-[0.14em] text-gold">Quant Research Hub</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 id="milestones-title" className="text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
              November milestones
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
              Three milestones run from 7 November. Each has its own window, rules and reward. Standings update
              daily from the BRAIN partnership report.
            </p>
          </div>
          <span className="rounded border border-line-2 bg-panel-2 px-2 py-0.5 text-[11px] tabular-nums text-muted">
            {latestReportDate ? `Data as of ${formatDay(latestReportDate, true)}` : "First report: Nov 7"}
          </span>
        </div>
        <div className="mt-8 space-y-4">
          <MilestoneCards />
          <MilestoneTimeline />
        </div>
      </section>

      {/* Bulletins */}
      <section className="border-t border-line pb-20 pt-20">
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

      {/* Rewards */}
      <section className="border-t border-line pb-20 pt-20">
        <SectionHeading
          title="More opportunities"
          subtitle="Beyond the November milestones."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
