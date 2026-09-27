import type { EventFilter } from "./data";

export type FxPageId = "Sales" | "Exhibitors" | "Finance" | "Events" | "Production" | "Growth";

export type DrawerRef = { kind: string; id: string };

/** Shared demo state and navigation, handed to every Future module as `fx`.
    Held in PulseLogic so the top-bar tabs, Home and drawers all agree. */
export interface Fx {
  page: string;
  /** Active top-bar tab id for the current module page. */
  tab: string;
  event: EventFilter;
  setEvent(e: EventFilter): void;
  /** Jump to any page (and tab), optionally opening a drawer on arrival. */
  goTo(page: string, tab?: string, drawer?: DrawerRef): void;
  open(kind: string, id: string): void;
  close(): void;
  drawer: DrawerRef | null;
  /** Demo actions already taken (reminder sent, match approved…). */
  acted: Record<string, boolean>;
  act(key: string, toast?: string): void;
  toast(msg: string): void;
}

export type ModuleProps = { fx: Fx };
export type DrawerProps = { fx: Fx; id: string };
