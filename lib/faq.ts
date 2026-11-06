/**
 * FAQ content, summarised from the official WorldQuant BRAIN Genius FAQ
 * (support.worldquantbrain.com, read Nov 6, 2026) and the 2026-Q4 Genius
 * status page. BRAIN can change thresholds every quarter: re-check the
 * source before each quarter and update FAQ_META.checkedOn.
 */

export type FaqBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][] };

export interface FaqItem {
  id: string;
  q: string;
  a: FaqBlock[];
}

export interface FaqCategory {
  id: string;
  title: string;
  items: FaqItem[];
}

export const FAQ_META = {
  checkedOn: "Nov 6, 2026",
  quarter: "2026-Q4",
  sourceUrl: "https://support.worldquantbrain.com/hc/en-us/categories/26715648205207",
};

export const FAQ: FaqCategory[] = [
  {
    id: "genius-levels",
    title: "Genius levels",
    items: [
      {
        id: "what-is-genius",
        q: "What is the BRAIN Genius program?",
        a: [
          {
            type: "p",
            text: "A level system for BRAIN consultants. Higher levels unlock more data, operators, tools and earning potential. There are four levels: Gold (where every new consultant starts), Expert, Master and Grandmaster.",
          },
        ],
      },
      {
        id: "how-often",
        q: "How often are levels decided?",
        a: [
          {
            type: "p",
            text: "Every calendar quarter. Your work in one quarter decides your level for the next, so everyone gets a fresh chance each quarter.",
          },
        ],
      },
      {
        id: "benefits",
        q: "What do I get at higher levels?",
        a: [
          {
            type: "list",
            items: [
              "Access to more research regions, datasets, data fields and operators.",
              "A wider pool of Alphas to build SuperAlphas from.",
              "Less frequent biometric sign-in.",
              "Certificates and badges.",
              "Master and Grandmaster consultants are more likely to be considered for WorldQuant internships and full-time roles.",
              "Higher quarterly payments: Master can reach $2,000 or more a quarter, Grandmaster $8,000 or more.",
            ],
          },
          {
            type: "table",
            head: ["", "Gold", "Expert", "Master", "Grandmaster"],
            rows: [
              ["Data fields available", "50%", "61%", "78%", "100%"],
              ["Operators available", "45%", "63%", "78%", "100%"],
              ["SuperAlpha component pool", "Own Alphas", "+ your university", "+ your country", "+ all consultants"],
              ["Biometric sign-in every", "4 hrs", "6 hrs", "12 hrs", "24 hrs"],
            ],
          },
        ],
      },
      {
        id: "slots",
        q: "How many people can reach each level?",
        a: [
          {
            type: "p",
            text: "Each level has a cap, as a share of consultants eligible for a quarterly payment (those who submitted in the previous quarter):",
          },
          {
            type: "table",
            head: ["Gold", "Expert", "Master", "Grandmaster"],
            rows: [["70%", "20%", "8%", "2%"]],
          },
        ],
      },
      {
        id: "drop-level",
        q: "What happens if I drop to a lower level?",
        a: [
          {
            type: "p",
            text: "You lose the extra data, operators and features of the higher level, so you may not be able to re-simulate old Alphas that use them. To climb back, meet that level's criteria again in a later quarter.",
          },
        ],
      },
    ],
  },
  {
    id: "criteria",
    title: "Level criteria",
    items: [
      {
        id: "how-to-qualify",
        q: "How do I qualify for a higher level?",
        a: [
          { type: "p", text: "Meet three thresholds within the quarter:" },
          {
            type: "list",
            items: [
              "Signals: a minimum number of submissions. Alphas and SuperAlphas both count.",
              "Pyramids: a minimum number of completed pyramids.",
              "Combined performance: a minimum combined out-of-sample performance (Sharpe).",
            ],
          },
          {
            type: "p",
            text: "Thresholds rise with each level and are announced ahead of each quarter.",
          },
        ],
      },
      {
        id: "thresholds",
        q: "What are this quarter's thresholds?",
        a: [
          { type: "p", text: "For 2026-Q4 (Oct 1 – Dec 31, 2026), from the BRAIN Genius status page:" },
          {
            type: "table",
            head: ["", "Expert", "Master", "Grandmaster"],
            rows: [
              ["Signals submitted", "20", "120", "220"],
              ["Pyramids completed", "10", "30", "60"],
              ["Combined performance (any one)", "≥ 0.5", "≥ 1", "≥ 2"],
            ],
          },
          {
            type: "p",
            text: "Gold is the starting level, so it has no thresholds.",
          },
        ],
      },
      {
        id: "threshold-enough",
        q: "If I cross the thresholds, am I guaranteed the level?",
        a: [
          {
            type: "p",
            text: "No. Thresholds are pass/fail: clearing one by a little or a lot counts the same. If more people qualify than the level has slots, everyone who qualified is ranked on the tie-breakers below.",
          },
        ],
      },
    ],
  },
  {
    id: "pyramids",
    title: "Pyramids",
    items: [
      {
        id: "what-is-pyramid",
        q: "What is a pyramid?",
        a: [
          {
            type: "p",
            text: "A combination of region, delay and dataset category, for example USA · D1 · Analyst.",
          },
          {
            type: "list",
            items: [
              "You complete a pyramid by submitting at least 3 Alphas in it.",
              "One Alpha can count toward at most 2 pyramids. An Alpha touching more than 2 counts toward none, though it still counts for signals and other metrics.",
              "Grouping and neutralization fields (country, exchange, currency, market, sector, industry, subindustry) never add a pyramid.",
              "More pyramids also tend to help your Value Factor and combined performance through diversification.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "combined-performance",
    title: "Combined performance",
    items: [
      {
        id: "four-metrics",
        q: "What are the four combined performance measures?",
        a: [
          {
            type: "list",
            items: [
              "Combined Alpha Performance: all Alphas you submitted.",
              "Combined Selected Alpha Performance: your Alphas that WorldQuant selected.",
              "Combined Power Pool Alpha Performance: your Power Pool Alphas.",
              "Combined Osmosis Performance: your Osmosis allocation.",
            ],
          },
          {
            type: "p",
            text: "At the end of the quarter the highest of the four is used, so only one of them needs to meet the level's threshold.",
          },
        ],
      },
      {
        id: "evaluation-period",
        q: "What period does each measure cover, and when does it update?",
        a: [
          {
            type: "list",
            items: [
              "Alpha, Selected and Power Pool measures look back 24 months. Osmosis looks back 3 months.",
              "The measures refresh every 4–6 weeks.",
              "Alphas submitted in the quarter's last month may not be counted in time for that quarter's level. They still count for signals, pyramids and your Value Factor, and for next quarter's performance.",
              "Decommissioned Alphas are excluded.",
            ],
          },
        ],
      },
      {
        id: "osmosis",
        q: "Why is my Osmosis performance missing or jumping around?",
        a: [
          {
            type: "list",
            items: [
              "It only appears once you have 30 valid Osmosis PnL days in the last 3 months.",
              "Its 3-month window is short, so it can swing month to month even if you don't change your allocation. Judge it over the whole quarter.",
              "Osmosis allocation needs at least 3 qualifying scopes, each with 100,000 points and 10 Alphas.",
            ],
          },
        ],
      },
      {
        id: "regions",
        q: "How are different regions combined?",
        a: [
          {
            type: "p",
            text: "The exact method is proprietary. BRAIN recommends including some Alphas in the large Delay 1 universes (GLB, USA, EUR, ASI), which are more liquid and have more data fields.",
          },
        ],
      },
    ],
  },
  {
    id: "tie-breakers",
    title: "Tie-breakers",
    items: [
      {
        id: "tie-breaker-metrics",
        q: "How are tie-breakers decided?",
        a: [
          { type: "p", text: "By the sum of your ranks across these metrics:" },
          {
            type: "list",
            items: [
              "Average operators per Alpha (lower is better).",
              "Average data fields per Alpha (lower is better).",
              "Total distinct operators used (higher is better).",
              "Total distinct data fields used (higher is better).",
              "Longest simulation streak. It carries over between quarters, and one Streak Freeze per quarter covers your first missed day.",
              "Community activity: forum likes, referrals and events.",
            ],
          },
          {
            type: "p",
            text: "ts_backfill and group_backfill don't count toward operator metrics. Grouping fields count as data fields here, but not toward pyramids.",
          },
        ],
      },
      {
        id: "community",
        q: "How is community activity scored?",
        a: [
          {
            type: "table",
            head: ["Area", "Weight", "What counts"],
            rows: [
              ["Events", "60%", "Consultant Opportunity Webinars (2 pts), other group webinars (1 pt), offline meetups (1 pt). Attend webinars for at least 30 minutes."],
              ["Referrals", "20%", "Registered (0.5), became a consultant (1), successful (2), all within the quarter."],
              ["Forum", "20%", "Likes this quarter on posts and comments of 100+ characters."],
            ],
          },
          {
            type: "p",
            text: "The score is scaled from 0 to 100 and updates daily. Use the same email for webinars as on BRAIN so your attendance is counted.",
          },
        ],
      },
    ],
  },
  {
    id: "payments",
    title: "Payments & stipends",
    items: [
      {
        id: "value-factor",
        q: "What do I need for a quarterly stipend?",
        a: [
          {
            type: "p",
            text: "At least 20 unique submission days (Alphas or SuperAlphas) in the last 3 months. Without that, your Value Factor defaults to 0.5. It's the same 20-day rule as the QCAP leaderboard.",
          },
        ],
      },
      {
        id: "higher-payment",
        q: "How do I earn more within my level's range?",
        a: [
          {
            type: "p",
            text: "Your payment within your level's range depends on your weight and Value Factor. The Value Factor updates every 4–6 weeks, so the one used for a quarter appears 4–6 weeks after it ends.",
          },
        ],
      },
      {
        id: "gold-earning",
        q: "How can I earn while I'm still Gold?",
        a: [
          {
            type: "list",
            items: [
              "Base payouts for Alphas and SuperAlphas.",
              "Referral fees.",
              "Competition stipends.",
              "Offline meetups.",
            ],
          },
          {
            type: "p",
            text: "Focus on crossing the next level's thresholds first, then on improving your tie-breaker metrics.",
          },
        ],
      },
    ],
  },
  {
    id: "superalphas",
    title: "SuperAlphas",
    items: [
      {
        id: "superalpha-access",
        q: "Who can build SuperAlphas, and from which Alphas?",
        a: [
          {
            type: "list",
            items: [
              "Any consultant with 100 Alpha submissions can create SuperAlphas from their own Alphas.",
              "Expert adds Alphas from your university, Master adds your country, Grandmaster adds all consultants.",
              "Each day you submit a SuperAlpha from your own Alphas earns you one day to submit from the wider pool. The limit stays at 1 SuperAlpha per day.",
            ],
          },
        ],
      },
    ],
  },
];
