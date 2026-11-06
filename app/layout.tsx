import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getBulletins } from "@/lib/data";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Quant Research Hub · NST × WorldQuant BRAIN",
    template: "%s · Quant Research Hub",
  },
  description:
    "Announcements, rankings, milestones, rewards and activities for the Newton School of Technology quant programme on WorldQuant BRAIN.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const bulletins = await getBulletins();
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased">
        <SiteHeader announcementIds={bulletins.map((b) => b.id)} />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
