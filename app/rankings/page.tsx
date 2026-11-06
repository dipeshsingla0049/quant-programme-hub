import type { Metadata } from "next";
import Link from "next/link";
import { EligibilityCriteria } from "@/components/EligibilityCriteria";
import { Clock } from "@/components/icons";
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

      {tab.hasLeaderboard ? (
        <>
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
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line-2 bg-panel/40 px-6 py-20 text-center">
          <span className="inline-flex size-14 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold">
            <Clock size={22} />
          </span>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-fg">Leaderboard will be updated soon</h2>
          <p className="mt-2 max-w-md text-sm text-muted">
            The {tab.title} standings aren&apos;t published yet. Check the eligibility criteria below in the meantime.
          </p>
        </div>
      )}

      <EligibilityCriteria id="eligibility" title={tab.title} rules={tab.eligibility} className="mt-12" />
    </>
  );
}
