import type { Metadata } from "next";
import { MilestoneView } from "@/components/MilestoneView";

export const metadata: Metadata = { title: "Low-Corr Sprint" };

export default function LowCorrSprintPage() {
  return <MilestoneView id="low-corr-sprint" />;
}
