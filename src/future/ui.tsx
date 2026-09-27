/* Shared building blocks for the Future modules. Styling lives in styles/future.css. */
import { Fragment, useEffect, type CSSProperties, type ReactNode } from "react";
import { EVENTS, EVENT_OPTIONS, type EventFilter, type EventId, type Step } from "./data";
import type { Fx } from "./types";

export const evColor = (id: EventId) => `var(--ev-${id})`;
export const evSoft = (id: EventId) => `var(--ev-${id}-soft)`;
/** True when a record belongs to the selected event (or "all"). */
export const inEvent = (f: EventFilter, id: EventId | "both") => f === "all" || id === f || id === "both";

/* ── Icons (stroke paths, 24×24) ───────────────────────────────────────── */
export const PATHS = {
  arrow: "M5 12h14 M13 6l6 6-6 6",
  close: "M6 6l12 12 M18 6 6 18",
  check: "M5 12.5l4.2 4.2L19 7",
  alert: "M12 8v5 M12 16.5v.01 M10.3 3.9 2.6 17.4A2 2 0 0 0 4.3 20.4h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z",
  dot: "M12 12h.01",
  clock: "M12 7v5l3 2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  mail: "M4 6h16v12H4z M4 7l8 6 8-6",
  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1 M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  doc: "M6.4 3.6h7.4l4.2 4.2v12.6H6.4V3.6Z M13.4 3.8v4.2h4.2 M9 12.4h6 M9 16h4",
  euro: "M17 6.5A6.5 6.5 0 1 0 17 17.5 M4 10.5h9 M4 13.5h9",
  stand: "M4 20V9l8-5 8 5v11 M9 20v-6h6v6",
  mic: "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z M5.5 11.5a6.5 6.5 0 0 0 13 0 M12 18v3",
  spark: "M12 3v4 M12 17v4 M3 12h4 M17 12h4 M6 6l2.5 2.5 M15.5 15.5 18 18 M6 18l2.5-2.5 M15.5 8.5 18 6",
  whatsapp: "M20 11.6a8.2 8.2 0 0 1-12 7.2L4 20l1.3-3.8A8.2 8.2 0 1 1 20 11.6Z",
  plus: "M12 5v14 M5 12h14",
  filter: "M4 6h16 M7 12h10 M10 18h4",
  users: "M9 12a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 9 12Z M2.6 19.6c.8-2.8 3.2-4.4 6.4-4.4s5.6 1.6 6.4 4.4 M16.5 12.5a2.6 2.6 0 1 0 0-5.2 M17 15.4c2.2.4 3.7 1.8 4.3 4.2",
  flow: "M6 5.5a2 2 0 1 0 0 .01 M18 12a2 2 0 1 0 0 .01 M6 18.5a2 2 0 1 0 0 .01 M8 5.5h4a4 4 0 0 1 4 4v.5 M8 18.5h4a4 4 0 0 0 4-4V14",
  play: "M8 5.5v13l10.5-6.5L8 5.5Z",
  sync: "M20 11a8 8 0 0 0-14.6-4.5L4 8 M4 13a8 8 0 0 0 14.6 4.5L20 16 M4 4v4h4 M20 20v-4h-4",
};
export function Icon({ d, size = 14, sw = 1.9, style }: { d: string; size?: number; sw?: number; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}
      strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none", ...style }}>
      <path d={d} />
    </svg>
  );
}

/* ── Page frame ────────────────────────────────────────────────────────── */
export function Page({ children }: { children: ReactNode }) {
  return <div className="fx-page">{children}</div>;
}

export function PageHead({ title, sub, fx, right, switcher = true, options }: {
  title: string; sub?: string; fx?: Fx; right?: ReactNode; switcher?: boolean; options?: EventFilter[];
}) {
  return (
    <div className="fx-head">
      <div className="fx-grow">
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {right}
      {switcher && fx && <EventSwitch fx={fx} options={options} />}
    </div>
  );
}

export function EventSwitch({ fx, options }: { fx: Fx; options?: EventFilter[] }) {
  const list = EVENT_OPTIONS.filter(o => !options || options.includes(o.id));
  return (
    <div className="fx-switch" role="tablist" aria-label="Event">
      {list.map(o => (
        <button key={o.id} data-on={fx.event === o.id ? "1" : "0"} onClick={() => fx.setEvent(o.id)} role="tab" aria-selected={fx.event === o.id}>
          <span className="fx-dot" style={{ background: o.id === "all" ? "var(--dim)" : evColor(o.id as EventId) }} />
          {o.label}
          {o.tag && <span className="fx-tag">{o.tag}</span>}
        </button>
      ))}
    </div>
  );
}

/* ── Cards / KPIs ──────────────────────────────────────────────────────── */
export function Card({ title, sub, right, children, pad = true, style, className }: {
  title?: ReactNode; sub?: ReactNode; right?: ReactNode; children?: ReactNode; pad?: boolean; style?: CSSProperties; className?: string;
}) {
  return (
    <div className={"fx-card" + (className ? " " + className : "")} style={style}>
      {(title || right) && (
        <div className="fx-card-h">
          {title && <h3>{title}</h3>}
          {sub && <span className="fx-sub">{sub}</span>}
          <span className="fx-grow" />
          {right}
        </div>
      )}
      {pad ? <div className="fx-card-b">{children}</div> : children}
    </div>
  );
}

export type KpiItem = { label: string; value: ReactNode; sub?: ReactNode; tone?: "ok" | "warn" | "bad"; onClick?: () => void; color?: string };
export function Kpis({ items, min = 150 }: { items: KpiItem[]; min?: number }) {
  return (
    <div className="fx-kpis" style={{ gridTemplateColumns: `repeat(auto-fit,minmax(${min}px,1fr))` }}>
      {items.map((k, i) => (
        <div key={i} className="fx-kpi" data-tone={k.tone} data-click={k.onClick ? "1" : undefined} onClick={k.onClick}>
          {k.color && <span style={{ position: "absolute", left: 0, top: 14, bottom: 14, width: 2, borderRadius: 2, background: k.color }} />}
          <div className="l">{k.label}</div>
          <div className="v">{k.value}</div>
          {k.sub && <div className="s">{k.sub}</div>}
        </div>
      ))}
    </div>
  );
}

/* ── Badges / tags / buttons ───────────────────────────────────────────── */
export type Tone = "ok" | "warn" | "bad" | "accent" | "ff" | "mh" | "ca" | "info" | "ghost" | undefined;
export function Badge({ tone, children, style }: { tone?: Tone; children: ReactNode; style?: CSSProperties }) {
  return <span className="fx-badge" data-tone={tone} style={style}>{children}</span>;
}
export function EventTag({ id, short = true }: { id: EventId | "both"; short?: boolean }) {
  if (id === "both") return <Badge tone="ghost">Both events</Badge>;
  return <Badge tone={id}>{short ? EVENTS[id].short : EVENTS[id].name}</Badge>;
}
/** Maps common status words to a badge tone. */
export function toneOf(s: string): Tone {
  const k = s.toLowerCase();
  if (/(overdue|blocked|blocking|missing|lost|failed|conflict|critical|at risk!)/.test(k)) return "bad";
  if (/(risk|pending|waiting|chasing|draft|review|attention|outstanding|sent|viewed|requested|in progress|formatting|needs|scheduled|match)/.test(k)) return "warn";
  if (/(paid|ready|complete|done|signed|won|confirmed|approved|healthy|on track|received|connected|live|active|av ready|matched)/.test(k)) return "ok";
  if (/(planning|tbd)/.test(k)) return "ca";
  return undefined;
}
export function Status({ s }: { s: string }) {
  return <Badge tone={toneOf(s)}>{s}</Badge>;
}

export function Btn({ children, onClick, kind, size, icon, title, disabled }: {
  children?: ReactNode; onClick?: () => void; kind?: "primary" | "ghost" | "done"; size?: "sm"; icon?: string; title?: string; disabled?: boolean;
}) {
  return (
    <button className="fx-btn" data-kind={kind} data-size={size} onClick={(e) => { e.stopPropagation(); if (!disabled) onClick?.(); }} title={title} disabled={disabled}>
      {icon && <Icon d={icon} size={size === "sm" ? 12 : 13} />}
      {children}
    </button>
  );
}
/** A one-shot demo action: shows as done once taken. */
export function ActBtn({ fx, k, label, doneLabel, toast, kind = "primary", size }: {
  fx: Fx; k: string; label: string; doneLabel: string; toast?: string; kind?: "primary" | "ghost"; size?: "sm";
}) {
  const done = !!fx.acted[k];
  return done
    ? <Btn kind="done" size={size} icon={PATHS.check}>{doneLabel}</Btn>
    : <Btn kind={kind} size={size} onClick={() => fx.act(k, toast)}>{label}</Btn>;
}

export function Avatar({ name, size = 26, bg }: { name: string; size?: number; bg?: string }) {
  const initials = name.replace(/^Dr /, "").split(" ").map(w => w[0]).slice(0, 2).join("");
  return (
    <span style={{ width: size, height: size, flex: "none", borderRadius: 999, background: bg || "var(--surface-2)", border: "1px solid var(--border)",
      color: bg ? "#141414" : "var(--body)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.36, fontWeight: 600 }}>
      {initials}
    </span>
  );
}

/* ── Bars / steps ──────────────────────────────────────────────────────── */
export function Bar({ value, max = 100, color = "var(--accent)", height = 6, style }: { value: number; max?: number; color?: string; height?: number; style?: CSSProperties }) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));
  return <span className="fx-bar" style={{ height, ...style }}><i style={{ width: pct + "%", background: color }} /></span>;
}
export function Meter({ label, value, max = 100, color, right }: { label: ReactNode; value: number; max?: number; color?: string; right?: ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.3fr) minmax(0,2fr) auto", alignItems: "center", gap: 12, padding: "7px 0" }}>
      <span style={{ fontSize: 12.5, color: "var(--body)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
      <Bar value={value} max={max} color={color} />
      <span style={{ fontSize: 12, color: "var(--dim)", fontVariantNumeric: "tabular-nums", minWidth: 44, textAlign: "right" }}>{right ?? Math.round((value / max) * 100) + "%"}</span>
    </div>
  );
}
export function StepDot({ s, title }: { s: Step; title?: string }) {
  const d = s === "done" ? PATHS.check : s === "missing" ? PATHS.close : s === "pending" ? PATHS.clock : "M7 12h10";
  return <span className="fx-stepdot" data-s={s} title={title}><Icon d={d} size={11} sw={2.4} /></span>;
}

/* ── Tables ────────────────────────────────────────────────────────────── */
export type Col<T> = { k: string; label: ReactNode; w?: string; align?: "right" | "left"; render?: (row: T) => ReactNode };
export function Table<T>({ cols, rows, onRow, highlight, empty }: {
  cols: Col<T>[]; rows: T[]; onRow?: (row: T) => void; highlight?: (row: T) => boolean; empty?: string;
}) {
  const grid = cols.map(c => c.w || "1fr").join(" ");
  return (
    <div className="fx-table" role="table">
      <div className="fx-tr fx-th" style={{ gridTemplateColumns: grid }} role="row">
        {cols.map(c => <div key={c.k} style={{ textAlign: c.align }}>{c.label}</div>)}
      </div>
      {rows.map((r, i) => (
        <div key={i} className="fx-tr" role="row" style={{ gridTemplateColumns: grid }}
          data-click={onRow ? "1" : undefined} data-hl={highlight && highlight(r) ? "1" : undefined}
          onClick={onRow ? () => onRow(r) : undefined}>
          {cols.map(c => (
            <div key={c.k} style={{ textAlign: c.align }} className={c.align === "right" ? "fx-num" : undefined}>
              {c.render ? c.render(r) : String((r as Record<string, unknown>)[c.k] ?? "")}
            </div>
          ))}
        </div>
      ))}
      {rows.length === 0 && <div className="fx-tr" style={{ gridTemplateColumns: "1fr", color: "var(--faint)" }}>{empty || "Nothing matches this filter."}</div>}
    </div>
  );
}

/* ── Chips ─────────────────────────────────────────────────────────────── */
export function Chips<T extends string>({ options, value, onChange }: { options: [T, string][]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="fx-chips">
      {options.map(([id, label]) => (
        <button key={id} className="fx-chip" data-on={value === id ? "1" : "0"} onClick={() => onChange(id)}>{label}</button>
      ))}
    </div>
  );
}

/* ── Drawer ────────────────────────────────────────────────────────────── */
export function Drawer({ fx, eyebrow, title, badges, children, actions, width }: {
  fx: Fx; eyebrow?: ReactNode; title: ReactNode; badges?: ReactNode; children: ReactNode; actions?: ReactNode; width?: number;
}) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") fx.close(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [fx]);
  return (
    <div className="fx-scrim" onClick={fx.close}>
      <div className="fx-drawer" style={width ? { width: `min(${width}px,100%)` } : undefined} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="fx-drawer-h">
          <div className="fx-grow">
            {eyebrow && <div className="e">{eyebrow}</div>}
            <h2>{title}</h2>
            {badges && <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 9 }}>{badges}</div>}
          </div>
          <button className="fx-x" onClick={fx.close} aria-label="Close"><Icon d={PATHS.close} size={12} sw={2.4} /></button>
        </div>
        <div className="fx-drawer-b">{children}</div>
        {actions && <div style={{ flex: "none", display: "flex", gap: 8, justifyContent: "flex-end", padding: "14px 24px", borderTop: "1px solid var(--border)" }}>{actions}</div>}
      </div>
    </div>
  );
}
export function Sec({ title, right, children }: { title: ReactNode; right?: ReactNode; children: ReactNode }) {
  return (
    <div className="fx-sec">
      <div className="fx-sec-t">{title}<span className="fx-grow" />{right}</div>
      {children}
    </div>
  );
}
export function KV({ items, cols = 2 }: { items: [ReactNode, ReactNode][]; cols?: number }) {
  return (
    <div className="fx-kv" style={{ gridTemplateColumns: `repeat(${cols},minmax(0,1fr))` }}>
      {items.map(([k, v], i) => <div key={i}><div className="k">{k}</div><div className="v">{v}</div></div>)}
    </div>
  );
}
export function Note({ tone, children }: { tone?: "accent" | "warn" | "bad"; children: ReactNode }) {
  return <div className="fx-note" data-tone={tone}>{children}</div>;
}

/** The connected-record strip: one record, every place it lives. */
export function Flow({ nodes }: { nodes: { t: string; h: ReactNode; d?: ReactNode; go?: () => void }[] }) {
  return (
    <div className="fx-flow">
      {nodes.map((n, i) => (
        <button key={i} className="fx-flow-n" onClick={n.go} disabled={!n.go} style={n.go ? undefined : { cursor: "default" }}>
          <div className="t">{n.t}</div>
          <div className="h">{n.h}</div>
          {n.d && <div className="d">{n.d}</div>}
        </button>
      ))}
    </div>
  );
}

/* ── Charts (inline SVG, theme-aware) ──────────────────────────────────── */
export type Series = { name: string; color: string; values: (number | null)[]; dashed?: boolean; area?: boolean };
export function LineChart({ labels, series, height = 200, fmt = (n: number) => String(n), max: maxIn }: {
  labels: string[]; series: Series[]; height?: number; fmt?: (n: number) => string; max?: number;
}) {
  const W = 640, H = height, pl = 44, pr = 12, pt = 12, pb = 26;
  const all = series.flatMap(s => s.values.filter((v): v is number => v != null));
  const max = maxIn ?? Math.max(1, ...all) * 1.08;
  const x = (i: number) => pl + (i * (W - pl - pr)) / Math.max(1, labels.length - 1);
  const y = (v: number) => pt + (1 - v / max) * (H - pt - pb);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => t * max);
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" style={{ display: "block", overflow: "visible" }}>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={pl} x2={W - pr} y1={y(t)} y2={y(t)} stroke="var(--border)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <text x={pl - 8} y={y(t) + 3.5} textAnchor="end" fontSize="10" fill="var(--faint)">{fmt(Math.round(t))}</text>
          </g>
        ))}
        {labels.map((l, i) => <text key={l + i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="10.5" fill="var(--faint)">{l}</text>)}
        {series.map((s, si) => {
          const pts = s.values.map((v, i) => (v == null ? null : [x(i), y(v)] as [number, number])).filter((p): p is [number, number] => !!p);
          if (!pts.length) return null;
          const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
          return (
            <g key={si}>
              {s.area && <path d={d + ` L${pts[pts.length - 1][0]} ${H - pb} L${pts[0][0]} ${H - pb} Z`} fill={s.color} opacity=".12" />}
              <path d={d} fill="none" stroke={s.color} strokeWidth="2" strokeDasharray={s.dashed ? "5 5" : undefined} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
              {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="2.6" fill={s.color} />)}
            </g>
          );
        })}
      </svg>
      <Legend items={series.map(s => [s.name, s.color, s.dashed])} />
    </div>
  );
}
export function Legend({ items }: { items: [string, string, boolean?][] }) {
  return (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 8 }}>
      {items.map(([n, c, dashed]) => (
        <span key={n} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--dim)" }}>
          <span style={{ width: 14, height: 0, borderTop: `2px ${dashed ? "dashed" : "solid"} ${c}` }} />{n}
        </span>
      ))}
    </div>
  );
}
/** Grouped or stacked vertical bars. */
export function BarChart({ labels, series, height = 180, stacked = false, fmt = (n: number) => String(n) }: {
  labels: string[]; series: { name: string; color: string; values: number[] }[]; height?: number; stacked?: boolean; fmt?: (n: number) => string;
}) {
  const totals = labels.map((_, i) => stacked ? series.reduce((a, s) => a + s.values[i], 0) : Math.max(...series.map(s => s.values[i])));
  const max = Math.max(1, ...totals) * 1.1;
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${labels.length},1fr)`, gap: 10, alignItems: "end", height }}>
        {labels.map((l, i) => (
          <div key={l} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
            <span style={{ fontSize: 10.5, color: "var(--dim)", fontVariantNumeric: "tabular-nums" }}>{fmt(totals[i])}</span>
            <div style={{ width: "100%", maxWidth: 46, display: "flex", flexDirection: stacked ? "column-reverse" : "row", alignItems: "flex-end", gap: stacked ? 1 : 3, height: `${(totals[i] / max) * 100}%` }}>
              {series.map(s => (
                <span key={s.name} style={{ display: "block", flex: stacked ? `0 0 ${(s.values[i] / Math.max(1, totals[i])) * 100}%` : 1,
                  height: stacked ? undefined : `${(s.values[i] / Math.max(1, totals[i])) * 100}%`, background: s.color, borderRadius: 4, minHeight: 2 }} />
              ))}
            </div>
            <span style={{ fontSize: 10.5, color: "var(--faint)" }}>{l}</span>
          </div>
        ))}
      </div>
      {series.length > 1 && <Legend items={series.map(s => [s.name, s.color])} />}
    </div>
  );
}
export function Donut({ segments, size = 120, thickness = 14, center }: {
  segments: { label: string; value: number; color: string }[]; size?: number; thickness?: number; center?: ReactNode;
}) {
  const total = Math.max(1, segments.reduce((a, s) => a + s.value, 0));
  const r = (size - thickness) / 2, c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div style={{ position: "relative", width: size, height: size, flex: "none" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--track)" strokeWidth={thickness} />
        {segments.map((s, i) => {
          const len = (s.value / total) * c;
          const el = <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={thickness}
            strokeDasharray={`${Math.max(0, len - 2)} ${c}`} strokeDashoffset={-acc} strokeLinecap="butt" />;
          acc += len;
          return el;
        })}
      </svg>
      {center && <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>{center}</div>}
    </div>
  );
}

/** Small labelled figure used inside cards. */
export function Fig({ label, value, sub, color }: { label: ReactNode; value: ReactNode; sub?: ReactNode; color?: string }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 11, color: "var(--faint)" }}>{label}</div>
      <div style={{ marginTop: 3, fontSize: 18, fontWeight: 600, letterSpacing: "-.4px", color: color || "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--dim)", marginTop: 1 }}>{sub}</div>}
    </div>
  );
}

export function Row({ children, gap = 10, style }: { children: ReactNode; gap?: number; style?: CSSProperties }) {
  return <div style={{ display: "flex", alignItems: "center", gap, minWidth: 0, ...style }}>{children}</div>;
}

export { Fragment };
