/* Antidote Events / Future Events: the single source of truth for demo data.
   Every screen reads its story numbers from here so they always agree.

   Demo "today" is Sun 27 Sep 2026. Main event weekend: 13–14 March 2027, RDS Dublin.

   Reconciliation (all events):
     Contracted 418,000 = Cash collected 173,400 + Open invoices 91,600 + Not yet invoiced 153,000
     Open invoices 91,600 includes Overdue 23,800
     2027 B2B revenue 684,500 = Contracted 418,000 + Late-stage pipeline 266,500
     Every deal: deposit (30%) + balance = contract value */

export type EventId = "ff" | "mh" | "ca";
export type EventFilter = "all" | EventId;

export const TODAY = "Sun 27 Sep 2026";

/* ── Events ─────────────────────────────────────────────────────────────── */
export const EVENTS: Record<EventId, {
  id: EventId; name: string; short: string; label: string; city: string; venue: string; dates: string;
  color: string; soft: string; status: "ON TRACK" | "ATTENTION" | "PLANNING";
}> = {
  ff: { id: "ff", name: "Future Fertility", short: "Fertility", label: "Future Fertility · Dublin 2027", city: "Dublin", venue: "RDS, Dublin",
    dates: "13–14 March 2027", color: "#E0524C", soft: "rgba(224,82,76,.16)", status: "ON TRACK" },
  mh: { id: "mh", name: "Future Men's Health", short: "Men's Health", label: "Future Men's Health · Dublin 2027", city: "Dublin", venue: "RDS, Dublin",
    dates: "13–14 March 2027", color: "#4A72F5", soft: "rgba(74,114,245,.18)", status: "ATTENTION" },
  ca: { id: "ca", name: "Future Fertility · Canada Pilot", short: "Canada Pilot", label: "Future Fertility · Canada Pilot", city: "Location TBD", venue: "Venue TBD",
    dates: "Dates TBD", color: "#EEB8B1", soft: "rgba(238,184,177,.16)", status: "PLANNING" },
};

export const EVENT_OPTIONS: { id: EventFilter; label: string; tag?: string }[] = [
  { id: "all", label: "All events" },
  { id: "ff", label: "Fertility · Dublin 2027" },
  { id: "mh", label: "Men's Health · Dublin 2027" },
  { id: "ca", label: "Canada Pilot", tag: "PLANNING" },
];

export const BRAND = {
  red: "#D93B35", ink: "#111111", paper: "#F5EFE9", blush: "#EED7D3", cool: "#D9DADC", cobalt: "#2F5BEA",
};

/* ── Team (Nikki and Kathleen are named publicly; the rest are demo staff) ─ */
export const TEAM = [
  { id: "nd", name: "Nikki Dwyer", role: "Founder / Managing Director", initials: "ND", bg: "#EED7D3" },
  { id: "kc", name: "Kathleen Corr", role: "Head of Sales", initials: "KC", bg: "#D9DADC" },
  { id: "rw", name: "Robyn Walsh", role: "Event Operations", initials: "RW", bg: "#c9d6f5" },
  { id: "sk", name: "Sarah Keane", role: "Production Manager", initials: "SK", bg: "#f2c9c4" },
  { id: "dm", name: "Daniel Murray", role: "Commercial Executive", initials: "DM", bg: "#d6e4dc" },
  { id: "ab", name: "Amy Byrne", role: "Marketing & Content", initials: "AB", bg: "#efe0c8" },
  { id: "cr", name: "Conor Ryan", role: "Event Coordinator", initials: "CR", bg: "#dcd3ef" },
];

/* ── Headline KPIs ──────────────────────────────────────────────────────── */
export const KPIS = {
  all: { revenue2027: 684500, contracted: 418000, pipeline: 602000, weighted: 371000, lateStage: 266500, collected: 173400, outstanding: 91600,
    overdue: 23800, due30: 74200, exhibitors: 87, speakerSlots: 74, readiness: 63, avgDeal: 8920, winRate: 34, closingThisMonth: 19 },
  ff: { revenue2027: 404500, contracted: 246000, pipeline: 338000, weighted: 212000, lateStage: 158500, collected: 104900, outstanding: 55300,
    overdue: 15200, due30: 44100, exhibitors: 49, speakerSlots: 64, readiness: 66, avgDeal: 9340, winRate: 36, closingThisMonth: 11 },
  mh: { revenue2027: 280000, contracted: 172000, pipeline: 264000, weighted: 159000, lateStage: 108000, collected: 68500, outstanding: 36300,
    overdue: 8600, due30: 30100, exhibitors: 38, speakerSlots: 85, readiness: 59, avgDeal: 8410, winRate: 31, closingThisMonth: 8 },
  ca: { revenue2027: 0, contracted: 0, pipeline: 0, weighted: 0, lateStage: 0, collected: 0, outstanding: 0,
    overdue: 0, due30: 0, exhibitors: 0, speakerSlots: 0, readiness: 12, avgDeal: 0, winRate: 0, closingThisMonth: 0 },
};

export const eur = (n: number, dp = 0) =>
  "€" + n.toLocaleString("en-IE", { minimumFractionDigits: dp, maximumFractionDigits: dp });
export const eurK = (n: number) => n >= 1_000_000 ? "€" + (n / 1_000_000).toFixed(2).replace(/0$/, "") + "M" : "€" + Math.round(n / 1000) + "k";

/* ── Sales pipeline ─────────────────────────────────────────────────────── */
export const STAGES = ["New Lead", "Qualified", "Proposal", "Negotiation", "Contract Sent", "Won", "Lost"] as const;
export type Stage = typeof STAGES[number];

export type Deal = {
  id: string; company: string; event: EventId; value: number; stage: Stage; owner: string; pkg: string;
  type: "Exhibitor" | "Sponsorship" | "Speaking" | "Activation"; prob: number; next: string; closing?: string; flag?: string;
};

export const DEALS: Deal[] = [
  { id: "d-nova", company: "Nova Fertility Clinic", event: "ff", value: 18000, stage: "Won", owner: "Kathleen Corr", pkg: "Premium stand + Main Stage slot", type: "Exhibitor", prob: 100, next: "Deposit overdue 4 days", flag: "Deposit overdue" },
  { id: "d-nova-up", company: "Nova Fertility Clinic", event: "ff", value: 4500, stage: "Negotiation", owner: "Kathleen Corr", pkg: "Workshop slot upgrade", type: "Speaking", prob: 60, next: "Revised terms Tue", closing: "Oct" },
  { id: "d-peak", company: "Peak Health Labs", event: "mh", value: 12500, stage: "Won", owner: "Daniel Murray", pkg: "4m x 2m stand + speaker", type: "Exhibitor", prob: 100, next: "2 assets outstanding" },
  { id: "d-mpi", company: "Men's Performance Institute", event: "mh", value: 7800, stage: "Proposal", owner: "Daniel Murray", pkg: "Standard stand + workshop", type: "Exhibitor", prob: 40, next: "Proposal call Wed", closing: "Oct" },
  { id: "d-efn", company: "European Fertility Network", event: "ff", value: 21000, stage: "Contract Sent", owner: "Kathleen Corr", pkg: "Stage sponsorship", type: "Sponsorship", prob: 80, next: "Awaiting signature", closing: "Sep" },
  { id: "d-vit", company: "Vitality Diagnostics", event: "mh", value: 9500, stage: "Qualified", owner: "Daniel Murray", pkg: "Premium stand", type: "Exhibitor", prob: 25, next: "Send proposal", closing: "Nov" },
  { id: "d-harb", company: "Harbour IVF Partners", event: "ff", value: 16500, stage: "Negotiation", owner: "Kathleen Corr", pkg: "Premium stand + workshop", type: "Exhibitor", prob: 60, next: "Frontage query", closing: "Oct" },
  { id: "d-lumen", company: "Lumen Genetics", event: "ff", value: 11200, stage: "Contract Sent", owner: "Kathleen Corr", pkg: "Standard stand + newsletter", type: "Exhibitor", prob: 80, next: "Chase signature Mon", closing: "Sep" },
  { id: "d-atlas", company: "Atlas Hormone Clinic", event: "mh", value: 14000, stage: "Negotiation", owner: "Daniel Murray", pkg: "Main Stage commercial slot", type: "Speaking", prob: 60, next: "Pricing sign-off", closing: "Oct" },
  { id: "d-bloom", company: "Bloom Egg Freezing", event: "ff", value: 8800, stage: "Proposal", owner: "Kathleen Corr", pkg: "Standard stand + social", type: "Exhibitor", prob: 40, next: "Follow-up Thu", closing: "Oct" },
  { id: "d-kin", company: "Kinetic Sleep Co.", event: "mh", value: 6400, stage: "New Lead", owner: "Daniel Murray", pkg: "Standard stand", type: "Exhibitor", prob: 10, next: "Intro call", closing: "Nov" },
  { id: "d-seed", company: "Seed & Stem Supplements", event: "ff", value: 5600, stage: "Won", owner: "Kathleen Corr", pkg: "Standard stand", type: "Exhibitor", prob: 100, next: "Onboarding 60%" },
  { id: "d-ferro", company: "Ferro Sports Recovery", event: "mh", value: 7200, stage: "Won", owner: "Daniel Murray", pkg: "Standard stand + activation", type: "Activation", prob: 100, next: "Stand spec received" },
  { id: "d-luna", company: "Luna Women's Health", event: "ff", value: 9900, stage: "Qualified", owner: "Kathleen Corr", pkg: "Premium stand", type: "Exhibitor", prob: 25, next: "Budget confirm", closing: "Nov" },
  { id: "d-clar", company: "Clarity Hormone Clinic", event: "ff", value: 13400, stage: "Won", owner: "Kathleen Corr", pkg: "Workshop sponsorship", type: "Sponsorship", prob: 100, next: "Balance Feb" },
  { id: "d-north", company: "Northside Physio Group", event: "mh", value: 5200, stage: "Lost", owner: "Daniel Murray", pkg: "Standard stand", type: "Exhibitor", prob: 0, next: "Lost on budget" },
  { id: "d-orbit", company: "Orbit Health Cover", event: "mh", value: 28000, stage: "Proposal", owner: "Kathleen Corr", pkg: "Headline sponsorship", type: "Sponsorship", prob: 40, next: "Board decision 9 Oct", closing: "Oct" },
  { id: "d-cal", company: "Calm Mind Therapy", event: "ff", value: 4800, stage: "New Lead", owner: "Daniel Murray", pkg: "Standard stand", type: "Exhibitor", prob: 10, next: "Inbound form", closing: "Nov" },
  { id: "d-vel", company: "Velocity Fitness Studios", event: "mh", value: 6900, stage: "Won", owner: "Daniel Murray", pkg: "Standard stand + social", type: "Exhibitor", prob: 100, next: "Logo received" },
  { id: "d-green", company: "Greenfield Pharmacy Group", event: "ff", value: 12000, stage: "Contract Sent", owner: "Daniel Murray", pkg: "Premium stand + competition", type: "Exhibitor", prob: 80, next: "Signature due Fri", closing: "Oct" },
  { id: "d-core", company: "CoreBalance Physio", event: "mh", value: 5900, stage: "Lost", owner: "Daniel Murray", pkg: "Standard stand", type: "Exhibitor", prob: 0, next: "Chose another event" },
];

/* The Nova Fertility Clinic story: one record, followed everywhere. */
export const NOVA = {
  company: "Nova Fertility Clinic", event: "ff" as EventId, value: 18000, deposit: 5400, balance: 12600, depositPct: 30,
  owner: "Kathleen Corr", depositDue: "23 Sep 2026", balanceDue: "1 Feb 2027", daysOverdue: 4, stand: "A07", zone: "Zone A",
  speaker: "Dr Aoife Brennan", session: "Understanding Your Fertility Window", stage: "Main Stage", signed: "16 Sep 2026",
  package: [
    ["Exhibition stand", "4m x 2m"], ["Back wall", "Included"], ["Power", "2 sockets"], ["Lighting", "2 lights"],
    ["Main Stage speaking slot", "1 × 20 min"], ["Social announcement posts", "2"], ["Website listing", "Partner page"], ["Partner tickets", "10"],
  ] as [string, string][],
  conflict: "Requested 4m frontage. Allocated space supports 3m.",
};

/* The Peak Health Labs story. */
export const PEAK = {
  company: "Peak Health Labs", event: "mh" as EventId, value: 12500, deposit: 3750, balance: 8750, balanceDue: "1 Feb 2027",
  owner: "Daniel Murray", stand: "B14", zone: "Zone B", size: "4m x 2m", power: "2 sockets", lights: "2 lights", backWall: true,
  readiness: 78, missing: ["Logo SVG", "Speaker headshot"], request: "Would prefer a position close to the main stage.",
  speaker: "Dr Hugh Tierney", paymentRef: "PEAKHLTH", matchConfidence: 96,
};

export const CONTRACTS = [
  { id: "c-nova", client: "Nova Fertility Clinic", event: "ff" as EventId, pkg: "Premium stand + Main Stage slot", value: 18000, sent: "12 Sep", signed: "16 Sep", payment: "30 / 70 split", status: "Signed" },
  { id: "c-peak", client: "Peak Health Labs", event: "mh" as EventId, pkg: "4m x 2m stand + speaker", value: 12500, sent: "2 Sep", signed: "5 Sep", payment: "30 / 70 split", status: "Signed" },
  { id: "c-efn", client: "European Fertility Network", event: "ff" as EventId, pkg: "Stage sponsorship", value: 21000, sent: "22 Sep", signed: "", payment: "Pending signature", status: "Sent" },
  { id: "c-lumen", client: "Lumen Genetics", event: "ff" as EventId, pkg: "Standard stand + newsletter", value: 11200, sent: "19 Sep", signed: "", payment: "Pending signature", status: "Sent" },
  { id: "c-green", client: "Greenfield Pharmacy Group", event: "ff" as EventId, pkg: "Premium stand + competition", value: 12000, sent: "24 Sep", signed: "", payment: "Pending signature", status: "Viewed" },
  { id: "c-clar", client: "Clarity Hormone Clinic", event: "ff" as EventId, pkg: "Workshop sponsorship", value: 13400, sent: "18 Aug", signed: "21 Aug", payment: "30 / 70 split", status: "Signed" },
  { id: "c-ferro", client: "Ferro Sports Recovery", event: "mh" as EventId, pkg: "Standard stand + activation", value: 7200, sent: "28 Aug", signed: "3 Sep", payment: "30 / 70 split", status: "Signed" },
  { id: "c-vel", client: "Velocity Fitness Studios", event: "mh" as EventId, pkg: "Standard stand + social", value: 6900, sent: "10 Sep", signed: "14 Sep", payment: "30 / 70 split", status: "Signed" },
  { id: "c-seed", client: "Seed & Stem Supplements", event: "ff" as EventId, pkg: "Standard stand", value: 5600, sent: "8 Sep", signed: "11 Sep", payment: "Paid in full", status: "Signed" },
];

/* Finite sellable inventory. */
export const INVENTORY: Record<"ff" | "mh", { item: string; sold: number; total: number; price: string }[]> = {
  ff: [
    { item: "Standard Stands", sold: 62, total: 80, price: "€4,200" },
    { item: "Premium Stands", sold: 14, total: 18, price: "€9,800" },
    { item: "Main Stage Commercial Slots", sold: 9, total: 12, price: "€3,500" },
    { item: "Workshop Slots", sold: 16, total: 20, price: "€2,400" },
    { item: "Headline Sponsorship", sold: 1, total: 2, price: "€45,000" },
    { item: "Stage Sponsorship", sold: 2, total: 3, price: "€21,000" },
    { item: "Brand Activations", sold: 5, total: 8, price: "€6,500" },
    { item: "Newsletter Placements", sold: 11, total: 16, price: "€900" },
    { item: "Social Packages", sold: 23, total: 30, price: "€750" },
  ],
  mh: [
    { item: "Standard Stands", sold: 48, total: 75, price: "€3,900" },
    { item: "Premium Stands", sold: 11, total: 18, price: "€8,900" },
    { item: "Main Stage Commercial Slots", sold: 7, total: 12, price: "€3,500" },
    { item: "Workshop Slots", sold: 12, total: 20, price: "€2,200" },
    { item: "Headline Sponsorship", sold: 0, total: 2, price: "€40,000" },
    { item: "Stage Sponsorship", sold: 1, total: 3, price: "€18,000" },
    { item: "Brand Activations", sold: 3, total: 8, price: "€5,800" },
    { item: "Newsletter Placements", sold: 7, total: 16, price: "€900" },
    { item: "Social Packages", sold: 15, total: 30, price: "€750" },
  ],
};

/* Months toward the event. Values in €k. */
export const FORECAST_MONTHS = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
export const FORECAST = {
  contracted: [418, 462, 509, 548, 596, 641, 668],
  weighted:   [418, 489, 562, 624, 689, 742, 789],
  bestCase:   [418, 548, 672, 781, 879, 961, 1020],
  target:     [760, 760, 760, 760, 760, 760, 760],
};

/* Cash collection curve, cumulative €k, Sep 2026 → Mar 2027 (actual to Sep, then expected). */
export const CASH_CURVE = {
  months: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
  actual: [173.4, null, null, null, null, null, null] as (number | null)[],
  expected: [173.4, 247.6, 292.3, 355.8, 391.0, 561.5, 612.0],
  ff: [104.9, 149.5, 176.1, 214.3, 235.4, 337.6, 367.8],
  mh: [68.5, 98.1, 116.2, 141.5, 155.6, 223.9, 244.2],
};

export const FINANCE_FORECAST = { d30: 74200, d60: 118900, d90: 182400 };

/* Invoices. One deal creates a deposit and a balance invoice automatically. */
export type Invoice = {
  id: string; no: string; client: string; event: EventId; kind: "Deposit" | "Balance" | "Full";
  amount: number; due: string; status: "Paid" | "Overdue" | "Open" | "Scheduled" | "Match pending"; deal: number; days?: number;
  owner: string; lastReminder?: string; next?: string;
};
export const INVOICES: Invoice[] = [
  { id: "i-nova-1", no: "FE-2027-0412", client: "Nova Fertility Clinic", event: "ff", kind: "Deposit", amount: 5400, due: "23 Sep 2026", status: "Overdue", deal: 18000, days: 4, owner: "Kathleen Corr", lastReminder: "25 Sep · auto #2", next: "Call Mon + reminder #3" },
  { id: "i-nova-2", no: "FE-2027-0413", client: "Nova Fertility Clinic", event: "ff", kind: "Balance", amount: 12600, due: "1 Feb 2027", status: "Scheduled", deal: 18000, owner: "Kathleen Corr" },
  { id: "i-peak-1", no: "FE-2027-0388", client: "Peak Health Labs", event: "mh", kind: "Deposit", amount: 3750, due: "19 Sep 2026", status: "Match pending", deal: 12500, owner: "Daniel Murray" },
  { id: "i-peak-2", no: "FE-2027-0389", client: "Peak Health Labs", event: "mh", kind: "Balance", amount: 8750, due: "1 Feb 2027", status: "Scheduled", deal: 12500, owner: "Daniel Murray" },
  { id: "i-harb-1", no: "FE-2027-0355", client: "Bright Path Fertility", event: "ff", kind: "Deposit", amount: 4380, due: "12 Sep 2026", status: "Overdue", deal: 14600, days: 15, owner: "Kathleen Corr", lastReminder: "22 Sep · auto #3", next: "Escalate to Nikki" },
  { id: "i-atlas-1", no: "FE-2027-0341", client: "Oakline Nutrition", event: "mh", kind: "Deposit", amount: 3150, due: "8 Sep 2026", status: "Overdue", deal: 10500, days: 19, owner: "Daniel Murray", lastReminder: "23 Sep · auto #3", next: "Owner call today" },
  { id: "i-ff-3", no: "FE-2027-0367", client: "Evergreen Women's Clinic", event: "ff", kind: "Deposit", amount: 5420, due: "18 Sep 2026", status: "Overdue", deal: 18066, days: 9, owner: "Daniel Murray", lastReminder: "24 Sep · auto #2", next: "Reminder #3 Tue" },
  { id: "i-mh-3", no: "FE-2027-0372", client: "Summit Men's Clinic", event: "mh", kind: "Deposit", amount: 5450, due: "20 Sep 2026", status: "Overdue", deal: 18166, days: 7, owner: "Daniel Murray", lastReminder: "25 Sep · auto #2", next: "Reminder #3 Wed" },
  { id: "i-clar-2", no: "FE-2027-0298", client: "Clarity Hormone Clinic", event: "ff", kind: "Balance", amount: 9380, due: "15 Oct 2026", status: "Open", deal: 13400, owner: "Kathleen Corr" },
  { id: "i-ferro-1", no: "FE-2027-0377", client: "Ferro Sports Recovery", event: "mh", kind: "Deposit", amount: 2160, due: "17 Sep 2026", status: "Paid", deal: 7200, owner: "Daniel Murray" },
  { id: "i-vel-1", no: "FE-2027-0402", client: "Velocity Fitness Studios", event: "mh", kind: "Deposit", amount: 2070, due: "28 Sep 2026", status: "Paid", deal: 6900, owner: "Daniel Murray" },
  { id: "i-seed-1", no: "FE-2027-0395", client: "Seed & Stem Supplements", event: "ff", kind: "Full", amount: 5600, due: "18 Sep 2026", status: "Paid", deal: 5600, owner: "Kathleen Corr" },
];
/* Overdue: 5,400 + 4,380 + 3,150 + 5,420 + 5,450 = 23,800 ✓ */
export const DEBTORS = INVOICES.filter(i => i.status === "Overdue").sort((a, b) => (b.days || 0) - (a.days || 0));

export const RECON = {
  sync: "Healthy", matchedToday: 6, unmatched: 2, invoicesUpdated: 11, lastSync: "8 mins ago",
  exception: { amount: 3750, ref: "PEAKHLTH", match: "Peak Health Labs", invoice: "FE-2027-0388", confidence: 96, received: "26 Sep 2026 · AIB ••4471" },
  second: { amount: 1200, ref: "FUTURE EXPO", match: "Unknown payer", invoice: "", confidence: 41, received: "26 Sep 2026 · AIB ••4471" },
  matched: [
    ["Ferro Sports Recovery", "€2,160", "FE-2027-0377", "Auto · 100%"],
    ["Velocity Fitness Studios", "€2,070", "FE-2027-0402", "Auto · 100%"],
    ["Seed & Stem Supplements", "€5,600", "FE-2027-0395", "Auto · 99%"],
    ["Clarity Hormone Clinic", "€4,020", "FE-2027-0297", "Auto · 100%"],
    ["Vireo Diagnostics", "€2,640", "FE-2027-0384", "Auto · 98%"],
    ["Emberly Wellness", "€1,980", "FE-2027-0391", "Auto · 97%"],
  ] as [string, string, string, string][],
};

/* ── Exhibitors ─────────────────────────────────────────────────────────── */
export const EXHIBITOR_KPIS = {
  all: { confirmed: 87, ready: 54, waiting: 23, internal: 10, assets: 31, floor: 76, placed: 66, provisional: 10, unplaced: 11 },
  ff:  { confirmed: 49, ready: 32, waiting: 12, internal: 5, assets: 16, floor: 78, placed: 38, provisional: 5, unplaced: 6 },
  mh:  { confirmed: 38, ready: 22, waiting: 11, internal: 5, assets: 15, floor: 74, placed: 28, provisional: 5, unplaced: 5 },
};

export type Step = "done" | "missing" | "pending" | "na";
export type Exhibitor = {
  id: string; company: string; event: EventId; stand: string; zone: string; size: string; power: string; lights: string;
  contract: Step; deposit: Step; standDetails: Step; logo: Step; speaker: Step; tickets: Step; floor: Step;
  readiness: number; state: "READY" | "AT RISK" | "BLOCKED"; contact: string; request?: string; missing?: string[]; pkg: string;
};
export const EXHIBITORS: Exhibitor[] = [
  { id: "x-peak", company: "Peak Health Labs", event: "mh", stand: "B14", zone: "B", size: "4m x 2m", power: "2 sockets", lights: "2 lights",
    contract: "done", deposit: "done", standDetails: "done", logo: "missing", speaker: "missing", tickets: "done", floor: "done",
    readiness: 78, state: "AT RISK", contact: "Ellen Farrow · Marketing Lead", request: PEAK.request, missing: ["Logo SVG", "Speaker headshot"], pkg: "4m x 2m stand + speaker" },
  { id: "x-nova", company: "Nova Fertility Clinic", event: "ff", stand: "A07", zone: "A", size: "4m x 2m", power: "2 sockets", lights: "2 lights",
    contract: "done", deposit: "missing", standDetails: "done", logo: "done", speaker: "done", tickets: "pending", floor: "pending",
    readiness: 52, state: "BLOCKED", contact: "Dr Aoife Brennan · Medical Director", request: "Needs 4m frontage", missing: ["Deposit", "Frontage resolution"], pkg: "Premium stand + Main Stage slot" },
  { id: "x-clar", company: "Clarity Hormone Clinic", event: "ff", stand: "A02", zone: "A", size: "6m x 3m", power: "4 sockets", lights: "4 lights",
    contract: "done", deposit: "done", standDetails: "done", logo: "done", speaker: "done", tickets: "done", floor: "done",
    readiness: 100, state: "READY", contact: "Marcus Hale · Ops", pkg: "Workshop sponsorship" },
  { id: "x-ferro", company: "Ferro Sports Recovery", event: "mh", stand: "C22", zone: "C", size: "3m x 2m", power: "3 sockets", lights: "2 lights",
    contract: "done", deposit: "done", standDetails: "done", logo: "done", speaker: "na", tickets: "done", floor: "done",
    readiness: 94, state: "READY", contact: "Jamie Kerr · Founder", request: "Extra power for recovery pods", pkg: "Standard stand + activation" },
  { id: "x-vel", company: "Velocity Fitness Studios", event: "mh", stand: "C09", zone: "C", size: "3m x 2m", power: "1 socket", lights: "2 lights",
    contract: "done", deposit: "done", standDetails: "pending", logo: "done", speaker: "na", tickets: "done", floor: "done",
    readiness: 86, state: "READY", contact: "Ruth Nolan · Studio Manager", pkg: "Standard stand + social" },
  { id: "x-seed", company: "Seed & Stem Supplements", event: "ff", stand: "D04", zone: "D", size: "3m x 2m", power: "1 socket", lights: "1 light",
    contract: "done", deposit: "done", standDetails: "pending", logo: "missing", speaker: "na", tickets: "pending", floor: "done",
    readiness: 60, state: "AT RISK", contact: "Hannah Boyle · Brand", missing: ["Logo SVG", "Stand spec"], pkg: "Standard stand" },
  { id: "x-vireo", company: "Vireo Diagnostics", event: "mh", stand: "B03", zone: "B", size: "4m x 2m", power: "2 sockets", lights: "2 lights",
    contract: "done", deposit: "done", standDetails: "done", logo: "done", speaker: "done", tickets: "done", floor: "done",
    readiness: 100, state: "READY", contact: "Owen Price · Partnerships", pkg: "Premium stand" },
  { id: "x-emb", company: "Emberly Wellness", event: "ff", stand: "D11", zone: "D", size: "3m x 2m", power: "1 socket", lights: "2 lights",
    contract: "done", deposit: "done", standDetails: "done", logo: "done", speaker: "na", tickets: "done", floor: "done",
    readiness: 96, state: "READY", contact: "Cara Lynch · Director", pkg: "Standard stand" },
  { id: "x-bright", company: "Bright Path Fertility", event: "ff", stand: "A11", zone: "A", size: "4m x 2m", power: "2 sockets", lights: "2 lights",
    contract: "done", deposit: "missing", standDetails: "pending", logo: "done", speaker: "pending", tickets: "pending", floor: "pending",
    readiness: 41, state: "BLOCKED", contact: "Siobhan Reddy · Practice Manager", missing: ["Deposit 15 days overdue"], pkg: "Premium stand" },
  { id: "x-oak", company: "Oakline Nutrition", event: "mh", stand: "C15", zone: "C", size: "3m x 2m", power: "1 socket", lights: "1 light",
    contract: "done", deposit: "missing", standDetails: "done", logo: "done", speaker: "na", tickets: "pending", floor: "done",
    readiness: 58, state: "AT RISK", contact: "Liam Carty · Sales", missing: ["Deposit 19 days overdue"], pkg: "Standard stand" },
  { id: "x-ever", company: "Evergreen Women's Clinic", event: "ff", stand: "B06", zone: "B", size: "4m x 2m", power: "2 sockets", lights: "2 lights",
    contract: "done", deposit: "missing", standDetails: "done", logo: "done", speaker: "done", tickets: "done", floor: "done",
    readiness: 72, state: "AT RISK", contact: "Dr Grace Whelan · Founder", missing: ["Deposit"], pkg: "Premium stand + workshop" },
  { id: "x-summ", company: "Summit Men's Clinic", event: "mh", stand: "A03", zone: "A", size: "6m x 3m", power: "4 sockets", lights: "4 lights",
    contract: "done", deposit: "missing", standDetails: "done", logo: "pending", speaker: "done", tickets: "pending", floor: "done",
    readiness: 64, state: "AT RISK", contact: "Paul Renner · COO", missing: ["Deposit", "Brand guidelines"], pkg: "Premium stand + speaker" },
  { id: "x-kin", company: "Harlow Posture Co.", event: "mh", stand: "D08", zone: "D", size: "3m x 2m", power: "1 socket", lights: "1 light",
    contract: "done", deposit: "done", standDetails: "done", logo: "done", speaker: "na", tickets: "done", floor: "done",
    readiness: 100, state: "READY", contact: "Ben Harlow · Owner", pkg: "Standard stand" },
  { id: "x-luna", company: "Maple Fertility Coaching", event: "ff", stand: "", zone: "", size: "3m x 2m", power: "1 socket", lights: "1 light",
    contract: "done", deposit: "done", standDetails: "pending", logo: "pending", speaker: "na", tickets: "pending", floor: "missing",
    readiness: 45, state: "AT RISK", contact: "Niamh Gorman · Coach", missing: ["Floor position", "Stand spec", "Logo"], pkg: "Standard stand" },
];

export const OBLIGATIONS = [
  "Website Logo", "Social Announcement", "Speaker Promotion", "Stand Build", "Electrical", "Lighting",
  "Tickets", "Hotel Information", "Parking Information", "Partner Toolkit", "Competition Option", "Customer Ticket Allocation",
];
export const OBLIGATION_STATUSES = ["Not Started", "Requested", "Received", "Internal Action", "Complete"] as const;

/* ── Production ─────────────────────────────────────────────────────────── */
export const PRODUCTION_KPIS = { speakers: 96, confirmed: 83, decksReceived: 69, decksOutstanding: 14, slotsFilled: 74, issues: 6, avReviewThisWeek: 3 };
export const PROGRAMME = {
  ff: { slots: 56, confirmed: 36, draft: 14, open: 6 },
  mh: { slots: 52, confirmed: 44, draft: 0, open: 8 },
};
export const STAGE_READINESS = [
  { stage: "Main Stage 1", event: "ff" as EventId, pct: 82 },
  { stage: "Main Stage 2", event: "mh" as EventId, pct: 76 },
  { stage: "Workshop Stage 1", event: "ff" as EventId, pct: 63 },
  { stage: "Workshop Stage 2", event: "mh" as EventId, pct: 70 },
  { stage: "Expert Q&A Lounge", event: "ff" as EventId, pct: 58 },
  { stage: "Performance Lab", event: "mh" as EventId, pct: 66 },
];

export type Speaker = {
  id: string; name: string; event: EventId; session: string; stage: string; confirmed: boolean;
  bio: Step; headshot: Step; deck: "Overdue" | "Outstanding" | "Received" | "Needs House Style" | "Formatting" | "Approved" | "AV Ready";
  whatsapp: boolean; status: string; org?: string; due?: string; reminders?: number; latest?: string; mock?: boolean;
};
export const SPEAKERS: Speaker[] = [
  { id: "s-brennan", name: "Dr Aoife Brennan", org: "Nova Fertility Clinic", event: "ff", session: "Understanding Your Fertility Window", stage: "Main Stage 1",
    confirmed: true, bio: "done", headshot: "done", deck: "Overdue", whatsapp: true, status: "BLOCKING AV", due: "24 Sep", reminders: 2, latest: "I'll have this across tomorrow." },
  { id: "s-lipsett", name: "Rob Lipsett", event: "mh", session: "Training for the Long Game", stage: "Main Stage 2", confirmed: true, bio: "done", headshot: "done", deck: "Received", whatsapp: true, status: "On track", mock: true },
  { id: "s-porter", name: "Andrew Porter", event: "mh", session: "Resilience On and Off the Pitch", stage: "Main Stage 2", confirmed: true, bio: "done", headshot: "done", deck: "Approved", whatsapp: true, status: "On track", mock: true },
  { id: "s-kelly", name: "Dr Robert Kelly", event: "mh", session: "Optimising Men's Health Before 40", stage: "Main Stage 2", confirmed: true, bio: "done", headshot: "done", deck: "Formatting", whatsapp: true, status: "In production", mock: true },
  { id: "s-richards", name: "Dr James Richards", event: "mh", session: "Optimising Men's Health Before 40", stage: "Main Stage 2", confirmed: true, bio: "done", headshot: "missing", deck: "Outstanding", whatsapp: true, status: "Chasing", due: "2 Oct", mock: true },
  { id: "s-tierney", name: "Dr Hugh Tierney", org: "Peak Health Labs", event: "mh", session: "What Your Bloods Are Telling You", stage: "Workshop Stage 2", confirmed: true, bio: "done", headshot: "missing", deck: "Outstanding", whatsapp: false, status: "Headshot missing", due: "30 Sep" },
  { id: "s-moloney", name: "Dr Ciara Moloney", event: "ff", session: "IVF: What the Numbers Mean", stage: "Main Stage 1", confirmed: true, bio: "done", headshot: "done", deck: "Needs House Style", whatsapp: true, status: "In production", due: "25 Sep", reminders: 1 },
  { id: "s-farrell", name: "Sinead Farrell", event: "ff", session: "Fertility and Mental Load", stage: "Workshop Stage 1", confirmed: true, bio: "done", headshot: "done", deck: "AV Ready", whatsapp: true, status: "Ready" },
  { id: "s-nair", name: "Dr Priya Nair", event: "ff", session: "Egg Freezing: A Practical Guide", stage: "Workshop Stage 1", confirmed: true, bio: "done", headshot: "done", deck: "Overdue", whatsapp: true, status: "AV review this week", due: "25 Sep", reminders: 2, latest: "Finalising charts, Monday latest." },
  { id: "s-quinlan", name: "Dr Emma Quinlan", event: "ff", session: "Male Factor Fertility", stage: "Main Stage 1", confirmed: true, bio: "done", headshot: "done", deck: "Overdue", whatsapp: false, status: "AV review this week", due: "26 Sep", reminders: 1 },
  { id: "s-doyle", name: "Mark Doyle", event: "mh", session: "Optimising Men's Health Before 40", stage: "Main Stage 2", confirmed: true, bio: "done", headshot: "done", deck: "Received", whatsapp: true, status: "Moderator" },
  { id: "s-fennelly", name: "Dr Niall Fennelly", event: "mh", session: "Sleep, Stress and Testosterone", stage: "Performance Lab", confirmed: false, bio: "pending", headshot: "pending", deck: "Outstanding", whatsapp: false, status: "Awaiting confirmation" },
  { id: "s-kenny", name: "Orla Kenny", event: "ff", session: "Nutrition for Conception", stage: "Expert Q&A Lounge", confirmed: true, bio: "done", headshot: "done", deck: "Approved", whatsapp: true, status: "On track" },
];

export const CONTENT_ROOMS = [
  { id: "cr-40", session: "Optimising Men's Health Before 40", event: "mh" as EventId, stage: "Main Stage 2", time: "Sat 11:30",
    speakers: ["Dr Robert Kelly", "Dr James Richards", "Rob Lipsett"], moderator: "Mark Doyle", whatsapp: "Connected",
    outline: "Approved", questions: "Draft", slides: "In Progress", meeting: "Scheduled · Thu 1 Oct 18:00", deadline: "Slides 9 Oct" },
  { id: "cr-window", session: "Understanding Your Fertility Window", event: "ff" as EventId, stage: "Main Stage 1", time: "Sat 10:45",
    speakers: ["Dr Aoife Brennan"], moderator: "Nikki Dwyer", whatsapp: "Connected",
    outline: "Approved", questions: "Approved", slides: "Overdue", meeting: "Done · 17 Sep", deadline: "Deck overdue since 24 Sep" },
  { id: "cr-ivf", session: "IVF: What the Numbers Mean", event: "ff" as EventId, stage: "Main Stage 1", time: "Sat 13:00",
    speakers: ["Dr Ciara Moloney", "Dr Emma Quinlan"], moderator: "Sinead Farrell", whatsapp: "Connected",
    outline: "Approved", questions: "In Review", slides: "In Progress", meeting: "Scheduled · Tue 29 Sep 12:30", deadline: "Slides 6 Oct" },
  { id: "cr-bloods", session: "What Your Bloods Are Telling You", event: "mh" as EventId, stage: "Workshop Stage 2", time: "Sun 12:15",
    speakers: ["Dr Hugh Tierney"], moderator: "Conor Ryan", whatsapp: "Not linked",
    outline: "Draft", questions: "Not Started", slides: "Not Started", meeting: "Not scheduled", deadline: "Outline 2 Oct" },
];

/* ── Events: portfolio, timeline, canada ────────────────────────────────── */
export const PORTFOLIO = [
  { id: "ff" as EventId, commercial: 68, production: 54, exhibitor: 63, marketing: 41, overall: 58 },
  { id: "mh" as EventId, commercial: 59, production: 47, exhibitor: 56, marketing: 39, overall: 51 },
  { id: "ca" as EventId, commercial: 0, production: 0, exhibitor: 0, marketing: 0, overall: 12 },
];

export const TIMELINE = [
  { m: "Sales launch", date: "2 Jun 2026", state: "done" },
  { m: "Contracting", date: "Jun – Dec 2026", state: "active" },
  { m: "Floor plan", date: "30 Oct 2026", state: "active" },
  { m: "Speaker lock", date: "13 Nov 2026", state: "risk" },
  { m: "Marketing", date: "Nov 2026 – Mar 2027", state: "upcoming" },
  { m: "Final exhibitor information", date: "29 Jan 2027", state: "upcoming" },
  { m: "Deck deadline", date: "12 Feb 2027", state: "upcoming" },
  { m: "AV handover", date: "26 Feb 2027", state: "upcoming" },
  { m: "Staff briefing", date: "10 Mar 2027", state: "upcoming" },
  { m: "Build day", date: "12 Mar 2027", state: "upcoming" },
  { m: "Day 1", date: "Sat 13 Mar 2027", state: "upcoming" },
  { m: "Day 2", date: "Sun 14 Mar 2027", state: "upcoming" },
  { m: "Breakdown", date: "14 Mar 2027 · 19:00", state: "upcoming" },
  { m: "Post-event", date: "15 – 31 Mar 2027", state: "upcoming" },
];

export const CANADA = {
  template: "Future Fertility Dublin",
  cloned: [
    ["Workflows cloned", 27, 27], ["Email sequences cloned", 14, 14], ["Contract templates", 3, 3],
    ["Exhibitor workflows", 8, 8], ["Production workflows", 12, 12],
  ] as [string, number, number][],
  decisions: [
    ["Currency", "TBD"], ["Tax treatment", "Needs configuration"], ["Venue", "TBD"],
    ["Payment provider", "Review"], ["Local exhibitor terms", "Review"], ["Ticket tax", "Review"],
  ] as [string, string][],
};

/* ── Growth ─────────────────────────────────────────────────────────────── */
export const GROWTH_KPIS = { audience: 25438, subscribers: 21804, tickets: 2184, campaignRevenue: 41280, affiliateRevenue: 8460, contentScheduled: 37 };
export const AUDIENCE = { ff: 14820, mh: 8640, both: 2910 };
export const AFFILIATE = {
  partner: "Performance Nutrition Co.", discount: 15, commission: 15, sends: 8420, clicks: 1368, orders: 214, revenue: 16850, earned: 2527.5,
};

/* ── Agents (the 7) ─────────────────────────────────────────────────────── */
export const BRIEFING_TEXT = [
  "Morning Nikki.",
  "€5,400 from Nova Fertility Clinic is now four days overdue.",
  "Peak Health Labs has completed 78% of its exhibitor onboarding but is still missing two marketing assets.",
  "Eight Future Men's Health programme slots remain unfilled.",
  "Production has 14 speaker decks outstanding, including three required for AV review this week.",
  "I have automatically sent 11 exhibitor reminders, reconciled six Xero payments and updated four fulfilment records overnight.",
];

/* Records that power the Records client tabs. */
export const COMPANIES = [
  ["Nova Fertility Clinic", "Clinic", "Future Fertility", "Exhibitor + speaker", "€18,000", "Kathleen Corr"],
  ["Peak Health Labs", "Diagnostics", "Future Men's Health", "Exhibitor + speaker", "€12,500", "Daniel Murray"],
  ["European Fertility Network", "Network", "Future Fertility", "Stage sponsor", "€21,000", "Kathleen Corr"],
  ["Clarity Hormone Clinic", "Clinic", "Future Fertility", "Workshop sponsor", "€13,400", "Kathleen Corr"],
  ["Orbit Health Cover", "Insurance", "Future Men's Health", "Headline prospect", "€28,000", "Kathleen Corr"],
  ["Performance Nutrition Co.", "Nutrition", "Both", "Year-round partner", "€2,527.50 comm.", "Amy Byrne"],
  ["Ferro Sports Recovery", "Recovery", "Future Men's Health", "Exhibitor", "€7,200", "Daniel Murray"],
  ["Vireo Diagnostics", "Diagnostics", "Future Men's Health", "Exhibitor", "€8,800", "Daniel Murray"],
  ["Lumen Genetics", "Genetics", "Future Fertility", "Exhibitor (contract sent)", "€11,200", "Kathleen Corr"],
  ["Seed & Stem Supplements", "Supplements", "Future Fertility", "Exhibitor", "€5,600", "Kathleen Corr"],
];
