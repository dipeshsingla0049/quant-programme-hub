/**
 * Turns the raw partnership report (columns + rows, exactly as published)
 * into typed participants. Columns are looked up by label, so a report with
 * reordered or extra columns still parses.
 */
import raw from "@/data/leaderboard";
import type { LeaderboardReport, Participant, UserTier } from "./types";

type Cell = string | number | null;
interface RawReport {
  title: string;
  updated: string;
  source: string;
  scoreLabel: string;
  columns: string[];
  rows: Cell[][];
}

/** Names are shown exactly as published in the report. */
export function displayName(first: string, last: string): string {
  return `${first} ${last}`.trim();
}

function parse(report: RawReport): LeaderboardReport {
  const idx = new Map(report.columns.map((c, i) => [c, i]));
  const col = (row: Cell[], label: string): Cell => {
    const i = idx.get(label);
    if (i === undefined) throw new Error(`Leaderboard report is missing column "${label}"`);
    return row[i] ?? null;
  };
  const num = (row: Cell[], label: string): number | null => {
    const v = col(row, label);
    return typeof v === "number" ? v : null;
  };
  const int = (row: Cell[], label: string): number => num(row, label) ?? 0;
  const str = (row: Cell[], label: string): string => String(col(row, label) ?? "");

  const participants: Participant[] = report.rows.map((r) => ({
    rank: int(r, "Rank"),
    alias: str(r, "UserAlias"),
    tier: str(r, "UserTypeLabel") as UserTier,
    firstName: str(r, "FirstName"),
    lastName: str(r, "LastName"),
    name: displayName(str(r, "FirstName"), str(r, "LastName")),
    university: str(r, "UniversityName"),
    totalSimulations: int(r, "TotalSimulations"),
    totalSubmissions: int(r, "TotalSubmissions"),
    alphasByRegion: {
      usa: int(r, "Alphas_USA"),
      eur: int(r, "Alphas_EUR"),
      asi: int(r, "Alphas_ASI"),
      glb: int(r, "Alphas_GLB"),
      other: int(r, "Alphas_Other"),
    },
    avgProdCorr: num(r, "AvgProdCorr"),
    avgSelfCorr: num(r, "AvgSelfCorr"),
    lowestProdCorr: num(r, "LowestProdCorr"),
    highestProdCorr: num(r, "HighestProdCorr"),
    avgSharpe: num(r, "AvgSharpe"),
    avgTurnover: num(r, "AvgTurnOver"),
    avgReturns: num(r, "AvgReturns"),
    avgDrawdown: num(r, "AvgDrawDown"),
    avgMargin: num(r, "AvgMargin"),
    totalOperatorsUsed: int(r, "TotalOperatorsUsed"),
    operatorsPerAlpha: num(r, "OperatorsPerAlpha"),
    totalDatafieldsUsed: int(r, "TotalDatafieldsUsed"),
    datafieldsPerAlpha: num(r, "DatafieldsPerAlpha"),
  }));

  // Stable sort: participants who share a rank keep the report's own order.
  participants.sort((a, b) => a.rank - b.rank);

  return {
    title: report.title,
    updated: report.updated,
    source: report.source,
    scoreLabel: report.scoreLabel,
    participants,
  };
}

export const leaderboard: LeaderboardReport = parse(raw as RawReport);

export const TIER_LABEL: Record<UserTier, string> = {
  CONSULTANT: "Consultant",
  CONDITIONALCONSULTANT: "Conditional",
};
