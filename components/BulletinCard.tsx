import { formatDate } from "@/lib/format";
import type { Bulletin } from "@/lib/types";
import { ArrowUpRight } from "./icons";
import { Tag } from "./Tag";

export function BulletinCard({ bulletin, expanded = false }: { bulletin: Bulletin; expanded?: boolean }) {
  return (
    <article className="group flex h-full flex-col rounded-xl border border-line bg-panel/60 p-5 transition hover:border-line-2 hover:bg-panel">
      <div className="flex items-center justify-between gap-3">
        <Tag kind={bulletin.tag} />
        <time dateTime={bulletin.publishedAt} className="font-mono text-xs text-dim">
          {formatDate(bulletin.publishedAt)}
        </time>
      </div>
      <h3 className="mt-4 text-[15px] font-medium leading-snug text-fg">{bulletin.title}</h3>
      {expanded && <p className="mt-2 text-sm leading-relaxed text-muted">{bulletin.body}</p>}
      <div className="min-h-5 flex-1" />
      <div className="flex items-center justify-between border-t border-line pt-4 text-xs text-muted">
        <span>{bulletin.author}</span>
        <ArrowUpRight size={14} className="text-dim transition group-hover:text-gold" />
      </div>
    </article>
  );
}
