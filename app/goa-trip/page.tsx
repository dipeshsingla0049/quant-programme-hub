import type { Metadata } from "next";
import { OpportunityView } from "@/components/OpportunityView";

export const metadata: Metadata = { title: "Goa Trip" };

export default function GoaTripPage() {
  return <OpportunityView id="goa-trip" />;
}
