import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

export default function config(phase: string): NextConfig {
  return {
    reactStrictMode: true,
    // `next dev` and `next build` get separate output folders, so running a
    // build while the dev server is up can't overwrite the dev server's files.
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
  };
}
