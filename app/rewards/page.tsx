import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { FeaturedReward, RewardCard } from "@/components/RewardCards";
import { getRewards } from "@/lib/data";

export const metadata: Metadata = { title: "Rewards" };

export default async function RewardsPage() {
  const rewards = await getRewards();
  const featured = rewards.filter((r) => r.featured);
  const others = rewards.filter((r) => !r.featured);

  return (
    <>
      <PageHeader
        eyebrow="Rewards & Pathways"
        title="Opportunities for top performers"
        description="What the programme offers its leading researchers, and who qualifies."
      />
      <div className="space-y-4">
        {featured.map((r) => (
          <FeaturedReward key={r.id} reward={r} />
        ))}
        <div className="grid gap-4 md:grid-cols-2">
          {others.map((r) => (
            <RewardCard key={r.id} reward={r} showPerks />
          ))}
        </div>
      </div>
    </>
  );
}
