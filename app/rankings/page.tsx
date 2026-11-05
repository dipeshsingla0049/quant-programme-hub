import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { RankingsBoard } from "@/components/RankingsBoard";
import { getCurrentMilestone, getLeaderboard, getLeaderboardStats, getUniversities } from "@/lib/data";
import { formatInt } from "@/lib/format";

export const metadata: Metadata = { title: "Rankings" };

export default async function RankingsPage() {
  const [report, stats, universities, milestone] = await Promise.all([
    getLeaderboard(),
    getLeaderboardStats(),
    getUniversities(),
    getCurrentMilestone(),
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
        eyebrow="Leaderboard"
        title="Programme Rankings"
        meta={<>Report updated {report.updated}</>}
      />

      <dl className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-xl border border-line bg-panel/60 p-5">
            <dt className="text-xs text-muted">{t.label}</dt>
            <dd className="mt-2 font-mono text-2xl tabular-nums text-fg sm:text-3xl">{t.value}</dd>
          </div>
        ))}
      </dl>

      <RankingsBoard participants={report.participants} universities={universities} />

      <section aria-labelledby="eligibility" className="mt-12 rounded-xl border border-line bg-panel/60 p-6 sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-gold">Eligibility criteria</p>
        <h2 id="eligibility" className="mt-2 font-serif text-2xl text-fg sm:text-3xl">{milestone.title}</h2>
        <p className="mt-2 text-sm text-muted">Meet all of these to be eligible for this milestone.</p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {milestone.eligibility.map((rule) => (
            <li key={rule.label} className="rounded-lg border border-line-2 bg-ink/60 p-5">
              <p className="whitespace-nowrap font-mono text-3xl tabular-nums text-gold">{rule.value}</p>
              <p className="mt-2 text-sm leading-snug text-fg">{rule.label}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
