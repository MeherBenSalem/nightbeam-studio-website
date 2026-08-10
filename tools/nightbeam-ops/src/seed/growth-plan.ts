import type {
  CadenceEvent,
  Kpi,
  OpsDatabase,
  ProductBet,
  Reminder,
  Task,
  Week,
} from "../store/types.js";

const DAILY: Array<[string, string, string]> = [
  ["2026-08-05", "Audit", "Freeze new random BBB models. Rank all 43 SKUs into Keep / Bundle / Kill."],
  ["2026-08-06", "Funnel", "Add CF/MR descriptions CTA → nightbeam.dev/store + Discord + Pro."],
  ["2026-08-07", "Hero A", "Rewrite Void Sentinel listing: demo video, Folia claims, competitor matrix."],
  ["2026-08-08", "Hero B", "Rewrite Elo + RegionVerse; cross-sell Astral Core."],
  ["2026-08-09", "Bundle", "Create NightBeam Server Essentials bundle ($24.99): Elo+RegionVerse+Fancy Menus."],
  ["2026-08-10", "Content", "Film 1x 60s Void Sentinel clip + 1x BrainRot pack showcase."],
  ["2026-08-11", "Ops", "Weekly scorecard: BBB sales, CF downloads delta, Discord joins, Pro checkouts."],
  ["2026-08-12", "Ship", "Publish SpawnerX vNext OR Infinity Rifts major update (pick one revenue driver)."],
  ["2026-08-13", "CF", "Update Jauml + RPG Attribute + Mob Lootbags (rewards + trust signals)."],
  ["2026-08-14", "Pro", "Launch Pro Discord role automation + #pro-support; push from website."],
  ["2026-08-15", "BBB", "25% weekend sale on configs + model mega-pack (BrainRot Vol1+2)."],
  ["2026-08-16", "MR", "Sync Modrinth org branding; move top mods under NightBeam org if possible."],
  ["2026-08-17", "Partner", "DM 10 Folia/SMP owners offering Void Sentinel / Astral trial keys."],
  ["2026-08-18", "Ops", "Scorecard + kill list execution (unlist SKUs with 0 sales + no strategic value)."],
  ["2026-08-19", "Content", "YouTube: 'Build an SMP stack with NightBeam' (15–20 min)."],
  ["2026-08-20", "CF", "Remnant Bosses + Much More Dungeons update; showcase screenshots."],
  ["2026-08-21", "BBB", "Ship one NEW mid-ticket plugin ($9.99–$14.99) solving Donut/SMP pain."],
  ["2026-08-22", "Community", "Discord event: NightBeam Friday playtest / showcase."],
  ["2026-08-23", "Ads test", "Optional $50 BBB bump OR Discord partner shout — measure CPA."],
  ["2026-08-24", "Reviews", "Ask every buyer last 30 days for a review (script + coupon)."],
  ["2026-08-25", "Ops", "Scorecard; Pro MRR check; adjust pricing on underperformers."],
  ["2026-08-26", "Launch", "Public 'NightBeam Store Week' announcement (@everyone + X + CF posts)."],
  ["2026-08-27", "CF", "Birth of Steve content push — trailer + update; attach Pro early access."],
  ["2026-08-28", "BBB", "AstralSMP Setup refresh + paid install add-on ($49 one-time)."],
  ["2026-08-29", "Collab", "1 creator collab (YouTube/TikTok SMP) with affiliate coupon."],
  ["2026-08-30", "Retention", "Email/Discord digest: changelog + Pro trial weekend."],
  ["2026-08-31", "Ops", "Month-end draft: revenue, top SKUs, content ROI."],
  ["2026-09-01", "Ship", "Freeze code; polish docs; prepare Sep sale calendar."],
  ["2026-09-02", "Review", "Customer interviews (5 buyers): why they bought / what blocked others."],
  ["2026-09-03", "Roadmap", "Lock Sep–Oct: 2 plugins, 1 CF flagship arc, 1 bundle, Pro features."],
  ["2026-09-04", "Clean", "Archive dead products; raise prices on proven heroes +10–15%."],
  ["2026-09-05", "Board", "CEO scorecard day: hit/miss vs targets; celebrate wins publicly."],
];

function weekForDate(dueDate: string): string {
  if (dueDate <= "2026-08-11") return "w1";
  if (dueDate <= "2026-08-18") return "w2";
  if (dueDate <= "2026-08-25") return "w3";
  if (dueDate <= "2026-09-01") return "w4";
  return "w5";
}

function parisRemindAt(dueDate: string): string {
  // CEST (+02:00) for Aug/early Sep 2026
  return `${dueDate}T09:00:00+02:00`;
}

export function buildSeedDatabase(): OpsDatabase {
  const now = new Date().toISOString();

  const weeks: Week[] = [
    {
      id: "w1",
      label: "W1 · Aug 5–11",
      theme: "Focus & funnel",
      goal: "Stop spreading thin. Pick revenue heroes. Fix conversion paths.",
      sortOrder: 1,
    },
    {
      id: "w2",
      label: "W2 · Aug 12–18",
      theme: "Ship money products",
      goal: "Release / relaunch 2 paid BBB SKUs + bundle heroes.",
      sortOrder: 2,
    },
    {
      id: "w3",
      label: "W3 · Aug 19–25",
      theme: "Audience → cash",
      goal: "Convert CF/MR traffic into Discord, Pro, and BBB purchases.",
      sortOrder: 3,
    },
    {
      id: "w4",
      label: "W4 · Aug 26–Sep 1",
      theme: "Events & proof",
      goal: "Public launch event, reviews, case studies, repeatable content.",
      sortOrder: 4,
    },
    {
      id: "w5",
      label: "W5 · Sep 2–5",
      theme: "Close & scorecard",
      goal: "Hit month KPIs, cut losers, lock Q4 roadmap.",
      sortOrder: 5,
    },
  ];

  const tasks: Task[] = DAILY.map(([dueDate, job, title], i) => {
    const id = `daily-${dueDate}`;
    return {
      id,
      dueDate,
      job,
      title,
      notes: "",
      status: "pending",
      priority: 2,
      tags: [job.toLowerCase().replace(/\s+/g, "-"), weekForDate(dueDate)],
      weekId: weekForDate(dueDate),
      createdAt: now,
      updatedAt: now,
    };
  });

  // Week-1 checklist extras
  const checklist: Array<[string, string, string]> = [
    ["2026-08-05", "Checklist", "Rank all 43 BBB SKUs: Keep / Bundle / Kill"],
    ["2026-08-05", "Checklist", "Stop publishing new meme/model SKUs until Sep 5"],
    ["2026-08-07", "Checklist", "Rewrite Void Sentinel listing + record 60s demo"],
    ["2026-08-06", "Checklist", "Add Discord + Store + Pro CTAs to top 5 CF/MR pages"],
    ["2026-08-09", "Checklist", "Create Server Essentials bundle draft pricing"],
    ["2026-08-05", "Checklist", "Enable/verify site analytics + weekly scorecard sheet"],
    ["2026-08-14", "Checklist", "Automate Pro Discord role + #pro-support channel"],
  ];
  for (const [dueDate, job, title] of checklist) {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 48);
    tasks.push({
      id: `check-${slug}`,
      dueDate,
      job,
      title,
      notes: "Week 1 checklist item",
      status: "pending",
      priority: 1,
      tags: ["checklist", weekForDate(dueDate)],
      weekId: weekForDate(dueDate),
      createdAt: now,
      updatedAt: now,
    });
  }

  const reminders: Reminder[] = tasks.map((t) => ({
    id: `rem-${t.id}`,
    taskId: t.id,
    remindAt: parisRemindAt(t.dueDate),
    sentAt: null,
    snoozeUntil: null,
  }));

  const productBets: ProductBet[] = [
    {
      id: "bet-void-sentinel",
      platform: "BuiltByBit",
      name: "Void Sentinel Anti-Cheat",
      why: "23 purchases @ $14.99 — rare high-ticket with room to be a category leader.",
      action: "Weekly updates, public detections changelog, Folia badge, video demo.",
      price: "$14.99 → $19.99 after proof",
      status: "active",
    },
    {
      id: "bet-server-essentials",
      platform: "BuiltByBit",
      name: "Server Essentials Bundle",
      why: "Configs sell volume but ARPU is low alone.",
      action: "Elo + RegionVerse + Fancy Menus + Daily Rewards @ $24.99.",
      price: "$24.99 bundle",
      status: "planned",
    },
    {
      id: "bet-brainrot-mega",
      platform: "BuiltByBit",
      name: "BrainRot Mega Pack",
      why: "Models are #1 purchase volume. Trend fades — harvest now.",
      action: "Vol1+Vol2+Christmas mega SKU; then stop new meme SKUs.",
      price: "$24.99–$29.99",
      status: "planned",
    },
    {
      id: "bet-astral",
      platform: "BuiltByBit",
      name: "Astral Core / AstralSMP",
      why: "High price, low volume — needs case studies + install service.",
      action: "Paid setup ($49–$99) + video walkthrough + support SLA for Pro.",
      price: "$14.99 + setup",
      status: "active",
    },
    {
      id: "bet-cf-heroes",
      platform: "CurseForge",
      name: "Jauml + RPG Attribute + Mob Leveling",
      why: "2.9M CF downloads = rewards pool + brand trust.",
      action: "Biweekly updates; description CTAs to Discord/Pro/Store; dependency chains.",
      price: "CF Rewards + Pro upsell",
      status: "active",
    },
    {
      id: "bet-birth-of-steve",
      platform: "CurseForge / Modrinth",
      name: "The Birth of Steve",
      why: "Flagship story IP; still in launch window.",
      action: "Weekly content drops; trailer; Pro early access builds.",
      price: "Attention → Pro",
      status: "active",
    },
    {
      id: "bet-donut-stack",
      platform: "Modrinth",
      name: "Donut stack (Auction/Orders/RTP)",
      why: "Strong MR niche maps to BBB server buyers.",
      action: "Cross-link paid BBB equivalents; premium SMP stack landing on site.",
      price: "Funnel to BBB",
      status: "planned",
    },
  ];

  const cadence: CadenceEvent[] = [
    { id: "cad-mon", whenLabel: "Every Mon 10:00", type: "Ops", what: "Scorecard: BBB sales, CF DL delta, Discord net, Pro MRR, site analytics", recurring: true },
    { id: "cad-wed", whenLabel: "Every Wed 18:00", type: "Ship", what: "One public update (CF or BBB) + Discord changelog", recurring: true },
    { id: "cad-fri", whenLabel: "Every Fri 20:00", type: "Community", what: "NightBeam Friday: showcase, Q&A, or playtest", recurring: true },
    { id: "cad-sat", whenLabel: "Every Sat 12–14", type: "Social", what: "X / TikTok / Shorts presence window", recurring: true },
    { id: "cad-sale", whenLabel: "Aug 15–17", type: "Sale", what: "BBB weekend flash sale (configs + BrainRot mega)", recurring: false },
    { id: "cad-playtest", whenLabel: "Aug 22", type: "Event", what: "Discord playtest + giveaway (Pro trial / BBB coupon)", recurring: false },
    { id: "cad-store-week", whenLabel: "Aug 26–31", type: "Campaign", what: "NightBeam Store Week — daily post, daily micro-update", recurring: false },
    { id: "cad-close", whenLabel: "Sep 5", type: "Review", what: "Month close + public transparency post", recurring: false },
  ];

  const kpis: Kpi[] = [
    {
      id: "kpi-bbb-week",
      name: "BBB week gross (est.)",
      baseline: "~low hundreds",
      target: "$300+/week by W4",
      current: "",
      ritual: "Export purchases Mon",
    },
    {
      id: "kpi-pro",
      name: "Pro paying members",
      baseline: "0 Stripe",
      target: "25",
      current: "0",
      ritual: "Stripe dashboard Mon",
    },
    {
      id: "kpi-discord",
      name: "Discord members",
      baseline: "1,024",
      target: "1,400",
      current: "1024",
      ritual: "Server insights Mon",
    },
    {
      id: "kpi-reviews",
      name: "Hero plugin reviews",
      baseline: "few",
      target: "+15",
      current: "",
      ritual: "Ask buyers after sale",
    },
    {
      id: "kpi-cf-lag",
      name: "CF top-5 update lag",
      baseline: "varies",
      target: "≤14 days each",
      current: "",
      ritual: "CF author panel Wed",
    },
    {
      id: "kpi-store-views",
      name: "Site store views",
      baseline: "low / new",
      target: "500+/week",
      current: "",
      ritual: "Admin analytics Mon",
    },
    {
      id: "kpi-sku-count",
      name: "Active BBB SKUs",
      baseline: "43",
      target: "≤30 focused",
      current: "43",
      ritual: "Kill list Fri",
    },
  ];

  return {
    version: 1,
    plan: {
      id: "plan-2026-08",
      title: "Make NightBeam cash-flow, not just download-famous",
      windowStart: "2026-08-05",
      windowEnd: "2026-09-05",
      diagnosis:
        "You already won distribution (~2.9M CurseForge, ~380k Modrinth, 1,024 Discord). You have not won monetization (~$1.9k BBB lifetime gross, $0 Pro Stripe). Concentrate: fewer products, clearer offers, weekly ships, funnel free downloads → Discord → paid / Pro.",
      ultimateTask:
        "Turn NightBeam into a studio with three cash engines: (1) BuiltByBit hero plugins + bundles, (2) Stripe Pro with real Discord value, (3) weekly content → Discord → store machine.",
      targets: [
        "BBB month gross: $1,200+",
        "Pro: 25 paying members → $75 MRR",
        "Discord: 1,024 → 1,400",
        "BBB reviews: +15 on hero SKUs",
        "Kill / archive ≥10 zero-sale BBB SKUs",
        "Site store views: 500+/week",
      ],
      funnel: "CurseForge / Modrinth download → Discord join → nightbeam.dev → BBB purchase or Pro",
    },
    weeks,
    tasks,
    productBets,
    cadence,
    reminders,
    kpis,
    notes: [],
  };
}
