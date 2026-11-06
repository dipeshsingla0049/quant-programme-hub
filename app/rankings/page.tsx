import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { RankingsBoard } from "@/components/RankingsBoard";
import { getLeaderboard, getLeaderboardStats, getRankingTabs, getUniversities } from "@/lib/data";
import { formatInt } from "@/lib/format";

export const metadata: Metadata = { title: "Rankings" };

export default async function RankingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const [{ tab: tabId }, report, stats, universities, tabs] = await Promise.all([
    searchParams,
    getLeaderboard(),
    getLeaderboardStats(),
    getUniversities(),
    getRankingTabs(),
  ]);
  // Unknown or missing ?tab= falls back to the first tab.
  const tab = tabs.find((t) => t.id === tabId) ?? tabs[0]!;

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

      <nav aria-label="Leaderboards" className="mb-8 flex gap-1 overflow-x-auto border-b border-line">
        {tabs.map((t) => {
          const active = t.id === tab.id;
          return (
            <Link
              key={t.id}
              href={t.id === tabs[0]!.id ? "/rankings" : `/rankings?tab=${t.id}`}
              scroll={false}
              aria-current={active ? "page" : undefined}
              className={`-mb-px inline-flex min-h-11 items-center whitespace-nowrap border-b-2 px-4 text-sm font-medium transition ${
                active ? "border-gold text-gold" : "border-transparent text-muted hover:text-fg"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      <dl className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-xl border border-line bg-panel/60 p-5">
            <dt className="text-xs text-muted">{t.label}</dt>
            <dd className="mt-2 tabular-nums text-2xl text-fg sm:text-3xl">{t.value}</dd>
          </div>
        ))}
      </dl>

      {/* key resets search, filters and sort when switching tabs */}
      <RankingsBoard key={tab.id} participants={report.participants} universities={universities} />

      <section aria-labelledby="eligibility" className="mt-12 rounded-xl border border-line bg-panel/60 p-6 sm:p-8">
        <p className="tabular-nums text-[11px] uppercase tracking-[0.12em] text-gold">Eligibility criteria</p>
        <h2 id="eligibility" className="mt-2 font-semibold tracking-tight text-2xl text-fg sm:text-3xl">{tab.title}</h2>
        <p className="mt-2 text-sm text-muted">{tab.eligibility.length > 1 ? "Meet all of these to be eligible." : "Meet this to be eligible."}</p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tab.eligibility.map((rule) => (
            <li key={rule.label} className="rounded-lg border border-line-2 bg-ink/60 p-5">
              <p className="whitespace-nowrap tabular-nums text-3xl text-gold">{rule.value}</p>
              <p className="mt-2 text-sm leading-snug text-fg">{rule.label}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
