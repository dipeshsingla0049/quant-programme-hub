import { EligibilityCriteria } from "@/components/EligibilityCriteria";
import { ArrowRight, Lock, Trophy } from "@/components/icons";
import { MilestoneBadge } from "@/components/MilestoneBadge";
import { MilestoneBoard, type BoardColumn } from "@/components/MilestoneBoard";
import { PageHeader } from "@/components/PageHeader";
import { WindowCountdown } from "@/components/WindowCountdown";
import { formatDay, formatDayRange } from "@/lib/format";
import { getMilestone, type MilestoneId, type Rule } from "@/lib/milestones";
import { getStandings, latestReportDate, missingReportDates, ruleTarget, weekOf } from "@/lib/standings";

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

/** Full page for one November milestone: window, reward, criteria and leaderboard. */
export function MilestoneView({ id }: { id: MilestoneId }) {
  const m = getMilestone(id);
  const windowText = m.end ? formatDayRange(m.start, m.end) : `From ${formatDay(m.start)}, every week`;
  const winners = m.ranking?.winners;
  const passFail = m.board === "passFail";
  const s = getStandings(id);
  const week = s.week;

  // The "right now" box.
  let now: React.ReactNode;
  if (!s.asOf) {
    now = (
      <p className="text-sm leading-relaxed text-muted">
        Standings start with the first daily report, covering {formatDay(m.start)}.
      </p>
    );
  } else if (winners) {
    now = (
      <>
        <p className="text-3xl font-semibold tracking-tight text-fg">Are you in the top {winners}?</p>
        {s.cutoff && (
          <p className="mt-2 text-sm text-muted">
            Cut-off right now: {METRIC_LABEL[m.ranking!.metric] ?? m.ranking!.metric} {s.cutoff}
          </p>
        )}
        <a href="#standings" className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-gold hover:text-fg">
          Find yourself in the leaderboard <ArrowRight size={14} />
        </a>
      </>
    );
  } else if (passFail && week) {
    now = (
      <>
        <p className="text-4xl font-semibold tabular-nums text-fg">
          {s.prize}
          <span className="text-xl text-dim"> / {s.standings.length}</span>
        </p>
        <p className="mt-1 text-sm text-muted">have cleared week {week.number} so far</p>
        <p className="mt-3 text-xs text-dim">Week {week.number}: {formatDayRange(week.start, week.end)}</p>
      </>
    );
  } else {
    now = (
      <>
        <p className="text-4xl font-semibold tabular-nums text-fg">{s.prize}</p>
        <p className="mt-1 text-sm text-muted">completed so far</p>
        <p className="mt-3 text-xs text-dim">{s.standings.length} researchers have submitted since {formatDay(m.start)}</p>
      </>
    );
  }

  const zoneLabels = passFail
    ? {
        prize: { title: `Cleared week ${week?.number ?? 1} so far`, empty: "No one has cleared this week yet." },
        qualified: { title: "Cleared" },
        pending: { title: "Not cleared yet", empty: "Everyone has cleared this week." },
      }
    : winners
      ? {
          prize: { title: `Top ${winners} · potential ${m.reward.replace(" each", "")} winners`, empty: "No one has qualified yet." },
          qualified: { title: `Qualified · outside the top ${winners}` },
          pending: { title: "Not qualified yet", empty: "Everyone who has submitted has qualified." },
        }
      : {
          prize: { title: `Completed · ${m.reward} reward`, empty: "No one has completed the challenge yet." },
          qualified: { title: "Qualified" },
          pending: { title: "In progress", empty: "No one is in progress." },
        };
  const prizeStatus = passFail ? "Cleared" : winners ? `Potential ${m.reward.replace(" each", "")} winner` : "Completed";
  const rankingIsRule = m.rules.some((r) => r.metric === m.ranking?.metric);

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
        meta={s.asOf ? <>Standings from the {formatDay(s.asOf, true)} report. Updated daily.</> : <>Standings update daily from 7 Nov.</>}
      />

      <JumpLinks
        links={[
          ["#criteria", "Criteria"],
          ["#standings", "Leaderboard"],
          ["#how-it-works", "How it's calculated"],
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
          Among researchers who qualify, the lowest average production correlation ranks first. Ties go to the
          researcher with more simulations.
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
              {s.final ? "Final standings" : "Standings"} as of the {formatDay(s.asOf, true)} report.
              {passFail && week && (
                <>
                  {" "}
                  Week {week.number} ({formatDayRange(week.start, week.end)}) so far.{" "}
                  <span className="text-teal">Green</span>: cleared every rule. <span className="text-rose">Red</span>: not
                  yet.
                </>
              )}
              {!passFail && s.notStarted > 0 && ` ${s.notStarted} researchers haven't submitted in this window yet and aren't listed.`}
            </p>
            <MilestoneBoard
              standings={s.standings}
              style={m.board}
              scoreLabel={m.ranking && !rankingIsRule ? (METRIC_LABEL[m.ranking.metric] ?? m.ranking.metric) : null}
              columns={m.rules.map(columnFor)}
              zoneLabels={zoneLabels}
              prizeStatus={prizeStatus}
              winners={winners}
            />
          </>
        )}
      </section>

      <section id="how-it-works" aria-labelledby="how-title" className="mt-16 scroll-mt-40 2xl:scroll-mt-24">
        <h2 id="how-title" className="text-xl font-semibold tracking-tight text-fg">How it&apos;s calculated</h2>
        <ul className="mt-4 max-w-3xl list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
          <li>
            Standings come from the WorldQuant BRAIN partnership report, refreshed daily. From 7 Nov the report
            counts only activity since 7 Nov.
          </li>
          {m.rules.some((r) => r.metric === "submissionDays" || r.metric === "weekSubmissionDays") && (
            <li>
              A day counts as a submission day when your submission total went up since the previous day&apos;s
              report.
            </li>
          )}
          {m.rules.some((r) => r.metric === "weekSimulations") && (
            <li>Simulations each week are your total at the end of the week minus your total at the start.</li>
          )}
          {m.rules.some((r) => r.metric === "datafieldsPerAlpha") && (
            <li>
              The report gives average data fields and operators per alpha across all your alphas since 7 Nov, so
              that average is what&apos;s shown. The rule applies to every single alpha.
            </li>
          )}
          {m.end && (
            <li>Standings freeze with the {formatDay(m.end)} report. Results are confirmed by the programme team.</li>
          )}
          {missingReportDates.length > 0 && latestReportDate && (
            <li className="text-gold">
              No report for {missingReportDates.map((d) => formatDay(d)).join(", ")}. Submissions on a missing day
              are merged into the next day&apos;s report, so a submission day may be undercounted.
            </li>
          )}
          {passFail && (
            <li>
              Weeks run Saturday to Friday. Week 1 is {formatDayRange(weekOf(m.start).start, weekOf(m.start).end)}.
              A new week starts everyone at zero, so early in the week most rows are red.
            </li>
          )}
        </ul>
      </section>
    </>
  );
}
