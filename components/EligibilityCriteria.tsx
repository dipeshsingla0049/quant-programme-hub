import type { EligibilityRule } from "@/lib/types";

/** The criteria box on each milestone page. */
export function EligibilityCriteria({
  id,
  title,
  rules,
  className = "",
  sectionId,
}: {
  /** Heading id, for aria-labelledby. Must be unique on the page. */
  id: string;
  title: string;
  rules: EligibilityRule[];
  className?: string;
  /** Optional id on the section itself, for in-page links. */
  sectionId?: string;
}) {
  return (
    <section id={sectionId} aria-labelledby={id} className={`rounded-xl border border-line bg-panel/60 p-6 sm:p-8 ${className}`}>
      <p className="text-[11px] uppercase tracking-[0.12em] text-gold">Eligibility criteria</p>
      <h2 id={id} className="mt-2 text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
        {title}
      </h2>
      <p className="mt-2 text-sm text-muted">
        {rules.length > 1 ? "Meet all of these to be eligible." : "Meet this to be eligible."}
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {rules.map((rule) => (
          <li key={rule.label} className="rounded-lg border border-line-2 bg-ink/60 p-5">
            <p className="whitespace-nowrap text-3xl tabular-nums text-gold">{rule.value}</p>
            <p className="mt-2 text-sm leading-snug text-fg">{rule.label}</p>
            {rule.note && <p className="mt-2 text-xs leading-relaxed text-dim">{rule.note}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
