import { CheckCircle } from "@/components/icons";
import { FAQ, FAQ_META, type FaqBlock } from "@/lib/faq";

function Block({ block }: { block: FaqBlock }) {
  if (block.type === "p") return <p className="leading-relaxed text-muted">{block.text}</p>;
  if (block.type === "list")
    return (
      <ul className="space-y-2">
        {block.items.map((item) => (
          <li key={item} className="flex gap-2.5 leading-relaxed text-muted">
            <CheckCircle size={16} className="mt-1 shrink-0 text-teal" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full min-w-[480px] border-collapse text-sm">
        <thead>
          <tr className="bg-panel-2">
            {block.head.map((h, i) => (
              <th key={i} scope="col" className="whitespace-nowrap px-4 py-2.5 text-left font-semibold text-fg">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, r) => (
            <tr key={r} className="border-t border-line">
              {row.map((cell, c) =>
                c === 0 && block.head[0] === "" ? (
                  <th key={c} scope="row" className="px-4 py-2.5 text-left font-medium text-fg">
                    {cell}
                  </th>
                ) : (
                  <td key={c} className="px-4 py-2.5 tabular-nums text-muted">
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** BRAIN Genius FAQ, shown on the QRAP Internship Elective page. Anchor: #faq. */
export function FaqSection() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="mt-20 scroll-mt-40 lg:scroll-mt-24">
      <p className="text-[11px] uppercase tracking-[0.12em] text-gold">FAQ</p>
      <h2 id="faq-title" className="mt-2 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
        BRAIN Genius, explained
      </h2>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
        Levels, criteria, pyramids, combined performance, tie-breakers and payments: everything you need to plan your
        quarter.
      </p>

      <nav aria-label="FAQ topics" className="mb-10 mt-6 flex flex-wrap gap-2">
        {FAQ.map((c) => (
          <a
            key={c.id}
            href={`#${c.id}`}
            className="inline-flex min-h-11 items-center rounded-lg border border-line-2 bg-panel/60 px-4 text-sm text-fg transition hover:border-gold/60 hover:text-gold"
          >
            {c.title}
          </a>
        ))}
      </nav>

      <div className="space-y-12">
        {FAQ.map((c) => (
          <div key={c.id} id={c.id} className="scroll-mt-40 lg:scroll-mt-24">
            <h3 className="mb-4 text-xl font-semibold tracking-tight text-fg sm:text-2xl">{c.title}</h3>
            <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-panel/60">
              {c.items.map((item) => (
                <details key={item.id} id={item.id} className="group scroll-mt-40 lg:scroll-mt-24">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left font-medium text-fg transition hover:bg-panel-2/60 [&::-webkit-details-marker]:hidden">
                    <span>{item.q}</span>
                    <span
                      aria-hidden
                      className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-line-2 text-muted transition group-open:rotate-45 group-open:border-gold/50 group-open:text-gold"
                    >
                      +
                    </span>
                  </summary>
                  <div className="space-y-4 px-5 pb-6 text-[15px]">
                    {item.a.map((block, i) => (
                      <Block key={i} block={block} />
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-12 rounded-xl border border-line bg-panel/40 p-5 text-sm leading-relaxed text-muted">
        Summarised from the{" "}
        <a href={FAQ_META.sourceUrl} target="_blank" rel="noreferrer" className="font-medium text-gold hover:text-fg">
          official BRAIN Genius FAQ
        </a>{" "}
        and the {FAQ_META.quarter} Genius status page, checked {FAQ_META.checkedOn}. BRAIN can change thresholds each
        quarter, so check there for the latest.
      </p>
    </section>
  );
}
