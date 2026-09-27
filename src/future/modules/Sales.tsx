/* Sales: Overview · Pipeline · Deals · Contracts · Inventory · Forecast.
   Drawers owned here: `deal` (DEALS ids) and `contract` (CONTRACTS ids).
   Story numbers come from data.ts; the funnel, revenue mix, owner split and
   per-event forecast below are local roll-ups that reconcile to KPIS. */
import { useState, type CSSProperties, type ReactNode } from "react";
import type { ModuleProps, DrawerProps, Fx } from "../types";
import {
  DEALS, CONTRACTS, INVENTORY, KPIS, FORECAST, FORECAST_MONTHS, NOVA, PEAK, INVOICES, EXHIBITORS, SPEAKERS, TEAM, CANADA, RECON, EVENTS, STAGES,
  eur, eurK, type Deal, type Stage, type EventId, type EventFilter,
} from "../data";
import {
  Page, PageHead, Card, Kpis, Badge, Status, EventTag, Btn, ActBtn, Avatar, Bar, Meter, Table, Chips, Drawer, Sec, KV, Note, LineChart, Donut,
  Fig, Row, Icon, PATHS, inEvent, evColor, evSoft, type Tone, type Col,
} from "../ui";

/* ── Local roll-ups (reconcile to KPIS) ─────────────────────────────────── */
type Ev2 = "ff" | "mh";
const OPEN: Stage[] = ["New Lead", "Qualified", "Proposal", "Negotiation", "Contract Sent"];
const LATE: Stage[] = ["Negotiation", "Contract Sent"];

/* Open funnel incl. unnamed HubSpot leads: [deals, value]. ff 338,000 · mh 264,000 = 602,000.
   Negotiation + Contract Sent: ff 158,500 · mh 108,000 = 266,500 (late-stage). */
const FUNNEL: Record<Ev2, Record<string, [number, number]>> = {
  ff: { "New Lead": [14, 72500], Qualified: [9, 58000], Proposal: [6, 49000], Negotiation: [7, 71500], "Contract Sent": [8, 87000] },
  mh: { "New Lead": [12, 58000], Qualified: [8, 52500], Proposal: [5, 45500], Negotiation: [6, 56000], "Contract Sent": [5, 52000] },
};

/* Revenue by package type. contracted sums to KPIS contracted, late to lateStage, pipeline to pipeline. */
const PKG_TYPES = ["Stands", "Sponsorship", "Stage & workshop slots", "Activations", "Media & digital"];
const PKG_COLORS = ["var(--accent)", "var(--ev-ca)", "var(--ev-mh)", "var(--dim)", "var(--faint)"];
const MIX: Record<Ev2, { contracted: number[]; late: number[]; pipeline: number[] }> = {
  ff: { contracted: [139600, 72800, 17900, 9600, 6100], late: [78500, 42000, 21000, 10500, 6500], pipeline: [164000, 96000, 38500, 24000, 15500] },
  mh: { contracted: [118300, 18000, 21500, 8700, 5500], late: [52000, 18000, 24000, 9000, 5000], pipeline: [118000, 86000, 31000, 18500, 10500] },
};
const INV_TYPE: Record<string, number> = {
  "Standard Stands": 0, "Premium Stands": 0, "Headline Sponsorship": 1, "Stage Sponsorship": 1,
  "Main Stage Commercial Slots": 2, "Workshop Slots": 2, "Brand Activations": 3, "Newsletter Placements": 4, "Social Packages": 4,
};

/* Owner split: [contracted, open pipeline]. Kathleen 262,400 / 351,000 · Daniel 155,600 / 251,000. */
const OWNERS: Record<Ev2, Record<string, [number, number]>> = {
  ff: { "Kathleen Corr": [214000, 281000], "Daniel Murray": [32000, 57000] },
  mh: { "Kathleen Corr": [48400, 70000], "Daniel Murray": [123600, 194000] },
};

/* Per-event forecast end points (€k, March). Sums match FORECAST: 668 / 789 / 1020 / 760. */
const FC_START: Record<Ev2, number> = { ff: 246, mh: 172 };
const FC_END: Record<Ev2, { contracted: number; weighted: number; bestCase: number; target: number }> = {
  ff: { contracted: 393, weighted: 458, bestCase: 584, target: 440 },
  mh: { contracted: 275, weighted: 331, bestCase: 436, target: 320 },
};
function fcFor(e: EventFilter) {
  if (e !== "ff" && e !== "mh") return FORECAST;
  const s = FC_START[e], end = FC_END[e];
  const scale = (arr: number[], endE: number) => {
    const a0 = arr[0], aN = arr[arr.length - 1];
    return arr.map(v => Math.round(s + ((v - a0) * (endE - s)) / (aN - a0)));
  };
  return {
    contracted: scale(FORECAST.contracted, end.contracted), weighted: scale(FORECAST.weighted, end.weighted),
    bestCase: scale(FORECAST.bestCase, end.bestCase), target: FORECAST.target.map(() => end.target),
  };
}

const SIGNERS: Record<string, string> = {
  "c-nova": "Dr Aoife Brennan · Medical Director", "c-peak": "Ellen Farrow · Marketing Lead", "c-efn": "Dr Lars Ostberg · Partnerships Director",
  "c-lumen": "Rachel Dunne · Commercial Lead", "c-green": "Kevin Molloy · Marketing Manager",
};
const STAKE: Record<string, [string, string][]> = {
  "d-nova-up": [["Dr Aoife Brennan", "Medical Director · sponsor of the upgrade"], ["Martina Kehoe", "Practice Director · budget holder"]],
  "d-efn": [["Dr Lars Ostberg", "Partnerships Director · signatory"], ["Mireille Janssen", "Events Lead"]],
  "d-orbit": [["Fiona Hegarty", "Head of Brand · champion"], ["Orbit board", "Decision meeting 9 Oct"]],
  "d-harb": [["Dr Colm Ward", "Clinical Director"], ["Áine Kiely", "Marketing Manager"]],
  "d-atlas": [["Gareth Byrne", "Founder · signs off pricing"]],
  "d-lumen": [["Rachel Dunne", "Commercial Lead · signatory"]],
  "d-green": [["Kevin Molloy", "Marketing Manager · signatory"], ["Deirdre Fox", "Finance"]],
  "d-mpi": [["Shane Coughlan", "Programme Director"]],
  "d-bloom": [["Laura Finn", "Clinic Manager"]],
  "d-vit": [["Tomás Reilly", "Head of Growth"]],
  "d-luna": [["Dr Maeve Horan", "Founder"]],
  "d-kin": [["Eoin Barry", "Co-founder"]],
  "d-cal": [["Clodagh Nash", "Practice Owner"]],
  "d-north": [["Ruairí Dolan", "Clinic Owner"]],
  "d-core": [["Ivan Byrne", "Director"]],
};

/* ── Helpers ────────────────────────────────────────────────────────────── */
const STAGE_TONE: Record<Stage, Tone> = {
  "New Lead": "ghost", Qualified: undefined, Proposal: "info", Negotiation: "warn", "Contract Sent": "accent", Won: "ok", Lost: "bad",
};
const StageBadge = ({ s }: { s: Stage }) => <Badge tone={STAGE_TONE[s]}>{s}</Badge>;
const isOpen = (s: Stage) => OPEN.includes(s);
const teamBg = (name: string) => TEAM.find(t => t.name === name)?.bg;
const evList = (f: EventFilter): Ev2[] => (f === "ff" ? ["ff"] : f === "mh" ? ["mh"] : ["ff", "mh"]);
const priceNum = (p: string) => Number(p.replace(/[^\d]/g, ""));
const sum = (a: number[]) => a.reduce((s, x) => s + x, 0);
const grid = (c: string, gap = 14, mb = 14): CSSProperties => ({ display: "grid", gridTemplateColumns: c, gap, marginBottom: mb });
type Contract = typeof CONTRACTS[number];
const contractFor = (d: Deal) => CONTRACTS.find(c => c.client === d.company && c.value === d.value);
const dealFor = (c: Contract) => DEALS.find(d => d.company === c.client && d.value === c.value);
const cNo = (c: Contract) => "AGR-2027-" + String(101 + CONTRACTS.indexOf(c));
const templateOf = (d?: Deal) => (d?.type === "Sponsorship" ? "Sponsorship Agreement" : d?.type === "Speaking" ? "Commercial Speaking Agreement" : "Exhibitor Agreement");
const MON: Record<string, number> = { Jan: 0, Feb: 31, Mar: 59, Apr: 90, May: 120, Jun: 151, Jul: 181, Aug: 212, Sep: 243, Oct: 273, Nov: 304, Dec: 334 };
const doy = (s: string) => { const [d, m] = s.split(" "); return (MON[m] ?? 0) + Number(d); };
const TODAY_DOY = doy("27 Sep");
const closeLabel = (d: Deal) => {
  if (d.stage === "Won") { const c = contractFor(d); return c?.signed ? "Signed " + c.signed : "Signed"; }
  if (d.stage === "Lost") return "Closed";
  return d.closing ?? "TBC";
};
const weighted = (d: Deal) => Math.round((d.value * d.prob) / 100);
const small: CSSProperties = { fontSize: 11.5, color: "var(--dim)" };
const ell: CSSProperties = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 };
const cap: CSSProperties = { fontSize: 10, fontWeight: 700, letterSpacing: ".11em", color: "var(--faint)" };

/* ── Obligations: every line item becomes a record somewhere else ─────── */
type ModName = "Exhibitors" | "Finance" | "Production" | "Growth";
type Ob = { item: string; record: string; mod: ModName; owner: string; status: string; go?: () => void };
type Exh = typeof EXHIBITORS[number];
const exState = (x: Exh) => `${x.state === "READY" ? "Ready" : x.state === "BLOCKED" ? "Blocked" : "At risk"} · ${x.readiness}%`;

function novaObs(fx: Fx): Ob[] {
  return [
    { item: "Exhibition stand · 4m x 2m", record: "Exhibitor record + stand A07, Zone A", mod: "Exhibitors", owner: "Robyn Walsh",
      status: fx.acted["resolve-nova-frontage"] ? "Complete · 4m frontage" : "Frontage conflict", go: () => fx.goTo("Exhibitors", "floorplan", { kind: "stand", id: "A07" }) },
    { item: "Back wall · 2 power sockets · 2 lights", record: "Stand spec + electrical order", mod: "Exhibitors", owner: "Robyn Walsh", status: "Received",
      go: () => fx.goTo("Exhibitors", "onboarding", { kind: "exhibitor", id: "x-nova" }) },
    { item: "Main Stage speaking slot · 20 min", record: "Speaker Dr Aoife Brennan · Main Stage 1 session", mod: "Production", owner: "Sarah Keane",
      status: fx.acted["nudge-brennan"] ? "Deck nudge sent" : "Deck overdue · blocking AV", go: () => fx.goTo("Production", "presentations", { kind: "speaker", id: "s-brennan" }) },
    { item: "2 social announcement posts", record: "2 content items · Growth calendar", mod: "Growth", owner: "Amy Byrne", status: "1 scheduled · 1 draft",
      go: () => fx.goTo("Growth", "content") },
    { item: "Website listing", record: "Partner page listing", mod: "Growth", owner: "Amy Byrne", status: "Live", go: () => fx.goTo("Growth", "content") },
    { item: "10 partner tickets", record: "10-ticket allocation", mod: "Exhibitors", owner: "Conor Ryan", status: "Codes pending",
      go: () => fx.goTo("Exhibitors", "fulfilment") },
    { item: "Deposit 30% · " + eur(NOVA.deposit), record: "Invoice FE-2027-0412 · due 23 Sep", mod: "Finance", owner: "Kathleen Corr",
      status: fx.acted["chase-nova"] ? "Overdue · reminder #3 sent" : "Overdue 4 days", go: () => fx.goTo("Finance", "invoices", { kind: "invoice", id: "i-nova-1" }) },
    { item: "Balance 70% · " + eur(NOVA.balance), record: "Invoice FE-2027-0413 · due 1 Feb 2027", mod: "Finance", owner: "Kathleen Corr", status: "Scheduled",
      go: () => fx.goTo("Finance", "invoices", { kind: "invoice", id: "i-nova-2" }) },
  ];
}

function peakObs(fx: Fx): Ob[] {
  return [
    { item: "Exhibition stand · 4m x 2m", record: "Exhibitor record + stand B14, Zone B", mod: "Exhibitors", owner: "Robyn Walsh", status: "At risk · 78% ready",
      go: () => fx.goTo("Exhibitors", "floorplan", { kind: "stand", id: "B14" }) },
    { item: "Back wall · 2 power sockets · 2 lights", record: "Stand spec + electrical order", mod: "Exhibitors", owner: "Robyn Walsh", status: "Received",
      go: () => fx.goTo("Exhibitors", "onboarding", { kind: "exhibitor", id: "x-peak" }) },
    { item: "Workshop speaking slot", record: "Speaker Dr Hugh Tierney · Workshop Stage 2", mod: "Production", owner: "Sarah Keane", status: "Headshot missing",
      go: () => fx.goTo("Production", "speakers", { kind: "speaker", id: "s-tierney" }) },
    { item: "Website + exhibitor listing", record: "Brand asset request", mod: "Growth", owner: "Amy Byrne",
      status: fx.acted["remind-peak"] ? "Reminder sent" : "Logo SVG missing", go: () => fx.goTo("Exhibitors", "assets", { kind: "exhibitor", id: "x-peak" }) },
    { item: "2 social announcement posts", record: "2 content items · Growth calendar", mod: "Growth", owner: "Amy Byrne", status: "Waiting on logo",
      go: () => fx.goTo("Growth", "content") },
    { item: "8 partner tickets", record: "8-ticket allocation", mod: "Exhibitors", owner: "Conor Ryan", status: "Complete", go: () => fx.goTo("Exhibitors", "fulfilment") },
    { item: "Deposit 30% · " + eur(PEAK.deposit), record: "Invoice FE-2027-0388 · received 26 Sep", mod: "Finance", owner: "Daniel Murray",
      status: fx.acted["match-peak"] ? "Paid · reconciled" : "Match pending · 96%", go: () => fx.goTo("Finance", "invoices", { kind: "invoice", id: "i-peak-1" }) },
    { item: "Balance 70% · " + eur(PEAK.balance), record: "Invoice FE-2027-0389 · due 1 Feb 2027", mod: "Finance", owner: "Daniel Murray", status: "Scheduled",
      go: () => fx.goTo("Finance", "invoices", { kind: "invoice", id: "i-peak-2" }) },
  ];
}

function genericObs(fx: Fx, d: Deal): Ob[] {
  const signed = d.stage === "Won";
  const p = d.pkg.toLowerCase();
  const ex = EXHIBITORS.find(x => x.company === d.company);
  const sp = SPEAKERS.find(s => s.org === d.company);
  const wait = "On signature";
  const out: Ob[] = [];
  const exGo = () => fx.goTo("Exhibitors", "onboarding", ex ? { kind: "exhibitor", id: ex.id } : undefined);
  if (p.includes("stand")) {
    const kind = p.includes("premium") ? "Premium stand" : "Standard stand";
    out.push({ item: kind + (ex ? " · " + ex.size : ""), mod: "Exhibitors", owner: "Robyn Walsh", go: exGo,
      record: ex ? `Exhibitor record + stand ${ex.stand || "to place"}${ex.zone ? ", Zone " + ex.zone : ""}` : "Exhibitor record + stand spec",
      status: signed ? (ex ? exState(ex) : "Onboarding started") : wait });
    out.push({ item: "Back wall, power and lighting", record: "Stand spec + electrical order", mod: "Exhibitors", owner: "Robyn Walsh", go: exGo,
      status: signed ? (ex?.standDetails === "done" ? "Received" : "Requested") : wait });
    out.push({ item: "Partner tickets", record: "Exhibitor ticket allocation", mod: "Exhibitors", owner: "Conor Ryan", go: () => fx.goTo("Exhibitors", "fulfilment"),
      status: signed ? (ex?.tickets === "done" ? "Complete" : "Codes pending") : wait });
  }
  if (p.includes("activation")) {
    out.push({ item: "Brand activation space", record: "Activation plan + power request", mod: "Exhibitors", owner: "Robyn Walsh", go: exGo,
      status: signed ? (ex?.request ? "In progress" : "Requested") : wait });
  }
  if (p.includes("sponsorship")) {
    const what = p.includes("headline") ? "Headline sponsorship" : p.includes("workshop") ? "Workshop sponsorship" : "Stage sponsorship";
    out.push({ item: what, mod: "Production", owner: "Sarah Keane", go: () => fx.goTo("Production", "programme"),
      record: what === "Workshop sponsorship" ? "Workshop stage naming + hosted session" : what === "Headline sponsorship" ? "Event naming + main stage branding" : "Stage naming + branding brief",
      status: signed ? "Approved" : wait });
    out.push({ item: "Sponsor marketing entitlements", record: "Logo placements + partner toolkit", mod: "Growth", owner: "Amy Byrne",
      go: () => fx.goTo("Growth", "partners"), status: signed ? "Received" : wait });
  }
  if (/(slot|speaker|workshop)/.test(p) && !p.includes("sponsorship")) {
    const main = p.includes("main stage");
    const match = sp && (main ? sp.stage.startsWith("Main") : sp.stage.startsWith("Workshop")) ? sp : undefined;
    out.push({ item: main ? "Main Stage commercial slot" : p.includes("workshop") ? "Workshop slot" : "Speaker slot", mod: "Production", owner: "Sarah Keane",
      record: match ? `Speaker ${match.name} · ${match.stage}` : main ? "Speaker record + Main Stage session" : "Workshop session + speaker brief",
      status: signed ? (match ? match.status : "Speaker details requested") : wait,
      go: () => (match ? fx.goTo("Production", "speakers", { kind: "speaker", id: match.id }) : fx.goTo("Production", "programme")) });
  }
  if (p.includes("newsletter")) out.push({ item: "Newsletter placement", record: "Newsletter slot · Antidote list", mod: "Growth", owner: "Amy Byrne", status: signed ? "Scheduled" : wait, go: () => fx.goTo("Growth", "content") });
  if (p.includes("social")) out.push({ item: "Social announcement post", record: "Content item · Growth calendar", mod: "Growth", owner: "Amy Byrne", status: signed ? (ex?.logo === "done" ? "Scheduled" : "Waiting on logo") : wait, go: () => fx.goTo("Growth", "content") });
  if (p.includes("competition")) out.push({ item: "Audience competition", record: "Competition mechanic + T&Cs", mod: "Growth", owner: "Amy Byrne", status: signed ? "Draft" : wait, go: () => fx.goTo("Growth", "campaigns") });
  if (!out.length) out.push({ item: d.pkg, record: "Fulfilment record", mod: "Exhibitors", owner: "Robyn Walsh", status: signed ? "Requested" : wait, go: exGo });

  const invs = INVOICES.filter(i => i.client === d.company && i.deal === d.value);
  const invGo = (id?: string) => () => fx.goTo("Finance", "invoices", id ? { kind: "invoice", id } : undefined);
  const full = invs.find(i => i.kind === "Full");
  if (full) {
    out.push({ item: "Full payment · " + eur(full.amount), record: `Invoice ${full.no}`, mod: "Finance", owner: d.owner, status: full.status, go: invGo(full.id) });
    return out;
  }
  const dep = Math.round(d.value * 0.3), bal = d.value - dep;
  const di = invs.find(i => i.kind === "Deposit"), bi = invs.find(i => i.kind === "Balance");
  const rm = RECON.matched.find(m => m[0] === d.company);
  out.push({ item: "Deposit 30% · " + eur(dep), mod: "Finance", owner: d.owner, go: invGo(di?.id),
    record: di ? `Invoice ${di.no} · due ${di.due}` : rm ? `Invoice ${rm[2]}` : "Deposit invoice", status: signed ? (di ? di.status : "Paid") : wait });
  out.push({ item: "Balance 70% · " + eur(bal), mod: "Finance", owner: d.owner, go: invGo(bi?.id),
    record: bi ? `Invoice ${bi.no} · due ${bi.due}` : "Balance invoice · due 1 Feb 2027", status: signed ? (bi ? bi.status : "Scheduled") : wait });
  return out;
}
const obsFor = (fx: Fx, d: Deal) => (d.id === "d-nova" ? novaObs(fx) : d.id === "d-peak" ? peakObs(fx) : genericObs(fx, d));

/* ── Small shared views ─────────────────────────────────────────────────── */
function ObMap({ obs }: { obs: Ob[] }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      {obs.map((o, i) => (
        <div key={i} className="fx-flow-n" role="button" onClick={o.go}
          style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 16px minmax(0,1.2fr) auto", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ ...ell, fontSize: 12.5, fontWeight: 500, color: "var(--ink)" }}>{o.item}</div>
            <div style={{ ...cap, marginTop: 2, fontSize: 9.5 }}>LINE ITEM</div>
          </div>
          <Icon d={PATHS.arrow} size={14} style={{ color: "var(--accent)" }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ ...ell, fontSize: 12.5, color: "var(--body)" }}>{o.record}</div>
            <div style={{ ...ell, fontSize: 11, color: "var(--dim)", marginTop: 2 }}>
              <span style={{ ...cap, fontSize: 9.5, color: "var(--accent)" }}>{o.mod.toUpperCase()}</span> · {o.owner}
            </div>
          </div>
          <Status s={o.status} />
        </div>
      ))}
    </div>
  );
}

type HubNode = { t: string; h: ReactNode; d?: ReactNode; s?: string; go?: () => void; extra?: [string, () => void][] };
function Hub({ center, nodes }: { center: ReactNode; nodes: HubNode[] }) {
  return (
    <div>
      <div style={{ padding: "12px 14px", borderRadius: 14, border: "1px solid var(--accent-line)", background: "var(--accent-faint)" }}>{center}</div>
      <div style={{ position: "relative", paddingLeft: 28 }}>
        <span style={{ position: "absolute", left: 13, top: 0, bottom: 30, width: 1.5, background: "var(--accent-line)" }} />
        {nodes.map((n, i) => (
          <div key={i} style={{ position: "relative", paddingTop: 8 }}>
            <span style={{ position: "absolute", left: -15, top: 30, width: 15, height: 1.5, background: "var(--accent-line)" }} />
            <span style={{ position: "absolute", left: -19.5, top: 26, width: 10, height: 10, borderRadius: 99, background: "var(--accent)", boxShadow: "0 0 0 3px var(--accent-soft)" }} />
            <div className="fx-flow-n" role="button" onClick={n.go}
              style={{ display: "grid", gridTemplateColumns: "92px minmax(0,1fr) auto", gap: 12, alignItems: "center", padding: "10px 12px" }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", color: "var(--accent)" }}>{n.t}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{n.h}</div>
                {n.d && <div style={{ fontSize: 11.5, color: "var(--dim)", marginTop: 2, lineHeight: 1.45 }}>{n.d}</div>}
                {n.extra && (
                  <div style={{ display: "flex", gap: 14, marginTop: 5, flexWrap: "wrap" }}>
                    {n.extra.map(([l, g]) => (
                      <button key={l} className="fx-link" onClick={e => { e.stopPropagation(); g(); }}>{l} →</button>
                    ))}
                  </div>
                )}
              </div>
              <Row gap={8}>{n.s && <Status s={n.s} />}<Icon d={PATHS.arrow} size={13} style={{ color: "var(--faint)" }} /></Row>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type TL = [string, string, ("ok" | "warn" | "bad" | "accent")?];
function Timeline({ items }: { items: TL[] }) {
  return (
    <div style={{ position: "relative", paddingLeft: 18 }}>
      <span style={{ position: "absolute", left: 4, top: 6, bottom: 6, width: 1, background: "var(--border-strong)" }} />
      {items.map(([t, text, tone], i) => (
        <div key={i} style={{ position: "relative", display: "grid", gridTemplateColumns: "78px minmax(0,1fr)", gap: 10, padding: "5px 0", fontSize: 12.5 }}>
          <span style={{ position: "absolute", left: -18, top: 10, width: 9, height: 9, borderRadius: 99, border: "2px solid var(--overlay)",
            background: tone ? `var(--${tone})` : "var(--dim)" }} />
          <span style={{ color: "var(--faint)", fontVariantNumeric: "tabular-nums" }}>{t}</span>
          <span style={{ color: "var(--body)", lineHeight: 1.45 }}>{text}</span>
        </div>
      ))}
    </div>
  );
}

function Split({ value }: { value: number }) {
  const dep = Math.round(value * 0.3);
  return (
    <div>
      <div style={{ display: "flex", height: 8, borderRadius: 99, overflow: "hidden", gap: 2 }}>
        <span style={{ flex: 30, background: "var(--accent)" }} />
        <span style={{ flex: 70, background: "var(--track)" }} />
      </div>
      <Row style={{ justifyContent: "space-between", marginTop: 6, fontSize: 11.5, color: "var(--dim)" }}>
        <span>Deposit 30% · {eur(dep)}</span><span>Balance 70% · {eur(value - dep)}</span>
      </Row>
    </div>
  );
}

function StagePath({ s }: { s: Stage }) {
  const path: Stage[] = [...OPEN, "Won"];
  const idx = path.indexOf(s);
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${path.length},minmax(0,1fr))`, gap: 4 }}>
      {path.map((p, i) => (
        <div key={p} style={{ minWidth: 0 }}>
          <span style={{ display: "block", height: 5, borderRadius: 99, background: s === "Lost" ? "var(--bad-soft)" : i <= idx ? "var(--accent)" : "var(--track)" }} />
          <div style={{ ...ell, fontSize: 10.5, marginTop: 5, color: i === idx ? "var(--ink)" : "var(--faint)", fontWeight: i === idx ? 600 : 400 }}>{p}</div>
        </div>
      ))}
    </div>
  );
}

function PersonRow({ name, role }: { name: string; role: string }) {
  return (
    <Row gap={10} style={{ padding: "7px 0", borderTop: "1px solid var(--border)" }}>
      <Avatar name={name} size={26} bg={teamBg(name)} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12.5, color: "var(--ink)", fontWeight: 500 }}>{name}</div>
        <div style={{ ...small, fontSize: 11 }}>{role}</div>
      </div>
    </Row>
  );
}

/* ── Module entry ───────────────────────────────────────────────────────── */
export default function Sales({ fx }: ModuleProps) {
  if (fx.event === "ca") return <CanadaSales fx={fx} />;
  switch (fx.tab) {
    case "pipeline": return <Pipeline fx={fx} />;
    case "deals": return <Deals fx={fx} />;
    case "contracts": return <Contracts fx={fx} />;
    case "inventory": return <Inventory fx={fx} />;
    case "forecast": return <Forecast fx={fx} />;
    default: return <Overview fx={fx} />;
  }
}

/* ── Overview ───────────────────────────────────────────────────────────── */
type FeedItem = { t: string; ev: EventId; text: string; who: string; kind: "deal" | "contract"; id: string };
const FEED: FeedItem[] = [
  { t: "26 Sep · 16:40", ev: "ff", text: "Greenfield Pharmacy Group opened the contract for the third time", who: "Pulse e-sign", kind: "contract", id: "c-green" },
  { t: "26 Sep · 11:05", ev: "mh", text: "€3,750 from Peak Health Labs matched to FE-2027-0388 at 96%, waiting on approval", who: "Xero sync", kind: "deal", id: "d-peak" },
  { t: "25 Sep · 09:00", ev: "ff", text: "Deposit reminder #2 sent to Nova Fertility Clinic", who: "Pulse automation", kind: "deal", id: "d-nova" },
  { t: "24 Sep · 15:20", ev: "ff", text: "Contract sent to Greenfield Pharmacy Group, €12,000", who: "Daniel Murray", kind: "contract", id: "c-green" },
  { t: "24 Sep · 09:00", ev: "ff", text: "Deposit reminder #1 sent to Nova Fertility Clinic", who: "Pulse automation", kind: "deal", id: "d-nova" },
  { t: "23 Sep · 14:10", ev: "mh", text: "Orbit Health Cover moved to Proposal, board decision 9 Oct", who: "Kathleen Corr", kind: "deal", id: "d-orbit" },
  { t: "22 Sep · 10:30", ev: "ff", text: "Contract sent to European Fertility Network, €21,000 stage sponsorship", who: "Kathleen Corr", kind: "contract", id: "c-efn" },
  { t: "19 Sep · 12:15", ev: "ff", text: "Contract sent to Lumen Genetics, €11,200", who: "Kathleen Corr", kind: "contract", id: "c-lumen" },
  { t: "18 Sep · 10:00", ev: "ff", text: "Workshop upgrade opened for Nova Fertility Clinic, €4,500", who: "Kathleen Corr", kind: "deal", id: "d-nova-up" },
  { t: "16 Sep · 12:02", ev: "ff", text: "Nova Fertility Clinic e-signed. 2 invoices, exhibitor, speaker and content records created", who: "Pulse automation", kind: "deal", id: "d-nova" },
  { t: "14 Sep · 17:45", ev: "mh", text: "Velocity Fitness Studios signed, €6,900", who: "Daniel Murray", kind: "contract", id: "c-vel" },
  { t: "11 Sep · 09:30", ev: "mh", text: "Northside Physio Group marked Lost on budget", who: "Daniel Murray", kind: "deal", id: "d-north" },
];

function Overview({ fx }: ModuleProps) {
  const K = KPIS[fx.event];
  const evs = evList(fx.event);
  const funnel = OPEN.map(s => ({
    s, n: sum(evs.map(e => FUNNEL[e][s][0])), v: sum(evs.map(e => FUNNEL[e][s][1])),
  }));
  const fMax = Math.max(...funnel.map(f => f.v));
  const openN = sum(funnel.map(f => f.n));
  const late = sum(funnel.filter(f => LATE.includes(f.s)).map(f => f.v));
  const mix = PKG_TYPES.map((t, i) => ({ t, v: sum(evs.map(e => MIX[e].contracted[i])), c: PKG_COLORS[i] }));
  const mixTotal = sum(mix.map(m => m.v));
  const exhibitorRev = mix[0].v + mix[3].v, sponsorRev = mix[1].v;

  const scaleMax = Math.max(...evs.map(e => KPIS[e].contracted + KPIS[e].pipeline));
  const bigOpen = DEALS.filter(d => inEvent(fx.event, d.event) && isOpen(d.stage)).sort((a, b) => b.value - a.value).slice(0, 4);

  const cs = CONTRACTS.filter(c => inEvent(fx.event, c.event));
  const signedC = cs.filter(c => c.status === "Signed");
  const awaitingC = cs.filter(c => c.status !== "Signed");
  const signedV = sum(signedC.map(c => c.value)), awaitV = sum(awaitingC.map(c => c.value));

  const actions: { ev: EventId; tone: "bad" | "warn" | "accent"; title: string; d: string; act: ReactNode; open?: () => void }[] = [
    { ev: "ff", tone: "bad", title: "Nova Fertility Clinic deposit, €5,400", d: "FE-2027-0412 · 4 days overdue · 2 automatic reminders sent",
      act: <ActBtn fx={fx} k="chase-nova" label="Send reminder" doneLabel="Reminder sent" toast="Deposit reminder #3 sent to Nova Fertility Clinic" size="sm" />,
      open: () => fx.open("deal", "d-nova") },
    { ev: "ff", tone: "warn", title: "European Fertility Network, €21,000", d: "Stage sponsorship · contract sent 22 Sep · unsigned 5 days",
      act: <ActBtn fx={fx} k="sales-chase-c-efn" label="Chase signature" doneLabel="Chased" kind="ghost" size="sm" toast="Signature reminder sent to European Fertility Network" />,
      open: () => fx.open("contract", "c-efn") },
    { ev: "mh", tone: "warn", title: "Peak Health Labs deposit match", d: "€3,750 · ref PEAKHLTH · 96% confidence · approve in Finance",
      act: fx.acted["match-peak"] ? <Badge tone="ok">Reconciled</Badge> : <Btn size="sm" kind="ghost" onClick={() => fx.goTo("Finance", "reconciliation")}>Review match</Btn>,
      open: () => fx.open("deal", "d-peak") },
    { ev: "mh", tone: "accent", title: "Orbit Health Cover, €28,000 headline", d: "Proposal · board decision 9 Oct · only live headline conversation",
      act: <ActBtn fx={fx} k="sales-orbit-pack" label="Send board pack" doneLabel="Pack sent" kind="ghost" size="sm" toast="Board pack sent to Fiona Hegarty at Orbit Health Cover" />,
      open: () => fx.open("deal", "d-orbit") },
    { ev: "ff", tone: "warn", title: "Lumen Genetics, €11,200", d: "Contract sent 19 Sep · chase signature Mon",
      act: <ActBtn fx={fx} k="sales-chase-c-lumen" label="Chase signature" doneLabel="Chased" kind="ghost" size="sm" toast="Signature reminder sent to Lumen Genetics" />,
      open: () => fx.open("contract", "c-lumen") },
    { ev: "ff", tone: "warn", title: "Harbour IVF Partners, €16,500", d: "Negotiation · frontage query with Robyn before terms",
      act: <Btn size="sm" kind="ghost" onClick={() => fx.goTo("Exhibitors", "floorplan")}>Floor plan</Btn>, open: () => fx.open("deal", "d-harb") },
    { ev: "mh", tone: "bad", title: "Men's Health headline sponsorship unsold", d: "0 of 2 sold · €80,000 of inventory open",
      act: <Btn size="sm" kind="ghost" onClick={() => fx.goTo("Sales", "inventory")}>Inventory</Btn> },
  ];
  const acts = actions.filter(a => inEvent(fx.event, a.ev)).slice(0, 6);

  const feed: FeedItem[] = [
    ...(fx.acted["chase-nova"] ? [{ t: "Today", ev: "ff" as EventId, text: "Deposit reminder #3 sent to Nova Fertility Clinic", who: "You", kind: "deal" as const, id: "d-nova" }] : []),
    ...(fx.acted["match-peak"] ? [{ t: "Today", ev: "mh" as EventId, text: "Peak Health Labs deposit reconciled, FE-2027-0388 marked Paid", who: "Xero sync", kind: "deal" as const, id: "d-peak" }] : []),
    ...FEED,
  ].filter(f => inEvent(fx.event, f.ev)).slice(0, 8);

  const owners = ["Kathleen Corr", "Daniel Murray"].map(n => ({
    n, c: sum(evs.map(e => OWNERS[e][n][0])), p: sum(evs.map(e => OWNERS[e][n][1])),
    deals: DEALS.filter(d => d.owner === n && inEvent(fx.event, d.event) && isOpen(d.stage)).length,
  }));

  return (
    <Page>
      <PageHead title="Sales" sub="Commercial position for the 2027 events, synced from HubSpot and Xero." fx={fx} />
      <Kpis items={[
        { label: "Open Pipeline", value: eurK(K.pipeline), sub: `${openN} open deals`, onClick: () => fx.goTo("Sales", "pipeline") },
        { label: "Weighted Pipeline", value: eurK(K.weighted), sub: `${Math.round((K.weighted / K.pipeline) * 100)}% of open value` },
        { label: "Contracted", value: eurK(K.contracted), sub: "Signed contracts", tone: "ok", onClick: () => fx.goTo("Sales", "contracts") },
        { label: "Average Deal", value: eur(K.avgDeal), sub: "Won deals, 2027 cycle" },
        { label: "Win Rate", value: K.winRate + "%", sub: "Won vs closed" },
        { label: "Closing This Month", value: K.closingThisMonth, sub: "Expected by 30 Sep", onClick: () => fx.goTo("Sales", "deals") },
      ]} />

      <div style={grid("minmax(0,1.25fr) minmax(0,1fr)")}>
        <Card title="Pipeline funnel" sub={`${openN} open deals · ${eur(K.pipeline)}`}
          right={<button className="fx-link" onClick={() => fx.goTo("Sales", "pipeline")}>Open board →</button>}>
          <div style={{ display: "grid", gap: 7 }}>
            {funnel.map(f => {
              const isLate = LATE.includes(f.s);
              return (
                <div key={f.s} style={{ display: "grid", gridTemplateColumns: "104px minmax(0,1fr) 62px 76px", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 12.5, color: "var(--body)" }}>{f.s}</span>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <span style={{ display: "block", height: 26, borderRadius: 8, width: `${Math.max(18, (f.v / fMax) * 100)}%`,
                      background: isLate ? (evs.length === 1 ? evColor(evs[0]) : "var(--accent)") : (evs.length === 1 ? evSoft(evs[0]) : "var(--accent-soft)"),
                      border: isLate ? "none" : "1px solid var(--accent-line)" }} />
                  </div>
                  <span style={{ fontSize: 12, color: "var(--dim)", textAlign: "right" }}>{f.n} deals</span>
                  <span className="fx-num" style={{ fontSize: 12.5, color: "var(--ink)", fontWeight: 500 }}>{eurK(f.v)}</span>
                </div>
              );
            })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12, marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
            <Fig label="Late-stage (solid bars)" value={eur(late)} sub="Negotiation + Contract Sent" />
            <Fig label="Contracted" value={eur(K.contracted)} sub="Signed and invoiced" color="var(--ok)" />
            <Fig label="2027 B2B revenue" value={eur(K.revenue2027)} sub="Contracted + late-stage" />
          </div>
        </Card>

        <Card title="Revenue by event" sub="Contracted · late-stage · early pipeline">
          <div style={{ display: "grid", gap: 16 }}>
            {evs.map(e => {
              const k = KPIS[e];
              const early = k.pipeline - k.lateStage;
              return (
                <div key={e} className="fx-flow-n" role="button" onClick={() => fx.setEvent(e)} style={{ padding: "11px 12px", cursor: evs.length > 1 ? "pointer" : "default" }}>
                  <Row gap={8}>
                    <EventTag id={e} short={false} />
                    <span className="fx-grow" />
                    <span style={{ fontSize: 11.5, color: "var(--dim)" }}>2027 revenue</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{eur(k.revenue2027)}</span>
                  </Row>
                  <div style={{ display: "flex", height: 10, borderRadius: 99, overflow: "hidden", gap: 2, marginTop: 10, background: "var(--track)",
                    width: `${((k.contracted + k.pipeline) / scaleMax) * 100}%` }}>
                    <span style={{ flex: k.contracted, background: evColor(e) }} />
                    <span style={{ flex: k.lateStage, background: evColor(e), opacity: 0.45 }} />
                    <span style={{ flex: early, background: evSoft(e) }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10, marginTop: 10 }}>
                    <Fig label="Contracted" value={eurK(k.contracted)} />
                    <Fig label="Late-stage" value={eurK(k.lateStage)} />
                    <Fig label="Weighted" value={eurK(k.weighted)} />
                    <Fig label="Win rate" value={k.winRate + "%"} />
                  </div>
                </div>
              );
            })}
            <div>
              <div style={{ ...cap, marginBottom: 4 }}>LARGEST OPEN DEALS</div>
              {bigOpen.map(d => (
                <div key={d.id} className="fx-tr" data-click="1" onClick={() => fx.open("deal", d.id)}
                  style={{ gridTemplateColumns: "minmax(0,1fr) auto auto", padding: "0 4px", minHeight: 34 }}>
                  <span className="fx-strong">{d.company}</span><StageBadge s={d.stage} /><span className="fx-num">{eur(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div style={grid("minmax(0,0.95fr) minmax(0,1.3fr) minmax(0,0.95fr)")}>
        <Card title="Sponsorship vs exhibitor" sub="Contracted by type">
          <Row gap={16} style={{ alignItems: "center" }}>
            <Donut size={118} thickness={13} segments={mix.map(m => ({ label: m.t, value: m.v, color: m.c }))}
              center={<><div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>{eurK(mixTotal)}</div><div style={{ fontSize: 10, color: "var(--faint)" }}>contracted</div></>} />
            <div style={{ display: "grid", gap: 5, minWidth: 0, flex: 1 }}>
              {mix.map(m => (
                <Row key={m.t} gap={7} style={{ fontSize: 11.5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: m.c, flex: "none" }} />
                  <span style={{ ...ell, color: "var(--body)", flex: 1 }}>{m.t}</span>
                  <span className="fx-num" style={{ color: "var(--dim)" }}>{Math.round((m.v / mixTotal) * 100)}%</span>
                </Row>
              ))}
            </div>
          </Row>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
            <Fig label="Exhibitor (stands + activations)" value={eurK(exhibitorRev)} />
            <Fig label="Sponsorship" value={eurK(sponsorRev)} />
          </div>
        </Card>

        <Card title="Next actions" sub={`${acts.length} need a decision`}>
          <div style={{ display: "grid" }}>
            {acts.map((a, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "8px minmax(0,1fr) auto", gap: 10, alignItems: "center", padding: "8px 0", borderTop: i ? "1px solid var(--border)" : "none" }}>
                <span style={{ width: 7, height: 7, borderRadius: 99, background: `var(--${a.tone === "accent" ? "accent" : a.tone})` }} />
                <div style={{ minWidth: 0, cursor: a.open ? "pointer" : "default" }} onClick={a.open}>
                  <div style={{ ...ell, fontSize: 12.5, color: "var(--ink)", fontWeight: 500 }}>{a.title}</div>
                  <div style={{ ...ell, fontSize: 11.5, color: "var(--dim)", marginTop: 1 }}>{a.d}</div>
                </div>
                {a.act}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Contract status" right={<button className="fx-link" onClick={() => fx.goTo("Sales", "contracts")}>All →</button>}>
          <div style={{ display: "flex", height: 8, borderRadius: 99, overflow: "hidden", gap: 2 }}>
            <span style={{ flex: signedV, background: "var(--ok)" }} />
            <span style={{ flex: awaitV || 0.0001, background: "var(--warn)" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
            <Fig label={`Signed · ${signedC.length}`} value={eurK(signedV)} color="var(--ok)" />
            <Fig label={`Awaiting · ${awaitingC.length}`} value={eurK(awaitV)} color="var(--warn)" />
          </div>
          <div style={{ ...cap, margin: "14px 0 2px" }}>AWAITING SIGNATURE</div>
          {awaitingC.map(c => (
            <div key={c.id} className="fx-tr" data-click="1" onClick={() => fx.open("contract", c.id)}
              style={{ gridTemplateColumns: "minmax(0,1fr) auto", padding: "0 4px", minHeight: 42 }}>
              <div>
                <div className="fx-strong" style={ell}>{c.client}</div>
                <div style={{ fontSize: 11, color: "var(--faint)" }}>Sent {c.sent} · {TODAY_DOY - doy(c.sent)} days</div>
              </div>
              <Status s={c.status} />
            </div>
          ))}
        </Card>
      </div>

      <div style={grid("minmax(0,1.5fr) minmax(0,1fr)", 14, 0)}>
        <Card title="Sales activity" sub="HubSpot, e-sign and Xero events">
          {feed.map((f, i) => (
            <div key={i} className="fx-tr" data-click="1" onClick={() => fx.open(f.kind, f.id)}
              style={{ gridTemplateColumns: "96px minmax(0,1fr) auto", padding: "0 4px", minHeight: 40, borderTop: i ? undefined : "none" }}>
              <span style={{ fontSize: 11.5, color: "var(--faint)" }}>{f.t}</span>
              <span style={{ color: "var(--body)" }}>{f.text}</span>
              <span style={{ fontSize: 11, color: "var(--dim)" }}>{f.who}</span>
            </div>
          ))}
        </Card>
        <Card title="Owners" sub="Contracted and open pipeline">
          {owners.map(o => (
            <div key={o.n} style={{ padding: "10px 0", borderTop: "1px solid var(--border)" }}>
              <Row gap={10}>
                <Avatar name={o.n} size={30} bg={teamBg(o.n)} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{o.n}</div>
                  <div style={{ fontSize: 11, color: "var(--faint)" }}>{TEAM.find(t => t.name === o.n)?.role} · {o.deals} named open deals</div>
                </div>
              </Row>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 9 }}>
                <div><div style={small}>Contracted {eurK(o.c)}</div><Bar value={o.c} max={K.contracted} color="var(--ok)" style={{ marginTop: 5, display: "block" }} /></div>
                <div><div style={small}>Pipeline {eurK(o.p)}</div><Bar value={o.p} max={K.pipeline} style={{ marginTop: 5, display: "block" }} /></div>
              </div>
            </div>
          ))}
          <Note>Kathleen carries Future Fertility and headline sponsorship. Daniel leads Men's Health exhibitors.</Note>
        </Card>
      </div>
    </Page>
  );
}

/* ── Pipeline (Kanban) ──────────────────────────────────────────────────── */
function Pipeline({ fx }: ModuleProps) {
  const [owner, setOwner] = useState<"all" | "Kathleen Corr" | "Daniel Murray">("all");
  const [type, setType] = useState<"all" | Deal["type"]>("all");
  const [moved, setMoved] = useState<Record<string, Stage>>({});
  const stageOf = (d: Deal): Stage => moved[d.id] ?? d.stage;
  const list = DEALS.filter(d => inEvent(fx.event, d.event) && (owner === "all" || d.owner === owner) && (type === "all" || d.type === type));

  const advance = (d: Deal) => {
    const s = stageOf(d);
    const next = STAGES[STAGES.indexOf(s) + 1] as Stage;
    setMoved(m => ({ ...m, [d.id]: next }));
    fx.toast(next === "Won"
      ? `${d.company} marked Won · contract, 2 invoices and fulfilment records queued`
      : `${d.company} moved to ${next}`);
  };

  const openList = list.filter(d => isOpen(stageOf(d)));
  const openV = sum(openList.map(d => d.value));
  const wV = sum(openList.map(d => Math.round((d.value * (moved[d.id] ? stageProb(stageOf(d)) : d.prob)) / 100)));
  const wonV = sum(list.filter(d => stageOf(d) === "Won").map(d => d.value));
  const flagged = list.filter(d => d.flag).length;

  return (
    <Page>
      <PageHead title="Pipeline" sub="Named deals by stage. Click a card for the full record." fx={fx} />
      <div className="fx-card" style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", padding: "12px 16px", marginBottom: 12 }}>
        <Chips options={[["all", "All owners"], ["Kathleen Corr", "Kathleen Corr"], ["Daniel Murray", "Daniel Murray"]]} value={owner} onChange={setOwner} />
        <span style={{ width: 1, height: 22, background: "var(--border)" }} />
        <Chips options={[["all", "All types"], ["Exhibitor", "Exhibitor"], ["Sponsorship", "Sponsorship"], ["Speaking", "Speaking"], ["Activation", "Activation"]]} value={type} onChange={setType} />
        <span className="fx-grow" />
        <Row gap={18}>
          <Fig label="Open on board" value={eurK(openV)} />
          <Fig label="Weighted" value={eurK(wV)} />
          <Fig label="Won on board" value={eurK(wonV)} color="var(--ok)" />
          <Fig label="Flags" value={flagged} color={flagged ? "var(--bad)" : undefined} />
        </Row>
      </div>

      <div style={{ overflowX: "auto", paddingBottom: 6, marginBottom: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${STAGES.length},minmax(178px,1fr))`, gap: 9, alignItems: "start" }}>
          {STAGES.map(s => {
            const cards = list.filter(d => stageOf(d) === s).sort((a, b) => b.value - a.value);
            const tot = sum(cards.map(d => d.value));
            return (
              <div key={s} style={{ background: "var(--surface-faint)", border: "1px solid var(--border)", borderRadius: 16, padding: 8, minHeight: 360, minWidth: 0 }}>
                <div style={{ padding: "4px 4px 9px" }}>
                  <Row gap={6}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{s}</span>
                    <Badge tone={STAGE_TONE[s]}>{cards.length}</Badge>
                  </Row>
                  <div style={{ fontSize: 11.5, color: "var(--dim)", marginTop: 3, fontVariantNumeric: "tabular-nums" }}>
                    {eur(tot)}{isOpen(s) && <span style={{ color: "var(--faint)" }}> · {stageProb(s)}%</span>}
                  </div>
                </div>
                <div style={{ display: "grid", gap: 7 }}>
                  {cards.map(d => <DealCard key={d.id} d={d} stage={s} fx={fx} onAdvance={() => advance(d)} moved={!!moved[d.id]} />)}
                  {!cards.length && <div style={{ fontSize: 11.5, color: "var(--faint)", padding: "10px 4px" }}>No deals for this filter.</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Note>
        The board shows named deals synced from HubSpot. Funnel totals on Overview also include unnamed inbound leads, which is why open value there reads {eurK(KPIS[fx.event].pipeline)}.
        Moving a card to Won queues the contract, the 30/70 invoices and the fulfilment records automatically.
      </Note>
    </Page>
  );
}
const stageProb = (s: Stage) => ({ "New Lead": 10, Qualified: 25, Proposal: 40, Negotiation: 60, "Contract Sent": 80, Won: 100, Lost: 0 } as Record<Stage, number>)[s];

function DealCard({ d, stage, fx, onAdvance, moved }: { d: Deal; stage: Stage; fx: Fx; onAdvance: () => void; moved: boolean }) {
  const won = stage === "Won", lost = stage === "Lost";
  const c = contractFor(d);
  const next = STAGES[STAGES.indexOf(stage) + 1];
  return (
    <div className="fx-flow-n" role="button" onClick={() => fx.open("deal", d.id)}
      style={{ padding: "10px 11px", borderRadius: 13, background: "var(--surface-2)", opacity: lost ? 0.62 : 1,
        borderColor: d.flag ? "var(--bad-soft)" : moved ? "var(--accent-line)" : undefined }}>
      <div style={{ ...ell, fontSize: 12.5, fontWeight: 600, color: "var(--ink)" }}>{d.company}</div>
      <Row gap={6} style={{ marginTop: 6 }}>
        <EventTag id={d.event} />
        <span className="fx-grow" />
        <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{eur(d.value)}</span>
      </Row>
      <div style={{ ...ell, fontSize: 11.5, color: "var(--dim)", marginTop: 6 }}>{d.pkg}</div>
      {d.flag && <div style={{ marginTop: 6 }}><Badge tone="bad"><Icon d={PATHS.alert} size={10} sw={2.2} />{d.flag}</Badge></div>}
      {won && c?.signed && !d.flag && <div style={{ marginTop: 6 }}><Badge tone="ok">Signed {c.signed}</Badge></div>}
      {won && c?.signed && d.flag && <div style={{ fontSize: 11, color: "var(--ok)", marginTop: 5 }}>Signed {c.signed}</div>}
      <Row gap={7} style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
        <span title={d.owner}><Avatar name={d.owner} size={20} bg={teamBg(d.owner)} /></span>
        <span style={{ ...ell, fontSize: 11, color: "var(--faint)", flex: 1 }}>{d.next}</span>
      </Row>
      {isOpen(stage) && next && (
        <div style={{ marginTop: 7 }}>
          <Btn size="sm" kind="ghost" icon={PATHS.arrow} onClick={onAdvance}>{next === "Won" ? "Mark won" : next}</Btn>
        </div>
      )}
    </div>
  );
}

/* ── Deals table ────────────────────────────────────────────────────────── */
function Deals({ fx }: ModuleProps) {
  const [type, setType] = useState<"all" | Deal["type"]>("all");
  const [stage, setStage] = useState<"all" | "open" | "late" | "won" | "lost">("all");
  const [sort, setSort] = useState<"value" | "prob" | "weighted" | "closing">("value");
  const CLOSE_ORDER: Record<string, number> = { Sep: 1, Oct: 2, Nov: 3 };

  const base = DEALS.filter(d => inEvent(fx.event, d.event));
  const rows = base.filter(d =>
    (type === "all" || d.type === type) &&
    (stage === "all" || (stage === "open" && isOpen(d.stage)) || (stage === "late" && LATE.includes(d.stage)) ||
      (stage === "won" && d.stage === "Won") || (stage === "lost" && d.stage === "Lost")),
  ).sort((a, b) =>
    sort === "value" ? b.value - a.value : sort === "prob" ? b.prob - a.prob : sort === "weighted" ? weighted(b) - weighted(a)
      : (CLOSE_ORDER[a.closing ?? ""] ?? (a.stage === "Won" ? 0 : 9)) - (CLOSE_ORDER[b.closing ?? ""] ?? (b.stage === "Won" ? 0 : 9)));

  const cnt = (f: (d: Deal) => boolean) => base.filter(f).length;
  const typeCnt = (t: Deal["type"]) => cnt(d => d.type === t);
  const total = sum(rows.map(d => d.value)), wTotal = sum(rows.map(weighted));
  const openRows = rows.filter(d => isOpen(d.stage));
  const avgProb = openRows.length ? Math.round(sum(openRows.map(d => d.prob)) / openRows.length) : 0;

  const cols: Col<Deal>[] = [
    { k: "company", label: "Company", w: "minmax(0,1.55fr)", render: d => <span className="fx-strong">{d.company}</span> },
    { k: "event", label: "Event", w: "minmax(0,.85fr)", render: d => <EventTag id={d.event} /> },
    { k: "type", label: "Type", w: "minmax(0,.8fr)", render: d => <span style={{ color: "var(--dim)" }}>{d.type}</span> },
    { k: "pkg", label: "Package", w: "minmax(0,1.5fr)" },
    { k: "value", label: "Value", w: "minmax(0,.75fr)", align: "right", render: d => <span className="fx-strong">{eur(d.value)}</span> },
    { k: "stage", label: "Stage", w: "minmax(0,1fr)", render: d => <StageBadge s={d.stage} /> },
    { k: "prob", label: "Prob.", w: "minmax(0,.5fr)", align: "right", render: d => d.prob + "%" },
    { k: "w", label: "Weighted", w: "minmax(0,.75fr)", align: "right", render: d => eur(weighted(d)) },
    { k: "owner", label: "Owner", w: "46px", render: d => <span title={d.owner}><Avatar name={d.owner} size={22} bg={teamBg(d.owner)} /></span> },
    { k: "next", label: "Next step", w: "minmax(0,1.35fr)", render: d => d.flag ? <span style={{ color: "var(--bad)" }}>{d.next}</span> : <span style={{ color: "var(--dim)" }}>{d.next}</span> },
    { k: "closing", label: "Closing", w: "minmax(0,.7fr)", render: d => <span style={{ color: d.stage === "Won" ? "var(--ok)" : "var(--body)" }}>{closeLabel(d)}</span> },
  ];

  return (
    <Page>
      <PageHead title="Deals" sub="Every deal with value, probability and next step." fx={fx} />
      <div style={grid("minmax(0,1fr) auto", 14, 12)}>
        <div style={{ display: "grid", gap: 8 }}>
          <Chips options={[["all", `All types · ${base.length}`], ["Exhibitor", `Exhibitor · ${typeCnt("Exhibitor")}`], ["Sponsorship", `Sponsorship · ${typeCnt("Sponsorship")}`],
            ["Speaking", `Speaking · ${typeCnt("Speaking")}`], ["Activation", `Activation · ${typeCnt("Activation")}`]]} value={type} onChange={setType} />
          <Chips options={[["all", "All stages"], ["open", `Open · ${cnt(d => isOpen(d.stage))}`], ["late", `Late-stage · ${cnt(d => LATE.includes(d.stage))}`],
            ["won", `Won · ${cnt(d => d.stage === "Won")}`], ["lost", `Lost · ${cnt(d => d.stage === "Lost")}`]]} value={stage} onChange={setStage} />
        </div>
        <div style={{ display: "grid", gap: 8, justifyItems: "end" }}>
          <span style={{ ...cap }}>SORT BY</span>
          <Chips options={[["value", "Value"], ["weighted", "Weighted"], ["prob", "Probability"], ["closing", "Closing"]]} value={sort} onChange={setSort} />
        </div>
      </div>
      <Card pad={false}
        title={`${rows.length} deals`}
        sub={`${eur(total)} total · ${eur(wTotal)} weighted${openRows.length ? ` · ${avgProb}% avg. open probability` : ""}`}
        right={<button className="fx-link" onClick={() => fx.goTo("Sales", "pipeline")}>View as board →</button>}>
        <div style={{ height: 12 }} />
        <Table cols={cols} rows={rows} onRow={d => fx.open("deal", d.id)} highlight={d => !!d.flag} />
      </Card>
    </Page>
  );
}

/* ── Contracts ──────────────────────────────────────────────────────────── */
const CLAUSES: [string, string][] = [
  ["1", "Parties, event and venue (RDS Dublin, 13–14 March 2027)"],
  ["2", "Package line items, pulled from the deal record"],
  ["3", "Fees: 30% deposit on signature, 70% balance by 1 Feb 2027"],
  ["4", "Exhibitor obligations and deadlines (final information 29 Jan 2027)"],
  ["5", "Stand build, electrical and venue rules"],
  ["6", "Marketing entitlements and brand usage"],
  ["7", "Cancellation, transfer and force majeure"],
  ["8", "Data protection and lead capture"],
];

function Contracts({ fx }: ModuleProps) {
  const rows = CONTRACTS.filter(c => inEvent(fx.event, c.event));
  const [sel, setSel] = useState("c-nova");
  const cur = rows.find(c => c.id === sel) ?? rows[0];
  const curDeal = cur ? dealFor(cur) : undefined;
  const obs = curDeal ? obsFor(fx, curDeal) : [];
  const signed = rows.filter(c => c.status === "Signed");
  const awaiting = rows.filter(c => c.status !== "Signed");
  const avgSign = signed.length ? (sum(signed.map(c => doy(c.signed) - doy(c.sent))) / signed.length).toFixed(1) : "0";
  const tplCount = (t: string) => rows.filter(c => templateOf(dealFor(c)) === t).length;

  const cols: Col<Contract>[] = [
    { k: "client", label: "Client", w: "minmax(0,1.5fr)", render: c => <span className="fx-strong">{c.client}</span> },
    { k: "event", label: "Event", w: "minmax(0,.8fr)", render: c => <EventTag id={c.event} /> },
    { k: "pkg", label: "Package", w: "minmax(0,1.5fr)" },
    { k: "value", label: "Value", w: "minmax(0,.7fr)", align: "right", render: c => eur(c.value) },
    { k: "sent", label: "Sent", w: "minmax(0,.55fr)" },
    { k: "signed", label: "Signed", w: "minmax(0,.6fr)", render: c => c.signed || <span className="fx-muted">Awaiting</span> },
    { k: "payment", label: "Payment setup", w: "minmax(0,1fr)", render: c => <span style={{ color: c.signed ? "var(--body)" : "var(--faint)" }}>{c.payment}</span> },
    { k: "status", label: "Status", w: "minmax(0,.65fr)", render: c => <Status s={c.status} /> },
    { k: "open", label: "", w: "30px", render: c => (
      <button className="fx-x" style={{ width: 24, height: 24 }} aria-label="Open contract" onClick={e => { e.stopPropagation(); fx.open("contract", c.id); }}>
        <Icon d={PATHS.arrow} size={11} />
      </button>) },
  ];

  return (
    <Page>
      <PageHead title="Contracts" sub="Standard agreements, e-signed, feeding obligations automatically." fx={fx} />
      <div className="fx-card" style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 14, padding: "14px 18px", marginBottom: 14 }}>
        <Fig label={`Signed · ${signed.length}`} value={eur(sum(signed.map(c => c.value)))} color="var(--ok)" />
        <Fig label={`Awaiting signature · ${awaiting.length}`} value={eur(sum(awaiting.map(c => c.value)))} color="var(--warn)" />
        <Fig label="Avg. time to sign" value={avgSign + " days"} sub="Sent to e-signed" />
        <Fig label="Payment plans live" value={signed.filter(c => c.payment.includes("30")).length} sub="30 / 70 split in Xero" />
        <Fig label="Re-keyed by hand" value="0" sub="Line items flow from the deal" />
      </div>

      <div style={grid("minmax(0,1.6fr) minmax(0,1fr)")}>
        <Card pad={false} title="All contracts" sub="Click a row to map its obligations">
          <div style={{ height: 12 }} />
          <Table cols={cols} rows={rows} onRow={c => setSel(c.id)} highlight={c => c.id === cur?.id} />
        </Card>
        <Card title="Standard template" sub="v2027.2 · e-sign" right={<Badge tone="ok">Locked</Badge>}>
          <div style={{ display: "grid", gap: 6 }}>
            {["Exhibitor Agreement", "Sponsorship Agreement", "Commercial Speaking Agreement"].map(t => (
              <Row key={t} gap={8} style={{ fontSize: 12.5 }}>
                <Icon d={PATHS.doc} size={14} style={{ color: "var(--dim)" }} />
                <span style={{ color: "var(--ink)", flex: 1 }}>{t}</span>
                <span style={{ fontSize: 11.5, color: "var(--faint)" }}>{tplCount(t)} in use</span>
              </Row>
            ))}
          </div>
          <div style={{ ...cap, margin: "14px 0 6px" }}>CLAUSES</div>
          <div style={{ display: "grid", gap: 4 }}>
            {CLAUSES.map(([n, t]) => (
              <Row key={n} gap={8} style={{ fontSize: 12, alignItems: "flex-start" }}>
                <span style={{ width: 16, color: "var(--faint)", fontVariantNumeric: "tabular-nums" }}>{n}</span>
                <span style={{ color: "var(--body)", lineHeight: 1.45 }}>{t}</span>
              </Row>
            ))}
          </div>
          <div style={{ ...cap, margin: "14px 0 6px" }}>PAYMENT SPLIT</div>
          <Split value={10000} />
          <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 8 }}>Both invoices are raised in Xero the moment the client e-signs.</div>
        </Card>
      </div>

      {cur && curDeal && (
        <Card title={<>Line items to obligations · {cur.client}</>}
          sub={cur.status === "Signed" ? `Signed ${cur.signed} · ${obs.length} records created` : `Awaiting signature · ${obs.length} records ready to create`}
          right={
            <Row gap={8}>
              {cur.status !== "Signed" && <ActBtn fx={fx} k={`sales-chase-${cur.id}`} label="Chase signature" doneLabel="Chased" kind="ghost" size="sm" toast={`Signature reminder sent to ${cur.client}`} />}
              <Btn size="sm" kind="ghost" onClick={() => fx.open("deal", curDeal.id)}>Deal</Btn>
              <Btn size="sm" onClick={() => fx.open("contract", cur.id)}>Open contract</Btn>
            </Row>
          }>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,220px) minmax(0,1fr)", gap: 18 }}>
            <div>
              <div style={{ padding: "12px 14px", borderRadius: 14, border: "1px solid var(--accent-line)", background: "var(--accent-faint)" }}>
                <div style={cap}>{cNo(cur)}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginTop: 5 }}>{cur.client}</div>
                <div style={{ ...small, marginTop: 2 }}>{templateOf(curDeal)}</div>
                <div style={{ fontSize: 22, fontWeight: 600, color: "var(--ink)", marginTop: 10, letterSpacing: "-.5px" }}>{eur(cur.value)}</div>
                <div style={{ marginTop: 10 }}><Split value={cur.value} /></div>
              </div>
              <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
                {(["Exhibitors", "Finance", "Production", "Growth"] as ModName[]).map(m => {
                  const n = obs.filter(o => o.mod === m).length;
                  return n ? (
                    <Row key={m} gap={8} style={{ fontSize: 12 }}>
                      <span style={{ ...cap, color: "var(--accent)", width: 86 }}>{m.toUpperCase()}</span>
                      <Bar value={n} max={obs.length} />
                      <span style={{ color: "var(--dim)", width: 18, textAlign: "right" }}>{n}</span>
                    </Row>
                  ) : null;
                })}
              </div>
            </div>
            <ObMap obs={obs} />
          </div>
        </Card>
      )}
    </Page>
  );
}

/* ── Inventory ──────────────────────────────────────────────────────────── */
type InvStat = { item: string; sold: number; total: number; price: string; left: number; pct: number; unit: number; leftV: number; soldV: number };
const invStats = (e: Ev2): InvStat[] => INVENTORY[e].map(r => {
  const unit = priceNum(r.price);
  return { ...r, left: r.total - r.sold, pct: Math.round((r.sold / r.total) * 100), unit, leftV: (r.total - r.sold) * unit, soldV: r.sold * unit };
});
function Scarcity({ r }: { r: InvStat }) {
  if (r.left === 0) return <Badge tone="ok">Sold out</Badge>;
  if (r.sold === 0) return <Badge tone="bad">Unsold</Badge>;
  if (r.pct >= 80) return <Badge tone="accent">Only {r.left} left</Badge>;
  return <span style={{ fontSize: 11.5, color: "var(--faint)" }}>{r.left} left</span>;
}

function Inventory({ fx }: ModuleProps) {
  const evs = evList(fx.event);
  const stats = evs.map(e => ({ e, rows: invStats(e) }));
  const all = stats.flatMap(s => s.rows.map(r => ({ ...r, e: s.e })));
  const leftV = sum(all.map(r => r.leftV)), soldV = sum(all.map(r => r.soldV));
  const leftUnits = sum(all.map(r => r.left));
  const scarce = all.filter(r => r.pct >= 80 && r.left > 0);
  const unsold = all.filter(r => r.sold === 0);
  const push = [...all].sort((a, b) => b.leftV - a.leftV).slice(0, 6);
  const wide = evs.length === 1;

  const eventCard = (e: Ev2, rows: InvStat[]) => {
    const lv = sum(rows.map(r => r.leftV)), sv = sum(rows.map(r => r.soldV));
    return (
      <Card key={e} title={EVENTS[e].label} right={<Row gap={10}><span style={small}>Left to sell</span><span style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>{eur(lv)}</span></Row>} pad={false}>
        <div style={{ padding: "12px 18px 4px" }}>
          <div style={{ display: "flex", height: 8, borderRadius: 99, overflow: "hidden", gap: 2 }}>
            <span style={{ flex: sv, background: evColor(e) }} /><span style={{ flex: lv, background: evSoft(e) }} />
          </div>
          <Row style={{ justifyContent: "space-between", marginTop: 6, fontSize: 11.5, color: "var(--dim)" }}>
            <span>Sold at list {eur(sv)}</span><span>{Math.round((sv / (sv + lv)) * 100)}% of sellable value</span>
          </Row>
        </div>
        <div className="fx-tr fx-th" style={{ gridTemplateColumns: wide ? "minmax(0,1.6fr) minmax(0,1.3fr) 60px 70px 90px 100px" : "minmax(0,1.5fr) minmax(0,1fr) 54px 88px", marginTop: 10 }}>
          <div>Item</div><div>Sold</div><div style={{ textAlign: "right" }}>Units</div>
          {wide && <div style={{ textAlign: "right" }}>Unit price</div>}
          <div style={{ textAlign: "right" }}>Remaining</div>
          {wide && <div>Status</div>}
        </div>
        {rows.map(r => (
          <div key={r.item} className="fx-tr" style={{ gridTemplateColumns: wide ? "minmax(0,1.6fr) minmax(0,1.3fr) 60px 70px 90px 100px" : "minmax(0,1.5fr) minmax(0,1fr) 54px 88px",
            minHeight: wide ? 46 : 50, background: r.sold === 0 ? "var(--bad-soft)" : undefined }}>
            <div>
              <div className="fx-strong" style={ell}>{r.item}</div>
              {!wide && <div style={{ fontSize: 11, color: "var(--faint)", display: "flex", gap: 6, alignItems: "center" }}>{r.price} each · <Scarcity r={r} /></div>}
            </div>
            <Bar value={r.sold} max={r.total} color={r.pct >= 80 ? "var(--accent)" : evColor(e)} />
            <div className="fx-num">{r.sold}/{r.total}</div>
            {wide && <div className="fx-num" style={{ color: "var(--dim)" }}>{r.price}</div>}
            <div className="fx-num fx-strong">{eur(r.leftV)}</div>
            {wide && <div><Scarcity r={r} /></div>}
          </div>
        ))}
      </Card>
    );
  };

  return (
    <Page>
      <PageHead title="Inventory" sub="Finite stock per event and exactly what is left to sell." fx={fx} />
      <div className="fx-card" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) repeat(4,minmax(0,1fr))", gap: 16, padding: "16px 18px", marginBottom: 14, alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 11.5, color: "var(--dim)" }}>Remaining value to sell</div>
          <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-.8px", color: "var(--ink)", marginTop: 4 }}>{eur(leftV)}</div>
          <div style={{ fontSize: 11, color: "var(--faint)" }}>Units left × list price</div>
        </div>
        <Fig label="Sold at list price" value={eurK(soldV)} sub={`${Math.round((soldV / (soldV + leftV)) * 100)}% of sellable value`} />
        <Fig label="Units left" value={leftUnits} sub={`across ${all.length} lines`} />
        <Fig label="Scarce lines (80%+ sold)" value={scarce.length} color="var(--accent)" sub={scarce.slice(0, 2).map(r => r.item.replace(" Slots", "")).join(", ") || "None"} />
        <Fig label="Unsold lines" value={unsold.length} color={unsold.length ? "var(--bad)" : undefined} sub={unsold.map(r => `${EVENTS[r.e].short} ${r.item.toLowerCase()}`).join(", ") || "None"} />
      </div>

      {unsold.some(r => r.e === "mh" && r.item === "Headline Sponsorship") && (
        <div style={{ marginBottom: 14 }}>
          <Note tone="bad">
            <Row gap={12} style={{ alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ flex: 1, minWidth: 260 }}>
                <b style={{ color: "var(--ink)" }}>Future Men's Health headline sponsorship is unsold.</b> 2 × €40,000 = €80,000 still open with 24 weeks to go.
                Orbit Health Cover (€28,000 proposal, board decision 9 Oct) is the only live conversation.
              </span>
              <Btn size="sm" onClick={() => fx.open("deal", "d-orbit")}>Orbit deal</Btn>
              <ActBtn fx={fx} k="sales-mh-headline-list" label="Build target list" doneLabel="Target list built" size="sm"
                toast="12 headline prospects added to Kathleen's pipeline from HubSpot and past sponsors" />
            </Row>
          </Note>
        </div>
      )}

      {wide ? (
        <div style={grid("minmax(0,1.75fr) minmax(0,1fr)")}>
          {stats.map(s => eventCard(s.e, s.rows))}
          <SideLists fx={fx} scarce={scarce} push={push} single />
        </div>
      ) : (
        <>
          <div style={grid("minmax(0,1fr) minmax(0,1fr)")}>{stats.map(s => eventCard(s.e, s.rows))}</div>
          <div style={grid("minmax(0,1fr) minmax(0,1fr)", 14, 0)}><SideLists fx={fx} scarce={scarce} push={push} /></div>
        </>
      )}
    </Page>
  );
}

function SideLists({ fx, scarce, push, single }: { fx: Fx; scarce: (InvStat & { e: Ev2 })[]; push: (InvStat & { e: Ev2 })[]; single?: boolean }) {
  const scarceCard = (
    <Card title="Scarce" sub="80%+ sold, price holds">
      {scarce.map(r => (
        <div key={r.e + r.item} style={{ padding: "8px 0", borderTop: "1px solid var(--border)" }}>
          <Row gap={8}><EventTag id={r.e} /><span style={{ ...ell, fontSize: 12.5, color: "var(--ink)", flex: 1 }}>{r.item}</span><Badge tone="accent">{r.left} left</Badge></Row>
          <Meter label={`${r.sold} of ${r.total} sold`} value={r.sold} max={r.total} color="var(--accent)" />
        </div>
      ))}
      <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 6 }}>No discounting on scarce lines. Offer upgrades from standard stands instead.</div>
    </Card>
  );
  const pushCard = (
    <Card title="Where the remaining value sits" sub="Largest open lines">
      {push.map((r, i) => (
        <div key={r.e + r.item} style={{ display: "grid", gridTemplateColumns: "18px minmax(0,1fr) auto", gap: 8, alignItems: "center", padding: "8px 0", borderTop: i ? "1px solid var(--border)" : "none" }}>
          <span style={{ fontSize: 11, color: "var(--faint)" }}>{i + 1}</span>
          <div style={{ minWidth: 0 }}>
            <Row gap={6}><EventTag id={r.e} /><span style={{ ...ell, fontSize: 12.5, color: "var(--ink)" }}>{r.item}</span></Row>
            <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 3 }}>{r.left} × {r.price}</div>
          </div>
          <span className="fx-num fx-strong">{eur(r.leftV)}</span>
        </div>
      ))}
      <div style={{ marginTop: 8 }}><button className="fx-link" onClick={() => fx.goTo("Sales", "pipeline")}>Work these in the pipeline →</button></div>
    </Card>
  );
  return single ? <div style={{ display: "grid", gap: 14, alignContent: "start" }}>{scarceCard}{pushCard}</div> : <>{scarceCard}{pushCard}</>;
}

/* ── Forecast ───────────────────────────────────────────────────────────── */
function Forecast({ fx }: ModuleProps) {
  const K = KPIS[fx.event];
  const evs = evList(fx.event);
  const fc = fcFor(fx.event);
  const last = FORECAST_MONTHS.length - 1;
  const neg = sum(evs.map(e => FUNNEL[e].Negotiation[1])), sent = sum(evs.map(e => FUNNEL[e]["Contract Sent"][1]));
  const c1 = evs.length === 1 ? evColor(evs[0]) : "var(--accent)";
  const k = (n: number) => "€" + n + "k";
  const signedK = (n: number) => (n >= 0 ? "+" : "-") + "€" + Math.abs(n) + "k";

  const ladder: [string, number, string][] = [
    ["Contracted today", Math.round(K.contracted / 1000), "var(--ok)"],
    ["Contracted by March", fc.contracted[last], c1],
    ["2027 B2B revenue", Math.round(K.revenue2027 / 1000), c1],
    ["Weighted outcome", fc.weighted[last], "var(--ev-ca)"],
    ["Best case", fc.bestCase[last], "var(--dim)"],
  ];
  const tgt = fc.target[last];
  const lMax = Math.max(tgt, ...ladder.map(l => l[1])) * 1.06;
  const gapW = fc.weighted[last] - tgt, gapC = fc.contracted[last] - tgt;

  const byType = PKG_TYPES.map((t, i) => ({
    t, c: sum(evs.map(e => MIX[e].contracted[i])), l: sum(evs.map(e => MIX[e].late[i])), p: sum(evs.map(e => MIX[e].pipeline[i])),
    inv: sum(evs.flatMap(e => invStats(e).filter(r => INV_TYPE[r.item] === i).map(r => r.leftV))),
  }));

  const evRows = evs.map(e => ({ e, k: KPIS[e], end: FC_END[e] }));

  return (
    <Page>
      <PageHead title="Forecast" sub="Where 2027 revenue lands by March, against target." fx={fx} />

      <div className="fx-card" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) 28px minmax(0,1fr) 28px minmax(0,1.4fr)", alignItems: "center", gap: 10, padding: "16px 18px", marginBottom: 14 }}>
        <div>
          <div style={small}>2027 B2B revenue</div>
          <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-.8px", color: "var(--ink)", marginTop: 3 }}>{eur(K.revenue2027)}</div>
          <div style={{ fontSize: 11, color: "var(--faint)" }}>What we report for the 2027 events today</div>
        </div>
        <span style={{ fontSize: 20, color: "var(--faint)", textAlign: "center" }}>=</span>
        <div className="fx-flow-n" role="button" onClick={() => fx.goTo("Sales", "contracts")} style={{ padding: "10px 12px" }}>
          <div style={{ ...cap, color: "var(--ok)" }}>CONTRACTED</div>
          <div style={{ fontSize: 19, fontWeight: 600, color: "var(--ink)", marginTop: 4 }}>{eur(K.contracted)}</div>
          <div style={{ fontSize: 11, color: "var(--dim)" }}>Signed, invoiced 30/70</div>
        </div>
        <span style={{ fontSize: 20, color: "var(--faint)", textAlign: "center" }}>+</span>
        <div className="fx-flow-n" role="button" onClick={() => fx.goTo("Sales", "pipeline")} style={{ padding: "10px 12px" }}>
          <div style={{ ...cap, color: "var(--accent)" }}>LATE-STAGE PIPELINE</div>
          <div style={{ fontSize: 19, fontWeight: 600, color: "var(--ink)", marginTop: 4 }}>{eur(K.lateStage)}</div>
          <div style={{ fontSize: 11, color: "var(--dim)" }}>Negotiation {eur(neg)} + Contract Sent {eur(sent)}</div>
        </div>
      </div>

      <div style={grid("minmax(0,1.55fr) minmax(0,1fr)")}>
        <Card title="Revenue curve to March" sub="€k, cumulative · Sep 2026 to Mar 2027">
          <LineChart labels={FORECAST_MONTHS} height={236} fmt={k}
            series={[
              { name: "Contracted", color: c1, values: fc.contracted, area: true },
              { name: "Weighted", color: "var(--ev-ca)", values: fc.weighted },
              { name: "Best case", color: "var(--dim)", values: fc.bestCase, dashed: true },
              { name: "Target", color: "var(--warn)", values: fc.target, dashed: true },
            ]} />
        </Card>
        <Card title="Landing position, March" sub={`Target ${k(tgt)}`}>
          <div style={{ display: "grid", gap: 11 }}>
            {ladder.map(([l, v, c]) => (
              <div key={l}>
                <Row style={{ justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "var(--body)" }}>{l}</span>
                  <span style={{ color: "var(--ink)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{k(v)}</span>
                </Row>
                <div style={{ position: "relative", height: 10, marginTop: 5, borderRadius: 99, background: "var(--track)" }}>
                  <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(v / lMax) * 100}%`, borderRadius: 99, background: c }} />
                  <span style={{ position: "absolute", top: -3, bottom: -3, left: `${(tgt / lMax) * 100}%`, width: 2, borderRadius: 2, background: "var(--warn)" }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14 }}>
            <Note tone={gapW >= 0 ? "accent" : "warn"}>
              Weighted lands {signedK(gapW)} {gapW >= 0 ? "above" : "below"} target. Contracted alone is {signedK(gapC)} against target by March, so the late-stage deals have to close.
            </Note>
          </div>
        </Card>
      </div>

      <div style={grid("minmax(0,1fr) minmax(0,1.25fr)")}>
        <Card title="By month" sub="€k cumulative" pad={false}>
          <div style={{ height: 12 }} />
          <Table<{ m: string; i: number }>
            rows={FORECAST_MONTHS.map((m, i) => ({ m, i }))}
            highlight={r => r.i === 0}
            cols={[
              { k: "m", label: "Month", w: "minmax(0,.7fr)", render: r => <span className="fx-strong">{r.m}{r.i === 0 ? " · now" : ""}</span> },
              { k: "c", label: "Contracted", w: "minmax(0,1fr)", align: "right", render: r => k(fc.contracted[r.i]) },
              { k: "w", label: "Weighted", w: "minmax(0,1fr)", align: "right", render: r => k(fc.weighted[r.i]) },
              { k: "b", label: "Best", w: "minmax(0,.9fr)", align: "right", render: r => k(fc.bestCase[r.i]) },
              { k: "g", label: "Wtd vs target", w: "minmax(0,1.1fr)", align: "right",
                render: r => { const g = fc.weighted[r.i] - fc.target[r.i]; return <span style={{ color: g >= 0 ? "var(--ok)" : "var(--dim)" }}>{signedK(g)}</span>; } },
            ]} />
        </Card>
        <Card title="By package type" sub="Contracted + late-stage = 2027 revenue" pad={false}>
          <div style={{ height: 12 }} />
          <Table<typeof byType[number]>
            rows={byType}
            cols={[
              { k: "t", label: "Type", w: "minmax(0,1.4fr)", render: r => <Row gap={7}><span style={{ width: 8, height: 8, borderRadius: 2, background: PKG_COLORS[PKG_TYPES.indexOf(r.t)] }} /><span className="fx-strong">{r.t}</span></Row> },
              { k: "c", label: "Contracted", w: "minmax(0,1fr)", align: "right", render: r => eurK(r.c) },
              { k: "l", label: "Late-stage", w: "minmax(0,1fr)", align: "right", render: r => eurK(r.l) },
              { k: "r", label: "2027 rev.", w: "minmax(0,1fr)", align: "right", render: r => <span className="fx-strong">{eurK(r.c + r.l)}</span> },
              { k: "p", label: "Open pipe", w: "minmax(0,1fr)", align: "right", render: r => eurK(r.p) },
              { k: "i", label: "Unsold stock", w: "minmax(0,1fr)", align: "right", render: r => <span style={{ color: "var(--dim)" }}>{eurK(r.inv)}</span> },
            ]} />
          <div className="fx-tr" style={{ gridTemplateColumns: "minmax(0,1.4fr) repeat(5,minmax(0,1fr))", fontWeight: 600, color: "var(--ink)" }}>
            <div>Total</div>
            <div className="fx-num">{eurK(sum(byType.map(r => r.c)))}</div>
            <div className="fx-num">{eurK(sum(byType.map(r => r.l)))}</div>
            <div className="fx-num">{eur(sum(byType.map(r => r.c + r.l)))}</div>
            <div className="fx-num">{eurK(sum(byType.map(r => r.p)))}</div>
            <div className="fx-num">{eurK(sum(byType.map(r => r.inv)))}</div>
          </div>
        </Card>
      </div>

      <Card title="By event" sub="€k · March outcome by scenario" pad={false}>
        <div style={{ height: 12 }} />
        <Table<typeof evRows[number]>
          rows={evRows}
          onRow={r => fx.setEvent(r.e)}
          cols={[
            { k: "e", label: "Event", w: "minmax(0,1.6fr)", render: r => <EventTag id={r.e} short={false} /> },
            { k: "c", label: "Contracted", w: "minmax(0,1fr)", align: "right", render: r => eur(r.k.contracted) },
            { k: "l", label: "Late-stage", w: "minmax(0,1fr)", align: "right", render: r => eur(r.k.lateStage) },
            { k: "r", label: "2027 revenue", w: "minmax(0,1fr)", align: "right", render: r => <span className="fx-strong">{eur(r.k.revenue2027)}</span> },
            { k: "w", label: "Weighted", w: "minmax(0,.8fr)", align: "right", render: r => k(r.end.weighted) },
            { k: "b", label: "Best case", w: "minmax(0,.8fr)", align: "right", render: r => k(r.end.bestCase) },
            { k: "t", label: "Target", w: "minmax(0,.8fr)", align: "right", render: r => k(r.end.target) },
            { k: "g", label: "Wtd vs target", w: "minmax(0,.9fr)", align: "right",
              render: r => <span style={{ color: r.end.weighted >= r.end.target ? "var(--ok)" : "var(--bad)" }}>{signedK(r.end.weighted - r.end.target)}</span> },
          ]} />
        {evRows.length > 1 && (
          <div className="fx-tr" style={{ gridTemplateColumns: "minmax(0,1.6fr) repeat(3,minmax(0,1fr)) repeat(3,minmax(0,.8fr)) minmax(0,.9fr)", fontWeight: 600, color: "var(--ink)" }}>
            <div>All events</div>
            <div className="fx-num">{eur(KPIS.all.contracted)}</div>
            <div className="fx-num">{eur(KPIS.all.lateStage)}</div>
            <div className="fx-num">{eur(KPIS.all.revenue2027)}</div>
            <div className="fx-num">{k(FORECAST.weighted[last])}</div>
            <div className="fx-num">{k(FORECAST.bestCase[last])}</div>
            <div className="fx-num">{k(FORECAST.target[last])}</div>
            <div className="fx-num" style={{ color: "var(--ok)" }}>{signedK(FORECAST.weighted[last] - FORECAST.target[last])}</div>
          </div>
        )}
      </Card>
    </Page>
  );
}

/* ── Canada Pilot planning view ─────────────────────────────────────────── */
const CA_SUB: Record<string, string> = {
  overview: "No live sales yet. The commercial setup is cloned from Dublin and waiting on six decisions.",
  pipeline: "No deals yet. The pipeline stages and automations are cloned and ready.",
  deals: "No deals yet. HubSpot pipeline and deal properties are cloned from Dublin.",
  contracts: "Three contract templates are cloned. Local terms need review before first use.",
  inventory: "Inventory template cloned from Future Fertility Dublin. Pricing waits on currency.",
  forecast: "No forecast until venue, currency and pricing are set.",
};
function CanadaSales({ fx }: ModuleProps) {
  const title = ({ overview: "Sales", pipeline: "Pipeline", deals: "Deals", contracts: "Contracts", inventory: "Inventory", forecast: "Forecast" } as Record<string, string>)[fx.tab] ?? "Sales";
  const salesBlocking = ["Currency", "Tax treatment", "Payment provider", "Local exhibitor terms"];
  return (
    <Page>
      <PageHead title={title} sub={CA_SUB[fx.tab] ?? CA_SUB.overview} fx={fx} />
      <div style={grid("minmax(0,1.15fr) minmax(0,1fr)")}>
        <Card title="Commercial setup cloned from Dublin" sub={`Template: ${CANADA.template}`} right={<EventTag id="ca" short={false} />}>
          {CANADA.cloned.map(([l, n, t]) => <Meter key={l} label={l} value={n} max={t} color={evColor("ca")} right={`${n}/${t}`} />)}
          <div style={{ ...cap, margin: "12px 0 6px" }}>CONTRACT TEMPLATES</div>
          {["Exhibitor Agreement", "Sponsorship Agreement", "Commercial Speaking Agreement"].map(t => (
            <Row key={t} gap={8} style={{ padding: "6px 0", borderTop: "1px solid var(--border)", fontSize: 12.5 }}>
              <Icon d={PATHS.doc} size={14} style={{ color: "var(--dim)" }} /><span style={{ flex: 1, color: "var(--ink)" }}>{t}</span><Badge tone="warn">Local terms review</Badge>
            </Row>
          ))}
        </Card>
        <Card title="Decisions before sales can open" sub={`${CANADA.decisions.length} outstanding`}>
          {CANADA.decisions.map(([k, v]) => (
            <Row key={k} gap={8} style={{ padding: "8px 0", borderTop: "1px solid var(--border)", fontSize: 12.5 }}>
              <span style={{ flex: 1, color: "var(--ink)" }}>{k}</span>
              {salesBlocking.includes(k) && <Badge tone="ghost">Blocks invoicing</Badge>}
              <Status s={v} />
            </Row>
          ))}
          <Row gap={8} style={{ marginTop: 12, flexWrap: "wrap" }}>
            <ActBtn fx={fx} k="canada-decisions" label="Send decisions to Nikki" doneLabel="Sent to Nikki" size="sm" toast="Six localisation decisions sent to Nikki for review" />
            <Btn size="sm" kind="ghost" onClick={() => fx.goTo("Events", "portfolio")}>Events portfolio</Btn>
            <Btn size="sm" kind="ghost" onClick={() => fx.setEvent("ff")}>See Dublin sales</Btn>
          </Row>
        </Card>
      </div>
      <Card title="Inventory template" sub="Units cloned from Future Fertility Dublin · prices TBD until currency is set">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 8 }}>
          {INVENTORY.ff.map(r => (
            <div key={r.item} style={{ padding: "10px 12px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div style={{ ...ell, fontSize: 12.5, color: "var(--ink)", fontWeight: 500 }}>{r.item}</div>
              <Row style={{ justifyContent: "space-between", marginTop: 4, fontSize: 11.5, color: "var(--dim)" }}>
                <span>{r.total} units</span><span>Dublin {r.price}</span>
              </Row>
            </div>
          ))}
        </div>
      </Card>
    </Page>
  );
}

/* ── Drawers ────────────────────────────────────────────────────────────── */
function NotFound({ fx, kind, id }: { fx: Fx; kind: string; id: string }) {
  return (
    <Drawer fx={fx} eyebrow={kind.toUpperCase()} title={`${kind === "deal" ? "Deal" : "Contract"} not found`}>
      <Note>No {kind} with reference {id}. It may have been merged during the HubSpot sync.</Note>
      <div style={{ marginTop: 12 }}><Btn onClick={() => fx.goTo("Sales", kind === "deal" ? "deals" : "contracts")}>All {kind}s</Btn></div>
    </Drawer>
  );
}

function PackageList({ items }: { items: [string, string][] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
      {items.map(([k, v]) => (
        <Row key={k} gap={8} style={{ padding: "8px 10px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", fontSize: 12.5 }}>
          <Icon d={PATHS.check} size={12} sw={2.4} style={{ color: "var(--ok)" }} />
          <span style={{ ...ell, flex: 1, color: "var(--ink)" }}>{k}</span>
          <span style={{ color: "var(--dim)", fontSize: 11.5 }}>{v}</span>
        </Row>
      ))}
    </div>
  );
}

function OntologyLink({ fx }: { fx: Fx }) {
  return (
    <button className="fx-link" onClick={() => fx.goTo("Records", "ontology")} style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6 }}>
      <Icon d={PATHS.flow} size={13} /> See every connection in the Records ontology →
    </button>
  );
}

function HubCenter({ d, line }: { d: Deal; line: string }) {
  return (
    <Row gap={12}>
      <span style={{ width: 34, height: 34, borderRadius: 10, background: "var(--accent-soft)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
        <Icon d={PATHS.link} size={16} />
      </span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>One deal · {d.company} · {eur(d.value)}</div>
        <div style={{ fontSize: 11.5, color: "var(--dim)", marginTop: 2 }}>{line}</div>
      </div>
    </Row>
  );
}

function RelatedDeals({ fx, d }: { fx: Fx; d: Deal }) {
  const rel = DEALS.filter(x => x.company === d.company && x.id !== d.id);
  if (!rel.length) return null;
  return (
    <Sec title="RELATED DEALS">
      {rel.map(r => (
        <div key={r.id} className="fx-flow-n" role="button" onClick={() => fx.open("deal", r.id)}
          style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto auto", gap: 10, alignItems: "center", padding: "9px 12px" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12.5, color: "var(--ink)", fontWeight: 500 }}>{r.pkg}</div>
            <div style={{ fontSize: 11.5, color: "var(--dim)" }}>{r.next}</div>
          </div>
          <StageBadge s={r.stage} /><span className="fx-num fx-strong">{eur(r.value)}</span>
        </div>
      ))}
    </Sec>
  );
}

function DealDrawer({ fx, id }: DrawerProps) {
  const d = DEALS.find(x => x.id === id);
  if (!d) return <NotFound fx={fx} kind="deal" id={id} />;
  if (d.id === "d-nova") return <NovaDeal fx={fx} d={d} />;
  if (d.id === "d-peak") return <PeakDeal fx={fx} d={d} />;
  if (d.stage === "Won") return <WonDeal fx={fx} d={d} />;
  return <OpenDeal fx={fx} d={d} />;
}

function NovaDeal({ fx, d }: { fx: Fx; d: Deal }) {
  const obs = novaObs(fx);
  const chased = !!fx.acted["chase-nova"];
  const nodes: HubNode[] = [
    { t: "CONTRACT", h: "Exhibitor Agreement AGR-2027-101 · e-signed 16 Sep", d: "Standard template · 8 line items · 30/70 payment plan", s: "Signed", go: () => fx.open("contract", "c-nova") },
    { t: "FINANCE", h: "FE-2027-0412 deposit €5,400 · FE-2027-0413 balance €12,600", d: "Raised in Xero on signature · deposit due 23 Sep, balance due 1 Feb 2027",
      s: chased ? "Overdue · reminder #3 sent" : "Overdue 4 days", go: () => fx.goTo("Finance", "invoices", { kind: "invoice", id: "i-nova-1" }) },
    { t: "EXHIBITOR", h: "Exhibitor record · stand A07, Zone A · 4m x 2m", d: "Readiness 52% · deposit and frontage outstanding", s: "BLOCKED",
      go: () => fx.goTo("Exhibitors", "onboarding", { kind: "exhibitor", id: "x-nova" }),
      extra: [["Floor plan A07: 4m requested, 3m allocated", () => fx.goTo("Exhibitors", "floorplan", { kind: "stand", id: "A07" })]] },
    { t: "PRODUCTION", h: "Dr Aoife Brennan · Main Stage 1", d: `"${NOVA.session}" · first-cut deck due 24 Sep`, s: fx.acted["nudge-brennan"] ? "Deck nudge sent" : "BLOCKING AV",
      go: () => fx.goTo("Production", "presentations", { kind: "speaker", id: "s-brennan" }) },
    { t: "MARKETING", h: "2 social announcement posts + website listing", d: "Growth calendar · partner page live · 1 post scheduled, 1 in draft", s: "In progress",
      go: () => fx.goTo("Growth", "content") },
  ];
  const tl: TL[] = [
    ["22 Jul", "Lead created from the exhibitor enquiry form · assigned to Kathleen Corr"],
    ["5 Aug", "Proposal sent: premium stand + Main Stage slot, €18,000"],
    ["28 Aug", "Negotiation: 4m frontage and speaking slot agreed in principle"],
    ["12 Sep", "Kathleen moved the deal to Contract Sent · standard agreement generated", "accent"],
    ["16 Sep", "E-signed by Nova Fertility Clinic", "ok"],
    ["16 Sep", "Invoices FE-2027-0412 and FE-2027-0413 generated automatically · exhibitor, speaker and content records created", "ok"],
    ["18 Sep", "Workshop upgrade opened as a separate deal, €4,500"],
    ["23 Sep", "Deposit due · not received", "bad"],
    ["24 Sep", "Deposit reminder #1 sent automatically", "warn"],
    ["25 Sep", "Deposit reminder #2 sent automatically", "warn"],
    ...(chased ? [["Today", "Deposit reminder #3 sent from Pulse · call booked Mon", "accent"] as TL] : []),
  ];
  return (
    <Drawer fx={fx} width={740} eyebrow="DEAL · FUTURE FERTILITY DUBLIN 2027" title={d.company}
      badges={<><StageBadge s="Won" /><Badge tone="ok">Signed 16 Sep</Badge><EventTag id="ff" short={false} /><Badge tone="bad">Deposit overdue 4 days</Badge></>}
      actions={<>
        <Btn kind="ghost" icon={PATHS.flow} onClick={() => fx.goTo("Records", "ontology")}>Ontology</Btn>
        <Btn icon={PATHS.doc} onClick={() => fx.open("contract", "c-nova")}>Open contract</Btn>
        <ActBtn fx={fx} k="chase-nova" label="Send deposit reminder" doneLabel="Reminder sent" toast="Deposit reminder #3 sent to Nova Fertility Clinic" />
      </>}>
      <Note tone={chased ? "warn" : "bad"}>
        {chased
          ? "Reminder #3 sent today. Kathleen has a call with the practice director booked for Monday."
          : "Deposit of €5,400 (FE-2027-0412) was due 23 Sep and is 4 days overdue. Reminders went automatically on 24 and 25 Sep."}
      </Note>
      <Sec title="DEAL">
        <KV cols={3} items={[
          ["Value", eur(NOVA.value)], ["Deposit 30%", eur(NOVA.deposit)], ["Balance", eur(NOVA.balance)],
          ["Deal owner", <Row gap={7}><Avatar name={NOVA.owner} size={18} bg={teamBg(NOVA.owner)} />{NOVA.owner}</Row>],
          ["Event", "Future Fertility Dublin 2027"], ["Signed", NOVA.signed],
        ]} />
        <div style={{ marginTop: 10 }}><Split value={NOVA.value} /></div>
      </Sec>
      <Sec title="PACKAGE · 8 LINE ITEMS"><PackageList items={NOVA.package} /></Sec>
      <Sec title="SIGNED 16 SEP · THE SAME DEAL AUTOMATICALLY BECAME">
        <Hub center={<HubCenter d={d} line="Nobody re-keyed it. Contract, money, exhibitor, production and marketing all read from this record." />} nodes={nodes} />
        <OntologyLink fx={fx} />
      </Sec>
      <Sec title="EVERY LINE ITEM IS NOW AN OBLIGATION" right={<span style={{ fontSize: 11, color: "var(--faint)", letterSpacing: 0, fontWeight: 400 }}>line item → record → owner → status</span>}>
        <ObMap obs={obs} />
      </Sec>
      <Sec title="ACTIVITY"><Timeline items={tl} /></Sec>
      <RelatedDeals fx={fx} d={d} />
    </Drawer>
  );
}

function PeakDeal({ fx, d }: { fx: Fx; d: Deal }) {
  const obs = peakObs(fx);
  const matched = !!fx.acted["match-peak"], reminded = !!fx.acted["remind-peak"];
  const nodes: HubNode[] = [
    { t: "CONTRACT", h: "Exhibitor Agreement AGR-2027-102 · e-signed 5 Sep", d: "Standard template · 30/70 payment plan", s: "Signed", go: () => fx.open("contract", "c-peak") },
    { t: "FINANCE", h: "FE-2027-0388 deposit €3,750 · FE-2027-0389 balance €8,750", d: matched ? "Deposit reconciled in Xero · balance due 1 Feb 2027" : "€3,750 received 26 Sep, ref PEAKHLTH · Xero match 96%, awaiting approval",
      s: matched ? "Paid" : "Match pending", go: () => fx.goTo("Finance", "invoices", { kind: "invoice", id: "i-peak-1" }),
      extra: matched ? undefined : [["Approve the match in Reconciliation", () => fx.goTo("Finance", "reconciliation")]] },
    { t: "EXHIBITOR", h: "Exhibitor record · stand B14, Zone B · 4m x 2m", d: "Readiness 78% · missing Logo SVG and Speaker headshot", s: "AT RISK",
      go: () => fx.goTo("Exhibitors", "onboarding", { kind: "exhibitor", id: "x-peak" }),
      extra: [[`Floor plan B14: "${PEAK.request}"`, () => fx.goTo("Exhibitors", "floorplan", { kind: "stand", id: "B14" })]] },
    { t: "PRODUCTION", h: "Dr Hugh Tierney · Workshop Stage 2", d: '"What Your Bloods Are Telling You" · headshot due 30 Sep', s: "Headshot missing",
      go: () => fx.goTo("Production", "speakers", { kind: "speaker", id: "s-tierney" }) },
    { t: "MARKETING", h: "Announcement post + exhibitor listing", d: "Held until the logo SVG arrives", s: reminded ? "Reminder sent" : "Waiting on logo", go: () => fx.goTo("Growth", "content") },
  ];
  const tl: TL[] = [
    ["30 Jul", "Lead created · assigned to Daniel Murray"],
    ["12 Aug", "Proposal sent: 4m x 2m stand + speaker, €12,500"],
    ["2 Sep", "Contract sent from the standard template", "accent"],
    ["5 Sep", "E-signed by Peak Health Labs", "ok"],
    ["5 Sep", "Invoices FE-2027-0388 and FE-2027-0389 generated automatically · exhibitor record and stand B14 created", "ok"],
    ["19 Sep", "Deposit due"],
    ["26 Sep", "€3,750 received in AIB, ref PEAKHLTH · matched at 96%", matched ? "ok" : "warn"],
    ...(matched ? [["Today", "Match approved · FE-2027-0388 marked Paid and reconciled", "ok"] as TL] : []),
    ...(reminded ? [["Today", "Asset reminder sent: logo SVG and speaker headshot", "accent"] as TL] : []),
  ];
  return (
    <Drawer fx={fx} width={740} eyebrow="DEAL · FUTURE MEN'S HEALTH DUBLIN 2027" title={d.company}
      badges={<><StageBadge s="Won" /><Badge tone="ok">Signed 5 Sep</Badge><EventTag id="mh" short={false} /><Badge tone={matched ? "ok" : "warn"}>{matched ? "Deposit paid" : "Deposit match pending"}</Badge></>}
      actions={<>
        <Btn kind="ghost" icon={PATHS.flow} onClick={() => fx.goTo("Records", "ontology")}>Ontology</Btn>
        <Btn icon={PATHS.doc} onClick={() => fx.open("contract", "c-peak")}>Open contract</Btn>
        <ActBtn fx={fx} k="remind-peak" label="Send asset reminder" doneLabel="Asset reminder sent" toast="Asset reminder sent to Peak Health Labs: logo SVG and speaker headshot" />
      </>}>
      <Note tone={matched ? undefined : "warn"}>
        {matched ? "Deposit reconciled in Xero and FE-2027-0388 is Paid. " : "€3,750 arrived 26 Sep (ref PEAKHLTH). The Xero match at 96% confidence is waiting on approval. "}
        Onboarding is at 78%: still missing the Logo SVG and Dr Hugh Tierney's headshot.
      </Note>
      <Sec title="DEAL">
        <KV cols={3} items={[
          ["Value", eur(PEAK.value)], ["Deposit 30%", `${eur(PEAK.deposit)} · ${matched ? "paid" : "received"}`], ["Balance", `${eur(PEAK.balance)} · 1 Feb 2027`],
          ["Deal owner", <Row gap={7}><Avatar name={PEAK.owner} size={18} bg={teamBg(PEAK.owner)} />{PEAK.owner}</Row>],
          ["Event", "Future Men's Health Dublin 2027"], ["Signed", "5 Sep 2026"],
        ]} />
        <div style={{ marginTop: 10 }}><Split value={PEAK.value} /></div>
      </Sec>
      <Sec title="PACKAGE · 8 LINE ITEMS">
        <PackageList items={[["Exhibition stand", PEAK.size], ["Back wall", "Included"], ["Power", PEAK.power], ["Lighting", PEAK.lights],
          ["Workshop speaking slot", "Workshop Stage 2"], ["Social announcement posts", "2"], ["Website listing", "Partner page · logo required"], ["Partner tickets", "8"]]} />
      </Sec>
      <Sec title="SIGNED 5 SEP · THE SAME DEAL AUTOMATICALLY BECAME">
        <Hub center={<HubCenter d={d} line="One record drives the contract, both invoices, stand B14, the speaker slot and the marketing requests." />} nodes={nodes} />
        <OntologyLink fx={fx} />
      </Sec>
      <Sec title="EVERY LINE ITEM IS NOW AN OBLIGATION" right={<span style={{ fontSize: 11, color: "var(--faint)", letterSpacing: 0, fontWeight: 400 }}>line item → record → owner → status</span>}>
        <ObMap obs={obs} />
      </Sec>
      <Sec title="ACTIVITY"><Timeline items={tl} /></Sec>
    </Drawer>
  );
}

const worst = (ss: string[]) => {
  const rank = (s: string) => (/overdue/i.test(s) ? 0 : /match|open/i.test(s) ? 1 : /scheduled/i.test(s) ? 2 : 3);
  return [...ss].sort((a, b) => rank(a) - rank(b))[0] ?? "Scheduled";
};

function WonDeal({ fx, d }: { fx: Fx; d: Deal }) {
  const obs = genericObs(fx, d);
  const c = contractFor(d);
  const ex = EXHIBITORS.find(x => x.company === d.company);
  const fin = obs.filter(o => o.mod === "Finance");
  const prod = obs.filter(o => o.mod === "Production");
  const grow = obs.filter(o => o.mod === "Growth");
  const nodes: HubNode[] = [];
  if (c) nodes.push({ t: "CONTRACT", h: `${templateOf(d)} ${cNo(c)} · e-signed ${c.signed}`, d: `Standard template · ${c.payment}`, s: "Signed", go: () => fx.open("contract", c.id) });
  nodes.push({ t: "FINANCE", h: fin.map(f => f.record.split(" · ")[0]).join(" · "), d: fin.map(f => `${f.item.split(" · ")[0]}: ${f.status}`).join(" · "), s: worst(fin.map(f => f.status)), go: fin[0]?.go });
  if (ex) nodes.push({ t: "EXHIBITOR", h: `Exhibitor record · ${ex.stand ? `stand ${ex.stand}, Zone ${ex.zone}` : "stand to place"} · ${ex.size}`, d: `Readiness ${ex.readiness}%${ex.missing ? " · missing " + ex.missing.join(", ") : ""}`,
    s: ex.state, go: () => fx.goTo("Exhibitors", "onboarding", { kind: "exhibitor", id: ex.id }),
    extra: ex.stand ? [[`Floor plan ${ex.stand}`, () => fx.goTo("Exhibitors", "floorplan", { kind: "stand", id: ex.stand })]] : undefined });
  if (prod.length) nodes.push({ t: "PRODUCTION", h: prod[0].record, d: prod.map(p => p.item).join(" · "), s: prod[0].status, go: prod[0].go });
  if (grow.length) nodes.push({ t: "MARKETING", h: `${grow.length} marketing item${grow.length > 1 ? "s" : ""}`, d: grow.map(g => g.record).join(" · "), s: grow[0].status, go: grow[0].go });
  const dep = Math.round(d.value * 0.3);
  const tl: TL[] = c ? [
    [c.sent, "Contract sent from the standard template", "accent"],
    [c.signed, `E-signed by ${d.company}`, "ok"],
    [c.signed, c.payment === "Paid in full" ? "Invoice generated automatically · paid in full" : "Deposit and balance invoices generated automatically in Xero", "ok"],
    [c.signed, `${ex ? "Exhibitor record, " : ""}fulfilment checklist and marketing requests created`, "ok"],
    ["Now", d.next],
  ] : [["Now", d.next]];
  return (
    <Drawer fx={fx} width={720} eyebrow={`DEAL · ${EVENTS[d.event].label.toUpperCase()}`} title={d.company}
      badges={<><StageBadge s="Won" />{c?.signed && <Badge tone="ok">Signed {c.signed}</Badge>}<EventTag id={d.event} short={false} /><Badge tone="ghost">{d.type}</Badge></>}
      actions={<>
        <Btn kind="ghost" icon={PATHS.flow} onClick={() => fx.goTo("Records", "ontology")}>Ontology</Btn>
        {c && <Btn icon={PATHS.doc} onClick={() => fx.open("contract", c.id)}>Open contract</Btn>}
        {ex && <Btn kind="primary" onClick={() => fx.goTo("Exhibitors", "onboarding", { kind: "exhibitor", id: ex.id })}>Exhibitor record</Btn>}
      </>}>
      <Sec title="DEAL">
        <KV cols={3} items={[
          ["Value", eur(d.value)], ["Deposit 30%", eur(dep)], ["Balance", eur(d.value - dep)],
          ["Deal owner", <Row gap={7}><Avatar name={d.owner} size={18} bg={teamBg(d.owner)} />{d.owner}</Row>],
          ["Package", d.pkg], ["Contact", ex?.contact ?? "Account contact on file"],
        ]} />
        {c?.payment !== "Paid in full" && <div style={{ marginTop: 10 }}><Split value={d.value} /></div>}
      </Sec>
      <Sec title={`SIGNED ${c?.signed?.toUpperCase() ?? ""} · THE SAME DEAL AUTOMATICALLY BECAME`}>
        <Hub center={<HubCenter d={d} line="Every downstream record reads from this deal." />} nodes={nodes} />
        <OntologyLink fx={fx} />
      </Sec>
      <Sec title="EVERY LINE ITEM IS NOW AN OBLIGATION"><ObMap obs={obs} /></Sec>
      <Sec title="ACTIVITY"><Timeline items={tl} /></Sec>
      <RelatedDeals fx={fx} d={d} />
    </Drawer>
  );
}

function OpenDeal({ fx, d }: { fx: Fx; d: Deal }) {
  const obs = genericObs(fx, d);
  const c = contractFor(d);
  const lost = d.stage === "Lost";
  const items = obs.filter(o => o.mod !== "Finance");
  const dep = Math.round(d.value * 0.3);
  const stake = STAKE[d.id] ?? [["Decision maker", "To confirm on next call"]];
  return (
    <Drawer fx={fx} width={680} eyebrow={`DEAL · ${EVENTS[d.event].label.toUpperCase()}`} title={d.company}
      badges={<><StageBadge s={d.stage} /><EventTag id={d.event} short={false} /><Badge tone="ghost">{d.type}</Badge>{d.closing && !lost && <Badge tone="ghost">Closing {d.closing}</Badge>}</>}
      actions={lost
        ? <ActBtn fx={fx} k={`sales-nurture-${d.id}`} label="Add to 2028 nurture" doneLabel="In 2028 nurture" toast={`${d.company} added to the 2028 early-bird nurture sequence`} />
        : <>
          {c && <Btn icon={PATHS.doc} onClick={() => fx.open("contract", c.id)}>Open contract</Btn>}
          {c
            ? <ActBtn fx={fx} k={`sales-chase-${c.id}`} label="Chase signature" doneLabel="Chased" toast={`Signature reminder sent to ${d.company}`} />
            : <ActBtn fx={fx} k={`sales-next-${d.id}`} label="Book follow-up" doneLabel="Follow-up booked" toast={`Follow-up booked with ${d.company} for ${d.owner}`} />}
        </>}>
      {lost
        ? <Note tone="bad">Closed lost: {d.next}. Kept on file for the 2028 cycle.</Note>
        : <Note tone="accent"><b style={{ color: "var(--ink)" }}>Next step:</b> {d.next}{d.id === "d-nova-up" ? ". Nova's main €18,000 deal is already signed." : ""}</Note>}
      <Sec title="DEAL">
        <KV cols={4} items={[
          ["Value", eur(d.value)], ["Probability", d.prob + "%"], ["Weighted", eur(weighted(d))], ["Closing", closeLabel(d)],
          ["Owner", <Row gap={7}><Avatar name={d.owner} size={18} bg={teamBg(d.owner)} />{d.owner.split(" ")[0]}</Row>], ["Type", d.type], ["Template", templateOf(d).replace(" Agreement", "")], ["Event", EVENTS[d.event].short],
        ]} />
      </Sec>
      <Sec title="STAGE"><StagePath s={d.stage} /></Sec>
      <Sec title="PROPOSAL">
        <div className="fx-card" style={{ padding: "12px 14px", borderRadius: 14 }}>
          <Row gap={8}><span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)", flex: 1 }}>{d.pkg}</span><span style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>{eur(d.value)}</span></Row>
          <div style={{ display: "grid", gap: 4, marginTop: 10 }}>
            {items.map(o => (
              <Row key={o.item} gap={8} style={{ fontSize: 12.5 }}>
                <Icon d={PATHS.check} size={12} sw={2.4} style={{ color: "var(--dim)" }} /><span style={{ color: "var(--body)" }}>{o.item}</span>
              </Row>
            ))}
          </div>
          <div style={{ marginTop: 12 }}><Split value={d.value} /></div>
          <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 6 }}>Standard terms: {eur(dep)} on signature, {eur(d.value - dep)} by 1 Feb 2027.</div>
        </div>
      </Sec>
      <Sec title="STAKEHOLDERS">
        {stake.map(([n, r]) => <PersonRow key={n} name={n} role={r} />)}
        <PersonRow name={d.owner} role={`Future Events · ${TEAM.find(t => t.name === d.owner)?.role ?? "Sales"}`} />
      </Sec>
      {c && (
        <Sec title="CONTRACT">
          <div className="fx-flow-n" role="button" onClick={() => fx.open("contract", c.id)} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 10, alignItems: "center", padding: "10px 12px" }}>
            <div>
              <div style={{ fontSize: 12.5, color: "var(--ink)", fontWeight: 500 }}>{templateOf(d)} {cNo(c)}</div>
              <div style={{ fontSize: 11.5, color: "var(--dim)" }}>Sent {c.sent} · waiting {TODAY_DOY - doy(c.sent)} days</div>
            </div>
            <Status s={c.status} />
          </div>
        </Sec>
      )}
      {!lost && (
        <Sec title="ON SIGNATURE, PULSE CREATES AUTOMATICALLY">
          <ObMap obs={obs} />
        </Sec>
      )}
      <RelatedDeals fx={fx} d={d} />
    </Drawer>
  );
}

function ContractDrawer({ fx, id }: DrawerProps) {
  const c = CONTRACTS.find(x => x.id === id);
  if (!c) return <NotFound fx={fx} kind="contract" id={id} />;
  const d = dealFor(c);
  const signed = c.status === "Signed";
  const obs = d ? obsFor(fx, d) : [];
  const items = obs.filter(o => o.mod !== "Finance");
  const money = obs.filter(o => o.mod === "Finance");
  const owner = d?.owner ?? "Kathleen Corr";
  const ex = EXHIBITORS.find(x => x.company === c.client);
  const signer = SIGNERS[c.id] ?? ex?.contact ?? "Authorised signatory";
  const lines: string[] = c.id === "c-nova" ? NOVA.package.map(([k, v]) => `${k} · ${v}`) : items.map(o => o.item);
  const waiting = TODAY_DOY - doy(c.sent);
  return (
    <Drawer fx={fx} width={680} eyebrow={`CONTRACT · ${cNo(c)}`} title={c.client}
      badges={<><Status s={c.status} /><EventTag id={c.event} short={false} /><Badge tone="ghost">{templateOf(d)} v2027.2</Badge></>}
      actions={signed
        ? <>
          <Btn kind="ghost" icon={PATHS.doc} onClick={() => fx.toast(`Signed PDF of ${cNo(c)} saved to Drive`)}>Save PDF</Btn>
          {d && <Btn kind="primary" onClick={() => fx.open("deal", d.id)}>Open deal</Btn>}
        </>
        : <>
          {d && <Btn onClick={() => fx.open("deal", d.id)}>Open deal</Btn>}
          <ActBtn fx={fx} k={`sales-chase-${c.id}`} label="Send signature reminder" doneLabel="Reminder sent" toast={`Signature reminder sent to ${c.client}`} />
        </>}>
      {!signed && <Note tone="warn">Sent {c.sent}, {c.status === "Viewed" ? "opened by the client" : "not yet opened"}, waiting {waiting} days. Nothing below is created until the client e-signs.</Note>}
      <Sec title="AGREEMENT">
        <KV cols={3} items={[
          ["Value", eur(c.value)], ["Package", c.pkg], ["Payment setup", c.payment],
          ["Sent", c.sent], ["Signed", c.signed || "Awaiting"], ["Owner", owner],
        ]} />
      </Sec>
      <Sec title={`LINE ITEMS · CLAUSE 2 · ${lines.length}`}>
        <div style={{ display: "grid", gap: 4 }}>
          {lines.map((l, i) => (
            <Row key={l} gap={10} style={{ padding: "7px 10px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", fontSize: 12.5 }}>
              <span style={{ width: 26, color: "var(--faint)", fontVariantNumeric: "tabular-nums" }}>2.{i + 1}</span>
              <span style={{ color: "var(--ink)" }}>{l}</span>
            </Row>
          ))}
        </div>
      </Sec>
      <Sec title="PAYMENT SCHEDULE · CLAUSE 3">
        {c.payment !== "Paid in full" && <Split value={c.value} />}
        <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
          {money.map(m => (
            <div key={m.item} className="fx-flow-n" role="button" onClick={m.go}
              style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.2fr) auto", gap: 10, alignItems: "center", padding: "9px 12px" }}>
              <span style={{ fontSize: 12.5, color: "var(--ink)", fontWeight: 500 }}>{m.item}</span>
              <span style={{ ...ell, fontSize: 12, color: "var(--dim)" }}>{m.record}</span>
              <Status s={m.status} />
            </div>
          ))}
        </div>
      </Sec>
      <Sec title="SIGNATURES · E-SIGN">
        <div style={{ display: "grid", gap: 6 }}>
          {[
            [owner, "Future Events · Antidote Events Ltd", `Signed ${c.sent} on issue`, "done"],
            [signer.split(" · ")[0], `${c.client}${signer.includes(" · ") ? " · " + signer.split(" · ")[1] : ""}`, signed ? `E-signed ${c.signed}` : c.status === "Viewed" ? "Viewed · not signed" : "Awaiting", signed ? "done" : "pending"],
          ].map(([n, org, st, s]) => (
            <Row key={org} gap={10} style={{ padding: "9px 12px", borderRadius: 12, background: "var(--surface)", border: "1px solid var(--border)" }}>
              <Avatar name={n} size={28} bg={teamBg(n)} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12.5, color: "var(--ink)", fontWeight: 500 }}>{n}</div>
                <div style={{ ...ell, fontSize: 11.5, color: "var(--dim)" }}>{org}</div>
              </div>
              <Badge tone={s === "done" ? "ok" : "warn"}>{s === "done" && <Icon d={PATHS.check} size={10} sw={2.6} />}{st}</Badge>
            </Row>
          ))}
        </div>
      </Sec>
      <Sec title={signed ? "OBLIGATIONS GENERATED ON SIGNATURE" : "OBLIGATIONS READY TO GENERATE"}>
        <ObMap obs={items} />
        {c.id === "c-nova" && <OntologyLink fx={fx} />}
      </Sec>
    </Drawer>
  );
}

export const drawers: Record<string, (p: DrawerProps) => JSX.Element> = {
  deal: DealDrawer,
  contract: ContractDrawer,
};
