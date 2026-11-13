import type { Metadata } from "next";
import { FaqSection } from "@/components/FaqSection";
import { OpportunityView } from "@/components/OpportunityView";

export const metadata: Metadata = { title: "QRAP Internship Elective (Jan to May 2027)" };

export default function QrapElectivePage() {
  return (
    <>
      <OpportunityView id="qrap-elective" />
      <FaqSection />
    </>
  );
}
