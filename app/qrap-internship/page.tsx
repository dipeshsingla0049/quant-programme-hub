import type { Metadata } from "next";
import { OpportunityView } from "@/components/OpportunityView";

export const metadata: Metadata = { title: "QRAP Internship" };

export default function QrapInternshipPage() {
  return <OpportunityView id="qrap-internship" />;
}
