import type { Metadata } from "next";
import { OpportunityView } from "@/components/OpportunityView";

export const metadata: Metadata = { title: "Master Criteria" };

export default function MasterPage() {
  return <OpportunityView id="master" />;
}
