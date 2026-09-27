/* Top-bar tabs for each Future module. PulseLogic builds contextNav from this. */
export const FX_TABS: Record<string, [string, string][]> = {
  Sales: [["overview", "Overview"], ["pipeline", "Pipeline"], ["deals", "Deals"], ["contracts", "Contracts"], ["inventory", "Inventory"], ["forecast", "Forecast"]],
  Exhibitors: [["overview", "Overview"], ["onboarding", "Onboarding"], ["fulfilment", "Fulfilment"], ["floorplan", "Floor Plan"], ["assets", "Assets"], ["readiness", "Readiness"]],
  Finance: [["overview", "Overview"], ["invoices", "Invoices"], ["payments", "Payments"], ["debtors", "Debtors"], ["reconciliation", "Reconciliation"], ["forecast", "Forecast"]],
  Events: [["portfolio", "Portfolio"], ["timeline", "Timeline"], ["staff", "Staff"], ["suppliers", "Suppliers"], ["venue", "Venue"], ["runofshow", "Run of Show"]],
  Production: [["overview", "Overview"], ["speakers", "Speakers"], ["programme", "Programme"], ["rooms", "Content Rooms"], ["presentations", "Presentations"], ["av", "AV Handover"]],
  Growth: [["overview", "Overview"], ["audience", "Audience"], ["campaigns", "Campaigns"], ["content", "Content"], ["affiliates", "Affiliates"], ["partners", "Partners"]],
};

/* Context hint shown in the top bar for each module. */
export const FX_HINTS: Record<string, string> = {
  Sales: "COMMERCIAL · DUBLIN 2027",
  Exhibitors: "87 CONFIRMED · 76% PLACED",
  Finance: "XERO SYNC · HEALTHY",
  Events: "13–14 MARCH 2027 · RDS",
  Production: "14 DECKS OUTSTANDING",
  Growth: "25,438 KNOWN AUDIENCE",
};
