import type { Metadata } from "next";
import { MilestoneView } from "@/components/MilestoneView";

export const metadata: Metadata = { title: "$120 Challenge" };

export default function TwentyDayChallengePage() {
  return <MilestoneView id="20-day-challenge" />;
}
