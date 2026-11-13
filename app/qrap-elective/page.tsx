import type { Metadata } from "next";
import { FaqSection } from "@/components/FaqSection";
import { OpportunityView } from "@/components/OpportunityView";

export const metadata: Metadata = { title: "QRAP Internship Elective" };

export default function QrapElectivePage() {
  return (
    <>
      <OpportunityView id="qrap-elective" />
      <FaqSection />
    </>
  );
}
