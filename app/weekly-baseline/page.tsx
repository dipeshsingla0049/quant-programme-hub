import type { Metadata } from "next";
import { MilestoneView } from "@/components/MilestoneView";

export const metadata: Metadata = { title: "Weekly Baseline" };

export default function WeeklyBaselinePage() {
  return <MilestoneView id="weekly-baseline" />;
}
