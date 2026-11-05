import type { Metadata } from "next";
import { BulletinCard } from "@/components/BulletinCard";
import { PageHeader } from "@/components/PageHeader";
import { getBulletins } from "@/lib/data";

export const metadata: Metadata = { title: "Bulletins" };

export default async function AnnouncementsPage() {
  const bulletins = await getBulletins();
  return (
    <>
      <PageHeader
        eyebrow="Bulletin archive"
        title="Official bulletins"
        description="Every announcement, deadline and result from the programme team, newest first."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {bulletins.map((b) => (
          <BulletinCard key={b.id} bulletin={b} expanded />
        ))}
      </div>
    </>
  );
}
