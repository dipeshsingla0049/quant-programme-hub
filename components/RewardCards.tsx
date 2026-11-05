import type { Reward } from "@/lib/types";
import { CheckCircle, Star, Wallet } from "./icons";

export function FeaturedReward({ reward }: { reward: Reward }) {
  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-xl border border-gold/40 bg-linear-to-br from-panel-2 via-panel to-ink p-6 sm:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-gold/10 blur-3xl"
      />
      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-md border border-gold/30 bg-gold/10 px-2.5 py-1 font-mono text-[11px] text-gold">
          <Star size={12} />
          {reward.badge}
        </span>
        <span className="font-mono text-xs text-dim">{reward.period}</span>
      </div>
      <h3 className="relative mt-6 max-w-xl font-serif text-3xl leading-tight text-fg sm:text-4xl">{reward.title}</h3>
      <p className="relative mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-[15px]">{reward.description}</p>
      <div className="min-h-8 flex-1" />
      <ul className="relative flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gold">
        <CheckCircle size={14} />
        {reward.perks.map((perk, i) => (
          <li key={perk} className="flex items-center gap-2">
            {i > 0 && <span className="text-dim" aria-hidden>·</span>}
            {perk}
          </li>
        ))}
      </ul>
    </article>
  );
}

export function RewardCard({ reward, showPerks = false }: { reward: Reward; showPerks?: boolean }) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-line bg-panel/60 p-6">
      <span className="inline-flex size-10 items-center justify-center rounded-lg border border-teal/30 bg-teal/10 text-teal">
        <Wallet size={18} />
      </span>
      <h3 className="mt-5 font-serif text-xl leading-snug text-fg">{reward.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{reward.description}</p>
      {showPerks && (
        <ul className="mt-4 space-y-2 text-sm text-fg">
          {reward.perks.map((perk) => (
            <li key={perk} className="flex items-center gap-2">
              <CheckCircle size={14} className="text-teal" />
              {perk}
            </li>
          ))}
        </ul>
      )}
      <div className="min-h-6 flex-1" />
      <div className="flex items-center justify-between font-mono text-xs text-dim">
        <span className="text-gold">{reward.badge}</span>
        <span>{reward.period}</span>
      </div>
    </article>
  );
}
