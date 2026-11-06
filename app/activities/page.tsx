import type { Metadata } from "next";
import { Calendar } from "@/components/icons";
import { PageHeader } from "@/components/PageHeader";
import { Tag } from "@/components/Tag";
import { getActivities } from "@/lib/data";
import { dayParts, formatEventStamp, monthLabel } from "@/lib/format";
import type { Activity } from "@/lib/types";

export const metadata: Metadata = { title: "Activities" };

function groupByMonth(list: Activity[]) {
  const groups = new Map<string, Activity[]>();
  for (const a of list) {
    const key = monthLabel(a.startsAt);
    groups.set(key, [...(groups.get(key) ?? []), a]);
  }
  return [...groups.entries()];
}

export default async function ActivitiesPage() {
  const activities = await getActivities();

  return (
    <>
      <PageHeader
        eyebrow="Calendar"
        title="Upcoming activities & sprints"
        description="Workshops, guest sessions, contests and submission deadlines, in order."
        meta={
          <a href="/activities/calendar.ics" className="inline-flex min-h-11 items-center gap-2 text-gold hover:text-fg">
            <Calendar size={14} /> Add all to your calendar (.ics)
          </a>
        }
      />

      <div className="space-y-12">
        {groupByMonth(activities).map(([month, items]) => (
          <section key={month}>
            <h2 className="mb-4 tabular-nums text-xs uppercase tracking-[0.14em] text-dim">{month}</h2>
            <ul className="divide-y divide-line rounded-xl border border-line bg-panel/60">
              {items.map((a) => {
                const { day, month: mon } = dayParts(a.startsAt);
                return (
                  <li key={a.id} className="flex flex-wrap items-center gap-5 p-5 sm:flex-nowrap">
                    <div className="w-14 shrink-0 text-center tabular-nums">
                      <div className="text-2xl leading-none text-gold">{day}</div>
                      <div className="mt-1 text-[11px] tracking-[0.12em] text-dim">{mon}</div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-medium text-fg">{a.title}</h3>
                      <p className="mt-1 text-sm text-muted">{a.description}</p>
                      <p className="mt-2 tabular-nums text-xs text-dim">
                        {formatEventStamp(a.startsAt)} · {a.location}
                      </p>
                    </div>
                    <Tag kind={a.kind} />
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
