import { notFound } from "next/navigation";
import { CheckCircle, Trophy } from "@/components/icons";
import { PageHeader } from "@/components/PageHeader";
import { getOpportunity } from "@/lib/data";
import type { Opportunity } from "@/lib/types";

/** Full page for one reward: Goa Trip, Master or QRAP Internship. */
export async function OpportunityView({ id }: { id: Opportunity["id"] }) {
  const o = await getOpportunity(id);
  if (!o) notFound();

  return (
    <>
      <PageHeader eyebrow="Rewards" title={o.title} description={o.summary} />

      <div className={`grid gap-4 ${o.reward ? "lg:grid-cols-[1.4fr_1fr]" : ""}`}>
        <section aria-labelledby="criteria" className="rounded-2xl border border-line bg-panel/60 p-6 sm:p-8">
          <h2 id="criteria" className="text-[11px] uppercase tracking-[0.12em] text-dim">
            Criteria
          </h2>
          {o.criteria.length ? (
            <ul className="mt-5 space-y-4">
              {o.criteria.map((c) => (
                <li key={c} className="flex gap-3 text-lg text-fg">
                  <CheckCircle size={22} className="mt-0.5 shrink-0 text-teal" />
                  {c}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 rounded-lg border border-dashed border-line-2 px-5 py-6 text-center text-muted">
              Criteria coming soon.
            </p>
          )}
        </section>

        {o.reward && (
          <section
            aria-labelledby="reward"
            className="flex flex-col rounded-2xl border border-gold/40 bg-gold/[0.06] p-6 sm:p-8"
          >
            <h2 id="reward" className="text-[11px] uppercase tracking-[0.12em] text-gold">
              Reward
            </h2>
            <span className="mt-5 inline-flex size-12 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold">
              <Trophy size={22} />
            </span>
            <p className="mt-4 text-2xl font-semibold tracking-tight text-fg">{o.reward}</p>
          </section>
        )}
      </div>
    </>
  );
}
