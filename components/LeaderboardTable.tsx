import { formatInt, formatMetric } from "@/lib/format";
import { REPORT_COLUMNS, formatCell } from "@/lib/reportColumns";
import type { Participant } from "@/lib/types";
import { Avatar } from "./Avatar";

function rankTone(rank: number) {
  if (rank === 1) return "text-gold";
  if (rank === 2) return "text-fg";
  if (rank === 3) return "text-gold-deep";
  return "text-dim";
}

const th = "px-4 py-3 font-normal whitespace-nowrap";
const td = "px-4 py-3.5";

/** Short top-N table used on the home page. */
export function LeaderboardTable({ rows }: { rows: Participant[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-panel/60">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line tabular-nums text-[11px] uppercase tracking-wider text-dim">
            <th scope="col" className={`${th} text-left`}>Rank</th>
            <th scope="col" className={`${th} text-left`}>Participant</th>
            <th scope="col" className={`${th} text-right`}>Simulations</th>
            <th scope="col" className={`${th} text-right`}>Submissions</th>
            <th scope="col" className={`${th} text-right`}>Avg Sharpe</th>
            <th scope="col" className={`${th} text-right`}>Avg Prod Corr</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr
              key={p.alias}
              className={`border-b border-line last:border-0 transition hover:bg-panel-2/60 ${p.rank === 1 ? "bg-gold/[0.04]" : ""}`}
            >
              <td
                className={`border-l-2 ${td} tabular-nums font-medium ${rankTone(p.rank)} ${
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
                    <div className="truncate tabular-nums text-[11px] text-dim">{p.alias}</div>
                  </div>
                </div>
              </td>
              <td className={`${td} text-right tabular-nums ${p.rank <= 3 ? "text-gold" : "text-fg"}`}>
                {formatInt(p.totalSimulations)}
              </td>
              <td className={`${td} text-right tabular-nums text-fg`}>{p.totalSubmissions}</td>
              <td className={`${td} text-right tabular-nums text-fg`}>{formatMetric(p.avgSharpe)}</td>
              <td className={`${td} text-right tabular-nums text-fg`}>{formatMetric(p.avgProdCorr, 3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export interface SortState {
  /** "rank" or a REPORT_COLUMNS id. */
  col: string;
  dir: "asc" | "desc";
}

/** Every report column, in source order. Headers sort when `onSort` is given. */
export function FullReportTable({
  rows,
  sort,
  onSort,
  emptyText = "No participants match these filters.",
}: {
  rows: Participant[];
  sort?: SortState;
  onSort?: (col: string) => void;
  emptyText?: string;
}) {
  const header = (id: string, label: string, align: "left" | "right", extra = "") => {
    const active = sort?.col === id;
    const arrow = active ? (sort!.dir === "asc" ? "▲" : "▼") : "";
    return (
      <th
        key={id}
        scope="col"
        aria-sort={active ? (sort!.dir === "asc" ? "ascending" : "descending") : "none"}
        className={`${th} ${align === "left" ? "text-left" : "text-right"} ${extra}`}
      >
        {onSort ? (
          <button
            type="button"
            onClick={() => onSort(id)}
            className={`inline-flex min-h-8 items-center gap-1 uppercase tracking-wider transition hover:text-fg ${
              active ? "text-gold" : ""
            }`}
          >
            {label}
            <span aria-hidden className="w-2 text-[9px]">{arrow}</span>
          </button>
        ) : (
          label
        )}
      </th>
    );
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-panel/60">
      <table className="w-max min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-line bg-panel tabular-nums text-[11px] uppercase tracking-wider text-dim">
            {header("rank", "Rank", "left", "sticky left-0 z-10 bg-panel")}
            {REPORT_COLUMNS.map((c) =>
              header(c.id, c.label, c.text ? "left" : "right", c.id === "alias" ? "sticky left-16 z-10 bg-panel" : ""),
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.alias} className="group border-b border-line last:border-0">
              <td
                className={`sticky left-0 z-10 w-16 min-w-16 border-l-2 bg-panel ${td} tabular-nums font-medium group-hover:bg-panel-2 ${rankTone(
                  p.rank,
                )} ${p.rank === 1 ? "border-l-gold" : "border-l-transparent"}`}
              >
                {p.rank}
              </td>
              {REPORT_COLUMNS.map((c) => {
                const v = c.get(p);
                return (
                  <td
                    key={c.id}
                    className={`${td} whitespace-nowrap group-hover:bg-panel-2/60 ${
                      c.text ? "text-left text-fg" : "text-right tabular-nums text-fg"
                    } ${v === null ? "text-dim" : ""} ${
                      c.id === "alias" ? "sticky left-16 z-10 bg-panel tabular-nums text-xs group-hover:bg-panel-2" : ""
                    } ${c.id === "tier" ? "tabular-nums text-[11px] text-muted" : ""} ${
                      c.id === "totalSimulations" && p.rank <= 3 ? "text-gold" : ""
                    }`}
                  >
                    {formatCell(v, c.decimals)}
                  </td>
                );
              })}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={REPORT_COLUMNS.length + 1} className="px-5 py-10 text-center text-muted">
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
