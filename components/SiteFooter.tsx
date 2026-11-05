import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-10 sm:px-6 lg:px-8">
        <div className="font-serif text-lg text-fg">
          NST <span className="text-muted">×</span> WorldQuant BRAIN
          <span className="ml-2 inline-block size-1.5 rounded-full bg-gold align-middle" />
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-6 text-sm text-muted">
          <Link href="/announcements" className="hover:text-fg">Bulletins</Link>
          <a href="https://platform.worldquantbrain.com" className="hover:text-fg" target="_blank" rel="noreferrer">
            BRAIN Platform
          </a>
        </nav>
      </div>
    </footer>
  );
}
