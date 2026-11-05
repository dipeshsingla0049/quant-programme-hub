#!/usr/bin/env node
/**
 * Pull the latest partnership report into data/leaderboard/ and make it the
 * one the site shows.
 *
 *   npm run import:leaderboard                 # default source URL
 *   npm run import:leaderboard -- <url>        # another report URL
 *   npm run import:leaderboard -- ./saved.html # a saved copy of the page
 */
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_SOURCE = "https://competition-leaderboard-site.vercel.app/";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "data", "leaderboard");

const source = process.argv[2] ?? DEFAULT_SOURCE;
const html = existsSync(source)
  ? await readFile(source, "utf8")
  : await fetch(source).then((r) => {
      if (!r.ok) throw new Error(`GET ${source} → ${r.status}`);
      return r.text();
    });

const match = html.match(/<script[^>]*id=["']lb-data["'][^>]*>([\s\S]*?)<\/script>/);
if (!match) throw new Error("No leaderboard data (#lb-data) found on that page.");
const D = JSON.parse(match[1]);

const r4 = (x) => (typeof x === "number" && !Number.isInteger(x) ? Math.round(x * 1e4) / 1e4 : x);
const report = {
  title: D.title,
  updated: D.updated,
  source: existsSync(source) ? DEFAULT_SOURCE : source,
  scoreLabel: D.scoreLabel,
  columns: ["Rank", ...D.columns.map((c) => c.label)],
  rows: D.rows.map((r) => [r.rank, ...r.v.map(r4)]),
};

// File name: the YYYYMMDD at the end of the title, else today.
const stamp = (D.title.match(/(\d{4})(\d{2})(\d{2})\s*$/) ?? []).slice(1).join("-") || new Date().toISOString().slice(0, 10);
const file = `${stamp}.json`;
const body = `{${Object.entries(report)
  .filter(([k]) => k !== "rows")
  .map(([k, v]) => `${JSON.stringify(k)}:${JSON.stringify(v)}`)
  .join(",")},"rows":[\n${report.rows.map((r) => JSON.stringify(r)).join(",\n")}\n]}\n`;

await writeFile(path.join(outDir, file), body);
await writeFile(
  path.join(outDir, "index.ts"),
  `// The leaderboard report the site currently shows.\n// \`npm run import:leaderboard\` adds a new report file and updates this line.\nexport { default } from "./${file}";\n`,
);

console.log(`Imported ${report.rows.length} participants → data/leaderboard/${file} (updated ${report.updated})`);
