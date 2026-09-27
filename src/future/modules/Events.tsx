/* Events: portfolio, timeline, crew, suppliers, venue and run of show for the
   Future Fertility + Future Men's Health weekend at the RDS (13–14 March 2027),
   plus the Canada Pilot "clone from Dublin" story. */
import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import type { ModuleProps, DrawerProps, Fx } from "../types";
import { EVENTS, KPIS, PORTFOLIO, TIMELINE, CANADA, PROGRAMME, TEAM, SPEAKERS, NOVA, PEAK, eur, eurK, type EventId } from "../data";
import {
  Page, PageHead, Card, Kpis, Badge, Status, EventTag, Btn, ActBtn, Avatar, Bar, Meter, StepDot, Table, Chips, Drawer, Sec, KV, Note,
  Donut, Legend, Fig, Row, Icon, PATHS, inEvent, evColor, evSoft, type Col,
} from "../ui";

/* ── Small helpers ─────────────────────────────────────────────────────── */
type Ev = EventId | "both";
type Go = { page?: string; tab?: string; drawer?: { kind: string; id: string } };
const follow = (fx: Fx, g?: Go) => {
  if (!g) return;
  if (g.page) fx.goTo(g.page, g.tab, g.drawer);
  else if (g.drawer) fx.open(g.drawer.kind, g.drawer.id);
};
const day = (y: number, m: number, d: number) => Math.round(Date.UTC(y, m - 1, d) / 86400000);
const TODAY_D = day(2026, 9, 27);
const EVENT_D = day(2027, 3, 13);
const LAUNCH_D = day(2026, 6, 2);
const DAYS_TO_DOORS = EVENT_D - TODAY_D; // 167

const grid = (cols: string, gap = 14): CSSProperties => ({ display: "grid", gridTemplateColumns: cols, gap, minWidth: 0 });
const eyebrow: CSSProperties = { fontSize: 10, fontWeight: 600, letterSpacing: ".12em", color: "var(--faint)" };
const small: CSSProperties = { fontSize: 11.5, color: "var(--dim)" };
const rowLine: CSSProperties = { display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: "1px solid var(--border)", minWidth: 0 };
const ellipsis: CSSProperties = { minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
const plainBtn: CSSProperties = { border: 0, background: "none", padding: 0, font: "inherit", color: "inherit", textAlign: "left", cursor: "pointer", width: "100%" };

function LinkBtn({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button className="fx-link" onClick={(e) => { e.stopPropagation(); onClick(); }}>{children}</button>;
}
function TeamAvatar({ name, size = 22 }: { name: string; size?: number }) {
  const t = TEAM.find(m => m.name === name);
  return <Avatar name={name} size={size} bg={t?.bg} />;
}
/* "Scheduled" reads as neutral here, not a warning. */
function St({ s }: { s: string }) {
  return s === "Scheduled" ? <Badge tone="ghost">Scheduled</Badge> : <Status s={s} />;
}
function Dot({ color, size = 7 }: { color: string; size?: number }) {
  return <span style={{ width: size, height: size, borderRadius: 2, background: color, flex: "none", display: "inline-block" }} />;
}

/* Workstreams on each event card, each linking to its owning module. */
const WORKSTREAMS: { k: "commercial" | "production" | "exhibitor" | "marketing"; label: string; page: string; tab: string; mod: string }[] = [
  { k: "commercial", label: "Commercial", page: "Sales", tab: "overview", mod: "Sales" },
  { k: "production", label: "Production", page: "Production", tab: "overview", mod: "Production" },
  { k: "exhibitor", label: "Exhibitor", page: "Exhibitors", tab: "overview", mod: "Exhibitors" },
  { k: "marketing", label: "Marketing", page: "Growth", tab: "overview", mod: "Growth" },
];
const goWorkstream = (fx: Fx, id: EventId, page: string, tab: string) => { fx.setEvent(id); fx.goTo(page, tab); };

/* ── Watch list: the live story threads, stateful via shared actions ──── */
type Watch = { ev: EventId; tone: "bad" | "warn" | "ok"; title: string; detail: string; go: Go; cta: string };
function watchItems(fx: Fx): Watch[] {
  const a = fx.acted;
  return [
    a["chase-nova"]
      ? { ev: "ff", tone: "warn", title: "Nova Fertility Clinic deposit chased", detail: "€5,400 · FE-2027-0412 · chase sent, awaiting payment", go: { drawer: { kind: "invoice", id: "i-nova-1" } }, cta: "Invoice" }
      : { ev: "ff", tone: "bad", title: `Nova Fertility Clinic deposit ${eur(NOVA.deposit)} overdue ${NOVA.daysOverdue} days`, detail: "FE-2027-0412 · due 23 Sep · reminder sequence active", go: { drawer: { kind: "invoice", id: "i-nova-1" } }, cta: "Invoice" },
    a["nudge-brennan"]
      ? { ev: "ff", tone: "warn", title: "Dr Aoife Brennan deck nudged", detail: "First cut due 24 Sep · nudge sent today · still blocking AV", go: { drawer: { kind: "speaker", id: "s-brennan" } }, cta: "Speaker" }
      : { ev: "ff", tone: "bad", title: "Dr Aoife Brennan deck blocking AV", detail: "Due 24 Sep · 2 auto reminders · “I'll have this across tomorrow.”", go: { drawer: { kind: "speaker", id: "s-brennan" } }, cta: "Speaker" },
    a["resolve-nova-frontage"]
      ? { ev: "ff", tone: "ok", title: "Nova frontage conflict resolved", detail: "Moved to a 4m frontage stand · builder drawings updated", go: { drawer: { kind: "stand", id: NOVA.stand } }, cta: "Stand" }
      : { ev: "ff", tone: "warn", title: `Nova needs 4m frontage at ${NOVA.stand}`, detail: NOVA.conflict, go: { drawer: { kind: "stand", id: NOVA.stand } }, cta: "Stand" },
    a["remind-peak"]
      ? { ev: "mh", tone: "warn", title: "Peak Health Labs asset reminder sent", detail: "Logo SVG + speaker headshot · readiness 78% · B14", go: { drawer: { kind: "exhibitor", id: "x-peak" } }, cta: "Exhibitor" }
      : { ev: "mh", tone: "warn", title: "Peak Health Labs missing 2 assets", detail: `${PEAK.missing.join(" + ")} · readiness ${PEAK.readiness}% · stand ${PEAK.stand}`, go: { drawer: { kind: "exhibitor", id: "x-peak" } }, cta: "Exhibitor" },
    a["fill-mh-slots"]
      ? { ev: "mh", tone: "warn", title: "Suggested speakers sent for 8 open slots", detail: `${PROGRAMME.mh.confirmed} of ${PROGRAMME.mh.slots} Men's Health slots confirmed · lock 13 Nov`, go: { page: "Production", tab: "programme" }, cta: "Programme" }
      : { ev: "mh", tone: "bad", title: `${PROGRAMME.mh.open} Future Men's Health stage slots open`, detail: `${PROGRAMME.mh.confirmed} of ${PROGRAMME.mh.slots} confirmed · speaker lock 13 Nov`, go: { page: "Production", tab: "programme" }, cta: "Programme" },
    a["match-peak"]
      ? { ev: "mh", tone: "ok", title: "Peak deposit paid and reconciled", detail: `${eur(PEAK.deposit)} · ref ${PEAK.paymentRef} · matched in Xero`, go: { drawer: { kind: "invoice", id: "i-peak-1" } }, cta: "Invoice" }
      : { ev: "mh", tone: "warn", title: `Peak deposit ${eur(PEAK.deposit)} awaiting Xero match`, detail: `Ref ${PEAK.paymentRef} · ${PEAK.matchConfidence}% confidence · needs approval`, go: { drawer: { kind: "invoice", id: "i-peak-1" } }, cta: "Invoice" },
    { ev: "ff", tone: "warn", title: `${PROGRAMME.ff.open} Future Fertility slots open, ${PROGRAMME.ff.draft} held`, detail: `${PROGRAMME.ff.confirmed} of ${PROGRAMME.ff.slots} confirmed · speaker lock 13 Nov`, go: { page: "Production", tab: "programme" }, cta: "Programme" },
  ];
}
function WatchList({ fx, filter, limit }: { fx: Fx; filter: Ev | "all"; limit?: number }) {
  const items = watchItems(fx).filter(w => filter === "all" || filter === "both" || w.ev === filter).slice(0, limit ?? 99);
  return (
    <div>
      {items.map((w, i) => (
        <button key={i} style={{ ...plainBtn, ...rowLine, borderTop: i ? rowLine.borderTop : 0 }} onClick={() => follow(fx, w.go)}>
          <span style={{ width: 24, height: 24, borderRadius: 8, flex: "none", display: "flex", alignItems: "center", justifyContent: "center",
            background: `var(--${w.tone}-soft)`, color: `var(--${w.tone})` }}>
            <Icon d={w.tone === "ok" ? PATHS.check : PATHS.alert} size={12} sw={2.2} />
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 12.5, color: "var(--ink)", fontWeight: 500, ...ellipsis }}>{w.title}</span>
            <span style={{ display: "block", ...small, ...ellipsis }}>{w.detail}</span>
          </span>
          <EventTag id={w.ev} />
          <span style={{ fontSize: 11.5, color: "var(--accent)", display: "inline-flex", alignItems: "center", gap: 4, flex: "none" }}>{w.cta}<Icon d={PATHS.arrow} size={11} /></span>
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PORTFOLIO
   ═══════════════════════════════════════════════════════════════════════ */
function Countdown({ fx }: { fx: Fx }) {
  const k = KPIS[fx.event === "ca" ? "all" : fx.event];
  const span = EVENT_D - LAUNCH_D;
  const p = (d: number) => ((d - LAUNCH_D) / span) * 100;
  const marks: [string, number][] = [
    ["Floor plan", day(2026, 10, 30)], ["Speaker lock", day(2026, 11, 13)], ["Exhibitor info", day(2027, 1, 29)], ["Decks", day(2027, 2, 12)], ["AV", day(2027, 2, 26)],
  ];
  return (
    <Card pad={false}>
      <div style={{ ...grid("minmax(0,200px) minmax(0,1fr) minmax(0,300px)", 0), alignItems: "stretch" }}>
        <div style={{ padding: "18px 20px", borderRight: "1px solid var(--border)" }}>
          <div style={eyebrow}>DAYS TO DOORS</div>
          <div style={{ fontSize: 46, fontWeight: 600, letterSpacing: "-2px", lineHeight: 1.05, marginTop: 6, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{DAYS_TO_DOORS}</div>
          <div style={{ ...small, marginTop: 4 }}>Sat 13 Mar 2027 · 10:30 · RDS Dublin</div>
        </div>
        <div style={{ padding: "18px 26px", minWidth: 0 }}>
          <Row gap={8}>
            <span style={eyebrow}>RUNWAY · SALES LAUNCH 2 JUN TO DOORS</span>
            <span className="fx-grow" />
            <Badge tone="ff">Fertility</Badge><Badge tone="mh">Men's Health</Badge><span style={small}>same weekend</span>
          </Row>
          <div style={{ position: "relative", height: 58, marginTop: 8 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 27, height: 4, borderRadius: 4, background: "var(--track)" }} />
            <div style={{ position: "absolute", left: 0, width: p(TODAY_D) + "%", top: 27, height: 4, borderRadius: 4, background: "var(--accent-fill, var(--accent))" }} />
            {marks.map(([l, d], i) => (
              <div key={l} style={{ position: "absolute", left: p(d) + "%", top: 0, bottom: 0, width: 0 }}>
                <span style={{ position: "absolute", left: -1, top: 24, width: 2, height: 10, background: "var(--border-strong)" }} />
                <span style={{ position: "absolute", transform: "translateX(-50%)", whiteSpace: "nowrap", fontSize: 10.5, color: "var(--dim)", top: i % 2 ? 40 : 6 }}>{l}</span>
              </div>
            ))}
            <div style={{ position: "absolute", left: p(TODAY_D) + "%", top: 18, width: 0 }}>
              <span style={{ position: "absolute", left: -6, top: 5, width: 12, height: 12, borderRadius: 99, background: "var(--accent)", boxShadow: "0 0 0 4px var(--accent-soft)" }} />
            </div>
            <span style={{ position: "absolute", right: 0, top: 40, fontSize: 10.5, color: "var(--ink)", fontWeight: 600 }}>13 Mar</span>
            <span style={{ position: "absolute", left: 0, top: 40, fontSize: 10.5, color: "var(--faint)" }}>2 Jun</span>
          </div>
          <div style={{ ...small, marginTop: 2 }}>Today 27 Sep · {Math.round(p(TODAY_D))}% of the runway gone · next hard date: floor plan to RDS on 30 Oct</div>
        </div>
        <div style={{ padding: "18px 20px", borderLeft: "1px solid var(--border)", ...grid("repeat(3,minmax(0,1fr))", 12), alignContent: "center" }}>
          <button style={plainBtn} onClick={() => fx.goTo("Events", "timeline")}><Fig label="Event readiness" value={k.readiness + "%"} sub="milestones on track" /></button>
          <button style={plainBtn} onClick={() => fx.goTo("Sales", "overview")}><Fig label="Contracted" value={eurK(k.contracted)} sub={"of " + eurK(k.revenue2027)} /></button>
          <button style={plainBtn} onClick={() => fx.goTo("Exhibitors", "overview")}><Fig label="Exhibitors" value={k.exhibitors} sub="confirmed" /></button>
        </div>
      </div>
    </Card>
  );
}

function EventCard({ fx, id }: { fx: Fx; id: EventId }) {
  const e = EVENTS[id];
  const p = PORTFOLIO.find(x => x.id === id) || PORTFOLIO[0];
  const color = evColor(id);
  const head = (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Row gap={8}><Dot color={color} size={8} /><span style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", letterSpacing: "-.2px", ...ellipsis }}>{e.name}</span></Row>
        <div style={{ ...small, marginTop: 5 }}>{id === "ca" ? "Location TBD · Dates TBD" : `${e.city} · ${e.venue.replace(", Dublin", "")} · ${e.dates}`}</div>
        <div style={{ marginTop: 9, display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Status s={e.status} />
          {id !== "ca" && <Badge tone="ghost">{DAYS_TO_DOORS} days</Badge>}
          {id === "ca" && <Badge tone="ghost">Template: Dublin</Badge>}
        </div>
      </div>
      <Donut size={78} thickness={8} segments={[{ label: "Overall", value: p.overall, color }, { label: "Rest", value: 100 - p.overall, color: "transparent" }]}
        center={<><div style={{ fontSize: 17, fontWeight: 600, color: "var(--ink)", letterSpacing: "-.4px" }}>{p.overall}%</div><div style={{ fontSize: 9.5, color: "var(--faint)" }}>overall</div></>} />
    </div>
  );
  if (id === "ca") {
    return (
      <Card style={{ display: "flex", flexDirection: "column" }}>
        {head}
        <div style={{ marginTop: 14 }}>
          {CANADA.cloned.map(([l, n, t]) => (
            <Meter key={l} label={l} value={n} max={t} color={color} right={`${n}/${t}`} />
          ))}
        </div>
        <div style={{ ...rowLine, marginTop: 6 }}>
          <span style={{ ...small, flex: 1 }}><span style={{ color: "var(--warn)", fontWeight: 600 }}>{CANADA.decisions.length} localisation decisions</span> before the pilot can sell</span>
          <Btn size="sm" kind="ghost" onClick={() => fx.setEvent("ca")} icon={PATHS.arrow}>Clone plan</Btn>
        </div>
      </Card>
    );
  }
  const k = KPIS[id];
  const prog = PROGRAMME[id];
  return (
    <Card style={{ display: "flex", flexDirection: "column" }}>
      {head}
      <div style={{ marginTop: 12 }}>
        {WORKSTREAMS.map(w => (
          <button key={w.k} style={{ ...plainBtn, display: "grid", gridTemplateColumns: "minmax(0,92px) minmax(0,1fr) 38px 70px", alignItems: "center", gap: 10, padding: "6px 0" }}
            onClick={() => goWorkstream(fx, id, w.page, w.tab)} title={`Open ${w.mod}`}>
            <span style={{ fontSize: 12.5, color: "var(--body)" }}>{w.label}</span>
            <Bar value={p[w.k]} color={color} />
            <span style={{ fontSize: 12, color: "var(--ink)", fontWeight: 600, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{p[w.k]}%</span>
            <span style={{ fontSize: 11, color: "var(--faint)", display: "inline-flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>{w.mod}<Icon d={PATHS.arrow} size={10} /></span>
          </button>
        ))}
      </div>
      <div style={{ ...grid("repeat(4,minmax(0,1fr))", 10), marginTop: 10, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
        <Fig label="Contracted" value={eurK(k.contracted)} />
        <Fig label="Exhibitors" value={k.exhibitors} />
        <Fig label="Stage slots" value={`${prog.confirmed}/${prog.slots}`} />
        <Fig label="Readiness" value={k.readiness + "%"} />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <Btn size="sm" onClick={() => fx.open("event", id)}>Event record</Btn>
        <Btn size="sm" kind="ghost" onClick={() => fx.goTo("Events", "timeline")}>Timeline</Btn>
      </div>
    </Card>
  );
}

function SharedWeekend({ fx }: { fx: Fx }) {
  const docsOut = SUPPLIERS.reduce((a, s) => a + DOC_KEYS.filter(d => s.docs[d] === "Requested" || s.docs[d] === "Missing").length, 0);
  const rows: [string, string, string, string][] = [
    ["Casual crew", `${CREW.length} rostered · ${WA_MEMBERS} in WhatsApp group`, `${COVER_GAP} shift gaps`, "staff"],
    ["Suppliers", `${SUPPLIERS.length} contracted across both events`, `${docsOut} documents outstanding`, "suppliers"],
    ["RDS Dublin", "Hall A + Hall B · 6 stages · 191 stands", "Floor plan due 30 Oct", "venue"],
    ["Run of show", `${ROS.sat.length} Sat items · ${ROS.sun.length} Sun items drafted`, "Live board preview", "runofshow"],
    ["Timeline", `${TIMELINE.length} milestones · 1 at risk`, "Speaker lock 13 Nov", "timeline"],
  ];
  return (
    <Card title="Shared weekend" sub="one crew, one venue, two brands">
      {rows.map(([t, d, s, tab], i) => (
        <button key={t} style={{ ...plainBtn, ...rowLine, borderTop: i ? rowLine.borderTop : 0 }} onClick={() => fx.goTo("Events", tab)}>
          <span style={{ width: 92, flex: "none", fontSize: 12.5, color: "var(--ink)", fontWeight: 500 }}>{t}</span>
          <span style={{ flex: 1, ...small, ...ellipsis }}>{d}</span>
          <span style={{ fontSize: 11.5, color: "var(--body)", flex: "none" }}>{s}</span>
          <Icon d={PATHS.arrow} size={11} style={{ color: "var(--faint)" }} />
        </button>
      ))}
    </Card>
  );
}

/* The Canada Pilot story: Dublin as a repeatable operating model. */
const DECISION_NOTES: Record<string, [string, string]> = {
  "Currency": ["Price stands and tickets in CAD, report back in EUR", "Kathleen Corr"],
  "Tax treatment": ["Confirm sales tax registration with the accountant before invoicing", "Nikki Dwyer"],
  "Venue": ["Dates, floor plan and run of show follow the venue", "Robyn Walsh"],
  "Payment provider": ["CAD settlement: Xero multi-currency vs a local account", "Nikki Dwyer"],
  "Local exhibitor terms": ["Adapt the Dublin exhibitor T&Cs, legal review needed", "Kathleen Corr"],
  "Ticket tax": ["Ticket tax differs by province, set it in Shopify once venue lands", "Amy Byrne"],
};
const CLONE_ICONS = [PATHS.flow, PATHS.mail, PATHS.doc, PATHS.stand, PATHS.mic];
const CARRIES = [
  "Sales stages, packages and 30/70 deposit invoicing",
  "Exhibitor onboarding checklist and 12 fulfilment obligations",
  "Speaker, content room and AV handover workflow",
  "Crew roles, shift templates and WhatsApp roster posting",
  "Run of show template and supplier checklist",
];

function Connector({ label, id }: { label: string; id: string }) {
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", minWidth: 0 }}>
      <svg width="100%" height="24" viewBox="0 0 60 24" preserveAspectRatio="none" style={{ display: "block", overflow: "visible" }}>
        <defs>
          <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" style={{ stopColor: "var(--ev-ff)" }} />
            <stop offset="1" style={{ stopColor: "var(--ev-ca)" }} />
          </linearGradient>
        </defs>
        <line x1="0" y1="12" x2="54" y2="12" stroke={`url(#${id})`} strokeWidth="2" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
        <path d="M52 7 L59 12 L52 17" fill="none" stroke="var(--ev-ca)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ position: "absolute", top: "calc(50% + 12px)", fontSize: 9.5, fontWeight: 600, letterSpacing: ".1em", color: "var(--faint)" }}>{label}</span>
    </div>
  );
}

function CloneFromDublin({ fx, focus }: { fx: Fx; focus?: boolean }) {
  const sent = !!fx.acted["canada-decisions"];
  const ff = KPIS.ff;
  const node: CSSProperties = { padding: "16px 16px 14px", borderRadius: 16, background: "var(--surface-2)", border: "1px solid var(--border)", minWidth: 0 };
  return (
    <div className="fx-card" style={{ overflow: "hidden", borderColor: focus ? "var(--accent-line)" : undefined }}>
      <div style={{ padding: "20px 22px 18px", background: "linear-gradient(120deg, var(--ev-ff-soft) 0%, transparent 38%, transparent 62%, var(--ev-ca-soft) 100%)", borderBottom: "1px solid var(--border)" }}>
        <Row gap={8}>
          <span style={eyebrow}>INTERNATIONAL EXPANSION</span>
          <span className="fx-grow" />
          <Status s="PLANNING" /><Badge tone="ghost">Location TBD</Badge>
        </Row>
        <Row gap={14} style={{ marginTop: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ fontSize: 13, color: "var(--dim)" }}>Clone from Dublin · Future Fertility · Canada Pilot</div>
            <div style={{ fontSize: focus ? 26 : 22, fontWeight: 600, letterSpacing: "-.6px", lineHeight: 1.22, color: "var(--ink)", marginTop: 6, maxWidth: 720 }}>
              Dublin is no longer a pile of processes. It is a repeatable operating model.
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn kind="ghost" size="sm" onClick={() => fx.goTo("Work", "workflows")} icon={PATHS.flow}>Dublin workflows</Btn>
            <ActBtn fx={fx} k="canada-decisions" label="Send decisions to Nikki" doneLabel="Sent to Nikki" toast="6 localisation decisions sent to Nikki for review" size="sm" />
          </div>
        </Row>
      </div>

      <div style={{ padding: "22px 22px 8px", ...grid("minmax(0,1fr) minmax(36px,64px) minmax(0,1.35fr) minmax(36px,64px) minmax(0,1fr)", 0), alignItems: "center" }}>
        {/* Source */}
        <button style={{ ...plainBtn, ...node, boxShadow: `inset 3px 0 0 ${evColor("ff")}` }} onClick={() => fx.setEvent("ff")}>
          <div style={{ ...eyebrow, color: "var(--ev-ff)" }}>SOURCE · LIVE</div>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--ink)", marginTop: 6 }}>Future Fertility Dublin</div>
          <div style={{ ...small, marginTop: 2 }}>RDS Dublin · 13–14 March 2027</div>
          <div style={{ ...grid("repeat(2,minmax(0,1fr))", 10), marginTop: 14 }}>
            <Fig label="Exhibitors" value={ff.exhibitors} />
            <Fig label="Contracted" value={eurK(ff.contracted)} />
            <Fig label="Stage slots" value={PROGRAMME.ff.slots} />
            <Fig label="Readiness" value={ff.readiness + "%"} />
          </div>
        </button>
        <Connector label="SNAPSHOT" id="fx-ev-c1" />
        {/* Template */}
        <div style={{ ...node, background: "var(--surface)", borderColor: "var(--border-strong)", padding: "16px 18px" }}>
          <Row gap={8}>
            <span style={eyebrow}>OPERATING MODEL · {CANADA.template.toUpperCase()}</span>
          </Row>
          <div style={{ marginTop: 8 }}>
            {CANADA.cloned.map(([l, n, t], i) => (
              <div key={l} style={{ display: "grid", gridTemplateColumns: "24px minmax(0,1fr) 44px 18px", alignItems: "center", gap: 10, padding: "7px 0", borderTop: i ? "1px solid var(--border)" : 0 }}>
                <span style={{ width: 24, height: 24, borderRadius: 7, background: "var(--ev-ca-soft)", color: "var(--ev-ca)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon d={CLONE_ICONS[i] || PATHS.flow} size={12} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, color: "var(--ink)", ...ellipsis }}>{l}</div>
                  <Bar value={n} max={t} color="var(--ev-ca)" height={3} style={{ display: "block", marginTop: 5 }} />
                </div>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{n}/{t}</span>
                <span style={{ color: "var(--ok)", display: "flex" }}><Icon d={PATHS.check} size={13} sw={2.4} /></span>
              </div>
            ))}
          </div>
          <div style={{ ...small, marginTop: 8, fontSize: 11 }}>Every group cloned in full · nothing rebuilt by hand</div>
        </div>
        <Connector label="LOCALISE" id="fx-ev-c2" />
        {/* Target */}
        <div style={{ ...node, boxShadow: `inset 3px 0 0 ${evColor("ca")}` }}>
          <div style={{ ...eyebrow, color: "var(--ev-ca)" }}>TARGET · PLANNING</div>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--ink)", marginTop: 6 }}>Canada Pilot</div>
          <div style={{ ...small, marginTop: 2 }}>Location TBD · Dates TBD</div>
          <Row gap={12} style={{ marginTop: 14 }}>
            <Donut size={64} thickness={7} segments={[{ label: "Ready", value: PORTFOLIO[2].overall, color: evColor("ca") }, { label: "Rest", value: 100 - PORTFOLIO[2].overall, color: "transparent" }]}
              center={<span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{PORTFOLIO[2].overall}%</span>} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 22, fontWeight: 600, color: sent ? "var(--ink)" : "var(--warn)", letterSpacing: "-.5px" }}>{CANADA.decisions.length}</div>
              <div style={small}>{sent ? "decisions with Nikki" : "decisions outstanding"}</div>
            </div>
          </Row>
          <div style={{ ...small, marginTop: 12, fontSize: 11 }}>Sells as soon as the decisions land</div>
        </div>
      </div>

      <div style={{ padding: "14px 22px 20px", ...grid("minmax(0,1.45fr) minmax(0,1fr)", 18) }}>
        <div style={{ minWidth: 0 }}>
          <Row gap={8} style={{ marginBottom: 4 }}>
            <span style={eyebrow}>LOCALISATION DECISIONS · CANADA</span>
            <span className="fx-grow" />
            <span style={small}>{sent ? "Sent to Nikki · 27 Sep" : `${CANADA.decisions.length} outstanding`}</span>
          </Row>
          {CANADA.decisions.map(([d, s], i) => {
            const [note, owner] = DECISION_NOTES[d] || ["Review needed", "Nikki Dwyer"];
            return (
              <div key={d} style={{ ...rowLine, display: "grid", gridTemplateColumns: "20px minmax(0,150px) minmax(0,1fr) auto", gap: 12 }}>
                <span style={{ fontSize: 11, color: "var(--faint)", fontVariantNumeric: "tabular-nums" }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontSize: 12.5, color: "var(--ink)", fontWeight: 500, ...ellipsis }}>{d}</span>
                <span style={{ ...small, ...ellipsis }} title={`${note} · ${owner}`}>{note}</span>
                {sent ? <Badge tone="warn">With Nikki</Badge> : <Status s={s} />}
              </div>
            );
          })}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ ...eyebrow, marginBottom: 4 }}>WHAT CARRIES OVER UNCHANGED</div>
          {CARRIES.map((c, i) => (
            <div key={c} style={{ ...rowLine, borderTop: i ? rowLine.borderTop : "1px solid var(--border)" }}>
              <span style={{ color: "var(--ok)", display: "flex" }}><Icon d={PATHS.check} size={12} sw={2.4} /></span>
              <span style={{ fontSize: 12.5, color: "var(--body)", ...ellipsis }}>{c}</span>
            </div>
          ))}
          <Note tone="accent">
            <span style={{ fontSize: 12.5 }}>Six choices stand between Canada and a live sales pipeline. Everything else already runs the way Dublin runs.</span>
          </Note>
        </div>
      </div>
    </div>
  );
}

function CanadaRunway({ fx }: { fx: Fx }) {
  const rows = TL_ROWS.filter(r => r.s < EVENT_D).slice(0, 10);
  return (
    <div style={grid("minmax(0,1.5fr) minmax(0,1fr)")}>
      <Card title="Planning runway" sub="cloned from Dublin, relative to doors" right={<LinkBtn onClick={() => fx.goTo("Events", "timeline")}>Timeline</LinkBtn>}>
        {rows.map((r, i) => {
          const wk = Math.round((EVENT_D - r.s) / 7);
          return (
            <div key={r.m} style={{ ...rowLine, borderTop: i ? rowLine.borderTop : 0, display: "grid", gridTemplateColumns: "minmax(0,1fr) 110px 120px", gap: 12 }}>
              <span style={{ fontSize: 12.5, color: "var(--ink)", ...ellipsis }}>{r.m}</span>
              <span style={{ fontSize: 12, color: "var(--body)", fontVariantNumeric: "tabular-nums" }}>Doors minus {wk} wks</span>
              <span style={{ ...small, textAlign: "right" }}>Dated once venue set</span>
            </div>
          );
        })}
      </Card>
      <Card title="Modules ready for Canada" sub="structure cloned, no records yet">
        {([["Sales", "overview", "Pipeline stages and packages"], ["Exhibitors", "onboarding", "Onboarding checklist"], ["Production", "programme", "Programme template, 3 stages"], ["Finance", "overview", "Deposit and balance rules"], ["Growth", "overview", "Launch sequence, 14 emails"]] as [string, string, string][]).map(([p, t, d], i) => (
          <button key={p} style={{ ...plainBtn, ...rowLine, borderTop: i ? rowLine.borderTop : 0 }} onClick={() => fx.goTo(p, t)}>
            <span style={{ width: 86, flex: "none", fontSize: 12.5, color: "var(--ink)", fontWeight: 500 }}>{p}</span>
            <span style={{ flex: 1, ...small, ...ellipsis }}>{d}</span>
            <Icon d={PATHS.arrow} size={11} style={{ color: "var(--faint)" }} />
          </button>
        ))}
      </Card>
    </div>
  );
}

function Portfolio({ fx }: { fx: Fx }) {
  const e = fx.event;
  if (e === "ca") {
    return (
      <Page>
        <PageHead title="Portfolio" sub="Canada Pilot: cloned from Future Fertility Dublin, 6 decisions to go" fx={fx} />
        <div style={{ display: "grid", gap: 14 }}>
          <CloneFromDublin fx={fx} focus />
          <CanadaRunway fx={fx} />
          <div style={grid("repeat(auto-fit,minmax(300px,1fr))")}>
            <EventCard fx={fx} id="ff" />
            <EventCard fx={fx} id="mh" />
          </div>
        </div>
      </Page>
    );
  }
  const ids: EventId[] = (["ff", "mh", "ca"] as EventId[]).filter(id => e === "all" || id === e);
  return (
    <Page>
      <PageHead title="Portfolio" sub="Every Future event, its workstreams and the runway to doors" fx={fx} />
      <div style={{ display: "grid", gap: 14 }}>
        <Countdown fx={fx} />
        {e === "all" ? (
          <div style={grid("repeat(3,minmax(0,1fr))")}>
            {ids.map(id => <EventCard key={id} fx={fx} id={id} />)}
          </div>
        ) : (
          <div style={grid("minmax(0,1fr) minmax(0,1.15fr)")}>
            <EventCard fx={fx} id={e} />
            <Card title="Watch list" sub={EVENTS[e].name}><WatchList fx={fx} filter={e} /></Card>
          </div>
        )}
        {e === "all" && (
          <div style={grid("minmax(0,1.35fr) minmax(0,1fr)")}>
            <Card title="Watch list" sub="live threads across both events"><WatchList fx={fx} filter="all" limit={6} /></Card>
            <SharedWeekend fx={fx} />
          </div>
        )}
        {e === "mh" ? (
          <Card>
            <Row gap={12}>
              <span style={{ width: 30, height: 30, borderRadius: 10, background: "var(--ev-ca-soft)", color: "var(--ev-ca)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={PATHS.flow} size={14} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>Future Fertility Dublin is the template for the Canada Pilot</div>
                <div style={small}>27/27 workflows cloned · 6 localisation decisions outstanding</div>
              </div>
              <Btn size="sm" onClick={() => fx.setEvent("ca")} icon={PATHS.arrow}>See the clone</Btn>
            </Row>
          </Card>
        ) : (
          <CloneFromDublin fx={fx} />
        )}
        {e !== "all" && <SharedWeekend fx={fx} />}
      </div>
    </Page>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   TIMELINE
   ═══════════════════════════════════════════════════════════════════════ */
type TLRow = { m: string; s: number; e: number; owner: string; ev: Ev; dep?: string; go?: Go };
const TL_ROWS: TLRow[] = [
  { m: "Sales launch", s: day(2026, 6, 2), e: day(2026, 6, 2), owner: "Kathleen Corr", ev: "both", go: { page: "Sales", tab: "overview" } },
  { m: "Contracting", s: day(2026, 6, 2), e: day(2026, 12, 18), owner: "Kathleen Corr", ev: "both", dep: "61% of 2027 B2B revenue contracted", go: { page: "Sales", tab: "pipeline" } },
  { m: "Floor plan", s: day(2026, 9, 1), e: day(2026, 10, 30), owner: "Robyn Walsh", ev: "both", dep: "Submission to RDS 30 Oct", go: { page: "Exhibitors", tab: "floorplan" } },
  { m: "Speaker lock", s: day(2026, 8, 3), e: day(2026, 11, 13), owner: "Sarah Keane", ev: "both", go: { page: "Production", tab: "programme" } },
  { m: "Marketing", s: day(2026, 11, 2), e: day(2027, 3, 12), owner: "Amy Byrne", ev: "both", dep: "Speaker promotion starts after speaker lock", go: { page: "Growth", tab: "campaigns" } },
  { m: "Final exhibitor information", s: day(2027, 1, 4), e: day(2027, 1, 29), owner: "Robyn Walsh", ev: "both", dep: "Depends on floor plan (30 Oct)", go: { page: "Exhibitors", tab: "readiness" } },
  { m: "Deck deadline", s: day(2027, 2, 12), e: day(2027, 2, 12), owner: "Sarah Keane", ev: "both", dep: "Depends on speaker lock (13 Nov)", go: { page: "Production", tab: "presentations" } },
  { m: "AV handover", s: day(2027, 2, 26), e: day(2027, 2, 26), owner: "Sarah Keane", ev: "both", go: { page: "Production", tab: "av" } },
  { m: "Staff briefing", s: day(2027, 3, 10), e: day(2027, 3, 10), owner: "Conor Ryan", ev: "both", dep: "Roster v5 locked 1 Mar", go: { page: "Events", tab: "staff" } },
  { m: "Build day", s: day(2027, 3, 12), e: day(2027, 3, 12), owner: "Robyn Walsh", ev: "both", dep: "Needs final exhibitor info + AV handover", go: { page: "Events", tab: "venue" } },
  { m: "Day 1", s: day(2027, 3, 13), e: day(2027, 3, 13), owner: "Nikki Dwyer", ev: "both", go: { page: "Events", tab: "runofshow" } },
  { m: "Day 2", s: day(2027, 3, 14), e: day(2027, 3, 14), owner: "Nikki Dwyer", ev: "both", go: { page: "Events", tab: "runofshow" } },
  { m: "Breakdown", s: day(2027, 3, 14), e: day(2027, 3, 15), owner: "Robyn Walsh", ev: "both", dep: "Starts 19:00 Sun, halls clear 12:00 Mon", go: { page: "Events", tab: "venue" } },
  { m: "Post-event", s: day(2027, 3, 15), e: day(2027, 3, 31), owner: "Nikki Dwyer", ev: "both", dep: "Rebook drive for 2028", go: { page: "Growth", tab: "overview" } },
];
const TL_STATE: Record<string, { date: string; state: string }> = Object.fromEntries(TIMELINE.map(t => [t.m, { date: t.date, state: t.state }]));
const STATE_STYLE: Record<string, { label: string; color: string; tone: "ok" | "accent" | "warn" | "ghost" }> = {
  done: { label: "Done", color: "var(--ok)", tone: "ok" },
  active: { label: "Active", color: "var(--accent)", tone: "accent" },
  risk: { label: "At risk", color: "var(--warn)", tone: "warn" },
  upcoming: { label: "Upcoming", color: "var(--border-strong)", tone: "ghost" },
};
function tlFlag(fx: Fx, m: string): { text: string; tone: "bad" | "warn" | "ok"; go?: Go } | null {
  if (m === "AV handover") return fx.acted["nudge-brennan"]
    ? { text: "Waiting on overdue decks · Brennan nudged", tone: "warn", go: { drawer: { kind: "speaker", id: "s-brennan" } } }
    : { text: "Blocked by overdue decks incl. Dr Brennan", tone: "bad", go: { drawer: { kind: "speaker", id: "s-brennan" } } };
  if (m === "Floor plan") return fx.acted["resolve-nova-frontage"]
    ? { text: "Nova frontage resolved", tone: "ok", go: { drawer: { kind: "stand", id: NOVA.stand } } }
    : { text: "Nova 4m frontage conflict open", tone: "warn", go: { drawer: { kind: "stand", id: NOVA.stand } } };
  if (m === "Speaker lock") return fx.acted["fill-mh-slots"]
    ? { text: "6 FF open · MH suggestions sent", tone: "warn", go: { page: "Production", tab: "programme" } }
    : { text: `${PROGRAMME.mh.open} MH + ${PROGRAMME.ff.open} FF slots open`, tone: "bad", go: { page: "Production", tab: "programme" } };
  return null;
}

function Gantt({ fx }: { fx: Fx }) {
  const T0 = day(2026, 6, 1), T1 = day(2027, 4, 1);
  const pos = (d: number) => ((d - T0) / (T1 - T0)) * 100;
  const months: [string, number][] = [
    ["Jun", day(2026, 6, 1)], ["Jul", day(2026, 7, 1)], ["Aug", day(2026, 8, 1)], ["Sep", day(2026, 9, 1)], ["Oct", day(2026, 10, 1)],
    ["Nov", day(2026, 11, 1)], ["Dec", day(2026, 12, 1)], ["Jan", day(2027, 1, 1)], ["Feb", day(2027, 2, 1)], ["Mar", day(2027, 3, 1)],
  ];
  const cols = "minmax(0,200px) minmax(0,1fr) minmax(0,200px)";
  const lines = (
    <>
      {months.map(([l, d]) => <span key={l} style={{ position: "absolute", left: pos(d) + "%", top: 0, bottom: 0, width: 1, background: "var(--border)" }} />)}
      <span style={{ position: "absolute", left: pos(TODAY_D) + "%", top: 0, bottom: 0, width: 2, marginLeft: -1, background: "var(--accent)", opacity: .85 }} />
    </>
  );
  return (
    <Card pad={false} title="Jun 2026 to Mar 2027" sub="both events share one delivery timeline" right={
      <Legend items={[["Done", "var(--ok)"], ["Active", "var(--accent)"], ["At risk", "var(--warn)"], ["Upcoming", "var(--border-strong)", true]]} />
    }>
      <div style={{ padding: "12px 0 6px" }}>
        <div style={{ ...grid(cols, 12), padding: "0 18px", alignItems: "end", height: 30 }}>
          <span style={{ fontSize: 11, color: "var(--faint)" }}>Milestone · owner</span>
          <div style={{ position: "relative", height: 30 }}>
            {months.map(([l, d]) => <span key={l} style={{ position: "absolute", left: pos(d) + "%", bottom: 4, paddingLeft: 5, fontSize: 10.5, color: "var(--faint)" }}>{l}</span>)}
            <span style={{ position: "absolute", left: pos(TODAY_D) + "%", top: 0, transform: "translateX(-50%)", fontSize: 9.5, fontWeight: 700, letterSpacing: ".06em", color: "var(--on-accent)", background: "var(--accent)", borderRadius: 5, padding: "1px 5px", whiteSpace: "nowrap" }}>TODAY 27 SEP</span>
          </div>
          <span style={{ fontSize: 11, color: "var(--faint)" }}>Date · dependency</span>
        </div>
        {TL_ROWS.map(r => {
          const st = TL_STATE[r.m] || { date: "", state: "upcoming" };
          const ss = STATE_STYLE[st.state] || STATE_STYLE.upcoming;
          const flag = tlFlag(fx, r.m);
          const point = r.s === r.e;
          const barColor = flag && flag.tone === "bad" && st.state === "upcoming" ? "var(--bad)" : ss.color;
          return (
            <div key={r.m} className="fx-tr" data-click="1" style={{ gridTemplateColumns: cols, minHeight: 44 }} onClick={() => follow(fx, r.go)}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <TeamAvatar name={r.owner} size={22} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: "var(--ink)", fontWeight: 500, ...ellipsis }}>{r.m}</div>
                  <div style={{ fontSize: 11, color: "var(--faint)", ...ellipsis }}>{r.owner}</div>
                </div>
              </div>
              <div style={{ position: "relative", height: 44, overflow: "visible" }}>
                {lines}
                {point ? (
                  <span title={st.date} style={{ position: "absolute", left: pos(r.s) + "%", top: "50%", width: 11, height: 11, marginLeft: -5.5, marginTop: -5.5,
                    transform: "rotate(45deg)", borderRadius: 2, background: st.state === "upcoming" && barColor === ss.color ? "var(--surface-2)" : barColor,
                    border: `1.5px solid ${barColor === ss.color && st.state === "upcoming" ? "var(--dim)" : barColor}` }} />
                ) : (
                  <span title={st.date} style={{ position: "absolute", left: pos(r.s) + "%", width: Math.max(0.8, pos(r.e + 1) - pos(r.s)) + "%", top: "50%", height: 10, marginTop: -5, borderRadius: 5,
                    background: st.state === "upcoming" ? "var(--track)" : barColor, border: st.state === "upcoming" ? "1px dashed var(--border-strong)" : 0, opacity: st.state === "done" ? .8 : 1 }} />
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3, justifyContent: "center" }}>
                <Row gap={6}>
                  <span style={{ fontSize: 12, color: "var(--body)", ...ellipsis }}>{st.date}</span>
                  <Badge tone={ss.tone} style={{ height: 17, fontSize: 9.5 }}>{ss.label}</Badge>
                </Row>
                {flag
                  ? <span style={{ fontSize: 11, color: `var(--${flag.tone})`, ...ellipsis }} onClick={(ev) => { ev.stopPropagation(); follow(fx, flag.go); }}>{flag.text}</span>
                  : r.dep ? <span style={{ fontSize: 11, color: "var(--faint)", ...ellipsis }}>{r.dep}</span> : null}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function Timeline({ fx }: { fx: Fx }) {
  if (fx.event === "ca") {
    return (
      <Page>
        <PageHead title="Timeline" sub="Canada Pilot runs on the Dublin milestone template" fx={fx} />
        <CanadaPanel fx={fx} title="Milestone template cloned" sub="14 milestones, dated once the venue decision lands"
          rows={TL_ROWS.map(r => [r.m, `Dublin: ${(TL_STATE[r.m] || { date: "" }).date}`, `Doors ${r.s >= EVENT_D ? "plus" : "minus"} ${Math.abs(Math.round((EVENT_D - r.s) / 7))} wks`])} />
      </Page>
    );
  }
  const k = KPIS[fx.event];
  const counts = { done: 0, active: 0, risk: 0, upcoming: 0 } as Record<string, number>;
  TIMELINE.forEach(t => { counts[t.state] = (counts[t.state] || 0) + 1; });
  const next = TL_ROWS.filter(r => r.e >= TODAY_D && r.s > TODAY_D || (r.e >= TODAY_D && (TL_STATE[r.m]?.state === "active" || TL_STATE[r.m]?.state === "risk"))).slice(0, 4);
  type Chain = { title: string; ev: Ev; steps: { t: string; s: string; go?: Go }[]; note: string; tone: "bad" | "warn" | "ok" };
  const allChains: Chain[] = [
    { title: "Speaker content to AV", ev: "both", tone: fx.acted["nudge-brennan"] ? "warn" : "bad",
      steps: [{ t: "Speaker lock", s: "13 Nov", go: { page: "Production", tab: "programme" } }, { t: "First-cut decks", s: "14 outstanding", go: { page: "Production", tab: "presentations" } }, { t: "Deck deadline", s: "12 Feb", go: { page: "Production", tab: "presentations" } }, { t: "AV handover", s: "26 Feb", go: { page: "Production", tab: "av" } }],
      note: fx.acted["nudge-brennan"] ? "Dr Brennan nudged today. 3 decks still needed for AV review this week." : "Dr Aoife Brennan's first cut was due 24 Sep and is blocking AV. 3 decks needed for AV review this week." },
    { title: "Floor plan to build", ev: "both", tone: fx.acted["resolve-nova-frontage"] ? "ok" : "warn",
      steps: [{ t: "Floor plan", s: "30 Oct", go: { page: "Exhibitors", tab: "floorplan" } }, { t: "Final exhibitor info", s: "29 Jan", go: { page: "Exhibitors", tab: "readiness" } }, { t: "Power orders", s: "118/135", go: { page: "Events", tab: "venue" } }, { t: "Build day", s: "12 Mar", go: { page: "Events", tab: "venue" } }],
      note: fx.acted["resolve-nova-frontage"] ? "Nova moved to a 4m frontage stand. Builder drawings follow on 6 Nov." : `${NOVA.company}: ${NOVA.conflict} Resolve before drawings go to the builder.` },
    { title: "Men's Health programme", ev: "mh", tone: fx.acted["fill-mh-slots"] ? "warn" : "bad",
      steps: [{ t: "8 open slots", s: "44/52", go: { page: "Production", tab: "programme" } }, { t: "Speaker lock", s: "13 Nov", go: { page: "Production", tab: "speakers" } }, { t: "Speaker promotion", s: "from Nov", go: { page: "Growth", tab: "campaigns" } }],
      note: fx.acted["fill-mh-slots"] ? "Suggested speakers sent. Marketing can brief promotion once confirmed." : "Marketing sits at 39% on Men's Health because speaker promotion waits on the open slots." },
  ];
  const chains = allChains.filter(c => inEvent(fx.event, c.ev));
  return (
    <Page>
      <PageHead title="Timeline" sub="Milestones from sales launch to post-event, with owners and dependencies" fx={fx} />
      <div style={{ display: "grid", gap: 14 }}>
        <Gantt fx={fx} />
        <div style={grid("minmax(0,1fr) minmax(0,1.9fr)")}>
          <Card title="Event readiness" sub="pre-event milestones on track">
            <Row gap={16}>
              <Donut size={104} thickness={11} segments={[
                { label: "Done", value: k.readiness, color: "var(--accent)" }, { label: "Rest", value: 100 - k.readiness, color: "transparent" },
              ]} center={<><div style={{ fontSize: 24, fontWeight: 600, color: "var(--ink)", letterSpacing: "-.6px" }}>{k.readiness}%</div><div style={{ fontSize: 10, color: "var(--faint)" }}>ready</div></>} />
              <div style={{ flex: 1, minWidth: 0 }}>
                {(["done", "active", "risk", "upcoming"] as const).map(s => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                    <Dot color={STATE_STYLE[s].color} />
                    <span style={{ fontSize: 12.5, color: "var(--body)", flex: 1 }}>{STATE_STYLE[s].label}</span>
                    <span style={{ fontSize: 12.5, color: "var(--ink)", fontWeight: 600 }}>{counts[s] || 0}</span>
                  </div>
                ))}
              </div>
            </Row>
            <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
              {(["ff", "mh", "ca"] as EventId[]).filter(id => inEvent(fx.event, id) || fx.event === "all").map(id => (
                <Meter key={id} label={EVENTS[id].name} value={KPIS[id].readiness} color={evColor(id)} />
              ))}
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={{ ...eyebrow, marginBottom: 2 }}>NEXT UP</div>
              {next.map(r => (
                <button key={r.m} style={{ ...plainBtn, ...rowLine }} onClick={() => follow(fx, r.go)}>
                  <span style={{ flex: 1, fontSize: 12.5, color: "var(--ink)", ...ellipsis }}>{r.m}</span>
                  <span style={small}>{r.e >= TODAY_D ? `${r.e - TODAY_D} days` : ""}</span>
                </button>
              ))}
            </div>
          </Card>
          <Card title="Critical paths" sub="what has to happen before what">
            <div style={{ display: "grid", gap: 12 }}>
              {chains.map(c => (
                <div key={c.title} style={{ padding: "12px 14px", borderRadius: 14, background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <Row gap={8}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{c.title}</span>
                    {c.ev !== "both" && <EventTag id={c.ev} />}
                    <span className="fx-grow" />
                    <Badge tone={c.tone}>{c.tone === "bad" ? "Blocking" : c.tone === "warn" ? "Watch" : "Clear"}</Badge>
                  </Row>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                    {c.steps.map((s, i) => (
                      <span key={s.t} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        {i > 0 && <Icon d={PATHS.arrow} size={11} style={{ color: "var(--faint)" }} />}
                        <button className="fx-chip" style={{ height: 30, cursor: s.go ? "pointer" : "default" }} onClick={() => follow(fx, s.go)}>
                          <span style={{ color: "var(--ink)" }}>{s.t}</span><span style={{ color: "var(--faint)" }}>{s.s}</span>
                        </button>
                      </span>
                    ))}
                  </div>
                  <div style={{ ...small, marginTop: 9, fontSize: 12, lineHeight: 1.5 }}>{c.note}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              {!fx.acted["nudge-brennan"] && inEvent(fx.event, "ff") && <ActBtn fx={fx} k="nudge-brennan" label="Nudge Dr Brennan" doneLabel="Brennan nudged" toast="Deck nudge sent to Dr Aoife Brennan on WhatsApp" size="sm" />}
              <Btn size="sm" kind="ghost" onClick={() => fx.goTo("Production", "av")}>AV handover plan</Btn>
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   STAFF (≈100 casual crew, generated deterministically)
   ═══════════════════════════════════════════════════════════════════════ */
type Slot = "fri" | "satAM" | "satPM" | "sunAM" | "sunPM";
const SLOTS: { id: Slot; label: string; time: string }[] = [
  { id: "fri", label: "Fri build", time: "Fri 12 Mar · 07:00–20:00" },
  { id: "satAM", label: "Sat AM", time: "Sat 13 Mar · 07:30–14:00" },
  { id: "satPM", label: "Sat PM", time: "Sat 13 Mar · 13:30–19:00" },
  { id: "sunAM", label: "Sun AM", time: "Sun 14 Mar · 07:30–14:00" },
  { id: "sunPM", label: "Sun PM", time: "Sun 14 Mar · 13:30–19:30" },
];
type RoleId = "Registration" | "Stage Runner" | "Exhibitor Support" | "Speaker Liaison" | "Floor Manager" | "Backstage" | "Customer Support" | "Production" | "VIP" | "Operations";
type RoleDef = { id: RoleId; n: number; lead: string; areas: string[]; ev: Ev[]; patterns: Slot[][]; brief: string };
const ALL4: Slot[] = ["satAM", "satPM", "sunAM", "sunPM"];
const ROLES: RoleDef[] = [
  { id: "Registration", n: 18, lead: "Conor Ryan", areas: ["Main Entrance", "Hall A foyer", "Badge desk"], ev: ["both"], brief: "Registration crew brief v3",
    patterns: [["satAM", "satPM"], ["sunAM", "sunPM"], ["satAM", "sunAM"], ["satPM", "sunPM"], ALL4] },
  { id: "Stage Runner", n: 12, lead: "Sarah Keane", areas: ["Main Stage 1", "Main Stage 2", "Workshop Stage 1", "Workshop Stage 2"], ev: ["ff", "mh"], brief: "Stage running sheet v2",
    patterns: [ALL4, ["satAM", "satPM"], ["sunAM", "sunPM"]] },
  { id: "Exhibitor Support", n: 14, lead: "Robyn Walsh", areas: ["Hall A · Zone A", "Hall A · Zone B", "Hall B · Zone C", "Hall B · Zone D"], ev: ["both"], brief: "Exhibitor support playbook",
    patterns: [["fri", "satAM", "satPM"], ALL4, ["sunAM", "sunPM"], ["fri", "sunAM", "sunPM"]] },
  { id: "Speaker Liaison", n: 8, lead: "Sarah Keane", areas: ["Green Room"], ev: ["ff", "mh"], brief: "Speaker liaison brief",
    patterns: [ALL4, ["satAM", "sunAM"], ["satPM", "sunPM"]] },
  { id: "Floor Manager", n: 6, lead: "Robyn Walsh", areas: ["Hall A", "Hall B"], ev: ["both"], brief: "Floor manager handbook",
    patterns: [["fri", ...ALL4]] },
  { id: "Backstage", n: 8, lead: "Sarah Keane", areas: ["Main Stage 1 backstage", "Main Stage 2 backstage"], ev: ["ff", "mh"], brief: "Backstage run sheet",
    patterns: [ALL4, ["satAM", "satPM"], ["sunAM", "sunPM"]] },
  { id: "Customer Support", n: 10, lead: "Conor Ryan", areas: ["Info Desk", "Cloakroom"], ev: ["both"], brief: "Visitor FAQ and escalation",
    patterns: [["satAM", "satPM"], ["sunAM", "sunPM"], ["satAM", "sunAM"], ["satPM", "sunPM"]] },
  { id: "Production", n: 9, lead: "Sarah Keane", areas: ["Production Office", "AV Control"], ev: ["both"], brief: "Production crew call sheet",
    patterns: [["fri", ...ALL4], ALL4] },
  { id: "VIP", n: 5, lead: "Nikki Dwyer", areas: ["VIP Lounge"], ev: ["both"], brief: "VIP and partner hosting",
    patterns: [["satAM", "satPM"], ["sunAM", "sunPM"], ALL4] },
  { id: "Operations", n: 10, lead: "Robyn Walsh", areas: ["Loading Bay", "Ops Office", "Hall B"], ev: ["both"], brief: "Operations and safety brief",
    patterns: [["fri", "satAM", "satPM"], ["fri", "sunAM", "sunPM"], ["fri", ...ALL4]] },
];
const FIRST = ["Aoife", "Ciara", "Niamh", "Sinead", "Orla", "Roisin", "Siobhan", "Grainne", "Eimear", "Clodagh", "Saoirse", "Caoimhe", "Aisling", "Muireann", "Mairead",
  "Laura", "Emma", "Rachel", "Katie", "Megan", "Sean", "Cian", "Darragh", "Oisin", "Eoin", "Ciaran", "Padraig", "Fionn", "Tadhg", "Ronan", "Cathal", "Dara",
  "Shane", "Niall", "Colm", "Diarmuid", "Kevin", "Luke", "Jack", "Adam"];
const LAST = ["Murphy", "Kelly", "O'Sullivan", "Walsh", "O'Brien", "Byrne", "O'Connor", "O'Neill", "O'Reilly", "Doyle", "McCarthy", "Gallagher", "Doherty",
  "Kennedy", "Lynch", "Quinn", "Moore", "McLoughlin", "Carroll", "Connolly", "Daly", "Dunne", "Nolan", "Power", "Kavanagh", "Fitzgerald", "Hayes", "Mulligan",
  "Maguire", "Healy", "Keogh", "Fahy", "Mooney", "Tierney", "Lennon", "Hogan", "Farrelly", "Cullen", "Molloy", "Egan"];
type CrewStatus = "Confirmed" | "Pending" | "Swap requested" | "Onboarding";
type Crew = { id: string; name: string; role: RoleId; slots: Slot[]; area: string; phone: string; status: CrewStatus; ev: Ev };
const CREW: Crew[] = (() => {
  let seed = 20270313;
  const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const used = new Set<string>([...TEAM.map(t => t.name), ...SPEAKERS.map(s => s.name.replace(/^Dr /, ""))]);
  const out: Crew[] = [];
  let g = 0;
  for (const role of ROLES) {
    for (let i = 0; i < role.n; i++, g++) {
      let name = "";
      do { name = FIRST[Math.floor(r() * FIRST.length)] + " " + LAST[Math.floor(r() * LAST.length)]; } while (used.has(name));
      used.add(name);
      const status: CrewStatus = [17, 58, 91].includes(g) ? "Onboarding" : g % 29 === 11 ? "Swap requested" : g % 13 === 5 ? "Pending" : "Confirmed";
      out.push({
        id: "c" + g, name, role: role.id, slots: role.patterns[i % role.patterns.length], area: role.areas[i % role.areas.length],
        phone: `08${"3567"[g % 4]} ${100 + Math.floor(r() * 900)} ${1000 + Math.floor(r() * 9000)}`, status, ev: role.ev[i % role.ev.length],
      });
    }
  }
  return out;
})();
const WA_MEMBERS = CREW.filter(c => c.status !== "Onboarding").length;
const GAPS: Record<string, number> = {
  "Registration|satAM": 2, "Exhibitor Support|sunAM": 2, "Stage Runner|sunPM": 1, "Customer Support|satPM": 1, "VIP|satAM": 1, "Backstage|sunAM": 1,
};
const coverOf = (role: RoleId, slot: Slot, list: Crew[] = CREW) => {
  const filled = list.filter(c => c.role === role && c.slots.includes(slot) && c.status !== "Onboarding").length;
  const gap = GAPS[role + "|" + slot] || 0;
  return { filled, req: filled + gap, gap };
};
const COVER_GAP = Object.values(GAPS).reduce((a, b) => a + b, 0);
const fmtSlots = (s: Slot[]) => {
  const has = (x: Slot) => s.includes(x);
  const parts: string[] = [];
  if (has("fri")) parts.push("Fri build");
  if (has("satAM") && has("satPM")) parts.push("Sat full"); else { if (has("satAM")) parts.push("Sat AM"); if (has("satPM")) parts.push("Sat PM"); }
  if (has("sunAM") && has("sunPM")) parts.push("Sun full"); else { if (has("sunAM")) parts.push("Sun AM"); if (has("sunPM")) parts.push("Sun PM"); }
  return parts.join(" · ");
};
const crewTone = (s: CrewStatus) => s === "Confirmed" ? "ok" : s === "Onboarding" ? "ghost" : "warn";

function Staff({ fx }: { fx: Fx }) {
  const [role, setRole] = useState<RoleId | "all">("all");
  const [dayF, setDayF] = useState<"all" | "fri" | "sat" | "sun">("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const base = useMemo(() => CREW.filter(c => inEvent(fx.event, c.ev)), [fx.event]);
  if (fx.event === "ca") {
    return (
      <Page>
        <PageHead title="Staff" sub="Canada Pilot: crew model cloned from Dublin, local crew not yet hired" fx={fx} />
        <CanadaPanel fx={fx} title="Crew model cloned" sub="10 roles, shift templates and WhatsApp roster posting"
          rows={ROLES.map(r => [r.id, `Dublin: ${r.n} crew · lead ${r.lead}`, "Sized once venue lands"])} />
      </Page>
    );
  }
  const rows = base.filter(c => (role === "all" || c.role === role)
    && (dayF === "all" || (dayF === "fri" ? c.slots.includes("fri") : dayF === "sat" ? c.slots.some(s => s.startsWith("sat")) : c.slots.some(s => s.startsWith("sun"))))
    && (!q || (c.name + " " + c.area).toLowerCase().includes(q.toLowerCase())));
  const PER = 12;
  const pages = Math.max(1, Math.ceil(rows.length / PER));
  const pg = Math.min(page, pages - 1);
  const view = rows.slice(pg * PER, pg * PER + PER);
  const st = (s: CrewStatus) => base.filter(c => c.status === s).length;
  const maxRole = Math.max(...ROLES.map(r => base.filter(c => c.role === r.id).length));
  const swap = CREW.find(c => c.status === "Swap requested");
  const cols: Col<Crew>[] = [
    { k: "name", label: "Name", w: "minmax(0,1.5fr)", render: c => <Row gap={9}><Avatar name={c.name} size={24} /><span className="fx-strong" style={ellipsis}>{c.name}</span></Row> },
    { k: "role", label: "Role", w: "minmax(0,1.1fr)" },
    { k: "shift", label: "Shift", w: "minmax(0,1.3fr)", render: c => fmtSlots(c.slots) },
    { k: "area", label: "Area", w: "minmax(0,1.2fr)" },
    { k: "phone", label: "Contact", w: "minmax(0,1fr)", render: c => <span className="fx-muted" style={{ fontVariantNumeric: "tabular-nums" }}>{c.phone}</span> },
    { k: "ev", label: "Event", w: "86px", render: c => <EventTag id={c.ev} /> },
    { k: "status", label: "Check-in", w: "112px", render: c => <Badge tone={crewTone(c.status)}>{c.status}</Badge> },
  ];
  return (
    <Page>
      <PageHead title="Staff" sub="Casual crew for event week: roster, shifts and cover in one place" fx={fx} />
      <div style={{ display: "grid", gap: 14 }}>
        <div style={grid("minmax(0,1.55fr) minmax(0,1fr)")}>
          <Card title="Event-week crew" sub="13–14 Mar 2027 · both events" right={<span style={small}>Nikki's crew of about 100</span>}>
            <div style={{ ...grid("repeat(5,minmax(0,1fr))", 12), paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
              <Fig label="Rostered" value={base.length} />
              <Fig label="Confirmed" value={st("Confirmed")} color="var(--ok)" />
              <Fig label="Pending" value={st("Pending")} color="var(--warn)" />
              <Fig label="Swap requests" value={st("Swap requested")} color="var(--warn)" />
              <Fig label="Shift gaps" value={COVER_GAP} color="var(--bad)" />
            </div>
            <div style={{ ...grid("repeat(2,minmax(0,1fr))", 18), marginTop: 6 }}>
              {ROLES.map(r => {
                const n = base.filter(c => c.role === r.id).length;
                const on = role === r.id;
                return (
                  <button key={r.id} style={{ ...plainBtn, display: "grid", gridTemplateColumns: "minmax(0,1.1fr) minmax(0,1fr) 26px", alignItems: "center", gap: 10, padding: "5px 0" }}
                    onClick={() => { setRole(on ? "all" : r.id); setPage(0); }}>
                    <span style={{ fontSize: 12.5, color: on ? "var(--ink)" : "var(--body)", fontWeight: on ? 600 : 400, ...ellipsis }}>{r.id}</span>
                    <Bar value={n} max={maxRole} color={on ? "var(--accent)" : "var(--dim)"} height={5} />
                    <span style={{ fontSize: 12, color: "var(--ink)", fontWeight: 600, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{n}</span>
                  </button>
                );
              })}
            </div>
          </Card>
          <Card title="WhatsApp group" right={<Badge tone="ok"><Icon d={PATHS.link} size={10} />Linked</Badge>}>
            <Row gap={12}>
              <span style={{ width: 40, height: 40, borderRadius: 13, background: "var(--ok-soft)", color: "var(--ok)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><Icon d={PATHS.whatsapp} size={19} /></span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>Future Crew Dublin 2027</div>
                <div style={small}>{WA_MEMBERS} members · admins Nikki, Robyn, Conor · {CREW.length - WA_MEMBERS} invites pending</div>
              </div>
            </Row>
            <div style={{ fontSize: 12, color: "var(--body)", lineHeight: 1.55, margin: "12px 0 4px" }}>
              Crew keep talking in WhatsApp. Pulse holds the roster, so every change here posts to the group and nobody works off an old screenshot.
            </div>
            {([
              ["Today 08:40", `Open shifts posted: Registration Sat AM ×2, Exhibitor Support Sun AM ×2`],
              ["26 Sep", `Swap request logged: ${swap ? swap.name : "crew member"} (${swap ? swap.role : "Registration"}) asks to move shift`],
              ["25 Sep", "3 onboarding invites resent with the crew handbook"],
              ["24 Sep", "Roster v4 posted · Sat and Sun shifts for 100 crew"],
            ] as [string, string][]).map(([t, m]) => (
              <div key={m} style={{ ...rowLine, alignItems: "flex-start" }}>
                <span style={{ width: 70, flex: "none", fontSize: 11, color: "var(--faint)" }}>{t}</span>
                <span style={{ fontSize: 12, color: "var(--body)", lineHeight: 1.45 }}>{m}</span>
              </div>
            ))}
            <div style={{ marginTop: 10 }}>
              <ActBtn fx={fx} k="events-post-roster" label="Post roster v5 to group" doneLabel="Roster v5 posted" toast={`Roster v5 posted to Future Crew Dublin 2027 · ${WA_MEMBERS} members`} size="sm" />
            </div>
          </Card>
        </div>

        <Card title="Shift cover" sub="rostered vs required, per role and shift" pad={false} right={<Legend items={[["Covered", "var(--ok)"], ["Short 1", "var(--warn)"], ["Short 2+", "var(--bad)"]]} />}>
          <div style={{ padding: "10px 0 4px" }}>
            {(() => {
              const cg = "minmax(0,1.3fr) minmax(0,1fr) repeat(5,minmax(0,.8fr)) minmax(0,.7fr)";
              return (
                <>
                  <div className="fx-tr fx-th" style={{ gridTemplateColumns: cg }}>
                    <div>Role</div><div>Lead</div>{SLOTS.map(s => <div key={s.id} style={{ textAlign: "center" }}>{s.label}</div>)}<div style={{ textAlign: "right" }}>Gaps</div>
                  </div>
                  {ROLES.map(r => {
                    const gaps = SLOTS.reduce((a, s) => a + coverOf(r.id, s.id, base).gap, 0);
                    return (
                      <div key={r.id} className="fx-tr" style={{ gridTemplateColumns: cg, minHeight: 40 }}>
                        <div className="fx-strong">{r.id}</div>
                        <div><Row gap={7}><TeamAvatar name={r.lead} size={20} /><span style={ellipsis}>{r.lead}</span></Row></div>
                        {SLOTS.map(s => {
                          const c = coverOf(r.id, s.id, base);
                          if (!c.req) return <div key={s.id} style={{ textAlign: "center", color: "var(--faint)" }}>–</div>;
                          const tone = c.gap === 0 ? "ok" : c.gap === 1 ? "warn" : "bad";
                          return (
                            <div key={s.id} style={{ textAlign: "center" }}>
                              <button onClick={() => fx.open("shift", r.id + "|" + s.id)} title={`${r.id} · ${s.label}`}
                                style={{ border: 0, cursor: "pointer", font: "inherit", fontSize: 12, fontWeight: 600, fontVariantNumeric: "tabular-nums", minWidth: 58, height: 26, borderRadius: 8,
                                  background: `var(--${tone}-soft)`, color: `var(--${tone})` }}>
                                {c.filled}/{c.req}
                              </button>
                            </div>
                          );
                        })}
                        <div style={{ textAlign: "right", color: gaps ? "var(--bad)" : "var(--faint)", fontWeight: gaps ? 600 : 400 }}>{gaps || "0"}</div>
                      </div>
                    );
                  })}
                </>
              );
            })()}
          </div>
        </Card>

        <Card pad={false} title="Roster" sub={`${rows.length} of ${base.length} crew`} right={
          <input value={q} onChange={e => { setQ(e.target.value); setPage(0); }} placeholder="Search name or area"
            style={{ height: 30, width: 200, borderRadius: 999, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--ink)", font: "inherit", fontSize: 12, padding: "0 12px", outline: "none" }} />
        }>
          <div style={{ padding: "12px 18px", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Chips options={[["all", `All roles ${base.length}`], ...ROLES.map(r => [r.id, `${r.id} ${base.filter(c => c.role === r.id).length}`] as [RoleId, string])] as [RoleId | "all", string][]}
              value={role} onChange={v => { setRole(v); setPage(0); }} />
          </div>
          <div style={{ padding: "0 18px 12px", display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "var(--faint)" }}>Day</span>
            <Chips options={[["all", "All days"], ["fri", "Fri build"], ["sat", "Sat 13"], ["sun", "Sun 14"]]} value={dayF} onChange={v => { setDayF(v); setPage(0); }} />
            <span className="fx-grow" />
            <span style={{ ...small, fontSize: 11 }}>Live check-in opens at crew call, Sat 07:00</span>
          </div>
          <Table cols={cols} rows={view} onRow={c => fx.open("shift", c.role + "|" + (c.slots.find(s => dayF === "all" || s.startsWith(dayF)) || c.slots[0]))} highlight={c => c.status === "Swap requested"} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px 14px", borderTop: "1px solid var(--border)" }}>
            <span style={small}>Page {pg + 1} of {pages} · showing {view.length ? pg * PER + 1 : 0}–{pg * PER + view.length}</span>
            <span className="fx-grow" />
            <Btn size="sm" kind="ghost" disabled={pg === 0} onClick={() => setPage(Math.max(0, pg - 1))}>Previous</Btn>
            <Btn size="sm" kind="ghost" disabled={pg >= pages - 1} onClick={() => setPage(Math.min(pages - 1, pg + 1))}>Next</Btn>
          </div>
        </Card>
      </div>
    </Page>
  );
}

function ShiftDrawer({ fx, id }: DrawerProps) {
  const [rs, ss] = (id || "").split("|");
  const role = ROLES.find(r => r.id === rs) || ROLES[0];
  const slot = SLOTS.find(s => s.id === ss) || SLOTS.find(s => role.patterns.some(p => p.includes(s.id))) || SLOTS[1];
  const c = coverOf(role.id, slot.id);
  const crew = CREW.filter(x => x.role === role.id && x.slots.includes(slot.id));
  const k = `events-shift-${role.id}-${slot.id}`.replace(/\s+/g, "-").toLowerCase();
  return (
    <Drawer fx={fx} eyebrow="SHIFT" title={`${role.id} · ${slot.label}`}
      badges={<>{c.gap ? <Badge tone={c.gap > 1 ? "bad" : "warn"}>{c.gap} short</Badge> : <Badge tone="ok">Covered</Badge>}<Badge tone="ghost">{slot.time}</Badge></>}
      actions={<>
        <Btn kind="ghost" onClick={() => { fx.close(); fx.goTo("Events", "staff"); }}>Open roster</Btn>
        {c.gap
          ? <ActBtn fx={fx} k={k} label="Post open shift to crew group" doneLabel="Posted to WhatsApp" toast={`Open ${role.id} ${slot.label} shift posted to Future Crew Dublin 2027`} />
          : <ActBtn fx={fx} k={k} label="Send shift reminder" doneLabel="Reminder sent" toast={`Reminder sent to ${crew.length} ${role.id} crew for ${slot.label}`} />}
      </>}>
      <Sec title="COVER">
        <KV cols={3} items={[["Required", c.req], ["Rostered", c.filled], ["Gap", c.gap || "None"]]} />
      </Sec>
      <Sec title="DETAILS">
        <KV items={[
          ["Role lead", <Row gap={7}><TeamAvatar name={role.lead} size={18} />{role.lead}</Row>], ["Areas", role.areas.join(", ")],
          ["Briefing", role.brief], ["Radio channel", `Ch ${ROLES.indexOf(role) + 1} · ${role.id}`],
        ]} />
      </Sec>
      <Sec title={`CREW ON THIS SHIFT · ${crew.length}`}>
        <div>
          {crew.map((x, i) => (
            <div key={x.id} style={{ ...rowLine, borderTop: i ? rowLine.borderTop : 0 }}>
              <Avatar name={x.name} size={24} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 12.5, color: "var(--ink)", ...ellipsis }}>{x.name}</span>
                <span style={{ display: "block", fontSize: 11, color: "var(--faint)", ...ellipsis }}>{x.area} · {x.phone}</span>
              </span>
              {x.ev !== "both" && <EventTag id={x.ev} />}
              <Badge tone={crewTone(x.status)}>{x.status}</Badge>
            </div>
          ))}
          {c.gap > 0 && Array.from({ length: c.gap }).map((_, i) => (
            <div key={"gap" + i} style={rowLine}>
              <span style={{ width: 24, height: 24, borderRadius: 99, border: "1px dashed var(--border-strong)", flex: "none" }} />
              <span style={{ flex: 1, fontSize: 12.5, color: "var(--faint)" }}>Open position</span>
              <Badge tone="bad">Unfilled</Badge>
            </div>
          ))}
        </div>
      </Sec>
      <Sec title="WHATSAPP">
        <Note>Changes to this shift post automatically to <b>Future Crew Dublin 2027</b> ({WA_MEMBERS} members). The roster in Pulse stays the source of truth.</Note>
      </Sec>
    </Drawer>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SUPPLIERS
   ═══════════════════════════════════════════════════════════════════════ */
type DocS = "Received" | "Requested" | "Missing" | "Not required";
const DOC_KEYS = ["insurance", "method", "risk"] as const;
type DocKey = typeof DOC_KEYS[number];
const DOC_LABEL: Record<DocKey, string> = { insurance: "Insurance certificate", method: "Method statement", risk: "Risk assessment" };
type Supplier = {
  id: string; cat: string; company: string; contact: string; role: string; phone: string; owner: string; scope: string; value: number;
  status: string; deadline: string; deadlineWhat: string; docs: Record<DocKey, DocS>; extra?: [string, DocS][];
  deadlines: [string, string, string][]; issues: { t: string; go?: Go; cleared?: string }[]; tasks: [string, string, string][];
};
const SUPPLIERS: Supplier[] = [
  { id: "sp-build", cat: "Exhibition Builder", company: "Brightwell Exhibition Build", contact: "Declan Foley", role: "Account Director", phone: "01 649 2210", owner: "Robyn Walsh", value: 61400,
    scope: "Shell scheme, back walls and fascias for up to 191 stands across Hall A and Hall B, plus feature stand builds for premium partners.",
    status: "Confirmed", deadline: "30 Oct", deadlineWhat: "Final floor plan for build drawings",
    docs: { insurance: "Received", method: "Received", risk: "Requested" },
    deadlines: [["Final floor plan for build drawings", "30 Oct", "In progress"], ["Build drawings v2", "6 Nov", "Scheduled"], ["Fascia names from exhibitor records", "29 Jan 2027", "Scheduled"], ["Build crew schedule", "26 Feb 2027", "Scheduled"]],
    issues: [{ t: `Nova Fertility Clinic ${NOVA.stand} needs 4m frontage; the bay supports 3m`, go: { drawer: { kind: "stand", id: NOVA.stand } }, cleared: "resolve-nova-frontage" }],
    tasks: [["Issue build drawings v2", "Robyn Walsh", "6 Nov"], ["Confirm fascia names from exhibitor records", "Conor Ryan", "29 Jan 2027"], ["Chase risk assessment", "Robyn Walsh", "9 Oct"]] },
  { id: "sp-av", cat: "AV Partner", company: "Lumacast Audio Visual", contact: "Fiona Kehoe", role: "Technical Producer", phone: "01 902 4471", owner: "Sarah Keane", value: 47850,
    scope: "PA, LED screens, confidence monitors and operators for six stages. Session recording on Main Stage 1 and Main Stage 2.",
    status: "At risk", deadline: "26 Feb 2027", deadlineWhat: "AV handover: final decks and run sheets",
    docs: { insurance: "Received", method: "Received", risk: "Received" },
    deadlines: [["AV review, 3 first-cut decks", "This week", "At risk"], ["Stage plots signed off", "20 Nov", "Scheduled"], ["Deck deadline", "12 Feb 2027", "Scheduled"], ["AV handover", "26 Feb 2027", "Scheduled"]],
    issues: [
      { t: "3 decks needed for AV review this week; Dr Aoife Brennan's first cut overdue since 24 Sep", go: { drawer: { kind: "speaker", id: "s-brennan" } } },
      { t: "Main Stage 2 handheld mics: 2 units flagged at last show, replacements to confirm", go: { page: "Production", tab: "av" } },
    ],
    tasks: [["Send AV review pack", "Sarah Keane", "2 Oct"], ["Stage plot for Performance Lab", "Fiona Kehoe", "20 Nov"], ["Recording consent wording", "Amy Byrne", "15 Jan 2027"]] },
  { id: "sp-sec", cat: "Security", company: "Sentinel Event Security", contact: "Mark Tobin", role: "Operations Manager", phone: "01 485 3307", owner: "Robyn Walsh", value: 14200,
    scope: "Door supervision, bag checks, stage barriers and overnight hall security from Fri 12 to Mon 15 Mar.",
    status: "Confirmed", deadline: "29 Jan 2027", deadlineWhat: "Crowd management plan to RDS",
    docs: { insurance: "Received", method: "Requested", risk: "Received" }, extra: [["PSA licence", "Received"]],
    deadlines: [["Method statement", "30 Nov", "Requested"], ["Crowd management plan to RDS", "29 Jan 2027", "Scheduled"], ["Guard rota", "26 Feb 2027", "Scheduled"]],
    issues: [{ t: "Overnight guard count for Hall B depends on the exhibitor high-value list", go: { page: "Exhibitors", tab: "readiness" } }],
    tasks: [["Share high-value exhibitor list", "Robyn Walsh", "15 Jan 2027"], ["Chase method statement", "Conor Ryan", "10 Oct"]] },
  { id: "sp-clean", cat: "Cleaning", company: "Clearway Facility Services", contact: "Joanne Hickey", role: "Contracts Lead", phone: "01 531 8820", owner: "Conor Ryan", value: 8900,
    scope: "Pre-open clean, rolling day cleaning, washroom attendants and post-breakdown clean on Mon 15 Mar.",
    status: "Confirmed", deadline: "12 Feb 2027", deadlineWhat: "Waste plan and bin locations",
    docs: { insurance: "Received", method: "Missing", risk: "Requested" },
    deadlines: [["Method statement", "Overdue", "Missing"], ["Waste plan and bin locations", "12 Feb 2027", "Scheduled"]],
    issues: [{ t: "Method statement missing; RDS needs it four weeks before build" }],
    tasks: [["Chase method statement", "Conor Ryan", "30 Sep"], ["Agree washroom rota", "Joanne Hickey", "12 Feb 2027"]] },
  { id: "sp-reg", cat: "Registration", company: "Tallyline Registration", contact: "Eoin Gaffney", role: "Project Manager", phone: "01 677 0194", owner: "Conor Ryan", value: 11650,
    scope: "Badge printing, 8 self-scan kiosks and 12 handheld scanners. Shopify ticket sync, exhibitor, speaker and crew badges.",
    status: "In progress", deadline: "12 Nov", deadlineWhat: "Shopify ticket sync test",
    docs: { insurance: "Received", method: "Received", risk: "Not required" }, extra: [["Data processing agreement", "Received"]],
    deadlines: [["Shopify ticket sync test", "12 Nov", "Scheduled"], ["Badge data freeze", "15 Jan 2027", "Scheduled"], ["Kiosk install", "12 Mar 2027", "Scheduled"]],
    issues: [{ t: "Crew badge list needs roster v5 from Staff", go: { page: "Events", tab: "staff" } }],
    tasks: [["Run ticket sync test", "Eoin Gaffney", "12 Nov"], ["Export crew list for badges", "Conor Ryan", "1 Mar 2027"]] },
  { id: "sp-furn", cat: "Furniture", company: "Form & Hire Furniture", contact: "Aisling Coyne", role: "Event Sales", phone: "01 866 5530", owner: "Robyn Walsh", value: 9300,
    scope: "Stand furniture packages, green room, VIP lounge and registration counters.",
    status: "Confirmed", deadline: "29 Jan 2027", deadlineWhat: "Exhibitor furniture orders close",
    docs: { insurance: "Received", method: "Not required", risk: "Received" },
    deadlines: [["VIP lounge layout", "14 Nov", "Review"], ["Exhibitor furniture orders close", "29 Jan 2027", "Scheduled"]],
    issues: [{ t: "VIP lounge layout awaiting Nikki's approval" }],
    tasks: [["Approve VIP lounge layout", "Nikki Dwyer", "14 Nov"], ["Add furniture menu to exhibitor pack", "Robyn Walsh", "30 Oct"]] },
  { id: "sp-elec", cat: "Electrical", company: "Voltworks Event Power", contact: "Kieran Dunne", role: "Electrical Supervisor", phone: "01 704 2268", owner: "Robyn Walsh", value: 18750,
    scope: "Stand power and lighting, stage distribution and feature lighting. 400A in Hall A, 250A in Hall B.",
    status: "In progress", deadline: "29 Jan 2027", deadlineWhat: "Final stand power orders",
    docs: { insurance: "Received", method: "Received", risk: "Requested" },
    deadlines: [["Power orders received", "118 of 135", "In progress"], ["Final stand power orders", "29 Jan 2027", "Scheduled"], ["First fix on build day", "12 Mar 2027", "Scheduled"]],
    issues: [{ t: "Stand C22 (Ferro Sports Recovery) wants a third socket for recovery pods", go: { drawer: { kind: "stand", id: "C22" } } }],
    tasks: [["Quote extra socket for C22", "Kieran Dunne", "3 Oct"], ["Chase 17 missing power orders", "Robyn Walsh", "29 Jan 2027"]] },
  { id: "sp-venue", cat: "Venue", company: "RDS Dublin", contact: "RDS Event Manager", role: "Venue lead", phone: "Via venue portal", owner: "Robyn Walsh", value: 88500,
    scope: "Hall A, Hall B, stage areas, green room, VIP lounge and loading bay for Fri 12 to Mon 15 Mar. House services on request.",
    status: "Signed", deadline: "30 Oct", deadlineWhat: "Floor plan submission",
    docs: { insurance: "Received", method: "Received", risk: "Requested" }, extra: [["Fire safety plan", "Requested"]],
    deadlines: [["Floor plan submission", "30 Oct", "In progress"], ["2nd instalment €22,125", "30 Nov", "Scheduled"], ["Event management plan", "29 Jan 2027", "Scheduled"], ["Final balance €44,250", "12 Feb 2027", "Scheduled"]],
    issues: [{ t: "Floor plan submission due 30 Oct; Nova frontage decision feeds it", go: { page: "Events", tab: "venue" } }],
    tasks: [["Submit floor plan", "Robyn Walsh", "30 Oct"], ["Pay 2nd instalment", "Nikki Dwyer", "30 Nov"], ["Fire safety plan draft", "Robyn Walsh", "15 Jan 2027"]] },
  { id: "sp-cat", cat: "Catering", company: "Harvest Table Catering", contact: "Brid Kinsella", role: "Events Manager", phone: "01 451 9086", owner: "Conor Ryan", value: 12480,
    scope: "Crew meals for 100 over two days, green room and VIP lounge. Public concessions run by the venue caterer.",
    status: "Approved", deadline: "26 Feb 2027", deadlineWhat: "Final dietary numbers",
    docs: { insurance: "Received", method: "Requested", risk: "Requested" }, extra: [["HACCP certificate", "Received"]],
    deadlines: [["Menu tasting", "20 Jan 2027", "Scheduled"], ["Final dietary numbers", "26 Feb 2027", "Scheduled"]],
    issues: [{ t: "Green room dietary list comes from Production speaker records", go: { page: "Production", tab: "speakers" } }],
    tasks: [["Speaker dietary list", "Sarah Keane", "19 Feb 2027"], ["Crew meal count from roster", "Conor Ryan", "26 Feb 2027"]] },
];
const docStep = (d: DocS) => d === "Received" ? "done" : d === "Missing" ? "missing" : d === "Requested" ? "pending" : "na";
const openIssues = (fx: Fx, s: Supplier) => s.issues.filter(i => !(i.cleared && fx.acted[i.cleared]));

function Suppliers({ fx }: { fx: Fx }) {
  const [cat, setCat] = useState<"all" | "attention">("all");
  if (fx.event === "ca") {
    return (
      <Page>
        <PageHead title="Suppliers" sub="Canada Pilot: supplier checklist cloned from Dublin, sourcing starts after venue" fx={fx} />
        <CanadaPanel fx={fx} title="Supplier checklist cloned" sub="9 categories, document rules and deadlines relative to doors"
          rows={SUPPLIERS.map(s => [s.cat, `Dublin: ${s.company}`, "To source"])} />
      </Page>
    );
  }
  const totalDocs = SUPPLIERS.length * 3;
  const docsDone = SUPPLIERS.reduce((a, s) => a + DOC_KEYS.filter(d => s.docs[d] === "Received" || s.docs[d] === "Not required").length, 0);
  const issues = SUPPLIERS.reduce((a, s) => a + openIssues(fx, s).length, 0);
  const spend = SUPPLIERS.reduce((a, s) => a + s.value, 0);
  const rows = SUPPLIERS.filter(s => cat === "all" || s.status === "At risk" || s.status === "In progress" || DOC_KEYS.some(d => s.docs[d] === "Missing"));
  const cols: Col<Supplier>[] = [
    { k: "company", label: "Supplier", w: "minmax(0,1.6fr)", render: s => <div style={{ minWidth: 0 }}><div className="fx-strong" style={ellipsis}>{s.company}</div><div style={{ fontSize: 11, color: "var(--faint)" }}>{s.cat}</div></div> },
    { k: "contact", label: "Contact", w: "minmax(0,1.1fr)", render: s => <div style={{ minWidth: 0 }}><div style={ellipsis}>{s.contact}</div><div style={{ fontSize: 11, color: "var(--faint)", ...ellipsis }}>{s.phone}</div></div> },
    { k: "scope", label: "Scope", w: "minmax(0,1.7fr)", render: s => <span className="fx-muted" title={s.scope}>{s.scope}</span> },
    { k: "docs", label: "Ins · MS · RA", w: "92px", render: s => <Row gap={4}>{DOC_KEYS.map(d => <StepDot key={d} s={docStep(s.docs[d])} title={`${DOC_LABEL[d]}: ${s.docs[d]}`} />)}</Row> },
    { k: "deadline", label: "Next deadline", w: "minmax(0,1.1fr)", render: s => <div style={{ minWidth: 0 }}><div style={{ color: "var(--ink)" }}>{s.deadline}</div><div style={{ fontSize: 11, color: "var(--faint)", ...ellipsis }}>{s.deadlineWhat}</div></div> },
    { k: "event", label: "Event", w: "92px", render: () => <EventTag id="both" /> },
    { k: "status", label: "Status", w: "96px", render: s => <Status s={s.status} /> },
  ];
  const upcoming: [string, string, string, string][] = [
    ["30 Oct", "Floor plan to RDS + builder", "sp-venue", "33 days"], ["12 Nov", "Shopify ticket sync test", "sp-reg", "46 days"],
    ["30 Nov", "RDS 2nd instalment €22,125", "sp-venue", "64 days"], ["29 Jan", "Final stand power orders", "sp-elec", "124 days"],
    ["29 Jan", "Crowd management plan", "sp-sec", "124 days"], ["26 Feb", "AV handover", "sp-av", "152 days"],
  ];
  return (
    <Page>
      <PageHead title="Suppliers" sub="Contractors for the RDS weekend: scope, documents, deadlines and issues" fx={fx} />
      <div style={{ display: "grid", gap: 14 }}>
        <Kpis items={[
          { label: "Suppliers contracted", value: SUPPLIERS.length, sub: "shared by both events" },
          { label: "Committed spend", value: eurK(spend), sub: "incl. RDS venue hire" },
          { label: "Documents complete", value: `${docsDone}/${totalDocs}`, sub: `${totalDocs - docsDone} requested or missing`, tone: "warn" },
          { label: "Open issues", value: issues, sub: "across 9 suppliers", tone: issues > 6 ? "bad" : "warn" },
          { label: "Next deadline", value: "30 Oct", sub: "floor plan to RDS", onClick: () => fx.open("supplier", "sp-venue") },
        ]} />
        <div style={grid("minmax(0,2.3fr) minmax(0,1fr)")}>
          <Card pad={false} title="Supplier register" right={<Chips options={[["all", "All 9"], ["attention", "Needs attention"]]} value={cat} onChange={setCat} />}>
            <div style={{ marginTop: 12 }}>
              <Table cols={cols} rows={rows} onRow={s => fx.open("supplier", s.id)} highlight={s => s.status === "At risk"} />
            </div>
          </Card>
          <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
            <Card title="Coming up" sub="next 6 supplier dates">
              {upcoming.map(([d, t, id, rel], i) => (
                <button key={t} style={{ ...plainBtn, ...rowLine, borderTop: i ? rowLine.borderTop : 0 }} onClick={() => fx.open("supplier", id)}>
                  <span style={{ width: 46, flex: "none", fontSize: 12, color: "var(--ink)", fontWeight: 600 }}>{d}</span>
                  <span style={{ flex: 1, fontSize: 12, color: "var(--body)", ...ellipsis }}>{t}</span>
                  <span style={{ fontSize: 11, color: "var(--faint)", flex: "none" }}>{rel}</span>
                </button>
              ))}
            </Card>
            <Card title="Document gaps">
              {SUPPLIERS.flatMap(s => DOC_KEYS.filter(d => s.docs[d] === "Missing" || s.docs[d] === "Requested").map(d => [s, d] as [Supplier, DocKey])).slice(0, 7).map(([s, d], i) => (
                <button key={s.id + d} style={{ ...plainBtn, ...rowLine, borderTop: i ? rowLine.borderTop : 0 }} onClick={() => fx.open("supplier", s.id)}>
                  <StepDot s={docStep(s.docs[d])} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 12, color: "var(--ink)", ...ellipsis }}>{DOC_LABEL[d]}</span>
                    <span style={{ display: "block", fontSize: 11, color: "var(--faint)", ...ellipsis }}>{s.company}</span>
                  </span>
                  <Status s={s.docs[d]} />
                </button>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </Page>
  );
}

function SupplierDrawer({ fx, id }: DrawerProps) {
  const s = SUPPLIERS.find(x => x.id === id) || SUPPLIERS.find(x => x.cat.toLowerCase() === String(id).toLowerCase()) || SUPPLIERS[0];
  const issues = openIssues(fx, s);
  const docs: [string, DocS, string][] = [...DOC_KEYS.map(d => [DOC_LABEL[d], s.docs[d], d] as [string, DocS, string]), ...(s.extra || []).map(([l, v]) => [l, v, l.toLowerCase().replace(/\s+/g, "-")] as [string, DocS, string])];
  return (
    <Drawer fx={fx} eyebrow={s.cat.toUpperCase()} title={s.company}
      badges={<><Status s={s.status} /><EventTag id="both" /><Badge tone="ghost">{eur(s.value)}</Badge></>}
      actions={<>
        <Btn kind="ghost" onClick={() => fx.toast(`Email draft opened for ${s.contact}`)} icon={PATHS.mail}>Email {s.contact.split(" ")[0]}</Btn>
        {fx.page !== "Events" || fx.tab !== "suppliers"
          ? <Btn kind="primary" onClick={() => { fx.close(); fx.goTo("Events", "suppliers"); }}>Open suppliers</Btn>
          : <ActBtn fx={fx} k={`events-sup-${s.id}-update`} label="Request status update" doneLabel="Update requested" toast={`Status update requested from ${s.company}`} />}
      </>}>
      <Sec title="CONTACT">
        <KV items={[["Contact", `${s.contact} · ${s.role}`], ["Phone", s.phone], ["Pulse owner", <Row gap={7}><TeamAvatar name={s.owner} size={18} />{s.owner}</Row>], ["Next deadline", `${s.deadline} · ${s.deadlineWhat}`]]} />
      </Sec>
      <Sec title="SCOPE"><Note>{s.scope}</Note></Sec>
      <Sec title="DOCUMENTS">
        {docs.map(([l, v, key], i) => (
          <div key={l} style={{ ...rowLine, borderTop: i ? rowLine.borderTop : 0 }}>
            <Icon d={PATHS.doc} size={14} style={{ color: "var(--dim)" }} />
            <span style={{ flex: 1, fontSize: 12.5, color: "var(--ink)" }}>{l}</span>
            {(v === "Missing" || v === "Requested") && !fx.acted[`events-doc-${s.id}-${key}`]
              ? <ActBtn fx={fx} k={`events-doc-${s.id}-${key}`} label={v === "Missing" ? "Request" : "Chase"} doneLabel="Chased" toast={`${l} ${v === "Missing" ? "requested" : "chased"} from ${s.company}`} kind="ghost" size="sm" />
              : null}
            {fx.acted[`events-doc-${s.id}-${key}`] ? <Badge tone="warn">Chased today</Badge> : <Status s={v} />}
          </div>
        ))}
      </Sec>
      <Sec title="DEADLINES">
        {s.deadlines.map(([w, d, st], i) => (
          <div key={w} style={{ ...rowLine, borderTop: i ? rowLine.borderTop : 0 }}>
            <Icon d={PATHS.clock} size={13} style={{ color: "var(--dim)" }} />
            <span style={{ flex: 1, fontSize: 12.5, color: "var(--body)" }}>{w}</span>
            <span style={{ fontSize: 12, color: "var(--ink)", fontWeight: 500 }}>{d}</span>
            <St s={st} />
          </div>
        ))}
      </Sec>
      <Sec title={`OPEN ISSUES · ${issues.length}`}>
        {issues.length === 0 && <Note>No open issues. Last one closed today.</Note>}
        {issues.map(iss => (
          <div key={iss.t} style={{ ...rowLine, alignItems: "flex-start" }}>
            <span style={{ color: "var(--warn)", display: "flex", marginTop: 1 }}><Icon d={PATHS.alert} size={14} /></span>
            <span style={{ flex: 1, fontSize: 12.5, color: "var(--body)", lineHeight: 1.45 }}>{iss.t}</span>
            {iss.go && <LinkBtn onClick={() => follow(fx, iss.go)}>Open</LinkBtn>}
          </div>
        ))}
      </Sec>
      <Sec title="TASKS">
        {s.tasks.map(([t, o, d], i) => (
          <div key={t} style={{ ...rowLine, borderTop: i ? rowLine.borderTop : 0 }}>
            <TeamAvatar name={o} size={20} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 12.5, color: "var(--ink)", ...ellipsis }}>{t}</span>
              <span style={{ display: "block", fontSize: 11, color: "var(--faint)" }}>{o}</span>
            </span>
            <span style={{ fontSize: 11.5, color: "var(--dim)" }}>{d}</span>
          </div>
        ))}
      </Sec>
    </Drawer>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   VENUE · RDS Dublin
   ═══════════════════════════════════════════════════════════════════════ */
type Blk = "b" | "e" | "x" | "d" | "-";
const BLOCKS = ["Fri AM", "Fri PM", "Sat AM", "Sat PM", "Sun AM", "Sun PM", "Sun eve"];
const SPACES: { name: string; where: string; ev: Ev; cap: string; use: Blk[] }[] = [
  { name: "Hall A", where: "Exhibition · Zones A–B", ev: "both", cap: "96 stands", use: ["b", "b", "e", "e", "e", "e", "x"] },
  { name: "Hall B", where: "Exhibition · Zones C–D", ev: "both", cap: "95 stands", use: ["b", "b", "e", "e", "e", "e", "x"] },
  { name: "Main Stage 1", where: "Hall A north", ev: "ff", cap: "650 seats", use: ["-", "b", "e", "e", "e", "e", "x"] },
  { name: "Main Stage 2", where: "Hall B north", ev: "mh", cap: "650 seats", use: ["-", "b", "e", "e", "e", "e", "x"] },
  { name: "Workshop Stage 1", where: "Hall A mezzanine", ev: "ff", cap: "160 seats", use: ["-", "b", "e", "e", "e", "e", "x"] },
  { name: "Workshop Stage 2", where: "Hall B mezzanine", ev: "mh", cap: "160 seats", use: ["-", "b", "e", "e", "e", "e", "x"] },
  { name: "Expert Q&A Lounge", where: "Hall A", ev: "ff", cap: "80 seats", use: ["-", "b", "e", "e", "e", "e", "x"] },
  { name: "Performance Lab", where: "Hall B", ev: "mh", cap: "120 seats", use: ["-", "b", "e", "e", "e", "e", "x"] },
  { name: "Green Room", where: "Members' suite", ev: "both", cap: "40", use: ["-", "b", "e", "e", "e", "e", "-"] },
  { name: "VIP Lounge", where: "Members' suite", ev: "both", cap: "90", use: ["-", "b", "e", "e", "e", "e", "-"] },
  { name: "Loading bay", where: "Service yard", ev: "both", cap: "6 bays", use: ["b", "b", "d", "-", "d", "-", "x"] },
];
function blkStyle(b: Blk, ev: Ev): CSSProperties {
  if (b === "e") return ev === "both"
    ? { background: "linear-gradient(90deg, var(--ev-ff-soft), var(--ev-mh-soft))", boxShadow: "inset 0 0 0 1px var(--border)" }
    : { background: evSoft(ev), boxShadow: `inset 2px 0 0 ${evColor(ev)}` };
  if (b === "b" || b === "x") return { background: "repeating-linear-gradient(135deg, var(--track) 0 5px, transparent 5px 10px)", boxShadow: "inset 0 0 0 1px var(--border)" };
  if (b === "d") return { background: "var(--surface-2)", boxShadow: "inset 0 0 0 1px var(--border-strong)" };
  return { background: "transparent", boxShadow: "inset 0 0 0 1px var(--border)", opacity: .5 };
}
const BLK_LABEL: Record<Blk, string> = { b: "Build", e: "Live", x: "Breakdown", d: "Deliveries", "-": "" };

function Venue({ fx }: { fx: Fx }) {
  if (fx.event === "ca") {
    return (
      <Page>
        <PageHead title="Venue" sub="Canada Pilot: venue TBD, requirements brief cloned from the RDS" fx={fx} />
        <CanadaPanel fx={fx} title="Venue brief cloned from RDS Dublin" sub="what the Canada venue has to fit"
          rows={[
            ["Exhibition floor", "Dublin: Hall A, 96 stands", "Pilot sized at about half"], ["Main Stage", "Dublin: 650 seats", "Required"],
            ["Workshop Stage", "Dublin: 160 seats", "Required"], ["Expert Q&A Lounge", "Dublin: 80 seats", "Required"],
            ["Green room + VIP", "Dublin: Members' suite", "Required"], ["Loading access", "Dublin: 6 bays, Fri build", "Required"],
            ["Power", "Dublin: 400A exhibition hall", "Confirm with venue"], ["Build + breakdown", "Dublin: Fri build, Sun 19:00 out", "Same pattern"],
          ]} />
      </Page>
    );
  }
  const spaces = SPACES.filter(s => inEvent(fx.event, s.ev));
  const seats = SPACES.filter(s => /seats/.test(s.cap)).reduce((a, s) => a + parseInt(s.cap, 10), 0);
  const schedule: [string, string, string, string][] = [
    ["Thu 11 Mar · 18:00", "Venue walkthrough and handover", "RDS + Robyn Walsh", "Confirmed"],
    ["Fri 12 Mar · 07:00", "Builder access, shell scheme build", "Brightwell", "Confirmed"],
    ["Fri 12 Mar · 11:00", "Electrical first fix, stage distribution", "Voltworks", "Confirmed"],
    ["Fri 12 Mar · 13:00", "AV load-in, six stages", "Lumacast", "Confirmed"],
    ["Fri 12 Mar · 14:00–20:00", "Exhibitor build window", "Exhibitor Ops", "Scheduled"],
    ["Fri 12 Mar · 20:30", "Fire safety walk and venue sign-off", "RDS + Sentinel", "Scheduled"],
    ["Sat 13 Mar · 08:00", "Exhibitor hall access", "Ops Team", "Scheduled"],
    ["Sun 14 Mar · 19:00", "Breakdown begins", "All suppliers", "Scheduled"],
    ["Mon 15 Mar · 12:00", "Final clear and venue handback", "RDS + Clearway", "Scheduled"],
  ];
  const contract: [string, string, string, string][] = [
    ["Venue contract signed", "14 Apr 2026", "", "Complete"],
    ["Booking deposit 25%", "14 Apr 2026", eur(22125), "Paid"],
    ["Floor plan submission", "30 Oct 2026", "", "In progress"],
    ["2nd instalment 25%", "30 Nov 2026", eur(22125), "Scheduled"],
    ["Event management + fire safety plan", "29 Jan 2027", "", "Pending"],
    ["Final balance 50%", "12 Feb 2027", eur(44250), "Scheduled"],
    ["House services order + final numbers", "26 Feb 2027", "", "Scheduled"],
    ["Damage deposit returned", "31 Mar 2027", eur(5000), "Scheduled"],
  ];
  const bcols = `minmax(0,190px) repeat(${BLOCKS.length},minmax(0,1fr)) minmax(0,80px)`;
  return (
    <Page>
      <PageHead title="Venue" sub="RDS Dublin: spaces, access, power and the venue contract" fx={fx} />
      <div style={{ display: "grid", gap: 14 }}>
        <Card title="RDS Dublin · who uses what, when" sub="Fri 12 to Sun 14 Mar 2027" pad={false} right={
          <Legend items={[["Future Fertility", "var(--ev-ff)"], ["Future Men's Health", "var(--ev-mh)"], ["Build / breakdown", "var(--dim)", true]]} />
        }>
          <div style={{ padding: "14px 18px 4px", ...grid("repeat(5,minmax(0,1fr))", 12) }}>
            <Fig label="Halls in use" value="2" sub="Hall A + Hall B" />
            <Fig label="Stages" value="6" sub="3 per event" />
            <Fig label="Stand capacity" value="191" sub="135 sold" />
            <Fig label="Seats across stages" value={seats.toLocaleString("en-IE")} />
            <Fig label="Venue days" value="4" sub="Thu walk to Mon clear" />
          </div>
          <div style={{ padding: "10px 18px 16px" }}>
            <div style={{ ...grid(bcols, 4), alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "var(--faint)" }}>Space</span>
              {BLOCKS.map(b => <span key={b} style={{ fontSize: 10.5, color: b.startsWith("Sat") || (b.startsWith("Sun") && b !== "Sun eve") ? "var(--ink)" : "var(--faint)", textAlign: "center" }}>{b}</span>)}
              <span style={{ fontSize: 11, color: "var(--faint)", textAlign: "right" }}>Capacity</span>
            </div>
            {spaces.map(s => (
              <div key={s.name} style={{ ...grid(bcols, 4), alignItems: "center", padding: "3px 0" }}>
                <div style={{ minWidth: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  {s.ev === "both" ? <Dot color="var(--dim)" /> : <Dot color={evColor(s.ev)} />}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, color: "var(--ink)", ...ellipsis }}>{s.name}</div>
                    <div style={{ fontSize: 10.5, color: "var(--faint)", ...ellipsis }}>{s.where}</div>
                  </div>
                </div>
                {s.use.map((b, i) => (
                  <span key={i} title={`${s.name} · ${BLOCKS[i]} · ${BLK_LABEL[b] || "Idle"}`} style={{ height: 26, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9.5, fontWeight: 600, letterSpacing: ".04em", color: "var(--dim)", ...blkStyle(b, s.ev) }}>
                    {b === "e" ? "" : BLK_LABEL[b].toUpperCase()}
                  </span>
                ))}
                <span style={{ fontSize: 11.5, color: "var(--body)", textAlign: "right" }}>{s.cap}</span>
              </div>
            ))}
          </div>
        </Card>

        <div style={grid("minmax(0,1.35fr) minmax(0,1fr)")}>
          <Card title="Build and breakdown" sub="Thu 11 to Mon 15 Mar">
            {schedule.map(([w, t, who, st], i) => (
              <div key={w + t} style={{ ...rowLine, borderTop: i ? rowLine.borderTop : 0, display: "grid", gridTemplateColumns: "minmax(0,150px) minmax(0,1fr) minmax(0,120px) 84px", gap: 10 }}>
                <span style={{ fontSize: 11.5, color: "var(--ink)", fontWeight: 500, fontVariantNumeric: "tabular-nums", ...ellipsis }}>{w}</span>
                <span style={{ fontSize: 12.5, color: "var(--body)", ...ellipsis }}>{t}</span>
                <span style={{ fontSize: 11.5, color: "var(--faint)", ...ellipsis }}>{who}</span>
                <span style={{ textAlign: "right" }}><St s={st} /></span>
              </div>
            ))}
          </Card>
          <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
            <Card title="Access and loading">
              {([["Fri 12 Mar", "07:00–20:00", "Open build, 30 min vehicle slots"], ["Sat 13 Mar", "07:00–09:30", "Deliveries only, no vehicles after"], ["Sun 14 Mar", "07:00–09:30", "Deliveries only"], ["Sun 14 Mar", "19:00–23:30", "Breakdown, slots by zone"]] as [string, string, string][]).map(([d, t, n], i) => (
                <div key={d + t} style={{ ...rowLine, borderTop: i ? rowLine.borderTop : 0 }}>
                  <span style={{ width: 74, flex: "none", fontSize: 12, color: "var(--ink)" }}>{d}</span>
                  <span style={{ width: 86, flex: "none", fontSize: 12, color: "var(--body)", fontVariantNumeric: "tabular-nums" }}>{t}</span>
                  <span style={{ flex: 1, ...small, ...ellipsis }}>{n}</span>
                </div>
              ))}
            </Card>
            <Card title="Power" right={<LinkBtn onClick={() => fx.open("supplier", "sp-elec")}>Voltworks</LinkBtn>}>
              <div style={grid("repeat(2,minmax(0,1fr))", 12)}>
                <Fig label="Hall A supply" value="400A" sub="three-phase" />
                <Fig label="Hall B supply" value="250A" sub="three-phase" />
              </div>
              <div style={{ marginTop: 10 }}>
                <Meter label="Stand power orders" value={118} max={135} color="var(--accent)" right="118/135" />
              </div>
              <button style={{ ...plainBtn, ...rowLine }} onClick={() => fx.open("stand", "C22")}>
                <span style={{ color: "var(--warn)", display: "flex" }}><Icon d={PATHS.alert} size={13} /></span>
                <span style={{ flex: 1, fontSize: 12, color: "var(--body)", ...ellipsis }}>C22 Ferro Sports Recovery wants a third socket</span>
                <EventTag id="mh" />
              </button>
            </Card>
          </div>
        </div>

        <div style={grid("minmax(0,1.35fr) minmax(0,1fr)")}>
          <Card title="Venue contract" sub={`RDS hire ${eur(88500)} · 25 / 25 / 50`} right={<LinkBtn onClick={() => fx.open("supplier", "sp-venue")}>Supplier record</LinkBtn>}>
            {contract.map(([m, d, amt, st], i) => (
              <div key={m} style={{ ...rowLine, borderTop: i ? rowLine.borderTop : 0, display: "grid", gridTemplateColumns: "minmax(0,1fr) 96px 80px 90px", gap: 10 }}>
                <span style={{ fontSize: 12.5, color: "var(--ink)", ...ellipsis }}>{m}</span>
                <span style={{ fontSize: 11.5, color: "var(--dim)" }}>{d}</span>
                <span style={{ fontSize: 12, color: "var(--ink)", fontWeight: 500, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{amt}</span>
                <span style={{ textAlign: "right" }}><St s={st} /></span>
              </div>
            ))}
            <div style={{ marginTop: 10 }}>
              <Meter label="Venue hire paid" value={22125} max={88500} color="var(--ok)" right={`${eur(22125)} of ${eur(88500)}`} />
            </div>
          </Card>
          <Card title="Contacts">
            {([
              ["RDS Event Manager", "Venue lead · via venue portal", ""], ["RDS Technical Services", "Power, rigging, house AV", ""], ["RDS Security Control", "Event-day control room", ""],
              ["Robyn Walsh", "Future Events venue lead", "Robyn Walsh"], ["Sarah Keane", "Production and stages", "Sarah Keane"], ["Conor Ryan", "Crew, registration, catering", "Conor Ryan"],
            ] as [string, string, string][]).map(([n, r, t], i) => (
              <div key={n} style={{ ...rowLine, borderTop: i ? rowLine.borderTop : 0 }}>
                {t ? <TeamAvatar name={t} size={24} /> : <span style={{ width: 24, height: 24, borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--dim)", flex: "none" }}><Icon d={PATHS.stand} size={12} /></span>}
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 12.5, color: "var(--ink)", ...ellipsis }}>{n}</span>
                  <span style={{ display: "block", fontSize: 11, color: "var(--faint)", ...ellipsis }}>{r}</span>
                </span>
                <Badge tone={t ? "ghost" : "info"}>{t ? "Team" : "RDS"}</Badge>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </Page>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   RUN OF SHOW (live board preview)
   ═══════════════════════════════════════════════════════════════════════ */
type RosItem = { t: string; what: string; owner: string; where: string; status: "Complete" | "Active" | "Upcoming"; ev: Ev; go?: Go };
const ROS: { sat: RosItem[]; sun: RosItem[] } = {
  sat: [
    { t: "07:00", what: "Crew call, radios and briefing packs", owner: "Robyn Walsh", where: "Ops Office", status: "Complete", ev: "both", go: { page: "Events", tab: "staff" } },
    { t: "07:30", what: "Registration kiosks online", owner: "Tallyline", where: "Main Entrance", status: "Complete", ev: "both", go: { drawer: { kind: "supplier", id: "sp-reg" } } },
    { t: "08:00", what: "Exhibitor hall access", owner: "Ops Team", where: "Hall A", status: "Complete", ev: "both" },
    { t: "08:45", what: "Line checks, all six stages", owner: "AV · Lumacast", where: "All stages", status: "Complete", ev: "both", go: { drawer: { kind: "supplier", id: "sp-av" } } },
    { t: "09:00", what: "Floor leads briefing", owner: "Nikki Dwyer", where: "Hall A info desk", status: "Complete", ev: "both" },
    { t: "09:30", what: "Speaker check-in opens", owner: "Production", where: "Green Room", status: "Active", ev: "both", go: { page: "Production", tab: "speakers" } },
    { t: "10:00", what: "VIP and partner arrivals", owner: "VIP team", where: "VIP Lounge", status: "Active", ev: "both" },
    { t: "10:30", what: "Doors open", owner: "Front of House", where: "Main Entrance", status: "Upcoming", ev: "both" },
    { t: "10:45", what: "Opening session · Understanding Your Fertility Window", owner: "Nikki Dwyer", where: "Main Stage 1", status: "Upcoming", ev: "ff", go: { drawer: { kind: "room", id: "cr-window" } } },
    { t: "11:00", what: "Men's Health opening welcome", owner: "Production", where: "Main Stage 2", status: "Upcoming", ev: "mh" },
    { t: "11:30", what: "Panel · Optimising Men's Health Before 40", owner: "Production", where: "Main Stage 2", status: "Upcoming", ev: "mh", go: { drawer: { kind: "room", id: "cr-40" } } },
    { t: "13:00", what: "IVF: What the Numbers Mean", owner: "Production", where: "Main Stage 1", status: "Upcoming", ev: "ff", go: { drawer: { kind: "room", id: "cr-ivf" } } },
    { t: "13:30", what: "Crew lunch rotation A", owner: "Conor Ryan", where: "Crew Room", status: "Upcoming", ev: "both" },
    { t: "15:00", what: "Exhibitor check-in round, all stands", owner: "Exhibitor Ops", where: "Hall A + Hall B", status: "Upcoming", ev: "both", go: { page: "Exhibitors", tab: "readiness" } },
    { t: "17:30", what: "Last entry", owner: "Front of House", where: "Main Entrance", status: "Upcoming", ev: "both" },
    { t: "18:00", what: "Doors close", owner: "Front of House", where: "Main Entrance", status: "Upcoming", ev: "both" },
    { t: "18:30", what: "Day 1 debrief", owner: "Nikki Dwyer", where: "Ops Office", status: "Upcoming", ev: "both" },
  ],
  sun: [
    { t: "07:30", what: "Crew call and radios", owner: "Robyn Walsh", where: "Ops Office", status: "Upcoming", ev: "both", go: { page: "Events", tab: "staff" } },
    { t: "08:00", what: "Exhibitor hall access", owner: "Ops Team", where: "Hall A", status: "Upcoming", ev: "both" },
    { t: "08:45", what: "Line checks, all six stages", owner: "AV · Lumacast", where: "All stages", status: "Upcoming", ev: "both" },
    { t: "09:30", what: "Speaker check-in opens", owner: "Production", where: "Green Room", status: "Upcoming", ev: "both", go: { page: "Production", tab: "speakers" } },
    { t: "10:30", what: "Doors open", owner: "Front of House", where: "Main Entrance", status: "Upcoming", ev: "both" },
    { t: "11:00", what: "Fertility morning session", owner: "Production", where: "Main Stage 1", status: "Upcoming", ev: "ff" },
    { t: "11:00", what: "Performance Lab opens", owner: "Production", where: "Performance Lab", status: "Upcoming", ev: "mh" },
    { t: "12:15", what: "What Your Bloods Are Telling You", owner: "Production", where: "Workshop Stage 2", status: "Upcoming", ev: "mh", go: { drawer: { kind: "room", id: "cr-bloods" } } },
    { t: "13:30", what: "Crew lunch rotation A", owner: "Conor Ryan", where: "Crew Room", status: "Upcoming", ev: "both" },
    { t: "16:30", what: "Last entry", owner: "Front of House", where: "Main Entrance", status: "Upcoming", ev: "both" },
    { t: "17:00", what: "Doors close", owner: "Front of House", where: "Main Entrance", status: "Upcoming", ev: "both" },
    { t: "19:00", what: "Breakdown begins", owner: "Robyn Walsh", where: "Hall A + Hall B", status: "Upcoming", ev: "both", go: { page: "Events", tab: "venue" } },
    { t: "23:30", what: "Halls clear, overnight security", owner: "Sentinel", where: "Hall A + Hall B", status: "Upcoming", ev: "both", go: { drawer: { kind: "supplier", id: "sp-sec" } } },
  ],
};
const ISSUES: { k: string; title: string; owner: string; where: string; raised: string; detail: string; ev: Ev; go?: Go; toast: string }[] = [
  { k: "events-ros-mic", title: "Stage 2 microphone replacement", owner: "AV", where: "Main Stage 2", raised: "09:52", ev: "mh",
    detail: "Handheld 2 dropping out on line check. Spare being swapped from Workshop Stage 2.", go: { drawer: { kind: "supplier", id: "sp-av" } }, toast: "Stage 2 microphone replaced · AV confirmed on the crew group" },
  { k: "events-ros-c22", title: "Stand C22 power request", owner: "Exhibitor Ops", where: "Hall B · Zone C", raised: "09:41", ev: "mh",
    detail: "Ferro Sports Recovery needs a third socket for recovery pods. Voltworks electrician dispatched.", go: { drawer: { kind: "stand", id: "C22" } }, toast: "C22 power live · Ferro Sports Recovery notified" },
  { k: "events-ros-vip", title: "VIP speaker arrival +20 min", owner: "Production", where: "Green Room", raised: "10:05", ev: "mh",
    detail: "Dr Robert Kelly running 20 minutes late. 11:30 panel unaffected, green room briefing moved to 11:05.", go: { drawer: { kind: "speaker", id: "s-kelly" } }, toast: "Green room briefing moved to 11:05 · moderator told" },
];

function RunOfShow({ fx }: { fx: Fx }) {
  const [d, setD] = useState<"sat" | "sun">("sat");
  if (fx.event === "ca") {
    return (
      <Page>
        <PageHead title="Run of Show" sub="Canada Pilot: run of show template cloned, times set once the venue lands" fx={fx} />
        <CanadaPanel fx={fx} title="Run of show template cloned" sub={`${ROS.sat.length + ROS.sun.length} timed items across two days, relative to doors`}
          rows={ROS.sat.filter(r => r.ev !== "mh").slice(0, 12).map(r => {
            const [h, m] = r.t.split(":").map(Number);
            const rel = h * 60 + m - (10 * 60 + 30);
            return [r.what, `Dublin: Sat ${r.t} · ${r.where}`, rel === 0 ? "Doors" : `Doors ${rel < 0 ? "minus" : "plus"} ${Math.floor(Math.abs(rel) / 60)}h${String(Math.abs(rel) % 60).padStart(2, "0")}`];
          })} />
      </Page>
    );
  }
  const list = ROS[d].filter(r => inEvent(fx.event, r.ev));
  const issues = ISSUES.filter(i => inEvent(fx.event, i.ev));
  const open = issues.filter(i => !fx.acted[i.k]);
  const count = (s: RosItem["status"]) => list.filter(r => r.status === s).length;
  const micFixed = !!fx.acted["events-ros-mic"];
  const stages: [string, EventId, string][] = [
    ["Main Stage 1", "ff", d === "sat" ? "Standby" : "Scheduled"], ["Main Stage 2", "mh", d === "sat" ? (micFixed ? "Standby" : "Mic swap") : "Scheduled"],
    ["Workshop Stage 1", "ff", d === "sat" ? "Standby" : "Scheduled"], ["Workshop Stage 2", "mh", d === "sat" ? "Standby" : "Scheduled"],
    ["Expert Q&A Lounge", "ff", d === "sat" ? "Standby" : "Scheduled"], ["Performance Lab", "mh", d === "sat" ? "Standby" : "Scheduled"],
  ];
  const cols: Col<RosItem>[] = [
    { k: "t", label: "Time", w: "62px", render: r => <span style={{ fontVariantNumeric: "tabular-nums", color: r.status === "Complete" ? "var(--faint)" : "var(--ink)", fontWeight: 600 }}>{r.t}</span> },
    { k: "what", label: "Event", w: "minmax(0,2.2fr)", render: r => <Row gap={8}>{r.ev !== "both" && <Dot color={evColor(r.ev)} />}<span style={{ ...ellipsis, color: r.status === "Complete" ? "var(--dim)" : "var(--ink)" }}>{r.what}</span></Row> },
    { k: "owner", label: "Owner", w: "minmax(0,1fr)" },
    { k: "where", label: "Location", w: "minmax(0,1fr)", render: r => <span className="fx-muted">{r.where}</span> },
    { k: "status", label: "Status", w: "96px", render: r => r.status === "Active"
      ? <Badge tone="accent"><span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--accent)" }} />Active</Badge>
      : r.status === "Complete" ? <Badge tone="ok">Complete</Badge> : <Badge tone="ghost">Upcoming</Badge> },
  ];
  return (
    <Page>
      <PageHead title="Run of Show" sub="Event-day operations board for the RDS weekend" fx={fx} />
      <div style={{ display: "grid", gap: 14 }}>
        <div className="fx-card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <Chips options={[["sat", "Day 1 · Sat 13 Mar 2027"], ["sun", "Day 2 · Sun 14 Mar 2027"]]} value={d} onChange={setD} />
          <Badge tone="info">Live view preview</Badge>
          <span className="fx-grow" />
          {d === "sat" ? (
            <>
              <Fig label="Now" value="10:12" />
              <Fig label="Doors open" value="in 18 min" color="var(--accent)" />
            </>
          ) : <Fig label="Board goes live" value="Sun 07:30" />}
          <Fig label="Complete" value={count("Complete")} color="var(--ok)" />
          <Fig label="Active" value={count("Active")} />
          <Fig label="Open issues" value={d === "sat" ? open.length : 0} color={open.length && d === "sat" ? "var(--warn)" : undefined} />
          <ActBtn fx={fx} k="events-ros-broadcast" label="Broadcast doors call" doneLabel="Crew notified" toast={`Doors-open call sent to Future Crew Dublin 2027 · ${WA_MEMBERS} crew`} size="sm" />
        </div>
        <div style={grid("minmax(0,1.9fr) minmax(0,1fr)")}>
          <Card pad={false} title={d === "sat" ? "Day 1 · Saturday 13 March" : "Day 2 · Sunday 14 March"} sub={`${list.length} items`} right={<span style={small}>Future Fertility + Future Men's Health</span>}>
            <div style={{ marginTop: 12 }}>
              <Table cols={cols} rows={list} onRow={r => r.go && follow(fx, r.go)} highlight={r => r.status === "Active"} />
            </div>
          </Card>
          <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
            <Card title="Issues" sub={d === "sat" ? `${open.length} open` : "Day 2"}>
              {d === "sun" && <div style={{ ...small, marginBottom: 6 }}>Nothing logged for Day 2 yet. Unresolved Day 1 issues carry over below.</div>}
              {(d === "sat" ? issues : open).map((iss, i) => {
                const done = !!fx.acted[iss.k];
                return (
                  <div key={iss.k} style={{ padding: "11px 0", borderTop: i || d === "sun" ? "1px solid var(--border)" : 0, opacity: done ? .6 : 1 }}>
                    <Row gap={8}>
                      <span style={{ color: done ? "var(--ok)" : "var(--warn)", display: "flex" }}><Icon d={done ? PATHS.check : PATHS.alert} size={14} sw={2.2} /></span>
                      <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: "var(--ink)", ...ellipsis }}>{iss.title}</span>
                      <span style={{ fontSize: 11, color: "var(--faint)" }}>{iss.raised}</span>
                    </Row>
                    <div style={{ fontSize: 12, color: "var(--body)", lineHeight: 1.45, margin: "5px 0 8px 22px" }}>{iss.detail}</div>
                    <Row gap={8} style={{ marginLeft: 22, flexWrap: "wrap" }}>
                      <Badge tone="ghost">Owner: {iss.owner}</Badge>
                      <span style={{ ...small, fontSize: 11, ...ellipsis }}>{iss.where}</span>
                      <span className="fx-grow" />
                      {iss.go && <Btn size="sm" kind="ghost" onClick={() => follow(fx, iss.go)}>Open</Btn>}
                      <ActBtn fx={fx} k={iss.k} label="Resolve" doneLabel="Resolved" toast={iss.toast} size="sm" />
                    </Row>
                  </div>
                );
              })}
              {d === "sun" && open.length === 0 && <Note>All Day 1 issues resolved. Nothing carries into Sunday.</Note>}
            </Card>
            <Card title="Stages">
              {stages.filter(([, ev]) => inEvent(fx.event, ev)).map(([n, ev, s], i) => (
                <div key={n} style={{ ...rowLine, borderTop: i ? rowLine.borderTop : 0 }}>
                  <Dot color={evColor(ev)} />
                  <span style={{ flex: 1, fontSize: 12.5, color: "var(--body)" }}>{n}</span>
                  <Badge tone={s === "Mic swap" ? "warn" : s === "Standby" ? "ok" : "ghost"}>{s}</Badge>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </Page>
  );
}

/* ── Canada planning panel used by the operational tabs ───────────────── */
function CanadaPanel({ fx, title, sub, rows }: { fx: Fx; title: string; sub: string; rows: [string, string, string][] }) {
  return (
    <div style={grid("minmax(0,1.7fr) minmax(0,1fr)")}>
      <Card title={title} sub={sub} pad={false}>
        <div style={{ marginTop: 12 }}>
          {rows.map(([a, b, c]) => (
            <div key={a + b} className="fx-tr" style={{ gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1.4fr) minmax(0,1fr)", minHeight: 40 }}>
              <div className="fx-strong">{a}</div>
              <div className="fx-muted">{b}</div>
              <div style={{ textAlign: "right" }}><Badge tone="ca">{c}</Badge></div>
            </div>
          ))}
        </div>
      </Card>
      <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
        <Card title="Cloned from Dublin">
          {CANADA.cloned.map(([l, n, t]) => <Meter key={l} label={l} value={n} max={t} color={evColor("ca")} right={`${n}/${t}`} />)}
        </Card>
        <Card title="Blocking decisions" sub={`${CANADA.decisions.length} outstanding`}>
          {CANADA.decisions.slice(0, 3).map(([dd, s]) => (
            <div key={dd} style={{ ...rowLine }}>
              <span style={{ flex: 1, fontSize: 12.5, color: "var(--ink)" }}>{dd}</span>
              {fx.acted["canada-decisions"] ? <Badge tone="warn">With Nikki</Badge> : <Status s={s} />}
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <ActBtn fx={fx} k="canada-decisions" label="Send decisions to Nikki" doneLabel="Sent to Nikki" toast="6 localisation decisions sent to Nikki for review" size="sm" />
            <Btn size="sm" kind="ghost" onClick={() => fx.goTo("Events", "portfolio")}>Clone plan</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ── Event drawer (ff / mh / ca) ───────────────────────────────────────── */
function EventDrawer({ fx, id }: DrawerProps) {
  const eid: EventId = id === "mh" || id === "ca" ? id : "ff";
  const e = EVENTS[eid];
  const p = PORTFOLIO.find(x => x.id === eid) || PORTFOLIO[0];
  const k = KPIS[eid];
  return (
    <Drawer fx={fx} eyebrow="EVENT" title={e.name}
      badges={<><Status s={e.status} /><EventTag id={eid} />{eid !== "ca" && <Badge tone="ghost">{DAYS_TO_DOORS} days to doors</Badge>}</>}
      actions={eid === "ca"
        ? <ActBtn fx={fx} k="canada-decisions" label="Send decisions to Nikki" doneLabel="Sent to Nikki" toast="6 localisation decisions sent to Nikki for review" />
        : <><Btn kind="ghost" onClick={() => { fx.close(); fx.goTo("Events", "timeline"); }}>Timeline</Btn><Btn kind="primary" onClick={() => { fx.close(); fx.goTo("Events", "runofshow"); }}>Run of show</Btn></>}>
      <Sec title="OVERVIEW">
        <KV items={[["Venue", e.venue], ["Dates", e.dates], ["Overall readiness", p.overall + "%"], ["Event readiness", k.readiness + "%"]]} />
      </Sec>
      {eid === "ca" ? (
        <>
          <Sec title="CLONED FROM FUTURE FERTILITY DUBLIN">
            {CANADA.cloned.map(([l, n, t]) => <Meter key={l} label={l} value={n} max={t} color={evColor("ca")} right={`${n}/${t}`} />)}
          </Sec>
          <Sec title="LOCALISATION DECISIONS">
            {CANADA.decisions.map(([d, s]) => (
              <div key={d} style={rowLine}>
                <span style={{ flex: 1, fontSize: 12.5, color: "var(--ink)" }}>{d}</span>
                <span style={{ ...small, flex: 2, ...ellipsis }}>{(DECISION_NOTES[d] || [""])[0]}</span>
                {fx.acted["canada-decisions"] ? <Badge tone="warn">With Nikki</Badge> : <Status s={s} />}
              </div>
            ))}
          </Sec>
          <Sec title="NOTE"><Note tone="accent">Dublin is no longer a pile of processes. It is a repeatable operating model.</Note></Sec>
        </>
      ) : (
        <>
          <Sec title="WORKSTREAMS">
            {WORKSTREAMS.map(w => (
              <button key={w.k} style={{ ...plainBtn, display: "block" }} onClick={() => goWorkstream(fx, eid, w.page, w.tab)}>
                <Meter label={`${w.label} · ${w.mod}`} value={p[w.k]} color={evColor(eid)} />
              </button>
            ))}
          </Sec>
          <Sec title="KEY NUMBERS">
            <KV cols={3} items={[
              ["Contracted", eurK(k.contracted)], ["Collected", eurK(k.collected)], ["Overdue", eur(k.overdue)],
              ["Exhibitors", k.exhibitors], ["Stage slots", `${PROGRAMME[eid].confirmed}/${PROGRAMME[eid].slots}`], ["Pipeline", eurK(k.pipeline)],
            ]} />
          </Sec>
          <Sec title="WATCH LIST"><WatchList fx={fx} filter={eid} /></Sec>
        </>
      )}
    </Drawer>
  );
}

/* ── Module entry ──────────────────────────────────────────────────────── */
export default function Events({ fx }: ModuleProps) {
  switch (fx.tab) {
    case "timeline": return <Timeline fx={fx} />;
    case "staff": return <Staff fx={fx} />;
    case "suppliers": return <Suppliers fx={fx} />;
    case "venue": return <Venue fx={fx} />;
    case "runofshow": return <RunOfShow fx={fx} />;
    default: return <Portfolio fx={fx} />;
  }
}

export const drawers: Record<string, (p: DrawerProps) => JSX.Element> = {
  supplier: (p) => <SupplierDrawer {...p} />,
  shift: (p) => <ShiftDrawer {...p} />,
  event: (p) => <EventDrawer {...p} />,
};
