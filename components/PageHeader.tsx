export function PageHeader({
  eyebrow,
  title,
  description,
  meta,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  meta?: React.ReactNode;
}) {
  return (
    <header className="pb-10 pt-14 sm:pt-20">
      <p className="tabular-nums text-[11px] uppercase tracking-[0.14em] text-gold">{eyebrow}</p>
      <h1 className="mt-4 max-w-3xl font-semibold tracking-tight text-4xl leading-[1.05] text-fg sm:text-5xl lg:text-6xl">{title}</h1>
      {description && <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted sm:text-base">{description}</p>}
      {meta && <div className="mt-4 text-sm text-dim">{meta}</div>}
    </header>
  );
}
