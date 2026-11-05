import { formatInt, formatMetric } from "@/lib/format";
import type { Participant } from "@/lib/types";
import { Avatar } from "./Avatar";
import { TierBadge } from "./TierBadge";

function rankTone(rank: number) {
  if (rank === 1) return "text-gold";
  if (rank === 2) return "text-fg";
  if (rank === 3) return "text-gold-deep";
  return "text-dim";
}

function Regions({ p }: { p: Participant }) {
  const r = p.alphasByRegion;
  const items: [string, number][] = [
    ["USA", r.usa],
    ["EUR", r.eur],
    ["ASI", r.asi],
    ["GLB", r.glb],
    ["OTH", r.other],
  ];
  const shown = items.filter(([, n]) => n > 0);
  if (shown.length === 0) return <span className="text-dim">—</span>;
  return (
    <span className="flex flex-wrap justify-end gap-1">
      {shown.map(([label, n]) => (
        <span key={label} className="rounded bg-panel-2 px-1.5 py-0.5 font-mono text-[11px] text-muted">
          {label} <span className="text-fg">{n}</span>
        </span>
      ))}
    </span>
  );
}

const th = "px-4 py-3 font-normal whitespace-nowrap";
const td = "px-4 py-3.5";

export function LeaderboardTable({
  rows,
  detailed = false,
  emptyText = "No participants match these filters.",
}: {
  rows: Participant[];
  detailed?: boolean;
  emptyText?: string;
}) {
  const cols = detailed ? 9 : 6;
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-panel/60">
      <table className={`w-full border-collapse text-sm ${detailed ? "min-w-[1080px]" : "min-w-[720px]"}`}>
        <thead>
          <tr className="border-b border-line font-mono text-[11px] uppercase tracking-wider text-dim">
            <th scope="col" className={`${th} text-left`}>Rank</th>
            <th scope="col" className={`${th} text-left`}>Participant</th>
            {detailed && <th scope="col" className={`${th} text-left`}>Tier</th>}
            <th scope="col" className={`${th} text-right`}>Simulations</th>
            <th scope="col" className={`${th} text-right`}>Submissions</th>
            {detailed && <th scope="col" className={`${th} text-right`}>Alphas by region</th>}
            <th scope="col" className={`${th} text-right`}>Avg Sharpe</th>
            <th scope="col" className={`${th} text-right`}>Avg Prod Corr</th>
            {detailed && <th scope="col" className={`${th} text-right`}>Avg Turnover</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr
              key={p.alias}
              className={`border-b border-line last:border-0 transition hover:bg-panel-2/60 ${
                p.rank === 1 ? "bg-gold/[0.04]" : ""
              }`}
            >
              <td
                className={`border-l-2 ${td} font-mono font-medium ${rankTone(p.rank)} ${
                  p.rank === 1 ? "border-l-gold" : "border-l-transparent"
                }`}
              >
                #{p.rank}
              </td>
              <td className={td}>
                <div className="flex items-center gap-3">
                  <Avatar name={p.name} rank={p.rank} />
                  <div className="min-w-0">
                    <div className="truncate text-fg">{p.name}</div>
                    <div className="truncate font-mono text-[11px] text-dim">
                      {p.alias}
                      {detailed && <span className="font-sans"> · {p.university}</span>}
                    </div>
                  </div>
                </div>
              </td>
              {detailed && (
                <td className={td}>
                  <TierBadge tier={p.tier} />
                </td>
              )}
              <td className={`${td} text-right font-mono tabular-nums ${p.rank <= 3 ? "text-gold" : "text-fg"}`}>
                {formatInt(p.totalSimulations)}
              </td>
              <td className={`${td} text-right font-mono tabular-nums text-fg`}>{p.totalSubmissions}</td>
              {detailed && (
                <td className={`${td} text-right`}>
                  <Regions p={p} />
                </td>
              )}
              <td className={`${td} text-right font-mono tabular-nums text-fg`}>{formatMetric(p.avgSharpe)}</td>
              <td className={`${td} text-right font-mono tabular-nums text-fg`}>{formatMetric(p.avgProdCorr, 3)}</td>
              {detailed && (
                <td className={`${td} text-right font-mono tabular-nums text-muted`}>{formatMetric(p.avgTurnover, 1)}</td>
              )}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={cols} className="px-5 py-10 text-center text-muted">
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
