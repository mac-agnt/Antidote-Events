/* Home right-rail widgets for Future Events: today's priorities and the AI briefing.
   The Home centre column stays clean; these live in the widget rail. */
import type { Fx } from "./types";
import { BRIEFING_TEXT, NOVA, PEAK, PROGRAMME, CANADA, eur } from "./data";
import { Badge, Btn, Icon, PATHS } from "./ui";

const card = {
  background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--card-r,18px)",
  boxShadow: "var(--card-shadow)", padding: "18px 20px 12px",
} as const;

function Remove({ onRemove }: { onRemove?: () => void }) {
  if (!onRemove) return null;
  return (
    <button onClick={onRemove} title="Remove widget" className="fx-x" style={{ width: 24, height: 24 }}>
      <Icon d={PATHS.close} size={10} sw={2.4} />
    </button>
  );
}

export function PrioritiesWidget({ fx, onRemove }: { fx: Fx; onRemove?: () => void }) {
  const items = [
    {
      key: "nova", tone: "bad" as const, title: NOVA.company, sub: "Deposit overdue",
      meta: `${eur(NOVA.deposit)} · ${NOVA.daysOverdue} days overdue`, done: fx.acted["chase-nova"], doneText: "Reminder #3 sent",
      cta: "Review account", run: () => fx.goTo("Finance", "invoices", { kind: "invoice", id: "i-nova-1" }),
    },
    {
      key: "peak", tone: "warn" as const, title: PEAK.company, sub: "Exhibitor assets incomplete",
      meta: "Missing: " + PEAK.missing.join(", "), done: fx.acted["remind-peak"], doneText: "Reminder sent",
      cta: "Send reminder", run: () => fx.act("remind-peak", "Reminder sent to Ellen Farrow at Peak Health Labs: logo SVG, speaker headshot"),
    },
    {
      key: "mh", tone: "warn" as const, title: "Future Men's Health", sub: `${PROGRAMME.mh.open} stage slots still unassigned`,
      meta: `${PROGRAMME.mh.confirmed} of ${PROGRAMME.mh.slots} confirmed`, done: fx.acted["fill-mh-slots"], doneText: "Suggestions sent",
      cta: "Open programme", run: () => { fx.setEvent("mh"); fx.goTo("Production", "programme"); },
    },
    {
      key: "brennan", tone: "bad" as const, title: "Dr Aoife Brennan", sub: "Presentation overdue",
      meta: "AV handover blocked", done: fx.acted["nudge-brennan"], doneText: "Nudge sent",
      cta: "Review production", run: () => fx.goTo("Production", "presentations", { kind: "speaker", id: "s-brennan" }),
    },
    {
      key: "canada", tone: "ca" as const, title: "Canada Pilot", sub: `${CANADA.cloned[0][1]} workflows cloned`,
      meta: `${CANADA.decisions.length} localisation decisions outstanding`, done: fx.acted["canada-decisions"], doneText: "Sent for review",
      cta: "View rollout", run: () => { fx.setEvent("ca"); fx.goTo("Events", "portfolio"); },
    },
  ];
  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>Today's priorities</div>
        <span style={{ height: 24, display: "flex", alignItems: "center", padding: "0 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 999, fontSize: 11, color: "var(--dim)" }}>
          {items.filter(i => !i.done).length}
        </span>
        <Remove onRemove={onRemove} />
      </div>
      <div style={{ marginTop: 8 }}>
        {items.map((it, n) => (
          <div key={it.key} onClick={it.run} style={{ display: "flex", gap: 11, padding: "11px 0", borderTop: "1px solid var(--border)", cursor: "pointer", opacity: it.done ? 0.62 : 1 }}>
            <span style={{ flex: "none", width: 18, height: 18, marginTop: 1, borderRadius: 6, fontSize: 10.5, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center",
              background: it.done ? "var(--ok-soft)" : `var(--${it.tone === "ca" ? "ev-ca" : it.tone}-soft)`, color: it.done ? "var(--ok)" : `var(--${it.tone === "ca" ? "ev-ca" : it.tone})` }}>
              {it.done ? <Icon d={PATHS.check} size={10} sw={2.8} /> : n + 1}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{it.title}</div>
              <div style={{ fontSize: 12, color: "var(--body)", marginTop: 1 }}>{it.sub}</div>
              <div style={{ fontSize: 11.5, color: "var(--dim)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.done ? it.doneText : it.meta}</div>
            </div>
            <span style={{ flex: "none", alignSelf: "center" }}>
              <Btn size="sm" kind={n === 0 ? "primary" : undefined} onClick={it.run}>{it.cta}</Btn>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BriefingWidget({ fx, onRemove, ask }: { fx: Fx; onRemove?: () => void; ask?: (q: string) => void }) {
  const [hello, ...lines] = BRIEFING_TEXT;
  const overnight = lines[lines.length - 1];
  return (
    <div style={{ ...card, background: "linear-gradient(160deg,var(--accent-faint),transparent 60%),var(--surface)", borderColor: "var(--accent-line)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <span style={{ width: 24, height: 24, borderRadius: 999, background: "var(--accent-soft)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon d={PATHS.spark} size={12} sw={2} />
        </span>
        <div style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>Morning briefing</div>
        <Badge tone="accent">07:00</Badge>
        <Remove onRemove={onRemove} />
      </div>
      <div style={{ marginTop: 12, fontSize: 13, lineHeight: 1.55, color: "var(--body)" }}>
        <div style={{ color: "var(--ink)", fontWeight: 500 }}>{hello}</div>
        {lines.slice(0, -1).map(l => <p key={l} style={{ margin: "7px 0 0" }}>{l}</p>)}
        <div style={{ marginTop: 10, padding: "9px 11px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--border)", fontSize: 12, color: "var(--dim)", lineHeight: 1.5 }}>
          <span style={{ color: "var(--ok)", fontWeight: 600 }}>Done overnight · </span>{overnight.replace(/^I have automatically /, "Automatically ")}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "12px 0 6px" }}>
        <Btn size="sm" onClick={() => ask?.("Who do I need to chase for money?")}>Who owes us?</Btn>
        <Btn size="sm" onClick={() => fx.goTo("Agents")}>Open agents</Btn>
      </div>
    </div>
  );
}
