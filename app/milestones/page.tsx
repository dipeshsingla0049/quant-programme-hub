import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { PageHeader } from "@/components/PageHeader";
import { Tag } from "@/components/Tag";
import { getMilestones, getStageCounts } from "@/lib/data";

export const metadata: Metadata = { title: "Milestones" };

export default async function MilestonesPage() {
  const [stages, counts] = await Promise.all([getMilestones(), getStageCounts()]);

  return (
    <>
      <PageHeader
        eyebrow="Milestones"
        title={
          <>
            The path to <em className="text-gold">Master</em> and <em className="text-gold">Grandmaster</em>
          </>
        }
        description="Each stage unlocks something new. Here is what it takes to reach it and what it gets you."
      />

      <ol className="relative border-l border-line pl-8 sm:pl-12">
        {stages.map((s) => (
          <li key={s.id} className="relative pb-12 last:pb-0">
            <span
              aria-hidden
              className={`absolute -left-[41px] top-1 inline-flex size-[18px] items-center justify-center rounded-full border sm:-left-[57px] ${
                s.prestige ? "border-gold bg-gold/20" : "border-line-2 bg-panel-2"
              }`}
            >
              <span className={`size-1.5 rounded-full ${s.prestige ? "bg-gold" : "bg-muted"}`} />
            </span>
            <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs uppercase tracking-[0.12em] text-dim">Stage {s.order}</span>
                  {s.prestige && <Tag kind="Prestige">Prestige tier</Tag>}
                </div>
                <h2 className={`mt-2 font-serif text-4xl ${s.prestige ? "text-gold" : "text-fg"}`}>{s.name}</h2>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">{s.summary}</p>
              </div>
              <div
                className={`grid gap-5 rounded-xl border p-6 sm:grid-cols-2 ${
                  s.prestige ? "border-gold/40 bg-gold/[0.05]" : "border-line bg-panel/60"
                }`}
              >
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-dim">To reach it</p>
                  <p className="mt-2 text-sm leading-relaxed text-fg">{s.requirement}</p>
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-dim">What you unlock</p>
                  <p className="mt-2 text-sm leading-relaxed text-fg">{s.unlocks}</p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <section className="mt-20">
        <h2 className="mb-6 font-serif text-2xl text-fg sm:text-[28px]">Where the cohort stands</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stages.map((s) => (
            <div key={s.id} className="rounded-xl border border-line bg-panel/60 p-6">
              <p className="text-sm text-muted">{s.name}</p>
              <p className={`mt-3 font-mono text-4xl tabular-nums ${s.prestige ? "text-gold" : "text-fg"}`}>
                {counts[s.id] ?? "—"}
              </p>
              <p className="mt-1 text-xs text-dim">
                {counts[s.id] === null ? "not in the report yet" : "participants at this stage"}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20 flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-gold/40 bg-gold/[0.06] p-8 sm:p-10">
        <div className="max-w-xl">
          <h2 className="font-serif text-3xl leading-tight text-fg sm:text-4xl">Grandmasters earn the Goa retreat</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            Reaching Grandmaster and finishing in the top ranks qualifies you for the programme&apos;s flagship reward.
          </p>
        </div>
        <Link
          href="/rankings"
          className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-gold px-6 text-sm font-semibold text-ink transition hover:bg-gold/90"
        >
          Check the leaderboard <ArrowRight size={16} />
        </Link>
      </section>
    </>
  );
}
