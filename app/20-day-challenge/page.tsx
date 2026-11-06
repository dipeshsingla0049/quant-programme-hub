import type { Metadata } from "next";
import { MilestoneView } from "@/components/MilestoneView";

export const metadata: Metadata = { title: "20-Day Challenge" };

export default function TwentyDayChallengePage() {
  return <MilestoneView id="20-day-challenge" />;
}
