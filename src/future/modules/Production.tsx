/* Production: speakers, programme, content rooms, decks and AV handover.
   Pulse doesn't write the talks. It holds the status, chases the assets and shows
   Nikki and Sarah Keane whether each stage is actually ready to hand to AV. */
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import type { ModuleProps, DrawerProps, Fx } from "../types";
import {
  PRODUCTION_KPIS, PROGRAMME, STAGE_READINESS, SPEAKERS, CONTENT_ROOMS, KPIS, CANADA, EVENTS, NOVA, PEAK,
  type Speaker, type EventId, type Step,
} from "../data";
import {
  Page, PageHead, Card, Kpis, Badge, Status, EventTag, Btn, ActBtn, Avatar, Bar, Meter, StepDot, Table, Chips,
  Drawer, Sec, KV, Note, Flow, Fig, Row, Icon, PATHS, inEvent, evColor, toneOf, Legend, type Col,
} from "../ui";

/* ── Local data ────────────────────────────────────────────────────────── */

type Deck = Speaker["deck"];
type Sp = Speaker & { x?: string; idx: number };

const AV_PARTNER = "Lumacast Audio Visual";
const AV_DATE = "26 Feb 2027";
const AV_DAYS = 152; // 27 Sep 2026 to 26 Feb 2027
const PM = "Sarah Keane";

/* Generated speakers who appear by name in the Saturday programme grid. */
const NAMED: { name: string; event: EventId; session: string; stage: string; org?: string; x?: string; deck?: Deck }[] = [
  { name: "Dr Declan Furlong", event: "mh", session: "Heart Health After 45", stage: "Main Stage 2", deck: "Received" },
  { name: "Ciaran Moran", event: "mh", session: "Mobility for Desk Workers", stage: "Performance Lab", deck: "AV Ready" },
  { name: "Tomas Keogh", event: "mh", session: "Strength Basics After 40", stage: "Performance Lab" },
  { name: "Jamie Kerr", event: "mh", session: "Recovery: What Actually Works", stage: "Performance Lab", org: "Ferro Sports Recovery", x: "x-ferro", deck: "AV Ready" },
  { name: "Dr Lisa Hanlon", event: "mh", session: "Nutrition for Performance", stage: "Performance Lab" },
  { name: "Dr Eoin Sheridan", event: "mh", session: "Talking to Your GP About Prostate Health", stage: "Workshop Stage 2", deck: "AV Ready" },
  { name: "Padraig Nolan", event: "mh", session: "Men and Mental Fitness", stage: "Workshop Stage 2" },
  { name: "Dr Samir Haddad", event: "mh", session: "Testosterone: Myths and Evidence", stage: "Workshop Stage 2" },
  { name: "Dr Kevin Walsh", event: "mh", session: "Fertility for Men: The Basics", stage: "Workshop Stage 2" },
  { name: "Aisling Brady", event: "mh", session: "Gut Health and Energy", stage: "Workshop Stage 2" },
  { name: "Dr Rory Kinsella", event: "mh", session: "Hair Loss: Options That Work", stage: "Workshop Stage 2" },
  { name: "Barry O'Neill", event: "mh", session: "Cold Water and Recovery", stage: "Workshop B" },
  { name: "Ruth Nolan", event: "mh", session: "Build a Home Gym on a Budget", stage: "Workshop B", org: "Velocity Fitness Studios", x: "x-vel" },
  { name: "Dr Fiona Galvin", event: "ff", session: "Ask an Embryologist", stage: "Expert Q&A Lounge", deck: "AV Ready" },
  { name: "Laura Mahon", event: "ff", session: "Fertility Insurance and Costs", stage: "Expert Q&A Lounge" },
  { name: "Dr Helen Carty", event: "ff", session: "Clarity Hormone Clinic: Hormones 101", stage: "Expert Q&A Lounge", org: "Clarity Hormone Clinic", x: "x-clar", deck: "Approved" },
  { name: "Rachel Byrne", event: "ff", session: "Single Parents by Choice", stage: "Expert Q&A Lounge" },
  { name: "Dr Maeve Cullinan", event: "ff", session: "Endometriosis and Fertility", stage: "Workshop Stage 1" },
  { name: "Dr Sarah Ahmed", event: "ff", session: "PCOS: Where to Start", stage: "Workshop Stage 1" },
  { name: "Dr Hannah Kirwan", event: "ff", session: "Acupuncture and Fertility: The Evidence", stage: "Workshop Stage 1" },
  { name: "Clodagh Reilly", event: "ff", session: "Yoga for Fertility", stage: "Workshop A" },
  { name: "Dr Conall Daly", event: "ff", session: "Sperm Health Basics", stage: "Workshop A" },
  { name: "Dr Joanne Keating", event: "ff", session: "Fertility After 40", stage: "Workshop A" },
];

const FIRST = ["Aoibhinn", "Brendan", "Caoimhe", "Dermot", "Eimear", "Fergal", "Gemma", "Killian", "Laoise", "Mairead", "Niamh", "Oisin",
  "Roisin", "Seamus", "Tara", "Ultan", "Yvonne", "Colm", "Deirdre", "Enda", "Fiachra", "Sorcha", "Ronan"];
const LAST = ["Hegarty", "McCann", "Foley", "Linehan", "Doherty", "Kavanagh", "Brennock", "Coughlan", "Duggan", "Fitzgerald", "Geraghty",
  "Hennessy", "Joyce", "Lawlor", "McGrath", "Nagle", "O'Connell", "Phelan", "Quirke", "Roche", "Scanlon", "Tobin", "Vaughan", "Wynne",
  "Barrett", "Cronin", "Dolan", "Egan", "Flood"];
const ROOMS: Record<"ff" | "mh", string[]> = {
  ff: ["Main Stage 1", "Expert Q&A Lounge", "Workshop Stage 1", "Workshop A"],
  mh: ["Main Stage 2", "Performance Lab", "Workshop Stage 2", "Workshop B"],
};
const SUN_SESSIONS: Record<"ff" | "mh", string[]> = {
  ff: ["Fertility Preservation for Cancer Patients", "Understanding Male Hormones", "Recurrent Miscarriage: What We Know", "Choosing a Clinic",
    "Fertility and Your Thyroid", "Secondary Infertility", "Nutrition in the Two-Week Wait", "Egg Donation Explained", "Trying to Conceive After 35",
    "Sleep and Fertility", "Talking to Your Partner", "Your First IVF Consult", "Sunday Panel: Life After Treatment", "Weight, BMI and Treatment Access"],
  mh: ["Alcohol and Performance", "Running Your First Marathon at 40", "Men's Skin Health", "Cholesterol: Beyond the Numbers", "Back Pain That Won't Go Away",
    "Dads and Mental Health", "Body Composition Explained", "Sunday Panel: Health at Every Decade", "Diabetes Risk and What to Do",
    "Posture and Strength at Work", "Hydration Myths", "Coaching Masterclass: Mobility", "Men's Cancer Screening", "Grip Strength and Longevity"],
};
const DUE_POOL = ["2 Oct", "6 Oct", "9 Oct", "13 Oct", "16 Oct"];

/* Deck statuses for the 71 generated confirmed speakers, so the full set of 83 confirmed
   decks lands on 69 received + 14 outstanding (PRODUCTION_KPIS). */
function buildSpeakers(): Sp[] {
  const budget: Record<string, number> = { "AV Ready": 22, Approved: 15, Received: 10, Outstanding: 9, "Needs House Style": 8, Formatting: 7 };
  NAMED.forEach(n => { if (n.deck) budget[n.deck]--; });
  const order: Deck[] = ["AV Ready", "Approved", "Received", "Outstanding", "Needs House Style", "Formatting"];
  const seq: Deck[] = [];
  while (order.some(o => budget[o] > 0)) order.forEach(o => { if (budget[o] > 0) { seq.push(o); budget[o]--; } });
  let q = 0;
  const statusOf = (d: Deck, head: Step) => head === "missing" ? "Headshot missing"
    : d === "Outstanding" ? "Deck requested" : d === "Received" ? "In review" : d === "AV Ready" ? "Ready"
    : d === "Approved" ? "On track" : "In production";

  const out: Sp[] = SPEAKERS.map((s, i) => ({ ...s, idx: i, x: s.id === "s-brennan" ? "x-nova" : s.id === "s-tierney" ? "x-peak" : undefined }));
  NAMED.forEach((n, i) => {
    const deck = n.deck || seq[q++];
    out.push({ id: "g-n" + i, name: n.name, org: n.org, x: n.x, event: n.event, session: n.session, stage: n.stage, confirmed: true,
      bio: "done", headshot: "done", deck, whatsapp: i % 5 !== 2, status: statusOf(deck, "done"),
      due: deck === "Outstanding" ? DUE_POOL[i % 5] : undefined, idx: out.length });
  });
  for (let i = 0; i < 60; i++) {
    const ev: "ff" | "mh" = i % 2 === 0 ? "ff" : "mh";
    const k = Math.floor(i / 2);
    const confirmed = i < 48;
    const deck: Deck = confirmed ? seq[q++] : "Outstanding";
    const headshot: Step = !confirmed ? "pending" : i % 9 === 4 ? "missing" : "done";
    const bio: Step = !confirmed ? "pending" : i % 13 === 5 ? "pending" : "done";
    out.push({ id: "g-p" + i, name: (i % 3 === 0 ? "Dr " : "") + FIRST[i % FIRST.length] + " " + LAST[(i * 5 + 3) % LAST.length],
      event: ev, session: SUN_SESSIONS[ev][k % 14], stage: ROOMS[ev][k % 4], confirmed, bio, headshot, deck,
      whatsapp: confirmed && i % 7 !== 3, status: confirmed ? statusOf(deck, headshot) : i % 2 ? "Invite sent" : "Awaiting confirmation",
      due: confirmed && deck === "Outstanding" ? DUE_POOL[i % 5] : undefined, idx: out.length });
  }
  return out;
}
const ALL: Sp[] = buildSpeakers();
const BY_ID: Record<string, Sp> = Object.fromEntries(ALL.map(s => [s.id, s]));
const BY_NAME: Record<string, Sp> = Object.fromEntries(ALL.map(s => [s.name, s]));
const isOut = (d: Deck) => d === "Overdue" || d === "Outstanding";

/* ── Programme grid: a representative Saturday, 13 Mar 2027 ───────────── */
type CellS = "confirmed" | "draft" | "open" | "conflict" | "closed" | "break";
type Cell = { s: CellS; t?: string; who?: string; note?: string; x?: string; room?: string };
const C = (t: string, who: string, x?: string): Cell => ({ s: "confirmed", t, who, x });
const D = (t: string, note: string): Cell => ({ s: "draft", t, note });
const O = (note?: string): Cell => ({ s: "open", note });
const X = (t: string, who: string, note: string): Cell => ({ s: "conflict", t, who, note });
const B: Cell = { s: "break" };
const Z: Cell = { s: "closed", note: "Room opens 11:30" };
const TIMES = ["10:00", "10:45", "11:30", "12:15", "13:00", "13:45", "14:30", "15:15"];

const GRID: Record<"ff" | "mh", Cell[][]> = {
  mh: [
    [C("The State of Men's Health in Ireland", "Mark Doyle"), C("Mobility for Desk Workers", "Ciaran Moran"), C("Talking to Your GP About Prostate Health", "Dr Eoin Sheridan"), Z],
    [C("Resilience On and Off the Pitch", "Andrew Porter"), C("Strength Basics After 40", "Tomas Keogh"), C("Men and Mental Fitness", "Padraig Nolan"), Z],
    [C("Optimising Men's Health Before 40", "Dr Robert Kelly, Dr James Richards, Rob Lipsett"), O(), C("Testosterone: Myths and Evidence", "Dr Samir Haddad"),
      C("Peak Health Labs: Know Your Numbers", "Peak Health Labs demo", "x-peak")],
    [B, B, B, B],
    [C("Training for the Long Game", "Rob Lipsett"), C("Recovery: What Actually Works", "Jamie Kerr", "x-ferro"), C("Fertility for Men: The Basics", "Dr Kevin Walsh"), O()],
    [O(), O("Invited: Dr Niall Fennelly, awaiting reply"), C("Gut Health and Energy", "Aisling Brady"), C("Men's Health Q&A Clinic", "Dr Samir Haddad")],
    [X("Heart Health After 45", "Dr Declan Furlong", "Also booked on Workshop Stage 2 at 14:30"), C("Nutrition for Performance", "Dr Lisa Hanlon"),
      X("Blood Pressure Clinic Live", "Dr Declan Furlong", "Also booked on Main Stage 2 at 14:30"), C("Cold Water and Recovery", "Barry O'Neill")],
    [C("Men's Health Panel: Ask the Experts", "Dr Eoin Sheridan, Dr Samir Haddad"), O(), C("Hair Loss: Options That Work", "Dr Rory Kinsella"),
      C("Build a Home Gym on a Budget", "Ruth Nolan", "x-vel")],
  ],
  ff: [
    [C("Welcome and Opening Keynote", "Nikki Dwyer"), C("Nutrition for Conception", "Orla Kenny"), C("Egg Freezing: A Practical Guide", "Dr Priya Nair"),
      D("Bloom Egg Freezing: Consult Clinic", "Held for Bloom Egg Freezing (proposal stage)")],
    [C("Understanding Your Fertility Window", "Dr Aoife Brennan", "x-nova"), C("Ask an Embryologist", "Dr Fiona Galvin"), C("Fertility and Mental Load", "Sinead Farrell"),
      C("Yoga for Fertility", "Clodagh Reilly")],
    [D("European Fertility Network: Access to Care", "Held for EFN stage sponsorship (contract sent)"), O(), C("Endometriosis and Fertility", "Dr Maeve Cullinan"),
      C("Sperm Health Basics", "Dr Conall Daly")],
    [B, B, B, B],
    [X("IVF: What the Numbers Mean", "Dr Ciara Moloney, Dr Emma Quinlan", "Dr Moloney is also in Workshop A at 13:00"), C("Fertility Insurance and Costs", "Laura Mahon"),
      C("PCOS: Where to Start", "Dr Sarah Ahmed"), X("Reading Your AMH Result", "Dr Ciara Moloney", "Dr Moloney is also on the Main Stage 1 panel at 13:00")],
    [C("Male Factor Fertility", "Dr Emma Quinlan"), C("Clarity Hormone Clinic: Hormones 101", "Dr Helen Carty", "x-clar"),
      D("Lumen Genetics: Carrier Screening", "Held for Lumen Genetics (contract sent)"), C("Fertility After 40", "Dr Joanne Keating")],
    [D("Harbour IVF Partners: Treatment Pathways", "Held for Harbour IVF Partners (negotiation)"), D("Donor Conception Q&A", "Draft: speaker shortlist of 2"), O(),
      D("Surrogacy Law in Ireland", "Draft: awaiting solicitor availability")],
    [D("Your Questions, Answered: Panel", "Draft: 3 panellists invited"), C("Single Parents by Choice", "Rachel Byrne"),
      C("Acupuncture and Fertility: The Evidence", "Dr Hannah Kirwan"), O()],
  ],
};
const SUN_OPEN: Record<"ff" | "mh", { time: string; room: string }[]> = {
  mh: [{ time: "10:00", room: "Performance Lab" }, { time: "13:45", room: "Workshop B" }, { time: "15:15", room: "Main Stage 2" }],
  ff: [{ time: "11:30", room: "Workshop A" }, { time: "14:30", room: "Expert Q&A Lounge" }, { time: "15:15", room: "Workshop Stage 1" }],
};
const SUN_SUMMARY: Record<"ff" | "mh", { slots: number; confirmed: number; draft: number; open: number }> = {
  mh: { slots: 26, confirmed: 23, draft: 0, open: 3 },
  ff: { slots: 28, confirmed: 18, draft: 7, open: 3 },
};
const SUGGEST: Record<"ff" | "mh", [string, string][]> = {
  mh: [
    ["Dr Aidan Crowe", "Sports cardiologist · rated 4.7 at a 2025 Antidote event"],
    ["Dr Tariq Mansoor", "Endocrinologist · referred by Atlas Hormone Clinic"],
    ["Graham Kiely", "Strength coach · available Saturday only"],
    ["Dr Nuala Brophy", "Consultant urologist · on the 2026 shortlist"],
    ["Shane Quigley", "Men's mental health advocate · free both days"],
    ["Ferro Sports Recovery", "Exhibitor · recovery demo not yet used from package"],
  ],
  ff: [
    ["Dr Grainne Tuohy", "Reproductive endocrinologist · on the 2026 shortlist"],
    ["Aoife Kiernan", "Fertility counsellor · strong audience survey demand"],
    ["Dr Liam Ruane", "Embryologist · free Saturday afternoon"],
    ["Harbour IVF Partners", "Prospect · workshop slot in current negotiation"],
  ],
};
const cellsOf = (g: Cell[][]) => g.flat();
const satCount = (e: "ff" | "mh") => {
  const cs = cellsOf(GRID[e]);
  return {
    slots: cs.filter(c => c.s !== "break" && c.s !== "closed").length,
    confirmed: cs.filter(c => c.s === "confirmed" || c.s === "conflict").length,
    draft: cs.filter(c => c.s === "draft").length,
    open: cs.filter(c => c.s === "open").length,
    clash: cs.filter(c => c.s === "conflict").length,
  };
};
function slotOf(session: string): string {
  for (const e of ["ff", "mh"] as const) {
    const g = GRID[e];
    for (let r = 0; r < g.length; r++) for (let c = 0; c < g[r].length; c++) if (g[r][c].t === session) return `Sat 13 Mar · ${TIMES[r]} · ${ROOMS[e][c]}`;
  }
  const room = ROOMS_ALL.find(r => r.session === session);
  if (room) return `${room.time.replace("Sat", "Sat 13 Mar ·").replace("Sun", "Sun 14 Mar ·")} · ${room.stage}`;
  return "Sun 14 Mar · time to confirm";
}

/* ── Content rooms: Nikki's WhatsApp groups, one per session ──────────── */
type Room = typeof CONTENT_ROOMS[number];
const EXTRA_ROOMS: Room[] = [
  { id: "cr-freeze", session: "Egg Freezing: A Practical Guide", event: "ff", stage: "Workshop Stage 1", time: "Sat 10:00",
    speakers: ["Dr Priya Nair"], moderator: "Orla Kenny", whatsapp: "Connected", outline: "Approved", questions: "Approved", slides: "Overdue",
    meeting: "Done · 15 Sep", deadline: "Deck overdue since 25 Sep" },
  { id: "cr-mental", session: "Fertility and Mental Load", event: "ff", stage: "Workshop Stage 1", time: "Sat 10:45",
    speakers: ["Sinead Farrell"], moderator: "Robyn Walsh", whatsapp: "Connected", outline: "Approved", questions: "Approved", slides: "Approved",
    meeting: "Done · 10 Sep", deadline: "In AV folder" },
  { id: "cr-resil", session: "Resilience On and Off the Pitch", event: "mh", stage: "Main Stage 2", time: "Sat 10:45",
    speakers: ["Andrew Porter"], moderator: "Mark Doyle", whatsapp: "Connected", outline: "Approved", questions: "Approved", slides: "Approved",
    meeting: "Done · 22 Sep", deadline: "Filing to AV folder 30 Sep" },
  { id: "cr-nutri", session: "Nutrition for Conception", event: "ff", stage: "Expert Q&A Lounge", time: "Sat 10:00",
    speakers: ["Orla Kenny"], moderator: "Sinead Farrell", whatsapp: "Connected", outline: "Approved", questions: "In Review", slides: "Approved",
    meeting: "Done · 18 Sep", deadline: "Questions 2 Oct" },
  { id: "cr-panel", session: "Your Questions, Answered: Panel", event: "ff", stage: "Main Stage 1", time: "Sat 15:15",
    speakers: ["Dr Fiona Galvin", "Laura Mahon", "Dr Joanne Keating"], moderator: "Nikki Dwyer", whatsapp: "Invite sent", outline: "Draft",
    questions: "Not Started", slides: "Not Started", meeting: "Proposed · Wed 7 Oct", deadline: "Outline 9 Oct" },
];
const ROOMS_ALL: Room[] = [...CONTENT_ROOMS, ...EXTRA_ROOMS];

type Msg = { d: string; who: string; t: string; auto?: boolean };
type RoomDetail = { thread: Msg[]; outline: string[]; files: [string, string][]; tasks: [string, string, string][]; source?: string };
const ROOM_DETAIL: Record<string, RoomDetail> = {
  "cr-40": {
    thread: [
      { d: "Mon 21 Sep", who: "Mark Doyle", t: "Running order: Robert on baselines, James on training load, Rob on habits that stick. 12 minutes each, then 15 for Q&A." },
      { d: "Mon 21 Sep", who: "Dr Robert Kelly", t: "Happy with that. I'll keep stats light, one slide on normal testosterone ranges." },
      { d: "Tue 22 Sep", who: "Sarah Keane", t: "Outline approved. Slides to me by 9 Oct, 16:9 on the house template (attached)." },
      { d: "Wed 23 Sep", who: "Rob Lipsett", t: "Can we keep supplements out of it? Want it practical." },
      { d: "Thu 24 Sep", who: "Mark Doyle", t: "Agreed. Draft questions are in the doc, add yours before Thursday's call." },
      { d: "Fri 25 Sep", who: "Dr James Richards", t: "Headshot over the weekend, deck by the deadline." },
    ],
    outline: ["Baselines: what to test before 40 (Dr Robert Kelly)", "Training load and recovery (Dr James Richards)", "Habits that stick (Rob Lipsett)", "Moderated Q&A (Mark Doyle)"],
    files: [["Session outline v3.pdf", "Approved"], ["Draft questions (Google Doc)", "Draft"], ["Kelly slides v1.pptx", "Formatting"], ["House template 16x9.pptx", "Shared"]],
    tasks: [["Send headshot", "Dr James Richards", "30 Sep"], ["Add audience questions", "Mark Doyle", "1 Oct"], ["Slides to Sarah", "All speakers", "9 Oct"], ["Book 4 lapel mics", "Sarah Keane", "12 Feb 2027"]],
  },
  "cr-window": {
    thread: [
      { d: "Thu 17 Sep", who: "Nikki Dwyer", t: "Great call. Outline and questions approved, this is a strong session." },
      { d: "Fri 18 Sep", who: "Sarah Keane", t: "First-cut deck by 24 Sep please, so medical review and AV can start. Template attached." },
      { d: "Thu 24 Sep", who: "Pulse", t: "Reminder 1: first-cut deck was due today.", auto: true },
      { d: "Sat 26 Sep", who: "Pulse", t: "Reminder 2: deck is two days overdue and AV review is waiting on it.", auto: true },
      { d: "Sat 26 Sep", who: "Dr Aoife Brennan", t: "I'll have this across tomorrow." },
    ],
    outline: ["What the fertility window is, and isn't", "Tracking methods that actually work", "When to see a specialist", "Q&A with Nikki Dwyer"],
    files: [["Outline v2.pdf", "Approved"], ["Audience questions.docx", "Approved"], ["First-cut deck", "Not received"], ["Nova Fertility Clinic logo.svg", "Received"]],
    tasks: [["Send first-cut deck", "Dr Aoife Brennan", "24 Sep · overdue"], ["Medical review", "Sarah Keane", "2 days after receipt"], ["AV review", AV_PARTNER, "After medical review"], ["Lapel or handheld mic", "Dr Aoife Brennan", "9 Oct"]],
  },
  "cr-ivf": {
    thread: [
      { d: "Tue 22 Sep", who: "Sinead Farrell", t: "Draft questions are in the doc. Keen to cover success rates by age without scaring anyone." },
      { d: "Wed 23 Sep", who: "Dr Ciara Moloney", t: "My slides are with Sarah, she flagged a few house style fixes." },
      { d: "Thu 24 Sep", who: "Dr Emma Quinlan", t: "I'll do male factor in two slides here and keep the detail for my own session." },
      { d: "Fri 25 Sep", who: "Sarah Keane", t: "Heads up: Ciara is also in Workshop A at 13:00. We'll move one of them this week." },
      { d: "Sat 26 Sep", who: "Sinead Farrell", t: "Call Tuesday 12:30 to lock the questions." },
    ],
    outline: ["IVF success rates by age, explained plainly", "What a clinic's numbers do and don't tell you", "Male factor in two slides", "Panel Q&A"],
    files: [["Outline v2.pdf", "Approved"], ["Panel questions (Google Doc)", "In review"], ["Moloney deck v2.pptx", "Needs house style"], ["Quinlan deck", "Not received"]],
    tasks: [["Resolve 13:00 clash", "Sarah Keane", "30 Sep"], ["Lock questions", "Sinead Farrell", "29 Sep"], ["House style fixes", "Dr Ciara Moloney", "2 Oct"], ["Send deck", "Dr Emma Quinlan", "26 Sep · overdue"]],
  },
  "cr-bloods": {
    source: "No WhatsApp group yet. Notes below are from email.",
    thread: [
      { d: "Tue 22 Sep", who: "Daniel Murray", t: "Peak confirmed Dr Tierney for the workshop slot in their package." },
      { d: "Thu 24 Sep", who: "Conor Ryan", t: "Asked Dr Tierney for an outline, a headshot and a mobile for the WhatsApp group." },
    ],
    outline: ["Draft: what a standard blood panel covers", "Draft: three markers men ignore", "Draft: when to retest"],
    files: [["Outline (draft).docx", "Draft"], ["Headshot", "Missing"], ["Peak Health Labs logo.svg", "Missing"]],
    tasks: [["Create WhatsApp group", "Conor Ryan", "29 Sep"], ["Send headshot", "Peak Health Labs", "Overdue"], ["Outline", "Dr Hugh Tierney", "2 Oct"]],
  },
};
function detailOf(r: Room): RoomDetail {
  if (ROOM_DETAIL[r.id]) return ROOM_DETAIL[r.id];
  const lead = r.speakers[0];
  return {
    thread: [
      { d: "Mon 14 Sep", who: r.moderator, t: `Group set up for "${r.session}". Outline template pinned.` },
      { d: "Fri 18 Sep", who: lead, t: "Outline is in the doc, happy to take edits." },
      { d: "Tue 22 Sep", who: PM, t: `Outline ${r.outline.toLowerCase()}. Slides status: ${r.slides.toLowerCase()}.` },
    ],
    outline: ["Opening and context", "Three practical points", "Audience Q&A"],
    files: [["Outline.pdf", r.outline], ["Slides", r.slides], ["House template 16x9.pptx", "Shared"]],
    tasks: [["Questions", r.moderator, "2 Oct"], ["Slides to Sarah", lead, r.deadline]],
  };
}

/* ── Production issues (6) ─────────────────────────────────────────────── */
type Issue = { ev: EventId; sev: "bad" | "warn"; t: string; d: string; go: (fx: Fx) => void; cta: string };
const ISSUES: Issue[] = [
  { ev: "ff", sev: "bad", t: "Dr Aoife Brennan deck 3 days overdue", d: "Blocking AV review on Main Stage 1 · 2 automatic reminders sent", cta: "Open", go: fx => fx.open("speaker", "s-brennan") },
  { ev: "ff", sev: "warn", t: "Two more decks overdue for AV review this week", d: "Dr Priya Nair (Workshop Stage 1) and Dr Emma Quinlan (Main Stage 1)", cta: "Decks", go: fx => fx.goTo("Production", "presentations") },
  { ev: "mh", sev: "warn", t: "Dr Hugh Tierney headshot missing", d: "Peak Health Labs asset, also holding exhibitor onboarding at 78%", cta: "Open", go: fx => fx.open("speaker", "s-tierney") },
  { ev: "mh", sev: "warn", t: "8 Men's Health slots unassigned", d: "5 on Saturday, 3 on Sunday · speaker lock 13 Nov", cta: "Programme", go: fx => fx.goTo("Production", "programme") },
  { ev: "mh", sev: "bad", t: "Clash: Dr Declan Furlong, Sat 14:30", d: "Booked on Main Stage 2 and Workshop Stage 2 at the same time", cta: "Programme", go: fx => fx.goTo("Production", "programme") },
  { ev: "ff", sev: "bad", t: "Clash: Dr Ciara Moloney, Sat 13:00", d: "IVF panel on Main Stage 1 and AMH talk in Workshop A", cta: "Programme", go: fx => { fx.setEvent("ff"); fx.goTo("Production", "programme"); } },
];

/* ── AV handover board ─────────────────────────────────────────────────── */
type AvRow = { stage: string; ev: EventId; session: string; who: string; sp?: string; deck: Step; video: Step; audio: Step; format: Step; approved: Step; folder: string };
const AV_ROWS: AvRow[] = [
  { stage: "Main Stage 1", ev: "ff", session: "Understanding Your Fertility Window", who: "Dr Aoife Brennan", sp: "s-brennan", deck: "missing", video: "na", audio: "pending", format: "missing", approved: "missing", folder: "Empty · deck not received" },
  { stage: "Main Stage 1", ev: "ff", session: "Welcome and Opening Keynote", who: "Nikki Dwyer", deck: "done", video: "done", audio: "done", format: "done", approved: "done", folder: "MS1 / Sat / 1000" },
  { stage: "Main Stage 1", ev: "ff", session: "IVF: What the Numbers Mean", who: "Dr Ciara Moloney + 1", sp: "s-moloney", deck: "pending", video: "na", audio: "done", format: "pending", approved: "pending", folder: "Awaiting house style" },
  { stage: "Main Stage 1", ev: "ff", session: "Male Factor Fertility", who: "Dr Emma Quinlan", sp: "s-quinlan", deck: "missing", video: "na", audio: "pending", format: "missing", approved: "missing", folder: "Empty · deck overdue" },
  { stage: "Main Stage 2", ev: "mh", session: "Optimising Men's Health Before 40", who: "Dr Robert Kelly + 3", sp: "s-kelly", deck: "pending", video: "pending", audio: "done", format: "pending", approved: "pending", folder: "1 of 3 decks in" },
  { stage: "Main Stage 2", ev: "mh", session: "Resilience On and Off the Pitch", who: "Andrew Porter", sp: "s-porter", deck: "done", video: "done", audio: "done", format: "done", approved: "done", folder: "Filing 30 Sep" },
  { stage: "Main Stage 2", ev: "mh", session: "Training for the Long Game", who: "Rob Lipsett", sp: "s-lipsett", deck: "done", video: "pending", audio: "done", format: "pending", approved: "pending", folder: "Video clip to check" },
  { stage: "Workshop Stage 1", ev: "ff", session: "Egg Freezing: A Practical Guide", who: "Dr Priya Nair", sp: "s-nair", deck: "missing", video: "na", audio: "done", format: "missing", approved: "missing", folder: "Empty · deck overdue" },
  { stage: "Workshop Stage 1", ev: "ff", session: "Fertility and Mental Load", who: "Sinead Farrell", sp: "s-farrell", deck: "done", video: "na", audio: "done", format: "done", approved: "done", folder: "WS1 / Sat / 1045" },
  { stage: "Workshop Stage 2", ev: "mh", session: "What Your Bloods Are Telling You", who: "Dr Hugh Tierney", sp: "s-tierney", deck: "missing", video: "na", audio: "pending", format: "missing", approved: "missing", folder: "Empty · due 30 Sep" },
  { stage: "Workshop Stage 2", ev: "mh", session: "Talking to Your GP About Prostate Health", who: "Dr Eoin Sheridan", deck: "done", video: "na", audio: "done", format: "done", approved: "done", folder: "WS2 / Sat / 1000" },
  { stage: "Expert Q&A Lounge", ev: "ff", session: "Nutrition for Conception", who: "Orla Kenny", sp: "s-kenny", deck: "done", video: "na", audio: "done", format: "done", approved: "done", folder: "QA / Sat / 1000" },
  { stage: "Expert Q&A Lounge", ev: "ff", session: "Ask an Embryologist", who: "Dr Fiona Galvin", deck: "na", video: "na", audio: "done", format: "na", approved: "done", folder: "No slides · audio only" },
  { stage: "Performance Lab", ev: "mh", session: "Mobility for Desk Workers", who: "Ciaran Moran", deck: "done", video: "done", audio: "done", format: "done", approved: "done", folder: "PL / Sat / 1000" },
  { stage: "Performance Lab", ev: "mh", session: "Recovery: What Actually Works", who: "Jamie Kerr", deck: "done", video: "done", audio: "done", format: "done", approved: "done", folder: "PL / Sat / 1300" },
];
type Verdict = "Ready" | "At risk" | "Blocked";
const VERDICT: Record<string, { v: Verdict; why: string }> = {
  "Main Stage 1": { v: "Blocked", why: "Dr Brennan's first-cut deck hasn't arrived, so medical and AV review can't start." },
  "Main Stage 2": { v: "At risk", why: "Clash at 14:30, one open slot, Dr Richards' deck outstanding." },
  "Workshop Stage 1": { v: "At risk", why: "Dr Nair's deck overdue, needed for AV review this week." },
  "Workshop Stage 2": { v: "At risk", why: "Dr Tierney's headshot and deck outstanding, clash at 14:30." },
  "Expert Q&A Lounge": { v: "Ready", why: "Lounge format, 5 of 7 sessions run without slides. Booked sessions checked." },
  "Performance Lab": { v: "Ready", why: "Every booked session is AV ready. Open slots don't affect handover yet." },
};
const vTone = (v: Verdict) => v === "Ready" ? "ok" : v === "Blocked" ? "bad" : "warn";

/* ── Small local pieces ────────────────────────────────────────────────── */
function StackBar({ segs, height = 10 }: { segs: { v: number; c: string; o?: number; label?: string }[]; height?: number }) {
  const total = Math.max(1, segs.reduce((a, s) => a + s.v, 0));
  return (
    <div style={{ display: "flex", gap: 2, height, borderRadius: 99, overflow: "hidden", background: "var(--track)" }}>
      {segs.filter(s => s.v > 0).map((s, i) => (
        <span key={i} title={s.label ? `${s.label}: ${s.v}` : undefined} style={{ flex: `${s.v} 0 0`, background: s.c, opacity: s.o ?? 1 }} />
      ))}
    </div>
  );
}
const DECK_ORDER: { k: string; label: string; c: string; o?: number; match: (d: Deck) => boolean }[] = [
  { k: "out", label: "Outstanding", c: "var(--bad)", match: d => isOut(d) },
  { k: "rec", label: "Received", c: "var(--mid)", match: d => d === "Received" },
  { k: "nhs", label: "Needs House Style", c: "var(--warn)", match: d => d === "Needs House Style" },
  { k: "fmt", label: "Formatting", c: "var(--warn)", o: 0.55, match: d => d === "Formatting" },
  { k: "app", label: "Approved", c: "var(--ok)", o: 0.55, match: d => d === "Approved" },
  { k: "av", label: "AV Ready", c: "var(--ok)", match: d => d === "AV Ready" },
];
function Mini({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ fontSize: 11.5, color: "var(--dim)", lineHeight: 1.45, ...style }}>{children}</div>;
}
function WaIcon({ on }: { on: boolean }) {
  return <span title={on ? "In WhatsApp group" : "Not in WhatsApp group"} style={{ color: on ? "var(--ok)" : "var(--faint)", display: "inline-flex" }}><Icon d={PATHS.whatsapp} size={14} /></span>;
}
const deckLabel = (s: Sp) => s.deck === "Overdue" ? `Overdue · due ${s.due}` : s.deck;
function roomTone(v: string) {
  const k = v.toLowerCase();
  if (/not linked|overdue|missing/.test(k)) return "bad" as const;
  if (/not started|not scheduled/.test(k)) return "ghost" as const;
  return toneOf(v);
}
const speakerIdByWho = (who?: string) => {
  if (!who) return undefined;
  const first = who.split(",")[0].trim();
  return BY_NAME[first]?.id;
};

/* ── Canada: no speakers yet, show what is cloned ─────────────────────── */
const CA_WORKFLOWS = ["Speaker invite and confirmation", "Bio and headshot collection", "Deck request with 3 auto reminders", "House style formatting pass",
  "Content room setup (WhatsApp)", "Outline and questions approval", "Programme builder (56 slots, 4 rooms)", "Travel and green room",
  "AV folder structure", "AV handover checklist", "Stage manager run sheet", "Post-event recordings"];
function CanadaView({ fx, what }: { fx: Fx; what: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: 14 }}>
      <Card title="Production workflows cloned from Future Fertility Dublin" sub="12 of 12" right={<Badge tone="ca">PLANNING</Badge>}>
        <Mini style={{ marginBottom: 10 }}>No {what} for the Canada Pilot yet. When a venue is confirmed these run as they do in Dublin.</Mini>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "2px 16px" }}>
          {CA_WORKFLOWS.map(w => (
            <Row key={w} gap={8} style={{ padding: "6px 0", borderTop: "1px solid var(--border)" }}>
              <StepDot s="done" /><span style={{ fontSize: 12.5, color: "var(--body)" }}>{w}</span>
            </Row>
          ))}
        </div>
      </Card>
      <Card title="Before production can start" sub={`${CANADA.decisions.length} decisions open`}>
        {CANADA.decisions.map(([k, v]) => (
          <Row key={k} style={{ padding: "7px 0", borderTop: "1px solid var(--border)", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12.5, color: "var(--body)" }}>{k}</span><Badge tone={v === "TBD" ? "ca" : "warn"}>{v}</Badge>
          </Row>
        ))}
        <Mini style={{ margin: "10px 0 12px" }}>Venue drives room count, so the programme grid stays a template until then. Speaker fees wait on currency.</Mini>
        <Row gap={8} style={{ flexWrap: "wrap" }}>
          <ActBtn fx={fx} k="canada-decisions" label="Send decisions to Nikki" doneLabel="Sent to Nikki" toast="6 Canada localisation decisions sent to Nikki for review" size="sm" />
          <Btn size="sm" kind="ghost" icon={PATHS.arrow} onClick={() => fx.goTo("Events", "portfolio")}>Events portfolio</Btn>
        </Row>
      </Card>
    </div>
  );
}

/* ── Tabs ──────────────────────────────────────────────────────────────── */
function Overview({ fx }: ModuleProps) {
  const f = fx.event;
  const list = ALL.filter(s => inEvent(f, s.event));
  const conf = list.filter(s => s.confirmed);
  const outN = conf.filter(s => isOut(s.deck)).length;
  const k = f === "all"
    ? { speakers: PRODUCTION_KPIS.speakers, confirmed: PRODUCTION_KPIS.confirmed, rec: PRODUCTION_KPIS.decksReceived, out: PRODUCTION_KPIS.decksOutstanding, slots: PRODUCTION_KPIS.slotsFilled, issues: PRODUCTION_KPIS.issues }
    : { speakers: list.length, confirmed: conf.length, rec: conf.length - outN, out: outN, slots: f === "ca" ? 0 : KPIS[f].speakerSlots, issues: ISSUES.filter(i => i.ev === f).length };
  const weekIds = f === "mh" ? ["s-tierney", "s-richards", "s-kelly"] : ["s-brennan", "s-nair", "s-quinlan"];
  const avWeek = weekIds.map(id => BY_ID[id]);
  const progs = (["ff", "mh"] as const).filter(e => inEvent(f, e));

  return (
    <Page>
      <PageHead title="Production" sub="Speakers, decks, stages and AV handover for the 13 and 14 March weekend." fx={fx} />
      {f === "ca" ? <CanadaView fx={fx} what="speakers or sessions" /> : <>
        <Note tone="accent">
          <b style={{ color: "var(--ink)" }}>Where production stands:</b> {k.out} decks still outstanding
          {f !== "mh" ? ", 3 of them needed for AV review this week. Dr Aoife Brennan's deck is the one blocking Main Stage 1." : ". Dr Hugh Tierney's headshot is the missing asset, and it also holds Peak Health Labs' onboarding."}
          {f !== "ff" && " 8 Men's Health slots are still open with speaker lock on 13 Nov."}
        </Note>
        <div style={{ height: 14 }} />
        <Kpis min={140} items={[
          { label: "Speakers", value: k.speakers, sub: `${k.speakers - k.confirmed} awaiting confirmation`, onClick: () => fx.goTo("Production", "speakers") },
          { label: "Confirmed", value: k.confirmed, sub: `${Math.round((k.confirmed / Math.max(1, k.speakers)) * 100)}% of invited`, tone: "ok", onClick: () => fx.goTo("Production", "speakers") },
          { label: "Decks received", value: k.rec, sub: "In review to AV ready", onClick: () => fx.goTo("Production", "presentations") },
          { label: "Decks outstanding", value: k.out, sub: `${conf.filter(s => s.deck === "Overdue").length} overdue`, tone: "warn", onClick: () => fx.goTo("Production", "presentations") },
          { label: "Stage slots filled", value: k.slots + "%", sub: f === "all" ? "80 of 108" : f === "ff" ? "36 of 56" : "44 of 52", onClick: () => fx.goTo("Production", "programme") },
          { label: "Production issues", value: k.issues, sub: f === "all" ? "2 clashes, 1 blocker" : f === "ff" ? "1 clash, 1 blocker" : "1 clash, 8 open slots", tone: "bad", onClick: () => fx.goTo("Production", "av") },
        ]} />

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 14 }}>
          <Card title="Stage readiness" sub="Sessions, assets and decks combined" right={<button className="fx-link" onClick={() => fx.goTo("Production", "av")}>AV handover</button>}>
            {STAGE_READINESS.filter(s => inEvent(f, s.event)).map(s => (
              <Meter key={s.stage} value={s.pct} color={evColor(s.event)}
                label={<Row gap={8}><span className="fx-dot" style={{ background: evColor(s.event) }} />{s.stage}
                  {VERDICT[s.stage].v !== "Ready" && <Badge tone={vTone(VERDICT[s.stage].v)}>{VERDICT[s.stage].v}</Badge>}</Row>} />
            ))}
          </Card>
          <Card title="Deck pipeline" sub={`${k.confirmed} confirmed speakers`} right={<button className="fx-link" onClick={() => fx.goTo("Production", "presentations")}>Presentations</button>}>
            <StackBar height={12} segs={DECK_ORDER.map(o => ({ v: conf.filter(s => o.match(s.deck)).length, c: o.c, o: o.o, label: o.label }))} />
            <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "10px 14px" }}>
              {DECK_ORDER.map(o => {
                const n = conf.filter(s => o.match(s.deck)).length;
                return (
                  <div key={o.k} style={{ minWidth: 0 }}>
                    <Row gap={6}><span className="fx-dot" style={{ background: o.c, opacity: o.o ?? 1 }} /><span style={{ fontSize: 11, color: "var(--faint)" }}>{o.label}</span></Row>
                    <div style={{ fontSize: 18, fontWeight: 600, color: "var(--ink)", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{n}</div>
                  </div>
                );
              })}
            </div>
            <Mini style={{ marginTop: 10 }}>Final deck deadline 12 Feb 2027 · AV handover {AV_DATE}</Mini>
          </Card>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.25fr) minmax(0,1fr)", gap: 14, marginTop: 14 }}>
          <Card title={f === "mh" ? "Men's Health decks due next" : "Needed for AV review this week"} sub={`${avWeek.length} decks`} pad={false}>
            <div style={{ padding: "6px 0 4px" }}>
              {avWeek.map(s => (
                <div key={s.id} className="fx-tr" data-click="1" onClick={() => fx.open("speaker", s.id)}
                  style={{ gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr) auto", minHeight: 58 }}>
                  <div>
                    <Row gap={8}><Avatar name={s.name} size={24} /><span className="fx-strong">{s.name}</span></Row>
                    <Mini style={{ marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.session} · {s.stage}</Mini>
                  </div>
                  <div>
                    <Row gap={6}><Status s={s.id === "s-brennan" ? "BLOCKING AV" : s.deck} />{s.due && <span className="fx-muted" style={{ fontSize: 11.5 }}>due {s.due}</span>}</Row>
                    <Mini style={{ marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {s.latest ? `"${s.latest}"` : s.reminders ? `${s.reminders} reminder sent · email only` : s.status}
                    </Mini>
                  </div>
                  <div>
                    {s.id === "s-brennan"
                      ? <ActBtn fx={fx} k="nudge-brennan" size="sm" label="Nudge" doneLabel="Nudged" toast="WhatsApp nudge sent to Dr Aoife Brennan for her first-cut deck" />
                      : s.id === "s-tierney"
                      ? <ActBtn fx={fx} k="remind-peak" size="sm" kind="ghost" label="Remind Peak" doneLabel="Reminded" toast="Asset reminder sent to Peak Health Labs: logo SVG and speaker headshot" />
                      : <ActBtn fx={fx} k={"production-remind-" + s.id} size="sm" kind="ghost" label="Remind" doneLabel="Reminded" toast={`Deck reminder sent to ${s.name}`} />}
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Programme fill" sub="Stage slots across the weekend">
            {progs.map(e => {
              const p = PROGRAMME[e];
              return (
                <div key={e} style={{ padding: "4px 0 12px" }}>
                  <Row style={{ justifyContent: "space-between", marginBottom: 7 }}>
                    <Row gap={8}><EventTag id={e} /><span style={{ fontSize: 12.5, color: "var(--body)" }}>{p.confirmed} of {p.slots} confirmed</span></Row>
                    <button className="fx-link" onClick={() => { fx.setEvent(e); fx.goTo("Production", "programme"); }}>Open grid</button>
                  </Row>
                  <StackBar segs={[{ v: p.confirmed, c: evColor(e) }, { v: p.draft, c: evColor(e), o: 0.4 }, { v: p.open, c: "var(--track)" }]} />
                  <Mini style={{ marginTop: 6 }}>
                    {p.confirmed} confirmed{p.draft ? ` · ${p.draft} held or draft` : ""} · <span style={{ color: "var(--warn)" }}>{p.open} open</span>
                  </Mini>
                </div>
              );
            })}
            {f !== "ff" && <ActBtn fx={fx} k="fill-mh-slots" size="sm" label="Send 8 suggestions to Sarah" doneLabel="Suggestions sent" toast="Suggested speakers for the 8 open Men's Health slots sent to Sarah Keane" />}
          </Card>
        </div>

        <Card title="Open production issues" sub={`${k.issues} open`} pad={false} style={{ marginTop: 14 }}>
          <div style={{ paddingTop: 6 }}>
            {ISSUES.filter(i => inEvent(f, i.ev)).map((i, n) => (
              <div key={n} className="fx-tr" data-click="1" onClick={() => i.go(fx)} style={{ gridTemplateColumns: "22px minmax(0,1.3fr) minmax(0,1.6fr) 110px auto" }}>
                <span style={{ color: i.sev === "bad" ? "var(--bad)" : "var(--warn)", display: "inline-flex" }}><Icon d={PATHS.alert} size={14} /></span>
                <span className="fx-strong">{i.t}</span>
                <span className="fx-muted">{i.d}</span>
                <span><EventTag id={i.ev} /></span>
                <Btn size="sm" kind="ghost" icon={PATHS.arrow} onClick={() => i.go(fx)}>{i.cta}</Btn>
              </div>
            ))}
          </div>
        </Card>
      </>}
    </Page>
  );
}

function Speakers({ fx }: ModuleProps) {
  type F = "all" | "attention" | "unconfirmed" | "nowa";
  const [filter, setFilter] = useState<F>("all");
  const [more, setMore] = useState(false);
  const inEv = ALL.filter(s => inEvent(fx.event, s.event));
  const attention = (s: Sp) => s.deck === "Overdue" || s.headshot === "missing" || s.bio === "missing" || /chasing|blocking|missing/i.test(s.status);
  const rows = inEv.filter(s => filter === "all" ? true : filter === "attention" ? attention(s) : filter === "unconfirmed" ? !s.confirmed : !s.whatsapp);
  const shown = more ? rows : rows.slice(0, 24);
  const headMissing = inEv.filter(s => s.headshot === "missing").length;
  const noWa = inEv.filter(s => !s.whatsapp).length;

  const cols: Col<Sp>[] = [
    { k: "name", label: "Speaker", w: "minmax(0,1.35fr)", render: s => (
      <Row gap={8}><Avatar name={s.name} size={22} /><span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
        <span className="fx-strong">{s.name}</span>{s.mock && <span className="fx-muted" style={{ fontSize: 10.5 }}> · mock</span>}</span></Row>) },
    { k: "event", label: "Event", w: "92px", render: s => <EventTag id={s.event} /> },
    { k: "session", label: "Session", w: "minmax(0,1.6fr)" },
    { k: "stage", label: "Stage", w: "minmax(0,.95fr)", render: s => <span className="fx-muted">{s.stage}</span> },
    { k: "confirmed", label: "Confirmed", w: "70px", render: s => <StepDot s={s.confirmed ? "done" : "pending"} /> },
    { k: "bio", label: "Bio", w: "40px", render: s => <StepDot s={s.bio} /> },
    { k: "headshot", label: "Headshot", w: "62px", render: s => <StepDot s={s.id === "s-tierney" && fx.acted["remind-peak"] ? "pending" : s.headshot} /> },
    { k: "deck", label: "Deck", w: "minmax(0,1fr)", render: s => <Status s={s.confirmed ? deckLabel(s) : "Not requested"} /> },
    { k: "whatsapp", label: "WhatsApp", w: "66px", render: s => <WaIcon on={s.whatsapp} /> },
    { k: "status", label: "Status", w: "minmax(0,1fr)", render: s => {
      const st = s.id === "s-brennan" && fx.acted["nudge-brennan"] ? "Nudged today" : s.status;
      return <span style={{ color: toneOf(st) === "bad" ? "var(--bad)" : toneOf(st) === "warn" ? "var(--warn)" : "var(--body)" }}>{st}</span>;
    } },
  ];

  return (
    <Page>
      <PageHead title="Speakers" sub="Every speaker, their session and what's still missing from them." fx={fx} />
      {fx.event === "ca" ? <CanadaView fx={fx} what="speakers" /> : <>
        <Card pad={false}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", padding: "14px 18px" }}>
            <Fig label="Speakers" value={inEv.length} />
            <Fig label="Confirmed" value={inEv.filter(s => s.confirmed).length} color="var(--ok)" />
            <Fig label="Awaiting confirmation" value={inEv.filter(s => !s.confirmed).length} />
            <Fig label="Headshots missing" value={headMissing} color="var(--bad)" />
            <Fig label="Not on WhatsApp" value={noWa} color="var(--warn)" />
            <span className="fx-grow" />
            <Chips<F> value={filter} onChange={v => { setFilter(v); setMore(false); }}
              options={[["all", "All"], ["attention", "Needs attention"], ["unconfirmed", "Unconfirmed"], ["nowa", "Not on WhatsApp"]]} />
          </div>
          <Table cols={cols} rows={shown} onRow={s => fx.open("speaker", s.id)} highlight={s => s.id === "s-brennan" || s.id === "s-tierney"} />
          <Row style={{ padding: "12px 18px", borderTop: "1px solid var(--border)", justifyContent: "space-between" }}>
            <Mini>Showing {shown.length} of {rows.length} · public names marked mock are demo records only, no commercial arrangement implied</Mini>
            {rows.length > 24 && <Btn size="sm" kind="ghost" onClick={() => setMore(!more)}>{more ? "Show fewer" : `Show all ${rows.length}`}</Btn>}
          </Row>
        </Card>
      </>}
    </Page>
  );
}

type Sel = { day: "Sat" | "Sun"; time: string; room: string; cell: Cell } | null;
function Programme({ fx }: ModuleProps) {
  const initial: "ff" | "mh" = fx.event === "ff" ? "ff" : "mh";
  const [pe, setPe] = useState<"ff" | "mh">(initial);
  useEffect(() => { if (fx.event === "ff" || fx.event === "mh") setPe(fx.event); }, [fx.event]);
  const [sel, setSel] = useState<Sel>(null);
  useEffect(() => setSel(null), [pe]);
  if (fx.event === "ca") return <Page><PageHead title="Programme" sub="Stage grid by room and time." fx={fx} /><CanadaView fx={fx} what="programme" /></Page>;

  const p = PROGRAMME[pe];
  const sat = satCount(pe);
  const grid = GRID[pe];
  const rooms = ROOMS[pe];
  const color = evColor(pe);
  const fillKey = pe === "mh" ? "fill-mh-slots" : "production-fill-ff-slots";
  const suggested = !!fx.acted[fillKey];
  const openList: { day: "Sat" | "Sun"; time: string; room: string; cell: Cell }[] = [];
  grid.forEach((r, ri) => r.forEach((c, ci) => { if (c.s === "open") openList.push({ day: "Sat", time: TIMES[ri], room: rooms[ci], cell: c }); }));
  SUN_OPEN[pe].forEach(o => openList.push({ day: "Sun", time: o.time, room: o.room, cell: { s: "open" } }));

  const cellStyle = (c: Cell, on: boolean): CSSProperties => {
    const base: CSSProperties = { minHeight: 66, borderRadius: 12, padding: "8px 10px", textAlign: "left", font: "inherit", minWidth: 0, display: "flex", flexDirection: "column", gap: 3,
      cursor: "pointer", transition: "border-color .15s", outline: on ? `2px solid ${color}` : "none", outlineOffset: -1 };
    if (c.s === "confirmed") return { ...base, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--body)" };
    if (c.s === "draft") return { ...base, background: "transparent", border: "1px dashed var(--border-strong)", color: "var(--dim)" };
    if (c.s === "open") return { ...base, background: "var(--accent-faint)", border: "1px dashed var(--accent-line)", color: "var(--accent)", justifyContent: "center", alignItems: "center" };
    if (c.s === "conflict") return { ...base, background: "var(--bad-soft)", border: "1px solid var(--bad)", color: "var(--body)" };
    return { ...base, background: "transparent", border: "1px solid transparent", color: "var(--faint)", cursor: "default", justifyContent: "center", alignItems: "center" };
  };

  return (
    <Page>
      <PageHead title="Programme" sub="Saturday 13 March by room and time. Click a gap for speaker suggestions." fx={fx}
        right={<Chips<"ff" | "mh"> value={pe} onChange={setPe} options={[["mh", "Men's Health"], ["ff", "Fertility"]]} />} />
      <Card pad={false}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap", padding: "14px 18px" }}>
          <Row gap={8}><EventTag id={pe} short={false} /></Row>
          <Fig label="Weekend slots" value={p.slots} />
          <Fig label="Confirmed" value={p.confirmed} color="var(--ok)" />
          <Fig label="Held or draft" value={p.draft} />
          <Fig label="Open" value={p.open} color="var(--warn)" />
          <span className="fx-grow" />
          <Badge tone="bad" style={{ height: 26, padding: "0 12px", fontSize: 11.5, letterSpacing: ".06em" }}>{p.open} UNASSIGNED SLOTS</Badge>
        </div>
        <div style={{ padding: "0 18px 12px", display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
          <Mini>Showing Sat: {sat.slots} slots · {sat.confirmed} confirmed{sat.draft ? ` · ${sat.draft} held` : ""} · {sat.open} open · {sat.clash} cells in a clash</Mini>
          <span className="fx-grow" />
          {([["Confirmed", "var(--surface-2)", "1px solid var(--border-strong)"], ["Held / draft", "transparent", "1px dashed var(--border-strong)"],
            ["Open", "var(--accent-faint)", "1px dashed var(--accent-line)"], ["Clash", "var(--bad-soft)", "1px solid var(--bad)"]] as [string, string, string][]).map(([l, bg, bd]) => (
            <Row key={l} gap={6}><span style={{ width: 14, height: 10, borderRadius: 3, background: bg, border: bd }} /><span style={{ fontSize: 11.5, color: "var(--dim)" }}>{l}</span></Row>
          ))}
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 290px", gap: 14, marginTop: 14, alignItems: "start" }}>
        <Card pad={false}>
          <div style={{ padding: 12, display: "grid", gridTemplateColumns: "52px repeat(4,minmax(0,1fr))", gap: 6 }}>
            <span />
            {rooms.map(r => (
              <div key={r} style={{ padding: "4px 4px 6px", fontSize: 11.5, fontWeight: 600, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                <span className="fx-dot" style={{ background: color, marginRight: 6 }} />{r}
              </div>
            ))}
            {grid.map((row, ri) => row[0].s === "break"
              ? [<div key={"t" + ri} style={{ fontSize: 11, color: "var(--faint)", paddingTop: 6 }}>{TIMES[ri]}</div>,
                 <div key={"b" + ri} style={{ gridColumn: "span 4", borderRadius: 10, background: "var(--surface-faint)", border: "1px solid var(--border)", fontSize: 11.5, color: "var(--faint)", padding: "7px 12px" }}>
                   Lunch · exhibition hall open · stages reset</div>]
              : [<div key={"t" + ri} style={{ fontSize: 11, color: "var(--faint)", paddingTop: 8, fontVariantNumeric: "tabular-nums" }}>{TIMES[ri]}</div>,
                 ...row.map((c, ci) => {
                   const on = !!sel && sel.day === "Sat" && sel.time === TIMES[ri] && sel.room === rooms[ci];
                   const click = c.s === "closed" ? undefined : () => setSel({ day: "Sat", time: TIMES[ri], room: rooms[ci], cell: c });
                   return (
                     <button key={ri + "-" + ci} style={cellStyle(c, on)} onClick={click} disabled={!click}>
                       {c.s === "open" ? <>
                         <Row gap={5}><Icon d={PATHS.plus} size={12} /><span style={{ fontSize: 11.5, fontWeight: 600 }}>Open slot</span></Row>
                         <span style={{ fontSize: 10.5, color: "var(--dim)", textAlign: "center" }}>{c.note ? "1 invite pending" : suggested ? "3 suggested" : "Suggest speakers"}</span>
                       </> : c.s === "closed" ? <span style={{ fontSize: 10.5 }}>{c.note}</span> : <>
                         <Row gap={6} style={{ justifyContent: "space-between" }}>
                           <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink)", lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>{c.t}</span>
                         </Row>
                         <span style={{ fontSize: 10.5, color: "var(--dim)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.who || c.note}</span>
                         {c.s === "draft" && <Badge tone="warn" style={{ height: 16, fontSize: 9, alignSelf: "flex-start" }}>HELD</Badge>}
                         {c.s === "conflict" && <Badge tone="bad" style={{ height: 16, fontSize: 9, alignSelf: "flex-start" }}>CLASH</Badge>}
                         {c.who === "Dr Aoife Brennan" && <Badge tone="bad" style={{ height: 16, fontSize: 9, alignSelf: "flex-start" }}>DECK BLOCKING AV</Badge>}
                       </>}
                     </button>
                   );
                 })]
            )}
          </div>
          <div style={{ borderTop: "1px solid var(--border)", padding: "12px 18px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>Sunday 14 Mar</span>
            <Mini>{SUN_SUMMARY[pe].slots} slots · {SUN_SUMMARY[pe].confirmed} confirmed{SUN_SUMMARY[pe].draft ? ` · ${SUN_SUMMARY[pe].draft} held` : ""} · {SUN_SUMMARY[pe].open} open:</Mini>
            {SUN_OPEN[pe].map(o => {
              const on = !!sel && sel.day === "Sun" && sel.time === o.time && sel.room === o.room;
              return <button key={o.time + o.room} className="fx-chip" data-on={on ? "1" : "0"} onClick={() => setSel({ day: "Sun", time: o.time, room: o.room, cell: { s: "open" } })}>
                <Icon d={PATHS.plus} size={11} />{o.time} · {o.room}</button>;
            })}
          </div>
        </Card>

        <ProgrammeSide fx={fx} pe={pe} sel={sel} openList={openList} fillKey={fillKey} onPick={setSel} />
      </div>
    </Page>
  );
}

function ProgrammeSide({ fx, pe, sel, openList, fillKey, onPick }: {
  fx: Fx; pe: "ff" | "mh"; sel: Sel; openList: NonNullable<Sel>[]; fillKey: string; onPick: (s: Sel) => void;
}) {
  const n = PROGRAMME[pe].open;
  const act = <ActBtn fx={fx} k={fillKey} label={`Send ${n} suggestions to Sarah`} doneLabel={`${n} suggestions sent`}
    toast={`Suggested speakers for the ${n} open ${EVENTS[pe].name} slots sent to Sarah Keane`} />;
  if (sel && sel.cell.s === "open") {
    const i = openList.findIndex(o => o.day === sel.day && o.time === sel.time && o.room === sel.room);
    const pool = SUGGEST[pe];
    const picks = [0, 1, 2].map(k => pool[(Math.max(0, i) + k) % pool.length]);
    return (
      <Card title="Open slot" sub={`${sel.day} ${sel.time} · ${sel.room}`} right={<button className="fx-link" onClick={() => onPick(null)}>All gaps</button>}>
        {sel.cell.note && <Note tone="warn">{sel.cell.note}</Note>}
        <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: ".1em", color: "var(--faint)", margin: "12px 0 6px" }}>SUGGESTED FOR THIS SLOT</div>
        {picks.map(([name, why]) => (
          <div key={name} style={{ padding: "8px 0", borderTop: "1px solid var(--border)" }}>
            <Row gap={8}><Avatar name={name} size={22} /><span className="fx-strong" style={{ fontSize: 12.5 }}>{name}</span></Row>
            <Mini style={{ marginTop: 3, paddingLeft: 30 }}>{why}</Mini>
          </div>
        ))}
        <Mini style={{ margin: "10px 0 12px" }}>Sarah reviews and invites. Pulse only drafts the shortlist from past ratings, referrals and availability.</Mini>
        {act}
      </Card>
    );
  }
  if (sel) {
    const c = sel.cell;
    const spId = speakerIdByWho(c.who);
    const sp = spId ? BY_ID[spId] : undefined;
    const room = ROOMS_ALL.find(r => r.session === c.t);
    return (
      <Card title={c.t || "Session"} sub={`${sel.day} ${sel.time} · ${sel.room}`} right={<button className="fx-link" onClick={() => onPick(null)}>All gaps</button>}>
        <Row gap={6} style={{ flexWrap: "wrap", marginBottom: 10 }}>
          <Status s={c.s === "confirmed" ? "Confirmed" : c.s === "draft" ? "Held" : "Clash"} />
          {sp && sp.confirmed && <Status s={deckLabel(sp)} />}
        </Row>
        {c.note && <Note tone={c.s === "conflict" ? "bad" : undefined}>{c.note}</Note>}
        <KV cols={1} items={[["Speakers", c.who || "To be confirmed"], ["Content room", room ? room.whatsapp : "Not set up"]]} />
        <Row gap={8} style={{ marginTop: 12, flexWrap: "wrap" }}>
          {sp && <Btn size="sm" onClick={() => fx.open("speaker", sp.id)}>Speaker</Btn>}
          {room && <Btn size="sm" icon={PATHS.whatsapp} onClick={() => fx.open("room", room.id)}>Content room</Btn>}
          {c.x && <Btn size="sm" kind="ghost" icon={PATHS.stand} onClick={() => fx.goTo("Exhibitors", "onboarding", { kind: "exhibitor", id: c.x! })}>Exhibitor</Btn>}
          {c.s === "conflict" && <ActBtn fx={fx} k={"production-clash-" + pe} size="sm" label="Ask Sarah to resolve" doneLabel="With Sarah"
            toast={`Clash sent to Sarah Keane with two free alternative slots`} />}
        </Row>
      </Card>
    );
  }
  return (
    <Card title={`${n} unassigned slots`} sub={EVENTS[pe].short}>
      {openList.map(o => (
        <button key={o.day + o.time + o.room} className="fx-tr" data-click="1" onClick={() => onPick(o)}
          style={{ gridTemplateColumns: "minmax(0,1fr) auto", padding: "0 2px", minHeight: 36, width: "100%", background: "none", border: 0, borderTop: "1px solid var(--border)", font: "inherit", textAlign: "left" }}>
          <span><span className="fx-strong">{o.day} {o.time}</span> <span className="fx-muted">· {o.room}</span></span>
          <span style={{ color: "var(--accent)", fontSize: 11.5 }}>{o.cell.note ? "Invite out" : "Suggest"}</span>
        </button>
      ))}
      <Mini style={{ margin: "10px 0 12px" }}>Speaker lock is 13 Nov. Suggestions go to Sarah Keane as a shortlist, nobody is invited automatically.</Mini>
      {act}
    </Card>
  );
}

function Rooms({ fx }: ModuleProps) {
  const list = ROOMS_ALL.filter(r => inEvent(fx.event, r.event));
  const connected = list.filter(r => r.whatsapp === "Connected").length;
  const approved = list.filter(r => r.outline === "Approved").length;
  const slidesLate = list.filter(r => r.slides === "Overdue").length;
  const calls = list.filter(r => r.meeting.startsWith("Scheduled") || r.meeting.startsWith("Proposed")).length;
  return (
    <Page>
      <PageHead title="Content rooms" sub="One room per session, synced from the WhatsApp groups Nikki already runs." fx={fx} />
      {fx.event === "ca" ? <CanadaView fx={fx} what="content rooms" /> : <>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)", gap: 14, marginBottom: 14 }}>
          <Card pad={false}>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", padding: "14px 18px" }}>
              <Fig label="Session rooms" value={list.length} />
              <Fig label="WhatsApp connected" value={`${connected}/${list.length}`} color="var(--ok)" />
              <Fig label="Outlines approved" value={approved} />
              <Fig label="Slides overdue" value={slidesLate} color="var(--bad)" />
              <Fig label="Calls coming up" value={calls} />
            </div>
          </Card>
          <Note>The groups stay in WhatsApp. Pulse pulls out the decisions, files and deadlines so Sarah doesn't have to scroll to find them.</Note>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 12 }}>
          {list.map(r => {
            const steps: [string, string][] = [["Outline", r.outline], ["Questions", r.questions], ["Slides", r.slides], ["Meeting", r.meeting.split(" · ")[0]]];
            return (
              <div key={r.id} className="fx-card" onClick={() => fx.open("room", r.id)} role="button" tabIndex={0}
                onKeyDown={e => { if (e.key === "Enter") fx.open("room", r.id); }}
                style={{ padding: "14px 16px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 10 }}>
                <Row gap={8}>
                  <EventTag id={r.event} /><span style={{ fontSize: 11.5, color: "var(--dim)" }}>{r.stage} · {r.time}</span>
                  <span className="fx-grow" />
                  <Badge tone={roomTone(r.whatsapp)}><Icon d={PATHS.whatsapp} size={11} />{r.whatsapp}</Badge>
                </Row>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", letterSpacing: "-.2px", lineHeight: 1.3 }}>{r.session}</div>
                <Row gap={8}>
                  <div style={{ display: "flex" }}>
                    {[...r.speakers, r.moderator].slice(0, 4).map((n, i) => <span key={n} style={{ marginLeft: i ? -6 : 0 }}><Avatar name={n} size={22} /></span>)}
                  </div>
                  <Mini>{r.speakers.length} speaker{r.speakers.length > 1 ? "s" : ""}, 1 moderator</Mini>
                </Row>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 6 }}>
                  {steps.map(([k, v]) => (
                    <div key={k} style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: "var(--faint)", marginBottom: 3 }}>{k}</div>
                      <Badge tone={roomTone(v)} style={{ maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis" }}>{v}</Badge>
                    </div>
                  ))}
                </div>
                <Row gap={6} style={{ borderTop: "1px solid var(--border)", paddingTop: 9 }}>
                  <Icon d={PATHS.clock} size={12} style={{ color: /overdue/i.test(r.deadline) ? "var(--bad)" : "var(--faint)" }} />
                  <span style={{ fontSize: 11.5, color: /overdue/i.test(r.deadline) ? "var(--bad)" : "var(--dim)" }}>{r.deadline}</span>
                </Row>
              </div>
            );
          })}
        </div>
      </>}
    </Page>
  );
}

function Presentations({ fx }: ModuleProps) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const conf = ALL.filter(s => s.confirmed && inEvent(fx.event, s.event));
  const brennan = BY_ID["s-brennan"];
  const showB = inEvent(fx.event, "ff");
  const rank = (s: Sp) => s.deck === "Overdue" ? (s.id === "s-brennan" ? 0 : 1) : s.idx < 13 ? 2 : 3;
  return (
    <Page>
      <PageHead title="Presentations" sub={`Every confirmed speaker's deck, from request to AV folder. Final deadline 12 Feb 2027.`} fx={fx} />
      {fx.event === "ca" ? <CanadaView fx={fx} what="decks" /> : <>
        {showB && (
          <div className="fx-card" style={{ padding: "16px 18px", borderColor: "var(--bad)", background: "var(--bad-soft)", marginBottom: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) repeat(3,minmax(0,1fr)) auto", gap: 16, alignItems: "center" }}>
              <div style={{ minWidth: 0 }}>
                <Row gap={8}><Badge tone="bad">BLOCKING AV</Badge><EventTag id="ff" /></Row>
                <div style={{ marginTop: 8, fontSize: 17, fontWeight: 600, color: "var(--ink)", letterSpacing: "-.3px" }}>{brennan.name}</div>
                <Mini>{brennan.session} · Main Stage · Nova Fertility Clinic</Mini>
              </div>
              <Fig label="Due" value="24 Sep" sub="Overdue 3 days" color="var(--bad)" />
              <Fig label="Reminders" value="×2" sub="Sent automatically" />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, color: "var(--faint)" }}>Latest response</div>
                <div style={{ marginTop: 3, fontSize: 13, color: "var(--ink)", fontStyle: "italic" }}>"{brennan.latest}"</div>
                <Mini>{fx.acted["nudge-brennan"] ? "Personal nudge sent today" : "WhatsApp, Sat 26 Sep"}</Mini>
              </div>
              <Row gap={8} style={{ flexDirection: "column", alignItems: "stretch" }}>
                <ActBtn fx={fx} k="nudge-brennan" label="Nudge on WhatsApp" doneLabel="Nudge sent" toast="WhatsApp nudge sent to Dr Aoife Brennan for her first-cut deck" />
                <Btn size="sm" kind="ghost" onClick={() => fx.open("speaker", "s-brennan")}>Open speaker</Btn>
              </Row>
            </div>
          </div>
        )}
        <Card pad={false} style={{ marginBottom: 14 }}>
          <div style={{ padding: "14px 18px" }}>
            <Row style={{ justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12.5, color: "var(--body)" }}>
                <b style={{ color: "var(--ink)" }}>{conf.length}</b> confirmed speakers · <b style={{ color: "var(--ink)" }}>{conf.filter(s => !isOut(s.deck)).length}</b> decks received ·{" "}
                <b style={{ color: "var(--bad)" }}>{conf.filter(s => isOut(s.deck)).length}</b> outstanding
              </span>
              <Mini>Reminders go out automatically 7 days, 2 days and on the day</Mini>
            </Row>
            <StackBar height={12} segs={DECK_ORDER.map(o => ({ v: conf.filter(s => o.match(s.deck)).length, c: o.c, o: o.o, label: o.label }))} />
            <Legend items={DECK_ORDER.map(o => [o.label, o.c] as [string, string])} />
          </div>
        </Card>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: 8, alignItems: "start" }}>
          {DECK_ORDER.map(o => {
            const items = conf.filter(s => o.match(s.deck)).sort((a, b) => rank(a) - rank(b) || a.idx - b.idx);
            const overdue = items.filter(s => s.deck === "Overdue").length;
            const lim = open[o.k] ? items.length : 5;
            return (
              <div key={o.k} style={{ background: "var(--surface-faint)", border: "1px solid var(--border)", borderRadius: 16, padding: 8, minWidth: 0 }}>
                <Row gap={6} style={{ padding: "4px 4px 8px" }}>
                  <span className="fx-dot" style={{ background: o.c, opacity: o.o ?? 1 }} />
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.label}</span>
                  <span className="fx-grow" /><span style={{ fontSize: 12, color: "var(--dim)", fontVariantNumeric: "tabular-nums" }}>{items.length}</span>
                </Row>
                {overdue > 0 && <div style={{ fontSize: 10.5, color: "var(--bad)", padding: "0 4px 6px" }}>{overdue} overdue</div>}
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {items.slice(0, lim).map(s => (
                    <button key={s.id} onClick={() => fx.open("speaker", s.id)}
                      style={{ textAlign: "left", font: "inherit", cursor: "pointer", padding: "8px 9px", borderRadius: 10, minWidth: 0,
                        background: s.deck === "Overdue" ? "var(--bad-soft)" : "var(--surface)", border: `1px solid ${s.id === "s-brennan" ? "var(--bad)" : "var(--border)"}`, color: "var(--body)" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
                      <Row gap={5} style={{ marginTop: 3 }}>
                        <span className="fx-dot" style={{ background: evColor(s.event) }} />
                        <span style={{ fontSize: 10.5, color: "var(--dim)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.stage}</span>
                      </Row>
                      {(s.deck === "Overdue" || s.due) && <div style={{ fontSize: 10.5, marginTop: 3, color: s.deck === "Overdue" ? "var(--bad)" : "var(--faint)" }}>
                        {s.deck === "Overdue" ? `Due ${s.due} · ${s.reminders}× reminded` : `Due ${s.due}`}</div>}
                    </button>
                  ))}
                  {items.length > 5 && (
                    <button className="fx-link" style={{ padding: "6px 4px", textAlign: "left", fontSize: 11.5 }} onClick={() => setOpen({ ...open, [o.k]: !open[o.k] })}>
                      {open[o.k] ? "Show fewer" : `+${items.length - 5} more`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </>}
    </Page>
  );
}

function AvHandover({ fx }: ModuleProps) {
  const stages = STAGE_READINESS.filter(s => inEvent(fx.event, s.event));
  const [stage, setStage] = useState<string>("all");
  const rows = AV_ROWS.filter(r => inEvent(fx.event, r.ev) && (stage === "all" || r.stage === stage));
  const blocked = stages.filter(s => VERDICT[s.stage].v === "Blocked").length;
  const risk = stages.filter(s => VERDICT[s.stage].v === "At risk").length;
  const ready = stages.filter(s => VERDICT[s.stage].v === "Ready").length;
  const conf = ALL.filter(s => s.confirmed && inEvent(fx.event, s.event));
  const avReady = conf.filter(s => s.deck === "AV Ready").length;
  const cols: Col<AvRow>[] = [
    { k: "stage", label: "Stage", w: "minmax(0,1fr)", render: r => <Row gap={7}><span className="fx-dot" style={{ background: evColor(r.ev) }} /><span className="fx-muted">{r.stage}</span></Row> },
    { k: "session", label: "Session", w: "minmax(0,1.9fr)", render: r => <span style={{ minWidth: 0 }}><span className="fx-strong">{r.session}</span><span className="fx-muted"> · {r.who}</span></span> },
    { k: "deck", label: "Deck", w: "46px", render: r => <StepDot s={r.deck} /> },
    { k: "video", label: "Video", w: "46px", render: r => <StepDot s={r.video} /> },
    { k: "audio", label: "Audio", w: "46px", render: r => <StepDot s={r.audio} /> },
    { k: "format", label: "Format", w: "54px", render: r => <StepDot s={r.format} title="16:9, fonts embedded" /> },
    { k: "approved", label: "Approved", w: "64px", render: r => <StepDot s={r.approved} /> },
    { k: "folder", label: "AV folder", w: "minmax(0,1.05fr)", render: r => <span style={{ color: /empty/i.test(r.folder) ? "var(--bad)" : "var(--dim)" }}>{r.folder}</span> },
  ];
  const verdictText = blocked ? "Not ready for handover yet" : risk ? "On track, with risks" : "Ready for handover";
  return (
    <Page>
      <PageHead title="AV handover" sub={`One view of whether each stage can go to ${AV_PARTNER} on ${AV_DATE}.`} fx={fx} />
      {fx.event === "ca" ? <CanadaView fx={fx} what="stages or AV plans" /> : <>
        <Card pad={false} style={{ marginBottom: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) repeat(4,minmax(0,.7fr))", gap: 18, alignItems: "center", padding: "16px 18px" }}>
            <div style={{ minWidth: 0 }}>
              <Row gap={8}><Badge tone={blocked ? "bad" : risk ? "warn" : "ok"}>{blocked ? "BLOCKED" : risk ? "AT RISK" : "READY"}</Badge>
                <span style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", letterSpacing: "-.3px" }}>{verdictText}</span></Row>
              <Mini style={{ marginTop: 6 }}>
                {blocked ? <>The single blocker is <button className="fx-link" onClick={() => fx.open("speaker", "s-brennan")}>Dr Aoife Brennan's deck</button> for Main Stage 1. </> : null}
                {risk} stage{risk === 1 ? "" : "s"} at risk, {ready} ready. Everything else is waiting on decks that aren't due yet.
              </Mini>
            </div>
            <Fig label="Handover to AV" value={AV_DATE} sub={`${AV_DAYS} days · ${AV_PARTNER}`} />
            <Fig label="Stages ready" value={`${ready}/${stages.length}`} color={ready === stages.length ? "var(--ok)" : undefined} />
            <Fig label="Decks AV ready" value={`${avReady}/${conf.length}`} />
            <Fig label="Blockers" value={blocked} color={blocked ? "var(--bad)" : "var(--ok)"} />
          </div>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12, marginBottom: 14 }}>
          {stages.map(s => {
            const v = VERDICT[s.stage];
            const srows = AV_ROWS.filter(r => r.stage === s.stage);
            const done = srows.filter(r => r.approved === "done").length;
            const on = stage === s.stage;
            return (
              <button key={s.stage} className="fx-card" onClick={() => setStage(on ? "all" : s.stage)}
                style={{ textAlign: "left", font: "inherit", color: "inherit", cursor: "pointer", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8,
                  borderColor: on ? evColor(s.event) : v.v === "Blocked" ? "var(--bad)" : undefined }}>
                <Row gap={8}>
                  <span className="fx-dot" style={{ background: evColor(s.event) }} />
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{s.stage}</span>
                  <span className="fx-grow" /><Badge tone={vTone(v.v)}>{v.v.toUpperCase()}</Badge>
                </Row>
                <Row gap={10}><Bar value={s.pct} color={evColor(s.event)} /><span style={{ fontSize: 12, color: "var(--dim)", fontVariantNumeric: "tabular-nums" }}>{s.pct}%</span></Row>
                <Mini>{v.why}</Mini>
                <Mini style={{ color: "var(--faint)" }}>{done} of {srows.length} tracked sessions approved</Mini>
              </button>
            );
          })}
        </div>

        <Card title="Handover board" sub="Format = 16:9, fonts embedded"
          right={<Chips<string> value={stage} onChange={setStage} options={[["all", "All stages"], ...stages.map(s => [s.stage, s.stage] as [string, string])]} />} pad={false}>
          <div style={{ height: 10 }} />
          <Table cols={cols} rows={rows} onRow={r => r.sp ? fx.open("speaker", r.sp) : fx.toast(`${r.session}: all AV items checked by ${PM}`)} highlight={r => r.sp === "s-brennan"} />
          <Row style={{ padding: "12px 18px", borderTop: "1px solid var(--border)", justifyContent: "space-between", flexWrap: "wrap" }}>
            <Row gap={14} style={{ flexWrap: "wrap" }}>
              {([["done", "Done"], ["pending", "In progress"], ["missing", "Missing"], ["na", "Not needed"]] as [Step, string][]).map(([s, l]) => (
                <Row key={s} gap={6}><StepDot s={s} /><span style={{ fontSize: 11.5, color: "var(--dim)" }}>{l}</span></Row>
              ))}
            </Row>
            <ActBtn fx={fx} k="production-av-pack" size="sm" kind="ghost" label="Share status with Lumacast Audio Visual" doneLabel="Status shared"
              toast={`Stage status and AV folder links shared with ${AV_PARTNER}`} />
          </Row>
        </Card>
      </>}
    </Page>
  );
}

export default function Production({ fx }: ModuleProps) {
  switch (fx.tab) {
    case "speakers": return <Speakers fx={fx} />;
    case "programme": return <Programme fx={fx} />;
    case "rooms": return <Rooms fx={fx} />;
    case "presentations": return <Presentations fx={fx} />;
    case "av": return <AvHandover fx={fx} />;
    default: return <Overview fx={fx} />;
  }
}

/* ── Drawers ───────────────────────────────────────────────────────────── */
type Hist = { d: string; t: string; tone?: "bad" | "ok" | "warn" };
function historyOf(s: Sp, fx: Fx): Hist[] {
  if (s.id === "s-brennan") {
    const h: Hist[] = [
      { d: "17 Sep", t: "Content call done · outline and questions approved", tone: "ok" },
      { d: "18 Sep", t: "First-cut deck requested with house template · due 24 Sep" },
      { d: "24 Sep", t: "Reminder 1 sent automatically (email + WhatsApp)", tone: "warn" },
      { d: "26 Sep", t: "Reminder 2 sent automatically · AV review waiting", tone: "warn" },
      { d: "26 Sep", t: `Reply on WhatsApp: "${s.latest}"` },
    ];
    h.push(fx.acted["nudge-brennan"] ? { d: "Today", t: `Personal nudge sent by ${PM}`, tone: "ok" } : { d: "Mon 28 Sep", t: "Reminder 3 scheduled for 09:00 unless the deck lands" });
    return h;
  }
  if (!s.confirmed) return [{ d: "18 Sep", t: "Speaker invite sent" }, { d: "29 Sep", t: "Follow-up scheduled" }, { d: "On confirmation", t: "Bio, headshot and deck requested automatically" }];
  if (s.deck === "Overdue") {
    const h: Hist[] = [{ d: "21 Sep", t: `Deck requested · due ${s.due}` }];
    for (let i = 1; i <= (s.reminders || 0); i++) h.push({ d: i === 1 ? s.due || "" : "26 Sep", t: `Reminder ${i} sent automatically${s.whatsapp ? "" : " (email only, not on WhatsApp)"}`, tone: "warn" });
    if (s.latest) h.push({ d: "26 Sep", t: `Reply: "${s.latest}"` });
    return h;
  }
  if (s.deck === "Outstanding") return [{ d: "21 Sep", t: `Deck requested with house template · due ${s.due || "9 Oct"}` }, { d: "Scheduled", t: "Auto reminders 7 days, 2 days and on the day" }];
  const h: Hist[] = [{ d: "14 Sep", t: "Deck requested with house template" }, { d: "22 Sep", t: "Deck received", tone: "ok" }];
  if (s.deck === "Needs House Style") h.push({ d: "24 Sep", t: "Returned: needs house style (fonts, logo placement)", tone: "warn" });
  if (s.deck === "Formatting") h.push({ d: "25 Sep", t: `With ${PM} for formatting`, tone: "warn" });
  if (s.deck === "Approved" || s.deck === "AV Ready") h.push({ d: "25 Sep", t: `Approved by ${PM}`, tone: "ok" });
  if (s.deck === "AV Ready") h.push({ d: "26 Sep", t: "Filed to AV folder · 16:9, fonts embedded", tone: "ok" });
  return h;
}

function SpeakerDrawer({ fx, id }: DrawerProps) {
  const s = BY_ID[id];
  if (!s) return (
    <Drawer fx={fx} eyebrow="SPEAKER" title="Speaker not found">
      <Note>No speaker record matches "{id}". <button className="fx-link" onClick={() => fx.goTo("Production", "speakers")}>Open the speaker list</button></Note>
    </Drawer>
  );
  const room = ROOMS_ALL.find(r => r.session === s.session);
  const home = s.id === "s-brennan" ? "Dublin" : ["Dublin", "Cork", "Galway", "Belfast", "London", "Limerick"][s.idx % 6];
  const hist = historyOf(s, fx);
  const headshot: Step = s.id === "s-tierney" && fx.acted["remind-peak"] ? "pending" : s.headshot;
  const deckStep: Step = !s.confirmed ? "na" : isOut(s.deck) ? (s.deck === "Overdue" ? "missing" : "pending") : "done";

  const action = s.id === "s-brennan"
    ? <ActBtn fx={fx} k="nudge-brennan" label="Nudge on WhatsApp" doneLabel="Nudge sent" toast="WhatsApp nudge sent to Dr Aoife Brennan for her first-cut deck" />
    : s.id === "s-tierney"
      ? <ActBtn fx={fx} k="remind-peak" label="Request headshot from Peak" doneLabel="Reminder sent to Peak" toast="Asset reminder sent to Peak Health Labs: logo SVG and speaker headshot" />
      : s.confirmed && (isOut(s.deck) || s.headshot === "missing")
        ? <ActBtn fx={fx} k={"production-remind-" + s.id} label="Send reminder" doneLabel="Reminder sent" toast={`Reminder sent to ${s.name}`} />
        : !s.confirmed
          ? <ActBtn fx={fx} k={"production-confirm-" + s.id} label="Chase confirmation" doneLabel="Chased" toast={`Confirmation chase sent to ${s.name}`} />
          : null;

  return (
    <Drawer fx={fx} eyebrow={"SPEAKER · " + EVENTS[s.event].name.toUpperCase()} title={s.name}
      badges={<>
        <EventTag id={s.event} />
        <Status s={s.confirmed ? "Confirmed" : "Awaiting confirmation"} />
        {s.confirmed && <Status s={s.id === "s-brennan" ? "BLOCKING AV" : "Deck: " + s.deck} />}
        {s.mock && <Badge tone="ghost">Mock record</Badge>}
      </>}
      actions={<>
        <Btn kind="ghost" onClick={() => fx.goTo("Production", "programme")}>Programme</Btn>
        {room && <Btn icon={PATHS.whatsapp} onClick={() => fx.open("room", room.id)}>Content room</Btn>}
        {action}
      </>}>
      {s.id === "s-brennan" && (
        <Sec title="WHERE THIS SLOT CAME FROM">
          <Note tone="accent">Her Main Stage 1 slot is part of Nova Fertility Clinic's {"€18,000"} package, signed {NOVA.signed}. She is Nova's Medical Director.</Note>
          <div style={{ height: 8 }} />
          <Flow nodes={[
            { t: "SALES", h: "Nova · €18,000", d: "Won 16 Sep", go: () => fx.open("deal", "d-nova") },
            { t: "CONTRACT", h: "Signed", d: "30 / 70 split", go: () => fx.open("contract", "c-nova") },
            { t: "MONEY", h: "Deposit €5,400", d: "4 days overdue", go: () => fx.open("invoice", "i-nova-1") },
            { t: "EXHIBITOR", h: "Stand A07", d: "Frontage conflict", go: () => fx.open("exhibitor", "x-nova") },
            { t: "PRODUCTION", h: "Content room", d: "Deck overdue", go: () => fx.open("room", "cr-window") },
          ]} />
        </Sec>
      )}
      {s.id === "s-tierney" && (
        <Sec title="LINKED EXHIBITOR">
          <Note tone="warn">Speaking slot comes with Peak Health Labs' {"€12,500"} package (stand {PEAK.stand}). The missing headshot is also holding Peak's onboarding at {PEAK.readiness}%.</Note>
          <Row gap={8} style={{ marginTop: 8 }}>
            <Btn size="sm" icon={PATHS.stand} onClick={() => fx.goTo("Exhibitors", "onboarding", { kind: "exhibitor", id: "x-peak" })}>Peak Health Labs onboarding</Btn>
            <Btn size="sm" kind="ghost" onClick={() => fx.open("deal", "d-peak")}>Deal</Btn>
          </Row>
        </Sec>
      )}
      {s.x && s.id !== "s-brennan" && s.id !== "s-tierney" && (
        <Sec title="LINKED EXHIBITOR">
          <Row style={{ justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: "var(--body)" }}>Session is part of {s.org}'s package</span>
            <Btn size="sm" icon={PATHS.stand} onClick={() => fx.goTo("Exhibitors", "onboarding", { kind: "exhibitor", id: s.x! })}>Open exhibitor</Btn>
          </Row>
        </Sec>
      )}
      <Sec title="PROFILE">
        <KV items={[
          ["Organisation", s.org || (s.mock ? "Mock speaker record" : "Independent")],
          ["Session", s.session],
          ["Slot", slotOf(s.session)],
          ["Stage", s.stage],
          ["Production owner", PM],
          ["WhatsApp", s.whatsapp ? "In content room" : "Not in a group yet"],
        ]} />
      </Sec>
      <Sec title="ASSETS">
        {([["Bio", s.bio, s.bio === "done" ? "Approved for website" : "Requested"],
          ["Headshot", headshot, headshot === "done" ? "Received, 2000px" : headshot === "missing" ? "Missing" : s.id === "s-tierney" ? "Requested from Peak today" : "Requested"],
          ["Deck", deckStep, !s.confirmed ? "Requested once confirmed" : deckLabel(s)]] as [string, Step, string][]).map(([k, st, t]) => (
          <Row key={k} style={{ padding: "8px 0", borderTop: "1px solid var(--border)" }}>
            <StepDot s={st} /><span style={{ fontSize: 13, color: "var(--ink)", width: 80 }}>{k}</span>
            <span style={{ fontSize: 12.5, color: st === "missing" ? "var(--bad)" : "var(--dim)" }}>{t}</span>
          </Row>
        ))}
      </Sec>
      <Sec title="DECK DEADLINE AND REMINDERS" right={s.due ? <Badge tone={s.deck === "Overdue" ? "bad" : "warn"}>Due {s.due}</Badge> : undefined}>
        <div style={{ position: "relative", paddingLeft: 16 }}>
          <span style={{ position: "absolute", left: 4, top: 6, bottom: 6, width: 1, background: "var(--border-strong)" }} />
          {hist.map((h, i) => (
            <div key={i} style={{ position: "relative", padding: "5px 0" }}>
              <span style={{ position: "absolute", left: -15, top: 10, width: 7, height: 7, borderRadius: 99,
                background: h.tone === "bad" ? "var(--bad)" : h.tone === "warn" ? "var(--warn)" : h.tone === "ok" ? "var(--ok)" : "var(--faint)" }} />
              <span style={{ fontSize: 11, color: "var(--faint)", display: "inline-block", width: 78 }}>{h.d}</span>
              <span style={{ fontSize: 12.5, color: "var(--body)" }}>{h.t}</span>
            </div>
          ))}
        </div>
      </Sec>
      <Sec title="CONTENT ROOM">
        {room ? (
          <Row style={{ padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface)" }}>
            <span style={{ color: room.whatsapp === "Connected" ? "var(--ok)" : "var(--faint)", display: "inline-flex" }}><Icon d={PATHS.whatsapp} size={16} /></span>
            <div className="fx-grow">
              <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{room.session}</div>
              <Mini>WhatsApp {room.whatsapp.toLowerCase()} · slides {room.slides.toLowerCase()} · {room.meeting}</Mini>
            </div>
            <Btn size="sm" onClick={() => fx.open("room", room.id)}>Open</Btn>
          </Row>
        ) : <Mini>No content room for this session yet. Solo talks get one when the outline is requested.</Mini>}
      </Sec>
      <Sec title="TRAVEL AND GREEN ROOM">
        <KV items={[
          ["Travel", !s.confirmed ? "Arranged once confirmed" : home === "Dublin" ? "Dublin based · no travel" : `From ${home} · hotel Fri 12 Mar`],
          ["Green room", s.stage.startsWith("Main") ? "Green Room A" : "Green Room B"],
          ["Call time", "45 minutes before session"],
          ["Parking", s.confirmed ? "RDS pass issued" : "Not yet"],
        ]} />
      </Sec>
    </Drawer>
  );
}

function RoomDrawer({ fx, id }: DrawerProps) {
  const r = ROOMS_ALL.find(x => x.id === id);
  if (!r) return (
    <Drawer fx={fx} eyebrow="CONTENT ROOM" title="Room not found">
      <Note>No content room matches "{id}". <button className="fx-link" onClick={() => fx.goTo("Production", "rooms")}>Open content rooms</button></Note>
    </Drawer>
  );
  const d = detailOf(r);
  const people = [...r.speakers.map(n => [n, "Speaker"] as [string, string]), [r.moderator, "Moderator"] as [string, string], [PM, "Production"] as [string, string]];
  const linked = r.whatsapp === "Connected";
  const action = r.id === "cr-window"
    ? <ActBtn fx={fx} k="nudge-brennan" label="Nudge Dr Brennan" doneLabel="Nudge sent" toast="WhatsApp nudge sent to Dr Aoife Brennan for her first-cut deck" />
    : r.id === "cr-bloods"
      ? <ActBtn fx={fx} k="production-link-bloods" label="Create WhatsApp group" doneLabel="Group created" toast="WhatsApp group created for 'What Your Bloods Are Telling You' and linked to Pulse" />
      : <ActBtn fx={fx} k={"production-room-" + r.id} label="Post summary to group" doneLabel="Summary posted" toast={`Status summary posted to the "${r.session}" group`} />;
  const brennanNudged = r.id === "cr-window" && fx.acted["nudge-brennan"];
  const bloodsLinked = r.id === "cr-bloods" && fx.acted["production-link-bloods"];
  return (
    <Drawer fx={fx} eyebrow={"CONTENT ROOM · " + r.stage.toUpperCase() + " · " + r.time.toUpperCase()} title={r.session}
      badges={<>
        <EventTag id={r.event} />
        <Badge tone={bloodsLinked ? "ok" : roomTone(r.whatsapp)}><Icon d={PATHS.whatsapp} size={11} />WhatsApp {bloodsLinked ? "Connected" : r.whatsapp}</Badge>
        <Badge tone={/overdue/i.test(r.deadline) ? "bad" : "ghost"}>{r.deadline}</Badge>
      </>}
      actions={<><Btn kind="ghost" onClick={() => fx.goTo("Production", "programme")}>Programme</Btn>{action}</>}>
      <Sec title="STATUS">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 8 }}>
          {([["Outline", r.outline], ["Questions", r.questions], ["Slides", r.slides], ["Meeting", r.meeting]] as [string, string][]).map(([k, v]) => (
            <div key={k} style={{ padding: "9px 10px", border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface)", minWidth: 0 }}>
              <div style={{ fontSize: 10.5, color: "var(--faint)", marginBottom: 5 }}>{k}</div>
              <Badge tone={roomTone(v)} style={{ maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis" }}>{v.split(" · ")[0]}</Badge>
              {v.includes(" · ") && <div style={{ fontSize: 10.5, color: "var(--dim)", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.split(" · ").slice(1).join(" · ")}</div>}
            </div>
          ))}
        </div>
      </Sec>
      <Sec title="PARTICIPANTS">
        {people.map(([n, role]) => {
          const sp = BY_NAME[n];
          return (
            <Row key={n + role} style={{ padding: "7px 0", borderTop: "1px solid var(--border)" }}>
              <Avatar name={n} size={24} />
              <span style={{ fontSize: 13, color: "var(--ink)" }}>{n}</span>
              <span className="fx-muted" style={{ fontSize: 12 }}>{role}</span>
              <span className="fx-grow" />
              <WaIcon on={linked || bloodsLinked} />
              {sp && <button className="fx-link" onClick={() => fx.open("speaker", sp.id)}>Profile</button>}
            </Row>
          );
        })}
      </Sec>
      <Sec title="CONVERSATION NOTES" right={<Badge tone={linked ? "ok" : "ghost"}><Icon d={PATHS.sync} size={10} />{linked ? "Synced from WhatsApp · 12 min ago" : "From email"}</Badge>}>
        {d.source && <Mini style={{ marginBottom: 8 }}>{d.source}</Mini>}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[...d.thread, ...(brennanNudged ? [{ d: "Today", who: PM, t: "Aoife, any chance of the first cut today? Even rough is fine, medical review can start on it." }] : [])].map((m, i) => (
            <div key={i} style={{ padding: "8px 11px", borderRadius: 12, background: m.auto ? "var(--surface-faint)" : "var(--surface)", border: "1px solid var(--border)" }}>
              <Row gap={8}>
                <span style={{ fontSize: 12, fontWeight: 600, color: m.auto ? "var(--dim)" : "var(--ink)" }}>{m.who}{m.auto ? " · automatic" : ""}</span>
                <span className="fx-grow" /><span style={{ fontSize: 10.5, color: "var(--faint)" }}>{m.d}</span>
              </Row>
              <div style={{ fontSize: 12.5, color: "var(--body)", marginTop: 3, lineHeight: 1.45 }}>{m.t}</div>
            </div>
          ))}
        </div>
      </Sec>
      <Sec title="CONTENT OUTLINE" right={<Status s={r.outline} />}>
        <ol style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
          {d.outline.map(o => <li key={o} style={{ fontSize: 12.5, color: "var(--body)" }}>{o}</li>)}
        </ol>
      </Sec>
      <Sec title="FILES">
        {d.files.map(([f, st]) => (
          <Row key={f} style={{ padding: "7px 0", borderTop: "1px solid var(--border)" }}>
            <Icon d={PATHS.doc} size={14} style={{ color: "var(--dim)" }} />
            <span style={{ fontSize: 12.5, color: "var(--ink)" }} className="fx-grow">{f}</span>
            <Badge tone={roomTone(st)}>{st}</Badge>
          </Row>
        ))}
      </Sec>
      <Sec title="TASKS">
        {d.tasks.map(([t, who, due]) => (
          <Row key={t} style={{ padding: "7px 0", borderTop: "1px solid var(--border)" }}>
            <StepDot s={/overdue/i.test(due) ? "missing" : "pending"} />
            <span style={{ fontSize: 12.5, color: "var(--ink)" }} className="fx-grow">{t}</span>
            <span className="fx-muted" style={{ fontSize: 12 }}>{who}</span>
            <span style={{ fontSize: 11.5, color: /overdue/i.test(due) ? "var(--bad)" : "var(--dim)", minWidth: 90, textAlign: "right" }}>{due}</span>
          </Row>
        ))}
        {r.id === "cr-bloods" && (
          <Row gap={8} style={{ marginTop: 10 }}>
            <ActBtn fx={fx} k="remind-peak" size="sm" kind="ghost" label="Remind Peak about headshot" doneLabel="Peak reminded" toast="Asset reminder sent to Peak Health Labs: logo SVG and speaker headshot" />
          </Row>
        )}
      </Sec>
    </Drawer>
  );
}

export const drawers: Record<string, (p: DrawerProps) => JSX.Element> = {
  speaker: SpeakerDrawer,
  room: RoomDrawer,
};
