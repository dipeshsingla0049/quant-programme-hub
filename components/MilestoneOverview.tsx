import Link from "next/link";
import { ArrowRight, Lock, Trophy } from "@/components/icons";
import { MilestoneBadge } from "@/components/MilestoneBadge";
import { TodayMarker } from "@/components/TodayMarker";
import { formatDay, formatDayRange } from "@/lib/format";
import { MILESTONES, PROGRAMME_START, type Milestone } from "@/lib/milestones";
import { addDays, countOf, getStandings, ruleTarget } from "@/lib/standings";

/** One line on where things stand, for the milestone's card. */
function liveLine(m: Milestone): React.ReactNode {
  const s = getStandings(m.id);
  if (!s.asOf) return "Standings from the first daily report";
  if (m.ranking) return `Are you in the top ${m.ranking.winners}?`;
  const [green, yellow, red] = ["green", "yellow", "red"].map((g) => countOf(s, g));
  return (
    <>
      <span className="text-teal">
        {green} {m.board === "weekly" ? `completed week ${s.week?.number}` : "eligible"}
      </span>{" "}
      · <span className="text-amber">{yellow} on track</span> ·{" "}
      <span className="text-rose">
        {red} {m.board === "weekly" ? "at risk" : "not eligible"}
      </span>
    </>
  );
}

export function MilestoneCards() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {MILESTONES.map((m) => {
        const stakes = !!m.stakes;
        return (
          <Link
            key={m.id}
            href={`/${m.id}`}
            className={`group flex flex-col rounded-2xl border p-6 transition sm:p-7 ${
              stakes ? "border-rose/40 bg-rose/[0.03] hover:border-rose/70" : "border-gold/40 bg-gold/[0.05] hover:border-gold/70"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex flex-wrap items-center gap-2 text-xl font-semibold tracking-tight text-fg">
                {m.name} <MilestoneBadge badge={m.badge} />
              </h3>
              <span className="rounded border border-line-2 bg-panel-2 px-2 py-0.5 text-[11px] tabular-nums text-muted">
                {m.end ? formatDayRange(m.start, m.end) : `Weekly from ${formatDay(m.start)}`}
              </span>
            </div>

            <p
              className={`mt-5 flex items-center gap-2 font-semibold tracking-tight ${
                stakes ? "text-2xl text-fg" : "text-4xl text-gold"
              }`}
            >
              {stakes ? <Lock size={20} className="text-rose" /> : <Trophy size={24} />}
              {m.reward}
            </p>
            {stakes ? (
              <>
                <p className="mt-1 text-lg font-semibold text-rose">{m.rewardDetail}</p>
                <p className="mt-1 text-sm text-muted">{m.stakes}</p>
              </>
            ) : (
              <p className="mt-1 text-sm text-muted">{m.rewardDetail}</p>
            )}

            <p className="mt-5 text-[15px] leading-snug text-fg">{m.goal}</p>
            <ul className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
              {m.rules.map((r) => (
                <li key={r.metric} className="flex gap-3">
                  <span className="w-16 shrink-0 tabular-nums text-gold">{ruleTarget(r)}</span>
                  <span className="text-muted">
                    {r.label}
                    {r.note?.startsWith("New.") && (
                      <span className="ml-1.5 rounded border border-rose/40 bg-rose/10 px-1 py-px text-[10px] font-semibold uppercase tracking-wide text-rose">
                        New
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>

            <div className="min-h-5 flex-1" />
            <p className={`mt-5 tabular-nums ${m.ranking ? "text-base font-semibold text-fg" : "text-xs font-medium"}`}>
              {liveLine(m)}
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-gold">
              See the leaderboard
              <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        );
      })}
    </div>
  );
}

/** All milestone windows on one axis from the programme start to the last end date. */
export function MilestoneTimeline() {
  const last = MILESTONES.reduce((d, m) => (m.end && m.end > d ? m.end : d), PROGRAMME_START);
  const days = Math.round((Date.parse(last) - Date.parse(PROGRAMME_START)) / 86_400_000) + 1;
  const pct = (day: string) => ((Date.parse(day) - Date.parse(PROGRAMME_START)) / 86_400_000 / days) * 100;
  const ticks: string[] = [];
  for (let d = PROGRAMME_START; d <= last; d = addDays(d, 7)) ticks.push(d);

  return (
    <div className="rounded-2xl border border-line bg-panel/60 p-5 sm:p-6">
      <h3 className="text-sm font-semibold text-fg">Timeline</h3>
      <div className="mt-8 space-y-4">
        {MILESTONES.map((m, i) => {
          const end = m.end ?? last;
          const left = pct(m.start);
          const width = pct(addDays(end, 1)) - left;
          return (
            <div key={m.id} className="grid items-center gap-x-4 gap-y-1.5 sm:grid-cols-[10rem_1fr]">
              <Link href={`/${m.id}`} className="text-sm text-fg hover:text-gold">
                {m.name}
              </Link>
              <div className="relative h-7 rounded bg-panel-2">
                <div
                  className={`absolute inset-y-0 flex items-center overflow-hidden rounded px-2 text-[11px] font-medium ${
                    m.stakes ? "bg-rose/15 text-rose" : "bg-gold/20 text-gold"
                  } ${m.end ? "" : "rounded-r-none"}`}
                  style={{ left: `${left}%`, width: `${width}%` }}
                >
                  <span className="truncate">
                    {m.end ? formatDayRange(m.start, m.end) : "Checked every week, ongoing"}
                  </span>
                </div>
                <TodayMarker from={PROGRAMME_START} days={days} label={i === 0} />
                {!m.end &&
                  ticks.slice(1).map((t) => (
                    <span key={t} aria-hidden className="absolute inset-y-1 w-px bg-rose/40" style={{ left: `${pct(t)}%` }} />
                  ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Date axis, aligned with the bars. */}
      <div className="mt-3 grid sm:grid-cols-[10rem_1fr] sm:gap-x-4">
        <span className="hidden sm:block" />
        <div className="relative h-5">
          {ticks.map((t, i) => (
            <span
              key={t}
              className={`absolute top-1 -translate-x-1/2 whitespace-nowrap text-[10px] tabular-nums text-dim first:translate-x-0 ${
                i % 2 ? "hidden sm:block" : ""
              }`}
              style={{ left: `${pct(t)}%` }}
            >
              {formatDay(t)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
