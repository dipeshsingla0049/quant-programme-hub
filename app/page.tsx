import Link from "next/link";
import { ActivityCard } from "@/components/ActivityCard";
import { BulletinCard } from "@/components/BulletinCard";
import { Countdown } from "@/components/Countdown";
import { ArrowRight, Calendar, Target } from "@/components/icons";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { RelativeTime } from "@/components/RelativeTime";
import { FeaturedReward, RewardCard } from "@/components/RewardCards";
import { SectionHeading } from "@/components/SectionHeading";
import {
  getActivities,
  getBulletins,
  getCurrentMilestone,
  getLeaderboard,
  getLeaders,
  getRewards,
} from "@/lib/data";

export default async function HomePage() {
  const [milestone, bulletins, leaders, rewards, activities, report] = await Promise.all([
    getCurrentMilestone(),
    getBulletins(3),
    getLeaders(5),
    getRewards(),
    getActivities({ limit: 4 }),
    getLeaderboard(),
  ]);
  const featured = rewards.find((r) => r.featured);
  const secondary = rewards.find((r) => !r.featured);

  return (
    <>
      {/* Hero */}
      <section className="grid gap-10 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-md border border-line-2 bg-panel/60 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-gold">
            <Target size={12} />
            Academic Research × Institutional Alpha
          </span>
          <h1 className="mt-6 font-serif text-5xl leading-[1.02] tracking-tight text-fg sm:text-6xl lg:text-7xl">
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
          title="Institutional Rewards & Pathways"
          subtitle="Career pathways and sponsorships for leading NST researchers."
          action={{ href: "/rewards", label: "All Rewards" }}
        />
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          {featured && <FeaturedReward reward={featured} />}
          {secondary && <RewardCard reward={secondary} />}
        </div>
      </section>

      {/* Activities */}
      <section>
        <SectionHeading
          title="Upcoming Activities & Sprints"
          subtitle="Chronological schedule of masterclasses, guest sessions, and submission deadlines."
          aside={
            <a
              href="/activities/calendar.ics"
              className="inline-flex min-h-11 items-center gap-2 text-sm text-muted transition hover:text-fg"
            >
              <Calendar size={14} /> Sync iCal
            </a>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {activities.map((a) => (
            <ActivityCard key={a.id} activity={a} />
          ))}
        </div>
      </section>
    </>
  );
}
