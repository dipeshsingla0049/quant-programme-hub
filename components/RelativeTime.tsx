"use client";

import { useEffect, useState } from "react";

function describe(ms: number) {
  const mins = Math.round(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function RelativeTime({ iso, prefix = "" }: { iso: string; prefix?: string }) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setText(describe(Date.now() - new Date(iso).getTime()));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [iso]);

  return (
    <time dateTime={iso} suppressHydrationWarning>
      {prefix}
      {text ?? "…"}
    </time>
  );
}
