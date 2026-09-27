# Pulse — Harbour

Pulse, re-skinned as the operating system for **Antidote Events / Future Events** (Nikki Dwyer): Future Fertility and Future Men's Health, RDS Dublin, 13–14 March 2027, plus the Future Fertility Canada Pilot.

Every page, theme and interaction from the design is here. Screens were checked against the original mockup and match pixel for pixel at 1440×900 and 1024×720.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
```

## What's in it

| Area | Where |
| --- | --- |
| Pages: Home (chat), Agents, Dashboard, Work, Records, Activity, Settings | `src/views/pages/` |
| Overlays: ⌘K palette, agent studio, Helios mini chat, work viewer, new record, background gallery | `src/views/overlays/` |
| App frame: sidebar, top bar, notifications | `src/views/AppShell.tsx` |
| State and behaviour | `src/logic/PulseLogic.js` |
| Core demo data (agents, chat, work, activity, settings) | `src/logic/data.js` |
| Future modules: Sales, Exhibitors, Finance, Events, Production, Growth | `src/future/modules/` |
| Shared story data (Nova, Peak, Brennan, programme, Canada, audience) | `src/future/data.ts` |
| Module UI kit and styles | `src/future/ui.tsx`, `src/styles/future.css` |
| Agent avatar | `src/components/AgentFace.tsx` |
| Theme tokens (Harbour, light and 11 more), animations | `src/styles/pulse.css` (Future theme in `src/styles/future.css`) |

## How it fits together

- **`PulseLogic`** holds all state. Its `renderVals()` returns one flat object `v`.
- **Views** are plain React components that render from `v`.
- **`LogicHost`** (`src/runtime/logic.tsx`) mounts the logic and re-renders on `setState`.
- **Backgrounds** live in `src/App.tsx`:
  - `dashboardBackdrop`: the colour of the Dashboard KPI background
  - `kpiBackdropOn`: whether that background shows
  - `recordsBackdrop`: the colour of the Records wash (`""` uses the theme gradient)
- **Customising for a client:** read `CLAUDE.md` first. It lists the layout rules every copy keeps.

## Updating from Claude Design

Export the new version, replace the file in `design/`, then run:

```bash
npm run import-design
```

This regenerates:

- `src/views/`
- `src/styles/pulse.css`
- `src/styles/interactions.css`
- `src/logic/`

`AgentFace` is hand-written and left alone. Commit before running, because it overwrites hand edits to those files.

## Fixed from the mockup

In the mockup, the work viewer's wrapper `<div>` was never closed. As a result, the ⌘K palette, agent studio, new record dialog and background gallery could only appear while the work viewer was open. They now open on their own. The fix is applied in `tools/import-design.mjs`.
