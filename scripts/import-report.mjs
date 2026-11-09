#!/usr/bin/env node
/**
 * Add one day's partnership report to data/reports/ and rebuild the index.
 * From 7 Nov 2026 every report is cumulative since 7 Nov.
 *
 *   npm run import:report -- <file.csv | CSV URL> [YYYY-MM-DD]
 *
 * The CSV can be a downloaded file or a Google Sheet published to the web as
 * CSV. A report is stored under the last day its data covers. BRAIN sends the
 * report the morning after, so …Report_20261109.csv covers up to 8 Nov and is
 * stored as 2026-11-08. Pass a date as the second argument to set that day
 * yourself; without a date in the file name it's yesterday in IST. Importing
 * the same day again replaces it.
 *
 * Only the columns in KEEP are stored. Email addresses, BRAIN user IDs and any
 * other column never reach the site. Columns in OPTIONAL may be missing from a
 * report; the site then doesn't judge that rule.
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Show what went wrong without a stack trace.
for (const event of ["uncaughtException", "unhandledRejection"]) {
  process.on(event, (e) => {
    console.error(`Import failed: ${e instanceof Error ? e.message : e}`);
    process.exit(1);
  });
}

const KEEP = [
  "UserAlias",
  "UserTypeLabel",
  "FirstName",
  "LastName",
  "UniversityName",
  "TotalSimulations",
  "TotalSubmissions",
  "AvgProdCorr",
  "AvgSelfCorr",
  "OperatorsPerAlpha",
  "DatafieldsPerAlpha",
];
const OPTIONAL = new Set(["OperatorsPerAlpha"]);
const TEXT = new Set(["UserAlias", "UserTypeLabel", "FirstName", "LastName", "UniversityName"]);
const PROGRAMME_START = "2026-11-07";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "data", "reports");

const [source, dateArg] = process.argv.slice(2);
if (!source) {
  console.error("Usage: npm run import:report -- <file.csv | CSV URL> [YYYY-MM-DD]");
  process.exit(1);
}

/** RFC 4180: quoted fields, "" escapes, CRLF or LF line endings. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') (field += '"'), i++;
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") row.push(field), (field = "");
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field), rows.push(row), (row = []), (field = "");
    } else field += c;
  }
  if (field !== "" || row.length) row.push(field), rows.push(row);
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function istToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

const dayBefore = (date) => new Date(Date.parse(`${date}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10);

/** The last day the report covers: the day before the one it was sent. */
function reportDate() {
  if (dateArg) return dateArg;
  const m = path.basename(source).match(/(\d{4})(\d{2})(\d{2})(?!\d)/);
  return dayBefore(m ? `${m[1]}-${m[2]}-${m[3]}` : istToday());
}

const isUrl = /^https?:\/\//i.test(source);
if (!isUrl && !existsSync(source)) throw new Error(`File not found: ${source}`);
const text = isUrl
  ? await fetch(source).then((r) => {
      if (!r.ok) throw new Error(`GET ${source} → ${r.status}`);
      return r.text();
    })
  : await readFile(source, "utf8");

const [header, ...body] = parseCsv(text.replace(/^﻿/, ""));
const columns = header.map((h) => h.trim());
const missing = KEEP.filter((k) => !columns.includes(k) && !OPTIONAL.has(k));
if (missing.length) throw new Error(`The CSV is missing column(s): ${missing.join(", ")}`);
const stored = KEEP.filter((k) => columns.includes(k));
const skipped = KEEP.filter((k) => !columns.includes(k));
if (skipped.length) console.warn(`Note: no ${skipped.join(", ")} column in this report. The site won't judge that rule.`);

const date = reportDate();
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`Date must be YYYY-MM-DD, got "${date}"`);
if (date < PROGRAMME_START) {
  throw new Error(`${date} is before ${PROGRAMME_START}. Only reports aggregated from ${PROGRAMME_START} can be imported.`);
}

const at = stored.map((k) => columns.indexOf(k));
const cell = (raw, key) => {
  const v = (raw ?? "").trim();
  if (TEXT.has(key)) return v;
  if (v === "") return null;
  const n = Number(v);
  if (Number.isNaN(n)) throw new Error(`"${key}" should be a number, got "${v}"`);
  return Number.isInteger(n) ? n : Math.round(n * 1e4) / 1e4;
};
const rows = body.map((r) => at.map((i, k) => cell(r[i], stored[k])));

const aliases = rows.map((r) => r[0]);
const dupes = [...new Set(aliases.filter((a, i) => aliases.indexOf(a) !== i))];
if (dupes.length) console.warn(`Warning: alias appears more than once: ${dupes.join(", ")} (the last row wins)`);
if (aliases.some((a) => !a)) throw new Error("Some rows have no UserAlias.");

const file = `${date}.json`;
const replacing = existsSync(path.join(outDir, file));
const json = `{"date":${JSON.stringify(date)},"source":${JSON.stringify(isUrl ? source : path.basename(source))},"columns":${JSON.stringify(stored)},"rows":[\n${rows
  .map((r) => JSON.stringify(r))
  .join(",\n")}\n]}\n`;
await writeFile(path.join(outDir, file), json);

// Rebuild the index from every report in the folder, oldest first.
const files = (await readdir(outDir)).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
const ident = (f) => `r${f.slice(0, 10).replaceAll("-", "")}`;
await writeFile(
  path.join(outDir, "index.ts"),
  [
    "// Generated by `npm run import:report`. One entry per daily report, oldest first.",
    'import type { RawReport } from "@/lib/reports";',
    ...files.map((f) => `import ${ident(f)} from "./${f}";`),
    "",
    `const reports = [${files.map(ident).join(", ")}] as RawReport[];`,
    "export default reports;",
    "",
  ].join("\n"),
);

console.log(`${replacing ? "Replaced" : "Added"} data/reports/${file} (data up to ${date}): ${rows.length} researchers. ${files.length} daily report(s) in total.`);
