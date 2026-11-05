"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Terminal } from "./icons";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/rankings", label: "Rankings" },
  { href: "/milestones", label: "Milestones" },
  { href: "/rewards", label: "Rewards" },
  { href: "/announcements", label: "Announcements" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SiteHeader({ unread }: { unread: number }) {
  const pathname = usePathname();

  const links = NAV.map((item) => {
    const active = isActive(pathname, item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={`relative inline-flex min-h-11 items-center whitespace-nowrap px-1 text-sm transition ${
          active ? "text-gold" : "text-muted hover:text-fg"
        }`}
      >
        {item.label}
        {active && <span className="absolute inset-x-0 bottom-1.5 h-px bg-gold" />}
      </Link>
    );
  });

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-h-11 shrink-0 items-center gap-3">
          <span className="inline-flex size-8 items-center justify-center rounded-md border border-line-2 bg-panel-2 text-gold">
            <Terminal size={16} />
          </span>
          <span className="whitespace-nowrap rounded border border-gold/30 bg-gold/10 px-2 py-0.5 font-mono text-[11px] text-gold">
            Quant Research Hub
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-4 md:flex lg:gap-6">
          {links}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link
            href="/announcements"
            aria-label={`Announcements, ${unread} new`}
            className="relative inline-flex size-11 items-center justify-center text-muted transition hover:text-fg"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute right-2 top-2 inline-flex size-4 items-center justify-center rounded-full bg-gold font-mono text-[10px] font-semibold text-ink">
                {unread}
              </span>
            )}
          </Link>
        </div>
      </div>

      <nav aria-label="Main mobile" className="flex gap-5 overflow-x-auto border-t border-line px-4 md:hidden">
        {links}
      </nav>
    </header>
  );
}
