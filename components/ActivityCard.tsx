import { formatEventStamp } from "@/lib/format";
import type { Activity, LocationType } from "@/lib/types";
import { Broadcast, Globe, MapPin } from "./icons";
import { Tag } from "./Tag";

const LOCATION_ICON: Record<LocationType, typeof MapPin> = {
  venue: MapPin,
  virtual: Broadcast,
  portal: Globe,
};

export function ActivityCard({ activity }: { activity: Activity }) {
  const Icon = LOCATION_ICON[activity.locationType];
  return (
    <article className="flex h-full flex-col rounded-xl border border-line bg-panel/60 p-5 transition hover:border-line-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tag kind={activity.kind} />
        <time dateTime={activity.startsAt} className="font-mono text-xs text-dim">
          {formatEventStamp(activity.startsAt)}
        </time>
      </div>
      <h3 className="mt-4 text-[15px] font-medium leading-snug text-fg">{activity.title}</h3>
      <div className="mt-auto flex items-center gap-2 pt-6 text-xs text-muted">
        <Icon size={14} />
        {activity.location}
      </div>
    </article>
  );
}
