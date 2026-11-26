import { formatInt, formatMetric, initials } from "@/lib/format";
import { topPerformersByCampus } from "@/lib/standings";

/** Gold, silver, bronze for places 1 to 3. */
const MEDAL = [
  { row: "border-gold/45 bg-gold/[0.09]", badge: "border-gold/50 bg-gold/15 text-gold", text: "text-gold", label: "Gold" },
  { row: "border-silver/40 bg-silver/[0.08]", badge: "border-silver/50 bg-silver/15 text-silver", text: "text-silver", label: "Silver" },
  { row: "border-bronze/40 bg-bronze/[0.08]", badge: "border-bronze/50 bg-bronze/15 text-bronze", text: "text-bronze", label: "Bronze" },
];

/**
 * Top 3 researchers on each campus, by alphas submitted since 7 Nov, within the limits.
 * Below lg the campuses sit side by side in a swipeable row, so the section stays one card tall.
 */
export function TopPerformers() {
  const campuses = topPerformersByCampus(3);
  return (
    <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0">
      {campuses.map(({ campus, eligible, top }) => (
        <section
          key={campus.id}
          aria-label={`${campus.short} top performers`}
          className="flex w-[86%] shrink-0 snap-start flex-col rounded-2xl border border-line bg-panel/70 p-4 sm:w-[60%] sm:p-6 md:w-[46%] lg:w-auto"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-2">
            <h3 className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">{campus.short}</h3>
            <span className="text-[11px] text-muted sm:text-xs">{campus.name}</span>
          </div>

          {top.length ? (
            <ol className="mt-3 space-y-2 sm:mt-5 sm:space-y-3">
              {top.map((r, i) => {
                const medal = MEDAL[i];
                return (
                  <li key={r.alias} className={`flex items-center gap-3 rounded-xl border px-3 py-2 sm:p-3 ${medal.row}`}>
                    <span
                      className={`inline-flex size-8 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold sm:size-9 ${medal.badge}`}
                      title={`${i + 1}. ${medal.label}`}
                    >
                      <span className="sr-only">{i + 1}. </span>
                      <span aria-hidden>{initials(r.name)}</span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-fg sm:text-[15px]" title={r.name}>
                        {r.name}
                      </p>
                      <p className="truncate text-[11px] tabular-nums text-dim">
                        {formatInt(r.simulations)} sims · corr {formatMetric(r.avgProdCorr, 3)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={`text-lg font-semibold tabular-nums sm:text-xl ${medal.text}`}>{formatInt(r.submissions)}</p>
                      <p className="text-[10px] uppercase tracking-wide text-dim">alphas</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="mt-4 text-sm text-muted">No one within the limits yet.</p>
          )}

          <div className="min-h-3 flex-1" />
          <p className="mt-3 text-[11px] tabular-nums text-muted sm:mt-4 sm:text-xs">
            {eligible} {eligible === 1 ? "researcher" : "researchers"} within the limits
          </p>
        </section>
      ))}
    </div>
  );
}
