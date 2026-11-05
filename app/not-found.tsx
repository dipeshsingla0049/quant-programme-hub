import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-32 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-gold">404</p>
      <h1 className="mt-4 font-serif text-4xl text-fg">This page isn&apos;t on the leaderboard.</h1>
      <Link href="/" className="mt-8 inline-flex min-h-11 items-center text-sm text-gold hover:text-fg">
        Back to home
      </Link>
    </div>
  );
}
