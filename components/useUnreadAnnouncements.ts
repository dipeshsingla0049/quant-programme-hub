"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "qrh-seen-announcements";

function readSeen(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeSeen(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Storage blocked: the badge still clears for this visit.
  }
}

/**
 * How many announcements this visitor hasn't seen yet. Opening the
 * announcements page marks every current announcement as seen. Stored per
 * browser, so it survives reloads and syncs across open tabs.
 *
 * Returns 0 until mounted, so the server never renders a count it can't know.
 */
export function useUnreadAnnouncements(ids: string[], onAnnouncementsPage: boolean): number {
  const [seen, setSeen] = useState<Set<string> | null>(null);
  const idsKey = ids.join("|");

  useEffect(() => {
    if (onAnnouncementsPage) {
      // Keep older seen ids too, so a removed-then-restored post stays read.
      const all = [...new Set([...readSeen(), ...ids])];
      writeSeen(all);
      setSeen(new Set(all));
    } else {
      setSeen(new Set(readSeen()));
    }
    // idsKey stands in for ids: same announcements, same key.
  }, [idsKey, onAnnouncementsPage]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setSeen(new Set(readSeen()));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return seen ? ids.filter((id) => !seen.has(id)).length : 0;
}
