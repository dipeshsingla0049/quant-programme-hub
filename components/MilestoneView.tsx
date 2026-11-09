import { EligibilityCriteria } from "@/components/EligibilityCriteria";
import { ArrowRight, Lock, Trophy } from "@/components/icons";
import { MilestoneBadge } from "@/components/MilestoneBadge";
import { MilestoneBoard, type BoardColumn } from "@/components/MilestoneBoard";
import { PageHeader } from "@/components/PageHeader";
import { WindowCountdown } from "@/components/WindowCountdown";
import { formatDay, formatDayRange } from "@/lib/format";
import { getMilestone, type MilestoneId, type Rule } from "@/lib/milestones";
import {
  countOf,
  getStandings,
  paceFor,
  ruleTarget,
  trackedRules,
  type Tone,
} from "@/lib/standings";

const METRIC_LABEL: Record<string, string> = { avgProdCorr: "Avg prod corr", submissionDays: "Days" };

function columnFor(rule: Rule): BoardColumn {
  return { label: rule.short, target: ruleTarget(rule), of: rule.op === ">=" ? rule.value : undefined };
}

function Fact({ label, children, tone = "plain" }: { label: string; children: React.ReactNode; tone?: "plain" | "gold" | "rose" }) {
  const styles = {
    plain: "border-line bg-panel/60",
    gold: "border-gold/40 bg-gold/[0.06]",
    rose: "border-rose/30 bg-rose/[0.04]",
  }[tone];
  return (
    <div className={`flex min-w-0 flex-col rounded-xl border p-5 sm:p-6 ${styles}`}>
      <p className="text-[11px] uppercase tracking-[0.12em] text-dim">{label}</p>
      <div className="mt-3 flex-1">{children}</div>
    </div>
  );
}

function JumpLinks({ links }: { links: [string, string][] }) {
  return (
    <nav aria-label="On this page" className="mb-8 flex flex-wrap gap-2">
      {links.map(([href, label]) => (
        <a
          key={href}
          href={href}
          className="inline-flex min-h-11 items-center rounded-lg border border-line-2 bg-panel/60 px-4 text-sm text-fg transition hover:border-gold/60 hover:text-gold"
        >
          {label}
        </a>
      ))}
    </nav>
  );
}

const SWATCH: Record<Tone, string> = {
  green: "border-teal bg-teal/15",
  blue: "border-sky bg-sky/10",
  yellow: "border-amber-bright bg-amber-bright/25",
  red: "border-rose bg-rose/15",
  gold: "border-amber-bright bg-amber-bright/40",
  plain: "border-line-2 bg-panel",
  grey: "border-line-2 bg-panel-2",
};

/** What each colour on the board means. */
function Legend({ items }: { items: [Tone, string, string][] }) {
  return (
    <ul className="mb-6 grid gap-2 text-sm sm:grid-cols-2 xl:grid-cols-4">
      {items.map(([tone, title, text]) => (
        <li key={title} className="flex gap-3 rounded-lg border border-line bg-panel/60 p-3">
          <span aria-hidden className={`mt-0.5 h-4 w-4 shrink-0 rounded border-2 ${SWATCH[tone]}`} />
          <span>
            <span className="font-semibold text-fg">{title}</span>
            <span className="block text-xs leading-relaxed text-muted">{text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Full page for one November milestone: window, reward, criteria and leaderboard. */
export function MilestoneView({ id }: { id: MilestoneId }) {
  const m = getMilestone(id);
  const windowText = m.end ? formatDayRange(m.start, m.end) : `From ${formatDay(m.start)}, every week`;
  const winners = m.ranking?.winners;
  const s = getStandings(id);
  const week = s.week;
  const prize = m.reward.replace(" each", "");
  const rules = trackedRules(m);
  const count = (g: string) => countOf(s, g);

  // The "right now" box.
  let now: React.ReactNode;
  if (!s.asOf) {
    now = (
      <p className="text-sm leading-relaxed text-muted">
        Standings start with the first daily report, covering {formatDay(m.start)}.
      </p>
    );
  } else if (m.board === "ranked") {
    now = (
      <>
        <p className="text-3xl font-semibold tracking-tight text-fg">Are you in the top {winners}?</p>
        {s.cutoff && (
          <p className="mt-2 text-sm text-muted">
            Cut-off right now: {METRIC_LABEL[m.ranking!.metric] ?? m.ranking!.metric} {s.cutoff}
          </p>
        )}
        <p className="mt-1 text-sm text-muted">
          {count("top") + count("rest")} ranked · {m.ranking!.minAlphas}+ alphas
        </p>
        <a href="#standings" className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-gold hover:text-fg">
          Find yourself in the leaderboard <ArrowRight size={14} />
        </a>
      </>
    );
  } else {
    const weekly = m.board === "weekly";
    now = (
      <>
        <p className="text-4xl font-semibold tabular-nums text-fg">
          {count("green")}
          {weekly && <span className="text-xl text-dim"> / {s.total}</span>}
        </p>
        <p className="mt-1 text-sm text-muted">{weekly ? `completed week ${week?.number}` : `eligible for ${prize} so far`}</p>
        <p className="mt-3 text-sm">
          <span className="font-medium text-sky">{count("ontrack")} on track</span>
          {weekly && (
            <>
              <span className="text-dim"> · </span>
              <span className="font-medium text-amber">{count("atrisk")} at risk</span>
            </>
          )}
          <span className="text-dim"> · </span>
          <span className="font-medium text-rose">
            {count("red")} {weekly ? "very behind or breaking a rule" : "not eligible right now"}
          </span>
        </p>
        {weekly && week && (
          <p className="mt-2 text-xs text-dim">
            Week {week.number}: {formatDayRange(week.start, week.end)} · data up to day {s.weekDay} of 7
          </p>
        )}
      </>
    );
  }

  const ruleOf = (metric: string) => rules.find((r) => r.metric === metric);
  let legend: [Tone, string, string][] = [];
  if (m.board === "weekly" && s.weekDay) {
    const days = paceFor(ruleOf("weekSubmissionDays")!, s.weekDay - 1);
    const sims = paceFor(ruleOf("weekSimulations")!, s.weekDay - 1);
    legend = [
      ["green", `Completed week ${week?.number}`, "Every rule met for this week."],
      [
        "blue",
        "On track",
        `Keeping pace (day ${s.weekDay} of 7: at least ${days ? `${days} ${days === 1 ? "day" : "days"} and ` : ""}${sims.toLocaleString("en-US")} simulations so far), no rule broken.`,
      ],
      ["yellow", "At risk", "Behind pace, but 4 days are still reachable. Catch up this week."],
      [
        "red",
        "Very behind or breaking a rule",
        "No activity this week, can't reach 4 days, avg prod corr 0.8 or higher, or more than 4 data fields per alpha.",
      ],
    ];
  } else if (m.board === "target") {
    legend = [
      ["green", `Eligible for ${prize}`, "20 days, self-corr below 0.7 and at most 4 data fields per alpha."],
      ["blue", "On track", `Still time to reach 20 days by ${formatDay(m.end!)}, no limit broken.`],
      ["red", "Not eligible right now", "Self-corr 0.7 or higher, more than 4 data fields, or 20 days no longer reachable."],
      ["grey", "Not started", "No alphas submitted yet."],
    ];
  } else if (m.board === "ranked") {
    legend = [
      [
        "gold",
        `Top ${winners}`,
        `Lowest avg prod corr among everyone with ${m.ranking!.minAlphas}+ alphas and at most 4 data fields per alpha. A potential ${prize} winner once you have 10 alphas.`,
      ],
      ["plain", `Ranked ${winners! + 1} and below`, `Within the rules, outside the top ${winners}.`],
      ["red", "Can't win right now", "More than 4 data fields per alpha. Not ranked until it's back to 4 or fewer."],
      ["grey", "Not ranked yet · Not started", `Fewer than ${m.ranking!.minAlphas} alphas, or none yet.`],
    ];
  }
  const rankingIsRule = rules.some((r) => r.metric === m.ranking?.metric);

  return (
    <>
      <PageHeader
        eyebrow={`November milestone · ${windowText}`}
        title={
          <>
            {m.name} <MilestoneBadge badge={m.badge} size="lg" />
          </>
        }
        description={m.summary}
        meta={s.asOf ? <>Standings with data up to {formatDay(s.asOf, true)}. Updated daily.</> : <>Standings update daily from 7 Nov.</>}
      />

      <JumpLinks
        links={[
          ["#criteria", "Criteria"],
          ["#standings", "Leaderboard"],
        ]}
      />

      <section aria-label="Key facts" className="grid gap-4 md:grid-cols-3">
        <Fact label="Window">
          <p className="mb-4 text-lg font-medium text-fg">{windowText}</p>
          <WindowCountdown start={m.start} end={m.end} />
        </Fact>
        {m.stakes ? (
          <Fact label="What's at stake" tone="rose">
            <p className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-fg">
              <Lock size={20} className="text-rose" /> {m.reward}
            </p>
            <p className="mt-1 text-lg font-semibold text-rose">{m.rewardDetail}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">{m.stakes}</p>
          </Fact>
        ) : (
          <Fact label="Reward" tone="gold">
            <p className="flex items-center gap-2 text-4xl font-semibold tracking-tight text-gold">
              <Trophy size={24} /> {m.reward}
            </p>
            <p className="mt-2 text-sm text-fg">{m.rewardDetail}</p>
          </Fact>
        )}
        <Fact label="Right now">{now}</Fact>
      </section>

      <EligibilityCriteria
        id="criteria-title"
        title={m.ranking?.metric === "avgProdCorr" ? "Qualify, then go low" : "Meet all of these"}
        rules={m.rules.map((r) => ({ value: ruleTarget(r), label: r.label, note: r.note }))}
        className="mt-12 scroll-mt-40 2xl:scroll-mt-24"
        sectionId="criteria"
      />
      {m.ranking?.metric === "avgProdCorr" && (
        <p className="mt-3 text-sm text-muted">
          Everyone with {m.ranking.minAlphas} or more alphas and at most 4 data fields per alpha is ranked, lowest
          average production correlation first. Ties go to the researcher with more simulations. More than 4 data
          fields means you can&apos;t win. To be eligible for {prize} you need at least 10 alphas.
        </p>
      )}

      <section id="standings" aria-labelledby="standings-title" className="mt-16 scroll-mt-40 2xl:scroll-mt-24">
        <h2 id="standings-title" className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
          Leaderboard
        </h2>
        {!s.asOf ? (
          <p className="mt-6 rounded-xl border border-dashed border-line-2 bg-panel/40 px-5 py-10 text-center text-muted">
            The first standings appear after the {formatDay(m.start)} report is in.
          </p>
        ) : (
          <>
            <p className="mt-2 mb-6 text-sm text-muted">
              {s.final ? "Final standings" : "Standings"} with data up to {formatDay(s.asOf, true)}.
              {m.board === "weekly" && week && <> Week {week.number} ({formatDayRange(week.start, week.end)}) so far.</>}{" "}
              Search your name to see exactly what you still need.
            </p>
            <Legend items={legend} />
            <MilestoneBoard
              groups={s.groups}
              ranked={m.board === "ranked"}
              scoreLabel={m.ranking && !rankingIsRule ? (METRIC_LABEL[m.ranking.metric] ?? m.ranking.metric) : null}
              columns={rules.map(columnFor)}
              lastWeekLabel={m.board === "weekly" && week && week.number > 1 ? `Week ${week.number - 1}` : null}
            />
          </>
        )}
      </section>

    </>
  );
}
