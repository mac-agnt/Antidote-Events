/* Mounts the Future modules, their drawers and the toast. AppShell renders these. */
import type { Fx } from "./types";
import Sales, { drawers as salesDrawers } from "./modules/Sales";
import Exhibitors, { drawers as exhibitorDrawers } from "./modules/Exhibitors";
import Finance, { drawers as financeDrawers } from "./modules/Finance";
import Events, { drawers as eventDrawers } from "./modules/Events";
import Production, { drawers as productionDrawers } from "./modules/Production";
import Growth, { drawers as growthDrawers } from "./modules/Growth";
import { Icon, PATHS } from "./ui";

const PAGES = { Sales, Exhibitors, Finance, Events, Production, Growth } as const;
const DRAWERS = { ...salesDrawers, ...exhibitorDrawers, ...financeDrawers, ...eventDrawers, ...productionDrawers, ...growthDrawers };

export function FxPage({ fx }: { fx: Fx }) {
  if (!fx) return null;
  const P = PAGES[fx.page as keyof typeof PAGES];
  return P ? <P fx={fx} key={fx.page + ":" + fx.tab} /> : null;
}

export function FxOverlays({ fx, toast }: { fx: Fx; toast: string | null }) {
  if (!fx) return null;
  const D = fx.drawer ? DRAWERS[fx.drawer.kind] : undefined;
  return (
    <>
      {D && fx.drawer && <D fx={fx} id={fx.drawer.id} />}
      {toast && (
        <div className="fx-toast" role="status">
          <span style={{ width: 22, height: 22, borderRadius: 999, background: "var(--ok-soft)", color: "var(--ok)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon d={PATHS.check} size={12} sw={2.6} />
          </span>
          {toast}
        </div>
      )}
    </>
  );
}
