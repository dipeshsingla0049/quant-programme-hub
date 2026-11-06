"use client";

import { useEffect, useState } from "react";

/**
 * A "Today" line on the milestone timeline. Placed in the browser so a page
 * built days ago still marks the right day.
 */
export function TodayMarker({ from, days, label = false }: { from: string; days: number; label?: boolean }) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const start = Date.parse(`${from}T00:00:00+05:30`);
    const pct = ((Date.now() - start) / (days * 86_400_000)) * 100;
    setLeft(pct >= 0 && pct <= 100 ? pct : null);
  }, [from, days]);

  if (left === null) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-y-0 z-10" style={{ left: `${left}%` }}>
      <div className="h-full w-px bg-rose" />
      {label && (
        <span className="absolute -top-5 -translate-x-1/2 whitespace-nowrap rounded bg-rose px-1.5 text-[10px] font-medium text-white">
          Today
        </span>
      )}
    </div>
  );
}
