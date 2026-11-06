import Link from "next/link";
import { formatDate } from "@/lib/format";
import type { Bulletin } from "@/lib/types";
import { ArrowRight } from "./icons";
import { Tag } from "./Tag";

export function BulletinCard({ bulletin, expanded = false }: { bulletin: Bulletin; expanded?: boolean }) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-line bg-panel/60 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <Tag kind={bulletin.tag} />
        <time dateTime={bulletin.publishedAt} className="tabular-nums text-xs text-dim">
          {formatDate(bulletin.publishedAt)}
        </time>
      </div>
      <h3 className="mt-4 text-[15px] font-medium leading-snug text-fg">{bulletin.title}</h3>
      {expanded && <p className="mt-2 text-sm leading-relaxed text-muted">{bulletin.body}</p>}
      {bulletin.links && bulletin.links.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {bulletin.links.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-lg px-4 text-sm font-medium transition ${
                i === 0 ? "bg-gold text-ink hover:bg-gold/90" : "border border-line-2 text-fg hover:border-muted"
              }`}
            >
              {l.label} <ArrowRight size={14} />
            </Link>
          ))}
        </div>
      )}
      <div className="min-h-5 flex-1" />
      <div className="border-t border-line pt-4 text-xs text-muted">{bulletin.author}</div>
    </article>
  );
}
