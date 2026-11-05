/**
 * Every column of the BRAIN partnership report, in the source's order, with
 * the source's decimals: whole numbers for counts, 4 places for averages.
 */
import type { Participant } from "./types";

export type CellValue = number | string | null;

export interface ReportColumn {
  id: string;
  label: string;
  decimals: number;
  /** Text columns are left-aligned; numbers right-aligned. */
  text?: boolean;
  get: (p: Participant) => CellValue;
}

export const REPORT_COLUMNS: ReportColumn[] = [
  { id: "alias", label: "User alias", decimals: 0, text: true, get: (p) => p.alias },
  { id: "tier", label: "User type", decimals: 0, text: true, get: (p) => p.tier },
  { id: "firstName", label: "First name", decimals: 0, text: true, get: (p) => p.firstName },
  { id: "lastName", label: "Last name", decimals: 0, text: true, get: (p) => p.lastName },
  { id: "university", label: "University", decimals: 0, text: true, get: (p) => p.university },
  { id: "totalSimulations", label: "Total simulations", decimals: 0, get: (p) => p.totalSimulations },
  { id: "totalSubmissions", label: "Total submissions", decimals: 0, get: (p) => p.totalSubmissions },
  { id: "alphasUsa", label: "Alphas USA", decimals: 0, get: (p) => p.alphasByRegion.usa },
  { id: "alphasEur", label: "Alphas EUR", decimals: 0, get: (p) => p.alphasByRegion.eur },
  { id: "alphasAsi", label: "Alphas ASI", decimals: 0, get: (p) => p.alphasByRegion.asi },
  { id: "alphasGlb", label: "Alphas GLB", decimals: 0, get: (p) => p.alphasByRegion.glb },
  { id: "alphasOther", label: "Alphas other", decimals: 0, get: (p) => p.alphasByRegion.other },
  { id: "avgProdCorr", label: "Avg prod corr", decimals: 4, get: (p) => p.avgProdCorr },
  { id: "avgSelfCorr", label: "Avg self corr", decimals: 4, get: (p) => p.avgSelfCorr },
  { id: "lowestProdCorr", label: "Lowest prod corr", decimals: 4, get: (p) => p.lowestProdCorr },
  { id: "highestProdCorr", label: "Highest prod corr", decimals: 4, get: (p) => p.highestProdCorr },
  { id: "avgSharpe", label: "Avg Sharpe", decimals: 4, get: (p) => p.avgSharpe },
  { id: "avgTurnover", label: "Avg turnover", decimals: 4, get: (p) => p.avgTurnover },
  { id: "avgReturns", label: "Avg returns", decimals: 4, get: (p) => p.avgReturns },
  { id: "avgDrawdown", label: "Avg drawdown", decimals: 4, get: (p) => p.avgDrawdown },
  { id: "avgMargin", label: "Avg margin", decimals: 4, get: (p) => p.avgMargin },
  { id: "totalOperatorsUsed", label: "Total operators used", decimals: 0, get: (p) => p.totalOperatorsUsed },
  { id: "operatorsPerAlpha", label: "Operators per alpha", decimals: 4, get: (p) => p.operatorsPerAlpha },
  { id: "totalDatafieldsUsed", label: "Total datafields used", decimals: 0, get: (p) => p.totalDatafieldsUsed },
  { id: "datafieldsPerAlpha", label: "Datafields per alpha", decimals: 4, get: (p) => p.datafieldsPerAlpha },
];

/** Same rules as the source: null → "—", numbers with fixed decimals and thousands separators. */
export function formatCell(v: CellValue, decimals: number): string {
  if (v === null) return "—";
  if (typeof v === "string") return v;
  return v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/** Nulls always sort last; text sorts alphabetically. */
export function compareCells(a: CellValue, b: CellValue, dir: 1 | -1): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  if (typeof a === "string" || typeof b === "string") return String(a).localeCompare(String(b)) * dir;
  return (a - b) * dir;
}
