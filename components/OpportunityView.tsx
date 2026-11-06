import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle, Lock, Trophy } from "@/components/icons";
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

      {o.reward && (
        <section
          aria-label="Reward"
          className="mb-6 flex items-center gap-4 rounded-2xl border border-gold/40 bg-gold/[0.08] px-5 py-4 sm:gap-5 sm:px-6 sm:py-5"
        >
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold sm:size-12">
            <Trophy size={20} />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.12em] text-gold">Reward</p>
            <p className="mt-0.5 text-lg font-semibold tracking-tight text-fg sm:text-xl">{o.reward}</p>
          </div>
        </section>
      )}

      <section aria-labelledby="criteria">
        <h2 id="criteria" className="mb-3 text-[11px] uppercase tracking-[0.12em] text-dim">
          Criteria
        </h2>

        {o.criteria.length ? (
          <div className={`grid gap-4 ${o.criteria.length > 1 ? "md:grid-cols-2" : ""}`}>
            {o.criteria.map((g) => (
              <div key={g.heading} className="rounded-2xl border border-line bg-panel/60 p-5 sm:p-6">
                <h3 className="text-lg font-semibold tracking-tight text-fg">{g.heading}</h3>
                {g.note && (
                  <p className="mt-2 rounded-lg border border-teal/30 bg-teal/[0.06] px-3.5 py-2.5 text-sm text-teal">
                    {g.note}
                  </p>
                )}
                <ul className="mt-4 space-y-3">
                  {g.items.map((c) => (
                    <li key={c.label} className="flex items-start gap-3 text-[15px] text-fg">
                      <CheckCircle size={18} className="mt-0.5 shrink-0 text-teal" />
                      <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2.5 gap-y-1">
                        <span>{c.label}</span>
                        {c.mandatory && (
                          <span className="rounded-md border border-rose/30 bg-rose/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-rose">
                            Mandatory
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-line-2 bg-panel/40 px-5 py-8 text-center text-muted">
            <Lock size={16} /> To be unlocked
          </p>
        )}
      </section>

      {/* The Master page shows the FAQ itself, right below. */}
      {id !== "master" && (
        <Link
          href="/master#faq"
          className="mt-8 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-gold transition hover:text-fg"
        >
          Questions about levels and criteria? Read the FAQ <ArrowRight size={14} />
        </Link>
      )}
    </>
  );
}
