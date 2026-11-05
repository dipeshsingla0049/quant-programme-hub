import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { RankingsBoard } from "@/components/RankingsBoard";
import { getLeaderboard, getLeaderboardStats, getUniversities } from "@/lib/data";
import { formatInt } from "@/lib/format";

export const metadata: Metadata = { title: "Rankings" };

export default async function RankingsPage() {
  const [report, stats, universities] = await Promise.all([
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

      <section className="mt-12 rounded-xl border border-line bg-panel/60 p-6">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-dim">How ranking works</h2>
        <ul className="mt-4 grid gap-x-8 gap-y-3 text-sm leading-relaxed text-muted md:grid-cols-2">
          <li>
            Official rank is by <span className="text-fg">total simulations</span> on WorldQuant BRAIN, taken from the
            partnership report.
          </li>
          <li>Participants with the same total share a rank.</li>
          <li>
            <span className="text-fg">Avg Sharpe</span> and <span className="text-fg">prod correlation</span> are
            averaged over submitted alphas; “—” means no submissions yet.
          </li>
          <li>Use Sort to view by submissions, Sharpe or correlation. Ranks shown stay official.</li>
        </ul>
      </section>
    </>
  );
}
