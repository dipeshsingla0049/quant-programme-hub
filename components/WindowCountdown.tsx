"use client";

import { useEffect, useState } from "react";
import { Countdown } from "./Countdown";
import { periodOf } from "@/lib/milestones";

const DAY = 86_400_000;

/** Midnight IST at the start of a calendar day, in ms. */
const startMs = (day: string) => Date.parse(`${day}T00:00:00+05:30`);

/**
 * "Starts in", "Ends in" or "Closed" for a milestone window, decided in the
 * browser so a page built days ago still shows the right phase. A window with
 * no end (Baseline to Stay) counts down to the end of the current Baseline period instead.
 */
export function WindowCountdown({ start, end }: { start: string; end: string | null }) {
  const [phase, setPhase] = useState<{ label: string; target: string } | "closed" | null>(null);

  useEffect(() => {
    const now = Date.now();
    const s = startMs(start);
    if (now < s) return setPhase({ label: "Starts in", target: new Date(s).toISOString() });
    if (end) {
      const e = startMs(end) + DAY;
      return setPhase(now < e ? { label: "Ends in", target: new Date(e).toISOString() } : "closed");
    }
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date(now));
    const periodEnd = startMs(periodOf(today).end) + DAY;
    setPhase({ label: "This period ends in", target: new Date(periodEnd).toISOString() });
  }, [start, end]);

  if (phase === "closed") return <p className="text-lg text-muted">Window closed</p>;
  return (
    <div>
      <p className="mb-2 text-[11px] uppercase tracking-[0.12em] text-dim">{phase?.label ?? " "}</p>
      {phase ? <Countdown target={phase.target} /> : <p className="text-2xl text-dim sm:text-3xl">--</p>}
    </div>
  );
}
