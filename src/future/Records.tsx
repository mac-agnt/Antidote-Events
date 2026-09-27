/* Records client tabs (Companies … Campaigns) and the connected-record trace shown
   under the Ontology graph. The Ontology tab itself (RecordsOntology.tsx) is untouched. */
import { useState, type ReactNode } from "react";
import type { Fx } from "./types";
import {
  COMPANIES, CONTRACTS, DEALS, EVENTS, EXHIBITORS, INVOICES, NOVA, PORTFOLIO, PROGRAMME, SPEAKERS, STAGE_READINESS, CONTENT_ROOMS,
  eur, type EventId,
} from "./data";
import { Badge, Card, EventTag, Icon, PATHS, Status, Table, inEvent, EventSwitch, type Col } from "./ui";

type Row = { cells: ReactNode[]; go?: () => void; ev?: EventId | "both"; hl?: boolean };
type Section = { cols: [string, string][]; rows: Row[]; note: string };

const evOf = (name: string): EventId | "both" =>
  name === "Future Fertility" ? "ff" : name === "Future Men's Health" ? "mh" : "both";

/* Mirrors the supplier list in Events → Suppliers. */
export const SUPPLIERS: [string, string, EventId | "both", string, string, string][] = [
  ["Brightwell Exhibition Build", "Exhibition Builder", "both", "Shell scheme, back walls and fascias for up to 191 stands", "30 Oct", "Confirmed"],
  ["Lumacast Audio Visual", "AV Partner", "both", "PA, LED screens and operators for six stages", "26 Feb 2027", "At risk"],
  ["Sentinel Event Security", "Security", "both", "Door supervision, barriers, overnight hall security", "29 Jan 2027", "Confirmed"],
  ["Clearway Facility Services", "Cleaning", "both", "Pre-open, rolling and post-breakdown cleaning", "12 Feb 2027", "Confirmed"],
  ["Tallyline Registration", "Registration", "both", "Badges, self-scan kiosks, Shopify ticket sync", "12 Nov", "In progress"],
  ["Form & Hire Furniture", "Furniture", "both", "Stand furniture, green room, VIP lounge", "29 Jan 2027", "Confirmed"],
  ["Voltworks Event Power", "Electrical", "both", "Stand power and lighting, stage distribution", "29 Jan 2027", "In progress"],
  ["RDS Dublin", "Venue", "both", "Hall A, Hall B, stages, green room, loading bay", "30 Oct", "Signed"],
  ["Harvest Table Catering", "Catering", "both", "Crew meals, green room and VIP lounge", "26 Feb 2027", "Approved"],
];

/* Mirrors Growth → Campaigns. */
export const CAMPAIGNS: [string, EventId | "both", string, string, string, string][] = [
  ["Future Fertility Early Bird", "ff", "9,420", "52%", "€8,832", "Sent"],
  ["Future Men's Health Early Bird", "mh", "7,860", "49%", "€6,248", "Sent"],
  ["Past-attendee pre-sale", "both", "11,240", "58%", "€7,744", "Sent"],
  ["Couples weekend pass", "ff", "5,120", "47%", "€7,584", "Sent"],
  ["Future Fertility On Demand", "ff", "8,960", "44%", "€9,396", "Sent"],
  ["Clarity Hormone Clinic partner email", "ff", "3,480", "41%", "€1,476", "Sent"],
  ["Performance Nutrition Co. affiliate", "both", "8,420", "47%", "€2,527.50 comm.", "Complete"],
  ["Future Men's Health launch", "mh", "8,640", "—", "—", "Awaiting approval"],
];

function build(section: string, fx: Fx): Section {
  const deal = (company: string) => DEALS.find(d => d.company === company && d.stage === "Won") || DEALS.find(d => d.company === company);
  switch (section) {
    case "companies":
      return { note: "Every company Future Events works with, across both events.", cols: [["Company", "1.6fr"], ["Type", ".9fr"], ["Event", "1fr"], ["Relationship", "1.3fr"], ["Value", ".9fr"], ["Owner", "1fr"]],
        rows: COMPANIES.map(c => ({ ev: evOf(c[2]), hl: c[0] === NOVA.company,
          cells: [<span className="fx-strong">{c[0]}</span>, c[1], c[2] === "Both" ? <EventTag id="both" /> : <EventTag id={evOf(c[2]) as EventId} />, c[3], c[4], c[5]],
          go: () => { const d = deal(c[0]); if (d) fx.goTo("Sales", "pipeline", { kind: "deal", id: d.id }); else fx.goTo("Growth", "partners"); } })) };
    case "exhibitors":
      return { note: "Created automatically from each won deal. 87 confirmed; the detailed records are shown here.", cols: [["Exhibitor", "1.6fr"], ["Event", ".9fr"], ["Stand", ".6fr"], ["Size", ".7fr"], ["Readiness", ".8fr"], ["State", ".8fr"]],
        rows: EXHIBITORS.map(x => ({ ev: x.event, hl: x.id === "x-peak",
          cells: [<span className="fx-strong">{x.company}</span>, <EventTag id={x.event} />, x.stand || "Unplaced", x.size, x.readiness + "%", <Status s={x.state} />],
          go: () => fx.goTo("Exhibitors", "onboarding", { kind: "exhibitor", id: x.id }) })) };
    case "sponsors":
      return { note: "Headline, stage and workshop sponsorship with what each partner is entitled to.", cols: [["Sponsor", "1.5fr"], ["Event", ".9fr"], ["Package", "1.4fr"], ["Value", ".8fr"], ["Stage", "1fr"]],
        rows: DEALS.filter(d => d.type === "Sponsorship").map(d => ({ ev: d.event,
          cells: [<span className="fx-strong">{d.company}</span>, <EventTag id={d.event} />, d.pkg, eur(d.value), <Status s={d.stage} />],
          go: () => fx.goTo("Sales", "pipeline", { kind: "deal", id: d.id }) })) };
    case "speakers":
      return { note: "Speaker records. Public names are mock records for the demo only.", cols: [["Speaker", "1.4fr"], ["Event", ".9fr"], ["Session", "1.8fr"], ["Stage", "1fr"], ["Deck", ".9fr"]],
        rows: SPEAKERS.map(sp => ({ ev: sp.event, hl: sp.id === "s-brennan",
          cells: [<span className="fx-strong">{sp.name}</span>, <EventTag id={sp.event} />, sp.session, sp.stage, <Status s={sp.deck} />],
          go: () => fx.goTo("Production", "speakers", { kind: "speaker", id: sp.id }) })) };
    case "events":
      return { note: "One operating model, run per event.", cols: [["Event", "1.8fr"], ["Where", "1fr"], ["When", "1fr"], ["Status", ".8fr"], ["Overall", ".6fr"]],
        rows: PORTFOLIO.map(p => ({ ev: p.id,
          cells: [<span className="fx-strong">{EVENTS[p.id].label}</span>, EVENTS[p.id].city, EVENTS[p.id].dates, <Status s={EVENTS[p.id].status} />, p.overall + "%"],
          go: () => { fx.setEvent(p.id); fx.goTo("Events", "portfolio"); } })) };
    case "sessions":
      return { note: `Men's Health ${PROGRAMME.mh.confirmed} of ${PROGRAMME.mh.slots} slots confirmed · Future Fertility ${PROGRAMME.ff.confirmed} of ${PROGRAMME.ff.slots}.`,
        cols: [["Session", "2fr"], ["Event", ".9fr"], ["Stage", "1fr"], ["When", ".7fr"], ["Slides", ".8fr"]],
        rows: CONTENT_ROOMS.map(r => ({ ev: r.event,
          cells: [<span className="fx-strong">{r.session}</span>, <EventTag id={r.event} />, r.stage, r.time, <Status s={r.slides} />],
          go: () => fx.goTo("Production", "rooms", { kind: "room", id: r.id }) })) };
    case "stages":
      return { note: "Production readiness by stage.", cols: [["Stage", "1.4fr"], ["Event", "1fr"], ["Readiness", ".8fr"], ["Verdict", ".8fr"]],
        rows: STAGE_READINESS.map(st => ({ ev: st.event,
          cells: [<span className="fx-strong">{st.stage}</span>, <EventTag id={st.event} />, st.pct + "%", <Status s={st.pct >= 75 ? "On track" : "At risk"} />],
          go: () => fx.goTo("Production", "av") })) };
    case "invoices":
      return { note: "Every contract creates a deposit and a balance invoice. They post to Xero automatically.", cols: [["Invoice", ".9fr"], ["Client", "1.5fr"], ["Kind", ".7fr"], ["Amount", ".7fr"], ["Due", ".9fr"], ["Status", ".9fr"]],
        rows: INVOICES.map(i => ({ ev: i.event, hl: i.id === "i-nova-1",
          cells: [i.no, <span className="fx-strong">{i.client}</span>, i.kind, eur(i.amount), i.due,
            <Status s={i.status === "Match pending" && fx.acted["match-peak"] ? "Paid" : i.status === "Overdue" ? `Overdue ${i.days}d` : i.status} />],
          go: () => fx.goTo("Finance", "invoices", { kind: "invoice", id: i.id }) })) };
    case "contracts":
      return { note: "Standard contract, 30 / 70 payment split. Line items become obligations the moment it's signed.", cols: [["Client", "1.5fr"], ["Event", ".9fr"], ["Package", "1.5fr"], ["Value", ".7fr"], ["Signed", ".7fr"], ["Status", ".7fr"]],
        rows: CONTRACTS.map(c => ({ ev: c.event, hl: c.id === "c-nova",
          cells: [<span className="fx-strong">{c.client}</span>, <EventTag id={c.event} />, c.pkg, eur(c.value), c.signed || "—", <Status s={c.status} />],
          go: () => fx.goTo("Sales", "contracts", { kind: "contract", id: c.id }) })) };
    case "suppliers":
      return { note: "Event-week suppliers shared by both Dublin events.", cols: [["Supplier", "1.3fr"], ["Role", "1fr"], ["Scope", "1.8fr"], ["Next deadline", "1.1fr"], ["Status", ".8fr"]],
        rows: SUPPLIERS.map(sp => ({ ev: sp[2], cells: [<span className="fx-strong">{sp[0]}</span>, sp[1], sp[3], sp[4], <Status s={sp[5]} />], go: () => fx.goTo("Events", "suppliers", { kind: "supplier", id: sp[1] }) })) };
    case "campaigns":
      return { note: "Revenue is ticket revenue; the affiliate row shows commission earned.", cols: [["Campaign", "1.8fr"], ["Event", ".9fr"], ["Audience", ".7fr"], ["Opened", ".6fr"], ["Revenue", ".9fr"], ["Status", ".9fr"]],
        rows: CAMPAIGNS.map(c => ({ ev: c[1], cells: [<span className="fx-strong">{c[0]}</span>, <EventTag id={c[1]} />, c[2], c[3], c[4],
          c[5] === "Awaiting approval" && !fx.acted["growth-approve-mh"] ? <Badge tone="warn">Awaiting approval</Badge> : <Badge tone="ok">{c[5] === "Awaiting approval" ? "Approved" : c[5]}</Badge>], go: () => fx.goTo("Growth", "campaigns") })) };
  }
  return { note: "", cols: [], rows: [] };
}

export function RecordsClient({ fx, section, label, blurb }: { fx: Fx; section: string; label: string; blurb: string }) {
  const [q, setQ] = useState("");
  const data = build(section, fx);
  const rows = data.rows.filter(r => (!r.ev || inEvent(fx.event, r.ev)))
    .filter(r => !q || JSON.stringify(r.cells.map(c => (typeof c === "string" ? c : (c as { props?: { children?: unknown; s?: string } })?.props?.children ?? (c as { props?: { s?: string } })?.props?.s ?? ""))).toLowerCase().includes(q.toLowerCase()));
  const cols: Col<Row>[] = data.cols.map(([l, w], i) => ({ k: String(i), label: l, w, render: (r: Row) => r.cells[i] }));
  return (
    <div className="fx-page" style={{ paddingTop: 8 }}>
      <div className="fx-head">
        <div className="fx-grow">
          <h1>{label}</h1>
          <p>{blurb} {data.note}</p>
        </div>
        <EventSwitch fx={fx} />
      </div>
      <Card pad={false} title={`${rows.length} ${label.toLowerCase()}`} sub="Click a row to open it where the work happens"
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 32, padding: "0 12px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--surface-faint)" }}>
            <Icon d="m21 21-4.3-4.3 M17 11a6 6 0 1 1-12 0 6 6 0 0 1 12 0" size={13} style={{ color: "var(--faint)" }} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder={"Search " + label.toLowerCase()} style={{ border: 0, outline: 0, background: "none", color: "var(--ink)", font: "inherit", fontSize: 12.5, width: 180 }} />
          </div>
        }>
        <div style={{ marginTop: 12 }}>
          <Table cols={cols} rows={rows} onRow={r => r.go?.()} highlight={r => !!r.hl} />
        </div>
      </Card>
    </div>
  );
}

/* The Nova Fertility Clinic chain: one record, followed through the whole business. */
export function OntologyTrace({ fx }: { fx: Fx }) {
  const [open, setOpen] = useState(true);
  const brennan = SPEAKERS.find(s => s.id === "s-brennan")!;
  const steps: { t: string; h: string; d: string; tone?: "bad" | "warn" | "ok"; go: () => void }[] = [
    { t: "EVENT", h: "Future Fertility 2027", d: "RDS Dublin · 13–14 March", go: () => { fx.setEvent("ff"); fx.goTo("Events", "portfolio"); } },
    { t: "DEAL", h: `Deal ${eur(NOVA.value)}`, d: "Won · Kathleen Corr", tone: "ok", go: () => fx.goTo("Sales", "pipeline", { kind: "deal", id: "d-nova" }) },
    { t: "CONTRACT", h: "Contract signed", d: `${NOVA.signed} · 30 / 70 split`, tone: "ok", go: () => fx.goTo("Sales", "contracts", { kind: "contract", id: "c-nova" }) },
    { t: "INVOICE 1", h: `Deposit ${eur(NOVA.deposit)}`, d: `FE-2027-0412 · ${NOVA.daysOverdue} days overdue`, tone: "bad", go: () => fx.goTo("Finance", "invoices", { kind: "invoice", id: "i-nova-1" }) },
    { t: "INVOICE 2", h: `Balance ${eur(NOVA.balance)}`, d: `FE-2027-0413 · due ${NOVA.balanceDue}`, go: () => fx.goTo("Finance", "invoices", { kind: "invoice", id: "i-nova-2" }) },
    { t: "EXHIBITOR", h: `Stand ${fx.acted["resolve-nova-frontage"] ? "A05" : NOVA.stand}`, d: fx.acted["resolve-nova-frontage"] ? "4m frontage · resolved" : "4m x 2m · frontage conflict", tone: fx.acted["resolve-nova-frontage"] ? "ok" : "warn", go: () => fx.goTo("Exhibitors", "floorplan", { kind: "stand", id: fx.acted["resolve-nova-frontage"] ? "A05" : "A07" }) },
    { t: "SPEAKER", h: brennan.name, d: "Deck overdue · blocking AV", tone: "bad", go: () => fx.goTo("Production", "presentations", { kind: "speaker", id: "s-brennan" }) },
    { t: "SESSION", h: "Main Stage session", d: brennan.session, go: () => fx.goTo("Production", "programme") },
    { t: "MARKETING", h: "Social announcement", d: "2 posts · 1 scheduled", go: () => fx.goTo("Growth", "content") },
    { t: "TICKETS", h: "10 partner tickets", d: "Held until deposit clears", tone: "warn", go: () => fx.goTo("Exhibitors", "onboarding", { kind: "exhibitor", id: "x-nova" }) },
  ];
  const col = (tone?: string) => tone === "bad" ? "var(--bad)" : tone === "warn" ? "var(--warn)" : tone === "ok" ? "var(--ok)" : "var(--accent)";
  if (!open) {
    return (
      <div style={{ position: "sticky", bottom: 14, zIndex: 5, display: "flex", justifyContent: "flex-end", padding: "0 22px", pointerEvents: "none" }}>
        <button onClick={() => setOpen(true)} className="fx-btn" style={{ pointerEvents: "auto", background: "var(--overlay)", backdropFilter: "blur(18px)", height: 36 }}>
          <Icon d={PATHS.link} size={13} style={{ color: "var(--accent)" }} /> Trace Nova Fertility Clinic · 10 connected records
        </button>
      </div>
    );
  }
  return (
    <div style={{ position: "sticky", bottom: 12, zIndex: 5, padding: "0 22px", marginTop: 12 }}>
      <Card style={{ background: "var(--overlay)", backdropFilter: "blur(22px) saturate(1.3)", borderColor: "var(--border-strong)", boxShadow: "0 24px 60px rgba(0,0,0,.45)" }}
        title={<span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>One record, followed everywhere <Badge tone="ff">Future Fertility</Badge></span>}
        sub="Nova Fertility Clinic · click any link to open it where the work happens"
        right={<span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}><Badge tone="accent">10 connected records</Badge>
          <button className="fx-x" style={{ width: 26, height: 26 }} onClick={() => setOpen(false)} aria-label="Collapse trace"><Icon d="m6 9 6 6 6-6" size={12} sw={2.2} /></button></span>}>
        <div style={{ display: "flex", alignItems: "stretch", gap: 0, overflowX: "auto", paddingBottom: 6, scrollbarWidth: "thin" }}>
          <div style={{ flex: "none", width: 168, padding: "14px 14px", borderRadius: 16, background: "var(--accent-faint)", border: "1px solid var(--accent-line)", marginRight: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".1em", color: "var(--accent)" }}>COMPANY</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 6, color: "var(--ink)" }}>{NOVA.company}</div>
            <div style={{ fontSize: 11.5, color: "var(--dim)", marginTop: 4, lineHeight: 1.45 }}>Connected to every step on the right. Nothing was retyped.</div>
          </div>
          {steps.map((s, i) => (
            <div key={s.t} style={{ display: "flex", alignItems: "center", flex: "none" }}>
              {i > 0 && <span style={{ width: 14, height: 1, background: "var(--border-strong)" }} />}
              <button onClick={s.go} className="fx-flow-n" style={{ width: 150, height: "100%" }}>
                <div className="t" style={{ color: col(s.tone) }}>{s.t}</div>
                <div className="h">{s.h}</div>
                <div className="d">{s.d}</div>
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, fontSize: 12, color: "var(--dim)" }}>
          <Icon d={PATHS.spark} size={12} style={{ color: "var(--accent)" }} />
          Try the graph search above with “Nova”, “Peak” or “Brennan” to trace them through the clusters.
        </div>
      </Card>
    </div>
  );
}
