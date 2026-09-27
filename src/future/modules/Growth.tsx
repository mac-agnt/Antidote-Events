/* Growth: B2C marketing, audience, content and year-round affiliate revenue.
   Shared story numbers come from data.ts (GROWTH_KPIS, AUDIENCE, AFFILIATE, NOVA, PEAK, CANADA).
   Everything below that is local is realistic demo mock data, reconciled to those totals:
     Campaign revenue: 8,832 + 6,248 + 7,744 + 7,584 + 9,396 + 1,476 = 41,280
     Affiliate commission: 2,527.50 + 1,713.60 + 1,344.00 + 1,395.90 + 1,479.00 = 8,460
     Audience sources: 9,870 + 7,412 + 5,316 + 1,640 + 1,200 = 25,438
     Content scheduled by type: 11 + 6 + 5 + 4 + 7 + 4 = 37
     Tickets sold: Future Fertility 1,312 + Future Men's Health 872 = 2,184 */
import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import type { ModuleProps, DrawerProps } from "../types";
import type { Fx } from "../types";
import {
  Page, PageHead, Card, Kpis, Badge, Status, EventTag, Btn, ActBtn, Avatar, Bar, Meter, Table, Chips, Drawer, Sec, KV, Note,
  Flow, LineChart, BarChart, Donut, Fig, Row, Icon, PATHS, inEvent, evColor, evSoft, type Col, type Tone,
} from "../ui";
import { GROWTH_KPIS, AUDIENCE, AFFILIATE, NOVA, PEAK, CANADA, EVENTS, eur, type EventId } from "../data";

type Ev = EventId | "both";
const n = (v: number) => v.toLocaleString("en-IE");
const grid = (cols: string, mb = 14): CSSProperties => ({ display: "grid", gridTemplateColumns: cols, gap: 14, marginBottom: mb, alignItems: "start" });
const evOf = (e: Ev): EventId | null => (e === "both" ? null : e);
const tagColor = (e: Ev) => (e === "both" ? "var(--dim)" : evColor(e));

/* ── Local mock data ───────────────────────────────────────────────────── */

type Campaign = {
  id: string; name: string; event: Ev; kind: "Ticket" | "Cross-sell" | "On-demand" | "Partner email" | "Launch";
  audience: number; sent: number; open: number; click: number; result: number; unit: "Tickets" | "Passes" | "Orders"; revenue: number;
  date: string; status: string; owner: string; subject: string; segments: string[]; channel: string; price: string;
};
const CAMPAIGNS: Campaign[] = [
  { id: "cmp-ff-eb", name: "Future Fertility Early Bird", event: "ff", kind: "Ticket", audience: 9420, sent: 9214, open: 52, click: 14, result: 184, unit: "Tickets", revenue: 8832,
    date: "8 Sep", status: "Live · ends 11 Oct", owner: "Amy Byrne", subject: "Early Bird for Future Fertility 2027 is open", segments: ["Future Fertility attendee", "Newsletter · fertility interest"], channel: "HubSpot email · 3-step sequence", price: "€48 avg" },
  { id: "cmp-mh-eb", name: "Future Men's Health Early Bird", event: "mh", kind: "Ticket", audience: 6180, sent: 6044, open: 47, click: 12, result: 142, unit: "Tickets", revenue: 6248,
    date: "10 Sep", status: "Live · ends 18 Oct", owner: "Amy Byrne", subject: "Men's Health 2027: Early Bird tickets", segments: ["Future Men's Health attendee", "Newsletter · men's health interest"], channel: "HubSpot email · 3-step sequence", price: "€44 avg" },
  { id: "cmp-presale", name: "Past attendee pre-sale", event: "both", kind: "Ticket", audience: 5960, sent: 5902, open: 61, click: 19, result: 176, unit: "Tickets", revenue: 7744,
    date: "1 Sep", status: "Complete", owner: "Amy Byrne", subject: "You came last year. First access to 2027", segments: ["Past attendee", "Newsletter"], channel: "HubSpot email · 2 sends", price: "€44 avg" },
  { id: "cmp-couples", name: "Couples weekend pass", event: "both", kind: "Cross-sell", audience: 2910, sent: 2871, open: 58, click: 17, result: 96, unit: "Passes", revenue: 7584,
    date: "22 Sep", status: "Live", owner: "Amy Byrne", subject: "One weekend, both events, two tickets", segments: ["Attended both events", "Men's Health · partner in fertility journey"], channel: "HubSpot email + Instagram Stories", price: "€79 per pass (2 tickets)" },
  { id: "cmp-ondemand", name: "Future Fertility On Demand", event: "ff", kind: "On-demand", audience: 11240, sent: 10982, open: 44, click: 9, result: 324, unit: "Orders", revenue: 9396,
    date: "15 Sep", status: "Live", owner: "Amy Byrne", subject: "Every 2026 Main Stage talk, on demand", segments: ["Future Fertility attendee", "Newsletter · fertility interest", "Past attendee"], channel: "HubSpot email + Shopify", price: "€29 library" },
  { id: "cmp-clar-partner", name: "Partner email · Clarity Hormone Clinic", event: "ff", kind: "Partner email", audience: 1380, sent: 1352, open: 49, click: 11, result: 41, unit: "Tickets", revenue: 1476,
    date: "24 Sep", status: "Sent", owner: "Kathleen Corr", subject: "Clarity patients: 25% off Future Fertility 2027", segments: ["Clarity Hormone Clinic patient list (sent by Clarity)"], channel: "Partner send · tracked code CLARITY25", price: "€36 partner rate" },
  { id: "cmp-mh-launch", name: "Future Men's Health launch", event: "mh", kind: "Launch", audience: 8640, sent: 0, open: 0, click: 0, result: 0, unit: "Tickets", revenue: 0,
    date: "Tue 29 Sep 10:00", status: "Awaiting approval", owner: "Amy Byrne", subject: "The Future Men's Health 2027 lineup", segments: ["Future Men's Health attendee", "Newsletter · men's health interest", "Affiliate buyer · Performance Nutrition Co."], channel: "HubSpot email + Later social push", price: "€44 Early Bird" },
];
const APPROVE_MH = "growth-approve-mh";
const campStatus = (c: Campaign, fx: Fx) => (c.id === "cmp-mh-launch" && fx.acted[APPROVE_MH] ? "Approved · sends Tue 29 Sep" : c.status);

/* Cumulative tickets, Jun → Mar. Actual to Sep, projected after. */
const TICKET_MONTHS = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
const TICKETS = {
  ff: { actual: [240, 520, 890, 1312], proj: [1312, 1720, 2150, 2780, 3300, 4150, 5200] },
  mh: { actual: [150, 330, 590, 872], proj: [872, 1150, 1450, 1900, 2300, 2950, 3700] },
};
const pad = (arr: number[], before: number, len: number) => [...Array(before).fill(null), ...arr, ...Array(Math.max(0, len - before - arr.length)).fill(null)] as (number | null)[];

type Segment = { id: string; label: string; count: number; event: Ev; d30: string; source: string };
const SEGMENTS: Segment[] = [
  { id: "ff", label: "Future Fertility attendee", count: AUDIENCE.ff, event: "ff", d30: "+612", source: "Shopify tickets, HubSpot" },
  { id: "mh", label: "Future Men's Health attendee", count: AUDIENCE.mh, event: "mh", d30: "+438", source: "Shopify tickets, HubSpot" },
  { id: "past", label: "Past attendee (2024 to 2026)", count: 11960, event: "both", d30: "No change", source: "Shopify ticket history" },
  { id: "buyer", label: "2027 ticket buyer", count: 1962, event: "both", d30: "+904", source: "Shopify · 2,184 tickets" },
  { id: "news", label: "Newsletter subscriber", count: GROWTH_KPIS.subscribers, event: "both", d30: "+1,126", source: "Newsletter forms, HubSpot" },
  { id: "exh", label: "Exhibitor contact", count: 412, event: "both", d30: "+37", source: "HubSpot deals" },
  { id: "spon", label: "Sponsor contact", count: 64, event: "both", d30: "+5", source: "HubSpot deals" },
  { id: "spk", label: "Speaker", count: 138, event: "both", d30: "+11", source: "Production records" },
  { id: "aff", label: "Affiliate buyer", count: 612, event: "both", d30: "+168", source: "Affiliate codes · 650 orders" },
];
const SOURCES = [
  { label: "Shopify tickets", value: 9870, color: "var(--accent)" },
  { label: "HubSpot", value: 7412, color: "var(--warn)" },
  { label: "Newsletter forms", value: 5316, color: "var(--ok)" },
  { label: "Exhibitor and partner lead capture", value: 1640, color: "var(--ev-mh)" },
  { label: "On-demand and other", value: 1200, color: "var(--dim)" },
];
const CROSS = [
  { id: "mh-partner", title: "Men's Health attendees with a partner in a fertility journey", size: 1240, from: "mh" as EventId, to: "ff" as EventId,
    why: "Flagged from the 2026 registration question on household fertility.", offer: "Couples weekend pass", est: "~€9,800 at 10% uptake" },
  { id: "ff-od", title: "Fertility On Demand buyers without a 2027 ticket", size: 2610, from: "ff" as EventId, to: "ff" as EventId,
    why: "Bought the 2026 library in the last 30 days, no ticket yet.", offer: "Early Bird reminder before 11 Oct", est: "~€7,500 at 6%" },
  { id: "past", title: "Past attendees without a 2027 ticket", size: 9998, from: "ff" as EventId, to: "mh" as EventId,
    why: "11,960 past attendees less 1,962 who have already bought.", offer: "Pre-sale final call", est: "~€13,800 at 3%" },
  { id: "aff-mh", title: "Performance Nutrition buyers not on a Men's Health list", size: 164, from: "mh" as EventId, to: "mh" as EventId,
    why: "Came in through the FUTURE15 code, never registered for the event.", offer: "Add to Men's Health launch", est: "~€870 at 12%" },
];

type Content = {
  id: string; asset: string; type: string; event: Ev; who: string; channel: string; date: string; status: string; tools: string[];
  go?: (fx: Fx) => void;
};
const CONTENT_TYPES: [string, number][] = [
  ["Speaker Clip", 11], ["Main Stage Clip", 6], ["Partner Reel", 5], ["Expert Q&A", 4], ["Exhibitor Spotlight", 7], ["Ticket Campaign", 4],
];
const CONTENT: Content[] = [
  { id: "ct-couples", asset: "Couples weekend pass: two tickets, one weekend", type: "Ticket Campaign", event: "both", who: "Campaign", channel: "Instagram Stories", date: "28 Sep", status: "Scheduled", tools: ["Designed in Canva", "Scheduled in Later"], go: fx => fx.open("campaign", "cmp-couples") },
  { id: "ct-moloney", asset: "IVF: what the numbers mean, in 60 seconds", type: "Speaker Clip", event: "ff", who: "Dr Ciara Moloney", channel: "Instagram Reels", date: "29 Sep", status: "Scheduled", tools: ["Edited in CapCut", "Scheduled in Later"], go: fx => fx.open("speaker", "s-moloney") },
  { id: "ct-mh-teaser", asset: "Men's Health 2027 lineup teaser", type: "Ticket Campaign", event: "mh", who: "Campaign", channel: "Instagram + TikTok", date: "29 Sep", status: "Needs approval", tools: ["Designed in Canva"], go: fx => fx.open("campaign", "cmp-mh-launch") },
  { id: "ct-lipsett", asset: "Training for the Long Game, 2026 Main Stage highlight", type: "Main Stage Clip", event: "mh", who: "Rob Lipsett", channel: "YouTube Shorts + TikTok", date: "30 Sep", status: "Scheduled", tools: ["Cut in Opus", "Scheduled in Later"], go: fx => fx.open("speaker", "s-lipsett") },
  { id: "ct-nova-1", asset: "Nova Fertility Clinic partner announcement (1 of 2)", type: "Exhibitor Spotlight", event: "ff", who: "Nova Fertility Clinic", channel: "Instagram + LinkedIn", date: "1 Oct", status: "Scheduled", tools: ["Designed in Canva", "Scheduled in Later"], go: fx => fx.open("partner", "p-nova") },
  { id: "ct-kenny", asset: "Nutrition for conception: your questions", type: "Expert Q&A", event: "ff", who: "Orla Kenny", channel: "Instagram Live", date: "2 Oct", status: "Scheduled", tools: ["Scheduled in Later"], go: fx => fx.open("speaker", "s-kenny") },
  { id: "ct-pnc", asset: "Autumn Performance Stack, 15% off with FUTURE15", type: "Partner Reel", event: "both", who: "Performance Nutrition Co.", channel: "Instagram + TikTok", date: "3 Oct", status: "In edit", tools: ["Edited in CapCut"], go: fx => fx.open("affiliate", "perf-nutrition") },
  { id: "ct-ferro", asset: "Recovery pods at the RDS", type: "Exhibitor Spotlight", event: "mh", who: "Ferro Sports Recovery", channel: "Instagram Reels", date: "4 Oct", status: "Scheduled", tools: ["Edited in CapCut", "Scheduled in Later"], go: fx => fx.open("partner", "p-ferro") },
  { id: "ct-ff-eb", asset: "Early Bird ends 11 Oct countdown", type: "Ticket Campaign", event: "ff", who: "Campaign", channel: "Stories + email", date: "5 Oct", status: "Scheduled", tools: ["Designed in Canva", "Scheduled in Later"], go: fx => fx.open("campaign", "cmp-ff-eb") },
  { id: "ct-peak", asset: "Peak Health Labs exhibitor spotlight", type: "Exhibitor Spotlight", event: "mh", who: "Peak Health Labs", channel: "Instagram + LinkedIn", date: "6 Oct", status: "Blocked", tools: ["Designed in Canva"], go: fx => fx.goTo("Exhibitors", "onboarding", { kind: "exhibitor", id: "x-peak" }) },
  { id: "ct-porter", asset: "Resilience on and off the pitch", type: "Main Stage Clip", event: "mh", who: "Andrew Porter", channel: "YouTube Shorts + Reels", date: "7 Oct", status: "Scheduled", tools: ["Cut in Opus", "Scheduled in Later"], go: fx => fx.open("speaker", "s-porter") },
  { id: "ct-nova-2", asset: "Nova speaker reveal: Dr Aoife Brennan (2 of 2)", type: "Exhibitor Spotlight", event: "ff", who: "Nova Fertility Clinic", channel: "Instagram + LinkedIn", date: "8 Oct", status: "Awaiting assets", tools: ["Designed in Canva"], go: fx => fx.open("partner", "p-nova") },
  { id: "ct-farrell", asset: "Fertility and mental load", type: "Speaker Clip", event: "ff", who: "Sinead Farrell", channel: "Instagram Reels", date: "9 Oct", status: "Needs approval", tools: ["Edited in CapCut"], go: fx => fx.open("speaker", "s-farrell") },
  { id: "ct-kelly", asset: "Men's health before 40: your questions", type: "Expert Q&A", event: "mh", who: "Dr Robert Kelly", channel: "Instagram Live", date: "10 Oct", status: "Scheduled", tools: ["Scheduled in Later"], go: fx => fx.open("speaker", "s-kelly") },
  { id: "ct-clar", asset: "Clarity Hormone Clinic workshop preview", type: "Partner Reel", event: "ff", who: "Clarity Hormone Clinic", channel: "Instagram + LinkedIn", date: "11 Oct", status: "In edit", tools: ["Edited in CapCut"], go: fx => fx.open("partner", "p-clar") },
  { id: "ct-nair", asset: "Egg freezing: a practical guide", type: "Speaker Clip", event: "ff", who: "Dr Priya Nair", channel: "Instagram Reels", date: "26 Sep", status: "Published", tools: ["Cut in Opus", "Scheduled in Later"], go: fx => fx.open("speaker", "s-nair") },
];
const contentStatus = (c: Content, fx: Fx) => {
  if (c.id === "ct-peak") return fx.acted["remind-peak"] ? "Reminder sent · logo SVG" : "Blocked · logo SVG";
  if (c.id === "ct-mh-teaser") return fx.acted[APPROVE_MH] ? "Scheduled" : "Needs approval";
  if (c.id === "ct-nova-2") return fx.acted["growth-nova-assets"] ? "Assets requested" : "Awaiting assets";
  return c.status;
};
const DAYS = Array.from({ length: 14 }, (_, i) => {
  const d = 28 + i, day = d > 30 ? d - 30 : d, mon = d > 30 ? "Oct" : "Sep";
  return { key: `${day} ${mon}`, d: day, mon, wd: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i % 7], weekend: i % 7 >= 5 };
});

type Affiliate = {
  id: string; partner: string; partnerId?: string; event: Ev; discount: number; commission: number; sends: number; clicks: number; orders: number;
  revenue: number; earned: number; campaign: string; code: string; since: string; paid: number; pending: number; contact: string;
};
const AFFILIATES: Affiliate[] = [
  { id: "perf-nutrition", partner: AFFILIATE.partner, partnerId: "p-pnc", event: "both", discount: AFFILIATE.discount, commission: AFFILIATE.commission, sends: AFFILIATE.sends,
    clicks: AFFILIATE.clicks, orders: AFFILIATE.orders, revenue: AFFILIATE.revenue, earned: AFFILIATE.earned, campaign: "Autumn Performance Stack", code: "FUTURE15",
    since: "Jun 2026", paid: 1407.1, pending: 1120.4, contact: "Grace Molloy · Partnerships" },
  { id: "fertile-ground", partner: "Fertile Ground Nutrition", event: "ff", discount: 10, commission: 12, sends: 6120, clicks: 894, orders: 138, revenue: 14280, earned: 1713.6,
    campaign: "Preconception Pack", code: "FUTUREFG10", since: "Jul 2026", paid: 1012.8, pending: 700.8, contact: "Ruairi Dunne · Founder" },
  { id: "ferro", partner: "Ferro Sports Recovery", partnerId: "p-ferro", event: "mh", discount: 15, commission: 10, sends: 4310, clicks: 602, orders: 96, revenue: 13440, earned: 1344,
    campaign: "Recovery Week", code: "FUTUREFERRO", since: "Jul 2026", paid: 806.4, pending: 537.6, contact: "Jamie Kerr · Founder" },
  { id: "seed", partner: "Seed & Stem Supplements", partnerId: "p-seed", event: "ff", discount: 12, commission: 15, sends: 2960, clicks: 488, orders: 71, revenue: 9860, earned: 1479,
    campaign: "Conception Essentials", code: "FUTURESEED", since: "Jun 2026", paid: 1035.3, pending: 443.7, contact: "Hannah Boyle · Brand" },
  { id: "restful", partner: "Restful Sleep Lab", event: "both", discount: 20, commission: 10, sends: 3900, clicks: 1020, orders: 131, revenue: 13959, earned: 1395.9,
    campaign: "Sleep Reset", code: "FUTURESLEEP", since: "Sep 2026", paid: 0, pending: 1395.9, contact: "Maeve Connolly · Growth" },
];
const COMMISSION_MONTHS = { labels: ["Jun", "Jul", "Aug", "Sep"], values: [1240, 2180, 2410, 2630] };
const MONETISE = [
  { m: "Oct", what: "Performance Nutrition follow-up · Restful Sleep Lab clocks-back send", sends: "12,300", est: 1740 },
  { m: "Nov", what: "Black Friday partner bundle (3 partners, one email)", sends: "18,900", est: 2900 },
  { m: "Dec", what: "Gift guide: Seed & Stem, Performance Nutrition, Ferro", sends: "17,400", est: 1700 },
  { m: "Jan", what: "New Year reset: Performance Nutrition, Fertile Ground", sends: "19,200", est: 2200 },
  { m: "Feb", what: "Partner offers inside ticket reminder emails", sends: "14,600", est: 1500 },
  { m: "Mar", what: "On-site codes at the RDS, both event days", sends: "Event", est: 2400 },
];

type Rung = "done" | "progress" | "proposed" | "none" | "blocked";
const RUNGS = ["Exhibitor", "Affiliate", "Email", "Social", "Content", "Competition", "Event activation"] as const;
type Partner = {
  id: string; name: string; event: Ev; owner: string; rungs: Rung[]; eventValue: number; yearRound: number; projected: number;
  next: string; plan: [string, string, string][]; note?: string; links: (fx: Fx) => { t: string; h: string; d?: string; go?: () => void }[]; affiliate?: string;
};
const PARTNERS: Partner[] = [
  { id: "p-pnc", name: AFFILIATE.partner, event: "both", owner: "Amy Byrne", rungs: ["done", "done", "done", "done", "progress", "proposed", "proposed"],
    eventValue: 0, yearRound: AFFILIATE.earned, projected: 16100, affiliate: "perf-nutrition",
    next: "Pitch a Men's Health sampling activation for March",
    plan: [["Q4 2026", "Autumn Performance Stack email (8,420 sent) · October follow-up · Black Friday bundle", "Live"],
      ["Q1 2027", "New Year reset email · competition: 2 weekend passes + a 3-month stack · sampling bar at Men's Health", "Proposed"],
      ["Q2 2027", "Summer training content series with Main Stage speakers", "Draft"],
      ["Q3 2027", "Back-to-routine offer to the full newsletter", "Draft"]],
    links: fx => [
      { t: "AFFILIATE", h: "FUTURE15 · 15% / 15%", d: eur(AFFILIATE.earned, 2) + " commission", go: () => fx.open("affiliate", "perf-nutrition") },
      { t: "CONTENT", h: "Partner reel in edit", d: "3 Oct · CapCut", go: () => fx.goTo("Growth", "content") },
      { t: "CAMPAIGN", h: "Men's Health launch", d: "Affiliate buyers included", go: () => fx.open("campaign", "cmp-mh-launch") },
    ] },
  { id: "p-nova", name: NOVA.company, event: "ff", owner: NOVA.owner, rungs: ["done", "none", "proposed", "progress", "progress", "none", "none"],
    eventValue: NOVA.value, yearRound: 0, projected: 7200,
    next: "Hold the year-round proposal until the deposit lands",
    note: `Deposit ${eur(NOVA.deposit)} is ${NOVA.daysOverdue} days overdue (FE-2027-0412). Social post 2 of 2 is waiting on a clinic photo and an approved quote.`,
    plan: [["Q4 2026", "2 social announcement posts (package) · 1 scheduled 1 Oct, 1 awaiting assets", "In progress"],
      ["Q1 2027", "Main Stage session clips from Dr Aoife Brennan · patient invite email with a tracked code", "Proposed"],
      ["Q2 2027", "Quarterly sponsored newsletter slot (€900 each)", "Proposed"],
      ["Q3 2027", "Expert Q&A series on the fertility window", "Proposed"]],
    links: fx => [
      { t: "DEAL", h: "€18,000 · Won 16 Sep", d: "Premium stand + Main Stage", go: () => fx.open("deal", "d-nova") },
      { t: "INVOICE", h: "FE-2027-0412", d: fx.acted["chase-nova"] ? "Chase sent" : "€5,400 · 4 days overdue", go: () => fx.open("invoice", "i-nova-1") },
      { t: "EXHIBITOR", h: "Stand A07 · Zone A", d: "Frontage query", go: () => fx.goTo("Exhibitors", "onboarding", { kind: "exhibitor", id: "x-nova" }) },
      { t: "SPEAKER", h: NOVA.speaker, d: "Deck overdue", go: () => fx.open("speaker", "s-brennan") },
    ] },
  { id: "p-peak", name: PEAK.company, event: "mh", owner: PEAK.owner, rungs: ["done", "proposed", "proposed", "none", "blocked", "none", "none"],
    eventValue: PEAK.value, yearRound: 0, projected: 5800,
    next: "Offer an at-home blood test code to the Men's Health list",
    note: "Exhibitor spotlight is blocked on the logo SVG. Speaker headshot for Dr Hugh Tierney also outstanding.",
    plan: [["Q4 2026", "Exhibitor spotlight (blocked on logo SVG) · affiliate trial: 15% off at-home blood panel", "Blocked"],
      ["Q1 2027", "Pre-event email: 'What your bloods are telling you' workshop promo", "Proposed"],
      ["Q2 2027", "Men's Health newsletter feature with Dr Hugh Tierney", "Proposed"],
      ["Q3 2027", "Autumn health check offer to affiliate buyers", "Proposed"]],
    links: fx => [
      { t: "DEAL", h: "€12,500 · Won", d: "4m x 2m stand + speaker", go: () => fx.open("deal", "d-peak") },
      { t: "EXHIBITOR", h: "Stand B14 · 78% ready", d: "Logo SVG, headshot missing", go: () => fx.goTo("Exhibitors", "onboarding", { kind: "exhibitor", id: "x-peak" }) },
      { t: "INVOICE", h: "FE-2027-0388", d: fx.acted["match-peak"] ? "Paid · reconciled" : "Xero match pending", go: () => fx.open("invoice", "i-peak-1") },
      { t: "SPEAKER", h: PEAK.speaker, d: "Headshot missing", go: () => fx.open("speaker", "s-tierney") },
    ] },
  { id: "p-ferro", name: "Ferro Sports Recovery", event: "mh", owner: "Daniel Murray", rungs: ["done", "done", "proposed", "progress", "none", "proposed", "done"],
    eventValue: 7200, yearRound: 1344, projected: 4900, affiliate: "ferro",
    next: "Add a competition to the November Black Friday send",
    plan: [["Q4 2026", "Recovery Week affiliate send · spotlight reel 4 Oct", "Live"],
      ["Q1 2027", "Recovery pods activation at the RDS (in package)", "Confirmed"],
      ["Q2 2027", "Competition: a month of recovery sessions", "Proposed"],
      ["Q3 2027", "Marathon season email to Men's Health list", "Proposed"]],
    links: fx => [
      { t: "DEAL", h: "€7,200 · Won", d: "Stand + activation", go: () => fx.open("deal", "d-ferro") },
      { t: "EXHIBITOR", h: "Stand C22 · 94% ready", d: "Extra power request", go: () => fx.goTo("Exhibitors", "onboarding", { kind: "exhibitor", id: "x-ferro" }) },
      { t: "AFFILIATE", h: "FUTUREFERRO", d: eur(1344, 2) + " commission", go: () => fx.open("affiliate", "ferro") },
    ] },
  { id: "p-clar", name: "Clarity Hormone Clinic", event: "ff", owner: "Kathleen Corr", rungs: ["done", "none", "done", "proposed", "progress", "none", "none"],
    eventValue: 13400, yearRound: 1476, projected: 4400,
    next: "Turn the workshop preview into a monthly Q&A slot",
    plan: [["Q4 2026", "Partner email to Clarity patients (41 tickets) · workshop preview reel", "Live"],
      ["Q1 2027", "Workshop sponsorship at Future Fertility (contracted)", "Confirmed"],
      ["Q2 2027", "Monthly hormone Q&A on Instagram Live", "Proposed"],
      ["Q3 2027", "Sponsored newsletter slot", "Proposed"]],
    links: fx => [
      { t: "DEAL", h: "€13,400 · Won", d: "Workshop sponsorship", go: () => fx.open("deal", "d-clar") },
      { t: "EXHIBITOR", h: "Stand A02 · Ready", d: "100% onboarded", go: () => fx.goTo("Exhibitors", "onboarding", { kind: "exhibitor", id: "x-clar" }) },
      { t: "CAMPAIGN", h: "Partner email", d: "€1,476 · 41 tickets", go: () => fx.open("campaign", "cmp-clar-partner") },
    ] },
  { id: "p-seed", name: "Seed & Stem Supplements", event: "ff", owner: "Kathleen Corr", rungs: ["done", "done", "proposed", "none", "none", "none", "none"],
    eventValue: 5600, yearRound: 1479, projected: 3200, affiliate: "seed",
    next: "Include in the December gift guide send",
    plan: [["Q4 2026", "Conception Essentials affiliate code · gift guide", "Live"],
      ["Q1 2027", "Stand at Future Fertility (paid in full)", "Confirmed"],
      ["Q2 2027", "Dedicated email to fertility newsletter", "Proposed"],
      ["Q3 2027", "Sampling at the Canada Pilot (subject to local terms)", "Idea"]],
    links: fx => [
      { t: "DEAL", h: "€5,600 · Won", d: "Standard stand", go: () => fx.open("deal", "d-seed") },
      { t: "EXHIBITOR", h: "Stand D04 · 60% ready", d: "Logo SVG, stand spec", go: () => fx.goTo("Exhibitors", "onboarding", { kind: "exhibitor", id: "x-seed" }) },
      { t: "AFFILIATE", h: "FUTURESEED", d: eur(1479, 2) + " commission", go: () => fx.open("affiliate", "seed") },
    ] },
];
const stageOf = (p: Partner) => {
  const extra = p.rungs.slice(1).filter(r => r === "done").length;
  return extra >= 3 ? "Year-round partner" : extra >= 1 ? "Growing" : "Exhibitor";
};

/* ── Small local pieces ────────────────────────────────────────────────── */

function Sub({ children }: { children: ReactNode }) {
  return <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{children}</div>;
}
function Two({ a, b }: { a: ReactNode; b?: ReactNode }) {
  return <div style={{ minWidth: 0 }}><div className="fx-strong" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a}</div>{b && <Sub>{b}</Sub>}</div>;
}
function Tools({ tools }: { tools: string[] }) {
  return <span style={{ display: "inline-flex", gap: 4 }}>{tools.map(t => <Badge key={t} tone="ghost">{t}</Badge>)}</span>;
}
function Funnel({ steps }: { steps: [string, number][] }) {
  const top = Math.max(1, steps[0][1]);
  return (
    <div>
      {steps.map(([l, v], i) => (
        <div key={l} style={{ display: "grid", gridTemplateColumns: "96px minmax(0,1fr) 110px", alignItems: "center", gap: 12, padding: "6px 0" }}>
          <span style={{ fontSize: 12.5, color: "var(--body)" }}>{l}</span>
          <Bar value={v} max={top} color={i === steps.length - 1 ? "var(--accent)" : "var(--dim)"} height={8} />
          <span className="fx-num" style={{ fontSize: 12, color: "var(--ink)" }}>{n(v)}{i > 0 && <span className="fx-muted"> · {((v / top) * 100).toFixed(1)}%</span>}</span>
        </div>
      ))}
    </div>
  );
}
function RungDot({ r, title }: { r: Rung; title: string }) {
  const map: Record<Rung, [string, string, string]> = {
    done: ["var(--ok-soft)", "var(--ok)", PATHS.check],
    progress: ["var(--warn-soft)", "var(--warn)", PATHS.clock],
    proposed: ["transparent", "var(--dim)", PATHS.plus],
    blocked: ["var(--bad-soft)", "var(--bad)", PATHS.alert],
    none: ["transparent", "var(--faint)", "M8 12h8"],
  };
  const [bg, fg, d] = map[r];
  return (
    <span title={title} style={{ width: 24, height: 24, borderRadius: 8, display: "inline-flex", alignItems: "center", justifyContent: "center", background: bg, color: fg,
      border: r === "proposed" ? "1px dashed var(--border-strong)" : r === "none" ? "1px solid var(--border)" : "1px solid transparent" }}>
      <Icon d={d} size={11} sw={2.3} />
    </span>
  );
}
const rungLabel: Record<Rung, string> = { done: "Live", progress: "In progress", proposed: "Proposed", blocked: "Blocked", none: "Not started" };

/* Canada has no audience, campaigns or partners yet: show what is cloned and what is blocking. */
function CanadaPlan({ fx, title, sub, line }: { fx: Fx; title: string; sub: string; line: string }) {
  const seq = CANADA.cloned.find(c => c[0].startsWith("Email"));
  const wf = CANADA.cloned.find(c => c[0].startsWith("Workflows"));
  const decisions = CANADA.decisions.filter(d => ["Currency", "Ticket tax", "Payment provider", "Local exhibitor terms"].includes(d[0]));
  return (
    <Page>
      <PageHead title={title} sub={sub} fx={fx} />
      <Note tone="accent"><b style={{ color: "var(--ink)" }}>Canada Pilot · Location TBD.</b> {line}</Note>
      <div style={{ ...grid("minmax(0,1.1fr) minmax(0,1fr)"), marginTop: 14 }}>
        <Card title="Growth setup cloned from Future Fertility Dublin" sub={CANADA.template}>
          {seq && <Meter label="Email sequences" value={seq[1]} max={seq[2]} color={evColor("ca")} right={`${seq[1]}/${seq[2]}`} />}
          {wf && <Meter label="Workflows" value={wf[1]} max={wf[2]} color={evColor("ca")} right={`${wf[1]}/${wf[2]}`} />}
          <Meter label="Content templates (Canva)" value={6} max={6} color={evColor("ca")} right="6/6" />
          <Meter label="Audience imported" value={0} max={1} color={evColor("ca")} right="0" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
            <Fig label="Contacts with a Canadian address" value="312" sub="Shopify + HubSpot" />
            <Fig label="Sequences paused" value="14" sub="Until currency is set" />
            <Fig label="Affiliates live" value="0" sub="Terms need review" />
          </div>
        </Card>
        <Card title="Decisions before marketing can start" right={<Btn size="sm" kind="ghost" icon={PATHS.arrow} onClick={() => fx.goTo("Events", "portfolio")}>Events · Portfolio</Btn>}>
          {decisions.map(([k, v]) => (
            <Row key={k} style={{ justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 12.5, color: "var(--body)" }}>{k}</span><Badge tone="ca">{v}</Badge>
            </Row>
          ))}
          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <ActBtn fx={fx} k="canada-decisions" label="Send decisions to Nikki" doneLabel="Sent to Nikki for review" toast="Localisation decisions sent to Nikki for review" />
            <Btn size="sm" kind="ghost" onClick={() => fx.setEvent("ff")}>View Dublin template</Btn>
          </div>
        </Card>
      </div>
    </Page>
  );
}

/* ── Tabs ──────────────────────────────────────────────────────────────── */

function Overview({ fx }: { fx: Fx }) {
  const e = fx.event;
  const camps = CAMPAIGNS.filter(c => inEvent(e, c.event));
  const affs = AFFILIATES.filter(a => inEvent(e, a.event));
  const campRev = e === "all" ? GROWTH_KPIS.campaignRevenue : camps.reduce((s, c) => s + c.revenue, 0);
  const affRev = e === "all" ? GROWTH_KPIS.affiliateRevenue : affs.reduce((s, a) => s + a.earned, 0);
  const aud = e === "ff" ? AUDIENCE.ff : e === "mh" ? AUDIENCE.mh : GROWTH_KPIS.audience;
  const subs = e === "ff" ? 12960 : e === "mh" ? 7410 : GROWTH_KPIS.subscribers;
  const tix = e === "ff" ? 1312 : e === "mh" ? 872 : GROWTH_KPIS.tickets;
  const content = e === "ff" ? 21 : e === "mh" ? 16 : GROWTH_KPIS.contentScheduled;
  const scope = e === "all" ? "" : " · incl. shared";
  const go = (tab: string) => () => fx.goTo("Growth", tab);

  const series = [
    ...(inEvent(e, "ff") ? [
      { name: "Fertility · sold", color: evColor("ff"), values: pad(TICKETS.ff.actual, 0, 10), area: true },
      { name: "Fertility · projected", color: evColor("ff"), values: pad(TICKETS.ff.proj, 3, 10), dashed: true },
    ] : []),
    ...(inEvent(e, "mh") ? [
      { name: "Men's Health · sold", color: evColor("mh"), values: pad(TICKETS.mh.actual, 0, 10), area: true },
      { name: "Men's Health · projected", color: evColor("mh"), values: pad(TICKETS.mh.proj, 3, 10), dashed: true },
    ] : []),
  ];
  const top = [...camps].filter(c => c.revenue > 0).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const topMax = Math.max(1, ...top.map(c => c.revenue));
  const upcoming = CONTENT.filter(c => inEvent(e, c.event) && c.status !== "Published").slice(0, 6);
  const approved = !!fx.acted[APPROVE_MH];

  return (
    <Page>
      <PageHead title="Growth" sub="Audience, campaigns, content and affiliate revenue across both Dublin events." fx={fx} />
      <Kpis min={160} items={[
        { label: "Known audience", value: n(aud), sub: e === "all" ? `${n(AUDIENCE.both)} attend both events` : "Event attendees", onClick: go("audience") },
        { label: "Active subscribers", value: n(subs), sub: "Newsletter, opted in", onClick: go("audience") },
        { label: "2027 tickets sold", value: n(tix), sub: e === "all" ? "1,312 Fertility · 872 Men's Health" : "Shopify, to 27 Sep", onClick: go("campaigns"), color: e === "all" ? undefined : evColor(e as EventId) },
        { label: "Campaign revenue", value: eur(campRev), sub: `${camps.filter(c => c.revenue > 0).length} campaigns${scope}`, onClick: go("campaigns") },
        { label: "Affiliate revenue", value: eur(affRev, 2), sub: `Commission earned${scope}`, onClick: go("affiliates"), tone: "ok" },
        { label: "Content scheduled", value: n(content), sub: "Next 6 weeks", onClick: go("content") },
      ]} />

      <div style={grid("minmax(0,1.65fr) minmax(0,1fr)")}>
        <Card title="Ticket sales toward 13 March" sub="Cumulative · sold to Sep, projected after" right={<Badge tone="ghost">Shopify</Badge>}>
          <LineChart labels={TICKET_MONTHS} series={series} height={210} fmt={v => n(v)} />
        </Card>
        <Card title="Pulse summary" right={<Badge tone="accent"><Icon d={PATHS.spark} size={10} />AI</Badge>}>
          <div style={{ display: "grid", gap: 11, fontSize: 12.8, lineHeight: 1.55, color: "var(--body)" }}>
            <div>Early Bird is carrying ticket sales: <b style={{ color: "var(--ink)" }}>326 tickets and €15,080</b> from the two Early Bird sends. Fertility closes 11 Oct.</div>
            <div style={{ paddingTop: 11, borderTop: "1px solid var(--border)" }}>
              The Men's Health launch to <b style={{ color: "var(--ink)" }}>8,640 people</b> {approved ? "is approved and sends Tue 29 Sep at 10:00." : "is waiting on your approval for Tue 29 Sep 10:00."}
              <div style={{ marginTop: 7 }}><ActBtn fx={fx} k={APPROVE_MH} size="sm" label="Approve launch" doneLabel="Approved" toast="Future Men's Health launch approved · sends Tue 29 Sep 10:00" /></div>
            </div>
            <div style={{ paddingTop: 11, borderTop: "1px solid var(--border)" }}>
              Affiliate commission is <b style={{ color: "var(--ink)" }}>{eur(GROWTH_KPIS.affiliateRevenue)}</b>; Performance Nutrition Co. is {eur(AFFILIATE.earned, 2)} of it. An October follow-up adds an estimated €1,100.
            </div>
            <div style={{ paddingTop: 11, borderTop: "1px solid var(--border)" }}>
              Peak Health Labs' exhibitor spotlight is blocked on a logo SVG.
              <div style={{ marginTop: 7 }}><ActBtn fx={fx} k="remind-peak" size="sm" kind="ghost" label="Remind Peak Health Labs" doneLabel="Reminder sent" toast="Asset reminder sent to Peak Health Labs (logo SVG + speaker headshot)" /></div>
            </div>
          </div>
        </Card>
      </div>

      <div style={grid("minmax(0,1fr) minmax(0,1fr)", 0)}>
        <Card title="Top campaigns" sub="By revenue" right={<button className="fx-link" onClick={go("campaigns")}>All campaigns</button>} pad={false}>
          <div style={{ padding: "8px 0 6px" }}>
            {top.map(c => (
              <div key={c.id} className="fx-tr" data-click="1" onClick={() => fx.open("campaign", c.id)}
                style={{ gridTemplateColumns: "minmax(0,1.6fr) minmax(0,1fr) 76px", borderTop: 0, minHeight: 46 }}>
                <Two a={c.name} b={`${n(c.result)} ${c.unit.toLowerCase()} · opened ${c.open}%`} />
                <Bar value={c.revenue} max={topMax} color={tagColor(c.event)} />
                <span className="fx-num fx-strong">{eur(c.revenue)}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Upcoming content" sub={`${content} scheduled`} right={<button className="fx-link" onClick={go("content")}>Content bank</button>} pad={false}>
          <div style={{ padding: "8px 0 6px" }}>
            {upcoming.map(c => (
              <div key={c.id} className="fx-tr" data-click={c.go ? "1" : undefined} onClick={() => c.go?.(fx)}
                style={{ gridTemplateColumns: "52px minmax(0,1.7fr) auto", borderTop: 0, minHeight: 46 }}>
                <span className="fx-num" style={{ textAlign: "left", color: "var(--dim)", fontSize: 12 }}>{c.date}</span>
                <Two a={c.asset} b={`${c.type} · ${c.channel}`} />
                <Status s={contentStatus(c, fx)} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Page>
  );
}

function Venn() {
  const ffOnly = AUDIENCE.ff - AUDIENCE.both, mhOnly = AUDIENCE.mh - AUDIENCE.both;
  const union = AUDIENCE.ff + AUDIENCE.mh - AUDIENCE.both;
  const rF = 90, rM = Math.round(rF * Math.sqrt(AUDIENCE.mh / AUDIENCE.ff));
  const cF = 150, cM = cF + 118;
  return (
    <div>
      <svg viewBox="0 0 420 210" width="100%" height={210} style={{ display: "block" }} role="img" aria-label="Audience overlap between the two events">
        <circle cx={cF} cy={105} r={rF} fill="var(--ev-ff-soft)" stroke="var(--ev-ff)" strokeWidth="1.5" />
        <circle cx={cM} cy={105} r={rM} fill="var(--ev-mh-soft)" stroke="var(--ev-mh)" strokeWidth="1.5" />
        <text x={cF - 34} y={100} textAnchor="middle" fontSize="18" fontWeight="600" fill="var(--ink)">{n(ffOnly)}</text>
        <text x={cF - 34} y={118} textAnchor="middle" fontSize="10.5" fill="var(--dim)">Fertility only</text>
        <text x={(cF + rF + cM - rM) / 2} y={100} textAnchor="middle" fontSize="14" fontWeight="600" fill="var(--ink)">{n(AUDIENCE.both)}</text>
        <text x={(cF + rF + cM - rM) / 2} y={116} textAnchor="middle" fontSize="10.5" fill="var(--dim)">Both</text>
        <text x={cM + 26} y={100} textAnchor="middle" fontSize="16" fontWeight="600" fill="var(--ink)">{n(mhOnly)}</text>
        <text x={cM + 26} y={118} textAnchor="middle" fontSize="10.5" fill="var(--dim)">Men's Health only</text>
      </svg>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 12, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
        <Fig label="Future Fertility" value={n(AUDIENCE.ff)} color={evColor("ff")} />
        <Fig label="Future Men's Health" value={n(AUDIENCE.mh)} color={evColor("mh")} />
        <Fig label="Attend both" value={n(AUDIENCE.both)} sub={`${((AUDIENCE.both / union) * 100).toFixed(1)}% of attendees`} />
        <Fig label="Not an attendee" value={n(GROWTH_KPIS.audience - union)} sub="Newsletter, trade, affiliate" />
      </div>
    </div>
  );
}

function Audience({ fx }: { fx: Fx }) {
  const e = fx.event;
  const segs = SEGMENTS.filter(s => inEvent(e, s.event));
  const cross = CROSS.filter(c => e === "all" || c.from === e || c.to === e);
  const cols: Col<Segment>[] = [
    { k: "label", label: "Segment", w: "minmax(0,1.7fr)", render: s => <Two a={s.label} b={s.source} /> },
    { k: "event", label: "Event", w: "minmax(0,.9fr)", render: s => <EventTag id={s.event} /> },
    { k: "count", label: "Contacts", w: "minmax(0,.7fr)", align: "right", render: s => <span className="fx-strong">{n(s.count)}</span> },
    { k: "share", label: "Share of known audience", w: "minmax(0,1.3fr)", render: s => (
      <Row gap={8}><Bar value={s.count} max={GROWTH_KPIS.audience} color={tagColor(s.event)} /><span className="fx-muted fx-num" style={{ minWidth: 40 }}>{((s.count / GROWTH_KPIS.audience) * 100).toFixed(1)}%</span></Row>) },
    { k: "d30", label: "Last 30 days", w: "minmax(0,.7fr)", align: "right", render: s => <span style={{ color: s.d30.startsWith("+") ? "var(--ok)" : "var(--faint)" }}>{s.d30}</span> },
    { k: "go", label: "", w: "110px", align: "right", render: () => <button className="fx-link" onClick={ev => { ev.stopPropagation(); fx.goTo("Growth", "campaigns"); }}>Use in campaign</button> },
  ];
  return (
    <Page>
      <PageHead title="Audience" sub={`${n(GROWTH_KPIS.audience)} known people across tickets, HubSpot and newsletter forms.`} fx={fx} />
      <div style={grid("minmax(0,1.3fr) minmax(0,1fr)")}>
        <Card title="Audience overlap" sub="Event attendees, all years">
          <Venn />
        </Card>
        <Card title="Where the audience comes from">
          <Row gap={18} style={{ alignItems: "center" }}>
            <Donut size={128} thickness={15} segments={SOURCES} center={<><div style={{ fontSize: 17, fontWeight: 600, color: "var(--ink)" }}>{n(GROWTH_KPIS.audience)}</div><div style={{ fontSize: 10.5, color: "var(--faint)" }}>known</div></>} />
            <div style={{ flex: 1, minWidth: 0 }}>
              {SOURCES.map(s => (
                <Row key={s.label} gap={8} style={{ padding: "5px 0" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flex: "none" }} />
                  <span style={{ flex: 1, minWidth: 0, fontSize: 12.3, color: "var(--body)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.label}</span>
                  <span className="fx-num" style={{ fontSize: 12, color: "var(--ink)" }}>{n(s.value)}</span>
                </Row>
              ))}
            </div>
          </Row>
          <div style={{ marginTop: 12, fontSize: 11.5, color: "var(--dim)", lineHeight: 1.5 }}>Deduplicated on email. Shopify and HubSpot sync hourly; newsletter forms write straight to HubSpot.</div>
        </Card>
      </div>

      <Card title="Segments" sub={`${segs.length} live segments · synced to HubSpot lists`} pad={false} style={{ marginBottom: 14 }}>
        <div style={{ marginTop: 12 }}><Table cols={cols} rows={segs} /></div>
      </Card>

      <Card title="Cross-sell opportunities" sub="Built from overlap and purchase history" pad={false}>
        <div style={{ marginTop: 12 }}>
          {cross.map(c => (
            <div key={c.id} className="fx-tr" style={{ gridTemplateColumns: "72px minmax(0,2fr) minmax(0,1.2fr) minmax(0,.9fr) 150px", minHeight: 58 }}>
              <span className="fx-num fx-strong" style={{ textAlign: "left", fontSize: 15 }}>{n(c.size)}</span>
              <div style={{ minWidth: 0, whiteSpace: "normal" }}>
                <div className="fx-strong">{c.title}</div>
                <Sub>{c.why}</Sub>
              </div>
              <div style={{ minWidth: 0 }}>
                <Row gap={5}><EventTag id={c.from} /><Icon d={PATHS.arrow} size={11} style={{ color: "var(--faint)" }} /><EventTag id={c.to} /></Row>
                <Sub>{c.offer}</Sub>
              </div>
              <span style={{ color: "var(--ok)", fontSize: 12 }}>{c.est}</span>
              <div style={{ textAlign: "right" }}>
                <ActBtn fx={fx} k={`growth-cross-${c.id}`} size="sm" kind="ghost" label="Build segment" doneLabel="Segment built" toast={`Segment built in HubSpot: ${n(c.size)} contacts`} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </Page>
  );
}

type CampFilter = "all" | "live" | "approval" | "done";
function Campaigns({ fx }: { fx: Fx }) {
  const [f, setF] = useState<CampFilter>("all");
  const e = fx.event;
  const base = CAMPAIGNS.filter(c => inEvent(e, c.event));
  const rows = base.filter(c => {
    const s = campStatus(c, fx);
    if (f === "live") return s.startsWith("Live");
    if (f === "approval") return c.kind === "Launch";
    if (f === "done") return s === "Complete" || s === "Sent";
    return true;
  });
  const sent = base.reduce((s, c) => s + c.sent, 0);
  const opened = base.reduce((s, c) => s + Math.round((c.sent * c.open) / 100), 0);
  const clicked = base.reduce((s, c) => s + Math.round((c.sent * c.click) / 100), 0);
  const conv = base.reduce((s, c) => s + c.result, 0);
  const rev = base.reduce((s, c) => s + c.revenue, 0);
  const attributed = base.filter(c => c.unit !== "Orders").reduce((s, c) => s + c.result * (c.unit === "Passes" ? 2 : 1), 0);
  const launch = CAMPAIGNS.find(c => c.id === "cmp-mh-launch");
  const approved = !!fx.acted[APPROVE_MH];
  const byRev = base.filter(c => c.revenue > 0);
  const short: Record<string, string> = { "cmp-ff-eb": "FF EB", "cmp-mh-eb": "MH EB", "cmp-presale": "Pre-sale", "cmp-couples": "Couples", "cmp-ondemand": "On Demand", "cmp-clar-partner": "Clarity" };

  const cols: Col<Campaign>[] = [
    { k: "name", label: "Campaign", w: "minmax(0,2fr)", render: c => <Two a={c.name} b={`${c.kind} · ${c.date}`} /> },
    { k: "event", label: "Event", w: "minmax(0,.85fr)", render: c => <EventTag id={c.event} /> },
    { k: "audience", label: "Audience", w: "minmax(0,.7fr)", align: "right", render: c => n(c.audience) },
    { k: "sent", label: "Sent", w: "minmax(0,.7fr)", align: "right", render: c => c.sent ? n(c.sent) : <span className="fx-muted">·</span> },
    { k: "open", label: "Opened", w: "minmax(0,.55fr)", align: "right", render: c => c.sent ? c.open + "%" : <span className="fx-muted">·</span> },
    { k: "click", label: "Clicks", w: "minmax(0,.55fr)", align: "right", render: c => c.sent ? c.click + "%" : <span className="fx-muted">·</span> },
    { k: "result", label: "Tickets / orders", w: "minmax(0,.8fr)", align: "right", render: c => c.result ? <span>{n(c.result)} <span className="fx-muted">{c.unit === "Tickets" ? "" : c.unit.toLowerCase()}</span></span> : <span className="fx-muted">·</span> },
    { k: "revenue", label: "Revenue", w: "minmax(0,.75fr)", align: "right", render: c => c.revenue ? <span className="fx-strong">{eur(c.revenue)}</span> : <span className="fx-muted">·</span> },
    { k: "status", label: "Status", w: "minmax(0,1.25fr)", render: c => <Status s={campStatus(c, fx)} /> },
  ];

  return (
    <Page>
      <PageHead title="Campaigns" sub="Ticket, cross-sell, on-demand and partner sends, from audience to revenue." fx={fx} />
      <div style={grid("minmax(0,1fr) minmax(0,1.5fr)")}>
        <Card title="Combined funnel" sub={`${base.filter(c => c.sent).length} sent campaigns`}>
          <Funnel steps={[["Sent", sent], ["Opened", opened], ["Clicked", clicked], ["Converted", conv]]} />
          <Row gap={0} style={{ marginTop: 10, paddingTop: 12, borderTop: "1px solid var(--border)", justifyContent: "space-between" }}>
            <Fig label="Revenue" value={eur(rev)} />
            <Fig label="Per send" value={eur(sent ? rev / sent : 0, 2)} />
            <Fig label="Tickets attributed" value={n(attributed)} sub={`of ${n(e === "ff" ? 1312 : e === "mh" ? 872 : GROWTH_KPIS.tickets)} sold`} />
          </Row>
        </Card>
        {launch && inEvent(e, launch.event) ? (
          <Card title="Awaiting approval" sub="Nikki signs off launches" right={<Status s={campStatus(launch, fx)} />}>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: 16 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>{launch.name}</div>
                <div style={{ fontSize: 12.5, color: "var(--dim)", marginTop: 4 }}>Subject: "{launch.subject}"</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 10 }}>{launch.segments.map(s => <Badge key={s} tone="ghost">{s}</Badge>)}</div>
                <div style={{ fontSize: 12.3, color: "var(--body)", marginTop: 10, lineHeight: 1.5 }}>
                  Announces 44 confirmed speakers, holds 8 open slots back for a second wave. Lineup teaser in Canva is ready; Later push queued behind the email.
                </div>
              </div>
              <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
                <Fig label="Audience" value={n(launch.audience)} sub="After suppression: 8,512" />
                <Fig label="Send" value="Tue 29 Sep" sub="10:00 · HubSpot" />
                <Fig label="Expected" value="~150 tickets" sub="Based on Early Bird rates" />
              </div>
            </div>
            <Row style={{ marginTop: 14, gap: 8 }}>
              <ActBtn fx={fx} k={APPROVE_MH} label="Approve launch" doneLabel="Approved · sends Tue 29 Sep 10:00" toast="Future Men's Health launch approved · sends Tue 29 Sep 10:00" />
              <Btn kind="ghost" onClick={() => fx.open("campaign", launch.id)}>Preview</Btn>
              {!approved && <span style={{ fontSize: 11.5, color: "var(--faint)" }}>Requested by Amy Byrne · 26 Sep</span>}
            </Row>
          </Card>
        ) : (
          <Card title="Revenue by campaign">
            <BarChart labels={byRev.map(c => short[c.id] || c.name)} series={[{ name: "Revenue", color: "var(--accent)", values: byRev.map(c => c.revenue) }]} height={170} fmt={v => eur(v)} />
          </Card>
        )}
      </div>

      <Card title="All campaigns" sub={`${eur(rev)} revenue${e === "all" ? "" : " · incl. shared campaigns"}`} pad={false}
        right={<Chips<CampFilter> value={f} onChange={setF} options={[["all", "All"], ["live", "Live"], ["approval", "Awaiting approval"], ["done", "Sent / complete"]]} />}>
        <div style={{ marginTop: 12 }}>
          <Table cols={cols} rows={rows} onRow={c => fx.open("campaign", c.id)} highlight={c => c.id === "cmp-mh-launch" && !approved} />
          {f === "all" && (
            <div className="fx-tr" style={{ gridTemplateColumns: cols.map(c => c.w).join(" "), background: "var(--surface-faint)" }}>
              <span className="fx-strong">Total</span><span /><span className="fx-num">{n(base.reduce((s, c) => s + c.audience, 0))}</span>
              <span className="fx-num">{n(sent)}</span><span /><span /><span className="fx-num">{n(conv)}</span>
              <span className="fx-num fx-strong">{eur(rev)}</span><span />
            </div>
          )}
        </div>
      </Card>
    </Page>
  );
}

function ContentTab({ fx }: { fx: Fx }) {
  const [type, setType] = useState<string>("all");
  const e = fx.event;
  const items = CONTENT.filter(c => inEvent(e, c.event));
  const rows = items.filter(c => type === "all" || c.type === type);
  const peakDone = !!fx.acted["remind-peak"];
  const cols: Col<Content>[] = [
    { k: "asset", label: "Asset", w: "minmax(0,2.1fr)", render: c => <Two a={c.asset} b={c.type} /> },
    { k: "event", label: "Event", w: "minmax(0,.85fr)", render: c => <EventTag id={c.event} /> },
    { k: "who", label: "Speaker / partner", w: "minmax(0,1.25fr)", render: c => c.who === "Campaign" ? <span className="fx-muted">Campaign</span> : <Row gap={7}><Avatar name={c.who} size={20} /><span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{c.who}</span></Row> },
    { k: "channel", label: "Channel", w: "minmax(0,1.1fr)" },
    { k: "date", label: "Publish", w: "64px" },
    { k: "tools", label: "Tools", w: "minmax(0,1.5fr)", render: c => <Tools tools={c.tools} /> },
    { k: "status", label: "Status", w: "minmax(0,1.15fr)", render: c => <Status s={contentStatus(c, fx)} /> },
  ];
  return (
    <Page>
      <PageHead title="Content" sub="The content bank: what is being made, where it goes and what is holding it up." fx={fx}
        right={<Row gap={6}><Badge tone="ghost">CapCut</Badge><Badge tone="ghost">Canva</Badge><Badge tone="ghost">Opus</Badge><Badge tone="ghost">Later</Badge></Row>} />

      <div style={grid("repeat(6,minmax(0,1fr))")}>
        {CONTENT_TYPES.map(([t, c]) => (
          <button key={t} onClick={() => setType(type === t ? "all" : t)} className="fx-kpi" data-click="1"
            style={{ textAlign: "left", font: "inherit", color: "inherit", cursor: "pointer", borderColor: type === t ? "var(--accent-line)" : undefined, background: type === t ? "var(--accent-faint)" : undefined }}>
            <div className="l">{t}</div>
            <div className="v" style={{ fontSize: 20 }}>{c}</div>
            <div className="s">scheduled</div>
          </button>
        ))}
      </div>

      <Card title="Next two weeks" sub="28 Sep to 11 Oct" right={<span style={{ fontSize: 11.5, color: "var(--faint)" }}>{GROWTH_KPIS.contentScheduled} scheduled in total</span>}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 6 }}>
          {DAYS.map(d => {
            const day = items.filter(c => c.date === d.key);
            return (
              <div key={d.key} style={{ minHeight: 92, padding: "7px 7px 8px", borderRadius: 12, border: "1px solid var(--border)", background: d.weekend ? "var(--surface-faint)" : "var(--surface-2)", minWidth: 0 }}>
                <Row gap={5} style={{ justifyContent: "space-between" }}>
                  <span style={{ fontSize: 10.5, color: "var(--faint)" }}>{d.wd}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{d.d}{d.d === 1 ? " Oct" : ""}</span>
                </Row>
                <div style={{ display: "grid", gap: 4, marginTop: 6 }}>
                  {day.map(c => {
                    const s = contentStatus(c, fx);
                    const tone = /block/i.test(s) ? "var(--bad)" : /await|needs|reminder|requested|edit/i.test(s) ? "var(--warn)" : tagColor(c.event);
                    return (
                      <button key={c.id} onClick={() => c.go?.(fx)} title={`${c.asset} · ${s}`}
                        style={{ display: "block", width: "100%", textAlign: "left", font: "inherit", fontSize: 10.5, lineHeight: 1.3, padding: "4px 6px", borderRadius: 6, cursor: "pointer",
                          border: 0, borderLeft: `2px solid ${tone}`, background: c.event === "both" ? "var(--track)" : evSoft(c.event), color: "var(--body)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                        {c.type.replace("Exhibitor ", "").replace("Main Stage", "Stage")}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div style={{ ...grid("minmax(0,1fr) minmax(0,1fr)"), marginTop: 14 }}>
        {inEvent(e, "mh") && (
          <Note tone={peakDone ? "warn" : "bad"}>
            <Row style={{ alignItems: "flex-start" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <b style={{ color: "var(--ink)" }}>Peak Health Labs spotlight {peakDone ? "· reminder sent" : "blocked"}</b>
                <div style={{ marginTop: 3 }}>{peakDone ? "Logo SVG and speaker headshot requested. Spotlight holds its 6 Oct slot in Later." : "Needs the logo SVG before Amy can finish it in Canva. Slot held for 6 Oct."}</div>
              </div>
              <ActBtn fx={fx} k="remind-peak" size="sm" kind="ghost" label="Send reminder" doneLabel="Reminder sent" toast="Asset reminder sent to Peak Health Labs (logo SVG + speaker headshot)" />
            </Row>
          </Note>
        )}
        {inEvent(e, "ff") && (
          <Note tone="warn">
            <Row style={{ alignItems: "flex-start" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <b style={{ color: "var(--ink)" }}>Nova Fertility Clinic · 2 posts in package</b>
                <div style={{ marginTop: 3 }}>Post 1 scheduled for 1 Oct. Post 2 (speaker reveal) is waiting on a clinic photo and an approved quote from Dr Aoife Brennan.</div>
              </div>
              <ActBtn fx={fx} k="growth-nova-assets" size="sm" kind="ghost" label="Request assets" doneLabel="Requested" toast="Asset request sent to Nova Fertility Clinic (clinic photo + approved quote)" />
            </Row>
          </Note>
        )}
      </div>

      <Card title="Content bank" sub={type === "all" ? `${rows.length} items shown` : `${type} · ${rows.length} shown`} pad={false}
        right={type !== "all" ? <Btn size="sm" kind="ghost" onClick={() => setType("all")}>Clear filter</Btn> : undefined}>
        <div style={{ marginTop: 12 }}>
          <Table cols={cols} rows={rows} onRow={c => c.go?.(fx)} highlight={c => /block/i.test(contentStatus(c, fx))} />
        </div>
      </Card>
    </Page>
  );
}

function Affiliates({ fx }: { fx: Fx }) {
  const e = fx.event;
  const rows = AFFILIATES.filter(a => inEvent(e, a.event));
  const tot = { clicks: rows.reduce((s, a) => s + a.clicks, 0), orders: rows.reduce((s, a) => s + a.orders, 0), revenue: rows.reduce((s, a) => s + a.revenue, 0), earned: rows.reduce((s, a) => s + a.earned, 0) };
  const pnc = AFFILIATES[0];
  const planned = !!fx.acted["growth-plan-oct"];
  const cols: Col<Affiliate>[] = [
    { k: "partner", label: "Partner", w: "minmax(0,1.6fr)", render: a => <Two a={a.partner} b={`${a.discount}% off for customers · ${a.commission}% to Antidote`} /> },
    { k: "campaign", label: "Campaign", w: "minmax(0,1.3fr)", render: a => <Two a={a.campaign} b={a.code} /> },
    { k: "event", label: "Audience", w: "minmax(0,.85fr)", render: a => <EventTag id={a.event} /> },
    { k: "clicks", label: "Clicks", w: "minmax(0,.6fr)", align: "right", render: a => n(a.clicks) },
    { k: "orders", label: "Conversions", w: "minmax(0,.8fr)", align: "right", render: a => <span>{n(a.orders)} <span className="fx-muted">· {((a.orders / a.clicks) * 100).toFixed(1)}%</span></span> },
    { k: "revenue", label: "Revenue generated", w: "minmax(0,.9fr)", align: "right", render: a => eur(a.revenue) },
    { k: "earned", label: "Commission", w: "minmax(0,.8fr)", align: "right", render: a => <span className="fx-strong" style={{ color: "var(--ok)" }}>{eur(a.earned, 2)}</span> },
  ];
  return (
    <Page>
      <PageHead title="Affiliates" sub="Earning from the database all year, not only in the run-up to March." fx={fx} />

      <div style={grid("minmax(0,1.5fr) minmax(0,1fr)")}>
        <Card title={pnc.partner} sub="Lead affiliate · since Jun 2026" right={<Btn size="sm" kind="ghost" icon={PATHS.arrow} onClick={() => fx.open("affiliate", pnc.id)}>Open</Btn>}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 14 }}>
            <Fig label="Customer discount" value={pnc.discount + "%"} sub={`Code ${pnc.code}`} />
            <Fig label="Antidote commission" value={pnc.commission + "%"} sub="On net order value" />
            <Fig label="Revenue generated" value={eur(pnc.revenue)} sub={`${n(pnc.orders)} orders`} />
            <Fig label="Commission" value={eur(pnc.earned, 2)} color="var(--ok)" sub={`${((pnc.earned / GROWTH_KPIS.affiliateRevenue) * 100).toFixed(0)}% of all affiliate`} />
          </div>
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
            <Funnel steps={[["Campaign sends", pnc.sends], ["Clicks", pnc.clicks], ["Orders", pnc.orders]]} />
          </div>
        </Card>
        <Card title="Commission by month" sub={eur(GROWTH_KPIS.affiliateRevenue) + " to date"}>
          <BarChart labels={COMMISSION_MONTHS.labels} series={[{ name: "Commission", color: "var(--ok)", values: COMMISSION_MONTHS.values }]} height={150} fmt={v => eur(v)} />
          <Row gap={0} style={{ justifyContent: "space-between", marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
            <Fig label="Paid out to us" value={eur(4261.6, 2)} />
            <Fig label="Due on 5 Oct statements" value={eur(4198.4, 2)} color="var(--warn)" />
          </Row>
        </Card>
      </div>

      <Card title="Affiliate partners" sub={`${rows.length} active`} pad={false} style={{ marginBottom: 14 }}>
        <div style={{ marginTop: 12 }}>
          <Table cols={cols} rows={rows} onRow={a => fx.open("affiliate", a.id)} highlight={a => a.id === "perf-nutrition"} />
          <div className="fx-tr" style={{ gridTemplateColumns: cols.map(c => c.w).join(" "), background: "var(--surface-faint)" }}>
            <span className="fx-strong">Total</span><span /><span />
            <span className="fx-num">{n(tot.clicks)}</span><span className="fx-num">{n(tot.orders)}</span>
            <span className="fx-num">{eur(tot.revenue)}</span><span className="fx-num fx-strong" style={{ color: "var(--ok)" }}>{eur(tot.earned, 2)}</span>
          </div>
        </div>
      </Card>

      <Card title="Year-round send plan" sub="Estimated commission at September conversion rates · max 2 partner sends per subscriber a month"
        right={<ActBtn fx={fx} k="growth-plan-oct" size="sm" label="Schedule October sends" doneLabel="October scheduled" toast="October partner sends scheduled in HubSpot: Performance Nutrition Co. and Restful Sleep Lab" />}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: 8 }}>
          {MONETISE.map((m, i) => (
            <div key={m.m} style={{ padding: "10px 11px", borderRadius: 12, border: "1px solid " + (i === 0 ? "var(--accent-line)" : "var(--border)"), background: i === 0 ? "var(--accent-faint)" : "var(--surface-2)", minWidth: 0 }}>
              <Row style={{ justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{m.m}</span>
                {i === 0 && <Badge tone={planned ? "ok" : "warn"}>{planned ? "Scheduled" : "Draft"}</Badge>}
              </Row>
              <div style={{ fontSize: 11.5, color: "var(--body)", lineHeight: 1.45, marginTop: 6, minHeight: 50 }}>{m.what}</div>
              <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 6 }}>{m.sends === "Event" ? "On site" : m.sends + " sends"}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ok)", marginTop: 2 }}>~{eur(m.est)}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 11.5, color: "var(--dim)" }}>Oct to Mar estimate: ~{eur(MONETISE.reduce((s, m) => s + m.est, 0))} on top of {eur(GROWTH_KPIS.affiliateRevenue)} earned so far.</div>
      </Card>
    </Page>
  );
}

function Partners({ fx }: { fx: Fx }) {
  const e = fx.event;
  const rows = PARTNERS.filter(p => inEvent(e, p.event));
  const maxV = Math.max(1, ...rows.map(p => p.eventValue + p.projected));
  const counts = { yr: rows.filter(p => stageOf(p) === "Year-round partner").length, gr: rows.filter(p => stageOf(p) === "Growing").length, ex: rows.filter(p => stageOf(p) === "Exhibitor").length };
  return (
    <Page>
      <PageHead title="Partners" sub="Moving brands from one stand in March to a year-round partnership." fx={fx} />

      <Card title="Exhibitor to year-round partner" sub="Each rung is a way a brand pays to reach the Antidote audience" pad={false} style={{ marginBottom: 14 }}
        right={<Row gap={10} style={{ fontSize: 11, color: "var(--dim)" }}>
          {(["done", "progress", "proposed", "blocked"] as Rung[]).map(r => <Row key={r} gap={5}><RungDot r={r} title={rungLabel[r]} />{rungLabel[r]}</Row>)}
        </Row>}>
        <div style={{ marginTop: 12 }}>
          <div className="fx-tr fx-th" style={{ gridTemplateColumns: "minmax(0,1.7fr) repeat(7,minmax(0,.62fr)) minmax(0,1fr)" }}>
            <span>Partner</span>
            {RUNGS.map((r, i) => <span key={r} style={{ textAlign: "center", whiteSpace: "normal", lineHeight: 1.2 }}>{i > 0 && <span style={{ color: "var(--faint)" }}>{i}. </span>}{r}</span>)}
            <span>Stage</span>
          </div>
          {rows.map(p => {
            const stage = stageOf(p);
            return (
              <div key={p.id} className="fx-tr" data-click="1" onClick={() => fx.open("partner", p.id)} style={{ gridTemplateColumns: "minmax(0,1.7fr) repeat(7,minmax(0,.62fr)) minmax(0,1fr)", minHeight: 54 }}>
                <Row gap={9}><Avatar name={p.name} size={26} /><Two a={p.name} b={<>{p.owner}</>} /></Row>
                {p.rungs.map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "center", position: "relative" }}>
                    {i > 0 && <span style={{ position: "absolute", left: "-50%", right: "50%", top: 12, height: 1, background: p.rungs[i - 1] === "done" && r === "done" ? "var(--ok)" : "var(--border)", zIndex: 0 }} />}
                    <span style={{ position: "relative", zIndex: 1 }}><RungDot r={r} title={`${RUNGS[i]}: ${rungLabel[r]}`} /></span>
                  </div>
                ))}
                <Badge tone={stage === "Year-round partner" ? "ok" : stage === "Growing" ? "warn" : "ghost"}>{stage}</Badge>
              </div>
            );
          })}
        </div>
      </Card>

      <div style={grid("minmax(0,1.2fr) minmax(0,1fr)", 0)}>
        <Card title="Next moves" sub={`${counts.yr} year-round · ${counts.gr} growing · ${counts.ex} exhibitor only`} pad={false}>
          <div style={{ marginTop: 10 }}>
            {rows.map(p => (
              <div key={p.id} className="fx-tr" style={{ gridTemplateColumns: "minmax(0,1.9fr) auto", minHeight: 56 }}>
                <div style={{ minWidth: 0, whiteSpace: "normal" }}>
                  <Row gap={6}><span className="fx-strong">{p.name}</span><EventTag id={p.event} /></Row>
                  <div style={{ fontSize: 12, color: "var(--dim)", marginTop: 3 }}>{p.next}</div>
                  {p.id === "p-nova" && !fx.acted["chase-nova"] && <div style={{ fontSize: 11.5, color: "var(--bad)", marginTop: 2 }}>Deposit {eur(NOVA.deposit)} · {NOVA.daysOverdue} days overdue</div>}
                  {p.id === "p-peak" && !fx.acted["remind-peak"] && <div style={{ fontSize: 11.5, color: "var(--bad)", marginTop: 2 }}>Spotlight blocked on logo SVG</div>}
                </div>
                <Row gap={6}>
                  {p.id === "p-nova" && !fx.acted["chase-nova"]
                    ? <Btn size="sm" kind="ghost" onClick={() => fx.open("invoice", "i-nova-1")}>View invoice</Btn>
                    : <ActBtn fx={fx} k={`growth-propose-${p.id}`} size="sm" kind="ghost" label="Send proposal" doneLabel="Proposal sent" toast={`Year-round proposal sent to ${p.name}`} />}
                  <Btn size="sm" kind="ghost" icon={PATHS.arrow} onClick={() => fx.open("partner", p.id)} title="Open partner" />
                </Row>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Event-only vs year-round value" sub="Contracted event value plus projected year-round (not invoiced)">
          {rows.map(p => (
            <div key={p.id} style={{ padding: "7px 0" }}>
              <Row style={{ justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 12.3, color: "var(--body)" }}>{p.name}</span>
                <span className="fx-num" style={{ fontSize: 12, color: "var(--ink)" }}>{eur(p.eventValue + p.projected)}</span>
              </Row>
              <div style={{ display: "flex", height: 8, borderRadius: 99, background: "var(--track)", overflow: "hidden" }}>
                <span style={{ width: `${(p.eventValue / maxV) * 100}%`, background: tagColor(p.event) }} />
                <span style={{ width: `${(p.projected / maxV) * 100}%`, background: "var(--ok)", opacity: .75 }} />
              </div>
            </div>
          ))}
          <Row gap={14} style={{ marginTop: 10, fontSize: 11.5, color: "var(--dim)" }}>
            <Row gap={6}><span style={{ width: 10, height: 6, borderRadius: 3, background: "var(--dim)" }} />Event contract (event colour)</Row>
            <Row gap={6}><span style={{ width: 10, height: 6, borderRadius: 3, background: "var(--ok)" }} />Projected year-round</Row>
          </Row>
        </Card>
      </div>
    </Page>
  );
}

/* ── Module ────────────────────────────────────────────────────────────── */

const CA_COPY: Record<string, [string, string, string]> = {
  overview: ["Growth", "Canada Pilot growth setup.", "No Canada campaigns, content or affiliates yet. The growth setup is cloned from Dublin and waits on localisation."],
  audience: ["Audience", "Canada Pilot audience.", "312 known contacts already have a Canadian address, mostly Future Fertility On Demand buyers. Nothing imported until the venue is set."],
  campaigns: ["Campaigns", "Canada Pilot campaigns.", "14 email sequences are cloned from Dublin and paused until currency and ticket tax are set."],
  content: ["Content", "Canada Pilot content.", "Speaker Clip, Ticket Campaign and Exhibitor Spotlight templates are cloned in Canva. No publish dates until the venue is confirmed."],
  affiliates: ["Affiliates", "Canada Pilot affiliates.", "Affiliate terms need local review. Performance Nutrition Co. does not ship to Canada yet."],
  partners: ["Partners", "Canada Pilot partners.", "No Canadian partners yet. Local exhibitor terms are under review before any partner offer goes out."],
};

export default function Growth({ fx }: ModuleProps) {
  if (fx.event === "ca") {
    const [t, s, l] = CA_COPY[fx.tab] || CA_COPY.overview;
    return <CanadaPlan fx={fx} title={t} sub={s} line={l} />;
  }
  switch (fx.tab) {
    case "audience": return <Audience fx={fx} />;
    case "campaigns": return <Campaigns fx={fx} />;
    case "content": return <ContentTab fx={fx} />;
    case "affiliates": return <Affiliates fx={fx} />;
    case "partners": return <Partners fx={fx} />;
    default: return <Overview fx={fx} />;
  }
}

/* ── Drawers ───────────────────────────────────────────────────────────── */

function CampaignDrawer({ fx, id }: DrawerProps) {
  const c = CAMPAIGNS.find(x => x.id === id) || CAMPAIGNS[0];
  const status = campStatus(c, fx);
  const isLaunch = c.id === "cmp-mh-launch";
  const opened = Math.round((c.sent * c.open) / 100), clicked = Math.round((c.sent * c.click) / 100);
  const ev = evOf(c.event);
  return (
    <Drawer fx={fx} eyebrow={`CAMPAIGN · ${c.kind.toUpperCase()}`} title={c.name}
      badges={<><EventTag id={c.event} /><Status s={status} /><Badge tone="ghost">{c.channel}</Badge></>}
      actions={isLaunch
        ? <><Btn kind="ghost" onClick={() => fx.goTo("Growth", "audience")}>View segments</Btn>
            <ActBtn fx={fx} k={APPROVE_MH} label="Approve launch" doneLabel="Approved · sends Tue 29 Sep 10:00" toast="Future Men's Health launch approved · sends Tue 29 Sep 10:00" /></>
        : <><Btn kind="ghost" onClick={() => fx.goTo("Growth", "audience")}>View segments</Btn>
            <ActBtn fx={fx} k={`growth-report-${c.id}`} label="Send report to Nikki" doneLabel="Report sent" toast={`${c.name} report sent to Nikki`} /></>}>
      {id !== c.id && <div style={{ marginBottom: 12 }}><Note>Campaign {id} was not found. Showing {c.name}.</Note></div>}
      {isLaunch && (
        <div style={{ marginBottom: 18 }}>
          <Note tone={fx.acted[APPROVE_MH] ? "accent" : "warn"}>
            {fx.acted[APPROVE_MH]
              ? "Approved by Nikki Dwyer. HubSpot sends Tue 29 Sep at 10:00; the Later social push follows at 12:00."
              : "Waiting on Nikki's approval. Requested by Amy Byrne on 26 Sep. Nothing sends until it is approved."}
          </Note>
        </div>
      )}
      <Sec title="FUNNEL">
        {c.sent
          ? <Funnel steps={[["Audience", c.audience], ["Sent", c.sent], ["Opened", opened], ["Clicked", clicked], [c.unit, c.result]]} />
          : <Funnel steps={[["Audience", c.audience], ["After suppression", 8512], ["Expected opens", 4000], ["Expected clicks", 1020], ["Expected tickets", 150]]} />}
      </Sec>
      <Sec title="RESULT">
        <KV cols={3} items={[
          ["Revenue", c.revenue ? eur(c.revenue) : "Not sent yet"],
          [c.unit, c.result ? n(c.result) : "·"],
          ["Price", c.price],
          ["Open rate", c.sent ? c.open + "%" : "·"],
          ["Click rate", c.sent ? c.click + "%" : "·"],
          ["Revenue per send", c.sent ? eur(c.revenue / c.sent, 2) : "·"],
        ]} />
      </Sec>
      <Sec title="SEND DETAILS">
        <KV items={[
          ["Subject", c.subject], [isLaunch ? "Scheduled" : "Sent", c.date],
          ["Owner", <Row gap={7}><Avatar name={c.owner} size={18} />{c.owner}</Row>], ["Approval", isLaunch ? (fx.acted[APPROVE_MH] ? "Approved · Nikki Dwyer" : "Awaiting Nikki Dwyer") : "Approved · Nikki Dwyer"],
          ["Channel", c.channel], ["Event", ev ? EVENTS[ev].label : "Both Dublin events"],
        ]} />
      </Sec>
      <Sec title="SEGMENTS">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{c.segments.map(s => <Badge key={s} tone="ghost">{s}</Badge>)}</div>
        <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 8 }}>Suppressed: existing 2027 ticket buyers for this event, unsubscribed and bounced contacts.</div>
      </Sec>
      {c.id === "cmp-clar-partner" && (
        <Sec title="CONNECTED">
          <Flow nodes={[
            { t: "PARTNER", h: "Clarity Hormone Clinic", d: "Year-round plan", go: () => fx.open("partner", "p-clar") },
            { t: "DEAL", h: "€13,400 · Won", d: "Workshop sponsorship", go: () => fx.open("deal", "d-clar") },
          ]} />
        </Sec>
      )}
      {c.id === "cmp-couples" && (
        <Sec title="WHY THIS SEGMENT">
          <Note>{n(AUDIENCE.both)} people attended both events. 1,240 Men's Health attendees told us fertility is relevant to their household, so the pass is pitched to couples.</Note>
        </Sec>
      )}
    </Drawer>
  );
}

function AffiliateDrawer({ fx, id }: DrawerProps) {
  const a = AFFILIATES.find(x => x.id === id) || AFFILIATES[0];
  const aov = a.revenue / a.orders;
  const schedule: [string, string, number, string][] = a.paid > 0
    ? [["Jul to Aug statement", "5 Sep", a.paid, "Paid"], ["Sep statement", "5 Oct", a.pending, "Due"], ["Oct statement", "5 Nov", 0, "Accruing"]]
    : [["Sep statement (first)", "5 Oct", a.pending, "Due"], ["Oct statement", "5 Nov", 0, "Accruing"]];
  return (
    <Drawer fx={fx} eyebrow="AFFILIATE PARTNER" title={a.partner}
      badges={<><EventTag id={a.event} /><Badge tone="ok">Active</Badge><Badge tone="ghost">Code {a.code}</Badge></>}
      actions={<>
        {a.partnerId && <Btn kind="ghost" onClick={() => fx.open("partner", a.partnerId as string)}>Year-round plan</Btn>}
        <ActBtn fx={fx} k={`growth-statement-${a.id}`} label="Send commission statement" doneLabel="Statement sent" toast={`Commission statement sent to ${a.partner}`} />
      </>}>
      {id !== a.id && <div style={{ marginBottom: 12 }}><Note>Affiliate {id} was not found. Showing {a.partner}.</Note></div>}
      <Sec title="TERMS">
        <KV cols={3} items={[
          ["Customer discount", a.discount + "%"], ["Antidote commission", a.commission + "%"], ["Cookie window", "30 days"],
          ["Tracking", "Code + UTM link"], ["Since", a.since], ["Contact", a.contact],
        ]} />
      </Sec>
      <Sec title="PERFORMANCE">
        <Funnel steps={[["Campaign sends", a.sends], ["Clicks", a.clicks], ["Orders", a.orders]]} />
        <div style={{ marginTop: 10 }}>
          <KV cols={3} items={[
            ["Revenue generated", eur(a.revenue)], ["Commission earned", <span style={{ color: "var(--ok)" }}>{eur(a.earned, 2)}</span>], ["Avg order", eur(aov, 2)],
          ]} />
        </div>
      </Sec>
      <Sec title="CAMPAIGN">
        <Note><b style={{ color: "var(--ink)" }}>{a.campaign}</b> · {n(a.sends)} sends to {a.event === "both" ? "both newsletters" : EVENTS[a.event as EventId].name + " subscribers"}. {a.discount}% off with {a.code}; Antidote earns {a.commission}% of each order.</Note>
      </Sec>
      <Sec title="PAYOUT SCHEDULE" right={<span style={{ fontWeight: 400, letterSpacing: 0 }}>Monthly, 5th · partner pays Antidote</span>}>
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          {schedule.map(([p, d, v, s], i) => (
            <div key={p} className="fx-tr" style={{ gridTemplateColumns: "minmax(0,1.5fr) 70px 100px 90px", borderTop: i ? undefined : 0 }}>
              <span className="fx-strong">{p}</span><span className="fx-muted">{d}</span>
              <span className="fx-num">{v ? eur(v, 2) : "·"}</span>
              <span style={{ textAlign: "right" }}><Status s={s === "Due" ? "Scheduled" : s} /></span>
            </div>
          ))}
        </div>
      </Sec>
      {a.id === "perf-nutrition" && (
        <Sec title="NEXT">
          <Note tone="accent">October follow-up to 8,400 subscribers, estimated €1,100 commission. Performance Nutrition Co. buyers are included in the Men's Health launch segment.</Note>
        </Sec>
      )}
    </Drawer>
  );
}

function PartnerDrawer({ fx, id }: DrawerProps) {
  const p = PARTNERS.find(x => x.id === id) || PARTNERS[0];
  const stage = stageOf(p);
  return (
    <Drawer fx={fx} eyebrow="YEAR-ROUND PARTNER RECORD" title={p.name} width={660}
      badges={<><EventTag id={p.event} /><Badge tone={stage === "Year-round partner" ? "ok" : stage === "Growing" ? "warn" : "ghost"}>{stage}</Badge><Badge tone="ghost">Owner {p.owner}</Badge></>}
      actions={<>
        {p.affiliate && <Btn kind="ghost" onClick={() => fx.open("affiliate", p.affiliate as string)}>Affiliate terms</Btn>}
        <ActBtn fx={fx} k={`growth-propose-${p.id}`} label="Send year-round proposal" doneLabel="Proposal sent" toast={`Year-round proposal sent to ${p.name}`} />
      </>}>
      {id !== p.id && <div style={{ marginBottom: 12 }}><Note>Partner {id} was not found. Showing {p.name}.</Note></div>}
      {p.note && <div style={{ marginBottom: 18 }}><Note tone="warn">{p.note}</Note></div>}
      <Sec title="LADDER">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 6 }}>
          {RUNGS.map((r, i) => (
            <div key={r} style={{ padding: "9px 6px", borderRadius: 10, border: "1px solid var(--border)", background: p.rungs[i] === "done" ? "var(--ok-soft)" : "var(--surface)", textAlign: "center", minWidth: 0 }}>
              <RungDot r={p.rungs[i]} title={rungLabel[p.rungs[i]]} />
              <div style={{ fontSize: 10.5, color: "var(--ink)", marginTop: 5, lineHeight: 1.2 }}>{r}</div>
              <div style={{ fontSize: 10, color: "var(--faint)", marginTop: 2 }}>{rungLabel[p.rungs[i]]}</div>
            </div>
          ))}
        </div>
      </Sec>
      <Sec title="VALUE">
        <KV cols={3} items={[
          ["2027 event contract", p.eventValue ? eur(p.eventValue) : "Not contracted"],
          ["Year-round so far", p.yearRound ? eur(p.yearRound, 2) : "·"],
          ["Projected next 12 months", eur(p.projected)],
        ]} />
        <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 6 }}>Projection is a planning estimate from the plan below, not an invoice.</div>
      </Sec>
      <Sec title="YEAR-ROUND PLAN">
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          {p.plan.map(([q, what, s], i) => (
            <div key={q} className="fx-tr" style={{ gridTemplateColumns: "72px minmax(0,1fr) 96px", borderTop: i ? undefined : 0, minHeight: 52 }}>
              <span className="fx-strong">{q}</span>
              <span style={{ whiteSpace: "normal", lineHeight: 1.45, padding: "8px 0" }}>{what}</span>
              <span style={{ textAlign: "right" }}><Badge tone={toneFor(s)}>{s}</Badge></span>
            </div>
          ))}
        </div>
      </Sec>
      <Sec title="CONNECTED RECORDS">
        <Flow nodes={p.links(fx)} />
      </Sec>
      <Sec title="NEXT MOVE">
        <Note tone="accent">{p.next}.</Note>
      </Sec>
    </Drawer>
  );
}
function toneFor(s: string): Tone {
  if (/live|confirmed/i.test(s)) return "ok";
  if (/blocked/i.test(s)) return "bad";
  if (/progress|proposed/i.test(s)) return "warn";
  return "ghost";
}

export const drawers: Record<string, (p: DrawerProps) => JSX.Element> = {
  campaign: CampaignDrawer,
  affiliate: AffiliateDrawer,
  partner: PartnerDrawer,
};
