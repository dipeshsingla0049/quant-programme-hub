/**
 * The daily partnership reports in data/reports, parsed into typed snapshots.
 * From 7 Nov 2026 every report is cumulative since 7 Nov, so the latest
 * snapshot holds each researcher's totals for the programme so far, and
 * comparing consecutive days shows who submitted on which day.
 */
import raw from "@/data/reports";
import type { ReportRow, UserTier } from "./types";

type Cell = string | number | null;

/** One stored report, as written by scripts/import-report.mjs. */
export interface RawReport {
  /** YYYY-MM-DD, the day the report covers up to. */
  date: string;
  source: string;
  columns: string[];
  rows: Cell[][];
}

export interface Snapshot {
  date: string;
  rows: Map<string, ReportRow>;
}

function parse(report: RawReport): Snapshot {
  const idx = new Map(report.columns.map((c, i) => [c, i]));
  const col = (row: Cell[], label: string): Cell => {
    const i = idx.get(label);
    if (i === undefined) throw new Error(`Report ${report.date} is missing column "${label}"`);
    return row[i] ?? null;
  };
  const num = (row: Cell[], label: string): number | null => {
    const v = col(row, label);
    return typeof v === "number" ? v : null;
  };
  const str = (row: Cell[], label: string): string => String(col(row, label) ?? "").trim();

  const rows = new Map<string, ReportRow>();
  for (const r of report.rows) {
    const submissions = num(r, "TotalSubmissions") ?? 0;
    const prodCorr = num(r, "AvgProdCorr");
    rows.set(str(r, "UserAlias"), {
      alias: str(r, "UserAlias"),
      tier: str(r, "UserTypeLabel") as UserTier,
      name: `${str(r, "FirstName")} ${str(r, "LastName")}`.replace(/\s+\.$/, "").trim(),
      university: str(r, "UniversityName"),
      simulations: num(r, "TotalSimulations") ?? 0,
      submissions,
      // Exactly 0 means the report had no correlation for those alphas, not a perfect score.
      avgProdCorr: submissions > 0 && prodCorr ? prodCorr : null,
      avgSelfCorr: submissions > 0 ? num(r, "AvgSelfCorr") : null,
      operatorsPerAlpha: submissions > 0 ? num(r, "OperatorsPerAlpha") : null,
      datafieldsPerAlpha: submissions > 0 ? num(r, "DatafieldsPerAlpha") : null,
    });
  }
  return { date: report.date, rows };
}

/** Every daily report, oldest first. */
export const snapshots: Snapshot[] = raw.map(parse).sort((a, b) => a.date.localeCompare(b.date));

export const TIER_LABEL: Record<UserTier, string> = {
  CONSULTANT: "Consultant",
  CONDITIONALCONSULTANT: "Conditional",
};
