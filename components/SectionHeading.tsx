import Link from "next/link";
import { ChevronRight } from "./icons";

interface Props {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  action?: { href: string; label: string };
  aside?: React.ReactNode;
}

export function SectionHeading({ title, subtitle, badge, action, aside }: Props) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-serif text-2xl text-fg sm:text-[28px]">{title}</h2>
          {badge}
        </div>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-gold transition hover:text-fg"
        >
          {action.label}
          <ChevronRight size={14} />
        </Link>
      )}
      {aside}
    </div>
  );
}
