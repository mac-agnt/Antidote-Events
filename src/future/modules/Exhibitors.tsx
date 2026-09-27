/* Exhibitors: onboarding, fulfilment, floor plan, assets and readiness for every confirmed exhibitor.

   The 14 story records come from EXHIBITORS in data.ts. The other 73 rows are generated here so the
   totals land exactly on EXHIBITOR_KPIS:
     87 confirmed (49 FF / 38 MH) · 54 fully ready · 23 waiting on client · 10 internal actions
     31 outstanding assets (16 FF / 15 MH) · 66 placed + 10 provisional + 11 unplaced (76% allocated)
   Overdue deposits only ever appear on the five exhibitors Finance lists as overdue. */
import { useState, type CSSProperties, type ReactNode } from "react";
import type { ModuleProps, DrawerProps, Fx } from "../types";
import {
  Page, PageHead, Card, Kpis, Badge, Status, EventTag, Btn, ActBtn, Avatar, Bar, StepDot, Table, Chips,
  Drawer, Sec, KV, Note, Flow, BarChart, Donut, Row, Icon, PATHS, evColor, evSoft, type Col,
} from "../ui";
import {
  EXHIBITORS, EXHIBITOR_KPIS, OBLIGATIONS, OBLIGATION_STATUSES, PEAK, NOVA, INVOICES, DEALS, CONTRACTS, SPEAKERS,
  CANADA, TEAM, INVENTORY, EVENTS, eur, type Step, type EventFilter,
} from "../data";

/* ── Types ─────────────────────────────────────────────────────────────── */
type Ev = "ff" | "mh";
type AssetS = "approved" | "received" | "requested" | "missing" | "na";
type Court = "ready" | "client" | "internal";
type FloorS = "placed" | "provisional" | "unplaced";
type XState = "READY" | "AT RISK" | "BLOCKED";

type XRow = {
  id: string; company: string; event: Ev; stand: string; zone: string; size: string; power: string; lights: string;
  contract: Step; deposit: Step; standDetails: Step; logo: Step; speaker: Step; tickets: Step; floor: Step;
  readiness: number; state: XState; court: Court; blocker: string; floorStatus: FloorS; assets: AssetS[];
  contact: string; owner: string; pkg: string; request?: string; detail: boolean; hasSpeaker: boolean;
  deal?: string; contractId?: string; invoice?: string; speakerId?: string; speakerName?: string;
};

const ASSET_TYPES = ["Logo", "Bio", "Headshot", "Company Description", "Social Handles", "Website URL", "Speaker Details"];
const ASSET_SHORT = ["Logo", "Bio", "Headshot", "Description", "Socials", "Website", "Speaker"];
const SPEAKER_ASSETS = [1, 2, 6];
const LETTER: Record<string, number> = { L: 0, B: 1, H: 2, C: 3, S: 4, W: 5, P: 6 };
const AS: Record<string, AssetS> = { A: "approved", R: "received", Q: "requested", M: "missing", N: "na" };
const parseAssets = (s: string) => s.split("").map(c => AS[c] ?? "approved");
const isOut = (a: AssetS) => a === "missing" || a === "requested";

const PEAK_TOAST = "Reminder sent to Ellen Farrow at Peak Health Labs: logo SVG, speaker headshot";
const NOVA_TOAST = "Nova Fertility Clinic moved to A05 (4m frontage). A07 released. Final placement still waits on the €5,400 deposit.";
const FERRO_TOAST = "Dedicated 32A supply requested for C22 from the RDS electrical team. Ferro Sports Recovery notified.";

const hash = (s: string) => {
  let x = 2166136261;
  for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; }
  return x;
};
const teamBg = (n: string) => TEAM.find(t => t.name === n)?.bg;
const frontOf = (size: string) => parseInt(size, 10) || 3;
const sizeOf = (f: number) => (f >= 6 ? "6m x 3m" : `${f}m x 2m`);
const powerOf = (f: number) => (f >= 6 ? "4 sockets" : f === 4 ? "2 sockets" : "1 socket");
const lightsOf = (f: number) => (f >= 6 ? "4 lights" : f >= 3 ? "2 lights" : "1 light");
const pkgOf = (f: number, spk: boolean) => (f >= 6 ? "Premium stand + workshop" : f === 4 ? (spk ? "Premium stand + speaker" : "Premium stand") : f === 2 ? "Starter stand" : spk ? "Standard stand + speaker" : "Standard stand");
const cap: CSSProperties = { fontSize: 10.5, fontWeight: 600, letterSpacing: ".11em", color: "var(--faint)" };
const readyColor = (v: number) => (v >= 85 ? "var(--ok)" : v >= 55 ? "var(--warn)" : "var(--bad)");
const evKey = (e: EventFilter): "all" | Ev => (e === "ff" || e === "mh" ? e : "all");
const inEv = (e: EventFilter, id: Ev) => e === "all" || e === "ca" || e === id;

/* ── Story records (data.ts) + local overlay ───────────────────────────── */
type Overlay = {
  court: Court; blocker: string; floorStatus: FloorS; assets: string; owner: string;
  deal?: string; contractId?: string; invoice?: string; speakerId?: string; speakerName?: string;
};
const DETAIL: Record<string, Overlay> = {
  "x-peak": { court: "client", blocker: "Logo SVG + speaker headshot", floorStatus: "placed", assets: "MRMAAAR", owner: "Daniel Murray", deal: "d-peak", contractId: "c-peak", invoice: "i-peak-1", speakerId: "s-tierney", speakerName: "Dr Hugh Tierney" },
  "x-nova": { court: "client", blocker: "Deposit 4 days overdue", floorStatus: "provisional", assets: "AAAAAAA", owner: "Kathleen Corr", deal: "d-nova", contractId: "c-nova", invoice: "i-nova-1", speakerId: "s-brennan", speakerName: "Dr Aoife Brennan" },
  "x-clar": { court: "ready", blocker: "", floorStatus: "placed", assets: "AAAAAAA", owner: "Kathleen Corr", deal: "d-clar", contractId: "c-clar", invoice: "i-clar-2" },
  "x-ferro": { court: "ready", blocker: "", floorStatus: "placed", assets: "ANNAAAN", owner: "Daniel Murray", deal: "d-ferro", contractId: "c-ferro", invoice: "i-ferro-1" },
  "x-vel": { court: "ready", blocker: "", floorStatus: "placed", assets: "ANNARAN", owner: "Daniel Murray", deal: "d-vel", contractId: "c-vel", invoice: "i-vel-1" },
  "x-seed": { court: "client", blocker: "Logo SVG + stand spec", floorStatus: "placed", assets: "MNNRRAN", owner: "Kathleen Corr", deal: "d-seed", contractId: "c-seed", invoice: "i-seed-1" },
  "x-vireo": { court: "ready", blocker: "", floorStatus: "placed", assets: "AAAAAAA", owner: "Daniel Murray" },
  "x-emb": { court: "ready", blocker: "", floorStatus: "placed", assets: "ANNAAAN", owner: "Kathleen Corr" },
  "x-bright": { court: "client", blocker: "Deposit 15 days overdue", floorStatus: "provisional", assets: "ARRAAAQ", owner: "Kathleen Corr", invoice: "i-harb-1" },
  "x-oak": { court: "client", blocker: "Deposit 19 days overdue", floorStatus: "placed", assets: "ANNRAAN", owner: "Daniel Murray", invoice: "i-atlas-1" },
  "x-ever": { court: "client", blocker: "Deposit 9 days overdue", floorStatus: "placed", assets: "AARAAAA", owner: "Daniel Murray", invoice: "i-ff-3" },
  "x-summ": { court: "client", blocker: "Deposit 7 days overdue + brand guidelines", floorStatus: "placed", assets: "QAARAAA", owner: "Daniel Murray", invoice: "i-mh-3" },
  "x-kin": { court: "ready", blocker: "", floorStatus: "placed", assets: "ANNAAAN", owner: "Daniel Murray" },
  "x-luna": { court: "internal", blocker: "Floor position", floorStatus: "unplaced", assets: "QNNRRAN", owner: "Kathleen Corr" },
};

const DETAILED: XRow[] = EXHIBITORS.map(x => {
  const d: Overlay = DETAIL[x.id] ?? { court: x.state === "READY" ? "ready" : "client", blocker: (x.missing || []).join(" + "), floorStatus: x.stand ? "placed" : "unplaced", assets: "AAAAAAA", owner: "Robyn Walsh" };
  const assets = parseAssets(d.assets);
  return {
    id: x.id, company: x.company, event: x.event === "mh" ? "mh" : "ff", stand: x.stand, zone: x.zone, size: x.size, power: x.power, lights: x.lights,
    contract: x.contract, deposit: x.deposit, standDetails: x.standDetails, logo: x.logo, speaker: x.speaker, tickets: x.tickets, floor: x.floor,
    readiness: x.readiness, state: x.state, court: d.court, blocker: d.blocker, floorStatus: d.floorStatus, assets,
    contact: x.contact, owner: d.owner, pkg: x.pkg, request: x.request, detail: true, hasSpeaker: assets[2] !== "na",
    deal: d.deal, contractId: d.contractId, invoice: d.invoice, speakerId: d.speakerId, speakerName: d.speakerName,
  };
});

/* ── Generated lighter rows ────────────────────────────────────────────── */
const FIRST = ["Aisling", "Ciarán", "Niamh", "Eoin", "Sorcha", "Declan", "Róisín", "Fergal", "Gráinne", "Cathal", "Deirdre", "Tadhg", "Orlaith", "Pádraig", "Clodagh", "Rory", "Muireann", "Darragh", "Shauna", "Colm"];
const LAST = ["Nolan", "Brady", "Keogh", "Duffy", "Moran", "Healy", "Fitzgerald", "Lynch", "Kavanagh", "Daly", "Quinn", "Foley", "Mulligan", "Tobin", "Hennessy", "Madden", "Carroll", "Egan", "Power", "Cullen"];
const ROLES = ["Marketing Manager", "Practice Manager", "Founder", "Operations Lead", "Brand Manager", "Partnerships Lead", "Clinic Director", "Events Coordinator"];
const contactOf = (hv: number) => `${FIRST[hv % 20]} ${LAST[(hv >>> 5) % 20]} · ${ROLES[(hv >>> 9) % 8]}`;

/* [company, event, state, court, blocker, floor, stand, frontage m, readiness, outstanding assets, speaker, request] */
type NR = [string, Ev, XState, Court, string, FloorS, string, number, number, string, boolean, string?];
const NON_READY: NR[] = [
  ["Halcyon Fertility Partners", "ff", "BLOCKED", "client", "PO number needed before deposit invoice", "provisional", "A09", 4, 44, "C", false],
  ["Willow & Oak Midwifery", "ff", "BLOCKED", "client", "Claims review: stand copy resubmission", "provisional", "B11", 3, 49, "LS", false],
  ["Aurora Reproductive Health", "ff", "AT RISK", "client", "Logo SVG missing", "placed", "B02", 4, 74, "L", true],
  ["Kindred Doula Collective", "ff", "AT RISK", "client", "Speaker headshot + bio", "placed", "D02", 3, 70, "HB", true],
  ["Fernhill Acupuncture", "ff", "AT RISK", "client", "Stand spec outstanding", "unplaced", "", 3, 61, "W", false, "Corner position if possible"],
  ["Cradle Genomics", "ff", "AT RISK", "client", "Company description", "placed", "C04", 4, 76, "C", false],
  ["Solace Perinatal Therapy", "ff", "AT RISK", "client", "Speaker details + logo", "unplaced", "", 3, 58, "PL", true],
  ["Blossom Nutrition Studio", "ff", "AT RISK", "client", "Social handles", "unplaced", "", 2, 63, "S", false],
  ["Meridian Fertility Diagnostics", "ff", "AT RISK", "internal", "Floor position (6m frontage)", "unplaced", "", 6, 68, "", true, "Needs 6m frontage for a scanning pod"],
  ["Hearth Pregnancy Yoga", "ff", "AT RISK", "internal", "Electrical sign-off", "provisional", "D06", 3, 72, "W", false],
  ["Northlight Egg Bank", "ff", "AT RISK", "internal", "Floor position", "unplaced", "", 4, 66, "C", false, "Not beside another egg-freezing clinic"],
  ["Tandem Surrogacy Advisers", "ff", "AT RISK", "internal", "Ticket allocation", "placed", "C11", 3, 79, "", false],
  ["Granite Performance Clinic", "mh", "BLOCKED", "client", "Deposit due 30 Sep · placement on hold", "provisional", "C03", 4, 46, "L", false],
  ["Ironbark Supplements", "mh", "BLOCKED", "client", "Claims review: supplement copy rejected", "provisional", "D10", 3, 50, "C", false],
  ["Keel Men's Therapy", "mh", "BLOCKED", "client", "Contract addendum unsigned (stand upgrade)", "provisional", "B09", 3, 42, "SW", false],
  ["Stride Orthotics", "mh", "AT RISK", "client", "Logo SVG missing", "placed", "C18", 3, 73, "L", false],
  ["Apex Testosterone Clinic", "mh", "AT RISK", "client", "Speaker headshot", "placed", "B07", 4, 71, "H", true],
  ["Brawn & Brain Nutrition", "mh", "AT RISK", "client", "Stand spec outstanding", "unplaced", "", 3, 60, "", false, "Needs a sampling counter"],
  ["Tidewater Hair Clinic", "mh", "AT RISK", "client", "Company description + socials", "unplaced", "", 3, 64, "CS", false],
  ["Forge Cardio Screening", "mh", "AT RISK", "client", "Speaker details + bio", "provisional", "A10", 4, 69, "PB", true],
  ["Northwall Sleep Lab", "mh", "AT RISK", "internal", "Floor position", "unplaced", "", 3, 67, "", false, "Quiet area for sleep demos"],
  ["Ridgeline Physio", "mh", "AT RISK", "internal", "Electrical: 16A circuit check", "provisional", "C20", 3, 75, "W", false],
  ["Vantage Eye Health", "mh", "AT RISK", "internal", "Floor position", "unplaced", "", 3, 65, "L", false],
  ["Harbourline Men's Pharmacy", "mh", "AT RISK", "internal", "Ticket allocation", "placed", "D12", 3, 78, "", false],
  ["Kestrel Mobility", "mh", "AT RISK", "internal", "Floor position", "unplaced", "", 2, 62, "", false],
];

const stepOfAsset = (s: AssetS): Step => (s === "na" ? "na" : s === "missing" ? "missing" : s === "requested" ? "pending" : "done");
const speakerStep = (a: AssetS[]): Step => {
  const s = SPEAKER_ASSETS.map(j => a[j]);
  if (s.every(x => x === "na")) return "na";
  if (s.includes("missing")) return "missing";
  if (s.includes("requested")) return "pending";
  return "done";
};
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const GEN_NR: XRow[] = NON_READY.map(([company, event, state, court, blocker, floorStatus, stand, front, readiness, out, spk, request]) => {
  const hv = hash(company);
  const assets: AssetS[] = ASSET_TYPES.map((_, j) => (!spk && SPEAKER_ASSETS.includes(j) ? "na" : (hv >>> j) & 1 ? "received" : "approved"));
  out.split("").forEach((c, k) => { assets[LETTER[c]] = (hv + k) % 2 ? "requested" : "missing"; });
  return {
    id: "x-" + slug(company), company, event, stand, zone: stand ? stand[0] : "", size: sizeOf(front), power: powerOf(front), lights: lightsOf(front),
    contract: "done", deposit: /PO number|Deposit due/.test(blocker) ? "pending" : "done", standDetails: /Stand spec|Electrical/.test(blocker) ? "pending" : "done",
    logo: stepOfAsset(assets[0]), speaker: speakerStep(assets), tickets: state === "BLOCKED" || /Ticket/.test(blocker) ? "pending" : "done",
    floor: floorStatus === "placed" ? "done" : floorStatus === "provisional" ? "pending" : "missing",
    readiness, state, court, blocker, floorStatus, assets, contact: contactOf(hv), owner: event === "ff" ? "Kathleen Corr" : "Daniel Murray",
    pkg: pkgOf(front, spk), request, detail: false, hasSpeaker: spk,
  };
});

/* ── Floor plan layout (RDS hall, four zones, 92 stands) ───────────────── */
type Z = "A" | "B" | "C" | "D";
const ZONE_SPEC: Record<Z, string> = {
  A: "01:3 02:6 03:6 04:3 05:4|06:3 07:3 08:3 09:4 10:4 11:4|12:3 13:3 14:4 15:3 16:3 17:2 18:3|19:4 20:3 21:3 22:2 23:3",
  B: "01:3 02:4 03:4 04:3 05:3 06:4|07:4 08:3 09:3 10:3 11:3 12:3|13:3 14:4 15:3 16:3 17:4 18:3|19:3 20:3 21:2 22:3 23:4",
  C: "01:3 02:3 03:4 04:4 05:3 06:3|07:3 08:3 09:3 10:4 11:3 12:3|13:3 14:3 15:3 16:4 17:3 18:3|19:3 20:3 21:2 22:3 23:4",
  D: "01:3 02:3 03:4 04:3 05:3 06:3|07:3 08:3 09:2 10:3 11:3 12:3|13:3 14:4 15:3 16:3 17:2 18:3|19:3 20:3 21:2 22:4 23:3",
};
const ZONE_NAME: Record<Z, string> = { A: "Stage left", B: "Stage right", C: "Bar side, west", D: "Bar side, east" };
type StandDef = { code: string; zone: Z; row: number; front: number };
const LAYOUT: Record<Z, StandDef[][]> = { A: [], B: [], C: [], D: [] };
(Object.keys(ZONE_SPEC) as Z[]).forEach(z => {
  LAYOUT[z] = ZONE_SPEC[z].split("|").map((row, ri) => row.split(" ").map(t => {
    const [n, f] = t.split(":");
    return { code: z + n, zone: z, row: ri + 1, front: Number(f) };
  }));
});
const ALL_STANDS: StandDef[] = (Object.keys(LAYOUT) as Z[]).flatMap(z => LAYOUT[z].flat());
const AVAILABLE = new Set(["A05", "A17", "A20", "A22", "B10", "B19", "B21", "B23", "C07", "C13", "C21", "C23", "D09", "D17", "D21", "D23"]);

const READY_FF = ["Rowan Fertility Clinic", "Beacon IVF Dublin", "Liffey Women's Health", "Oriel Reproductive Care", "Sona Fertility Nutrition", "Caim Pregnancy Wellness",
  "Tiny Steps Doula Care", "Glenveagh Genetics", "Fennel & Flax Nutrition", "Moonrise Cycle Tracking", "Ardan Hormone Testing", "Hazel Pelvic Physio",
  "Clearwater Surrogacy Law", "Linden Embryology Lab", "Merrion Fertility Counselling", "Quay Street Acupuncture", "Wren Baby Planning", "Silverbirch Egg Freezing",
  "Harmony Fertility Yoga", "Cygnet Prenatal Scans", "Aspen Fertility Finance", "Riverstone Wellness", "Brightwater Women's Clinic", "Sable Skin & Hormones",
  "Tallow Natural Fertility", "Iris Reproductive Psychology", "Oakridge Home Testing", "Primrose Postnatal", "Cove Fertility Coaching", "Elm Park Pharmacy"];
const READY_MH = ["Bastion Strength Lab", "Corrib Men's Clinic", "Titan Recovery Rooms", "Helm Mental Fitness", "Anvil Protein Co.", "Coastline Cold Therapy",
  "Vector Sports Science", "Ballast Bloodwork", "Pinnacle Hair Restoration", "Steadfast Physio", "Thrive Men's Pharmacy", "Marlin Swim Performance",
  "Oakmoor Urology", "Clearpath Vasectomy Clinic", "Grit Endurance Coaching", "Kinsale Sleep Co.", "Keystone Heart Screening", "Redline Mobility"];

const RESERVED = new Set([...DETAILED, ...GEN_NR].map(r => r.stand).filter(Boolean));
const FREE_CODES = ALL_STANDS.filter(s => !RESERVED.has(s.code) && !AVAILABLE.has(s.code));
let fi = 0, mi = 0;
const GEN_READY: XRow[] = FREE_CODES.map((s, i) => {
  const isFF = Math.floor(((i + 1) * READY_FF.length) / FREE_CODES.length) > Math.floor((i * READY_FF.length) / FREE_CODES.length);
  const company = isFF ? READY_FF[fi++] ?? `Fertility exhibitor ${i}` : READY_MH[mi++] ?? `Men's Health exhibitor ${i}`;
  const hv = hash(company);
  const spk = hv % 4 === 0;
  const assets: AssetS[] = ASSET_TYPES.map((_, j) => (!spk && SPEAKER_ASSETS.includes(j) ? "na" : ((hv >>> (j * 2)) & 3) === 0 ? "received" : "approved"));
  return {
    id: "x-" + slug(company), company, event: isFF ? "ff" : "mh", stand: s.code, zone: s.zone, size: sizeOf(s.front), power: powerOf(s.front), lights: lightsOf(s.front),
    contract: "done", deposit: "done", standDetails: "done", logo: "done", speaker: spk ? "done" : "na", tickets: "done", floor: "done",
    readiness: 100 - (hv % 15), state: "READY", court: "ready", blocker: "", floorStatus: "placed", assets, contact: contactOf(hv),
    owner: isFF ? "Kathleen Corr" : "Daniel Murray", pkg: pkgOf(s.front, spk), detail: false, hasSpeaker: spk,
  };
});

/** Every confirmed exhibitor: 14 story records + 73 generated rows = 87. */
export const EXHIBITOR_ROWS: XRow[] = [...DETAILED, ...GEN_NR, ...GEN_READY];
const ROWS = EXHIBITOR_ROWS;
const rowById = (id: string) => ROWS.find(r => r.id === id);

/* ── Live state helpers (shared action keys + local floor holds) ──────── */
const HOLDS: Record<string, string> = {};          // exhibitor id → held stand code (provisional)
const OBL_MOVES: Record<string, number> = {};      // exhibitor|obligation → status index
const novaMoved = (fx: Fx) => !!fx.acted["resolve-nova-frontage"];
const standOf = (r: XRow, fx: Fx) => (r.id === "x-nova" && novaMoved(fx) ? "A05" : HOLDS[r.id] || r.stand);
const zoneOfCode = (c: string) => (c ? c[0] : "");
const floorOf = (r: XRow): FloorS => (HOLDS[r.id] ? "provisional" : r.floorStatus);
const floorStep = (r: XRow): Step => { const f = floorOf(r); return f === "placed" ? "done" : f === "provisional" ? "pending" : "missing"; };
const assetsOf = (r: XRow, fx: Fx): AssetS[] => (r.id === "x-peak" && fx.acted["remind-peak"] ? r.assets.map(a => (a === "missing" ? "requested" : a)) : r.assets);
const outCount = (r: XRow, fx: Fx) => assetsOf(r, fx).filter(isOut).length;
const remindKey = (id: string) => (id === "x-peak" ? "remind-peak" : "exhibitors-remind-" + id);
const remindToast = (r: XRow, fx: Fx) => {
  if (r.id === "x-peak") return PEAK_TOAST;
  const a = assetsOf(r, fx);
  const items = ASSET_TYPES.filter((_, j) => isOut(a[j])).map(t => t.toLowerCase());
  const what = items.length ? items.join(", ") : r.blocker.toLowerCase() || "onboarding checklist";
  return `Reminder sent to ${r.contact.split(" · ")[0]} at ${r.company}: ${what}`;
};

type StandSt = "confirmed" | "provisional" | "conflict" | "available";
type Stand = StandDef & { occ?: XRow; status: StandSt };
function floorModel(fx: Fx): Map<string, Stand> {
  const byCode = new Map<string, XRow>();
  ROWS.forEach(r => { const c = standOf(r, fx); if (c) byCode.set(c, r); });
  const m = new Map<string, Stand>();
  ALL_STANDS.forEach(s => {
    const occ = byCode.get(s.code);
    let status: StandSt = "available";
    if (occ) {
      const conflict = (s.code === "A07" && occ.id === "x-nova") || (s.code === "C22" && occ.id === "x-ferro" && !fx.acted["exhibitors-ferro-power"]);
      status = conflict ? "conflict" : floorOf(occ) === "provisional" ? "provisional" : "confirmed";
    }
    m.set(s.code, { ...s, occ, status });
  });
  return m;
}
function freeStandFor(fx: Fx, front: number): string | null {
  const m = floorModel(fx);
  const free = ALL_STANDS.filter(s => m.get(s.code)?.status === "available" && s.code !== "A05");
  return (free.find(s => s.front === front) ?? free.find(s => s.front > front))?.code ?? null;
}
function holdStand(fx: Fx, r: XRow, code?: string | null) {
  const c = code ?? freeStandFor(fx, frontOf(r.size));
  if (!c) {
    fx.act("exhibitors-reshuffle-" + r.id, `No free ${frontOf(r.size)}m frontage stand. ${r.company} added to Robyn Walsh's reshuffle list for the 30 Oct floor-plan lock.`);
    return;
  }
  HOLDS[r.id] = c;
  fx.toast(`${r.company} held on ${c} (${r.size}), provisional until confirmed`);
}

/* ── Small shared pieces ───────────────────────────────────────────────── */
function EvDot({ e, size = 7 }: { e: Ev; size?: number }) {
  return <span className="fx-dot" style={{ background: evColor(e), width: size, height: size }} />;
}
function Cell({ s, t }: { s: Step; t: ReactNode }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, minWidth: 0, maxWidth: "100%" }}>
      <StepDot s={s} />
      <span style={{ fontSize: 11.5, color: s === "missing" ? "var(--bad)" : s === "na" ? "var(--faint)" : "var(--body)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t}</span>
    </span>
  );
}
function ReadyBar({ v, w }: { v: number; w?: number }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 8, width: w }}>
      <Bar value={v} color={readyColor(v)} height={5} />
      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", fontVariantNumeric: "tabular-nums", minWidth: 32, textAlign: "right" }}>{v}%</span>
    </span>
  );
}
function courtText(r: XRow) {
  if (r.court === "ready") return "Fully ready";
  return (r.court === "client" ? "Waiting on client · " : "Internal · ") + r.blocker;
}
function AssetDot({ s }: { s: AssetS }) {
  const map: Record<AssetS, [string, string, string, string]> = {
    approved: [PATHS.check, "var(--ok-soft)", "var(--ok)", "Approved"],
    received: [PATHS.check, "transparent", "var(--ok)", "Received, awaiting approval"],
    requested: [PATHS.clock, "var(--warn-soft)", "var(--warn)", "Requested"],
    missing: [PATHS.close, "var(--bad-soft)", "var(--bad)", "Missing"],
    na: ["M7 12h10", "var(--track)", "var(--faint)", "Not needed"],
  };
  const [d, bg, c, t] = map[s];
  return (
    <span title={t} style={{ width: 20, height: 20, borderRadius: 6, display: "inline-flex", alignItems: "center", justifyContent: "center", background: bg, color: c,
      border: s === "received" ? "1px solid var(--ok)" : "1px solid transparent", flex: "none" }}>
      <Icon d={d} size={11} sw={2.4} />
    </span>
  );
}
const assetLabel = (s: AssetS, peakReminded = false) =>
  s === "approved" ? "Approved" : s === "received" ? "Received" : s === "requested" ? (peakReminded ? "Requested · reminder sent" : "Requested") : s === "missing" ? "Missing" : "Not needed";

function Monogram({ name, size = 48, missing }: { name: string; size?: number; missing?: boolean }) {
  const hv = hash(name);
  const initials = name.replace(/&/g, "").split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase();
  if (missing) {
    return (
      <span style={{ width: size, height: size, borderRadius: 12, border: "1.5px dashed var(--bad)", color: "var(--bad)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, letterSpacing: ".06em", flex: "none" }}>SVG</span>
    );
  }
  const v = hv % 4;
  const st: CSSProperties = v === 0 ? { borderRadius: 12, fontWeight: 700, letterSpacing: "-.5px" }
    : v === 1 ? { borderRadius: 999, fontStyle: "italic", fontWeight: 400 }
    : v === 2 ? { borderRadius: 8, fontWeight: 300, letterSpacing: ".14em", textTransform: "lowercase" }
    : { borderRadius: 16, fontWeight: 600, letterSpacing: ".04em" };
  return (
    <span style={{ width: size, height: size, flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", background: v % 2 ? "var(--surface-2)" : "var(--track)",
      border: "1px solid var(--border-strong)", color: "var(--ink)", fontSize: size * 0.34, ...st }}>{initials}</span>
  );
}
function Headshot({ name, size = 48, missing }: { name: string; size?: number; missing?: boolean }) {
  const initials = name.replace(/^Dr /, "").split(" ").map(w => w[0]).slice(0, 2).join("");
  return (
    <span style={{ width: size, height: size, borderRadius: 999, flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center",
      background: missing ? "none" : "radial-gradient(circle at 35% 30%, var(--surface-2), var(--track))",
      border: missing ? "1.5px dashed var(--bad)" : "1px solid var(--border-strong)", color: missing ? "var(--bad)" : "var(--body)", fontSize: missing ? 10 : size * 0.32, fontWeight: 600 }}>
      {missing ? <Icon d={PATHS.users} size={16} /> : initials}
    </span>
  );
}

/* ── Canada Pilot: planning view for every tab ─────────────────────────── */
const CA_WORKFLOWS = ["Onboarding sequence", "Deposit reminders", "Asset collection portal", "Stand specification form", "Ticket allocation", "Floor-plan holds", "Fulfilment checklist", "Pre-event exhibitor pack"];
function CanadaView({ fx, title }: { fx: Fx; title: string }) {
  const relevant = CANADA.decisions.filter(([k]) => ["Currency", "Tax treatment", "Local exhibitor terms", "Payment provider", "Venue"].includes(k));
  return (
    <Page>
      <PageHead title={title} sub="Canada Pilot has no exhibitors yet. The Dublin exhibitor setup is cloned and ready." fx={fx} />
      <div className="fx-grid" style={{ gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr) minmax(0,1fr)" }}>
        <Card title="Exhibitor workflows cloned" sub={`from ${CANADA.template}`} right={<Badge tone="ok">8 / 8</Badge>}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 8 }}>
            {CA_WORKFLOWS.map(w => (
              <Row key={w} gap={8} style={{ padding: "8px 10px", border: "1px solid var(--border)", borderRadius: 10 }}>
                <StepDot s="done" /><span style={{ fontSize: 12, color: "var(--body)" }}>{w}</span>
              </Row>
            ))}
          </div>
        </Card>
        <Card title="Decisions before exhibitor sales open" right={<Badge tone="ca">PLANNING</Badge>}>
          {relevant.map(([k, v]) => (
            <Row key={k} style={{ padding: "7px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 12.5, color: "var(--body)" }} className="fx-grow">{k}</span><Status s={v} />
            </Row>
          ))}
          <div style={{ marginTop: 12 }}>
            <ActBtn fx={fx} k="canada-decisions" size="sm" label="Send decisions to Nikki" doneLabel="Sent to Nikki" toast="Localisation decisions sent to Nikki for review" />
          </div>
        </Card>
        <Card title="Live on day one">
          <div style={{ display: "grid", gap: 10, fontSize: 12.5, color: "var(--body)", lineHeight: 1.5 }}>
            <div><b style={{ color: "var(--ink)" }}>Onboarding and assets:</b> portal, reminders and readiness scoring switch on with the first signed deal.</div>
            <div><b style={{ color: "var(--ink)" }}>Floor plan:</b> waits on the venue decision (Venue TBD). Zones and stand sizes copy from RDS once a hall is chosen.</div>
            <div><b style={{ color: "var(--ink)" }}>Stand pricing:</b> needs currency and tax treatment first.</div>
          </div>
          <div style={{ marginTop: 12 }}><Btn size="sm" icon={PATHS.arrow} onClick={() => fx.goTo("Events", "portfolio")}>Open Events · Portfolio</Btn></div>
        </Card>
      </div>
    </Page>
  );
}

/* ═════════════════════════════ OVERVIEW ═════════════════════════════════ */
type Blocker = { label: string; detail: string; n: number; go: () => void; icon: string };
function Overview({ fx }: { fx: Fx }) {
  const ek = evKey(fx.event);
  const k = EXHIBITOR_KPIS[ek];
  const rows = ROWS.filter(r => inEv(fx.event, r.event));
  const withAssets = rows.filter(r => outCount(r, fx) > 0).length;
  const funnelColor = ek === "all" ? "var(--accent)" : evColor(ek);

  const stages: [string, number][] = [
    ["Deposit paid", rows.filter(r => r.deposit === "done").length],
    ["Stand details confirmed", rows.filter(r => r.standDetails === "done").length],
    ["Tickets issued", rows.filter(r => r.tickets === "done").length],
    ["Floor position confirmed", rows.filter(r => floorOf(r) === "placed").length],
    ["Marketing assets complete", rows.filter(r => outCount(r, fx) === 0).length],
  ];
  stages.sort((a, b) => b[1] - a[1]);
  const funnel: [string, number][] = [["Contract signed", rows.length], ...stages, ["Fully ready", k.ready]];

  const overdue = rows.filter(r => r.deposit === "missing");
  const overdueValue = overdue.reduce((a, r) => a + (INVOICES.find(i => i.id === r.invoice)?.amount || 0), 0);
  const conflicts = [...floorModel(fx).values()].filter(s => s.status === "conflict" && s.occ && inEv(fx.event, s.occ.event)).length;
  const blockers: Blocker[] = [
    { label: "Marketing assets outstanding", detail: `${k.assets} assets across ${withAssets} exhibitors`, n: withAssets, go: () => fx.goTo("Exhibitors", "assets"), icon: PATHS.doc },
    { label: "No confirmed floor position", detail: `${rows.filter(r => floorOf(r) === "unplaced").length} unplaced · ${rows.filter(r => floorOf(r) === "provisional").length} provisional`, n: rows.filter(r => floorOf(r) !== "placed").length, go: () => fx.goTo("Exhibitors", "floorplan"), icon: PATHS.stand },
    { label: "Tickets on hold", detail: "Held for deposit, paperwork or allocation", n: rows.filter(r => r.tickets !== "done").length, go: () => fx.goTo("Exhibitors", "fulfilment"), icon: PATHS.users },
    { label: "Deposit overdue", detail: `${eur(overdueValue)} · blocks tickets and final placement`, n: overdue.length, go: () => fx.goTo("Finance", "debtors"), icon: PATHS.euro },
    { label: "Stand spec or electrics pending", detail: "Build forms not returned or signed off", n: rows.filter(r => r.standDetails !== "done").length, go: () => fx.goTo("Exhibitors", "onboarding"), icon: PATHS.doc },
    { label: "Paperwork and claims review", detail: "PO numbers, addenda, medical claims copy", n: rows.filter(r => /PO number|Claims|addendum/.test(r.blocker)).length, go: () => fx.goTo("Exhibitors", "readiness"), icon: PATHS.alert },
    { label: "Floor-plan conflicts", detail: "Frontage and power clashes", n: conflicts, go: () => fx.goTo("Exhibitors", "floorplan"), icon: PATHS.alert },
  ].filter(b => b.n > 0).sort((a, b) => b.n - a.n);
  const maxB = Math.max(1, ...blockers.map(b => b.n));

  type TodayItem = { id: string; issue: string; owner: string; act: ReactNode };
  const today: TodayItem[] = [
    { id: "x-peak", issue: "Logo SVG and speaker headshot outstanding · 78% ready", owner: "Daniel Murray",
      act: <ActBtn fx={fx} k="remind-peak" size="sm" label="Send reminder" doneLabel="Reminder sent" toast={PEAK_TOAST} /> },
    { id: "x-nova", issue: "€5,400 deposit 4 days overdue · 4m frontage conflict on A07", owner: "Kathleen Corr",
      act: <ActBtn fx={fx} k="chase-nova" size="sm" label="Chase deposit" doneLabel="Chase sent" toast="Deposit chase sent to Nova Fertility Clinic for €5,400 (FE-2027-0412)" /> },
    { id: "x-bright", issue: "€4,380 deposit 15 days overdue · three reminders sent", owner: "Kathleen Corr",
      act: <ActBtn fx={fx} k="exhibitors-escalate-bright" size="sm" kind="ghost" label="Escalate to Nikki" doneLabel="Escalated" toast="Bright Path Fertility escalated to Nikki Dwyer with the payment history attached" /> },
    { id: "x-oak", issue: "€3,150 deposit 19 days overdue · owner call due today", owner: "Daniel Murray",
      act: <ActBtn fx={fx} k="exhibitors-call-oak" size="sm" kind="ghost" label="Log call" doneLabel="Call logged" toast="Call with Liam Carty at Oakline Nutrition logged. Payment promised by Wed 30 Sep." /> },
    { id: "x-summ", issue: "€5,450 deposit 7 days overdue · brand guidelines not in", owner: "Daniel Murray",
      act: <ActBtn fx={fx} k="exhibitors-remind-x-summ" size="sm" kind="ghost" label="Send reminder" doneLabel="Reminder sent" toast="Reminder sent to Paul Renner at Summit Men's Clinic: deposit €5,450, brand guidelines" /> },
    { id: "x-seed", issue: "Logo SVG missing · stand spec form not returned", owner: "Kathleen Corr",
      act: <ActBtn fx={fx} k="exhibitors-remind-x-seed" size="sm" kind="ghost" label="Send reminder" doneLabel="Reminder sent" toast="Reminder sent to Hannah Boyle at Seed & Stem Supplements: logo SVG, stand spec form" /> },
    { id: "x-luna", issue: "Signed and paid, still no floor position", owner: "Robyn Walsh",
      act: <Btn size="sm" kind="ghost" icon={PATHS.stand} onClick={() => fx.goTo("Exhibitors", "floorplan")}>Place</Btn> },
  ];
  const todayRows = today.map(t => ({ ...t, r: rowById(t.id) })).filter(t => t.r && inEv(fx.event, t.r.event));

  return (
    <Page>
      <PageHead title="Exhibitor overview" sub="Every confirmed exhibitor for Dublin 2027, from signed deal to build day." fx={fx} />
      <Kpis items={[
        { label: "Confirmed exhibitors", value: k.confirmed, sub: ek === "all" ? "49 Fertility · 38 Men's Health" : EVENTS[ek].name, onClick: () => fx.goTo("Exhibitors", "onboarding") },
        { label: "Fully ready", value: k.ready, sub: `${Math.round((k.ready / k.confirmed) * 100)}% of confirmed`, tone: "ok", onClick: () => fx.goTo("Exhibitors", "readiness") },
        { label: "Waiting on client", value: k.waiting, sub: "Assets, deposits, specs", tone: "warn", onClick: () => fx.goTo("Exhibitors", "onboarding") },
        { label: "Internal actions", value: k.internal, sub: "Floor, electrics, tickets", onClick: () => fx.goTo("Exhibitors", "fulfilment") },
        { label: "Outstanding assets", value: k.assets, sub: `across ${withAssets} exhibitors`, tone: "bad", onClick: () => fx.goTo("Exhibitors", "assets") },
        { label: "Floor plan allocated", value: k.floor + "%", sub: `${k.placed} placed · ${k.unplaced} unplaced`, onClick: () => fx.goTo("Exhibitors", "floorplan") },
      ]} />

      <Note tone="accent">
        <Row gap={10} style={{ alignItems: "flex-start" }}>
          <Icon d={PATHS.spark} size={15} style={{ color: "var(--accent)", marginTop: 2 }} />
          <span>Overnight Pulse sent 11 exhibitor reminders, updated 4 fulfilment records and flagged 2 floor-plan conflicts.
            {" "}{k.waiting} exhibitors are waiting on the client and {k.internal} are waiting on us. Peak Health Labs is two assets from ready.</span>
        </Row>
      </Note>

      <div className="fx-grid" style={{ gridTemplateColumns: "minmax(0,1.25fr) minmax(0,1fr)", marginTop: 14 }}>
        <Card title="Readiness by event" sub="Click an event to filter">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12 }}>
            {(["ff", "mh"] as Ev[]).map(e => {
              const er = ROWS.filter(r => r.event === e);
              const kk = EXHIBITOR_KPIS[e];
              const n = (s: XState) => er.filter(r => r.state === s).length;
              const avg = Math.round(er.reduce((a, r) => a + r.readiness, 0) / er.length);
              const dim = ek !== "all" && ek !== e;
              return (
                <button key={e} onClick={() => fx.setEvent(fx.event === e ? "all" : e)}
                  style={{ textAlign: "left", font: "inherit", color: "inherit", cursor: "pointer", padding: 14, borderRadius: 16, background: ek === e ? evSoft(e) : "var(--surface-faint)",
                    border: `1px solid ${ek === e ? evColor(e) : "var(--border)"}`, opacity: dim ? 0.45 : 1, transition: "opacity .2s, border-color .2s", minWidth: 0 }}>
                  <Row gap={8}><EvDot e={e} /><span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)" }}>{EVENTS[e].name}</span></Row>
                  <Row gap={14} style={{ marginTop: 12, alignItems: "center" }}>
                    <Donut size={92} thickness={11} segments={[
                      { label: "Ready", value: n("READY"), color: "var(--ok)" },
                      { label: "At risk", value: n("AT RISK"), color: "var(--warn)" },
                      { label: "Blocked", value: n("BLOCKED"), color: "var(--bad)" },
                    ]} center={<><span style={{ fontSize: 18, fontWeight: 600, color: "var(--ink)" }}>{avg}%</span><span style={{ fontSize: 9.5, color: "var(--faint)" }}>avg score</span></>} />
                    <div style={{ display: "grid", gap: 5, minWidth: 0, flex: 1 }}>
                      {([["Ready", n("READY"), "var(--ok)"], ["At risk", n("AT RISK"), "var(--warn)"], ["Blocked", n("BLOCKED"), "var(--bad)"]] as [string, number, string][]).map(([l, v, c]) => (
                        <Row key={l} gap={7}><span style={{ width: 7, height: 7, borderRadius: 2, background: c }} /><span style={{ fontSize: 12, color: "var(--dim)" }} className="fx-grow">{l}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{v}</span></Row>
                      ))}
                    </div>
                  </Row>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8, marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                    <div><div style={{ fontSize: 10.5, color: "var(--faint)" }}>Confirmed</div><div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{kk.confirmed}</div></div>
                    <div><div style={{ fontSize: 10.5, color: "var(--faint)" }}>Assets due</div><div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{kk.assets}</div></div>
                    <div><div style={{ fontSize: 10.5, color: "var(--faint)" }}>Allocated</div><div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{kk.floor}%</div></div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card title="Onboarding funnel" sub={`${rows.length} signed exhibitors`}>
          <div style={{ display: "grid", gap: 7 }}>
            {funnel.map(([l, v], i) => (
              <div key={l} style={{ display: "grid", gridTemplateColumns: "minmax(0,150px) minmax(0,1fr) 64px", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: i === funnel.length - 1 ? "var(--ink)" : "var(--body)", fontWeight: i === funnel.length - 1 ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l}</span>
                <span style={{ position: "relative", height: 20, borderRadius: 6, background: "var(--track)", overflow: "hidden" }}>
                  <i style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(v / Math.max(1, rows.length)) * 100}%`, background: funnelColor, opacity: 0.35 + 0.65 * (v / Math.max(1, rows.length)), borderRadius: 6 }} />
                </span>
                <span style={{ fontSize: 12, color: "var(--ink)", fontWeight: 600, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{v}<span style={{ color: "var(--faint)", fontWeight: 400 }}> · {Math.round((v / Math.max(1, rows.length)) * 100)}%</span></span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="fx-grid" style={{ gridTemplateColumns: "minmax(0,1.45fr) minmax(0,1fr)", marginTop: 14 }}>
        <Card title="Needs action today" sub={`${todayRows.length} exhibitors`} pad={false}>
          <div style={{ marginTop: 10 }}>
            {todayRows.map(t => t.r && (
              <div key={t.id} className="fx-tr" data-click="1" onClick={() => fx.open("exhibitor", t.id)}
                style={{ gridTemplateColumns: "minmax(0,1fr) auto", minHeight: 54 }}>
                <div style={{ minWidth: 0 }}>
                  <Row gap={8}><span className="fx-strong">{t.r.company}</span><EventTag id={t.r.event} /><Status s={t.r.state} /></Row>
                  <Row gap={6} style={{ marginTop: 3 }}>
                    <Avatar name={t.owner} size={16} bg={teamBg(t.owner)} />
                    <span style={{ fontSize: 11.5, color: "var(--dim)", overflow: "hidden", textOverflow: "ellipsis" }}>{t.issue}</span>
                  </Row>
                </div>
                <div>{t.act}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Top blockers" sub="Across open exhibitors">
          <div style={{ display: "grid", gap: 4 }}>
            {blockers.map(b => (
              <button key={b.label} onClick={b.go} style={{ display: "grid", gridTemplateColumns: "24px minmax(0,1fr) 34px", gap: 10, alignItems: "center", padding: "8px 6px", border: 0, borderRadius: 10, background: "none", font: "inherit", color: "inherit", textAlign: "left", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")} onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                <span style={{ width: 24, height: 24, borderRadius: 7, background: "var(--track)", color: "var(--dim)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={b.icon} size={12} /></span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 12.5, color: "var(--ink)", fontWeight: 500 }}>{b.label}</span>
                  <span style={{ display: "block", fontSize: 11, color: "var(--faint)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.detail}</span>
                  <Bar value={b.n} max={maxB} height={3} color="var(--warn)" style={{ display: "block", marginTop: 5 }} />
                </span>
                <span style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{b.n}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </Page>
  );
}

/* ═════════════════════════════ ONBOARDING ═══════════════════════════════ */
function Onboarding({ fx }: { fx: Fx }) {
  const [court, setCourt] = useState<"all" | Court>("all");
  const [q, setQ] = useState("");
  const [all, setAll] = useState(false);
  const base = ROWS.filter(r => inEv(fx.event, r.event));
  const peakPaid = !!fx.acted["match-peak"];
  const peakReminded = !!fx.acted["remind-peak"];

  const list = base
    .filter(r => court === "all" || r.court === court)
    .filter(r => !q || r.company.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => {
      const pin = (r: XRow) => (r.id === "x-peak" ? 0 : r.id === "x-nova" ? 1 : 2);
      return pin(a) - pin(b) || a.readiness - b.readiness;
    });
  const shown = all || q ? list : list.slice(0, 22);

  const steps: [string, (r: XRow) => Step][] = [
    ["Contract", r => r.contract], ["Deposit", r => r.deposit], ["Stand details", r => r.standDetails],
    ["Logo", r => stepOfAsset(assetsOf(r, fx)[0])], ["Speaker", r => (r.id === "x-peak" ? "missing" : r.speaker)], ["Tickets", r => r.tickets], ["Floor plan", r => floorStep(r)],
  ];

  const cols: Col<XRow>[] = [
    { k: "company", label: "Company", w: "minmax(0,1.75fr)", render: r => (
      <div style={{ minWidth: 0 }}>
        <div className="fx-strong" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{r.company}</div>
        <div style={{ fontSize: 11, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", color: r.court === "ready" ? "var(--ok)" : r.court === "client" ? "var(--warn)" : "var(--dim)" }}>{courtText(r)}</div>
      </div>
    ) },
    { k: "event", label: "Event", w: "88px", render: r => <EventTag id={r.event} /> },
    { k: "contract", label: "Contract", w: "minmax(0,.85fr)", render: r => <Cell s={r.contract} t={r.contract === "done" ? "Complete" : "Pending"} /> },
    { k: "deposit", label: "Deposit", w: "minmax(0,.9fr)", render: r => <Cell s={r.deposit} t={r.deposit === "done" ? (r.id === "x-peak" && !peakPaid ? "Paid · matching" : "Paid") : r.deposit === "missing" ? "Overdue" : "Due"} /> },
    { k: "stand", label: "Stand details", w: "minmax(0,1.2fr)", render: r => (
      <Row gap={6} style={{ minWidth: 0 }}>
        <StepDot s={r.standDetails} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11.5, color: "var(--body)" }}>{r.standDetails === "done" ? r.size : "Spec pending"}</div>
          <div style={{ fontSize: 10.5, color: "var(--faint)", overflow: "hidden", textOverflow: "ellipsis" }}>{r.power} · {r.lights}</div>
        </div>
      </Row>
    ) },
    { k: "logo", label: "Logo", w: "minmax(0,.85fr)", render: r => { const a = assetsOf(r, fx)[0]; return <Cell s={stepOfAsset(a)} t={a === "missing" ? "Missing" : a === "requested" ? (r.id === "x-peak" && peakReminded ? "Reminded" : "Requested") : "Received"} />; } },
    { k: "speaker", label: "Speaker", w: "minmax(0,1fr)", render: r => {
      const a = assetsOf(r, fx);
      const s = r.id === "x-peak" ? (peakReminded ? "pending" : "missing") : r.speaker;
      const t = s === "na" ? "No slot" : s === "done" ? "Complete" : a[2] === "missing" || a[2] === "requested" ? "Headshot missing" : a[6] !== "approved" && a[6] !== "received" ? "Details missing" : "Bio missing";
      return <Cell s={s} t={t} />;
    } },
    { k: "tickets", label: "Tickets", w: "minmax(0,.8fr)", render: r => <Cell s={r.tickets} t={r.tickets === "done" ? "Issued" : r.court === "internal" ? "Allocating" : "On hold"} /> },
    { k: "floor", label: "Floor plan", w: "minmax(0,1fr)", render: r => { const c = standOf(r, fx); const f = floorStep(r); return <Cell s={f} t={f === "missing" ? "Unplaced" : `Zone ${zoneOfCode(c)} · ${c}${f === "pending" ? " held" : ""}`} />; } },
    { k: "ready", label: "Readiness", w: "118px", render: r => <ReadyBar v={r.readiness} /> },
  ];

  const counts = { all: base.length, client: base.filter(r => r.court === "client").length, internal: base.filter(r => r.court === "internal").length, ready: base.filter(r => r.court === "ready").length };

  return (
    <Page>
      <PageHead title="Onboarding" sub="Seven steps from signature to a stand on the floor. Click any exhibitor for the full record." fx={fx} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 8, marginBottom: 14 }}>
        {steps.map(([l, f]) => {
          const done = base.filter(r => f(r) === "done" || f(r) === "na").length;
          const miss = base.filter(r => f(r) === "missing").length;
          return (
            <div key={l} className="fx-kpi" style={{ padding: "11px 13px" }}>
              <div className="l">{l}</div>
              <div style={{ marginTop: 5, fontSize: 18, fontWeight: 600, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{done}<span style={{ fontSize: 12, color: "var(--faint)", fontWeight: 400 }}> / {base.length}</span></div>
              <Bar value={done} max={base.length} height={4} color={miss ? "var(--warn)" : "var(--ok)"} style={{ display: "block", marginTop: 7 }} />
              <div className="s">{miss ? `${miss} missing` : base.length - done ? `${base.length - done} in progress` : "All complete"}</div>
            </div>
          );
        })}
      </div>

      <Card pad={false} title="Onboarding progress" sub={`${list.length} of ${base.length} exhibitors`} right={
        <Row gap={8}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Find a company" aria-label="Find a company"
            style={{ height: 28, width: 170, padding: "0 12px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--surface-faint)", color: "var(--ink)", font: "inherit", fontSize: 12, outline: "none" }} />
          <Chips<"all" | Court> value={court} onChange={setCourt} options={[["all", `All ${counts.all}`], ["client", `Waiting on client ${counts.client}`], ["internal", `Internal ${counts.internal}`], ["ready", `Fully ready ${counts.ready}`]]} />
        </Row>
      }>
        <div style={{ marginTop: 12 }}>
          <Table cols={cols} rows={shown} onRow={r => fx.open("exhibitor", r.id)} highlight={r => r.id === "x-peak"} />
        </div>
        {!q && list.length > 22 && (
          <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 14px", borderTop: "1px solid var(--border)" }}>
            <Btn size="sm" kind="ghost" onClick={() => setAll(!all)}>{all ? "Show fewer" : `Show all ${list.length}`}</Btn>
          </div>
        )}
      </Card>
    </Page>
  );
}

/* ═════════════════════════════ FULFILMENT ═══════════════════════════════ */
const OBL_META: Record<string, { owner: string; due: string; ord: number }> = {
  "Website Logo": { owner: "Amy Byrne", due: "2 Oct", ord: 1 },
  "Social Announcement": { owner: "Amy Byrne", due: "9 Oct", ord: 2 },
  "Speaker Promotion": { owner: "Sarah Keane", due: "16 Oct", ord: 3 },
  "Competition Option": { owner: "Daniel Murray", due: "30 Oct", ord: 4 },
  "Hotel Information": { owner: "Conor Ryan", due: "6 Nov", ord: 5 },
  "Tickets": { owner: "Conor Ryan", due: "13 Nov", ord: 6 },
  "Partner Toolkit": { owner: "Amy Byrne", due: "20 Nov", ord: 7 },
  "Customer Ticket Allocation": { owner: "Conor Ryan", due: "15 Jan 2027", ord: 8 },
  "Stand Build": { owner: "Robyn Walsh", due: "29 Jan 2027", ord: 9 },
  "Electrical": { owner: "Robyn Walsh", due: "29 Jan 2027", ord: 10 },
  "Lighting": { owner: "Robyn Walsh", due: "29 Jan 2027", ord: 11 },
  "Parking Information": { owner: "Conor Ryan", due: "12 Feb 2027", ord: 12 },
};
const STATUS_COLOR = ["var(--faint)", "var(--warn)", "var(--dim)", "var(--accent)", "var(--ok)"];
const PEAK_OBL: Record<string, number> = { "Website Logo": 1, "Social Announcement": 3, "Speaker Promotion": 1, "Stand Build": 4, "Electrical": 4, "Lighting": 4, "Tickets": 4, "Hotel Information": 4, "Parking Information": 0, "Partner Toolkit": 3, "Competition Option": 2, "Customer Ticket Allocation": 1 };
const NOVA_OBL: Record<string, number> = { "Website Logo": 4, "Social Announcement": 3, "Speaker Promotion": 3, "Stand Build": 3, "Electrical": 2, "Lighting": 2, "Tickets": 0, "Hotel Information": 1, "Parking Information": 0, "Partner Toolkit": 0, "Competition Option": 1, "Customer Ticket Allocation": 0 };

function oblBase(r: XRow, o: string, fx: Fx): number | null {
  if (r.id === "x-peak") return PEAK_OBL[o] ?? 0;
  if (r.id === "x-nova") return NOVA_OBL[o] ?? 0;
  if (r.id === "x-ferro" && o === "Electrical") return 3;
  const h = hash(r.id + o) % 10;
  const a = assetsOf(r, fx);
  const ready = r.state === "READY";
  switch (o) {
    case "Website Logo": return a[0] === "approved" ? 4 : a[0] === "received" ? 3 : 1;
    case "Social Announcement": return ready ? (h < 6 ? 4 : 3) : h < 7 ? 0 : 3;
    case "Speaker Promotion": return !r.hasSpeaker ? null : SPEAKER_ASSETS.some(j => isOut(a[j])) ? 1 : h < 5 ? 4 : 3;
    case "Stand Build": return r.standDetails === "done" ? (h < 3 ? 4 : 2) : 1;
    case "Electrical": return r.standDetails === "done" ? (h < 4 ? 4 : 2) : 0;
    case "Lighting": return r.standDetails === "done" ? (h < 5 ? 4 : 2) : 0;
    case "Tickets": return r.tickets === "done" ? 4 : r.court === "internal" ? 3 : 0;
    case "Hotel Information": return ready ? (h < 6 ? 4 : 3) : 0;
    case "Parking Information": return ready ? (h < 2 ? 2 : h < 4 ? 1 : 0) : 0;
    case "Partner Toolkit": return ready ? (h < 5 ? 4 : 3) : h < 3 ? 3 : 0;
    case "Competition Option": return hash(r.id) % 3 !== 0 ? null : h < 3 ? 1 : h < 6 ? 2 : 4;
    case "Customer Ticket Allocation": return ready ? (h < 4 ? 4 : h < 7 ? 2 : 1) : r.court === "client" ? 1 : 0;
  }
  return null;
}
type OItem = { key: string; row: XRow; obl: string; status: number };
function oblItems(fx: Fx): OItem[] {
  const out: OItem[] = [];
  ROWS.forEach(r => OBLIGATIONS.forEach(o => {
    const b = oblBase(r, o, fx);
    if (b == null) return;
    const key = r.id + "|" + o;
    out.push({ key, row: r, obl: o, status: OBL_MOVES[key] ?? b });
  }));
  return out;
}

function Fulfilment({ fx }: { fx: Fx }) {
  const [obl, setObl] = useState<string>("all");
  const [owner, setOwner] = useState<string>("all");
  const [, setTick] = useState(0);
  const items = oblItems(fx).filter(i => inEv(fx.event, i.row.event));
  const board = items.filter(i => (obl === "all" || i.obl === obl) && (owner === "all" || OBL_META[i.obl]?.owner === owner));
  const pri = (i: OItem) => (i.row.id === "x-peak" || i.row.id === "x-nova" ? 0 : i.row.detail ? 1 : i.row.state !== "READY" ? 2 : 3);
  const move = (i: OItem) => {
    const next = Math.min(4, i.status + 1);
    OBL_MOVES[i.key] = next;
    setTick(t => t + 1);
    fx.toast(`${i.obl} for ${i.row.company} moved to ${OBLIGATION_STATUSES[next]}`);
  };
  const owners = ["Amy Byrne", "Robyn Walsh", "Conor Ryan", "Sarah Keane", "Daniel Murray"];

  return (
    <Page>
      <PageHead title="Fulfilment" sub="Every obligation in every package, generated from the signed deal and tracked to done." fx={fx} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(168px,1fr))", gap: 8, marginBottom: 14 }}>
        {OBLIGATIONS.map(o => {
          const its = items.filter(i => i.obl === o);
          const done = its.filter(i => i.status === 4).length;
          const req = its.filter(i => i.status === 1).length;
          const int = its.filter(i => i.status === 3).length;
          const on = obl === o;
          return (
            <button key={o} onClick={() => setObl(on ? "all" : o)} className="fx-kpi" data-click="1"
              style={{ textAlign: "left", font: "inherit", color: "inherit", padding: "10px 12px", borderColor: on ? "var(--accent-line)" : undefined, background: on ? "var(--accent-faint)" : undefined }}>
              <div className="l" style={{ color: on ? "var(--ink)" : undefined }}>{o}</div>
              <Row gap={6} style={{ marginTop: 5 }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{done}<span style={{ fontSize: 11.5, color: "var(--faint)", fontWeight: 400 }}> / {its.length}</span></span>
                <span className="fx-grow" />
                <span style={{ fontSize: 10.5, color: "var(--faint)" }}>{its.length ? Math.round((done / its.length) * 100) : 0}%</span>
              </Row>
              <Bar value={done} max={Math.max(1, its.length)} height={3} color="var(--ok)" style={{ display: "block", marginTop: 6 }} />
              <div className="s">{req} requested · {int} internal</div>
            </button>
          );
        })}
      </div>

      <Row gap={10} style={{ marginBottom: 12, flexWrap: "wrap" }}>
        <span style={cap}>OWNER</span>
        <Chips<string> value={owner} onChange={setOwner} options={[["all", "Everyone"], ...owners.map(o => [o, o] as [string, string])]} />
        <span className="fx-grow" />
        {obl !== "all" && <Btn size="sm" kind="ghost" icon={PATHS.close} onClick={() => setObl("all")}>Clear {obl}</Btn>}
        <span style={{ fontSize: 12, color: "var(--dim)" }}>{board.length} obligations · {board.filter(i => i.status === 4).length} complete</span>
      </Row>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 10, alignItems: "start" }}>
        {OBLIGATION_STATUSES.map((st, si) => {
          const col = board.filter(i => i.status === si).sort((a, b) => pri(a) - pri(b) || (OBL_META[a.obl]?.ord ?? 0) - (OBL_META[b.obl]?.ord ?? 0));
          const vis = col.slice(0, 7);
          return (
            <div key={st} style={{ minWidth: 0, background: "var(--surface-faint)", border: "1px solid var(--border)", borderRadius: 16, padding: 8 }}>
              <Row gap={8} style={{ padding: "4px 6px 10px" }}>
                <span style={{ width: 8, height: 8, borderRadius: 3, background: STATUS_COLOR[si] }} />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)" }}>{st}</span>
                <span className="fx-grow" />
                <span style={{ fontSize: 11.5, color: "var(--faint)", fontVariantNumeric: "tabular-nums" }}>{col.length}</span>
              </Row>
              <div style={{ display: "grid", gap: 6 }}>
                {vis.map(i => {
                  const m = OBL_META[i.obl];
                  const waitingClient = si === 1;
                  return (
                    <div key={i.key} onClick={() => fx.open("exhibitor", i.row.id)} role="button" tabIndex={0}
                      style={{ padding: "9px 10px", borderRadius: 12, background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer", minWidth: 0, boxShadow: `inset 2px 0 0 ${STATUS_COLOR[si]}` }}>
                      <Row gap={6}>
                        <span style={{ fontSize: 10.5, color: "var(--faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} className="fx-grow">{i.obl}</span>
                        <span style={{ fontSize: 10.5, color: waitingClient ? "var(--warn)" : "var(--faint)", whiteSpace: "nowrap" }}>{m?.due}</span>
                      </Row>
                      <Row gap={6} style={{ marginTop: 4 }}>
                        <EvDot e={i.row.event} />
                        <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{i.row.company}</span>
                      </Row>
                      <Row gap={6} style={{ marginTop: 8 }}>
                        <Avatar name={m?.owner || "Robyn Walsh"} size={18} bg={teamBg(m?.owner || "")} />
                        <span style={{ fontSize: 10.5, color: "var(--dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} className="fx-grow">{waitingClient ? "Waiting on client" : m?.owner.split(" ")[0]}</span>
                        {si < 4 && <Btn size="sm" kind="ghost" icon={PATHS.arrow} title={`Move to ${OBLIGATION_STATUSES[si + 1]}`} onClick={() => move(i)}>{OBLIGATION_STATUSES[si + 1].split(" ")[0]}</Btn>}
                      </Row>
                    </div>
                  );
                })}
                {col.length > vis.length && <div style={{ fontSize: 11.5, color: "var(--faint)", textAlign: "center", padding: "6px 0 2px" }}>+ {col.length - vis.length} more</div>}
                {col.length === 0 && <div style={{ fontSize: 11.5, color: "var(--faint)", textAlign: "center", padding: "14px 0" }}>Clear</div>}
              </div>
            </div>
          );
        })}
      </div>
    </Page>
  );
}

/* ═════════════════════════════ FLOOR PLAN ═══════════════════════════════ */
const GRIP = "M9 6h.01 M15 6h.01 M9 12h.01 M15 12h.01 M9 18h.01 M15 18h.01";
function StandBox({ st, fx, dim, hovered, setHover }: { st: Stand; fx: Fx; dim: boolean; hovered: boolean; setHover: (c: string | null) => void }) {
  const o = st.occ;
  const selected = fx.drawer?.kind === "stand" && fx.drawer.id.toUpperCase() === st.code;
  let bg = "transparent", bd = "1px dashed var(--border-strong)", ink = "var(--faint)";
  if (o && st.status === "confirmed") { bg = evSoft(o.event); bd = `1px solid ${evColor(o.event)}`; ink = "var(--ink)"; }
  if (o && st.status === "provisional") { bg = "var(--surface-faint)"; bd = `1px dashed ${evColor(o.event)}`; ink = "var(--body)"; }
  if (st.status === "conflict") { bg = "var(--bad-soft)"; bd = "1.5px solid var(--bad)"; ink = "var(--ink)"; }
  const ring = selected ? "0 0 0 2px var(--accent)" : hovered ? "0 0 0 1.5px var(--ink)" : "none";
  return (
    <button onClick={() => fx.open("stand", st.code)} onMouseEnter={() => setHover(st.code)} onMouseLeave={() => setHover(null)}
      aria-label={`Stand ${st.code}${o ? ", " + o.company : ", available"}`}
      style={{ width: "100%", height: 42, borderRadius: 6, background: bg, border: bd, boxShadow: ring,
        opacity: dim ? 0.2 : 1, transform: hovered && !dim ? "translateY(-1px)" : "none", padding: "4px 5px", textAlign: "left", cursor: "pointer", font: "inherit", color: ink,
        display: "flex", flexDirection: "column", justifyContent: "space-between", overflow: "hidden", minWidth: 0,
        transition: "opacity .25s var(--ease), transform .15s var(--ease), box-shadow .15s var(--ease)" }}>
      <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 9.5, fontWeight: 600, fontFamily: "var(--mono)", color: st.status === "conflict" ? "var(--bad)" : o ? evColor(o.event) : "var(--faint)" }}>
        {st.code}{st.status === "conflict" && <Icon d={PATHS.alert} size={9} sw={2.4} />}
      </span>
      <span style={{ fontSize: 9.5, lineHeight: 1.15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o ? o.company.split(" ").slice(0, 2).join(" ") : "Free"}</span>
    </button>
  );
}

function FloorPlan({ fx }: { fx: Fx }) {
  const [hover, setHover] = useState<string | null>(null);
  const [, setTick] = useState(0);
  const model = floorModel(fx);
  const ek = evKey(fx.event);
  const rows = ROWS.filter(r => inEv(fx.event, r.event));
  const placed = rows.filter(r => floorOf(r) === "placed").length;
  const prov = rows.filter(r => floorOf(r) === "provisional").length;
  const unplaced = rows.filter(r => floorOf(r) === "unplaced");
  const allConflicts = [...model.values()].filter(s => s.status === "conflict");
  const conflicts = allConflicts.filter(s => s.occ && inEv(fx.event, s.occ.event));
  const free = [...model.values()].filter(s => s.status === "available").length;
  const dimOf = (s: Stand) => ek !== "all" && !!s.occ && s.occ.event !== ek;
  const hs = hover ? model.get(hover) : undefined;

  const zone = (z: Z) => {
    const zs = LAYOUT[z].flat().map(d => model.get(d.code)!);
    const zfree = zs.filter(s => s.status === "available").length;
    return (
      <div style={{ minWidth: 0 }}>
        <Row gap={8} style={{ marginBottom: 6 }}>
          <span style={{ ...cap, color: "var(--body)" }}>ZONE {z}</span>
          <span style={{ fontSize: 11, color: "var(--faint)" }}>{ZONE_NAME[z]}</span>
          <span className="fx-grow" />
          <span style={{ fontSize: 10.5, color: "var(--faint)" }}>{zs.length - zfree}/{zs.length} let</span>
        </Row>
        {[0, 1].map(isl => (
          <div key={isl} style={{ marginTop: isl ? 12 : 0, padding: 3, borderRadius: 9, background: "var(--surface-faint)", border: "1px solid var(--border)", display: "grid", gap: 3 }}>
            {LAYOUT[z].slice(isl * 2, isl * 2 + 2).map((row, ri) => (
              <div key={ri} style={{ display: "grid", gap: 3, gridTemplateColumns: row.map(d => model.get(d.code)!.front + "fr").join(" ") }}>
                {row.map(d => { const s = model.get(d.code)!; return <StandBox key={d.code} st={s} fx={fx} dim={dimOf(s)} hovered={hover === d.code} setHover={setHover} />; })}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const swatch = (bg: string, bd: string) => <span style={{ width: 14, height: 10, borderRadius: 3, background: bg, border: bd, flex: "none" }} />;

  return (
    <Page>
      <PageHead title="Floor plan" sub="RDS hall, 13–14 March 2027. 92 stands across four zones, shared by both events." fx={fx} />
      <Kpis min={140} items={[
        { label: "Floor plan allocated", value: Math.round((placed / Math.max(1, rows.length)) * 100) + "%", sub: `${placed} of ${rows.length} confirmed` },
        { label: "Placed", value: placed, sub: "Stand confirmed", tone: "ok" },
        { label: "Provisional", value: prov, sub: "Held pending deposit or paperwork", tone: "warn" },
        { label: "Unplaced exhibitors", value: unplaced.length, sub: "Signed, no stand yet", tone: unplaced.length ? "warn" : "ok" },
        { label: "Conflicts", value: conflicts.length, sub: conflicts.length ? "Frontage and power" : "All resolved", tone: conflicts.length ? "bad" : "ok" },
        { label: "Available stands", value: free, sub: "A05 held for Nova" },
      ]} />

      <div className="fx-grid" style={{ gridTemplateColumns: "minmax(0,1fr) 300px", alignItems: "start" }}>
        <Card title="Hall plan" sub="Click a stand to open it" right={
          <Row gap={12} style={{ flexWrap: "wrap" }}>
            {([["Fertility", swatch(evSoft("ff"), `1px solid ${evColor("ff")}`)], ["Men's Health", swatch(evSoft("mh"), `1px solid ${evColor("mh")}`)],
              ["Provisional", swatch("transparent", "1px dashed var(--dim)")], ["Conflict", swatch("var(--bad-soft)", "1.5px solid var(--bad)")],
              ["Available", swatch("transparent", "1px dashed var(--border-strong)")]] as [string, ReactNode][]).map(([l, s]) => (
              <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--dim)" }}>{s}{l}</span>
            ))}
          </Row>
        }>
          <div style={{ position: "relative", border: "1px solid var(--border-strong)", borderRadius: 18, padding: "14px 14px 26px",
            backgroundImage: "linear-gradient(var(--grid, rgba(128,128,128,.05)) 1px, transparent 1px), linear-gradient(90deg, var(--grid, rgba(128,128,128,.05)) 1px, transparent 1px)", backgroundSize: "22px 22px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 84px minmax(0,1fr)", columnGap: 14, rowGap: 18 }}>
              <div style={{ gridColumn: "1 / -1", gridRow: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ width: "46%", minWidth: 220, height: 50, borderRadius: "10px 10px 26px 26px", border: "1px solid var(--accent-line)",
                  background: "linear-gradient(180deg, var(--accent-soft), var(--accent-faint))", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".22em", color: "var(--ink)" }}>MAIN STAGE</span>
                  <span style={{ fontSize: 10, color: "var(--dim)", marginTop: 2 }}>Main Stage 1 · Main Stage 2 on the turnaround</span>
                </div>
                {[62, 54, 46].map(w => <span key={w} style={{ width: w + "%", height: 0, borderTop: "2px dotted var(--border-strong)" }} />)}
                <span style={{ fontSize: 9.5, color: "var(--faint)", letterSpacing: ".12em" }}>SEATING · 420</span>
              </div>
              <div style={{ gridColumn: 1, gridRow: 2 }}>{zone("A")}</div>
              <div style={{ gridColumn: 2, gridRow: "2 / span 2", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <span style={{ flex: 1, width: 0, borderLeft: "1px dashed var(--border-strong)" }} />
                <div style={{ width: 76, height: 128, borderRadius: 38, border: "1px solid var(--border-strong)", background: "var(--surface-2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, textAlign: "center" }}>
                  <Icon d="M7 4h10l-5 7-5-7Z M12 11v8 M8.5 20h7" size={16} style={{ color: "var(--dim)" }} />
                  <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: ".16em", color: "var(--body)", lineHeight: 1.4 }}>CENTRAL<br />BAR</span>
                </div>
                <span style={{ flex: 1, width: 0, borderLeft: "1px dashed var(--border-strong)" }} />
              </div>
              <div style={{ gridColumn: 3, gridRow: 2 }}>{zone("B")}</div>
              <div style={{ gridColumn: 1, gridRow: 3 }}>{zone("C")}</div>
              <div style={{ gridColumn: 3, gridRow: 3 }}>{zone("D")}</div>
            </div>
            <div style={{ position: "absolute", left: "50%", bottom: -12, transform: "translateX(-50%)", display: "inline-flex", alignItems: "center", gap: 7, padding: "4px 16px",
              borderRadius: 999, background: "var(--bg)", border: "1px solid var(--border-strong)", fontSize: 10, fontWeight: 700, letterSpacing: ".2em", color: "var(--body)" }}>
              <Icon d="M12 19V5 M6 11l6-6 6 6" size={11} sw={2.2} />ENTRANCE
            </div>
          </div>
          <div style={{ marginTop: 22, minHeight: 36, display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 12, background: "var(--surface-faint)", border: "1px solid var(--border)", fontSize: 12, color: "var(--dim)" }}>
            {hs ? (
              <>
                <span style={{ fontFamily: "var(--mono)", fontWeight: 600, color: "var(--ink)" }}>{hs.code}</span>
                {hs.occ ? (
                  <>
                    <EvDot e={hs.occ.event} /><span style={{ color: "var(--ink)", fontWeight: 500 }}>{hs.occ.company}</span>
                    <span>{hs.occ.size} · {hs.occ.power} · {hs.occ.lights}</span>
                    <span className="fx-grow" />
                    <Status s={hs.status === "confirmed" ? "Confirmed" : hs.status === "provisional" ? "Provisional" : "Conflict"} />
                  </>
                ) : (
                  <><span>{sizeOf(hs.front)} · Zone {hs.zone}, row {hs.row}</span><span className="fx-grow" /><Badge tone="ghost">Available</Badge></>
                )}
              </>
            ) : <span>Hover a stand for details. {ek !== "all" ? `Showing ${EVENTS[ek].name}; the other event is dimmed.` : "Colour shows the event, dashed outlines are provisional holds."}</span>}
          </div>
        </Card>

        <div style={{ display: "grid", gap: 14 }}>
          <Card title="Conflicts" right={<Badge tone={conflicts.length ? "bad" : "ok"}>{conflicts.length}</Badge>}>
            <div style={{ display: "grid", gap: 10 }}>
              {!novaMoved(fx) && inEv(fx.event, "ff") && (
                <div style={{ padding: 12, borderRadius: 12, background: "var(--bad-soft)" }}>
                  <Row gap={6}><span style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600, color: "var(--bad)" }}>A07</span><span className="fx-strong" style={{ fontSize: 12.5 }}>Nova Fertility Clinic</span></Row>
                  <div style={{ fontSize: 12, color: "var(--body)", marginTop: 5, lineHeight: 1.5 }}>{NOVA.conflict} A05 in the same row has 4m frontage and is free.</div>
                  <div style={{ marginTop: 9 }}><ActBtn fx={fx} k="resolve-nova-frontage" size="sm" label="Move to A05 (4m frontage)" doneLabel="Moved to A05" toast={NOVA_TOAST} /></div>
                </div>
              )}
              {!fx.acted["exhibitors-ferro-power"] && inEv(fx.event, "mh") && (
                <div style={{ padding: 12, borderRadius: 12, background: "var(--bad-soft)" }}>
                  <Row gap={6}><span style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600, color: "var(--bad)" }}>C22</span><span className="fx-strong" style={{ fontSize: 12.5 }}>Ferro Sports Recovery</span></Row>
                  <div style={{ fontSize: 12, color: "var(--body)", marginTop: 5, lineHeight: 1.5 }}>3 sockets plus recovery pods, about 4.5kW. C22 sits on a shared 16A circuit rated 3.6kW.</div>
                  <div style={{ marginTop: 9 }}><ActBtn fx={fx} k="exhibitors-ferro-power" size="sm" label="Request dedicated 32A supply" doneLabel="Supply requested" toast={FERRO_TOAST} /></div>
                </div>
              )}
              {conflicts.length === 0 && <Note>No open conflicts{ek !== "all" ? " for this event" : ""}. {novaMoved(fx) ? "Nova is held on A05 until the deposit clears." : ""}</Note>}
            </div>
          </Card>

          <Card title="Unplaced exhibitors" sub="Click Place to hold a stand" right={<Badge tone={unplaced.length ? "warn" : "ok"}>{unplaced.length}</Badge>} pad={false}>
            <div style={{ marginTop: 10, maxHeight: 470, overflowY: "auto" }}>
              {unplaced.map(r => {
                const reshuffle = !!fx.acted["exhibitors-reshuffle-" + r.id];
                return (
                  <div key={r.id} style={{ display: "grid", gridTemplateColumns: "14px minmax(0,1fr) auto", gap: 8, alignItems: "center", padding: "9px 14px 9px 10px", borderTop: "1px solid var(--border)", cursor: "grab" }}
                    onClick={() => fx.open("exhibitor", r.id)}>
                    <Icon d={GRIP} size={14} sw={3} style={{ color: "var(--faint)" }} />
                    <div style={{ minWidth: 0 }}>
                      <Row gap={6}><EvDot e={r.event} /><span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.company}</span></Row>
                      <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.size}{r.request ? " · " + r.request : ""}</div>
                    </div>
                    {reshuffle ? <Badge tone="warn">Reshuffle list</Badge> : <Btn size="sm" onClick={() => { holdStand(fx, r); setTick(t => t + 1); }}>Place</Btn>}
                  </div>
                );
              })}
              {unplaced.length === 0 && <div style={{ padding: "14px 18px", fontSize: 12, color: "var(--dim)", borderTop: "1px solid var(--border)" }}>Everyone has a stand or a provisional hold.</div>}
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}

/* ═════════════════════════════ ASSETS ═══════════════════════════════════ */
const SNIPPETS: Record<string, string> = {
  "x-ferro": "Ferro Sports Recovery runs cryotherapy, compression and recovery pods for amateur and elite athletes, with studios in Dublin and Galway.",
  "x-clar": "Clarity Hormone Clinic offers consultant-led hormone testing and treatment for women at every stage, from cycle concerns to menopause.",
  "x-peak-bio": "Dr Hugh Tierney is Clinical Lead at Peak Health Labs, where he interprets advanced blood panels for men focused on long-term health.",
};
function Assets({ fx }: { fx: Fx }) {
  const [mode, setMode] = useState<"out" | "all">("out");
  const [all, setAll] = useState(false);
  const rows = ROWS.filter(r => inEv(fx.event, r.event));
  const peakReminded = !!fx.acted["remind-peak"];
  const totals = ASSET_TYPES.map((_, j) => {
    const c = { approved: 0, received: 0, requested: 0, missing: 0 };
    rows.forEach(r => { const s = assetsOf(r, fx)[j]; if (s !== "na") c[s]++; });
    return c;
  });
  const outstanding = totals.reduce((a, c) => a + c.requested + c.missing, 0);
  const outRows = rows.filter(r => outCount(r, fx) > 0);
  const list = (mode === "out" ? outRows : rows).slice().sort((a, b) => (a.id === "x-peak" ? -1 : b.id === "x-peak" ? 1 : outCount(b, fx) - outCount(a, fx) || a.company.localeCompare(b.company)));
  const shown = all ? list : list.slice(0, 26);
  const peak = rowById("x-peak");
  const showPeak = !!peak && inEv(fx.event, "mh");

  const flowNode = (t: string, old: boolean) => (
    <span style={{ padding: "6px 11px", borderRadius: 10, fontSize: 12, whiteSpace: "nowrap", border: old ? "1px dashed var(--border-strong)" : "1px solid var(--accent-line)",
      color: old ? "var(--faint)" : "var(--ink)", textDecoration: old ? "line-through" : "none", background: old ? "none" : "var(--accent-faint)" }}>{t}</span>
  );
  const chain = (nodes: string[], old: boolean) => (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", minWidth: 0 }}>
      {nodes.map((n, i) => (
        <span key={n} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          {flowNode(n, old)}
          {i < nodes.length - 1 && <Icon d={PATHS.arrow} size={12} style={{ color: old ? "var(--faint)" : "var(--accent)" }} />}
        </span>
      ))}
    </div>
  );

  type Tile = { id: string; kind: "logo" | "head" | "text"; who: string; company: string; type: string; status: AssetS; text?: string };
  const tileSrc: Tile[] = [
    ...(showPeak ? [
      { id: "x-peak", kind: "logo" as const, who: "Peak Health Labs", company: "Peak Health Labs", type: "Logo SVG", status: assetsOf(peak!, fx)[0] },
      { id: "x-peak", kind: "head" as const, who: "Dr Hugh Tierney", company: "Peak Health Labs", type: "Speaker headshot", status: assetsOf(peak!, fx)[2] },
    ] : []),
    { id: "x-clar", kind: "logo", who: "Clarity Hormone Clinic", company: "Clarity Hormone Clinic", type: "Logo", status: "approved" },
    { id: "x-vireo", kind: "logo", who: "Vireo Diagnostics", company: "Vireo Diagnostics", type: "Logo", status: "approved" },
    { id: "x-nova", kind: "head", who: "Dr Aoife Brennan", company: "Nova Fertility Clinic", type: "Speaker headshot", status: "approved" },
    { id: "x-ferro", kind: "text", who: "", company: "Ferro Sports Recovery", type: "Company description", status: "approved", text: SNIPPETS["x-ferro"] },
    ...(showPeak ? [{ id: "x-peak", kind: "text" as const, who: "", company: "Peak Health Labs", type: "Speaker bio", status: "received" as AssetS, text: SNIPPETS["x-peak-bio"] }] : []),
    { id: "x-vel", kind: "text", who: "", company: "Velocity Fitness Studios", type: "Social handles", status: "received", text: "@velocityfitness.ie on Instagram and TikTok · Velocity Fitness Studios on LinkedIn" },
    { id: "x-emb", kind: "logo", who: "Emberly Wellness", company: "Emberly Wellness", type: "Logo", status: "approved" },
    { id: "x-clar", kind: "text", who: "", company: "Clarity Hormone Clinic", type: "Company description", status: "approved", text: SNIPPETS["x-clar"] },
  ];
  const tiles = tileSrc.filter(t => { const r = rowById(t.id); return !!r && inEv(fx.event, r.event); }).slice(0, 8);

  return (
    <Page>
      <PageHead title="Asset collection" sub="One place for every logo, headshot and bio, instead of a form, a download and a Drive folder." fx={fx} />

      <Card title="How assets arrive now" sub="Replaces the Google Form workflow">
        <div style={{ display: "grid", gridTemplateColumns: "64px minmax(0,1fr) minmax(0,240px)", gap: "12px 14px", alignItems: "center" }}>
          <span style={{ ...cap }}>BEFORE</span>
          {chain(["Google Form", "Download responses", "Save to Drive folder", "Rename and resize", "Upload to Canva and Later"], true)}
          <span style={{ fontSize: 11.5, color: "var(--faint)", lineHeight: 1.45 }}>About 25 minutes per exhibitor. No status anywhere. Chased on WhatsApp.</span>
          <span style={{ ...cap, color: "var(--accent)" }}>NOW</span>
          {chain(["Exhibitor portal link", "Auto-checks: SVG, size, format", "Asset library", "Amy approves", "Website, Later, Canva"], false)}
          <span style={{ fontSize: 11.5, color: "var(--body)", lineHeight: 1.45 }}>Status on every record. Reminders go automatically, 11 sent overnight.</span>
        </div>
      </Card>

      <div className="fx-grid" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1.3fr)", marginTop: 14 }}>
        <Card title="Status by asset type" right={<Row gap={6}><span style={{ fontSize: 11.5, color: "var(--dim)" }}>Outstanding</span><span style={{ fontSize: 18, fontWeight: 600, color: "var(--bad)" }}>{outstanding}</span></Row>} pad={false}>
          <div style={{ marginTop: 10 }}>
            <div className="fx-tr fx-th" style={{ gridTemplateColumns: "minmax(0,1.4fr) repeat(4,44px) minmax(0,1fr)" }}>
              <div>Type</div><div className="fx-num">Appr.</div><div className="fx-num">Rec.</div><div className="fx-num">Req.</div><div className="fx-num">Miss.</div><div>Mix</div>
            </div>
            {ASSET_TYPES.map((t, j) => {
              const c = totals[j];
              const tot = Math.max(1, c.approved + c.received + c.requested + c.missing);
              return (
                <div key={t} className="fx-tr" style={{ gridTemplateColumns: "minmax(0,1.4fr) repeat(4,44px) minmax(0,1fr)", minHeight: 38 }}>
                  <div className="fx-strong">{t}</div>
                  <div className="fx-num">{c.approved}</div>
                  <div className="fx-num">{c.received}</div>
                  <div className="fx-num" style={{ color: c.requested ? "var(--warn)" : undefined }}>{c.requested}</div>
                  <div className="fx-num" style={{ color: c.missing ? "var(--bad)" : undefined }}>{c.missing}</div>
                  <div style={{ display: "flex", height: 6, borderRadius: 99, overflow: "hidden", background: "var(--track)" }}>
                    {([["approved", "var(--ok)"], ["received", "var(--dim)"], ["requested", "var(--warn)"], ["missing", "var(--bad)"]] as [keyof typeof c, string][]).map(([kk, col]) => (
                      <i key={kk} style={{ display: "block", width: `${(c[kk] / tot) * 100}%`, background: col }} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Latest submissions" sub="Previews from the asset library" right={showPeak ? <ActBtn fx={fx} k="remind-peak" size="sm" label="Remind Peak" doneLabel="Reminder sent" toast={PEAK_TOAST} /> : undefined}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 8 }}>
            {tiles.map((t, i) => {
              const out = isOut(t.status);
              return (
                <button key={i} onClick={() => fx.open("exhibitor", t.id)}
                  style={{ gridColumn: t.kind === "text" ? "span 2" : undefined, textAlign: "left", font: "inherit", color: "inherit", cursor: "pointer", padding: 10, borderRadius: 14,
                    background: out ? "var(--bad-soft)" : "var(--surface-faint)", border: `1px solid ${out ? "transparent" : "var(--border)"}`, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {t.kind === "logo" && <Monogram name={t.who} size={46} missing={out} />}
                  {t.kind === "head" && <Headshot name={t.who} size={46} missing={out} />}
                  {t.kind === "text" && <span style={{ fontSize: 11.5, color: "var(--body)", lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{t.text}</span>}
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 11.5, fontWeight: 500, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.kind === "head" ? t.who : t.company}</span>
                    <span style={{ display: "block", fontSize: 10.5, color: "var(--faint)" }}>{t.type}</span>
                  </span>
                  <Status s={assetLabel(t.status, t.id === "x-peak" && peakReminded)} />
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      <Card pad={false} style={{ marginTop: 14 }} title="Completeness by exhibitor" sub={`${outRows.length} exhibitors with ${outstanding} outstanding assets`} right={
        <Row gap={8}>
          <Chips<"out" | "all"> value={mode} onChange={setMode} options={[["out", "Outstanding only"], ["all", "All exhibitors"]]} />
          <ActBtn fx={fx} k="exhibitors-remind-all-assets" size="sm" label="Remind all outstanding" doneLabel="Reminders sent" toast={`Reminders sent to ${outRows.length} exhibitors for ${outstanding} outstanding assets`} />
        </Row>
      }>
        <div style={{ marginTop: 12 }}>
          <div className="fx-tr fx-th" style={{ gridTemplateColumns: "minmax(0,1.8fr) 84px repeat(7,minmax(0,.7fr)) 64px" }}>
            <div>Company</div><div>Event</div>{ASSET_SHORT.map(s => <div key={s} style={{ textAlign: "center" }}>{s}</div>)}<div className="fx-num">Open</div>
          </div>
          {shown.map(r => {
            const a = assetsOf(r, fx);
            const n = a.filter(isOut).length;
            return (
              <div key={r.id} className="fx-tr" data-click="1" data-hl={r.id === "x-peak" ? "1" : undefined} onClick={() => fx.open("exhibitor", r.id)}
                style={{ gridTemplateColumns: "minmax(0,1.8fr) 84px repeat(7,minmax(0,.7fr)) 64px", minHeight: 40 }}>
                <div style={{ minWidth: 0 }}>
                  <div className="fx-strong" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{r.company}</div>
                  {r.id === "x-peak" && <div style={{ fontSize: 10.5, color: peakReminded ? "var(--warn)" : "var(--bad)" }}>{peakReminded ? "Logo SVG and headshot requested · reminder sent" : "Logo SVG and speaker headshot missing"}</div>}
                </div>
                <div><EventTag id={r.event} /></div>
                {a.map((s, j) => <div key={j} style={{ display: "flex", justifyContent: "center" }}><AssetDot s={s} /></div>)}
                <div className="fx-num" style={{ color: n ? "var(--bad)" : "var(--ok)", fontWeight: 600 }}>{n || "Done"}</div>
              </div>
            );
          })}
          <div className="fx-tr" style={{ gridTemplateColumns: "minmax(0,1.8fr) 84px repeat(7,minmax(0,.7fr)) 64px", background: "var(--surface-faint)", minHeight: 38 }}>
            <div style={{ color: "var(--dim)", fontSize: 11.5 }}>Outstanding by type</div><div />
            {totals.map((c, j) => <div key={j} style={{ textAlign: "center", fontWeight: 600, color: c.requested + c.missing ? "var(--ink)" : "var(--faint)" }}>{c.requested + c.missing}</div>)}
            <div className="fx-num" style={{ fontWeight: 600, color: "var(--bad)" }}>{outstanding}</div>
          </div>
        </div>
        {list.length > 26 && (
          <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 14px", borderTop: "1px solid var(--border)" }}>
            <Btn size="sm" kind="ghost" onClick={() => setAll(!all)}>{all ? "Show fewer" : `Show all ${list.length}`}</Btn>
          </div>
        )}
      </Card>
    </Page>
  );
}

/* ═════════════════════════════ READINESS ════════════════════════════════ */
const WEIGHTS: [string, number, string][] = [
  ["Contract signed", 10, "Signed in HubSpot, synced from the deal"],
  ["Deposit paid", 20, "Matched in Xero against the deposit invoice"],
  ["Stand specification", 15, "Dimensions, power and lighting confirmed"],
  ["Marketing assets", 30, "Logo 11 · Headshot 11 · Description 3 · Socials 2 · Website, bio, speaker details 1 each"],
  ["Tickets issued", 10, "Partner allocation issued"],
  ["Floor position", 15, "Confirmed stand on the floor plan"],
];
const componentSteps = (r: XRow, fx: Fx): [string, Step][] => {
  const a = assetsOf(r, fx).filter(s => s !== "na");
  const assetStep: Step = a.some(s => s === "missing") ? "missing" : a.some(s => s === "requested") ? "pending" : "done";
  return [["C", r.contract], ["D", r.deposit], ["S", r.standDetails], ["A", assetStep], ["T", r.tickets], ["F", floorStep(r)]];
};

function Readiness({ fx }: { fx: Fx }) {
  const rows = ROWS.filter(r => inEv(fx.event, r.event));
  const ek = evKey(fx.event);
  const lanes: [XState, string][] = [["READY", "85+ and nothing outstanding"], ["AT RISK", "Items outstanding, no hard stop"], ["BLOCKED", "Hard stop on tickets or floor"]];
  const buckets: [string, (v: number) => boolean][] = [["<50", v => v < 50], ["50-64", v => v >= 50 && v < 65], ["65-74", v => v >= 65 && v < 75], ["75-84", v => v >= 75 && v < 85], ["85-94", v => v >= 85 && v < 95], ["95+", v => v >= 95]];
  const peakPts: [string, number, number][] = [["Contract", 10, 10], ["Deposit", 20, 20], ["Stand spec", 15, 15], ["Assets (logo 0/11, headshot 0/11)", 8, 30], ["Tickets", 10, 10], ["Floor", 15, 15]];
  const barColor = ek === "all" ? "var(--accent)" : evColor(ek);

  return (
    <Page>
      <PageHead title="Readiness" sub="One score per exhibitor, built from six checks. Anything below 85 gets chased." fx={fx} />
      <Row gap={10} style={{ marginBottom: 14, flexWrap: "wrap" }}>
        <Chips<string> value={ek} onChange={v => fx.setEvent(v as EventFilter)} options={[["all", "Both events"], ["ff", "Future Fertility"], ["mh", "Future Men's Health"]]} />
        <span className="fx-grow" />
        {lanes.map(([s]) => (
          <Row key={s} gap={6}><Status s={s} /><span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{rows.filter(r => r.state === s).length}</span></Row>
        ))}
      </Row>

      <div className="fx-grid" style={{ gridTemplateColumns: "minmax(0,330px) minmax(0,1fr)", alignItems: "start" }}>
        <div style={{ display: "grid", gap: 14 }}>
          <Card title="How the score works" sub="Out of 100">
            <div style={{ display: "flex", height: 10, borderRadius: 99, overflow: "hidden", gap: 2 }}>
              {WEIGHTS.map(([l, w], i) => <i key={l} title={`${l} · ${w}`} style={{ display: "block", flex: w, background: barColor, opacity: 1 - i * 0.13 }} />)}
            </div>
            <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
              {WEIGHTS.map(([l, w, d], i) => (
                <div key={l} style={{ display: "grid", gridTemplateColumns: "10px minmax(0,1fr) 26px", gap: 8, alignItems: "start" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, marginTop: 4, background: barColor, opacity: 1 - i * 0.13 }} />
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 12.5, color: "var(--ink)", fontWeight: 500 }}>{l}</span>
                    <span style={{ display: "block", fontSize: 11, color: "var(--faint)", lineHeight: 1.4 }}>{d}</span>
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", textAlign: "right" }}>{w}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border)", display: "grid", gap: 5, fontSize: 11.5, color: "var(--dim)", lineHeight: 1.45 }}>
              <span><b style={{ color: "var(--ok)" }}>READY</b> 85 or more, nothing waiting on the client.</span>
              <span><b style={{ color: "var(--warn)" }}>AT RISK</b> items outstanding but work can continue.</span>
              <span><b style={{ color: "var(--bad)" }}>BLOCKED</b> payment, paperwork or compliance holds tickets or floor placement.</span>
            </div>
          </Card>

          {inEv(fx.event, "mh") && (
            <Card title="Worked example" sub="Peak Health Labs" right={<button className="fx-link" onClick={() => fx.open("exhibitor", "x-peak")}>Open</button>}>
              {peakPts.map(([l, v, m]) => (
                <div key={l} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 70px 44px", gap: 8, alignItems: "center", padding: "5px 0" }}>
                  <span style={{ fontSize: 12, color: v < m ? "var(--bad)" : "var(--body)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l}</span>
                  <Bar value={v} max={m} height={4} color={v < m ? "var(--warn)" : "var(--ok)"} />
                  <span style={{ fontSize: 12, color: "var(--ink)", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{v}/{m}</span>
                </div>
              ))}
              <Row style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                <span style={{ fontSize: 12.5, color: "var(--dim)" }} className="fx-grow">Score</span>
                <span style={{ fontSize: 20, fontWeight: 600, color: "var(--warn)" }}>{PEAK.readiness}%</span>
              </Row>
              <div style={{ marginTop: 8 }}><ActBtn fx={fx} k="remind-peak" size="sm" label="Send reminder" doneLabel="Reminder sent" toast={PEAK_TOAST} /></div>
            </Card>
          )}

          <Card title="Score distribution">
            <BarChart height={130} labels={buckets.map(b => b[0])} series={[{ name: "Exhibitors", color: barColor, values: buckets.map(([, f]) => rows.filter(r => f(r.readiness)).length) }]} />
          </Card>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, alignItems: "start" }}>
          {lanes.map(([s, hint]) => {
            const lr = rows.filter(r => r.state === s).sort((a, b) => (s === "READY" ? b.readiness - a.readiness : a.readiness - b.readiness));
            const avg = lr.length ? Math.round(lr.reduce((a, r) => a + r.readiness, 0) / lr.length) : 0;
            const tone = s === "READY" ? "var(--ok)" : s === "AT RISK" ? "var(--warn)" : "var(--bad)";
            return (
              <div key={s} style={{ minWidth: 0, borderRadius: 18, border: "1px solid var(--border)", background: "var(--surface)", overflow: "hidden" }}>
                <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid var(--border)", boxShadow: `inset 0 2px 0 ${tone}` }}>
                  <Row gap={8}><Status s={s} /><span className="fx-grow" /><span style={{ fontSize: 20, fontWeight: 600, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{lr.length}</span></Row>
                  <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 5 }}>{hint} · avg {avg}%</div>
                </div>
                <div style={{ maxHeight: 700, overflowY: "auto", scrollbarWidth: "thin" }}>
                  {lr.map(r => (
                    <div key={r.id} onClick={() => fx.open("exhibitor", r.id)} role="button" tabIndex={0}
                      style={{ padding: "9px 14px", borderTop: "1px solid var(--border)", cursor: "pointer", background: r.id === "x-peak" ? "var(--accent-faint)" : undefined }}
                      onMouseEnter={e => { if (r.id !== "x-peak") e.currentTarget.style.background = "var(--surface-2)"; }} onMouseLeave={e => { e.currentTarget.style.background = r.id === "x-peak" ? "var(--accent-faint)" : ""; }}>
                      <Row gap={6}>
                        <EvDot e={r.event} />
                        <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} className="fx-grow">{r.company}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: readyColor(r.readiness), fontVariantNumeric: "tabular-nums" }}>{r.readiness}</span>
                      </Row>
                      <Bar value={r.readiness} color={readyColor(r.readiness)} height={3} style={{ display: "block", marginTop: 6 }} />
                      <Row gap={3} style={{ marginTop: 7 }}>
                        {componentSteps(r, fx).map(([l, st]) => <span key={l} title={l}><StepDot s={st} /></span>)}
                        {r.blocker && <span style={{ fontSize: 10.5, color: "var(--dim)", marginLeft: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.blocker}</span>}
                      </Row>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Page>
  );
}

/* ═════════════════════════════ MODULE ═══════════════════════════════════ */
const TITLES: Record<string, string> = { overview: "Exhibitor overview", onboarding: "Onboarding", fulfilment: "Fulfilment", floorplan: "Floor plan", assets: "Asset collection", readiness: "Readiness" };
export default function Exhibitors({ fx }: ModuleProps) {
  if (fx.event === "ca") return <CanadaView fx={fx} title={TITLES[fx.tab] || "Exhibitors"} />;
  switch (fx.tab) {
    case "onboarding": return <Onboarding fx={fx} />;
    case "fulfilment": return <Fulfilment fx={fx} />;
    case "floorplan": return <FloorPlan fx={fx} />;
    case "assets": return <Assets fx={fx} />;
    case "readiness": return <Readiness fx={fx} />;
    default: return <Overview fx={fx} />;
  }
}

/* ═════════════════════════════ DRAWERS ══════════════════════════════════ */
function Timeline({ items }: { items: [string, string, ReactNode][] }) {
  return (
    <div style={{ display: "grid", gap: 0 }}>
      {items.map(([when, who, what], i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "72px 14px minmax(0,1fr)", gap: 8, alignItems: "start" }}>
          <span style={{ fontSize: 11, color: "var(--faint)", paddingTop: 1 }}>{when}</span>
          <span style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: i === 0 ? "var(--accent)" : "var(--border-strong)", marginTop: 4 }} />
            {i < items.length - 1 && <span style={{ flex: 1, width: 1, background: "var(--border)", minHeight: 16 }} />}
          </span>
          <span style={{ fontSize: 12.5, color: "var(--body)", lineHeight: 1.45, paddingBottom: 10 }}><b style={{ color: "var(--ink)", fontWeight: 500 }}>{who}</b> {what}</span>
        </div>
      ))}
    </div>
  );
}
function ListRow({ left, right, onClick }: { left: ReactNode; right?: ReactNode; onClick?: () => void }) {
  return (
    <div onClick={onClick} role={onClick ? "button" : undefined}
      style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", cursor: onClick ? "pointer" : "default", minWidth: 0, marginBottom: 6 }}>
      <div style={{ minWidth: 0, flex: 1 }}>{left}</div>{right}
    </div>
  );
}

function ExhibitorDrawer({ fx, id }: DrawerProps) {
  const r = rowById(id);
  if (!r) {
    return (
      <Drawer fx={fx} eyebrow="EXHIBITOR" title="Exhibitor not found">
        <Note>No exhibitor record matches “{id}”. It may still be a deal in Sales.</Note>
        <div style={{ marginTop: 12 }}><Btn size="sm" icon={PATHS.arrow} onClick={() => fx.goTo("Exhibitors", "onboarding")}>Open onboarding</Btn></div>
      </Drawer>
    );
  }
  const isPeak = r.id === "x-peak", isNova = r.id === "x-nova";
  const peakPaid = !!fx.acted["match-peak"];
  const peakReminded = !!fx.acted["remind-peak"];
  const a = assetsOf(r, fx);
  const outN = a.filter(isOut).length;
  const code = standOf(r, fx);
  const fl = floorOf(r);
  const deal = DEALS.find(d => d.id === r.deal);
  const contract = CONTRACTS.find(c => c.id === r.contractId);
  const invoices = INVOICES.filter(i => i.client === r.company);
  const speaker = SPEAKERS.find(s => s.id === r.speakerId);
  const front = frontOf(r.size);
  const listPrice = r.event === "ff" ? (front >= 4 ? 9800 : 4200) : front >= 4 ? 8900 : 3900;
  const value = deal?.value ?? contract?.value ?? listPrice;
  const deposit = Math.round(value * 0.3);
  const first = r.contact.split(" · ")[0];
  const signed = contract?.signed || (r.detail ? "Sep" : ["2 Jul", "18 Jul", "6 Aug", "21 Aug", "3 Sep", "12 Sep"][hash(r.id) % 6]);
  const tickets = isNova ? 10 : isPeak ? 8 : front >= 6 ? 12 : front >= 4 ? 8 : 4;
  const opsOwner = r.event === "ff" ? "Robyn Walsh" : "Conor Ryan";
  const rk = remindKey(r.id);

  const entitlements: [string, string][] = isNova ? NOVA.package
    : isPeak ? [["Exhibition stand", PEAK.size], ["Back wall", "Included"], ["Power", PEAK.power], ["Lighting", PEAK.lights], ["Workshop Stage 2 speaking slot", "1 × 30 min"], ["Social announcement posts", "2"], ["Website listing", "Partner page"], ["Partner tickets", "8"]]
    : [["Exhibition stand", r.size], ["Back wall", "Included"], ["Power", r.power], ["Lighting", r.lights], ...(r.hasSpeaker ? [["Speaking slot", "1 × 20 min"] as [string, string]] : []),
      ["Social announcement posts", front >= 4 ? "2" : "1"], ["Website listing", front >= 4 ? "Partner page" : "Exhibitor list"], ["Partner tickets", String(tickets)]];

  const flow = [
    { t: "DEAL", h: deal ? `Won · ${eur(deal.value)}` : "Won", d: deal ? `Sales · ${deal.owner}` : `Signed in HubSpot · ${r.owner}`, go: deal ? () => fx.open("deal", deal.id) : undefined },
    { t: "CONTRACT", h: contract ? `Signed ${contract.signed}` : `Signed ${signed}`, d: contract ? contract.payment : "30 / 70 split", go: contract ? () => fx.open("contract", contract.id) : undefined },
    ...invoices.slice(0, 1).map(i => ({ t: "INVOICE", h: i.no, d: isPeak ? (peakPaid ? "Deposit · Paid" : "Deposit · Match pending") : `${i.kind} · ${i.status}`, go: () => fx.goTo("Finance", "invoices", { kind: "invoice", id: i.id }) })),
    { t: "STAND", h: code ? `${code} · Zone ${zoneOfCode(code)}` : "Unplaced", d: r.size, go: code ? () => fx.open("stand", code) : () => fx.goTo("Exhibitors", "floorplan") },
    ...(speaker ? [{ t: "SPEAKER", h: speaker.name, d: speaker.session, go: () => fx.goTo("Production", "speakers", { kind: "speaker", id: speaker.id }) }] : []),
  ];

  const comms: [string, string, ReactNode][] = isPeak ? [
    ...(peakReminded ? [["Just now", "Pulse", "Reminder sent to Ellen Farrow: logo SVG, speaker headshot."] as [string, string, ReactNode]] : []),
    ["26 Sep", "Ellen Farrow", "“Our designer is exporting the SVG, should have it Monday. Hugh's headshot is being reshot.”"],
    ["26 Sep", "Xero", "€3,750 received from Peak Health Labs, ref PEAKHLTH."],
    ["24 Sep", "Pulse", "Asset reminder #1: logo SVG, speaker headshot."],
    ["8 Sep", "Daniel Murray", "Onboarding pack sent: portal link, stand spec form, asset checklist."],
  ] : isNova ? [
    ...(fx.acted["chase-nova"] ? [["Just now", "Pulse", "Deposit chase sent to Nova accounts for €5,400 (FE-2027-0412)."] as [string, string, ReactNode]] : []),
    ["25 Sep", "Pulse", "Deposit reminder #2 sent for FE-2027-0412."],
    ["24 Sep", "Dr Aoife Brennan", "(WhatsApp, re Main Stage deck) “I'll have this across tomorrow.”"],
    ["22 Sep", "Kathleen Corr", "Raised the 4m frontage query with Robyn Walsh."],
    ["17 Sep", "Pulse", "Onboarding pack sent: portal link, stand spec form, asset checklist."],
  ] : [
    ...(fx.acted[rk] ? [["Just now", "Pulse", "Reminder sent: " + (outN ? ASSET_TYPES.filter((_, j) => isOut(a[j])).join(", ").toLowerCase() : r.blocker.toLowerCase())] as [string, string, ReactNode]] : []),
    ...(r.court !== "ready" ? [["26 Sep", "Pulse", `Automatic reminder: ${r.blocker.toLowerCase()}.`] as [string, string, ReactNode]] : [["23 Sep", "Pulse", "All onboarding steps complete. Readiness moved to READY."] as [string, string, ReactNode]]),
    ["21 Sep", first, "“Thanks, we'll get everything over to you this week.”"],
    ["16 Sep", r.owner, "Onboarding pack sent: portal link, stand spec form, asset checklist."],
  ];

  const tasks: [string, string, string, (() => void)?][] = isPeak ? [
    ["Collect logo SVG", "Amy Byrne", "30 Sep"],
    ["Collect speaker headshot for Dr Hugh Tierney", "Sarah Keane", "30 Sep", () => fx.goTo("Production", "speakers", { kind: "speaker", id: "s-tierney" })],
    [peakPaid ? "Xero match approved (€3,750)" : "Approve Xero match €3,750 (96%)", "Robyn Walsh", peakPaid ? "Done" : "Today", () => fx.goTo("Finance", "reconciliation")],
    ["Review main-stage proximity request", "Robyn Walsh", "30 Oct"],
  ] : isNova ? [
    ["Chase €5,400 deposit", "Kathleen Corr", "Mon 28 Sep", () => fx.goTo("Finance", "invoices", { kind: "invoice", id: "i-nova-1" })],
    [novaMoved(fx) ? "Frontage resolved: moved to A05" : "Resolve 4m frontage on A07", "Robyn Walsh", novaMoved(fx) ? "Done" : "2 Oct"],
    ["Main Stage deck from Dr Aoife Brennan (overdue)", "Sarah Keane", "24 Sep", () => fx.goTo("Production", "speakers", { kind: "speaker", id: "s-brennan" })],
    ["Issue 10 partner tickets once deposit clears", "Conor Ryan", "After deposit"],
  ] : [
    ...(r.court !== "ready" ? [[r.blocker, r.court === "client" ? r.owner : opsOwner, "2 Oct"] as [string, string, string]] : []),
    ["Confirm build drawing", "Robyn Walsh", "29 Jan 2027"],
    ["Send customer ticket allocation form", "Conor Ryan", "15 Jan 2027"],
  ];

  const files: [string, string][] = [
    [`Contract_${r.company.replace(/[^A-Za-z]/g, "")}_signed.pdf`, `Signed ${signed}`],
    ...invoices.map(i => [`${i.no}_${i.kind.toLowerCase()}.pdf`, `${eur(i.amount)} · ${i.status}`] as [string, string]),
    [`Stand_spec_${code || "pending"}.pdf`, r.standDetails === "done" ? "Returned" : "Awaiting client"],
    ...(isPeak ? [["PeakHealthLabs_logo.png", "Low resolution, SVG requested"] as [string, string]] : []),
  ];

  const activity: [string, string, ReactNode][] = [
    ...(isNova && novaMoved(fx) ? [["Today", "Robyn Walsh", "Moved from A07 to A05 to meet the 4m frontage."] as [string, string, ReactNode]] : []),
    ...(isPeak && peakPaid ? [["Today", "Xero", "Deposit FE-2027-0388 reconciled, marked Paid."] as [string, string, ReactNode]] : []),
    [contract?.signed || signed, "HubSpot", `Deal won and contract signed. Pulse created this exhibitor record, raised deposit and balance invoices, generated 12 fulfilment obligations and ${r.hasSpeaker ? "a speaker slot" : "the stand spec request"}.`],
    [contract?.signed || signed, "Pulse", `Readiness scoring started at 10%. Now ${r.readiness}%.`],
  ];

  return (
    <Drawer fx={fx} width={680} eyebrow={`EXHIBITOR · ${EVENTS[r.event].name.toUpperCase()}`} title={r.company}
      badges={<><EventTag id={r.event} short={false} /><Status s={r.state} />{code && <Badge tone="ghost">Stand {code}</Badge>}<Badge tone={r.court === "client" ? "warn" : r.court === "internal" ? "info" : "ok"}>{r.court === "client" ? "Waiting on client" : r.court === "internal" ? "Internal action" : "Fully ready"}</Badge></>}
      actions={<>
        {code && <Btn kind="ghost" icon={PATHS.stand} onClick={() => fx.open("stand", code)}>Open stand</Btn>}
        {deal && <Btn kind="ghost" icon={PATHS.link} onClick={() => fx.open("deal", deal.id)}>Open deal</Btn>}
        {isNova && <ActBtn fx={fx} k="chase-nova" label="Chase deposit" doneLabel="Chase sent" toast="Deposit chase sent to Nova Fertility Clinic for €5,400 (FE-2027-0412)" />}
        {!isNova && (outN > 0 || r.court === "client") && <ActBtn fx={fx} k={rk} label="Send reminder" doneLabel="Reminder sent" toast={remindToast(r, fx)} />}
      </>}>

      <div style={{ display: "grid", gridTemplateColumns: "auto minmax(0,1fr)", gap: 16, alignItems: "center", padding: 14, borderRadius: 16, background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-1px", color: readyColor(r.readiness), fontVariantNumeric: "tabular-nums" }}>{r.readiness}%</div>
        <div style={{ minWidth: 0 }}>
          <Bar value={r.readiness} color={readyColor(r.readiness)} height={6} style={{ display: "block" }} />
          <Row gap={4} style={{ marginTop: 8 }}>
            {componentSteps(r, fx).map(([l, st]) => <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10.5, color: "var(--faint)", marginRight: 6 }}><StepDot s={st} />{({ C: "Contract", D: "Deposit", S: "Stand", A: "Assets", T: "Tickets", F: "Floor" } as Record<string, string>)[l]}</span>)}
          </Row>
          {r.blocker && <div style={{ fontSize: 12, color: "var(--dim)", marginTop: 6 }}>Next: {r.blocker}</div>}
        </div>
      </div>

      <div style={{ marginTop: 14 }}><Flow nodes={flow} /></div>

      {r.request && isPeak && <div style={{ marginTop: 12 }}><Note tone="accent"><b style={{ color: "var(--ink)" }}>Special request:</b> “{PEAK.request}” Logged for the 30 Oct floor-plan lock.</Note></div>}
      {r.request && !isPeak && !isNova && <div style={{ marginTop: 12 }}><Note><b style={{ color: "var(--ink)" }}>Special request:</b> {r.request}</Note></div>}
      {isNova && (
        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          <Note tone="bad">Deposit of €5,400 (FE-2027-0412) is {NOVA.daysOverdue} days overdue. This blocks the 10 partner tickets and final floor placement.</Note>
          {!novaMoved(fx)
            ? <Note tone="warn"><Row gap={10} style={{ alignItems: "center" }}><span className="fx-grow">Floor conflict: {NOVA.conflict}</span><ActBtn fx={fx} k="resolve-nova-frontage" size="sm" label="Move to A05" doneLabel="Moved" toast={NOVA_TOAST} /></Row></Note>
            : <Note>Frontage resolved: now held on A05 (4m). Confirmation follows the deposit.</Note>}
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        <Sec title="COMMERCIAL">
          <KV cols={3} items={[["Package", r.pkg], ["Contract value", eur(value)], ["Account owner", r.owner], ["Contract", contract ? `Signed ${contract.signed}` : `Signed ${signed}`], ["Payment terms", "30% deposit · 70% by 1 Feb 2027"], ["Source", deal ? <button className="fx-link" onClick={() => fx.open("deal", deal.id)}>HubSpot deal · Won</button> : "HubSpot deal · Won"]]} />
        </Sec>

        <Sec title="FINANCIAL" right={<button className="fx-link" onClick={() => fx.goTo("Finance", "invoices")}>Finance</button>}>
          {invoices.length ? invoices.map(i => {
            const st = i.id === "i-peak-1" ? (peakPaid ? "Paid" : "Match pending") : i.status;
            return (
              <ListRow key={i.id} onClick={() => fx.goTo("Finance", "invoices", { kind: "invoice", id: i.id })}
                left={<><div style={{ fontSize: 12.5, color: "var(--ink)", fontWeight: 500 }}>{i.no} · {i.kind}</div><div style={{ fontSize: 11, color: "var(--faint)" }}>Due {i.due}{i.days ? ` · ${i.days} days overdue` : ""}{i.lastReminder ? ` · last reminder ${i.lastReminder}` : ""}</div></>}
                right={<Row gap={10}><span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{eur(i.amount)}</span><Status s={st} /></Row>} />
            );
          }) : (
            <>
              <ListRow left={<><div style={{ fontSize: 12.5, color: "var(--ink)", fontWeight: 500 }}>Deposit · 30%</div><div style={{ fontSize: 11, color: "var(--faint)" }}>{r.deposit === "done" ? "Matched in Xero" : r.blocker}</div></>}
                right={<Row gap={10}><span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{eur(deposit)}</span><Status s={r.deposit === "done" ? "Paid" : "Pending"} /></Row>} />
              <ListRow left={<><div style={{ fontSize: 12.5, color: "var(--ink)", fontWeight: 500 }}>Balance · 70%</div><div style={{ fontSize: 11, color: "var(--faint)" }}>Due 1 Feb 2027</div></>}
                right={<Row gap={10}><span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{eur(value - deposit)}</span><Status s="Scheduled" /></Row>} />
            </>
          )}
          {isPeak && (
            <Note tone={peakPaid ? undefined : "warn"}>
              <Row gap={10} style={{ alignItems: "center" }}>
                <span className="fx-grow">{peakPaid ? "Deposit €3,750 reconciled in Xero. Balance €8,750 due 1 Feb 2027." : "€3,750 received 26 Sep (AIB, ref PEAKHLTH). Xero match waiting for approval at 96% confidence."}</span>
                {!peakPaid && <Btn size="sm" onClick={() => fx.goTo("Finance", "reconciliation")}>Review match</Btn>}
              </Row>
            </Note>
          )}
        </Sec>

        <Sec title="STAND SPECIFICATION" right={code ? <button className="fx-link" onClick={() => fx.open("stand", code)}>Open stand {code}</button> : undefined}>
          <KV cols={3} items={[["Stand", code || "Not placed"], ["Zone", code ? "Zone " + zoneOfCode(code) : "TBC"], ["Dimensions", r.size], ["Power", r.power], ["Lighting", r.lights], ["Back wall", "Included"],
            ["Frontage", isNova ? (novaMoved(fx) ? "4m (A05)" : "Needs 4m · A07 gives 3m") : `${front}m`], ["Spec form", r.standDetails === "done" ? "Returned" : "Awaiting client"], ["Build status", fl === "placed" ? (r.standDetails === "done" ? "Confirmed" : "Spec pending") : fl === "provisional" ? "Provisional" : "Unplaced"]]} />
        </Sec>

        <Sec title="PEOPLE">
          <ListRow left={<Row gap={10}><Avatar name={first} size={28} /><div><div style={{ fontSize: 12.5, color: "var(--ink)", fontWeight: 500 }}>{first}</div><div style={{ fontSize: 11, color: "var(--faint)" }}>{r.contact.split(" · ")[1] || "Primary contact"} · primary contact</div></div></Row>} right={<Icon d={PATHS.mail} style={{ color: "var(--dim)" }} />} />
          {speaker && (
            <ListRow onClick={() => fx.goTo("Production", "speakers", { kind: "speaker", id: speaker.id })}
              left={<Row gap={10}><Avatar name={speaker.name} size={28} /><div><div style={{ fontSize: 12.5, color: "var(--ink)", fontWeight: 500 }}>{speaker.name}</div><div style={{ fontSize: 11, color: "var(--faint)" }}>Speaker · {speaker.session} · {speaker.stage}</div></div></Row>}
              right={<Status s={speaker.status} />} />
          )}
          <ListRow left={<Row gap={10}><Avatar name={r.owner} size={28} bg={teamBg(r.owner)} /><div><div style={{ fontSize: 12.5, color: "var(--ink)", fontWeight: 500 }}>{r.owner}</div><div style={{ fontSize: 11, color: "var(--faint)" }}>Account owner</div></div></Row>} />
          <ListRow left={<Row gap={10}><Avatar name={opsOwner} size={28} bg={teamBg(opsOwner)} /><div><div style={{ fontSize: 12.5, color: "var(--ink)", fontWeight: 500 }}>{opsOwner}</div><div style={{ fontSize: 11, color: "var(--faint)" }}>Operations · stand, tickets, logistics</div></div></Row>} />
        </Sec>

        <Sec title="MARKETING ASSETS" right={outN ? <Badge tone="bad">{outN} outstanding</Badge> : <Badge tone="ok">Complete</Badge>}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 6 }}>
            {ASSET_TYPES.map((t, j) => a[j] !== "na" && (
              <Row key={t} gap={8} style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)", background: isOut(a[j]) ? "var(--bad-soft)" : "var(--surface)" }}>
                <AssetDot s={a[j]} />
                <span style={{ fontSize: 12, color: "var(--ink)" }} className="fx-grow">{isPeak && j === 0 ? "Logo SVG" : isPeak && j === 2 ? "Speaker headshot" : t}</span>
                <span style={{ fontSize: 11, color: isOut(a[j]) ? (a[j] === "missing" ? "var(--bad)" : "var(--warn)") : "var(--dim)" }}>{assetLabel(a[j], isPeak && peakReminded)}</span>
              </Row>
            ))}
          </div>
          {outN > 0 && <div style={{ marginTop: 8 }}><ActBtn fx={fx} k={rk} size="sm" label="Send reminder" doneLabel={isPeak ? "Reminder sent · Requested" : "Reminder sent"} toast={remindToast(r, fx)} /></div>}
        </Sec>

        <Sec title="ENTITLEMENTS">
          <KV cols={2} items={entitlements.map(([k, v]) => [k, v] as [ReactNode, ReactNode])} />
        </Sec>

        <Sec title="TICKETS">
          <KV cols={3} items={isNova
            ? [["Partner tickets", "10"], ["Issued", "0 · on hold"], ["Blocked by", "Deposit FE-2027-0412"]]
            : [["Partner tickets", String(tickets)], ["Issued", r.tickets === "done" ? String(tickets) : "0"], ["Claimed", r.tickets === "done" ? String(Math.max(0, tickets - 3)) : "0"], ["Customer allocation", "List due 15 Jan 2027"], ["Exhibitor passes", String(front >= 4 ? 4 : 2)], ["Status", r.tickets === "done" ? "Issued" : "On hold"]]} />
        </Sec>

        <Sec title="ACCOMMODATION">
          <Note>Ballsbridge partner hotel rate shared {r.state === "READY" ? "22 Sep" : "once onboarding completes"}. {front >= 4 ? "2 rooms" : "1 room"} requested for 12 to 14 Mar 2027, booked by the exhibitor direct.</Note>
        </Sec>

        <Sec title="PARKING">
          <KV cols={3} items={[["Exhibitor car passes", front >= 4 ? "2" : "1"], ["Load-in slot", r.zone === "A" || r.zone === "B" ? "Fri 12 Mar · 10:00" : "Fri 12 Mar · 13:00"], ["Pack", "Parking information goes out 12 Feb 2027"]]} />
        </Sec>

        <Sec title="FLOOR PLAN" right={<button className="fx-link" onClick={() => fx.goTo("Exhibitors", "floorplan")}>Floor plan</button>}>
          <KV cols={3} items={[["Position", code ? `${code} · Zone ${zoneOfCode(code)}` : "Unplaced"], ["Status", fl === "placed" ? "Confirmed" : fl === "provisional" ? "Provisional hold" : "Awaiting placement"],
            ["Conflicts", isNova && !novaMoved(fx) ? "Frontage: needs 4m" : r.id === "x-ferro" && !fx.acted["exhibitors-ferro-power"] ? "Power exceeds circuit" : "None"]]} />
        </Sec>

        <Sec title="COMMUNICATION">
          <Timeline items={comms} />
        </Sec>

        <Sec title="TASKS">
          {tasks.map(([t, who, due, go], i) => (
            <ListRow key={i} onClick={go} left={<Row gap={8}><StepDot s={due === "Done" ? "done" : /Today|Sep/.test(due) ? "pending" : "na"} /><span style={{ fontSize: 12.5, color: "var(--ink)" }}>{t}</span></Row>}
              right={<Row gap={8}><Avatar name={who} size={20} bg={teamBg(who)} /><span style={{ fontSize: 11, color: "var(--dim)", minWidth: 64, textAlign: "right" }}>{due}</span></Row>} />
          ))}
        </Sec>

        <Sec title="FILES">
          {files.map(([f, d]) => (
            <ListRow key={f} left={<Row gap={8}><Icon d={PATHS.doc} style={{ color: "var(--dim)" }} /><div style={{ minWidth: 0 }}><div style={{ fontSize: 12.5, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis" }}>{f}</div><div style={{ fontSize: 11, color: "var(--faint)" }}>{d}</div></div></Row>} />
          ))}
        </Sec>

        <Sec title="ACTIVITY">
          <Timeline items={activity} />
        </Sec>
      </div>
    </Drawer>
  );
}

function StandDrawer({ fx, id }: DrawerProps) {
  const code = (id || "").toUpperCase();
  const st = floorModel(fx).get(code);
  if (!st) {
    return (
      <Drawer fx={fx} eyebrow="STAND" title={`Stand ${id}`}>
        <Note>Stand {id} is not on the 2027 RDS floor plan.</Note>
        <div style={{ marginTop: 12 }}><Btn size="sm" icon={PATHS.arrow} onClick={() => fx.goTo("Exhibitors", "floorplan")}>Open floor plan</Btn></div>
      </Drawer>
    );
  }
  const o = st.occ;
  const nearStage = (st.zone === "A" || st.zone === "B") && st.row <= 2;
  const posText = `Zone ${st.zone} (${ZONE_NAME[st.zone].toLowerCase()}) · row ${st.row}${nearStage ? ", facing the main stage" : ""}`;

  if (!o) {
    const fits = ROWS.filter(r => floorOf(r) === "unplaced" && frontOf(r.size) <= st.front && !fx.acted["exhibitors-reshuffle-" + r.id]).slice(0, 4);
    const reservedForNova = code === "A05" && !novaMoved(fx);
    return (
      <Drawer fx={fx} eyebrow={`STAND ${code} · ZONE ${st.zone}`} title="Available stand" badges={<><Badge tone="ghost">Available</Badge><Badge tone="ghost">{sizeOf(st.front)}</Badge></>}>
        <Sec title="STAND">
          <KV cols={2} items={[["Dimensions", sizeOf(st.front)], ["Position", posText], ["Power", powerOf(st.front)], ["Lighting", lightsOf(st.front)],
            ["List price, Fertility", st.front >= 4 ? INVENTORY.ff[1].price : INVENTORY.ff[0].price], ["List price, Men's Health", st.front >= 4 ? INVENTORY.mh[1].price : INVENTORY.mh[0].price]]} />
        </Sec>
        {reservedForNova ? (
          <Sec title="RESERVED">
            <Note tone="warn"><Row gap={10} style={{ alignItems: "center" }}><span className="fx-grow">Held as the fix for Nova Fertility Clinic's 4m frontage conflict on A07.</span><ActBtn fx={fx} k="resolve-nova-frontage" size="sm" label="Move Nova here" doneLabel="Moved" toast={NOVA_TOAST} /></Row></Note>
          </Sec>
        ) : (
          <Sec title="SUGGESTED FROM THE UNPLACED LIST">
            {fits.length ? fits.map(r => (
              <ListRow key={r.id} left={<Row gap={8}><EvDot e={r.event} /><div style={{ minWidth: 0 }}><div style={{ fontSize: 12.5, color: "var(--ink)", fontWeight: 500 }}>{r.company}</div><div style={{ fontSize: 11, color: "var(--faint)" }}>{r.size}{r.request ? " · " + r.request : ""}</div></div></Row>}
                right={<Btn size="sm" onClick={() => holdStand(fx, r, code)}>Hold {code}</Btn>} />
            )) : <Note>No unplaced exhibitor fits a {st.front}m frontage right now.</Note>}
          </Sec>
        )}
      </Drawer>
    );
  }

  const isPeak = o.id === "x-peak";
  const build = st.status === "conflict" ? "Conflict" : st.status === "provisional" ? "Provisional" : o.standDetails === "done" ? "Confirmed" : "Spec pending";
  const request = isPeak ? "Main-stage proximity request" : o.id === "x-nova" ? "4m frontage" : o.id === "x-ferro" ? "Extra power for recovery pods" : o.request || "None";
  return (
    <Drawer fx={fx} eyebrow={`STAND ${code} · ZONE ${st.zone}`} title={o.company}
      badges={<><EventTag id={o.event} short={false} /><Status s={build} /><Badge tone="ghost">{o.size}</Badge></>}
      actions={<><Btn kind="ghost" icon={PATHS.arrow} onClick={() => fx.goTo("Exhibitors", "floorplan")}>Floor plan</Btn><Btn kind="primary" icon={PATHS.users} onClick={() => fx.open("exhibitor", o.id)}>Open exhibitor</Btn></>}>
      <Sec title="STAND">
        <KV cols={2} items={[["Exhibitor", o.company], ["Event", EVENTS[o.event].name], ["Dimensions", o.size], ["Power", o.power], ["Lighting", o.lights], ["Back wall", "Included"],
          ["Build status", build], ["Position", posText], ["Request", request], ["Readiness", `${o.readiness}% · ${o.state}`]]} />
      </Sec>
      {isPeak && (
        <Sec title="SPECIAL REQUEST">
          <Note tone="accent">“{PEAK.request}” B14 is row 3 of Zone B, about 18m from the stage edge. No 4m stand closer to the stage is free today, so this sits on the list for the 30 Oct floor-plan lock.</Note>
        </Sec>
      )}
      {st.status === "conflict" && o.id === "x-nova" && (
        <Sec title="CONFLICT">
          <Note tone="bad"><Row gap={10} style={{ alignItems: "center" }}><span className="fx-grow">{NOVA.conflict} A05 has 4m frontage and is free.</span><ActBtn fx={fx} k="resolve-nova-frontage" size="sm" label="Move to A05 (4m frontage)" doneLabel="Moved" toast={NOVA_TOAST} /></Row></Note>
        </Sec>
      )}
      {st.status === "conflict" && o.id === "x-ferro" && (
        <Sec title="CONFLICT">
          <Note tone="bad"><Row gap={10} style={{ alignItems: "center" }}><span className="fx-grow">Requested load is about 4.5kW. C22 sits on a shared 16A circuit rated 3.6kW.</span><ActBtn fx={fx} k="exhibitors-ferro-power" size="sm" label="Request 32A supply" doneLabel="Requested" toast={FERRO_TOAST} /></Row></Note>
        </Sec>
      )}
      {o.id === "x-nova" && novaMoved(fx) && <Sec title="HISTORY"><Note>Moved from A07 (3m frontage) to A05 (4m). Held provisionally until the €5,400 deposit clears.</Note></Sec>}
      <Sec title="BUILD">
        <KV cols={3} items={[["Shell scheme", "Octanorm, white"], ["Fascia", o.company], ["Carpet", "Charcoal"], ["Spec form", o.standDetails === "done" ? "Returned" : "Awaiting client"], ["Electrics", o.id === "x-ferro" && !fx.acted["exhibitors-ferro-power"] ? "Circuit review" : "Approved"], ["Load-in", st.zone === "A" || st.zone === "B" ? "Fri 12 Mar · 10:00" : "Fri 12 Mar · 13:00"]]} />
      </Sec>
    </Drawer>
  );
}

export const drawers: Record<string, (p: DrawerProps) => JSX.Element> = {
  exhibitor: ExhibitorDrawer,
  stand: StandDrawer,
};
