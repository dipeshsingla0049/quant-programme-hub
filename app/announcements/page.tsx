import type { Metadata } from "next";
import { BulletinCard } from "@/components/BulletinCard";
import { PageHeader } from "@/components/PageHeader";
import { getBulletins } from "@/lib/data";

export const metadata: Metadata = { title: "Announcements" };

export default async function AnnouncementsPage() {
  const bulletins = await getBulletins();
  return (
    <>
      <PageHeader
        eyebrow="Announcements"
        title="Latest announcements"
        description="Updates from the programme team, newest first."
      />
      <div className={`grid gap-4 ${bulletins.length > 1 ? "md:grid-cols-2" : "max-w-3xl"}`}>
        {bulletins.map((b) => (
          <BulletinCard key={b.id} bulletin={b} expanded />
        ))}
      </div>
    </>
  );
}
