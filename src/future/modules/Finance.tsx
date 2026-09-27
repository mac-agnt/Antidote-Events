/* Finance: the control layer between HubSpot, Xero and the bank feed.
   One signed deal becomes a deposit and a balance invoice automatically, posted to Xero,
   chased on a fixed sequence and matched back when the money lands.

   Reconciliation (from data.ts):
     Contracted 418,000 = Collected 173,400 + Open invoices 91,600 + Not yet invoiced 153,000
     Open 91,600 (ff 55,300 · mh 36,300) includes Overdue 23,800 (ff 15,200 · mh 8,600)
     Due next 30 days 74,200 = open invoices falling due 67,800 + scheduled invoices 6,400
   Cash collected is bank-based: it already includes the €3,750 Peak Health Labs deposit
   that landed on 26 Sep, so approving the Xero match (`match-peak`) changes the invoice
   status, not the headline numbers. */
import { useState, type CSSProperties, type ReactNode } from "react";
import type { ModuleProps, DrawerProps, Fx } from "../types";
import {
  INVOICES, DEBTORS, RECON, KPIS, CASH_CURVE, FINANCE_FORECAST, DEALS, CONTRACTS, EXHIBITORS, TEAM, CANADA, NOVA, PEAK, EVENTS,
  eur, eurK, type Invoice, type EventId,
} from "../data";
import {
  Page, PageHead, Card, Kpis, Badge, EventTag, Btn, ActBtn, Avatar, Bar, StepDot, Table, Chips, Drawer, Sec, KV, Note, Flow,
  LineChart, BarChart, Donut, Legend, Fig, Row, Icon, PATHS, inEvent, evColor, type Col, type Tone,
} from "../ui";

/* ── Dates ─────────────────────────────────────────────────────────────── */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const parseD = (s: string) => { const [d, m, y] = s.split(" "); return new Date(Number(y || 2026), MONTHS.indexOf(m), Number(d)); };
const shortD = (s: string) => s.replace(/ 2026$/, "");
const WINDOW_START = new Date(2026, 7, 28); // last 30 days up to Sun 27 Sep 2026

/* ── Local ledger: siblings and the rest of the open book ──────────────────
   Open + overdue invoices below are the complete open ledger (sums to €91,600).
   Paid and scheduled invoices are the recent ones only. */
const LOCAL_INV: Invoice[] = [
  { id: "i-bright-2", no: "FE-2027-0356", client: "Bright Path Fertility", event: "ff", kind: "Balance", amount: 10220, due: "1 Feb 2027", status: "Scheduled", deal: 14600, owner: "Kathleen Corr" },
  { id: "i-oak-2", no: "FE-2027-0342", client: "Oakline Nutrition", event: "mh", kind: "Balance", amount: 7350, due: "1 Feb 2027", status: "Scheduled", deal: 10500, owner: "Daniel Murray" },
  { id: "i-ever-2", no: "FE-2027-0368", client: "Evergreen Women's Clinic", event: "ff", kind: "Balance", amount: 12646, due: "1 Feb 2027", status: "Scheduled", deal: 18066, owner: "Daniel Murray" },
  { id: "i-summ-2", no: "FE-2027-0373", client: "Summit Men's Clinic", event: "mh", kind: "Balance", amount: 12716, due: "1 Feb 2027", status: "Scheduled", deal: 18166, owner: "Daniel Murray" },
  { id: "i-clar-1", no: "FE-2027-0297", client: "Clarity Hormone Clinic", event: "ff", kind: "Deposit", amount: 4020, due: "28 Aug 2026", status: "Paid", deal: 13400, owner: "Kathleen Corr" },
  { id: "i-ferro-2", no: "FE-2027-0378", client: "Ferro Sports Recovery", event: "mh", kind: "Balance", amount: 5040, due: "1 Feb 2027", status: "Scheduled", deal: 7200, owner: "Daniel Murray" },
  { id: "i-vel-2", no: "FE-2027-0403", client: "Velocity Fitness Studios", event: "mh", kind: "Balance", amount: 4830, due: "1 Feb 2027", status: "Scheduled", deal: 6900, owner: "Daniel Murray" },
  { id: "i-vireo-1", no: "FE-2027-0384", client: "Vireo Diagnostics", event: "mh", kind: "Deposit", amount: 2640, due: "22 Sep 2026", status: "Paid", deal: 8800, owner: "Daniel Murray" },
  { id: "i-vireo-2", no: "FE-2027-0385", client: "Vireo Diagnostics", event: "mh", kind: "Balance", amount: 6160, due: "1 Feb 2027", status: "Scheduled", deal: 8800, owner: "Daniel Murray" },
  { id: "i-emb-1", no: "FE-2027-0391", client: "Emberly Wellness", event: "ff", kind: "Deposit", amount: 1980, due: "24 Sep 2026", status: "Paid", deal: 6600, owner: "Kathleen Corr" },
  { id: "i-emb-2", no: "FE-2027-0392", client: "Emberly Wellness", event: "ff", kind: "Balance", amount: 4620, due: "1 Feb 2027", status: "Scheduled", deal: 6600, owner: "Kathleen Corr" },
  { id: "i-maple-1", no: "FE-2027-0380", client: "Maple Fertility Coaching", event: "ff", kind: "Full", amount: 4200, due: "22 Sep 2026", status: "Paid", deal: 4200, owner: "Kathleen Corr" },
  { id: "i-harlow-1", no: "FE-2027-0369", client: "Harlow Posture Co.", event: "mh", kind: "Full", amount: 3900, due: "18 Sep 2026", status: "Paid", deal: 3900, owner: "Daniel Murray" },
  { id: "i-rowan-1", no: "FE-2027-0262", client: "Rowan Fertility Partners", event: "ff", kind: "Deposit", amount: 6300, due: "31 Jul 2026", status: "Paid", deal: 21000, owner: "Kathleen Corr" },
  { id: "i-rowan-2", no: "FE-2027-0263", client: "Rowan Fertility Partners", event: "ff", kind: "Balance", amount: 14700, due: "15 Oct 2026", status: "Open", deal: 21000, owner: "Kathleen Corr" },
  { id: "i-kest-1", no: "FE-2027-0301", client: "Kestrel Genomics", event: "ff", kind: "Deposit", amount: 4680, due: "19 Aug 2026", status: "Paid", deal: 15600, owner: "Kathleen Corr" },
  { id: "i-kest-2", no: "FE-2027-0302", client: "Kestrel Genomics", event: "ff", kind: "Balance", amount: 10920, due: "15 Oct 2026", status: "Open", deal: 15600, owner: "Kathleen Corr" },
  { id: "i-iron-1", no: "FE-2027-0271", client: "Ironwood Performance Clinic", event: "mh", kind: "Deposit", amount: 6000, due: "6 Aug 2026", status: "Paid", deal: 20000, owner: "Daniel Murray" },
  { id: "i-iron-2", no: "FE-2027-0272", client: "Ironwood Performance Clinic", event: "mh", kind: "Balance", amount: 14000, due: "15 Oct 2026", status: "Open", deal: 20000, owner: "Daniel Murray" },
  { id: "i-gran-1", no: "FE-2027-0310", client: "Granite Men's Health", event: "mh", kind: "Deposit", amount: 4200, due: "26 Aug 2026", status: "Paid", deal: 14000, owner: "Daniel Murray" },
  { id: "i-gran-2", no: "FE-2027-0311", client: "Granite Men's Health", event: "mh", kind: "Balance", amount: 9800, due: "15 Oct 2026", status: "Open", deal: 14000, owner: "Daniel Murray" },
  { id: "i-hazel-1", no: "FE-2027-0414", client: "Hazel Fertility Nutrition", event: "ff", kind: "Full", amount: 4200, due: "2 Oct 2026", status: "Open", deal: 4200, owner: "Kathleen Corr" },
  { id: "i-aster-1", no: "FE-2027-0415", client: "Aster IVF Clinic", event: "ff", kind: "Full", amount: 900, due: "9 Oct 2026", status: "Open", deal: 900, owner: "Kathleen Corr" },
  { id: "i-keel-1", no: "FE-2027-0411", client: "Keel Sleep Labs", event: "mh", kind: "Full", amount: 3900, due: "1 Oct 2026", status: "Open", deal: 3900, owner: "Daniel Murray" },
  { id: "i-hollis-1", no: "FE-2027-0416", client: "Hollis Fertility Pharmacy", event: "ff", kind: "Full", amount: 4000, due: "15 Oct 2026", status: "Scheduled", deal: 4000, owner: "Kathleen Corr" },
  { id: "i-brook-1", no: "FE-2027-0417", client: "Brookfield Sports Nutrition", event: "mh", kind: "Full", amount: 2400, due: "15 Oct 2026", status: "Scheduled", deal: 2400, owner: "Daniel Murray" },
];
const ALL_INV: Invoice[] = [...INVOICES, ...LOCAL_INV];

const META: Record<string, { signed: string; pkg: string }> = {
  "Nova Fertility Clinic": { signed: "16 Sep 2026", pkg: "Premium stand + Main Stage slot" },
  "Peak Health Labs": { signed: "5 Sep 2026", pkg: "4m x 2m stand + speaker" },
  "Bright Path Fertility": { signed: "5 Sep 2026", pkg: "Premium stand" },
  "Oakline Nutrition": { signed: "1 Sep 2026", pkg: "Standard stand + activation" },
  "Evergreen Women's Clinic": { signed: "11 Sep 2026", pkg: "Premium stand + workshop" },
  "Summit Men's Clinic": { signed: "13 Sep 2026", pkg: "Premium stand + speaker" },
  "Clarity Hormone Clinic": { signed: "21 Aug 2026", pkg: "Workshop sponsorship" },
  "Ferro Sports Recovery": { signed: "3 Sep 2026", pkg: "Standard stand + activation" },
  "Velocity Fitness Studios": { signed: "14 Sep 2026", pkg: "Standard stand + social" },
  "Seed & Stem Supplements": { signed: "11 Sep 2026", pkg: "Standard stand" },
  "Vireo Diagnostics": { signed: "8 Sep 2026", pkg: "Premium stand" },
  "Emberly Wellness": { signed: "10 Sep 2026", pkg: "Standard stand + social" },
  "Maple Fertility Coaching": { signed: "15 Sep 2026", pkg: "Standard stand" },
  "Harlow Posture Co.": { signed: "11 Sep 2026", pkg: "Standard stand" },
  "Rowan Fertility Partners": { signed: "24 Jul 2026", pkg: "Stage sponsorship" },
  "Kestrel Genomics": { signed: "12 Aug 2026", pkg: "Premium stand + workshop" },
  "Ironwood Performance Clinic": { signed: "30 Jul 2026", pkg: "Premium stand + Main Stage slot" },
  "Granite Men's Health": { signed: "19 Aug 2026", pkg: "Premium stand + speaker" },
  "Hazel Fertility Nutrition": { signed: "25 Sep 2026", pkg: "Standard stand" },
  "Aster IVF Clinic": { signed: "25 Sep 2026", pkg: "Newsletter placement" },
  "Keel Sleep Labs": { signed: "24 Sep 2026", pkg: "Standard stand" },
  "Hollis Fertility Pharmacy": { signed: "23 Sep 2026", pkg: "Brand activation" },
  "Brookfield Sports Nutrition": { signed: "23 Sep 2026", pkg: "Performance Lab demo slot" },
};

type Group = { client: string; event: EventId; deal: number; owner: string; signed: string; pkg: string; terms: string; invoices: Invoice[] };
const KIND_ORDER = { Deposit: 0, Balance: 1, Full: 0 } as const;
const GROUPS: Group[] = (() => {
  const map = new Map<string, Invoice[]>();
  ALL_INV.forEach(i => map.set(i.client, [...(map.get(i.client) || []), i]));
  const list: Group[] = [...map.entries()].map(([client, invs]) => {
    const sorted = [...invs].sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind]);
    const f = sorted[0];
    const bal = sorted.find(i => i.kind === "Balance");
    const terms = f.kind === "Full" ? "Invoiced in full (under €6,000)"
      : bal && bal.due === "15 Oct 2026" ? "Early-bird: 30% on signing · 70% by 15 Oct" : "30% on signing · 70% by 1 Feb 2027";
    const m = META[client] || { signed: "", pkg: "Exhibitor package" };
    return { client, event: f.event, deal: f.deal, owner: f.owner, signed: m.signed, pkg: m.pkg, terms, invoices: sorted };
  });
  const rank = (g: Group) => g.client === "Nova Fertility Clinic" ? -2 : g.client === "Peak Health Labs" ? -1
    : g.invoices.some(i => i.status === "Overdue") ? 0 : g.invoices.some(i => i.status === "Open") ? 1 : g.invoices.some(i => i.status === "Scheduled") ? 2 : 3;
  return list.sort((a, b) => rank(a) - rank(b) || (Math.max(...b.invoices.map(i => i.days || 0)) - Math.max(...a.invoices.map(i => i.days || 0))) || b.deal - a.deal);
})();

const findInv = (id: string) => ALL_INV.find(i => i.id === id);
const groupOf = (client: string) => GROUPS.find(g => g.client === client);
const dealIdOf = (client: string) => DEALS.find(d => d.company === client && d.stage === "Won")?.id;
const contractIdOf = (client: string) => CONTRACTS.find(c => c.client === client)?.id;
const exhibitorIdOf = (client: string) => EXHIBITORS.find(x => x.company === client)?.id;
const ownerBg = (n: string) => TEAM.find(t => t.name === n)?.bg;
const firstName = (n: string) => n.split(" ")[0];

/* ── Status ────────────────────────────────────────────────────────────── */
type IStatus = Invoice["status"];
const effStatus = (i: Invoice, fx: Fx): IStatus => i.id === "i-peak-1" ? (fx.acted["match-peak"] ? "Paid" : "Match pending") : i.status;
const statusLabel = (i: Invoice, fx: Fx) => {
  const s = effStatus(i, fx);
  if (i.id === "i-peak-1") return s === "Paid" ? "Paid · reconciled" : "Received · match pending";
  return s;
};
const statusTone = (s: IStatus): Tone => s === "Overdue" ? "bad" : s === "Paid" ? "ok" : s === "Match pending" ? "warn" : s === "Open" ? "info" : "ghost";
function IBadge({ inv, fx }: { inv: Invoice; fx: Fx }) {
  return <Badge tone={statusTone(effStatus(inv, fx))}>{statusLabel(inv, fx)}</Badge>;
}

/* ── Payments ──────────────────────────────────────────────────────────── */
type Pay = { id: string; date: string; payer: string; amount: number; method: string; ref: string; inv?: string; source: "Xero bank feed" | "Stripe"; event: EventId | null; match: string; state: "Matched" | "Match pending" | "Unmatched" };
const PAYMENTS: Pay[] = [
  { id: "p-peak", date: "26 Sep", payer: "Peak Health Labs", amount: 3750, method: "SEPA transfer", ref: PEAK.paymentRef, inv: "i-peak-1", source: "Xero bank feed", event: "mh", match: "Suggested · 96%", state: "Match pending" },
  { id: "p-expo", date: "26 Sep", payer: "Unknown payer", amount: 1200, method: "SEPA transfer", ref: "FUTURE EXPO", source: "Xero bank feed", event: null, match: "No invoice · 41%", state: "Unmatched" },
  { id: "p-ferro", date: "26 Sep", payer: "Ferro Sports Recovery", amount: 2160, method: "SEPA transfer", ref: "FE-2027-0377", inv: "i-ferro-1", source: "Xero bank feed", event: "mh", match: "Auto · 100%", state: "Matched" },
  { id: "p-vel", date: "26 Sep", payer: "Velocity Fitness Studios", amount: 2070, method: "Card", ref: "pi_3Q8xV2", inv: "i-vel-1", source: "Stripe", event: "mh", match: "Auto · 100%", state: "Matched" },
  { id: "p-seed", date: "25 Sep", payer: "Seed & Stem Supplements", amount: 5600, method: "SEPA transfer", ref: "SEEDSTEM 0395", inv: "i-seed-1", source: "Xero bank feed", event: "ff", match: "Auto · 99%", state: "Matched" },
  { id: "p-clar", date: "25 Sep", payer: "Clarity Hormone Clinic", amount: 4020, method: "SEPA transfer", ref: "CLARITY FE0297", inv: "i-clar-1", source: "Xero bank feed", event: "ff", match: "Auto · 100%", state: "Matched" },
  { id: "p-vireo", date: "25 Sep", payer: "Vireo Diagnostics", amount: 2640, method: "Card", ref: "pi_3Q7wK9", inv: "i-vireo-1", source: "Stripe", event: "mh", match: "Auto · 98%", state: "Matched" },
  { id: "p-emb", date: "25 Sep", payer: "Emberly Wellness", amount: 1980, method: "Card", ref: "pi_3Q7wM4", inv: "i-emb-1", source: "Stripe", event: "ff", match: "Auto · 97%", state: "Matched" },
  { id: "p-maple", date: "22 Sep", payer: "Maple Fertility Coaching", amount: 4200, method: "SEPA transfer", ref: "MAPLE FC 0380", inv: "i-maple-1", source: "Xero bank feed", event: "ff", match: "Auto · 99%", state: "Matched" },
  { id: "p-harlow", date: "18 Sep", payer: "Harlow Posture Co.", amount: 3900, method: "Card", ref: "pi_3Q2tT1", inv: "i-harlow-1", source: "Stripe", event: "mh", match: "Auto · 100%", state: "Matched" },
];
const payForInv = (id: string) => PAYMENTS.find(p => p.inv === id);
const OLD_PAID: Record<string, string> = {
  "i-rowan-1": "29 Jul · SEPA transfer · auto-matched", "i-iron-1": "5 Aug · SEPA transfer · auto-matched",
  "i-kest-1": "18 Aug · Card via Stripe · auto-matched", "i-gran-1": "25 Aug · SEPA transfer · auto-matched",
};

/* Weekly receipts, €k. The last week ties to the feed above. */
const WEEKS = ["3 Aug", "10 Aug", "17 Aug", "24 Aug", "31 Aug", "7 Sep", "14 Sep", "21 Sep"];
const RECEIPTS = {
  bank: { ff: [5.6, 7.9, 3.4, 11.2, 8.3, 12.9, 6.8, 13.8], mh: [3.8, 4.9, 2.8, 7.4, 5.8, 8.4, 4.9, 5.9], un: [0, 0, 0, 0, 0, 0, 0, 1.2] },
  stripe: { ff: [0.7, 1.5, 0.5, 1.9, 1.3, 2.8, 1.4, 2.0], mh: [0.5, 0.9, 0.3, 1.2, 0.9, 1.8, 3.9, 4.7] },
  shopify: { ff: [1.3, 1.7, 2.0, 1.5, 2.9, 3.7, 3.0, 4.4], mh: [0.8, 1.1, 1.4, 1.1, 2.0, 2.5, 2.1, 3.0] },
};
const SHOPIFY_PAYOUTS = [
  { date: "25 Sep", orders: 214, ff: 4.4, mh: 3.0 },
  { date: "18 Sep", orders: 151, ff: 3.0, mh: 2.1 },
  { date: "11 Sep", orders: 187, ff: 3.7, mh: 2.5 },
];

/* ── Debtors: chase sequence ───────────────────────────────────────────── */
type SeqState = "done" | "next" | "todo";
const SEQ = [
  { t: "Day 1", h: "Email reminder", who: "Pulse, automatic", icon: PATHS.mail },
  { t: "Day 3", h: "Second email", who: "Pulse, automatic", icon: PATHS.mail },
  { t: "Day 7", h: "Owner call + reminder #3", who: "Account owner", icon: PATHS.users },
  { t: "Day 14", h: "Escalate to Nikki", who: "Nikki Dwyer", icon: PATHS.alert },
];
const DEBT_SEQ: Record<string, { s: SeqState; d: string }[]> = {
  "i-nova-1": [{ s: "done", d: "23 Sep · auto #1" }, { s: "done", d: "25 Sep · auto #2" }, { s: "next", d: "Mon 28 Sep" }, { s: "todo", d: "7 Oct" }],
  "i-mh-3": [{ s: "done", d: "21 Sep · auto #1" }, { s: "done", d: "25 Sep · auto #2" }, { s: "next", d: "Wed 30 Sep" }, { s: "todo", d: "4 Oct" }],
  "i-ff-3": [{ s: "done", d: "19 Sep · auto #1" }, { s: "done", d: "24 Sep · auto #2" }, { s: "next", d: "Tue 29 Sep" }, { s: "todo", d: "2 Oct" }],
  "i-harb-1": [{ s: "done", d: "13 Sep · auto #1" }, { s: "done", d: "15 Sep · auto #2" }, { s: "done", d: "22 Sep · auto #3 + call" }, { s: "next", d: "Mon 28 Sep" }],
  "i-atlas-1": [{ s: "done", d: "9 Sep · auto #1" }, { s: "done", d: "11 Sep · auto #2" }, { s: "next", d: "Today · Daniel" }, { s: "done", d: "22 Sep · Nikki aware" }],
};
const DEBT_ACT: Record<string, { k: string; label: string; done: string; toast: string; step: number }> = {
  "i-nova-1": { k: "chase-nova", label: "Send reminder #3", done: "Chased", step: 2, toast: "Reminder #3 sent to Nova Fertility Clinic · call booked for Kathleen, Mon 28 Sep" },
  "i-mh-3": { k: "finance-remind-summit", label: "Send #3 now", done: "Sent", step: 2, toast: "Reminder #3 sent to Summit Men's Clinic · Daniel copied" },
  "i-ff-3": { k: "finance-remind-evergreen", label: "Send #3 now", done: "Sent", step: 2, toast: "Reminder #3 sent to Evergreen Women's Clinic · Daniel copied" },
  "i-harb-1": { k: "finance-escalate-bright", label: "Escalate", done: "Escalated", step: 3, toast: "Bright Path Fertility escalated to Nikki · stand A11 held until the deposit clears" },
  "i-atlas-1": { k: "finance-call-oakline", label: "Log call", done: "Call logged", step: 2, toast: "Call logged for Oakline Nutrition · promise to pay by Fri 2 Oct" },
};
function seqFor(id: string, fx: Fx) {
  const base = DEBT_SEQ[id];
  if (!base) return null;
  const s = base.map(x => ({ ...x }));
  const a = DEBT_ACT[id];
  if (a && fx.acted[a.k]) s[a.step] = { s: "done", d: id === "i-nova-1" ? "27 Sep · #3 sent, call Mon" : "27 Sep · done" };
  return s;
}
const nextActionOf = (inv: Invoice, fx: Fx) => {
  const a = DEBT_ACT[inv.id];
  if (a && fx.acted[a.k]) {
    if (inv.id === "i-nova-1") return "Call Mon 28 Sep (booked)";
    if (inv.id === "i-harb-1") return "Nikki to call Mon";
    if (inv.id === "i-atlas-1") return "Payment promised Fri 2 Oct";
    return "Owner call if unpaid in 48h";
  }
  return inv.next || "";
};
const lastReminderOf = (inv: Invoice, fx: Fx) => {
  const a = DEBT_ACT[inv.id];
  return a && fx.acted[a.k] ? "27 Sep · manual" : inv.lastReminder || "";
};

/* ── Forecast components (expected cash per window, €) ──────────────────── */
type W3 = [number, number, number];
type FcRow = { key: string; label: string; detail: string; color: string; gross: { ff: W3; mh: W3 }; exp: { ff: W3; mh: W3 } };
const FC_ROWS: FcRow[] = [
  { key: "open", label: "Open invoices falling due", detail: "Issued in Xero, not yet due", color: "var(--ok)",
    gross: { ff: [40100, 0, 0], mh: [27700, 0, 0] }, exp: { ff: [34500, 0, 0], mh: [23800, 0, 0] } },
  { key: "sched", label: "Scheduled invoices", detail: "Created on signature, issue on a set date", color: "var(--body)",
    gross: { ff: [4000, 10200, 25300], mh: [2400, 5800, 13700] }, exp: { ff: [3200, 9200, 22300], mh: [1900, 5200, 12000] } },
  { key: "overdue", label: "Overdue, risk-adjusted", detail: "Recovery through the chase plan", color: "var(--bad)",
    gross: { ff: [15200, 0, 0], mh: [8600, 0, 0] }, exp: { ff: [6900, 5200, 900], mh: [3900, 3000, 500] } },
  { key: "slip", label: "Late payers carried forward", detail: "Open invoices likely to pay after due date", color: "var(--warn)",
    gross: { ff: [0, 0, 0], mh: [0, 0, 0] }, exp: { ff: [0, 5300, 1000], mh: [0, 3800, 700] } },
  { key: "pipe", label: "Deposits from late-stage deals", detail: "30% deposits, weighted by stage probability", color: "var(--faint)",
    gross: { ff: [0, 8600, 38950], mh: [0, 7700, 24700] }, exp: { ff: [0, 6900, 14000], mh: [0, 6100, 12100] } },
];
const pick = (w: { ff: W3; mh: W3 }, e: "all" | "ff" | "mh", i: number) => e === "all" ? w.ff[i] + w.mh[i] : w[e][i];

/* ── Small shared bits ─────────────────────────────────────────────────── */
const grid = (cols: string, gap = 14, extra?: CSSProperties): CSSProperties => ({ display: "grid", gridTemplateColumns: cols, gap, alignItems: "start", marginBottom: 14, ...extra });
const TITLES: Record<string, string> = {
  overview: "Finance", invoices: "Invoices", payments: "Payments", debtors: "Debtors", reconciliation: "Reconciliation", forecast: "Cash forecast",
};
function Lnk({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button className="fx-link" onClick={(e) => { e.stopPropagation(); onClick(); }}>{children}</button>;
}
function Mini({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ fontSize: 11.5, color: "var(--dim)", lineHeight: 1.5, ...style }}>{children}</div>;
}
function Dot({ c }: { c: string }) {
  return <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: "inline-block", flex: "none" }} />;
}
function Seg({ parts, height = 10 }: { parts: { v: number; c: string; title?: string; onClick?: () => void; hatch?: boolean }[]; height?: number }) {
  const total = Math.max(1, parts.reduce((a, p) => a + p.v, 0));
  return (
    <div style={{ display: "flex", gap: 2, height, borderRadius: 99, overflow: "hidden", background: "var(--track)" }}>
      {parts.filter(p => p.v > 0).map((p, i) => (
        <span key={i} title={p.title} onClick={p.onClick}
          style={{ width: (p.v / total) * 100 + "%", background: p.hatch ? "repeating-linear-gradient(135deg,var(--track) 0 4px,var(--border-strong) 4px 6px)" : p.c, cursor: p.onClick ? "pointer" : undefined, display: "block" }} />
      ))}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════════
   Module
   ═════════════════════════════════════════════════════════════════════════ */
export default function Finance({ fx }: ModuleProps) {
  if (fx.event === "ca") return <CanadaView fx={fx} />;
  switch (fx.tab) {
    case "invoices": return <Invoices fx={fx} />;
    case "payments": return <Payments fx={fx} />;
    case "debtors": return <Debtors fx={fx} />;
    case "reconciliation": return <Reconciliation fx={fx} />;
    case "forecast": return <Forecast fx={fx} />;
    default: return <Overview fx={fx} />;
  }
}

/* ── Canada Pilot: planning view ───────────────────────────────────────── */
function CanadaView({ fx }: { fx: Fx }) {
  const cloned = (label: string) => CANADA.cloned.find(c => c[0] === label);
  const tpl = cloned("Contract templates"), seq = cloned("Email sequences cloned");
  const setup: [string, string, "done" | "pending" | "na"][] = [
    ["Invoice split rules", "30% deposit · 70% balance, early-bird variant", "done"],
    ["Reminder sequence", "Day 1, 3, 7 and 14, same wording", "done"],
    ["Contract templates", tpl ? `${tpl[1]} / ${tpl[2]} cloned` : "Cloned", "done"],
    ["Email sequences", seq ? `${seq[1]} / ${seq[2]} cloned` : "Cloned", "done"],
    ["Xero organisation", "Waiting on currency and tax decision", "pending"],
    ["Payment provider", "Stripe account under review", "pending"],
    ["Bank feed", "Not connected until the entity is set", "na"],
  ];
  const sub: Record<string, string> = {
    overview: "Canada Pilot · finance rules cloned from Dublin, nothing invoiced yet",
    invoices: "Canada Pilot · no deals signed, so no invoices generated yet",
    payments: "Canada Pilot · no payment provider live yet",
    debtors: "Canada Pilot · no debtors until the first contract is signed",
    reconciliation: "Canada Pilot · Xero organisation not connected yet",
    forecast: "Canada Pilot · no cash forecast until currency and tax are set",
  };
  return (
    <Page>
      <PageHead title={TITLES[fx.tab] || "Finance"} sub={sub[fx.tab] || sub.overview} fx={fx} />
      <Kpis items={[
        { label: "Contracted", value: eur(0), sub: "No sales opened yet" },
        { label: "Finance workflows ready", value: "4 / 7", sub: "3 wait on decisions", tone: "warn" },
        { label: "Decisions outstanding", value: String(CANADA.decisions.length), sub: "Currency, tax, provider", tone: fx.acted["canada-decisions"] ? "ok" : "warn" },
        { label: "Template", value: <span style={{ fontSize: 17 }}>{CANADA.template}</span>, sub: "Location TBD" },
      ]} />
      <div style={grid("minmax(0,1.2fr) minmax(0,1fr)")}>
        <Card title="Finance setup cloned from Dublin" sub={CANADA.template}>
          {setup.map(([k, v, s]) => (
            <Row key={k} style={{ padding: "8px 0", borderTop: "1px solid var(--border)" }}>
              <StepDot s={s} />
              <span className="fx-strong" style={{ fontSize: 12.5, width: 150, flex: "none" }}>{k}</span>
              <span style={{ fontSize: 12.5, color: "var(--dim)" }}>{v}</span>
            </Row>
          ))}
        </Card>
        <Card title="Decisions before the first invoice" right={
          <ActBtn fx={fx} k="canada-decisions" size="sm" label="Send to Nikki" doneLabel="Sent to Nikki" toast="6 localisation decisions sent to Nikki for review" />}>
          {CANADA.decisions.map(([k, v]) => (
            <Row key={k} style={{ padding: "8px 0", borderTop: "1px solid var(--border)" }}>
              <span className="fx-strong" style={{ fontSize: 12.5, flex: 1 }}>{k}</span>
              <Badge tone={v === "TBD" ? "ca" : "warn"}>{v}</Badge>
            </Row>
          ))}
          <Mini style={{ marginTop: 10 }}>Currency and tax treatment decide the Xero organisation and invoice template. Dublin figures are unaffected.</Mini>
        </Card>
      </div>
      <Note tone="accent">
        The Canada Pilot has no sales, exhibitors or speakers yet. Once currency and tax are set, the Dublin invoice engine switches on for it with the same split and reminder rules.{" "}
        <Lnk onClick={() => fx.goTo("Events", "portfolio")}>Open Events · Portfolio</Lnk>
      </Note>
    </Page>
  );
}

/* ── Overview ──────────────────────────────────────────────────────────── */
function engineStats(e: "all" | "ff" | "mh", fx: Fx) {
  const recent = GROUPS.filter(g => inEvent(e, g.event) && g.signed && parseD(g.signed) >= WINDOW_START);
  const invoices = recent.reduce((a, g) => a + g.invoices.length, 0);
  const matchedEvents = RECON.matched.map(m => ALL_INV.find(i => i.no === m[2])?.event);
  const matched = matchedEvents.filter(ev => ev && inEvent(e, ev)).length + (fx.acted["match-peak"] && inEvent(e, "mh") ? 1 : 0);
  const review = (fx.acted["match-peak"] ? 0 : inEvent(e, "mh") ? 1 : 0) + (e === "all" ? 1 : 0);
  return {
    contracts: recent.length, invoices,
    reminders: DEBTORS.filter(d => inEvent(e, d.event)).length,
    matched, review, updated: e === "all" ? RECON.invoicesUpdated : e === "ff" ? 6 : 5,
  };
}

function Overview({ fx }: { fx: Fx }) {
  const e = fx.event as "all" | "ff" | "mh";
  const k = KPIS[e];
  const notInv = k.contracted - k.collected - k.outstanding;
  const openNotDue = k.outstanding - k.overdue;
  const st = engineStats(e, fx);
  const matchedPeak = !!fx.acted["match-peak"];

  const steps: { sys: string; h: string; d: string; go: () => void; tone?: string }[] = [
    { sys: "HubSpot", h: `${st.contracts} contracts signed`, d: "Deal moves to Won", go: () => fx.goTo("Sales", "contracts") },
    { sys: "Pulse rules", h: `${st.invoices} invoices generated`, d: "30% deposit + 70% balance", go: () => fx.goTo("Finance", "invoices") },
    { sys: "Xero", h: `${st.invoices} of ${st.invoices} posted`, d: "Token refreshed 09:30", go: () => fx.goTo("Finance", "reconciliation") },
    { sys: "Reminders", h: `${st.reminders} sequences running`, d: "Day 1, 3, 7, 14", go: () => fx.goTo("Finance", "debtors"), tone: "var(--warn)" },
    { sys: "Bank feed", h: `${st.matched} matched today`, d: st.review ? `${st.review} to review` : "Nothing to review", go: () => fx.goTo("Finance", "reconciliation"), tone: st.review ? "var(--warn)" : undefined },
    { sys: "HubSpot", h: `${st.updated} deals updated`, d: "Payment status on the deal", go: () => fx.goTo("Sales", "deals") },
  ];

  const series = e === "all" ? [
    { name: "All events · expected", color: "var(--body)", values: CASH_CURVE.expected, dashed: true, area: true },
    { name: EVENTS.ff.name, color: evColor("ff"), values: CASH_CURVE.ff },
    { name: EVENTS.mh.name, color: evColor("mh"), values: CASH_CURVE.mh },
    { name: "Collected to date", color: "var(--ok)", values: CASH_CURVE.actual },
  ] : [
    { name: EVENTS[e].name + " · expected", color: evColor(e), values: CASH_CURVE[e], dashed: true, area: true },
    { name: "Collected to date", color: "var(--ok)", values: CASH_CURVE[e].map((v, i) => i === 0 ? v : null) },
  ];
  const curve = e === "all" ? CASH_CURVE.expected : CASH_CURVE[e];

  const actions = [
    { ev: "ff" as EventId, h: "Nova Fertility Clinic deposit", d: `${eur(NOVA.deposit)} · ${NOVA.daysOverdue} days overdue · FE-2027-0412`, open: "i-nova-1",
      btn: <ActBtn fx={fx} k="chase-nova" size="sm" label="Send reminder #3" doneLabel="Chased" toast={DEBT_ACT["i-nova-1"].toast} /> },
    { ev: "mh" as EventId, h: "Peak Health Labs payment match", d: `${eur(PEAK.deposit)} · ref ${PEAK.paymentRef} · ${PEAK.matchConfidence}% confidence`, open: "i-peak-1",
      btn: <ActBtn fx={fx} k="match-peak" size="sm" label="Approve match" doneLabel="Matched" toast="Matched €3,750 to Peak Health Labs · FE-2027-0388 marked paid in Xero" /> },
    { ev: "ff" as EventId, h: "Bright Path Fertility deposit", d: "€4,380 · 15 days overdue · stand A11 blocked", open: "i-harb-1",
      btn: <ActBtn fx={fx} k="finance-escalate-bright" size="sm" label="Escalate" doneLabel="Escalated" toast={DEBT_ACT["i-harb-1"].toast} /> },
    { ev: "mh" as EventId, h: "Oakline Nutrition deposit", d: "€3,150 · 19 days overdue · owner call today", open: "i-atlas-1",
      btn: <ActBtn fx={fx} k="finance-call-oakline" size="sm" label="Log call" doneLabel="Call logged" toast={DEBT_ACT["i-atlas-1"].toast} /> },
  ].filter(a => inEvent(e, a.ev));

  return (
    <Page>
      <PageHead title="Finance" sub="Contracted revenue, cash and the invoice engine that connects HubSpot to Xero" fx={fx} />
      <Kpis items={[
        { label: "Contracted revenue", value: eur(k.contracted), sub: "Signed contracts, 2027", onClick: () => fx.goTo("Sales", "contracts") },
        { label: "Cash collected", value: eur(k.collected), sub: `${Math.round((k.collected / k.contracted) * 100)}% of contracted`, tone: "ok", onClick: () => fx.goTo("Finance", "payments") },
        { label: "Open invoices", value: eur(k.outstanding), sub: `incl. ${eur(k.overdue)} overdue`, onClick: () => fx.goTo("Finance", "invoices") },
        { label: "Overdue", value: eur(k.overdue), sub: `${DEBTORS.filter(d => inEvent(e, d.event)).length} accounts on the chase plan`, tone: "bad", onClick: () => fx.goTo("Finance", "debtors") },
        { label: "Due next 30 days", value: eur(k.due30), sub: "incl. scheduled invoices", onClick: () => fx.goTo("Finance", "forecast") },
      ]} />

      {/* Invoice engine */}
      <Card title="Invoice engine" sub="HubSpot → Pulse → Xero, last 30 days" style={{ marginBottom: 14 }}
        right={<Badge tone="ok"><Icon d={PATHS.check} size={11} sw={2.4} />Healthy · 0 failed runs in 14 days</Badge>}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: 16 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ position: "relative", minWidth: 0 }}>
              <button className="fx-flow-n" onClick={s.go} style={{ width: "100%", height: "100%" }}>
                <div className="t" style={{ color: s.tone || "var(--accent)" }}>{i + 1} · {s.sys.toUpperCase()}</div>
                <div className="h">{s.h}</div>
                <div className="d">{s.d}</div>
              </button>
              {i < steps.length - 1 && (
                <span style={{ position: "absolute", right: -14, top: "50%", transform: "translateY(-50%)", color: "var(--faint)", pointerEvents: "none" }}>
                  <Icon d="M9 6l6 6-6 6" size={12} sw={2.2} />
                </span>
              )}
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 16, alignItems: "center", marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
          <Mini>
            <span style={{ color: "var(--body)" }}>Before Pulse</span>, a changed API token broke the Make.com scenario between HubSpot and Xero and invoices quietly stopped going out.
            Now Pulse holds the split rules, refreshes the Xero token itself and raises a task the moment a sync fails.
          </Mini>
          <Row gap={8}>
            <Badge tone="ghost">Make.com · 3 scenarios retired</Badge>
            <Badge tone="warn">1 retiring 4 Oct</Badge>
            <Btn size="sm" kind="ghost" icon={PATHS.sync} onClick={() => fx.goTo("Finance", "reconciliation")}>Sync log</Btn>
          </Row>
        </div>
      </Card>

      <div style={grid("minmax(0,1.55fr) minmax(0,1fr)")}>
        <Card title="Cash collection" sub="Cumulative, Sep 2026 to Mar 2027 (€k)">
          <LineChart labels={CASH_CURVE.months} series={series} height={206} fmt={n => "€" + n + "k"} />
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${CASH_CURVE.months.length},minmax(0,1fr))`, marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
            {CASH_CURVE.months.map((m, i) => (
              <div key={m} style={{ minWidth: 0 }}>
                <div style={{ fontSize: 10.5, color: "var(--faint)" }}>{m}{i === 0 ? " · actual" : ""}</div>
                <div style={{ fontSize: 12.5, color: i === 0 ? "var(--ok)" : "var(--body)", fontVariantNumeric: "tabular-nums", marginTop: 2 }}>€{curve[i]}k</div>
              </div>
            ))}
          </div>
        </Card>
        <RevenueSplit fx={fx} />
      </div>

      <div style={grid("minmax(0,1.55fr) minmax(0,1fr)")}>
        <Card title="Where contracted revenue sits" sub={e === "all" ? "All events" : EVENTS[e].name}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 8, fontSize: 13, color: "var(--dim)", marginBottom: 12 }}>
            <span className="fx-strong" style={{ fontSize: 15 }}>{eur(k.contracted)}</span> contracted =
            <span style={{ color: "var(--ok)" }}>{eur(k.collected)}</span> collected +
            <span style={{ color: "var(--ink)" }}>{eur(k.outstanding)}</span> open +
            <span style={{ color: "var(--body)" }}>{eur(notInv)}</span> not yet invoiced
          </div>
          <Seg height={14} parts={[
            { v: k.collected, c: "var(--ok)", title: "Collected", onClick: () => fx.goTo("Finance", "payments") },
            { v: openNotDue, c: "var(--warn)", title: "Open, not yet due", onClick: () => fx.goTo("Finance", "invoices") },
            { v: k.overdue, c: "var(--bad)", title: "Overdue", onClick: () => fx.goTo("Finance", "debtors") },
            { v: notInv, c: "", hatch: true, title: "Not yet invoiced", onClick: () => fx.goTo("Finance", "forecast") },
          ]} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 12, marginTop: 14 }}>
            <Fig label={<Row gap={6}><Dot c="var(--ok)" />Collected</Row>} value={eur(k.collected)} sub={matchedPeak || e === "ff" ? "Bank-confirmed" : "incl. €3,750 Peak, match pending"} />
            <Fig label={<Row gap={6}><Dot c="var(--warn)" />Open, not due</Row>} value={eur(openNotDue)} sub="Issued in Xero" />
            <Fig label={<Row gap={6}><Dot c="var(--bad)" />Overdue</Row>} value={eur(k.overdue)} sub="On the chase plan" color="var(--bad)" />
            <Fig label={<Row gap={6}><Dot c="var(--border-strong)" />Not yet invoiced</Row>} value={eur(notInv)} sub="Scheduled balances" />
          </div>
        </Card>
        <Card title="Needs a decision" sub={`${actions.length} items`}>
          {actions.map((a, i) => (
            <div key={i} onClick={() => fx.open("invoice", a.open)}
              style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 10, alignItems: "center", padding: "10px 0", borderTop: i ? "1px solid var(--border)" : undefined, cursor: "pointer" }}>
              <div style={{ minWidth: 0 }}>
                <Row gap={7}><span className="fx-strong" style={{ fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.h}</span><EventTag id={a.ev} /></Row>
                <Mini style={{ marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.d}</Mini>
              </div>
              {a.btn}
            </div>
          ))}
        </Card>
      </div>
    </Page>
  );
}

function RevenueSplit({ fx }: { fx: Fx }) {
  const e = fx.event as "all" | "ff" | "mh";
  if (e === "all") {
    const ids: ("ff" | "mh")[] = ["ff", "mh"];
    return (
      <Card title="Revenue by event" sub="Contracted, 2027">
        <Row gap={18} style={{ alignItems: "center" }}>
          <Donut size={112} thickness={13} segments={ids.map(id => ({ label: EVENTS[id].name, value: KPIS[id].contracted, color: evColor(id) }))}
            center={<><div style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)" }}>{eurK(KPIS.all.contracted)}</div><div style={{ fontSize: 10, color: "var(--faint)" }}>contracted</div></>} />
          <div style={{ flex: 1, minWidth: 0 }}>
            {ids.map(id => {
              const x = KPIS[id]; const ni = x.contracted - x.collected - x.outstanding;
              return (
                <div key={id} style={{ padding: "8px 0", cursor: "pointer" }} onClick={() => fx.setEvent(id)}>
                  <Row gap={7}>
                    <Dot c={evColor(id)} /><span style={{ fontSize: 12.5, color: "var(--ink)", fontWeight: 500 }}>{EVENTS[id].name}</span>
                    <span className="fx-grow" />
                    <span className="fx-num" style={{ fontSize: 12.5, color: "var(--ink)" }}>{eur(x.contracted)}</span>
                  </Row>
                  <div style={{ marginTop: 7 }}>
                    <Seg height={6} parts={[{ v: x.collected, c: "var(--ok)" }, { v: x.outstanding, c: "var(--warn)" }, { v: ni, c: "", hatch: true }]} />
                  </div>
                  <Mini style={{ marginTop: 4 }}>{Math.round((x.contracted / KPIS.all.contracted) * 100)}% of total · {eurK(x.collected)} collected · {eurK(x.outstanding)} open · {eurK(ni)} to invoice</Mini>
                </div>
              );
            })}
          </div>
        </Row>
        <Legend items={[["Collected", "var(--ok)"], ["Open", "var(--warn)"], ["Not yet invoiced", "var(--border-strong)"]]} />
      </Card>
    );
  }
  const x = KPIS[e]; const ni = x.contracted - x.collected - x.outstanding;
  const other = e === "ff" ? "mh" : "ff";
  return (
    <Card title="Revenue by event" sub={EVENTS[e].name} right={<Lnk onClick={() => fx.setEvent("all")}>Compare both</Lnk>}>
      <Row gap={18} style={{ alignItems: "center" }}>
        <Donut size={112} thickness={13} segments={[
          { label: "Collected", value: x.collected, color: "var(--ok)" },
          { label: "Open", value: x.outstanding, color: "var(--warn)" },
          { label: "Not yet invoiced", value: ni, color: "var(--border-strong)" },
        ]} center={<><div style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)" }}>{eurK(x.contracted)}</div><div style={{ fontSize: 10, color: "var(--faint)" }}>contracted</div></>} />
        <div style={{ flex: 1, minWidth: 0, display: "grid", gap: 10 }}>
          <Fig label="Share of all contracted" value={Math.round((x.contracted / KPIS.all.contracted) * 100) + "%"} sub={`${EVENTS[other].name}: ${eur(KPIS[other].contracted)}`} color={evColor(e)} />
          <Fig label="Collected" value={eur(x.collected)} sub={`${eur(x.outstanding)} open · ${eur(ni)} to invoice`} />
        </div>
      </Row>
    </Card>
  );
}

/* ── Invoices ──────────────────────────────────────────────────────────── */
type SF = "all" | IStatus;
function Invoices({ fx }: { fx: Fx }) {
  const e = fx.event as "all" | "ff" | "mh";
  const [sf, setSf] = useState<SF>("all");
  const groups = GROUPS.filter(g => inEvent(e, g.event));
  const invs = groups.flatMap(g => g.invoices);
  const n = (s: IStatus) => invs.filter(i => effStatus(i, fx) === s).length;
  const sum = (f: (i: Invoice) => boolean) => invs.filter(f).reduce((a, i) => a + i.amount, 0);
  const open = sum(i => i.status === "Open" || i.status === "Overdue");
  const overdue = sum(i => i.status === "Overdue");
  const shown = sf === "all" ? groups : groups.filter(g => g.invoices.some(i => effStatus(i, fx) === sf));
  const opts: [SF, string][] = [
    ["all", `All · ${invs.length}`], ["Overdue", `Overdue · ${n("Overdue")}`], ["Open", `Open · ${n("Open")}`],
    ["Match pending", `Match pending · ${n("Match pending")}`], ["Scheduled", `Scheduled · ${n("Scheduled")}`], ["Paid", `Paid · ${n("Paid")}`],
  ];
  const rule = [
    { t: "HubSpot", h: "Deal marked Won", d: "Contract signed" },
    { t: "Pulse", h: "Split applied", d: "30% now · 70% later" },
    { t: "Xero", h: "Both invoices created", d: "Deposit issued, balance scheduled" },
    { t: "Reminders", h: "Attached per invoice", d: "Day 1, 3, 7, 14" },
    { t: "Bank feed", h: "Payment matched", d: "HubSpot status updated" },
  ];
  return (
    <Page>
      <PageHead title="Invoices" sub="Every signed deal creates its own deposit and balance invoices, no spreadsheet in between" fx={fx} />
      <Card style={{ marginBottom: 14 }} pad={false}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.7fr) minmax(0,1fr)", alignItems: "stretch" }}>
          <div style={{ padding: "14px 18px", borderRight: "1px solid var(--border)", minWidth: 0 }}>
            <div className="fx-sec-t" style={{ marginBottom: 10 }}>SPLIT RULE, APPLIED AUTOMATICALLY</div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${rule.length},minmax(0,1fr))`, gap: 14 }}>
              {rule.map((r, i) => (
                <div key={i} style={{ position: "relative", minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".1em", color: "var(--accent)" }}>{r.t.toUpperCase()}</div>
                  <div style={{ fontSize: 12.5, color: "var(--ink)", fontWeight: 500, marginTop: 4 }}>{r.h}</div>
                  <Mini>{r.d}</Mini>
                  {i < rule.length - 1 && <span style={{ position: "absolute", right: -12, top: 14, color: "var(--faint)" }}><Icon d="M9 6l6 6-6 6" size={11} sw={2.2} /></span>}
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: "14px 18px", display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12, alignContent: "center" }}>
            <Fig label="Open invoices" value={eur(open)} sub="Complete open ledger" />
            <Fig label="Of which overdue" value={eur(overdue)} color="var(--bad)" sub={`${n("Overdue")} invoices`} />
            <Fig label="Deals under €6,000" value="Invoiced in full" sub="One invoice, no split" />
            <Fig label="Signed before 1 Sep" value="Early-bird" sub="Balance by 15 Oct" />
          </div>
        </div>
      </Card>

      <Row style={{ marginBottom: 12, flexWrap: "wrap" }}>
        <Chips options={opts} value={sf} onChange={setSf} />
        <span className="fx-grow" />
        <Mini>{shown.length} deals · click any invoice for its detail and reminder history</Mini>
      </Row>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,500px),1fr))", gap: 12 }}>
        {shown.map(g => <DealGroup key={g.client} g={g} fx={fx} sf={sf} />)}
      </div>
    </Page>
  );
}

function groupLine(g: Group, fx: Fx): { text: string; tone: Tone } {
  if (g.client === "Nova Fertility Clinic") return fx.acted["chase-nova"] ? { text: "Reminder #3 sent · call booked Mon 28 Sep", tone: "warn" } : { text: "Deposit reminder sequence active", tone: "bad" };
  if (g.client === "Peak Health Labs") return fx.acted["match-peak"] ? { text: "Deposit paid · reconciled in Xero", tone: "ok" } : { text: "€3,750 received 26 Sep · approve Xero match", tone: "warn" };
  const od = g.invoices.find(i => i.status === "Overdue");
  if (od) return { text: `Deposit ${od.days} days overdue · ${nextActionOf(od, fx)}`, tone: "bad" };
  const op = g.invoices.find(i => i.status === "Open");
  if (op) return { text: `${op.kind} open · due ${shortD(op.due)}`, tone: "info" };
  const sc = g.invoices.find(i => i.status === "Scheduled");
  if (sc && g.invoices.length === 1) return { text: "Invoice issues automatically on 1 Oct", tone: "ghost" };
  if (sc) return { text: "Deposit paid · balance scheduled", tone: "ok" };
  return { text: "Paid in full", tone: "ok" };
}

function DealGroup({ g, fx, sf }: { g: Group; fx: Fx; sf: SF }) {
  const n = g.invoices.length;
  const line = groupLine(g, fx);
  const dealId = dealIdOf(g.client), exId = exhibitorIdOf(g.client);
  const hl = g.client === "Nova Fertility Clinic" || g.client === "Peak Health Labs";
  return (
    <div className="fx-card" style={{ padding: 12, display: "grid", gridTemplateColumns: "minmax(0,1fr) 36px minmax(0,1.3fr)", alignItems: "stretch", borderColor: hl ? "var(--accent-line)" : undefined }}>
      {/* deal */}
      <div style={{ padding: "8px 10px", borderRadius: 14, background: "var(--surface-2)", border: "1px solid var(--border)", minWidth: 0, display: "flex", flexDirection: "column", gap: 5 }}>
        <Row gap={6}><EventTag id={g.event} /><span style={{ fontSize: 10.5, color: "var(--faint)" }}>Signed {g.signed ? shortD(g.signed) : "n/a"}</span></Row>
        <div className="fx-strong" style={{ fontSize: 13, lineHeight: 1.3 }}>{g.client}</div>
        <div style={{ fontSize: 17, fontWeight: 600, color: "var(--ink)", letterSpacing: "-.3px", fontVariantNumeric: "tabular-nums" }}>{eur(g.deal)}</div>
        <Mini style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.pkg}</Mini>
        <Row gap={6}><Avatar name={g.owner} size={18} bg={ownerBg(g.owner)} /><span style={{ fontSize: 11.5, color: "var(--dim)" }}>{g.owner}</span></Row>
        <Row gap={10} style={{ marginTop: "auto", paddingTop: 2 }}>
          <Lnk onClick={() => dealId ? fx.open("deal", dealId) : fx.goTo("Sales", "deals")}>Deal</Lnk>
          {exId && <Lnk onClick={() => fx.goTo("Exhibitors", "onboarding", { kind: "exhibitor", id: exId })}>Exhibitor</Lnk>}
        </Row>
      </div>
      {/* connector */}
      <div style={{ position: "relative" }} aria-hidden>
        <span style={{ position: "absolute", left: 0, width: "50%", top: "50%", borderTop: "1px solid var(--border-strong)" }} />
        {n > 1 && <span style={{ position: "absolute", left: "50%", top: `${100 / (2 * n)}%`, bottom: `${100 / (2 * n)}%`, borderLeft: "1px solid var(--border-strong)" }} />}
        {g.invoices.map((_, i) => (
          <span key={i} style={{ position: "absolute", left: "50%", right: 0, top: `${((2 * i + 1) * 100) / (2 * n)}%`, borderTop: "1px solid var(--border-strong)" }} />
        ))}
        <span style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 7, height: 7, borderRadius: 99, background: "var(--accent)" }} />
      </div>
      {/* invoices */}
      <div style={{ display: "grid", gridTemplateRows: `repeat(${n},1fr)`, minWidth: 0 }}>
        {g.invoices.map(inv => {
          const s = effStatus(inv, fx);
          const dim = sf !== "all" && s !== sf;
          const share = inv.kind === "Full" ? "100%" : Math.round((inv.amount / inv.deal) * 100) + "%";
          return (
            <div key={inv.id} style={{ padding: "3px 0", minWidth: 0 }}>
              <button onClick={() => fx.open("invoice", inv.id)} className="fx-flow-n"
                style={{ width: "100%", height: "100%", padding: "8px 10px", opacity: dim ? 0.45 : 1, borderColor: s === "Overdue" ? "var(--bad)" : undefined }}>
                <Row gap={6}>
                  <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".1em", color: "var(--faint)" }}>{inv.kind.toUpperCase()} · {share}</span>
                  <span className="fx-grow" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{eur(inv.amount)}</span>
                </Row>
                <Row gap={6} style={{ marginTop: 5 }}>
                  <span style={{ fontSize: 11, color: "var(--dim)", whiteSpace: "nowrap" }}>{inv.no} · due {shortD(inv.due)}</span>
                  <span className="fx-grow" />
                  <IBadge inv={inv} fx={fx} />
                </Row>
              </button>
            </div>
          );
        })}
      </div>
      <div style={{ gridColumn: "1 / -1", marginTop: 8 }}>
        <Row gap={8}>
          <Badge tone={line.tone}>{line.text}</Badge>
          <span className="fx-grow" />
          <span style={{ fontSize: 11, color: "var(--faint)", whiteSpace: "nowrap" }}>{g.terms}</span>
        </Row>
      </div>
    </div>
  );
}

/* ── Payments ──────────────────────────────────────────────────────────── */
function Payments({ fx }: { fx: Fx }) {
  const e = fx.event as "all" | "ff" | "mh";
  const [src, setSrc] = useState<"all" | "Xero bank feed" | "Stripe">("all");
  const matched = !!fx.acted["match-peak"];
  const rows = PAYMENTS.filter(p => (e === "all" || p.event === e) && (src === "all" || p.source === src));
  const wk = (o: { ff: number[]; mh: number[]; un?: number[] }) =>
    WEEKS.map((_, i) => Math.round(((e === "all" ? o.ff[i] + o.mh[i] + (o.un ? o.un[i] : 0) : o[e][i])) * 10) / 10);
  const bank = wk(RECEIPTS.bank), stripe = wk(RECEIPTS.stripe), shop = wk(RECEIPTS.shopify);
  const tot = (a: number[]) => a.reduce((x, y) => x + y, 0);
  const b2b8 = tot(bank) + tot(stripe);
  const lastWeek = bank[7] + stripe[7];
  const feedRows = PAYMENTS.filter(p => e === "all" || p.event === e);
  const pendingN = feedRows.filter(p => p.state === "Unmatched" || (p.state === "Match pending" && !matched)).length;

  const state = (p: Pay) => p.state === "Match pending" && matched ? "Matched" : p.state;
  const cols: Col<Pay>[] = [
    { k: "date", label: "Received", w: "70px" },
    { k: "payer", label: "Payer", w: "minmax(0,1.5fr)", render: p => (
      <Row gap={7}><span className="fx-strong" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{p.payer}</span>{p.event ? <EventTag id={p.event} /> : <Badge tone="ghost">Unallocated</Badge>}</Row>) },
    { k: "amount", label: "Amount", w: "84px", align: "right", render: p => <span className="fx-strong">{eur(p.amount)}</span> },
    { k: "method", label: "Method", w: "minmax(0,.8fr)" },
    { k: "ref", label: "Reference", w: "minmax(0,.9fr)", render: p => <span style={{ fontFamily: "var(--mono)", fontSize: 11.5 }}>{p.ref}</span> },
    { k: "inv", label: "Matched invoice", w: "minmax(0,.9fr)", render: p => p.inv ? <span>{findInv(p.inv)?.no}</span> : <span className="fx-muted">None found</span> },
    { k: "source", label: "Source", w: "minmax(0,.9fr)", render: p => <span style={{ color: "var(--dim)" }}>{p.source === "Stripe" ? "Stripe → Xero" : "Xero bank feed"}</span> },
    { k: "state", label: "Status", w: "minmax(0,1fr)", render: p => {
      const s = state(p);
      return <Badge tone={s === "Matched" ? "ok" : s === "Unmatched" ? "bad" : "warn"}>{s === "Matched" && p.id === "p-peak" ? "Matched · approved" : s === "Matched" ? p.match : s === "Unmatched" ? "Needs a human" : p.match}</Badge>;
    } },
  ];

  return (
    <Page>
      <PageHead title="Payments" sub="Money received, where it came from and which invoice it cleared" fx={fx} />
      <div style={grid("minmax(0,1.6fr) minmax(0,1fr)")}>
        <Card title="B2B receipts by week" sub="Exhibitor and sponsor payments (€k)"
          right={<Row gap={14}><Fig label="Last 8 weeks" value={"€" + b2b8.toFixed(1) + "k"} /><Fig label="This week" value={"€" + lastWeek.toFixed(1) + "k"} /></Row>}>
          <BarChart labels={WEEKS} stacked height={168} fmt={n => n.toFixed(1)} series={[
            { name: "Xero bank feed (SEPA)", color: e === "all" ? "var(--body)" : evColor(e), values: bank },
            { name: "Stripe (card)", color: "var(--faint)", values: stripe },
          ]} />
        </Card>
        <Card title="Ticket income" sub="Shopify · B2C, kept apart">
          <Row gap={16} style={{ marginBottom: 10 }}>
            <Fig label="Paid out, 8 weeks" value={"€" + tot(shop).toFixed(1) + "k"} />
            <Fig label="Latest payout" value={"€" + shop[7].toFixed(1) + "k"} sub="25 Sep" />
          </Row>
          <BarChart labels={WEEKS.map(w => w.split(" ")[0])} height={74} fmt={() => ""} series={[{ name: "Shopify", color: e === "all" ? "var(--dim)" : evColor(e), values: shop }]} />
          <div style={{ marginTop: 8 }}>
            {SHOPIFY_PAYOUTS.map(s => (
              <Row key={s.date} gap={8} style={{ padding: "6px 0", borderTop: "1px solid var(--border)", fontSize: 12 }}>
                <span style={{ color: "var(--dim)", width: 46 }}>{s.date}</span>
                <span style={{ color: "var(--body)" }}>{s.orders} orders</span>
                <span className="fx-grow" />
                <span className="fx-num fx-strong">€{(e === "all" ? s.ff + s.mh : s[e]).toFixed(1)}k</span>
              </Row>
            ))}
          </div>
          <Mini style={{ marginTop: 6 }}>Posts to the Ticket sales account in Xero. Never touches exhibitor debtors.</Mini>
        </Card>
      </div>

      <Card pad={false} title="Payments received" sub={`${rows.length} payments · ${pendingN} need review`}
        right={<Chips options={[["all", "All sources"], ["Xero bank feed", "Xero bank feed"], ["Stripe", "Stripe"]]} value={src} onChange={setSrc} />}>
        <div style={{ height: 12 }} />
        <Table cols={cols} rows={rows}
          highlight={p => state(p) !== "Matched"}
          onRow={p => p.inv ? fx.open("invoice", p.inv) : fx.goTo("Finance", "reconciliation")} />
      </Card>
    </Page>
  );
}

/* ── Debtors ───────────────────────────────────────────────────────────── */
function Debtors({ fx }: { fx: Fx }) {
  const e = fx.event as "all" | "ff" | "mh";
  const rows = DEBTORS.filter(d => inEvent(e, d.event));
  const total = rows.reduce((a, d) => a + d.amount, 0);
  const buckets = [
    { l: "0-7 days", f: (d: number) => d <= 7, c: "var(--warn)" },
    { l: "8-14 days", f: (d: number) => d >= 8 && d <= 14, c: "var(--warn)" },
    { l: "15+ days", f: (d: number) => d >= 15, c: "var(--bad)" },
  ].map(b => { const r = rows.filter(d => b.f(d.days || 0)); return { ...b, n: r.length, v: r.reduce((a, d) => a + d.amount, 0), who: r.map(d => d.client) }; });
  const atStep = (i: number) => rows.filter(d => seqFor(d.id, fx)?.[i]?.s === "next").length;
  const blocked = EXHIBITORS.filter(x => x.deposit === "missing" && inEvent(e, x.event));

  const cols: Col<Invoice>[] = [
    { k: "client", label: "Account", w: "minmax(0,1.5fr)", render: d => <Row gap={7}><span className="fx-strong" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{d.client}</span><EventTag id={d.event} /></Row> },
    { k: "amount", label: "Amount", w: "78px", align: "right", render: d => <span className="fx-strong">{eur(d.amount)}</span> },
    { k: "due", label: "Due", w: "58px", render: d => shortD(d.due) },
    { k: "days", label: "Days", w: "44px", align: "right", render: d => <span style={{ color: (d.days || 0) >= 15 ? "var(--bad)" : "var(--warn)", fontWeight: 600 }}>{d.days}</span> },
    { k: "seq", label: "Sequence", w: "96px", render: d => <Row gap={4}>{(seqFor(d.id, fx) || []).map((s, i) => <StepDot key={i} s={s.s === "done" ? "done" : s.s === "next" ? "pending" : "na"} title={`${SEQ[i].t} · ${SEQ[i].h} · ${s.d}`} />)}</Row> },
    { k: "last", label: "Last reminder", w: "minmax(0,.95fr)", render: d => <span style={{ color: "var(--dim)" }}>{lastReminderOf(d, fx)}</span> },
    { k: "next", label: "Next action", w: "minmax(0,1.1fr)", render: d => nextActionOf(d, fx) },
    { k: "owner", label: "Owner", w: "minmax(0,.7fr)", render: d => <Row gap={6}><Avatar name={d.owner} size={20} bg={ownerBg(d.owner)} />{firstName(d.owner)}</Row> },
    { k: "act", label: "", w: "132px", align: "right", render: d => { const a = DEBT_ACT[d.id]; return a ? <ActBtn fx={fx} k={a.k} size="sm" label={a.label} doneLabel={a.done} toast={a.toast} /> : null; } },
  ];

  return (
    <Page>
      <PageHead title="Debtors" sub="Overdue deposits, where each one sits on the chase plan and who acts next" fx={fx} />
      <div style={grid("minmax(0,1.25fr) minmax(0,1fr)")}>
        <Card title="Ageing" sub={`${rows.length} accounts · ${eur(total)} overdue`}>
          <Seg height={12} parts={buckets.map(b => ({ v: b.v, c: b.c, title: b.l }))} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginTop: 14 }}>
            {buckets.map(b => (
              <div key={b.l} style={{ padding: "11px 12px", borderRadius: 14, border: "1px solid var(--border)", background: b.l === "15+ days" && b.v ? "var(--bad-soft)" : "var(--surface-2)", minWidth: 0 }}>
                <div style={{ fontSize: 11, color: "var(--dim)" }}>{b.l}</div>
                <div style={{ fontSize: 20, fontWeight: 600, color: b.l === "15+ days" && b.v ? "var(--bad)" : "var(--ink)", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>{eur(b.v)}</div>
                <Mini style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.n ? b.who.join(", ") : "None"}</Mini>
              </div>
            ))}
          </div>
          <Mini style={{ marginTop: 12 }}>
            {blocked.length} exhibitors are held at onboarding until their deposit clears.{" "}
            <Lnk onClick={() => fx.goTo("Exhibitors", "onboarding")}>View in Exhibitors</Lnk>
          </Mini>
        </Card>
        <Card title="Chase plan" sub="Runs on every overdue invoice">
          <div style={{ display: "grid", gap: 0 }}>
            {SEQ.map((s, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "28px minmax(0,1fr) auto", gap: 10, alignItems: "center", padding: "7px 0", position: "relative" }}>
                {i < SEQ.length - 1 && <span style={{ position: "absolute", left: 13, top: 34, bottom: -8, borderLeft: "1px dashed var(--border-strong)" }} />}
                <span style={{ width: 28, height: 28, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: i < 2 ? "var(--surface-2)" : i === 2 ? "var(--warn-soft)" : "var(--bad-soft)", color: i < 2 ? "var(--dim)" : i === 2 ? "var(--warn)" : "var(--bad)", border: "1px solid var(--border)" }}>
                  <Icon d={s.icon} size={13} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, color: "var(--ink)", fontWeight: 500 }}><span style={{ color: "var(--faint)", marginRight: 6 }}>{s.t}</span>{s.h}</div>
                  <Mini>{s.who}</Mini>
                </div>
                <Badge tone={atStep(i) ? "warn" : "ghost"}>{atStep(i)} due next</Badge>
              </div>
            ))}
          </div>
          <Mini style={{ marginTop: 8 }}>Emails send from the account owner's address. A payment stops the sequence the minute it matches in Xero.</Mini>
        </Card>
      </div>
      <Card pad={false} title="Overdue accounts" sub="Sorted by days overdue · click a row for the invoice"
        right={<Badge tone="bad">{eur(total)} requires action</Badge>}>
        <div style={{ height: 12 }} />
        <Table cols={cols} rows={rows} onRow={d => fx.open("invoice", d.id)} highlight={d => (d.days || 0) >= 15 || d.id === "i-nova-1"} />
      </Card>
    </Page>
  );
}

/* ── Reconciliation ────────────────────────────────────────────────────── */
function Reconciliation({ fx }: { fx: Fx }) {
  const e = fx.event as "all" | "ff" | "mh";
  const matched = !!fx.acted["match-peak"];
  const retired = !!fx.acted["finance-retire-contact-sync"];
  const ex = RECON.exception, sec = RECON.second;
  const matchedList = [
    ...(matched ? [["Peak Health Labs", eur(ex.amount), ex.invoice, "Approved · 96%"] as [string, string, string, string]] : []),
    ...RECON.matched,
  ].filter(m => { const ev = ALL_INV.find(i => i.no === m[2])?.event; return !ev || inEvent(e, ev); });

  const integrations: { n: string; s: string; tone: Tone; d: string }[] = [
    { n: "HubSpot", s: "Connected", tone: "ok", d: "Deal webhooks live · last event 09:41" },
    { n: "Xero", s: "Connected", tone: "ok", d: "Token auto-refreshes every 30 min · last 09:30" },
    { n: "AIB bank feed", s: "Connected", tone: "ok", d: "Via Xero · 8 lines pulled 09:47" },
    { n: "Stripe", s: "Connected", tone: "ok", d: "Card payments settle to Xero clearing" },
    { n: "Shopify", s: "Connected", tone: "ok", d: "Ticket payouts to Ticket sales, B2C only" },
    { n: "Make.com", s: retired ? "Retired" : "Retiring", tone: retired ? "ghost" : "warn", d: retired ? "All 4 scenarios off" : "3 of 4 scenarios off · last one 4 Oct" },
  ];
  const scenarios: [string, string, string][] = [
    ["HubSpot Won → Xero invoice split", "Retired 14 Sep", "Pulse invoice rules"],
    ["Xero paid → HubSpot deal status", "Retired 14 Sep", "Pulse payment sync"],
    ["Overdue reminder emails", "Retired 21 Sep", "Pulse chase plan"],
    ["HubSpot ↔ Xero contact sync", retired ? "Retired 27 Sep" : "Read-only until 4 Oct", "Pulse contact sync"],
  ];
  type Log = { t: string; sys: string; h: string; tone?: Tone };
  const log: Log[] = [
    ...(matched ? [{ t: "Now", sys: "You", h: "Approved match · €3,750 PEAKHLTH → FE-2027-0388 · Xero and HubSpot updated", tone: "ok" as Tone }] : []),
    ...(retired ? [{ t: "Now", sys: "Make.com", h: "Contact sync scenario switched off · Pulse owns HubSpot ↔ Xero contacts", tone: "ok" as Tone }] : []),
    { t: "09:48", sys: "HubSpot", h: "11 records updated · 6 paid, 5 reminder states" },
    { t: "09:47", sys: "Pulse", h: "2 bank lines held for review · PEAKHLTH 96%, FUTURE EXPO 41%", tone: "warn" },
    { t: "09:47", sys: "Pulse", h: "6 payments auto-matched at 97% or higher · marked paid in Xero", tone: "ok" },
    { t: "09:47", sys: "Xero", h: "Bank feed pulled · 8 new statement lines on AIB ••4471" },
    { t: "09:30", sys: "Xero", h: "Access token refreshed automatically · next refresh 10:00", tone: "ok" },
    { t: "Sat 16:02", sys: "HubSpot", h: "Nova Fertility Clinic · payment status set to Deposit overdue" },
    { t: "Fri 11:15", sys: "Pulse", h: "Reminder #2 sent to Nova Fertility Clinic from Kathleen's address" },
    { t: "21 Sep", sys: "Make.com", h: "Overdue reminder scenario disabled · replaced by Pulse chase plan" },
  ];

  return (
    <Page>
      <PageHead title="Reconciliation" sub="Xero, the bank feed and HubSpot kept in step, with a person only where it needs one" fx={fx} />
      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.3fr) repeat(4,minmax(0,1fr))", gap: 16, alignItems: "center" }}>
          <Row gap={12}>
            <span style={{ width: 38, height: 38, borderRadius: 12, background: "var(--ok-soft)", color: "var(--ok)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={PATHS.sync} size={17} /></span>
            <div><div style={{ fontSize: 11, color: "var(--faint)" }}>Xero sync</div><div style={{ fontSize: 18, fontWeight: 600, color: "var(--ok)" }}>{RECON.sync}</div></div>
          </Row>
          <Fig label="Payments matched today" value={RECON.matchedToday + (matched ? 1 : 0)} sub="Auto at 97%+, or approved" />
          <Fig label="Unmatched" value={RECON.unmatched - (matched ? 1 : 0)} sub="Waiting on a person" color="var(--warn)" />
          <Fig label="Invoices updated" value={RECON.invoicesUpdated} sub="Since 06:00" />
          <Fig label="Last sync" value={RECON.lastSync} sub="Runs every 15 min" />
        </div>
      </Card>

      <div style={grid("minmax(0,1.35fr) minmax(0,1fr)")}>
        <div style={{ display: "grid", gap: 14, minWidth: 0 }}>
          {inEvent(e, "mh") && (
            <Card title="Exception · possible match" sub={`Received ${ex.received}`} right={matched ? <Badge tone="ok">Resolved</Badge> : <Badge tone="warn">Review</Badge>}>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 14 }}>
                <div style={{ padding: 12, borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface-2)", minWidth: 0 }}>
                  <div className="fx-sec-t" style={{ marginBottom: 6 }}>BANK LINE</div>
                  <div style={{ fontSize: 22, fontWeight: 600, color: "var(--ink)" }}>{eur(ex.amount)}</div>
                  <Mini>Reference <span style={{ fontFamily: "var(--mono)", color: "var(--body)" }}>{ex.ref}</span></Mini>
                  <Mini>Payer PEAK HEALTH LABS LTD</Mini>
                </div>
                <div style={{ padding: 12, borderRadius: 14, border: "1px solid var(--accent-line)", background: "var(--accent-faint)", minWidth: 0, cursor: "pointer" }} onClick={() => fx.open("invoice", "i-peak-1")}>
                  <div className="fx-sec-t" style={{ marginBottom: 6 }}>POSSIBLE MATCH</div>
                  <Row gap={7}><span className="fx-strong" style={{ fontSize: 13.5 }}>{ex.match}</span><EventTag id="mh" /></Row>
                  <Mini>{ex.invoice} · Deposit · {eur(PEAK.deposit)}</Mini>
                  <Row gap={8} style={{ marginTop: 8 }}><Bar value={ex.confidence} color="var(--ok)" /><span style={{ fontSize: 12, color: "var(--ok)", fontWeight: 600 }}>{ex.confidence}%</span></Row>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "4px 14px", marginTop: 12 }}>
                {["Amount equals the deposit exactly", "Reference matches Peak's customer code", "Payer name matches the Xero contact", "Only open deposit for this contact"].map(t => (
                  <Row key={t} gap={7}><span style={{ color: "var(--ok)" }}><Icon d={PATHS.check} size={12} sw={2.4} /></span><Mini>{t}</Mini></Row>
                ))}
              </div>
              <Row style={{ marginTop: 12 }}>
                <Mini style={{ flex: 1 }}>{matched ? "FE-2027-0388 is paid in Xero. Peak's deal in HubSpot shows Deposit paid." : "Held because the reference is a code, not the invoice number. Approving marks the invoice paid in Xero and updates HubSpot."}</Mini>
                <ActBtn fx={fx} k="match-peak" label="Approve Match" doneLabel="Matched" toast="Matched €3,750 to Peak Health Labs · FE-2027-0388 marked paid in Xero" />
              </Row>
            </Card>
          )}
          <Card title="Exception · no match" sub={`Received ${sec.received}`} right={<Badge tone="bad">Needs a human</Badge>}>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,.8fr) minmax(0,1.2fr)", gap: 14 }}>
              <div style={{ padding: 12, borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface-2)", minWidth: 0 }}>
                <div className="fx-sec-t" style={{ marginBottom: 6 }}>BANK LINE</div>
                <div style={{ fontSize: 22, fontWeight: 600, color: "var(--ink)" }}>{eur(sec.amount)}</div>
                <Mini>Reference <span style={{ fontFamily: "var(--mono)", color: "var(--body)" }}>{sec.ref}</span></Mini>
                <Mini>Payer name not supplied by the bank</Mini>
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="fx-sec-t" style={{ marginBottom: 4 }}>CLOSEST CANDIDATES</div>
                {[["Hazel Fertility Nutrition · FE-2027-0414", "€4,200 open · part payment?", sec.confidence], ["Aster IVF Clinic · FE-2027-0415", "€900 open · amount differs", 22], ["Keel Sleep Labs · FE-2027-0411", "€3,900 open · amount differs", 14]].map(([h, d, c]) => (
                  <Row key={String(h)} gap={8} style={{ padding: "6px 0", borderTop: "1px solid var(--border)" }}>
                    <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h}</div><Mini>{d}</Mini></div>
                    <span style={{ fontSize: 12, color: "var(--warn)", fontWeight: 600 }}>{c}%</span>
                  </Row>
                ))}
              </div>
            </div>
            <Row gap={8} style={{ marginTop: 12, justifyContent: "flex-end" }}>
              <ActBtn fx={fx} k="finance-remit-expo" kind="ghost" size="sm" label="Ask bank for remittance" doneLabel="Remittance requested" toast="Remittance request sent to AIB for the €1,200 FUTURE EXPO credit" />
              <ActBtn fx={fx} k="finance-assign-expo" size="sm" label="Assign to Robyn" doneLabel="Assigned to Robyn" toast="€1,200 FUTURE EXPO line assigned to Robyn Walsh · task due Tue" />
            </Row>
          </Card>
        </div>

        <div style={{ display: "grid", gap: 14, minWidth: 0 }}>
          <Card title="Integration health">
            {integrations.map(i => (
              <Row key={i.n} gap={10} style={{ padding: "7px 0", borderTop: "1px solid var(--border)" }}>
                <span className="fx-strong" style={{ fontSize: 12.5, width: 96, flex: "none" }}>{i.n}</span>
                <Mini style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{i.d}</Mini>
                <Badge tone={i.tone}>{i.s}</Badge>
              </Row>
            ))}
          </Card>
          <Card title="Make.com scenarios" sub="Legacy automations being replaced"
            right={<ActBtn fx={fx} k="finance-retire-contact-sync" size="sm" kind="ghost" label="Retire last one now" doneLabel="All retired" toast="Make.com contact sync switched off · Pulse now owns HubSpot ↔ Xero contacts" />}>
            {scenarios.map(([n, s, by]) => (
              <div key={n} style={{ padding: "7px 0", borderTop: "1px solid var(--border)" }}>
                <Row gap={8}><span style={{ fontSize: 12.5, color: "var(--ink)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n}</span><Badge tone={s.startsWith("Retired") ? "ghost" : "warn"}>{s}</Badge></Row>
                <Mini>Replaced by {by}</Mini>
              </div>
            ))}
          </Card>
        </div>
      </div>

      <div style={grid("minmax(0,1.5fr) minmax(0,1fr)", 14, { marginBottom: 0 })}>
        <Card pad={false} title="Sync log" sub="Today, newest first">
          <div style={{ height: 10 }} />
          {log.map((l, i) => (
            <div key={i} className="fx-tr" style={{ gridTemplateColumns: "72px 84px minmax(0,1fr)", minHeight: 38 }}>
              <span style={{ color: "var(--faint)", fontVariantNumeric: "tabular-nums" }}>{l.t}</span>
              <span style={{ color: l.tone === "ok" ? "var(--ok)" : l.tone === "warn" ? "var(--warn)" : "var(--dim)", fontWeight: 500 }}>{l.sys}</span>
              <span>{l.h}</span>
            </div>
          ))}
        </Card>
        <Card pad={false} title="Matched today" sub={`${matchedList.length} payments`}>
          <div style={{ height: 10 }} />
          {matchedList.map(m => {
            const inv = ALL_INV.find(i => i.no === m[2]);
            return (
              <div key={m[2]} className="fx-tr" data-click="1" style={{ gridTemplateColumns: "minmax(0,1.4fr) 70px minmax(0,1fr)", minHeight: 40 }} onClick={() => inv && fx.open("invoice", inv.id)}>
                <div style={{ minWidth: 0 }}><div className="fx-strong" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{m[0]}</div><div style={{ fontSize: 11, color: "var(--faint)" }}>{m[2]}</div></div>
                <span className="fx-num fx-strong">{m[1]}</span>
                <span style={{ textAlign: "right" }}><Badge tone="ok">{m[3]}</Badge></span>
              </div>
            );
          })}
        </Card>
      </div>
    </Page>
  );
}

/* ── Forecast ──────────────────────────────────────────────────────────── */
function Forecast({ fx }: { fx: Fx }) {
  const e = fx.event as "all" | "ff" | "mh";
  const inc = [0, 1, 2].map(w => FC_ROWS.reduce((a, r) => a + pick(r.exp, e, w), 0));
  const cum = e === "all" ? [FINANCE_FORECAST.d30, FINANCE_FORECAST.d60, FINANCE_FORECAST.d90] : [inc[0], inc[0] + inc[1], inc[0] + inc[1] + inc[2]];
  const k = KPIS[e];
  const notInv = k.contracted - k.collected - k.outstanding;
  const schedIn90 = [0, 1, 2].reduce((a, w) => a + pick(FC_ROWS[1].gross, e, w), 0);
  const overdueRec = [0, 1, 2].reduce((a, w) => a + pick(FC_ROWS[2].exp, e, w), 0);
  const labels = ["Next 30 days", "31 to 60 days", "61 to 90 days"];
  const ends = ["by 27 Oct", "by 26 Nov", "by 26 Dec"];
  const conf = (r: FcRow, w: number) => { const g = pick(r.gross, e, w), x = pick(r.exp, e, w); return g ? Math.round((x / g) * 100) + "%" : x ? "carried" : ""; };
  const blended = (w: number) => { const g = FC_ROWS.reduce((a, r) => a + (pick(r.gross, e, w) || pick(r.exp, e, w)), 0); return Math.round((inc[w] / Math.max(1, g)) * 100); };

  type TR = { r: FcRow };
  const cols: Col<TR>[] = [
    { k: "l", label: "Component", w: "minmax(0,1.6fr)", render: ({ r }) => (
      <Row gap={8}><Dot c={r.color} /><div style={{ minWidth: 0 }}><div className="fx-strong" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{r.label}</div><div style={{ fontSize: 11, color: "var(--faint)", overflow: "hidden", textOverflow: "ellipsis" }}>{r.detail}</div></div></Row>) },
    ...[0, 1, 2].map(w => ({
      k: "w" + w, label: labels[w], w: "minmax(0,1fr)", align: "right" as const,
      render: ({ r }: TR) => { const x = pick(r.exp, e, w); return x ? <div><div className="fx-strong">{eur(x)}</div><div style={{ fontSize: 11, color: "var(--faint)" }}>{conf(r, w)}{pick(r.gross, e, w) ? " of " + eurK(pick(r.gross, e, w)) : ""}</div></div> : <span className="fx-muted">·</span>; },
    })),
  ];

  return (
    <Page>
      <PageHead title="Cash forecast" sub="Expected cash at 30, 60 and 90 days, and what each number is made of" fx={fx} />
      <div style={grid("repeat(3,minmax(0,1fr))")}>
        {[0, 1, 2].map(w => (
          <Card key={w}>
            <Row><span style={{ fontSize: 11.5, color: "var(--dim)" }}>Expected in {[30, 60, 90][w]} days</span><span className="fx-grow" /><Badge tone="ghost">{ends[w]}</Badge></Row>
            <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-.8px", color: "var(--ink)", marginTop: 6, fontVariantNumeric: "tabular-nums" }}>{eur(cum[w])}</div>
            <Mini>{w === 0 ? "Cumulative from today" : `+${eur(inc[w])} in ${labels[w].toLowerCase()}`} · {blended(w)}% blended confidence</Mini>
            <div style={{ marginTop: 12 }}>
              <Seg height={8} parts={FC_ROWS.map(r => ({ v: pick(r.exp, e, w), c: r.color, title: r.label }))} />
            </div>
            <div style={{ marginTop: 10, display: "grid", gap: 3 }}>
              {FC_ROWS.filter(r => pick(r.exp, e, w)).map(r => (
                <Row key={r.key} gap={7} style={{ fontSize: 11.5 }}>
                  <Dot c={r.color} /><span style={{ color: "var(--dim)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.label}</span>
                  <span className="fx-num" style={{ color: "var(--body)" }}>{eur(pick(r.exp, e, w))}</span>
                </Row>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card pad={false} title="How each window is built" sub="Expected cash, with confidence against the gross amount" style={{ marginBottom: 14 }}>
        <div style={{ height: 12 }} />
        <Table cols={cols} rows={FC_ROWS.map(r => ({ r }))} />
        <div className="fx-tr" style={{ gridTemplateColumns: "minmax(0,1.6fr) repeat(3,minmax(0,1fr))", background: "var(--surface-faint)" }}>
          <span className="fx-strong">Expected in window</span>
          {inc.map((v, i) => <span key={i} className="fx-num fx-strong">{eur(v)}</span>)}
        </div>
      </Card>

      <div style={grid("minmax(0,1fr) minmax(0,1fr)", 14, { marginBottom: 0 })}>
        <Card title="By event" sub="Expected cash landing in each window">
          <BarChart labels={labels} height={160} fmt={n => eurK(n)} series={(e === "all" ? ["ff", "mh"] as const : [e]).map(id => ({
            name: EVENTS[id].name, color: evColor(id), values: [0, 1, 2].map(w => pick(FC_ROWS.reduce((acc, r) => ({ ff: acc.ff.map((v, i) => v + r.exp.ff[i]) as W3, mh: acc.mh.map((v, i) => v + r.exp.mh[i]) as W3 }), { ff: [0, 0, 0] as W3, mh: [0, 0, 0] as W3 }), id, w)),
          }))} />
          {e === "all" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12, marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
              {(["ff", "mh"] as const).map(id => {
                const c90 = [0, 1, 2].reduce((a, w) => a + FC_ROWS.reduce((b, r) => b + r.exp[id][w], 0), 0);
                return <Fig key={id} label={<Row gap={6}><Dot c={evColor(id)} />{EVENTS[id].name}</Row>} value={eur(c90)} sub="Expected within 90 days" />;
              })}
            </div>
          )}
        </Card>
        <Card title="What moves this forecast">
          <div style={{ display: "grid", gap: 8 }}>
            <Note>
              <b style={{ color: "var(--ink)" }}>{eur(notInv)}</b> is contracted but not yet invoiced. {eur(schedIn90)} of it issues inside 90 days; the balances due 1 Feb 2027 land after this window.
            </Note>
            <Note tone="warn">
              Overdue recovery is counted at {eur(overdueRec)} of {eur(k.overdue)}. {eur(k.overdue - overdueRec)} is treated as at risk until paid.{" "}
              <Lnk onClick={() => fx.goTo("Finance", "debtors")}>Open the chase plan</Lnk>
            </Note>
            <div style={{ display: "grid", gap: 0 }}>
              {[
                { ev: "ff" as EventId, h: "Nova Fertility Clinic pays the deposit", d: "Counted at 45% today · paying adds €2,970 to the 30-day figure", go: () => fx.open("invoice", "i-nova-1") },
                { ev: "mh" as EventId, h: "Orbit Health Cover board decision, 9 Oct", d: "€8,400 deposit, counted at 40%", go: () => fx.open("deal", "d-orbit") },
                { ev: "ff" as EventId, h: "European Fertility Network signs", d: "€6,300 deposit, counted at 80%", go: () => fx.open("deal", "d-efn") },
              ].filter(x => inEvent(e, x.ev)).map(x => (
                <div key={x.h} onClick={x.go} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 10, alignItems: "center", padding: "8px 0", borderTop: "1px solid var(--border)", cursor: "pointer" }}>
                  <div style={{ minWidth: 0 }}><div style={{ fontSize: 12.5, color: "var(--ink)" }}>{x.h}</div><Mini>{x.d}</Mini></div>
                  <Icon d={PATHS.arrow} size={13} style={{ color: "var(--faint)" }} />
                </div>
              ))}
            </div>
            <Mini>Canada Pilot is excluded until currency and tax treatment are set.</Mini>
          </div>
        </Card>
      </div>
    </Page>
  );
}

/* ═════════════════════════════════════════════════════════════════════════
   Drawer: invoice
   ═════════════════════════════════════════════════════════════════════════ */
function addDaysLabel(due: string, days: number) {
  const d = parseD(due); d.setDate(d.getDate() + days);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}${d.getFullYear() !== 2026 ? " " + d.getFullYear() : ""}`;
}

function InvoiceDrawer({ fx, id }: DrawerProps) {
  const inv = findInv(id);
  if (!inv) {
    return (
      <Drawer fx={fx} eyebrow="INVOICE" title="Invoice not found">
        <Note>No invoice with reference {id} is in the ledger. It may have been voided in Xero.</Note>
        <div style={{ marginTop: 12 }}><Btn onClick={() => fx.goTo("Finance", "invoices")}>Open all invoices</Btn></div>
      </Drawer>
    );
  }
  const g = groupOf(inv.client);
  const siblings = (g?.invoices || []).filter(i => i.id !== inv.id);
  const s = effStatus(inv, fx);
  const dealId = dealIdOf(inv.client), contractId = contractIdOf(inv.client), exId = exhibitorIdOf(inv.client);
  const seq = seqFor(inv.id, fx);
  const act = DEBT_ACT[inv.id];
  const pay = payForInv(inv.id);
  const isNova = inv.client === NOVA.company;
  const share = inv.kind === "Full" ? 100 : Math.round((inv.amount / inv.deal) * 100);
  const issued = inv.status === "Scheduled"
    ? (inv.kind === "Full" ? "Issues 1 Oct" : `Issues ${addDaysLabel(inv.due, -14)}`)
    : inv.kind === "Balance" && inv.due === "15 Oct 2026" ? "1 Sep 2026" : g?.signed ? shortD(g.signed) + " · on signature" : "On signature";
  const xeroState = s === "Paid" ? "Paid" : s === "Scheduled" ? "Draft, scheduled" : s === "Match pending" ? "Awaiting payment match" : "Authorised, awaiting payment";
  const hubspot = s === "Paid" ? (inv.kind === "Balance" || inv.kind === "Full" ? "Paid in full" : "Deposit paid") : s === "Overdue" ? "Deposit overdue" : s === "Match pending" ? "Payment received, matching" : s === "Open" ? `${inv.kind} invoiced` : "Balance scheduled";

  const lines: [string, number | null][] = inv.kind === "Full" ? [[g?.pkg || "Package", inv.amount]]
    : [[`${inv.kind} (${share}%) · ${g?.pkg || "Package"}`, inv.amount], [`Contract value ${eur(inv.deal)} · ${inv.kind === "Deposit" ? "balance" : "deposit"} on its own invoice`, null]];

  const actions = (
    <>
      {dealId ? <Btn kind="ghost" icon={PATHS.link} onClick={() => fx.open("deal", dealId)}>Open deal</Btn>
        : <Btn kind="ghost" icon={PATHS.link} onClick={() => fx.goTo("Sales", "deals")}>Sales deals</Btn>}
      {inv.id === "i-peak-1" ? <ActBtn fx={fx} k="match-peak" label="Approve match" doneLabel="Matched" toast="Matched €3,750 to Peak Health Labs · FE-2027-0388 marked paid in Xero" />
        : act ? <ActBtn fx={fx} k={act.k} label={act.label} doneLabel={act.done} toast={act.toast} />
        : <ActBtn fx={fx} k={"finance-xero-" + inv.id} kind="ghost" label="Resync with Xero" doneLabel="Resynced" toast={`${inv.no} resynced with Xero · no changes`} />}
    </>
  );

  return (
    <Drawer fx={fx} eyebrow={`INVOICE · ${inv.no}`} title={inv.client} actions={actions}
      badges={<><EventTag id={inv.event} short={false} /><Badge tone="ghost">{inv.kind}{inv.kind !== "Full" ? ` · ${share}%` : ""}</Badge><IBadge inv={inv} fx={fx} />{inv.days ? <Badge tone="bad">{inv.days} days overdue</Badge> : null}</>}>
      <Sec title="INVOICE">
        <KV cols={3} items={[
          ["Amount", eur(inv.amount)], ["Due", inv.due], ["Issued", issued],
          ["Deal value", eur(inv.deal)], ["Terms", g?.terms.replace(/ · /g, ", ") || "Standard"], ["Owner", inv.owner],
        ]} />
      </Sec>

      <Sec title="LINE ITEMS" right={<span style={{ fontSize: 10.5, color: "var(--faint)", letterSpacing: 0, fontWeight: 400 }}>Amounts ex VAT · VAT applied in Xero</span>}>
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          {lines.map(([l, a], i) => (
            <Row key={i} gap={10} style={{ padding: "9px 12px", borderTop: i ? "1px solid var(--border)" : undefined, fontSize: 12.5 }}>
              <span style={{ flex: 1, color: a == null ? "var(--faint)" : "var(--body)" }}>{l}</span>
              {a != null && <span className="fx-num fx-strong">{eur(a)}</span>}
            </Row>
          ))}
          {isNova && (
            <div style={{ padding: "8px 12px 10px", borderTop: "1px solid var(--border)", display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "3px 14px" }}>
              {NOVA.package.map(([k2, v]) => <Mini key={k2}>{k2} · <span style={{ color: "var(--body)" }}>{v}</span></Mini>)}
            </div>
          )}
          <Row gap={10} style={{ padding: "9px 12px", borderTop: "1px solid var(--border)", background: "var(--surface-faint)" }}>
            <span className="fx-strong" style={{ flex: 1, fontSize: 12.5 }}>Total due</span>
            <span className="fx-num fx-strong" style={{ fontSize: 14 }}>{eur(inv.amount)}</span>
          </Row>
        </div>
      </Sec>

      {siblings.length > 0 && (
        <Sec title="SAME DEAL, SPLIT AUTOMATICALLY">
          {siblings.map(sb => (
            <button key={sb.id} className="fx-flow-n" style={{ width: "100%" }} onClick={() => fx.open("invoice", sb.id)}>
              <Row gap={8}>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".1em", color: "var(--accent)" }}>{sb.kind.toUpperCase()} · {Math.round((sb.amount / sb.deal) * 100)}%</span>
                <span className="fx-grow" /><IBadge inv={sb} fx={fx} />
              </Row>
              <Row gap={8} style={{ marginTop: 5 }}>
                <span className="h" style={{ margin: 0 }}>{sb.no}</span>
                <span style={{ fontSize: 11.5, color: "var(--dim)" }}>due {sb.due}</span>
                <span className="fx-grow" /><span className="fx-strong fx-num">{eur(sb.amount)}</span>
              </Row>
            </button>
          ))}
          <Mini style={{ marginTop: 6 }}>{eur(inv.amount)} + {eur(siblings.reduce((a, x) => a + x.amount, 0))} = {eur(inv.deal)} contract value.</Mini>
        </Sec>
      )}

      {seq ? (
        <Sec title="REMINDER SEQUENCE" right={<Badge tone={seq.some(x => x.s === "next") ? "warn" : "ok"}>{seq.some(x => x.s === "next") ? "Active" : "Complete"}</Badge>}>
          <div style={{ display: "grid", gap: 0 }}>
            {[{ s: "done" as SeqState, d: shortD(inv.due), h: "Invoice due", who: "Issued automatically on signature" }, ...seq.map((x, i) => ({ ...x, h: `${SEQ[i].t} · ${SEQ[i].h}`, who: SEQ[i].who }))].map((x, i, arr) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "22px minmax(0,1fr) auto", gap: 10, alignItems: "start", padding: "6px 0", position: "relative" }}>
                {i < arr.length - 1 && <span style={{ position: "absolute", left: 8.5, top: 26, bottom: -6, borderLeft: `1px ${x.s === "done" ? "solid" : "dashed"} var(--border-strong)` }} />}
                <StepDot s={x.s === "done" ? "done" : x.s === "next" ? "pending" : "na"} />
                <div style={{ minWidth: 0 }}><div style={{ fontSize: 12.5, color: x.s === "todo" ? "var(--dim)" : "var(--ink)" }}>{x.h}</div><Mini>{x.who}</Mini></div>
                <span style={{ fontSize: 11.5, color: x.s === "next" ? "var(--warn)" : "var(--faint)", whiteSpace: "nowrap" }}>{x.s === "next" ? "Next · " : ""}{x.d}</span>
              </div>
            ))}
          </div>
          {isNova && <Mini style={{ marginTop: 6 }}>Nova's exhibitor record stays blocked at onboarding until this deposit is paid. The {NOVA.stand} frontage query is being handled separately.</Mini>}
        </Sec>
      ) : (
        <Sec title="PAYMENT">
          {s === "Paid" ? (
            <Note>{pay ? `Received ${pay.date} · ${pay.method} via ${pay.source} · ref ${pay.ref} · ${inv.id === "i-peak-1" ? "match approved" : pay.match}` : OLD_PAID[inv.id] || "Paid · matched in Xero"}</Note>
          ) : s === "Match pending" ? (
            <Note tone="warn">€3,750 landed on 26 Sep with reference {PEAK.paymentRef}. Pulse suggests this invoice at {PEAK.matchConfidence}% confidence and is waiting for approval.</Note>
          ) : s === "Scheduled" ? (
            <Note>Created on signature and held as a draft in Xero. It issues automatically on {inv.kind === "Full" ? "1 Oct" : addDaysLabel(inv.due, -14)}, and the reminder sequence starts the day after it falls due.</Note>
          ) : (
            <Note>Issued and sent. No payment yet; it is not due until {inv.due}. Reminders start the day after.</Note>
          )}
        </Sec>
      )}

      <Sec title="XERO AND HUBSPOT">
        <KV cols={2} items={[
          ["Xero invoice", xeroState], ["Last sync", RECON.lastSync],
          ["HubSpot payment status", hubspot], ["Xero connection", "Token auto-refreshed 09:30"],
        ]} />
      </Sec>

      <Sec title="CONNECTED RECORDS">
        <Flow nodes={[
          { t: "DEAL", h: dealId ? "HubSpot deal" : "Sales deals", d: eur(inv.deal), go: () => dealId ? fx.open("deal", dealId) : fx.goTo("Sales", "deals") },
          ...(contractId ? [{ t: "CONTRACT", h: "Signed contract", d: g?.signed ? shortD(g.signed) : "", go: () => fx.open("contract", contractId) }] : []),
          ...(exId ? [{ t: "EXHIBITOR", h: "Onboarding record", d: EXHIBITORS.find(x => x.id === exId)?.stand ? "Stand " + EXHIBITORS.find(x => x.id === exId)?.stand : "", go: () => fx.goTo("Exhibitors", "onboarding", { kind: "exhibitor", id: exId }) }] : []),
          ...(s === "Overdue" ? [{ t: "DEBTORS", h: "Chase plan", d: `${inv.days} days`, go: () => fx.goTo("Finance", "debtors") }] : []),
          ...(s === "Match pending" ? [{ t: "RECONCILIATION", h: "Match waiting", d: `${PEAK.matchConfidence}%`, go: () => fx.goTo("Finance", "reconciliation") }] : []),
        ]} />
      </Sec>
    </Drawer>
  );
}

export const drawers: Record<string, (p: DrawerProps) => JSX.Element> = {
  invoice: InvoiceDrawer,
};
