"use client";

import { useEffect, useState } from "react";

function split(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export function Countdown({ target }: { target: string }) {
  // null until mounted so server and client render the same markup.
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const end = new Date(target).getTime();
    const tick = () => setRemaining(end - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (remaining !== null && remaining <= 0) {
    return <p className="font-mono text-lg text-rose">Window closed</p>;
  }

  const parts = remaining === null ? null : split(remaining);
  const units: [keyof ReturnType<typeof split>, string][] = [
    ["d", "d"],
    ["h", "h"],
    ["m", "m"],
    ["s", "s"],
  ];

  return (
    <div className="flex items-baseline gap-3 font-mono" role="timer" aria-live="off">
      {units.map(([key, label], i) => (
        <span key={key} className="flex items-baseline gap-3">
          <span>
            <span className="text-2xl font-medium text-gold tabular-nums sm:text-3xl">
              {parts ? pad(parts[key]) : "--"}
            </span>
            <span className="ml-0.5 text-xs text-muted">{label}</span>
          </span>
          {i < units.length - 1 && <span className="text-dim">:</span>}
        </span>
      ))}
    </div>
  );
}
