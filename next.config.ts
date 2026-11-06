import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

export default function config(phase: string): NextConfig {
  return {
    reactStrictMode: true,
    // `next dev` and `next build` get separate output folders, so running a
    // build while the dev server is up can't overwrite the dev server's files.
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
    // The Rewards page was split into /goa-trip, /master and /qrap-internship.
    async redirects() {
      return [
        { source: "/rewards", destination: "/", permanent: false },
        // The FAQ now lives on the Master page.
        { source: "/faq", destination: "/master#faq", permanent: false },
      ];
    },
  };
}
