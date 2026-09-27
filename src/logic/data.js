/* Demo data and pure helpers for Pulse · Future Events (Antidote Events). Module data lives in src/future/data.ts. */

const INK="var(--ink)", BODY="var(--body)", DIM="var(--dim)", FAINT="var(--faint)";
const LIME="var(--accent)", GREEN="var(--ok)", AMBER="var(--warn)", RED="var(--bad)", NEUTRAL="var(--neutral)";
const MONO="var(--mono)";

const ICONS = {
  navSales:"M4 19.5h16 M6.5 16V11 M11 16V7.5 M15.5 16v-5.5 M20 5l-4.6 3.6-3.4-2.2L6 10",
  navExhibitors:"M3.5 20V9.5L12 4l8.5 5.5V20 M3.5 20h17 M8 20v-6.2h3.4V20 M12.6 20v-6.2H16V20 M8 10.6h8",
  navFinance:"M4.5 6.4h15A1.5 1.5 0 0 1 21 7.9v8.2a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16.1V7.9a1.5 1.5 0 0 1 1.5-1.5Z M3 10.2h18 M6.5 14.2h3.5",
  navEvents:"M7.5 3.5v3 M16.5 3.5v3 M4.5 8.8h15 M6.2 5.4h11.6A1.7 1.7 0 0 1 19.5 7.1v11.2A1.7 1.7 0 0 1 17.8 20H6.2a1.7 1.7 0 0 1-1.7-1.7V7.1a1.7 1.7 0 0 1 1.7-1.7Z M12 11.6l1.1 2.2 2.4.3-1.8 1.7.5 2.4-2.2-1.2-2.2 1.2.5-2.4-1.8-1.7 2.4-.3L12 11.6Z",
  navProduction:"M12 3.6a2.9 2.9 0 0 0-2.9 2.9v5.3a2.9 2.9 0 0 0 5.8 0V6.5A2.9 2.9 0 0 0 12 3.6Z M6 11.3a6 6 0 0 0 12 0 M12 17.3v3.1 M8.8 20.4h6.4",
  navGrowth:"M3.8 16.8l5.1-5.1 3.6 3.6 7.4-7.6 M14.6 7.7h5.3V13",
  navHome:"M12 3.2 3.6 9.1v10a1.5 1.5 0 0 0 1.5 1.5h13.8a1.5 1.5 0 0 0 1.5-1.5v-10L12 3.2Z M8.9 13.1h2l1-2.6 1.5 5 1.1-2.4h1.6",
  navAgents:"M12 2.4v2.3 M12 2.4a.9.9 0 1 0 0-.02 M8.2 6.5h7.6A2.2 2.2 0 0 1 18 8.7v5.1a2.2 2.2 0 0 1-2.2 2.2H8.2A2.2 2.2 0 0 1 6 13.8V8.7a2.2 2.2 0 0 1 2.2-2.2Z M9.9 10.6v1.4 M14.1 10.6v1.4 M6 10h-1.9 M18 10h1.9 M9.2 18.6h5.6 M9.2 21.2h5.6",
  navDash:"M4 5.6h7.2v5.1H4V5.6Z M13.6 5.6H20v8.6h-6.4V5.6Z M4 13.1h7.2v5.3H4v-5.3Z M13.6 16.6H20v1.8h-6.4v-1.8Z",
  navWork:"M9.4 4.4h5.2a1.4 1.4 0 0 1 1.4 1.4v1.1h2.4A1.6 1.6 0 0 1 20 8.5v9.1a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 17.6V8.5a1.6 1.6 0 0 1 1.6-1.6H8V5.8a1.4 1.4 0 0 1 1.4-1.4Z M8 6.9h8 M9.6 13.3l1.8 1.8 3.4-3.6",
  navRecords:"M12 3.6c3.9 0 7 1.1 7 2.5S15.9 8.6 12 8.6 5 7.5 5 6.1 8.1 3.6 12 3.6Z M5 6.1v5.7c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6.1 M5 11.8v5.7c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-5.7",
  navActivity:"M4.6 4.6h14.8A1.6 1.6 0 0 1 21 6.2v11.6a1.6 1.6 0 0 1-1.6 1.6H4.6A1.6 1.6 0 0 1 3 17.8V6.2a1.6 1.6 0 0 1 1.6-1.6Z M6 12.4h2.2l1.5-4.1 2.3 8 1.9-5.4 1.2 1.5H18",
  navAdmin:"M12 2.9 5 5.6v5.9c0 4 2.8 7.1 7 8.6 4.2-1.5 7-4.6 7-8.6V5.6L12 2.9Z M12 8.6a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z M8.8 16.3a3.6 3.6 0 0 1 6.4 0",
  helios:"M21 11.5a8.4 8.4 0 0 1-9 8.4 9.9 9.9 0 0 1-4-.8L3 21l1.9-4.9A8.3 8.3 0 0 1 4 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z M8 12h1.6l1.2-2.6 1.6 5 1.4-2.4H16",
  inbox:"M3 13h4l1.5 3h7l1.5-3h4 M3 13l2.4-7A2 2 0 0 1 7.3 4.6h9.4a2 2 0 0 1 1.9 1.4L21 13v4.4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V13Z",
  work:"M6 4.6h12a1.6 1.6 0 0 1 1.6 1.6v12.2A1.6 1.6 0 0 1 18 20H6a1.6 1.6 0 0 1-1.6-1.6V6.2A1.6 1.6 0 0 1 6 4.6Z M8.4 10.4l1.9 1.9 3.9-3.9 M8.4 15.6h7.2",
  approvals:"M12 3.6 19.5 6v6.1c0 4-3.1 6.9-7.5 8.3-4.4-1.4-7.5-4.3-7.5-8.3V6L12 3.6Z M9.2 12.2l2 2 3.6-3.7",
  insights:"M4.5 19.5V13 M9.7 19.5V7.5 M14.9 19.5v-8 M20 19.5V5",
  people:"M12 12.5a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z M5 20.2c.9-3.1 3.6-4.9 7-4.9s6.1 1.8 7 4.9",
  orgs:"M4.5 20V6.4A1.4 1.4 0 0 1 5.9 5h6.2a1.4 1.4 0 0 1 1.4 1.4V20 M13.5 10.5h4.6A1.4 1.4 0 0 1 19.5 12v8 M3 20h18 M7.5 8.5h2.5 M7.5 12h2.5 M7.5 15.5h2.5",
  teams:"M9 12a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 9 12Z M16.5 12.5a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z M2.6 19.6c.8-2.8 3.2-4.4 6.4-4.4s5.6 1.6 6.4 4.4 M17 15.4c2.2.4 3.7 1.8 4.3 4.2",
  locations:"M12 21s6.5-5.6 6.5-11a6.5 6.5 0 1 0-13 0C5.5 15.4 12 21 12 21Z M12 12.8a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z",
  visits:"M8 4v3 M16 4v3 M4.5 9.5h15 M6.4 6h11.2A1.9 1.9 0 0 1 19.5 8v10a1.9 1.9 0 0 1-1.9 1.9H6.4A1.9 1.9 0 0 1 4.5 18V8A1.9 1.9 0 0 1 6.4 6Z M9 13.5l1.6 1.6 3.4-3.4",
  autos:"M18.5 8.5A5 5 0 0 0 8.9 7.3 3.8 3.8 0 0 0 6 14.6 M8 17.5l3.2 3.2 M11.2 20.7l3.2-3.2 M11.2 20.7V9.6",
  health:"M3 12.5h3.4l2-5 3 10 2.2-5H21",
  modules:"M6.6 4.4h10.8a2.2 2.2 0 0 1 2.2 2.2v10.8a2.2 2.2 0 0 1-2.2 2.2H6.6a2.2 2.2 0 0 1-2.2-2.2V6.6a2.2 2.2 0 0 1 2.2-2.2Z M4.4 9.6h15.2 M9.6 19.6V9.6",
  agents:"M8.5 3.6h7A2.4 2.4 0 0 1 17.9 6v5.6a2.4 2.4 0 0 1-2.4 2.4h-7A2.4 2.4 0 0 1 6.1 11.6V6a2.4 2.4 0 0 1 2.4-2.4Z M9.6 8.2h.01 M14.4 8.2h.01 M12 14v2.6 M7.6 20.4h8.8 M12 16.6c-2.4 0-4.4 1.7-4.4 3.8h8.8c0-2.1-2-3.8-4.4-3.8Z",
  dash:"M4.4 4.4h6v6h-6v-6Z M13.6 4.4h6v3.6h-6V4.4Z M13.6 11.6h6v8h-6v-8Z M4.4 14h6v5.6h-6V14Z",
  files:"M5 7.2a1.8 1.8 0 0 1 1.8-1.8h3l1.8 2.2h5.6A1.8 1.8 0 0 1 19 9.4v7.4a1.8 1.8 0 0 1-1.8 1.8H6.8A1.8 1.8 0 0 1 5 16.8V7.2Z",
  pulseLine:"M2.5 12.5h3.6l2.1-6.4 3.2 12.2 2.6-8.4 1.8 2.6h5.7",
  records:"M6.4 3.6h7.4l4.2 4.2v12.6H6.4V3.6Z M13.4 3.8v4.2h4.2 M9 12.4h6 M9 16h4",
  tree:"M4.5 6h5 M4.5 12h5 M4.5 18h5 M12.5 6h7 M12.5 12h7 M12.5 18h7",
  graph:"M7 7.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z M17.6 10.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z M9.4 21.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z M8.6 6.4l7.6 2.6 M15.8 11.4l-5.6 5.2",
  bell:"M6 8.5a6 6 0 0 1 12 0c0 6.5 2.6 8.5 2.6 8.5H3.4S6 15 6 8.5Z M10.3 20.5a1.94 1.94 0 0 0 3.4 0"
};

/* Ontology stays first and is never removed (PulseLogic enforces this too). */
const REC_SECTIONS = [
  {id:"ontology", label:"Ontology", blurb:"How every record connects: companies, deals, invoices, stands, speakers and the paths between them."},
  {id:"files", label:"Files", blurb:"Contracts, floor plans, decks and invoices, indexed where Pulse can read them."},
  {id:"contacts", label:"Contacts", blurb:"Everyone Future Events deals with: team, exhibitors, sponsors, speakers and suppliers."},
  {id:"companies", label:"Companies", blurb:"Clinics, brands and partners across both events."},
  {id:"exhibitors", label:"Exhibitors", blurb:"Every exhibitor record created from a signed deal."},
  {id:"sponsors", label:"Sponsors", blurb:"Headline, stage and workshop sponsors with their entitlements."},
  {id:"speakers", label:"Speakers", blurb:"Speaker records, sessions and deck status."},
  {id:"events", label:"Events", blurb:"Future Fertility, Future Men's Health and the Canada Pilot."},
  {id:"sessions", label:"Sessions", blurb:"Every programme slot and who fills it."},
  {id:"stages", label:"Stages", blurb:"Stages, capacity and production readiness."},
  {id:"invoices", label:"Invoices", blurb:"Deposit and balance invoices generated from contracts."},
  {id:"contracts", label:"Contracts", blurb:"Standard contracts and the obligations they created."},
  {id:"suppliers", label:"Suppliers", blurb:"Builders, AV, security, venue and the rest of event week."},
  {id:"campaigns", label:"Campaigns", blurb:"Ticket, partner and affiliate campaigns."}
];

const CONTACTS = [
  ["Nikki Dwyer","Founder / Managing Director","nikki@futureevents.ie","Antidote Events","staff","var(--accent)"],
  ["Kathleen Corr","Head of Sales","kathleen@futureevents.ie","Antidote Events","staff","#EED7D3"],
  ["Robyn Walsh","Event Operations","robyn@futureevents.ie","Antidote Events","staff","#c9d6f5"],
  ["Sarah Keane","Production Manager","sarah@futureevents.ie","Antidote Events","staff","#f2c9c4"],
  ["Daniel Murray","Commercial Executive","daniel@futureevents.ie","Antidote Events","staff","#d6e4dc"],
  ["Amy Byrne","Marketing & Content","amy@futureevents.ie","Antidote Events","staff","#efe0c8"],
  ["Dr Aoife Brennan","Medical Director · speaker","aoife.brennan@novafertility.ie","Nova Fertility Clinic","speaker","#f2c9c4"],
  ["Ellen Farrow","Marketing Lead","ellen@peakhealthlabs.ie","Peak Health Labs","exhibitor","#c9d6f5"],
  ["Dr Hugh Tierney","Clinical Lead · speaker","hugh@peakhealthlabs.ie","Peak Health Labs","speaker","#c9d6f5"],
  ["Marta Klein","Partnerships Director","marta@eufertility.net","European Fertility Network","sponsor","#EED7D3"],
  ["Jamie Kerr","Founder","jamie@ferrorecovery.ie","Ferro Sports Recovery","exhibitor","#d6e4dc"],
  ["Grace Molloy","Affiliate Manager","grace@performancenutrition.co","Performance Nutrition Co.","partner","#efe0c8"],
  ["Fiona Kehoe","Technical Producer","fiona@lumacast.ie","Lumacast Audio Visual","supplier","#dcd3ef"]
];

const FILE_TREE = [
  {type:"folder", id:"f-con", name:"Contracts", depth:0},
  {type:"file", id:"fl-1", name:"Nova Fertility Clinic · exhibitor contract 2027.pdf", depth:1, parent:"f-con", indexed:true,
   path:"Contracts / Future Fertility 2027", title:"Nova Fertility Clinic · exhibitor contract 2027",
   facts:[["TYPE","PDF · 5 pages"],["SIGNED","16 Sep 2026"],["VALUE","€18,000"],["OWNER","Kathleen Corr"]],
   body:["Standard Future Events exhibitor contract for Future Fertility, 13–14 March 2027 at the RDS. Package: 4m x 2m stand with back wall, 2 power sockets, 2 lights, one Main Stage speaking slot, 2 social announcement posts, a website listing and 10 partner tickets.",
     "Payment terms are 30% on signature (€5,400, due 23 September 2026) and the 70% balance (€12,600) by 1 February 2027. Pulse generated both invoices the moment the contract was signed.",
     "Schedule B names Dr Aoife Brennan as the speaker for the included Main Stage slot. Stand frontage is listed as 4m, which is the source of the current floor-plan conflict at A07."],
   links:[["Nova Fertility Clinic","company"],["FE-2027-0412","invoice"],["Dr Aoife Brennan","speaker"]]},
  {type:"file", id:"fl-2", name:"Peak Health Labs · exhibitor contract 2027.pdf", depth:1, parent:"f-con", indexed:true,
   path:"Contracts / Future Men's Health 2027", title:"Peak Health Labs · exhibitor contract 2027",
   facts:[["TYPE","PDF · 5 pages"],["SIGNED","5 Sep 2026"],["VALUE","€12,500"],["OWNER","Daniel Murray"]],
   body:["Exhibitor contract for Future Men's Health 2027: 4m x 2m stand with back wall, 2 sockets, 2 lights and a Workshop Stage 2 speaker slot for Dr Hugh Tierney.",
     "Deposit of €3,750 was received on 26 September with reference PEAKHLTH. The balance of €8,750 is due 1 February 2027.",
     "Special request recorded at signature: a position close to the main stage. Stand B14 was allocated with that in mind."],
   links:[["Peak Health Labs","company"],["Stand B14","stand"],["FE-2027-0388","invoice"]]},
  {type:"folder", id:"f-floor", name:"Floor plans", depth:0},
  {type:"file", id:"fl-3", name:"RDS floor plan · Dublin 2027 · v7.pdf", depth:1, parent:"f-floor", indexed:true,
   path:"Floor plans / Dublin 2027", title:"RDS floor plan · Dublin 2027 · v7",
   facts:[["TYPE","PDF · 3 pages"],["UPDATED","24 Sep 2026"],["PLACED","66 of 87"],["OWNER","Robyn Walsh"]],
   body:["Version 7 of the shared floor plan for both events. Zones A and B sit closest to the main stage; the central bar splits Zone C from Zone D.",
     "66 exhibitors have final positions, 10 are provisional and 11 are still unplaced. Two conflicts are open: Nova Fertility Clinic needs 4m frontage at A07, and Ferro Sports Recovery's power request at C22 exceeds the circuit."],
   links:[["Stand B14","stand"],["Nova Fertility Clinic","company"]]},
  {type:"folder", id:"f-prod", name:"Speaker decks", depth:0},
  {type:"file", id:"fl-4", name:"Brennan · Understanding Your Fertility Window · draft.pptx", depth:1, parent:"f-prod", indexed:false,
   path:"Speaker decks / Future Fertility", title:"Brennan · Understanding Your Fertility Window · draft",
   facts:[["TYPE","PPTX · outline only"],["DUE","24 Sep 2026"],["STATUS","Overdue"],["OWNER","Sarah Keane"]],
   body:["Only the approved outline is on file. The first-cut deck for medical and AV review was due on 24 September.",
     "Two automatic reminders have gone out. Dr Brennan replied on WhatsApp: “I'll have this across tomorrow.” AV review for Main Stage 1 is blocked until it lands."],
   links:[["Dr Aoife Brennan","speaker"],["Main Stage 1","stage"]]},
  {type:"folder", id:"f-fin", name:"Finance", depth:0},
  {type:"file", id:"fl-5", name:"FE-2027-0412 · Nova deposit.pdf", depth:1, parent:"f-fin", indexed:true,
   path:"Finance / Invoices", title:"FE-2027-0412 · Nova deposit",
   facts:[["TYPE","PDF · 1 page"],["VALUE","€5,400"],["DUE","23 Sep 2026"],["STATUS","4 days overdue"]],
   body:["Deposit invoice generated automatically when the Nova contract was signed. It posted to Xero the same minute.",
     "The deposit reminder sequence is active: reminders went on 24 and 25 September. The next step is a call from Kathleen on Monday."],
   links:[["Nova Fertility Clinic","company"],["FE-2027-0413","invoice"]]},
  {type:"folder", id:"f-ca", name:"Canada Pilot", depth:0},
  {type:"file", id:"fl-6", name:"Canada Pilot · localisation decisions.xlsx", depth:1, parent:"f-ca", indexed:false,
   path:"Canada Pilot / Planning", title:"Canada Pilot · localisation decisions",
   facts:[["TYPE","XLSX · 2 sheets"],["ADDED","22 Sep 2026"],["OPEN","6 decisions"],["OWNER","Nikki Dwyer"]],
   body:["Six decisions stand between the cloned Dublin model and a live Canada Pilot: currency, tax treatment, venue, payment provider, local exhibitor terms and ticket tax.",
     "Everything else was cloned from Future Fertility Dublin: 27 workflows, 14 email sequences and 3 contract templates."],
   links:[["Future Fertility · Canada Pilot","event"]]}
];

const ONTO_NODES = [
  ["Company","entity",500,300,1,"Clinics, brands and partners. Commercial history across both events on one record."],
  ["Contact","entity",300,190,1,"People at companies, speakers, suppliers and the Future Events team."],
  ["Event","entity",700,190,1,"Future Fertility, Future Men's Health and the Canada Pilot."],
  ["Deal","entity",250,430,1,"A commercial opportunity with a package and an owner."],
  ["Contract","entity",690,430,1,"The signed agreement. Line items become obligations."],
  ["Invoice","ledger",850,320,0,"Deposit and balance, generated from the contract and synced to Xero."],
  ["Exhibitor","entity",390,95,0,"Operational record created from a won deal."],
  ["Stand","module",620,95,0,"A position on the floor plan with its spec."],
  ["Speaker","entity",860,470,0,"A speaker record, often created from a sponsorship slot."],
  ["Session","entity",140,300,0,"A programme slot on a stage."],
  ["signed","predicate",395,240,0,"Company → Contract."],
  ["exhibits at","predicate",605,240,0,"Exhibitor → Event."],
  ["billed by","predicate",360,370,0,"Contract → Invoice."],
  ["speaks in","predicate",600,370,0,"Speaker → Session."],
  ["placed at","predicate",140,372,0,"Exhibitor → Stand."]
];

const ONTO_EDGES = [
  [500,300,300,190],[500,300,700,190],[500,300,250,430],[500,300,690,430],
  [500,300,850,320],[500,300,390,95],[500,300,620,95],[500,300,140,300],
  [300,190,250,430],[700,190,860,470],[690,430,850,320],[690,430,860,470],
  [300,190,140,300],[390,95,620,95]
];

const REC_TEMPLATES = [
  ["Field sheet","Records","Labelled fields in a grid — the default for a person, organisation or location.",
   "M5 5.5h14v13H5v-13Z M5 10h14 M12 10v8.5","grid"],
  ["Contact card","Records","A portrait, key fields and every linked record in one compact panel.",
   "M12 11.5a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8Z M5.5 19c.8-3 3.3-4.7 6.5-4.7s5.7 1.7 6.5 4.7","card"],
  ["Directory","Records","A sortable table of many records at once, built for lists.",
   "M4.5 6.5h15 M4.5 12h15 M4.5 17.5h15 M4.5 6.5h.01 M4.5 12h.01 M4.5 17.5h.01","rows"],
  ["Timeline","Case work","Ordered events with who did what and when. Good for a case or a claim.",
   "M12 3.5v17 M12 7.5h6 M12 13h-6 M12 18h6","timeline"],
  ["Kanban board","Case work","Cards in columns by status. For anything that moves through stages.",
   "M5 5h4.5v14H5V5Z M9.75 5h4.5v9h-4.5V5Z M14.5 5H19v6h-4.5V5Z","kanban"],
  ["Checklist","Case work","Ticked steps in order, with an owner and a due date on each.",
   "M5 6.5h2l1.4 1.4L11 5.5 M5 12.5h2l1.4 1.4 2.6-2.4 M5 18.5h2l1.4 1.4 2.6-2.4 M15 6.5h4 M15 12.5h4 M15 18.5h4","checklist"],
  ["Ledger","Finance","Rows and running totals. For anything with amounts and dates.",
   "M4 6h16 M4 12h16 M4 18h16 M9 3.5v17","ledger"],
  ["Invoice","Finance","Line items, totals and a status — built to be sent, not just stored.",
   "M7 3.5h10v17H7v-17Z M9.5 8h5 M9.5 11.5h5 M9.5 15h3","invoice"],
  ["Document","Notes","Long-form text with linked records pulled out down the side.",
   "M7 3.5h7l5 5v12H7v-17Z M14 3.7v5h5 M10 13h6 M10 16.5h4","document"],
  ["Gallery","Notes","A wall of images and files with a caption on each — for a site or a job.",
   "M4.5 6h6v6h-6V6Z M13.5 6h6v6h-6V6Z M4.5 14h6v4h-6v-4Z M13.5 14h6v4h-6v-4Z","gallery"],
  ["Map & locations","Ops","A pinboard of places, with the record's fields beside each pin.",
   "M12 21s6.5-5.6 6.5-11a6.5 6.5 0 1 0-13 0C5.5 15.4 12 21 12 21Z M12 12.8a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z","map"],
  ["Schedule","Ops","A calendar of bookings against this record, with recurring rules.",
   "M8 4v3 M16 4v3 M4.5 9.5h15 M6.4 6h11.2A1.9 1.9 0 0 1 19.5 8v10a1.9 1.9 0 0 1-1.9 1.9H6.4A1.9 1.9 0 0 1 4.5 18V8A1.9 1.9 0 0 1 6.4 6Z","schedule"]
];
const REC_TEMPLATE_CATS = ["All","Records","Case work","Finance","Notes","Ops"];

/* ---- admin hub ---- */
/* ---- admin hub: 13 settings areas in five groups ---- */
const PEOPLE = [
  ["Nikki Dwyer","Founder / Managing Director","nikki@futureevents.ie","Dublin","active","Admin","2 min ago"],
  ["Kathleen Corr","Head of Sales","kathleen@futureevents.ie","Dublin","active","Manager","8 min ago"],
  ["Robyn Walsh","Event Operations","robyn@futureevents.ie","Dublin","active","Manager","34 min ago"],
  ["Sarah Keane","Production Manager","sarah@futureevents.ie","Dublin","active","Standard","1 h ago"],
  ["Daniel Murray","Commercial Executive","daniel@futureevents.ie","Dublin","active","Standard","12 min ago"],
  ["Amy Byrne","Marketing & Content","amy@futureevents.ie","Dublin","active","Standard","3 h ago"],
  ["Conor Ryan","Event Coordinator","conor@futureevents.ie","Dublin","active","Standard","5 h ago"],
  ["Fiona Kehoe","Lumacast Audio Visual · supplier","fiona@lumacast.ie","—","external","External","2 days ago"]
];
const ROLE_LEVELS = ["Admin","Manager","Standard","External"];
const PERM_KEYS = [["view","View records"],["edit","Edit records"],["approve","Approve payments"]];
const GRANT_DEFS = [
  ["view","View records","Read anything in scope"],
  ["edit","Edit records","Create and change records"],
  ["approve","Approve decisions","Say yes to parked work"],
  ["pay","Release payments","Send money out"],
  ["export","Export data","Download and share out"],
  ["agents","Manage agents","Create and grant agents"],
  ["settings","Change settings","Modules, roles, integrations"],
  ["audit","Read the audit log","Every action, everyone"]
];
const ROLE_SCOPES = ["All records","Their location","Assigned only"];
const DEFAULT_PERMS = {Admin:{view:true,edit:true,approve:true}, Manager:{view:true,edit:true,approve:true},
  Standard:{view:true,edit:true,approve:false}, External:{view:true,edit:false,approve:false}};
const INTEGRATIONS = [
  {name:"HubSpot", blurb:"Contacts, companies and deals stay matched to Pulse records. A won deal in HubSpot opens the whole exhibitor workflow here.", tint:"#ff7a59", status:"connected", statusKind:"ok",
   glyph:"M12 9.6a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8Z M12 4v3.4 M12 16.6V20 M4 12h3.4 M16.6 12H20 M6.5 6.5l2.4 2.4 M15.1 15.1l2.4 2.4 M17.5 6.5l-2.4 2.4 M8.9 15.1l-2.4 2.4",
   lastSync:"4 min ago", usage:"3 contacts updated today", auth:"OAuth 2.0 · auto-refresh", scopes:["Read","Write"]},
  {name:"Xero", blurb:"Deposit and balance invoices post the minute a contract is signed; bank payments match back automatically.", tint:"#13b5ea", status:"connected", statusKind:"ok",
   glyph:"M4.5 12a7.5 7.5 0 0 1 12.8-5.3 M19.5 12a7.5 7.5 0 0 1-12.8 5.3 M17.3 4v3.3h-3.3 M6.7 20v-3.3H10",
   lastSync:"8 min ago", usage:"6 payments matched today", auth:"OAuth 2.0 · token refreshed hourly", scopes:["Read","Write"]},
  {name:"Google Drive", blurb:"Contracts, floor plans and speaker decks filed against the record they belong to.", tint:"#34a853", status:"connected", statusKind:"ok",
   glyph:"M8.5 4h7l5 8.6-3.5 6H7l-3.5-6L8.5 4Z M8.5 4l5 8.6 M15.5 4l-5 8.6 M3.5 12.6h17",
   lastSync:"11 min ago", usage:"1,240 files indexed", auth:"OAuth 2.0", scopes:["Read","Write"]},
  {name:"Shopify", blurb:"Ticket orders flow into the audience record so B2C buyers and B2B partners live in one place.", tint:"#95bf47", status:"connected", statusKind:"ok",
   glyph:"M6 7.5h12l-1.2 12H7.2L6 7.5Z M9 7.5V6a3 3 0 0 1 6 0v1.5",
   lastSync:"2 min ago", usage:"2,184 tickets for 2027", auth:"API key", scopes:["Read"]},
  {name:"WhatsApp", blurb:"The communication layer for speakers and event crew. Pulse stays the source of truth and posts updates into the groups.", tint:"#25d366", status:"connected", statusKind:"ok",
   glyph:"M4 19.5 5.3 15A7.7 7.7 0 1 1 8.6 18.2L4 19.5Z M8.6 10.3c0 3 2.4 5.4 5.4 5.4",
   lastSync:"3 min ago", usage:"14 groups linked", auth:"Business API", scopes:["Send","Read"]},
  {name:"Website CMS", blurb:"Exhibitor logos, speaker bios and the programme publish from approved Pulse records.", tint:"#9c9794", status:"connected", statusKind:"ok",
   glyph:"M4 5.5h16v13H4v-13Z M4 9h16 M7 7.2h.01 M9.2 7.2h.01",
   lastSync:"26 min ago", usage:"61 partner pages live", auth:"API key", scopes:["Write"]},
  {name:"Email", blurb:"Google Workspace mail in and out of Pulse. Threads attach to the record they mention; drafts wait for a yes.", tint:"#ea4335", status:"connected", statusKind:"ok",
   glyph:"M4 7.2 12 13 20 7.2 M4 7.2v10.6h16V7.2 M4 7.2 8.5 4h7L20 7.2",
   lastSync:"1 min ago", usage:"410 emails/day", auth:"OAuth 2.0", scopes:["Read","Send"]},
  {name:"Make.com", blurb:"Legacy scenarios that used to glue HubSpot, Xero and Sheets together. Being retired as each flow moves into Pulse.", tint:"#6d00cc", status:"legacy · retiring", statusKind:"warn",
   glyph:"M5 17 9.5 7 14 17 M10 17l4.5-10L19 17",
   lastSync:"1 of 4 scenarios still on · off 4 Oct", usage:"3 retired", auth:"API key", scopes:["Read"]},
  {name:"Google Sheets", blurb:"Legacy trackers for stands, speakers and staff. Being consolidated into Pulse records.", tint:"#0f9d58", status:"legacy · consolidating", statusKind:"warn",
   glyph:"M6.5 3.5h8l4 4v13h-12v-17Z M9 11h6.5 M9 14.5h6.5 M9 18h6.5 M12 11v7",
   lastSync:"Read only since 1 Sep", usage:"9 sheets archived", auth:"OAuth 2.0", scopes:["Read"]}
];

/* Background catalogue. Each entry is pure CSS so a tile is the real thing at
   thumbnail size, not a picture of it. */
const BG_DEFS = [
  {id:"bloom", name:"Bloom", cat:"Signature",
   css:"background:radial-gradient(60% 48% at 50% 34%, var(--accent-faint), transparent 72%), radial-gradient(44% 38% at 16% 84%, rgba(255,255,255,.05), transparent 70%)",
   thumb:"background:radial-gradient(62% 58% at 46% 34%, var(--accent-soft), transparent 74%), radial-gradient(50% 46% at 82% 84%, rgba(255,255,255,.08), transparent 72%), var(--surface-2)"},
  {id:"mist", name:"Mist", cat:"Signature",
   css:"background:radial-gradient(52% 44% at 24% 22%, rgba(255,255,255,.07), transparent 70%), radial-gradient(56% 46% at 80% 76%, rgba(255,255,255,.05), transparent 72%)",
   thumb:"background:radial-gradient(58% 52% at 24% 22%, rgba(255,255,255,.16), transparent 72%), radial-gradient(60% 54% at 82% 78%, rgba(255,255,255,.10), transparent 74%), var(--surface-2)"},
  {id:"grid", name:"Grid", cat:"Signature",
   css:"background-image:linear-gradient(var(--border) 1px, transparent 1px),linear-gradient(90deg, var(--border) 1px, transparent 1px);background-size:56px 56px;mask-image:radial-gradient(62% 56% at 50% 46%, #000, transparent 78%);-webkit-mask-image:radial-gradient(62% 56% at 50% 46%, #000, transparent 78%)",
   thumb:"background-color:var(--surface-2);background-image:linear-gradient(var(--border-strong) 1px, transparent 1px),linear-gradient(90deg, var(--border-strong) 1px, transparent 1px);background-size:14px 14px"},
  {id:"none", name:"None", cat:"Signature", css:"", thumb:"background:var(--surface-2)"},

  {id:"aurora", name:"Aurora", cat:"Gradient",
   css:"background:radial-gradient(70% 52% at 18% 8%, var(--bloom-a), transparent 66%), radial-gradient(64% 48% at 84% 22%, var(--bloom-b), transparent 68%), radial-gradient(70% 60% at 50% 104%, var(--bloom-c), transparent 70%);filter:blur(24px)",
   thumb:"background:radial-gradient(72% 60% at 16% 6%, var(--bloom-a), transparent 68%), radial-gradient(66% 54% at 86% 24%, var(--bloom-b), transparent 70%), radial-gradient(74% 66% at 50% 108%, var(--bloom-c), transparent 72%), var(--surface-2)"},
  {id:"horizon", name:"Horizon", cat:"Gradient",
   css:"background:linear-gradient(180deg, transparent 0%, var(--accent-faint) 58%, transparent 100%), radial-gradient(90% 40% at 50% 72%, var(--accent-soft), transparent 70%)",
   thumb:"background:linear-gradient(180deg, var(--surface-2) 0%, var(--accent-faint) 58%, var(--surface-2) 100%), radial-gradient(90% 44% at 50% 74%, var(--accent-soft), transparent 70%)"},
  {id:"dusk", name:"Dusk", cat:"Gradient",
   css:"background:linear-gradient(200deg, var(--bloom-c) -10%, transparent 46%), linear-gradient(20deg, var(--bloom-b) -10%, transparent 52%);opacity:.5",
   thumb:"background:linear-gradient(200deg, var(--bloom-c) -12%, transparent 48%), linear-gradient(20deg, var(--bloom-b) -12%, transparent 54%), var(--surface-2)"},
  {id:"ember", name:"Ember", cat:"Gradient",
   css:"background:radial-gradient(60% 70% at 84% 96%, var(--bloom-a), transparent 64%), radial-gradient(50% 60% at 10% 96%, var(--bloom-c), transparent 66%)",
   thumb:"background:radial-gradient(64% 76% at 84% 100%, var(--bloom-a), transparent 66%), radial-gradient(54% 66% at 8% 100%, var(--bloom-c), transparent 68%), var(--surface-2)"},

  {id:"mesh", name:"Mesh", cat:"Abstract",
   css:"background-image:radial-gradient(var(--border-strong) 1px, transparent 1px);background-size:22px 22px;mask-image:radial-gradient(70% 62% at 50% 46%, #000, transparent 76%);-webkit-mask-image:radial-gradient(70% 62% at 50% 46%, #000, transparent 76%)",
   thumb:"background-color:var(--surface-2);background-image:radial-gradient(var(--border-strong) 1px, transparent 1px);background-size:8px 8px"},
  {id:"contour", name:"Contour", cat:"Abstract",
   css:"background:repeating-radial-gradient(circle at 30% 110%, transparent 0 22px, var(--border) 22px 23px);mask-image:radial-gradient(80% 70% at 40% 80%, #000, transparent 78%);-webkit-mask-image:radial-gradient(80% 70% at 40% 80%, #000, transparent 78%)",
   thumb:"background:repeating-radial-gradient(circle at 26% 116%, var(--surface-2) 0 9px, var(--border-strong) 9px 10px)"},
  {id:"weave", name:"Weave", cat:"Abstract",
   css:"background:repeating-linear-gradient(48deg, transparent 0 16px, var(--border) 16px 17px), repeating-linear-gradient(-48deg, transparent 0 16px, var(--border) 16px 17px);opacity:.7",
   thumb:"background-color:var(--surface-2);background-image:repeating-linear-gradient(48deg, transparent 0 7px, var(--border-strong) 7px 8px), repeating-linear-gradient(-48deg, transparent 0 7px, var(--border-strong) 7px 8px)"},
  {id:"halo", name:"Halo", cat:"Abstract",
   css:"background:repeating-radial-gradient(circle at 50% 50%, transparent 0 46px, var(--accent-line) 46px 47px);mask-image:radial-gradient(60% 60% at 50% 50%, #000, transparent 72%);-webkit-mask-image:radial-gradient(60% 60% at 50% 50%, #000, transparent 72%)",
   thumb:"background:repeating-radial-gradient(circle at 50% 50%, var(--surface-2) 0 11px, var(--accent-line) 11px 12px)"},
  {id:"drift", name:"Drift", cat:"Abstract",
   css:"background:conic-gradient(from 210deg at 32% 38%, var(--bloom-b), transparent 38%), conic-gradient(from 20deg at 76% 70%, var(--bloom-a), transparent 34%);filter:blur(30px);opacity:.6",
   thumb:"background:conic-gradient(from 210deg at 32% 38%, var(--bloom-b), transparent 38%), conic-gradient(from 20deg at 76% 70%, var(--bloom-a), transparent 34%), var(--surface-2)"},
  {id:"scan", name:"Scanlines", cat:"Abstract",
   css:"background:repeating-linear-gradient(0deg, var(--border) 0 1px, transparent 1px 7px);mask-image:linear-gradient(180deg, #000, transparent 88%);-webkit-mask-image:linear-gradient(180deg, #000, transparent 88%)",
   thumb:"background-color:var(--surface-2);background-image:repeating-linear-gradient(0deg, var(--border-strong) 0 1px, transparent 1px 5px)"}
];

const THEMES = [
  {id:"future", label:"Future", group:"Dark", bg:"#0b0b0c", surface:"#161617", ink:"#F5EFE9", accent:"#E0524C"},
  {id:"dark", label:"Dark", group:"Dark", bg:"#0b0c0b", surface:"#1a1c19", ink:"#f2f3ef", accent:"#c8f04b"},
  {id:"indigo", label:"Indigo", group:"Dark", bg:"#0a0b13", surface:"#1a1b26", ink:"#f0f1fa", accent:"#8b93ff"},
  {id:"slate", label:"Slate", group:"Dark", bg:"#100e0c", surface:"#211c17", ink:"#f4f0ea", accent:"#e8a14a"},
  {id:"plum", label:"Plum", group:"Dark", bg:"#100a10", surface:"#20151f", ink:"#f6eef4", accent:"#f077b0"},
  {id:"ember", label:"Ember", group:"Dark", bg:"#0b0b0b", surface:"#1c1714", ink:"#f7f3ef", accent:"#f4561a"},
  {id:"harbour", label:"Harbour", group:"Dark", bg:"#0b0e10", surface:"#13171a", ink:"#f3f5f4", accent:"#5ee79a"},
  {id:"cargo", label:"Cargo", group:"Dark", bg:"#0a0a0a", surface:"#1a1c1a", ink:"#f2f5f2", accent:"#4ade80"},
  {id:"ocean", label:"Ocean", group:"Dark", bg:"#080e12", surface:"#141f25", ink:"#eaf4f8", accent:"#4fd4d0"},
  {id:"graphite", label:"Graphite", group:"Dark", bg:"#111112", surface:"#212124", ink:"#f4f4f5", accent:"#f4f4f5"},
  {id:"light", label:"Paper", group:"Light", bg:"#F5EFE9", surface:"#ffffff", ink:"#111111", accent:"#C9332D"},
  {id:"warm", label:"Warm paper", group:"Light", bg:"#faf5ec", surface:"#fffdf9", ink:"#2a2016", accent:"#c9683f"},
  {id:"mist", label:"Mist", group:"Light", bg:"#eef1f4", surface:"#ffffff", ink:"#141e20", accent:"#0e9f6e"},
  {id:"sand", label:"Sand", group:"Light", bg:"#f6f1e6", surface:"#fffdf7", ink:"#221d12", accent:"#7d5fd6"}
];

const ADMIN_ICONS = {
  people:"M12 12.5a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z M5 20.2c.9-3.1 3.6-4.9 7-4.9s6.1 1.8 7 4.9",
  teams:"M9 12a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 9 12Z M16.5 12.5a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z M2.6 19.6c.8-2.8 3.2-4.4 6.4-4.4s5.6 1.6 6.4 4.4 M17 15.4c2.2.4 3.7 1.8 4.3 4.2",
  structure:"M4.5 20V6.4A1.4 1.4 0 0 1 5.9 5h6.2a1.4 1.4 0 0 1 1.4 1.4V20 M13.5 10.5h4.6A1.4 1.4 0 0 1 19.5 12v8 M3 20h18 M7.5 8.5h2.5 M7.5 12h2.5",
  shield:"M12 3.6 19.5 6v6.1c0 4-3.1 6.9-7.5 8.3-4.4-1.4-7.5-4.3-7.5-8.3V6L12 3.6Z M9.2 12.2l2 2 3.6-3.7",
  agent:"M2 12h4l2.5-6 3.5 12 3-8 2 2h5",
  flow:"M18.5 8.5A5 5 0 0 0 8.9 7.3 3.8 3.8 0 0 0 6 14.6 M8 17.5l3.2 3.2 M11.2 20.7l3.2-3.2 M11.2 20.7V9.6",
  plug:"M9 3.5v5 M15 3.5v5 M6.5 8.5h11v3a5.5 5.5 0 0 1-11 0v-3Z M12 17v3.5",
  modules:"M6.6 4.4h10.8a2.2 2.2 0 0 1 2.2 2.2v10.8a2.2 2.2 0 0 1-2.2 2.2H6.6a2.2 2.2 0 0 1-2.2-2.2V6.6a2.2 2.2 0 0 1 2.2-2.2Z M4.4 9.6h15.2 M9.6 19.6V9.6",
  health:"M3 12.5h3.4l2-5 3 10 2.2-5H21",
  lock:"M6.5 10.5h11a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19v-7a1.5 1.5 0 0 1 1.5-1.5Z M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3",
  audit:"M8 3.5h8l3.5 3.5v13a1.5 1.5 0 0 1-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5V5A1.5 1.5 0 0 1 6 3.5h2Z M9 12h6 M9 16h4",
  brand:"M12 3.5 14.6 9l6.4.6-4.8 4.2 1.4 6.2-5.6-3.3-5.6 3.3 1.4-6.2L3 9.6 9.4 9 12 3.5Z",
  bell:"M6 8.5a6 6 0 0 1 12 0c0 6.5 2.6 8.5 2.6 8.5H3.4S6 15 6 8.5Z M10.3 20.5a1.94 1.94 0 0 0 3.4 0",
  data:"M4.5 7.5c0-1.7 3.4-3 7.5-3s7.5 1.3 7.5 3-3.4 3-7.5 3-7.5-1.3-7.5-3Z M4.5 7.5v9c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-9 M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3"
};

const ADMIN_CARDS = [
  {id:"structure", group:"ORGANISATION", title:"Organisation", icon:"structure", tint:"var(--accent)",
   blurb:"Antidote Events, the brands it runs and where it operates.",
   tags:["Antidote Events","Dublin, Ireland","EUR"],
   listLabel:"ORGANISATION DETAILS",
   rows:[["Operating business","Antidote Events"],["Trading as","Future Events"],["Owner","Nikki Dwyer"],["Primary location","Dublin, Ireland"],
     ["Default currency and timezone","EUR · Europe/Dublin"],["Financial year","Jan to Dec"]]},
  {id:"brands", group:"ORGANISATION", title:"Event brands", icon:"brand", tint:"#E0524C",
   blurb:"The event brands this workspace runs, each with its own colour, templates and audience.",
   tags:["2 brands","1 pilot"],
   heroLabel:"EVENT BRANDS", heroAction:"Add an event",
   heroText:"Future Fertility Show and Future Men's Health run at the RDS on 13–14 March 2027. Future Fertility Canada Pilot is cloned from the Dublin model and in planning.",
   listLabel:"BRANDS",
   rows:[["Future Fertility Show","Dublin · 13–14 Mar 2027"],["Future Men's Health","Dublin · 13–14 Mar 2027"],["Future Fertility · Canada Pilot","Location TBD · planning"]]},
  {id:"people", group:"TEAMS", title:"People & access", icon:"people", tint:"#6ad0f0",
   blurb:"Invite, suspend and offboard the people who use Pulse, staff and suppliers.",
   tags:["7 staff","1 supplier","~100 casual crew"], badge:"2 waiting", badgeKind:"warn",
   footer:"Casual crew live in Events → Staff, not here", action:"Review 2 invites",
   listLabel:"WHAT YOU CONTROL HERE",
   rows:[["Add, invite or remove people","",""],["Teams","Sales · Ops · Production · Marketing"],["Managers","Kathleen Corr · Robyn Walsh"],
     ["Supplier access","Lumacast Audio Visual · read only"],["Suspend accounts","0 suspended"],["View last login","8 people tracked"]]},
  {id:"teams", group:"TEAMS", title:"Roles & permissions", icon:"shield", tint:"#EED7D3",
   blurb:"Permission templates, and exactly what each person can reach.",
   tags:["4 roles","3 scopes"],
   heroLabel:"THE QUESTION THIS ANSWERS", heroAction:"Show me what someone can access",
   heroText:"Pick a person and see every record, action and export they can reach. Sales sees money; production crew never do.",
   footer:"Preview Pulse as another user", action:"Open preview",
   listLabel:"WHAT YOU CONTROL HERE",
   rows:[["Create permission templates","4 in use"],["View, edit, export and delete access","per permission"],
     ["Restrict by event, team or record owner","3 scopes"],["Discount approval limit","over 10% goes to Nikki"],["Preview Pulse as another user",""]]},
  {id:"modules", group:"SYSTEMS", title:"Systems of record", icon:"modules", tint:"#f0c04b",
   blurb:"Which system owns which data, and what Pulse sits on top of.",
   tags:["Pulse = control layer","7 connected","2 legacy"],
   heroLabel:"HOW IT FITS", heroAction:"Open integrations",
   heroText:"HubSpot keeps the CRM, Xero keeps the ledger, Shopify keeps ticket orders. Pulse connects them so one signed deal becomes invoices, an exhibitor record, a stand, a speaker and a marketing plan without anyone retyping it.",
   listLabel:"SYSTEMS",
   rows:[["HubSpot","connected"],["Xero","connected"],["Google Drive","connected"],["Shopify","connected"],
     ["WhatsApp","connected · communication layer"],["Website CMS","connected"],["Email","connected"],
     ["Make.com","legacy · retiring"],["Google Sheets","legacy workflows · being consolidated"],
     ["Canva, CapCut, Opus, Later","external tools · status tracked in Pulse"]]},
  {id:"health", group:"SYSTEMS", title:"Data health", icon:"health", tint:"#e2705c",
   blurb:"What is wrong with the data, how bad it is, and the fix.",
   tags:["5 issue types","64 records affected"], badge:"18 duplicates", badgeKind:"warn",
   footer:"Last scanned 12 minutes ago", action:"Fix 2 automatically",
   listLabel:"ISSUES FOUND",
   trend:[212,188,151,122,97,78,64],
   bySeverity:[["High","21",RED],["Medium","27",AMBER],["Low","16",DIM]],
   issues:[["Duplicate contacts","18","high","HubSpot and Sheets copies of the same exhibitor contact","Fix automatically"],
     ["Missing billing emails","3","high","3 exhibitors have no accounts contact for invoices","Fix automatically"],
     ["Unmatched payments","2","medium","€3,750 PEAKHLTH and €1,200 FUTURE EXPO","Review"],
     ["Legacy sheet rows","29","medium","Stand tracker rows not yet moved into Pulse","Review"],
     ["Speaker records needing review","12","low","Bio or headshot older than 2025","Review"]],
   rows:[]},
  {id:"integrations", group:"INTEGRATIONS", title:"Integrations", icon:"plug", tint:"#6ad0f0",
   blurb:"CRM, accounting, files, tickets and messaging, and which way data flows.",
   tags:["7 connected","2 legacy","0 broken"], badge:"All healthy", badgeKind:"ok",
   footer:"Tokens refresh automatically · no more silent breakages", action:"View sync log",
   listLabel:"CONNECTIONS",
   rows:[["HubSpot","read and write"],["Xero","read and write"],["Google Drive","read and write"],["Shopify","read"],
     ["WhatsApp","send and read"],["Website CMS","write"],["Email","read and send"],["Make.com","legacy · last scenario off 4 Oct"],["Google Sheets","legacy · read only"]]},
  {id:"security", group:"GOVERNANCE", title:"Security", icon:"lock", tint:"#8fa6ff",
   blurb:"Sign-in, sessions, devices and the keys that reach the API.",
   tags:["SSO on","2FA enforced","3 API keys"],
   listLabel:"WHAT YOU CONTROL HERE",
   rows:[["Single sign-on","Google Workspace", true],["Two-factor authentication","enforced", true],
     ["Login policies","30-day session"],["Active sessions","11"],["IP restrictions","off", false],["API keys","3 active"],["Data retention rules","7 years"]]},
  {id:"audit", group:"GOVERNANCE", title:"Audit log", icon:"audit", tint:"#9d8cf5",
   blurb:"A locked history of who changed what. Searchable, exportable, never editable.",
   tags:["Append-only","7-year retention"],
   footer:"Nobody can edit or delete entries", action:"Export",
   listLabel:"WHAT IS RECORDED",
   rows:[["Contract and discount changes","14 this month"],["Payment matches","41"],["Floor-plan moves","23"],
     ["Integration changes","6"],["Agent actions","2,140"],["Data exports","4"]]},
  {id:"datamgmt", group:"GOVERNANCE", title:"Data management", icon:"data", tint:"#5fe0a8",
   blurb:"Import, export, restore and, carefully, delete.",
   tags:["Backup 02:00","30-day restore"],
   footer:"Last backup completed 02:00 today", action:"Run backup",
   listLabel:"WHAT YOU CONTROL HERE",
   rows:[["Import data","CSV, HubSpot, Sheets"],["Export data","full or per event"],["Backup status","healthy · 02:00 daily"],
     ["Restore previous versions","30 days available"],["GDPR requests","2 this year"],["Delete company data","requires two admins"]]},
  {id:"agents", group:"AI CONTROLS", title:"Agents & AI controls", icon:"agent", tint:"var(--accent)",
   blurb:"What agents may read, what they may do, and where they must stop.",
   tags:["7 agents","318 actions today","€0.62 spent"],
   heroLabel:"GLOBAL CONTROL", heroAction:"Pause every agent",
   heroText:"One switch stops every agent immediately. Anything mid-run finishes its current step and then holds.",
   footer:"Money, contracts and external sends always need a yes", action:"Review limits",
   listLabel:"WHAT YOU CONTROL HERE",
   rows:[["Approved agents","7"],["Data agents can read","by permission"],
     ["Actions agents can take","read · write · external"],["Approval before sending to clients","always", true],
     ["Reminder sequences run without approval","deposits and assets", true],["Spending limit","€40/month cap"]]},
  {id:"wf", group:"AI CONTROLS", title:"Workflow controls", icon:"flow", tint:"#9d8cf5",
   blurb:"The guardrails, not the builder. Building happens under Work.",
   tags:["Managers only","2 approval rules","Retry twice"],
   footer:"Building workflows happens in Work", action:"Open Work",
   listLabel:"WHAT YOU CONTROL HERE",
   rows:[["Who can create workflows","Managers only"],["Discounts over 10%","needs Nikki", true],
     ["Failure handling","retry twice, then alert the owner"],["Global pause","all workflows", true],["Default notifications","inbox + WhatsApp"]]},
  {id:"notif", group:"EXPERIENCE", title:"Notifications", icon:"bell", tint:"#f0994b",
   blurb:"Which events reach people, on which channel, and when not to.",
   tags:["Inbox","WhatsApp","Quiet 20:00–07:00"],
   listLabel:"WHAT YOU CONTROL HERE",
   rows:[["Which events trigger notifications","16 of 24 events"],["Email","", true],["WhatsApp","", true],
     ["In-app","", true],["Escalation","after 4 hours unread"],["Quiet hours","20:00–07:00 (off in event week)"],["Morning briefing","07:00 daily"]]},
  {id:"brand", group:"EXPERIENCE", title:"Branding", icon:"brand", tint:"var(--accent)",
   blurb:"Logo, event colours, templates and how agents appear.",
   tags:["Future red","2 event accents"],
   listLabel:"WHAT YOU CONTROL HERE",
   rows:[["Future Events mark","future-events.svg"],["Accent","Future red #D93B35"],["Future Fertility","red · blush"],["Future Men's Health","cobalt"],
     ["Email templates","6"],["Contract templates","3"]]},
  {id:"appearance", group:"EXPERIENCE", title:"Appearance & themes", icon:"brand", tint:"#6ad0f0",
   blurb:"Pick a light or dark theme for how Pulse looks to you.",
   tags:["Future dark","Paper light"],
   listLabel:"THEMES", rows:[]}
];

const ADMIN_GROUPS = [
  ["ORGANISATION", "repeat(2,1fr)"],
  ["TEAMS", "repeat(2,1fr)"],
  ["SYSTEMS", "repeat(2,1fr)"],
  ["INTEGRATIONS", "repeat(1,1fr)"],
  ["GOVERNANCE", "repeat(3,1fr)"],
  ["AI CONTROLS", "repeat(2,1fr)"],
  ["EXPERIENCE", "repeat(3,1fr)"]
];

/* ---- activity feeds ---- */
const SRC_TINT = {Gmail:"#f07a9d", Pulse:"var(--accent)", Shopify:"#95bf47", WhatsApp:"#5fe0a8",
  HubSpot:"#f0994b", Xero:"#8fa6ff", Agent:"var(--accent)", Drive:"#6ad0f0", CMS:"#9c9794"};
const SRC_ABBR = {Gmail:"GM", Pulse:"PL", Shopify:"SH", WhatsApp:"WA", HubSpot:"HS", Xero:"XR", Agent:"AI", Drive:"GD", CMS:"WB"};

const DATA_EVENTS = [
  ["Xero updated invoice status","FE-2027-0377 Ferro Sports Recovery marked paid after bank match.","Xero sync","Ferro Sports Recovery","Xero","completed"],
  ["HubSpot synced 3 updated contacts","Lumen Genetics, Bloom Egg Freezing and Orbit Health Cover contact changes pulled in.","HubSpot sync","3 companies","HubSpot","completed"],
  ["Payment received","€3,750 with reference PEAKHLTH arrived in the AIB feed.","Xero bank feed","Peak Health Labs","Xero","awaiting"],
  ["Exhibitor form submitted","Ferro Sports Recovery sent its stand spec: 3m x 2m, 3 sockets.","Exhibitor portal","Ferro Sports Recovery","Pulse","completed"],
  ["Ticket orders imported","46 Future Fertility early-bird tickets from Shopify overnight.","Shopify","Future Fertility 2027","Shopify","completed"],
  ["Deck uploaded","Rob Lipsett's Main Stage 2 deck landed in the speaker folder.","Google Drive","Future Men's Health","Drive","completed"],
  ["Logo received","Velocity Fitness Studios logo SVG approved and pushed to the website.","Exhibitor portal","Velocity Fitness Studios","CMS","completed"],
  ["WhatsApp message received","Dr Aoife Brennan: “I'll have this across tomorrow.”","WhatsApp","Dr Aoife Brennan","WhatsApp","completed"],
  ["Unmatched payment","€1,200 with reference FUTURE EXPO has no likely invoice.","Xero bank feed","Unknown payer","Xero","failed"]
];

const PEOPLE_EVENTS = [
  ["Kathleen moved a deal","Nova Fertility Clinic moved to Contract Sent before signature on 16 Sep.","Kathleen Corr","Nova Fertility Clinic","HubSpot","completed"],
  ["Nikki approved a campaign","Future Men's Health launch email approved for Tuesday 09:00.","Nikki Dwyer","Future Men's Health","Pulse","completed"],
  ["Event Ops moved an exhibitor","Peak Health Labs moved from C12 to B14, closer to the main stage.","Robyn Walsh","Peak Health Labs","Pulse","completed"],
  ["Sarah flagged a deck","Dr Priya Nair's deck needs house style before AV review.","Sarah Keane","Dr Priya Nair","Pulse","completed"],
  ["Daniel sent a proposal","Men's Performance Institute · standard stand + workshop · €7,800.","Daniel Murray","Men's Performance Institute","HubSpot","completed"],
  ["Amy scheduled content","Two Nova Fertility Clinic social announcements queued in Later.","Amy Byrne","Nova Fertility Clinic","Pulse","completed"],
  ["Discount requested","12% on Harbour IVF Partners premium stand, over the 10% limit.","Kathleen Corr","Harbour IVF Partners","Pulse","awaiting"],
  ["Floor-plan move requested","Nova Fertility Clinic to A05 for 4m frontage.","Robyn Walsh","Nova Fertility Clinic","Pulse","awaiting"]
];

const AI_EVENTS = [
  ["Revenue Agent matched a payment","€3,750 PEAKHLTH proposed against Peak Health Labs FE-2027-0388 at 96% confidence.","Revenue Agent","Peak Health Labs","Xero","awaiting"],
  ["Exhibitor Agent requested missing logo","Peak Health Labs asked for its logo SVG and Dr Hugh Tierney's headshot.","Exhibitor Agent","Peak Health Labs","Agent","working"],
  ["Production Agent flagged an overdue deck","Dr Aoife Brennan's deck is 3 days late and blocking Main Stage 1 AV review.","Production Agent","Dr Aoife Brennan","Agent","working"],
  ["Revenue Agent sent a deposit reminder","Reminder #2 to Nova Fertility Clinic for €5,400 (FE-2027-0412).","Revenue Agent","Nova Fertility Clinic","Gmail","completed"],
  ["Ops Watchdog checked deadlines","Speaker lock on 13 Nov is at risk: 8 Men's Health slots open.","Ops Watchdog","Future Men's Health","Agent","working"],
  ["Growth Agent reported affiliate sales","Performance Nutrition Co.: 214 orders, €2,527.50 commission to date.","Growth Agent","Performance Nutrition Co.","Agent","completed"],
  ["Event Ops Agent updated the roster","12 new casual crew added and posted to the WhatsApp group.","Event Ops Agent","Future Crew Dublin 2027","WhatsApp","completed"],
  ["Briefing Agent posted the morning brief","Five priorities today. Nova deposit is first.","Briefing Agent","Nikki Dwyer","WhatsApp","completed"]
];

const STREAM_DEFS = [
  {id:"data", title:"Systems", sub:"Xero, HubSpot, Shopify, Drive, WhatsApp", pool:DATA_EVENTS, every:3200,
   tint:"#6ad0f0", icon:"M4.5 7.5c0-1.7 3.4-3 7.5-3s7.5 1.3 7.5 3-3.4 3-7.5 3-7.5-1.3-7.5-3Z M4.5 7.5v9c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-9 M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3"},
  {id:"people", title:"People", sub:"Decisions the team made", pool:PEOPLE_EVENTS, every:6400,
   tint:"#EED7D3", icon:"M12 12.5a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z M5 20.2c.9-3.1 3.6-4.9 7-4.9s6.1 1.8 7 4.9"},
  {id:"ai", title:"Agents", sub:"Agents at work", pool:AI_EVENTS, every:4600,
   tint:"var(--accent)", icon:"M2 12h4l2.5-6 3.5 12 3-8 2 2h5"}
];

const NAV = [
  {label:"Home", icon:"helios", page:"Home"},
  {label:"Agents", icon:"navAgents", page:"Agents"},
  {label:"Sales", icon:"navSales", page:"Sales", dot:true},
  {label:"Exhibitors", icon:"navExhibitors", page:"Exhibitors"},
  {label:"Finance", icon:"navFinance", page:"Finance", dot:true},
  {label:"Events", icon:"navEvents", page:"Events"},
  {label:"Production", icon:"navProduction", page:"Production"},
  {label:"Growth", icon:"navGrowth", page:"Growth"},
  {divider:true},
  {label:"Work", icon:"navWork", page:"Work"},
  {label:"Records", icon:"navRecords", page:"Records"},
  {label:"Activity", icon:"pulseLine", page:"Activity", dot:true}
];

/* Inbox items follow the real InboxItem shape: what happened, why it matters, what I can do. */
const ITEMS = {
  nova:{kind:"Alert", importance:"critical", icon:ICONS.health, age:"4d",
    title:"Nova Fertility Clinic · deposit €5,400 overdue",
    why:"FE-2027-0412 was due 23 Sep. Two automatic reminders have gone; Kathleen calls Monday.",
    detail:"The deal is signed (€18,000, Future Fertility). Until the deposit lands, their 10 partner tickets stay unissued and stand A07 is provisional. The balance of €12,600 is scheduled for 1 February 2027.",
    actionLabel:"Review account", secondaryLabel:"Snooze", group:"Alerts",
    fields:[{k:"Invoice",v:"FE-2027-0412"},{k:"Owner",v:"Kathleen Corr"},{k:"Amount",v:"€5,400"},{k:"Days overdue",v:"4"}],
    history:[{when:"24 Sep",text:"Reminder #1 sent automatically"},{when:"25 Sep",text:"Reminder #2 sent automatically"}]},
  peak:{kind:"Task", importance:"high", icon:ICONS.work, age:"2d",
    title:"Peak Health Labs · exhibitor assets incomplete",
    why:"Missing logo SVG and speaker headshot. Onboarding is 78% complete.",
    detail:"Stand B14 (4m x 2m, 2 sockets, 2 lights) is confirmed near the main stage as requested. The website listing and the speaker promotion are both waiting on these two assets.",
    actionLabel:"Send reminder", secondaryLabel:"Open exhibitor", group:"Work",
    fields:[{k:"Exhibitor",v:"Peak Health Labs"},{k:"Stand",v:"B14"},{k:"Readiness",v:"78%"},{k:"Owner",v:"Daniel Murray"}],
    history:[{when:"25 Sep",text:"Asset request sent by Exhibitor Agent"},{when:"Today 07:00",text:"Still missing 2 assets"}]},
  mh:{kind:"Task", importance:"high", icon:ICONS.visits, age:"1w",
    title:"Future Men's Health · 8 stage slots unassigned",
    why:"44 of 52 confirmed. Speaker lock is 13 November.",
    detail:"Four of the open slots are on Main Stage 2 on Saturday afternoon. The Production Agent has a shortlist ready.",
    actionLabel:"Open programme", secondaryLabel:"Assign", group:"Work",
    fields:[{k:"Slots",v:"52"},{k:"Confirmed",v:"44"},{k:"Open",v:"8"},{k:"Owner",v:"Sarah Keane"}],
    history:[{when:"20 Sep",text:"Two speakers declined"},{when:"Today 07:00",text:"Flagged by Ops Watchdog"}]},
  brennan:{kind:"Alert", importance:"high", icon:ICONS.health, age:"3d",
    title:"Dr Aoife Brennan · presentation overdue",
    why:"First-cut deck was due 24 Sep. AV handover for Main Stage 1 is blocked.",
    detail:"Her slot came with Nova Fertility Clinic's package. Two automatic reminders sent; latest reply: “I'll have this across tomorrow.”",
    actionLabel:"Review production", secondaryLabel:"Nudge", group:"Alerts",
    fields:[{k:"Session",v:"Understanding Your Fertility Window"},{k:"Stage",v:"Main Stage 1"},{k:"Reminders",v:"2"},{k:"Owner",v:"Sarah Keane"}],
    history:[{when:"25 Sep",text:"Reminder #1 sent automatically"},{when:"26 Sep",text:"Reminder #2 sent automatically"}]},
  canada:{kind:"Approval", importance:"normal", icon:ICONS.approvals, age:"5d",
    title:"Canada Pilot · 6 localisation decisions",
    why:"27 workflows cloned from Dublin. Currency, tax and venue still open.",
    detail:"Everything that made Dublin work has been cloned: workflows, email sequences, contract templates, exhibitor and production flows. What's left is local: currency, tax treatment, venue, payment provider, exhibitor terms and ticket tax.",
    actionLabel:"View rollout", secondaryLabel:"Assign", group:"Approvals",
    fields:[{k:"Template",v:"Future Fertility Dublin"},{k:"Cloned",v:"27 / 27"},{k:"Open decisions",v:"6"},{k:"Owner",v:"Nikki Dwyer"}],
    history:[{when:"22 Sep",text:"Clone completed"},{when:"Today 07:00",text:"Included in morning briefing"}]}
};
const ORDER = ["nova","peak","mh","brennan","canada"];

const ANSWERS = {
  money:{tool:"finance_debtors", effect:"read",
    text:"Five accounts owe deposits, €23,800 in total. Nova Fertility Clinic is the one to act on today: €5,400 four days late on a signed €18,000 deal, and their tickets are held until it lands. Oakline Nutrition is the oldest at 19 days.",
    cols:["Account","Amount","Days","Next step"],
    rows:[["Oakline Nutrition","€3,150","19d","Owner call today"],["Bright Path Fertility","€4,380","15d","Escalate to Nikki"],["Evergreen Women's Clinic","€5,420","9d","Reminder #3 Tue"],["Summit Men's Clinic","€5,450","7d","Reminder #3 Wed"],["Nova Fertility Clinic","€5,400","4d","Call Mon"]],
    actions:[["Send the Nova reminder",1],["Open Finance debtors",0]]},
  ready:{tool:"exhibitors_readiness", effect:"read",
    text:"32 of 49 Future Fertility exhibitors are fully ready. 12 are waiting on the client and 5 need something from us. The two blocked accounts are both money: Nova Fertility Clinic and Bright Path Fertility have unpaid deposits, which holds their tickets and final floor placement.",
    cols:["Exhibitor","Readiness","Blocker","Owner"],
    rows:[["Bright Path Fertility","41%","Deposit 15 days late","Kathleen"],["Maple Fertility Coaching","45%","No floor position","Robyn"],["Nova Fertility Clinic","52%","Deposit + 4m frontage","Kathleen"],["Seed & Stem Supplements","60%","Logo + stand spec","Daniel"]],
    actions:[["Chase the four",1],["Open Exhibitors readiness",0]]},
  production:{tool:"production_decks", effect:"read",
    text:"14 decks are outstanding. Three are needed for AV review this week: Dr Aoife Brennan (Main Stage 1, three days late and blocking AV), Dr Priya Nair and Dr Emma Quinlan. Men's Health still has 8 open programme slots before speaker lock on 13 November.",
    cols:["Speaker","Session","Due","Status"],
    rows:[["Dr Aoife Brennan","Understanding Your Fertility Window","24 Sep","Blocking AV"],["Dr Priya Nair","Egg Freezing: A Practical Guide","25 Sep","Overdue"],["Dr Emma Quinlan","Male Factor Fertility","26 Sep","Overdue"]],
    actions:[["Nudge all three",1],["Open Production",0]]},
  chase:{tool:"finance_reminder_send", effect:"write", confirm:true,
    confirmSummary:"Send reminder #3 to accounts@novafertility.ie for FE-2027-0412 (€5,400, 4 days overdue), copying Kathleen Corr, with a payment link.",
    text:"Drafted in Kathleen's voice. Sending to a client is a write action, so it waits for your yes. Confirming sends exactly this draft and logs it on the Nova record.",
    actions:[["Confirm and send",1],["Edit draft",0]]},
  sync:{tool:"systems_health", effect:"read",
    text:"Every integration is healthy. Xero synced 8 minutes ago and matched six payments this morning; one match needs your approval (€3,750 from Peak Health Labs at 96%). Tokens now refresh automatically, so the old Make.com breakage that stopped invoices going out can't happen silently again.",
    actions:[["Approve the Peak match",1],["Open Reconciliation",0]]},
  canada:{tool:"events_rollout", effect:"read",
    text:"The Canada Pilot is cloned from Future Fertility Dublin: 27 of 27 workflows, 14 email sequences, 3 contract templates, 8 exhibitor and 12 production workflows. Six local decisions are outstanding: currency, tax treatment, venue, payment provider, exhibitor terms and ticket tax.",
    actions:[["View the rollout",1]]},
  growth:{tool:"growth_affiliates", effect:"read",
    text:"The Performance Nutrition Co. affiliate campaign went to 8,420 people: 214 orders, €16,850 in sales and €2,527.50 commission to Antidote at 15%. Across all affiliates that's €8,460 earned this year, on top of €41,280 in ticket campaign revenue.",
    actions:[["Open Growth",1]]},
  fallback:{tool:"core_search", effect:"read",
    text:"I can answer from every record you can see: deals, invoices, exhibitors, stands, speakers, sessions, campaigns and suppliers across both events. Try asking who owes money, who isn't ready, or what's blocking AV.",
    actions:[["Who do I need to chase for money?",0]]}
};

// Turns a plain-English filter name into a full dashboard area — the "primitive
// vibe-coding" bit: no real backend, just a seeded generator so the same phrase
// always produces the same numbers, with direction and vocabulary nudged by
// keywords in the text (expansion/growth trends up, risk/issue trends down, a
// region/cost/people/ops/customer word picks which metrics show).
function synthesizeCustomArea(name){
  const trimmed = (name || "").trim();
  if (!trimmed) return null;
  let seed = 0;
  for (let i = 0; i < trimmed.length; i++) seed = (seed * 31 + trimmed.charCodeAt(i)) >>> 0;
  const rnd = (n) => (((seed >>> (n % 24)) ^ (seed << ((n * 7) % 13))) >>> 0) % 997 / 997;
  const low = trimmed.toLowerCase();
  const has = (...words) => words.some(w => low.indexOf(w) > -1);
  const growth = has("expansion","growth","launch","scale","pilot","new site","open","opening","grow");
  const risk = has("risk","issue","delay","problem","complaint","fault","incident","churn","decline");
  const dir = risk ? -1 : (growth ? 1 : (rnd(2) > 0.45 ? 1 : -1));

  let vocab = "generic";
  if (has("scotland","ireland","wales","england","region","dublin","belfast","cork","galway","london","glasgow","edinburgh"))
    vocab = "region";
  else if (has("cost","spend","budget","saving","margin")) vocab = "cost";
  else if (has("staff","hiring","team","recruit","headcount")) vocab = "people";
  else if (has("supplier","stock","inventory","warehouse","fleet")) vocab = "ops";
  else if (has("customer","client","retention","account")) vocab = "customer";

  const V = {
    region:   {labels:["New enquiries","Orders won","Revenue","Site coverage"], unit:"EUR — 30 DAYS"},
    cost:     {labels:["Spend","Cost per job","Savings found","Budget used"], unit:"EUR — 30 DAYS"},
    people:   {labels:["Headcount","Open roles","Time to hire","Retention"], unit:"PEOPLE"},
    ops:      {labels:["Stock cover","Lead time","Stockouts","Reorders raised"], unit:"DAYS"},
    customer: {labels:["Active accounts","Repeat rate","Churn","NPS"], unit:"ACCOUNTS"},
    generic:  {labels:["Volume","Rate","Cost","Coverage"], unit:"ACTIVITY — 30 DAYS"}
  }[vocab];

  const months = ["Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug"];
  let v0 = 40 + Math.floor(rnd(1) * 220);
  const chart = months.map((m, i) => {
    v0 = Math.max(8, Math.round(v0 * (1 + dir * (0.03 + rnd(i + 3) * 0.07))));
    return [m, v0, String(v0)];
  });
  const metrics = V.labels.map((label, i) => {
    const val = 20 + Math.floor(rnd(i + 5) * 400);
    const pct = 2 + Math.round(rnd(i + 9) * 18);
    const up = dir > 0 ? rnd(i + 12) > 0.25 : rnd(i + 12) > 0.7;
    const bars = [0,1,2,3,4,5,6,7,8].map(k => 0.3 + rnd(i * 3 + k) * 0.7);
    return [label, i === 1 ? pct + "%" : String(val), (up ? "+" : "\u2212") + pct + (i === 1 ? "pt" : "%"), up ? "up" : "down", "vs last month", bars];
  });
  const capName = trimmed.replace(/\b\w/g, c => c.toUpperCase());
  const split = [
    [capName + " \u2014 direct", String(Math.round(v0 * 0.5)), "48%", 1],
    ["Existing pipeline", String(Math.round(v0 * 0.3)), "31%", 0],
    ["Everything else", String(Math.round(v0 * 0.2)), "21%", 0]
  ];
  const table = [1,2,3].map(w => [capName + " \u2014 week " + w, String(20 + Math.floor(rnd(20 + w) * 200)),
    (dir > 0 ? "+" : "\u2212") + (3 + Math.floor(rnd(23 + w) * 14)) + "%", "Auto-tagged from records mentioning \u201c" + low + "\u201d"]);
  table.push(["Everything else", String(20 + Math.floor(rnd(30) * 200)), "\u2014", "Baseline"]);
  return {
    id: trimmed, label: capName, color: "var(--accent)", owner: "CUSTOM FILTER",
    description: "Generated from \u201c" + trimmed + "\u201d \u2014 a plain-English filter, not a registered metric set. Refine it and Pulse will tighten this up.",
    kind: "columns", chartTitle: capName + " over time", chartUnit: V.unit,
    chart, splitTitle: "Where \u201c" + low + "\u201d shows up", split,
    tableCols: ["Item","Value","Change","Note"], table,
    metrics, legend: [capName, "Pipeline", "Other"]
  };
}

function pickAnswer(q){
  const s = q.toLowerCase();
  if (/confirm|send the nova|send reminder|draft/.test(s)) return ANSWERS.chase;
  if (/chase|money|owe|debtor|deposit|overdue|invoice|paid|cash/.test(s)) return ANSWERS.money;
  if (/ready|exhibitor|stand|floor|asset/.test(s)) return ANSWERS.ready;
  if (/deck|speaker|av\b|production|programme|slot|nudge/.test(s)) return ANSWERS.production;
  if (/canada|clone|rollout|pilot/.test(s)) return ANSWERS.canada;
  if (/affiliate|campaign|audience|ticket|growth/.test(s)) return ANSWERS.growth;
  if (/sync|xero|integration|token|match|reconcil|health|hubspot/.test(s)) return ANSWERS.sync;
  return ANSWERS.fallback;
}

const ORGS = [
  ["Nova Fertility Clinic","Exhibitor","€5,400","4 days","overdue"],
  ["Peak Health Labs","Exhibitor","€0","—","active"],
  ["European Fertility Network","Sponsor","—","—","contract sent"],
  ["Oakline Nutrition","Exhibitor","€3,150","19 days","overdue"],
  ["Lumacast Audio Visual","Supplier","—","—","active"],
  ["Performance Nutrition Co.","Partner","—","—","active"]
];
const TEAMS = [
  ["Sales","2 members","Kathleen Corr","deals, contracts, discounts"],
  ["Event Operations","2 members","Robyn Walsh","floor plan, staff, suppliers"],
  ["Production","1 member","Sarah Keane","speakers, programme, AV"],
  ["Management","1 member","Nikki Dwyer","everything"]
];
const LOCATIONS = [
  ["Dublin office","Dublin, Ireland","7 staff","active"],
  ["RDS Dublin","Ballsbridge, Dublin 4","event venue","13–14 Mar 2027"],
  ["Canada Pilot","Location TBD","—","planning"]
];

const AGENT_DEFS = [
  {id:"nova", name:"Nova Fertility handover", shape:"rim-capsule", tint:"#1b2430", state:"working", group:true,
   members:["revenue","exhibitor","production"], role:"Revenue, Exhibitor and Production agents working the same signed deal",
   when:"09:12", preview:"revenue: deposit still out, 4 days.",
   thread:[
     {kind:"stamp", text:"Today 09:04"},
     {kind:"routine", text:"Ran routine", routine:"Signed deal follow-through"},
     {kind:"agent", from:"revenue", text:"Nova Fertility Clinic signed at €18,000 on 16 Sep. both invoices went out automatically: €5,400 deposit (now 4 days late) and €12,600 balance for 1 February."},
     {kind:"agent", from:"exhibitor", text:"stand A07 is provisional until the deposit clears. they've asked for 4m frontage and A07 only gives 3m. A05 is free and gives 4m."},
     {kind:"agent", from:"production", text:"their Main Stage slot is Dr Aoife Brennan. her deck was due 24 Sep and it's blocking AV review for Main Stage 1."},
     {kind:"user", text:"move them to A05 and nudge Dr Brennan"},
     {kind:"agent", from:"exhibitor", text:"move request raised for Robyn's approval. the floor plan will update once she says yes."},
     {kind:"agent", from:"production", text:"nudge sent on WhatsApp in Sarah's name. i'll flag it again tomorrow at 10:00 if nothing lands."}
   ]},
  {id:"briefing", name:"Briefing", shape:"crown-pebble", tint:"#191c1f", state:"complete", role:"Reads both events every morning and tells Nikki what needs her",
   when:"07:02", preview:"morning nikki. five things today, nova first.",
   thread:[
     {kind:"stamp", text:"Today 07:00"},
     {kind:"routine", text:"Ran routine", routine:"Morning briefing"},
     {kind:"agent", text:"morning Nikki.", lines:[
       {k:"Money", v:"€5,400 remains overdue from Nova Fertility Clinic"},
       {k:"Production", v:"14 speaker decks outstanding"},
       {k:"Exhibitors", v:"87 contracted across Dublin 2027"},
       {k:"Programme", v:"8 Future Men's Health slots open"},
       {k:"Assets", v:"Peak Health Labs is missing two assets"}]},
     {kind:"agent", text:"overnight i reconciled six payments and sent eleven reminders. nothing else needs you."},
     {kind:"user", text:"what's the one thing"},
     {kind:"agent", text:"the Nova deposit. it's holding their tickets and their floor position. Kathleen is calling Monday; i can send reminder #3 now if you want."}
   ]},
  {id:"ops", name:"Ops Watchdog", shape:"shield", tint:"#2b1b1e", state:"attention", role:"Watches deadlines, blockers, supplier delays and conflicts across both events",
   when:"06:40", preview:"speaker lock at risk. 2 floor-plan conflicts.",
   thread:[
     {kind:"stamp", text:"Today 06:40"},
     {kind:"agent", text:"three things are drifting:", lines:[
       {k:"Speaker lock", v:"13 Nov · 8 Men's Health slots still open"},
       {k:"Floor plan", v:"2 conflicts · Nova frontage, Ferro power at C22"},
       {k:"Canada Pilot", v:"27 workflows cloned · 6 localisation decisions open"}]},
     {kind:"agent", text:"suppliers are fine. Lumacast Audio Visual needs the final stage plot by 30 Oct and has everything else."},
     {kind:"user", text:"who owns the canada decisions"},
     {kind:"agent", text:"you, all six. currency and venue unblock the rest; tax and ticket tax need the accountant."}
   ]},
  {id:"revenue", name:"Revenue Agent", shape:"executive-capsule", tint:"#2a2118", state:"waiting", role:"Pipeline, contracts, invoice schedules, deposits, debtors and forecast",
   when:"08:10", preview:"one payment match waiting for your yes.",
   thread:[
     {kind:"stamp", text:"Today 08:10"},
     {kind:"agent", text:"matched six Xero payments overnight. one needs you: €3,750 with reference PEAKHLTH looks like Peak Health Labs' deposit, 96% confidence."},
     {kind:"user", text:"who do i need to chase for money"},
     {kind:"agent", text:"five deposits, €23,800 in total:", lines:[
       {k:"Oakline Nutrition", v:"€3,150 · 19 days"},
       {k:"Bright Path Fertility", v:"€4,380 · 15 days"},
       {k:"Evergreen Women's Clinic", v:"€5,420 · 9 days"},
       {k:"Summit Men's Clinic", v:"€5,450 · 7 days"},
       {k:"Nova Fertility Clinic", v:"€5,400 · 4 days"}]},
     {kind:"agent", text:"all five are on the reminder sequence. Nova matters most because their tickets and stand are held on it."}
   ]},
  {id:"exhibitor", name:"Exhibitor Agent", shape:"low-dome", tint:"#241b2e", state:"working", role:"Onboarding, assets, stands, floor plan, entitlements and readiness",
   when:"08:30", preview:"11 reminders sent. peak still missing 2 assets.",
   thread:[
     {kind:"stamp", text:"Today 08:30"},
     {kind:"agent", text:"sent 11 asset reminders overnight and updated 4 fulfilment records. Peak Health Labs is at 78%: logo SVG and Dr Tierney's headshot are still missing."},
     {kind:"user", text:"who isn't ready for future fertility"},
     {kind:"agent", text:"17 of 49 aren't fully ready. the blocked ones are money, not paperwork:", lines:[
       {k:"Bright Path Fertility", v:"41% · deposit 15 days late"},
       {k:"Maple Fertility Coaching", v:"45% · no floor position"},
       {k:"Nova Fertility Clinic", v:"52% · deposit + 4m frontage"}]}
   ]},
  {id:"production", name:"Production Agent", shape:"control-cube", tint:"#16241f", state:"thinking", role:"Speakers, sessions, decks, programme gaps and AV readiness",
   when:"08:45", preview:"3 decks due for av review this week.",
   thread:[
     {kind:"stamp", text:"Today 08:45"},
     {kind:"agent", text:"14 decks outstanding. three are needed for AV review this week: Dr Aoife Brennan, Dr Priya Nair and Dr Emma Quinlan."},
     {kind:"agent", text:"Dr Brennan is the blocker: 3 days late, two reminders sent, latest reply “I'll have this across tomorrow.”"},
     {kind:"user", text:"and men's health"},
     {kind:"agent", text:"44 of 52 slots confirmed, 8 open. i've a shortlist of six speakers who fit the Saturday afternoon gaps on Main Stage 2."}
   ]},
  {id:"growth", name:"Growth Agent", shape:"offset-pebble", tint:"#191c1f", state:"working", role:"Campaigns, ticket sales, content, audience and affiliates",
   when:"Fri", preview:"affiliate campaign: 214 orders, €2,527.50 commission.",
   thread:[
     {kind:"stamp", text:"Friday 17:30"},
     {kind:"agent", text:"Performance Nutrition Co. campaign closed: 8,420 sends, 214 orders, €16,850 in sales and €2,527.50 commission at 15%."},
     {kind:"agent", text:"2,184 tickets sold for 2027 so far. the Future Fertility early bird brought in 184 tickets and €8,832."},
     {kind:"user", text:"what next"},
     {kind:"agent", text:"the 2,910 people who came to both events are the best audience for a partner offer. i'd hold the Men's Health launch until Nikki approves the creative."}
   ]},
  {id:"eventops", name:"Event Ops Agent", shape:"glass-visor", tint:"#1b2430", state:"working", role:"Staff, suppliers, event timeline, run of show and live issues",
   when:"Thu", preview:"97 crew in the whatsapp group. roster is the source of truth.",
   thread:[
     {kind:"stamp", text:"Thursday 16:20"},
     {kind:"agent", text:"added 12 casual crew to the Dublin 2027 roster and posted the change to the WhatsApp group. 97 members now; the roster in Pulse stays the source of truth."},
     {kind:"agent", text:"suppliers: builder and AV are on schedule. security needs the final headcount by 20 Feb."},
     {kind:"user", text:"anything for event day yet"},
     {kind:"agent", text:"the run of show draft is in Events. three live-issue drills are set for the staff briefing on 10 March."}
   ]}
];

const KPI_DEFS = {
  revenue:{label:"2027 B2B revenue", value:"€684,500", delta:"+€42k", dir:"up", hint:"contracted + late stage", hero:true, ev:{ff:"€404,500", mh:"€280,000", ca:"€0"}},
  contracted:{label:"Contracted", value:"€418,000", delta:"+€31k", dir:"up", hint:"30 days", ev:{ff:"€246,000", mh:"€172,000", ca:"€0"}},
  pipeline:{label:"Pipeline", value:"€602,000", delta:"+8%", dir:"up", hint:"open deals", ev:{ff:"€338,000", mh:"€264,000", ca:"€0"}},
  cash:{label:"Cash collected", value:"€173,400", delta:"+€18k", dir:"up", hint:"30 days", ev:{ff:"€104,900", mh:"€68,500", ca:"€0"}},
  outstanding:{label:"Outstanding", value:"€91,600", delta:"€23,800 overdue", dir:"down", hint:"", ev:{ff:"€55,300", mh:"€36,300", ca:"€0"}},
  exhibitors:{label:"Exhibitors confirmed", value:"87", delta:"+9", dir:"up", hint:"this month", ev:{ff:"49", mh:"38", ca:"0"}},
  speakers:{label:"Speaker slots filled", value:"74%", delta:"+6pt", dir:"up", hint:"80 of 108", ev:{ff:"64%", mh:"85%", ca:"0%"}},
  readiness:{label:"Event readiness", value:"63%", delta:"−2pt", dir:"down", hint:"milestones on track", ev:{ff:"66%", mh:"59%", ca:"12%"}},
  tickets:{label:"Tickets sold", value:"2,184", delta:"+212", dir:"up", hint:"7 days", ev:{ff:"1,312", mh:"872", ca:"0"}},
  decks:{label:"Decks outstanding", value:"14", delta:"3 for AV", dir:"down", hint:"this week", ev:{ff:"9", mh:"5", ca:"0"}}
};

const ASPECT_DEFS = [
  {id:"sales", label:"Commercial", color:"var(--accent)", owner:"KATHLEEN CORR", description:"Deals, contracts and what is left to sell before March.",
   kind:"columns", chartTitle:"Contracted revenue by month", chartUnit:"EUR · CUMULATIVE",
   chart:[["Jun",42,"€42k"],["Jul",118,"€118k"],["Aug",236,"€236k"],["Sep",418,"€418k"],["Oct",462,"€462k"],["Nov",509,"€509k"],["Dec",548,"€548k"],["Jan",596,"€596k"],["Feb",641,"€641k"],["Mar",668,"€668k"]],
   splitTitle:"By event",
   split:[["Future Fertility","€246.0k","59%",1],["Future Men's Health","€172.0k","41%",0],["Canada Pilot","€0","0%",0]],
   tableCols:["Deal","Value","Stage","Owner"],
   table:[["European Fertility Network","€21,000","Contract Sent","Kathleen Corr"],["Nova Fertility Clinic","€18,000","Won","Kathleen Corr"],["Harbour IVF Partners","€16,500","Negotiation","Kathleen Corr"],["Atlas Hormone Clinic","€14,000","Negotiation","Daniel Murray"]],
   metrics:[["Open pipeline","€602k","+8%","up","open deals",[.4,.5,.46,.6,.58,.7,.66,.8,1]],
     ["Weighted","€371k","+€24k","up","probability-adjusted",[.5,.55,.5,.62,.6,.7,.72,.8,.9]],
     ["Average deal","€8,920","+3%","up","won deals",[.6,.58,.62,.6,.66,.64,.7,.68,.74]],
     ["Win rate","34%","+2pt","up","last 90 days",[.5,.48,.52,.5,.56,.54,.58,.6,.62]]]},
  {id:"exhibitors", label:"Exhibitors", color:"#4A72F5", owner:"ROBYN WALSH", description:"Onboarding, assets, stands and floor plan.",
   kind:"rows", rows:[["contract signed","87",87],["deposit paid","80",80],["stand spec in","72",72],["assets complete","56",56],["fully ready","54",54]], chartTitle:"Onboarding funnel", chartUnit:"EXHIBITORS",
   chart:[["Jun",8,"8"],["Jul",21,"21"],["Aug",46,"46"],["Sep",87,"87"],["Oct",94,"94"],["Nov",108,"108"],["Dec",118,"118"],["Jan",126,"126"],["Feb",131,"131"],["Mar",134,"134"]],
   splitTitle:"Readiness",
   split:[["Fully ready","54","62%",1],["Waiting on client","23","26%",0],["Internal actions","10","12%",0]],
   tableCols:["Exhibitor","Readiness","Blocker","Owner"],
   table:[["Bright Path Fertility","41%","Deposit 15 days late","Kathleen Corr"],["Nova Fertility Clinic","52%","Deposit + frontage","Kathleen Corr"],["Seed & Stem Supplements","60%","Logo + stand spec","Daniel Murray"],["Peak Health Labs","78%","Logo SVG + headshot","Daniel Murray"]],
   metrics:[["Confirmed","87","+9","up","this month",[.2,.3,.4,.5,.55,.62,.7,.8,.9]],
     ["Fully ready","54","+11","up","all steps done",[.2,.26,.3,.36,.4,.46,.5,.56,.62]],
     ["Outstanding assets","31","−14","up","logos, bios, headshots",[.9,.86,.8,.72,.66,.6,.52,.46,.4]],
     ["Floor plan placed","76%","+9pt","up","66 of 87",[.3,.36,.4,.46,.5,.56,.62,.7,.76]]]},
  {id:"finance", label:"Finance", color:"#7fd6a0", owner:"KATHLEEN CORR", description:"Invoices, cash in and what is overdue.",
   kind:"area", chartTitle:"Cash collected, then expected", chartUnit:"EUR · CUMULATIVE",
   chart:[["Jun",12,"€12k"],["Jul",41,"€41k"],["Aug",96,"€96k"],["Sep",173,"€173k"],["Oct",248,"€248k"],["Nov",292,"€292k"],["Dec",356,"€356k"],["Jan",391,"€391k"],["Feb",562,"€562k"],["Mar",612,"€612k"]],
   splitTitle:"Open invoices",
   split:[["Not yet due","€67.8k","74%",1],["Overdue 0–7 days","€10.9k","12%",0],["Overdue 8–14 days","€5.4k","6%",0],["Overdue 15+ days","€7.5k","8%",0]],
   tableCols:["Account","Amount","Days","Next step"],
   table:[["Oakline Nutrition","€3,150","19","Owner call today"],["Bright Path Fertility","€4,380","15","Escalate to Nikki"],["Evergreen Women's Clinic","€5,420","9","Reminder #3 Tue"],["Nova Fertility Clinic","€5,400","4","Call Mon"]],
   metrics:[["Cash collected","€173,400","+€18k","up","30 days",[.2,.3,.36,.44,.5,.6,.7,.8,.9]],
     ["Open invoices","€91,600","+€9k","down","incl. overdue",[.4,.44,.5,.48,.56,.6,.62,.7,.74]],
     ["Overdue","€23,800","5 accounts","down","all deposits",[.3,.34,.4,.38,.46,.5,.6,.7,.8]],
     ["Due next 30 days","€74,200","","up","incl. scheduled",[.5,.54,.58,.56,.62,.64,.66,.7,.74]]]},
  {id:"production", label:"Production", color:"#EED7D3", owner:"SARAH KEANE", description:"Speakers, programme, decks and AV readiness.",
   kind:"stacked", legend:["Future Fertility","Future Men's Health"], stacked:[["Jun",[4,3]],["Jul",[11,9]],["Aug",[22,19]],["Sep",[36,44]],["Oct",[42,48]],["Nov",[50,52]],["Dec",[54,52]],["Jan",[56,52]],["Feb",[56,52]],["Mar",[56,52]]], chartTitle:"Programme slots confirmed",
   chart:[["Jun",7,"7"],["Jul",20,"20"],["Aug",41,"41"],["Sep",80,"80"],["Oct",90,"90"],["Nov",102,"102"],["Dec",106,"106"],["Jan",108,"108"],["Feb",108,"108"],["Mar",108,"108"]],
   splitTitle:"By stage",
   split:[["Main Stage 1","82%","82%",1],["Main Stage 2","76%","76%",0],["Workshop Stage 2","70%","70%",0],["Workshop Stage 1","63%","63%",0]],
   tableCols:["Speaker","Session","Deck","Status"],
   table:[["Dr Aoife Brennan","Understanding Your Fertility Window","Overdue","Blocking AV"],["Dr Priya Nair","Egg Freezing: A Practical Guide","Overdue","AV review"],["Dr Emma Quinlan","Male Factor Fertility","Overdue","AV review"],["Dr James Richards","Optimising Men's Health Before 40","Outstanding","Chasing"]],
   metrics:[["Speakers confirmed","83","+7","up","of 96",[.4,.5,.56,.6,.66,.7,.74,.8,.86]],
     ["Decks received","69","+12","up","of 83",[.2,.3,.36,.44,.5,.56,.64,.72,.83]],
     ["Decks outstanding","14","3 for AV","down","this week",[.8,.74,.7,.62,.56,.5,.44,.4,.36]],
     ["Slots filled","74%","+6pt","up","80 of 108",[.3,.4,.44,.5,.56,.6,.66,.7,.74]]]},
  {id:"growth", label:"Growth", color:"#f0a44b", owner:"AMY BYRNE", description:"Audience, ticket campaigns, content and affiliates.",
   kind:"funnel", funnel:[["Known audience","25,438","—",25438],["Active subscribers","21,804","86% of audience",21804],["Opened a 2027 email","11,337","52% of subscribers",11337],["Bought a 2027 ticket","2,184","19% of openers",2184]], chartTitle:"Audience to ticket", chartUnit:"PEOPLE",
   chart:[["Jun",120,"120"],["Jul",410,"410"],["Aug",1020,"1,020"],["Sep",2184,"2,184"],["Oct",2900,"2,900"],["Nov",3800,"3,800"],["Dec",4700,"4,700"],["Jan",6100,"6,100"],["Feb",8200,"8,200"],["Mar",10400,"10,400"]],
   splitTitle:"Revenue beyond tickets",
   split:[["Campaign revenue","€41,280","83%",1],["Affiliate commission","€8,460","17%",0]],
   tableCols:["Campaign","Sent","Opened","Revenue"],
   table:[["Future Fertility Early Bird","9,214","52%","€8,832"],["Performance Nutrition Co.","8,420","47%","€2,527.50 comm."],["Men's Health launch","awaiting approval","—","—"],["Speaker reveal #1","12,340","49%","€6,480"]],
   metrics:[["Known audience","25,438","+412","up","30 days",[.5,.54,.58,.6,.64,.68,.72,.76,.8]],
     ["Tickets sold","2,184","+212","up","7 days",[.1,.14,.2,.3,.36,.44,.56,.7,.86]],
     ["Campaign revenue","€41,280","+€8.8k","up","2027 to date",[.2,.26,.32,.4,.48,.56,.64,.74,.84]],
     ["Affiliate commission","€8,460","+€2.5k","up","2026 to date",[.2,.24,.3,.36,.4,.5,.6,.7,.8]]]}
];

const FILTER_GROUPS = [
  {title:"AREA", items:["Commercial","Exhibitors","Finance","Production","Growth"]},
  {title:"EVENT", items:["Future Fertility","Future Men's Health","Canada Pilot"]},
  {title:"TIME", items:["This week","This month","To event day","Year to date"]}
];

const OPS_DEFS = [
  {id:"o1", name:"New exhibitor won", kind:"automation", owner:"Exhibitor Agent", ownerKind:"agent", initials:"EX",
   trigger:"Deal marked Won", triggerKind:"event", next:"Event-based", last:"Nova Fertility Clinic · 11 of 11 steps", status:"healthy", rate:99, on:true,
   what:"The moment a deal is won, one record becomes everything the team needs: invoices, onboarding, stand, floor plan, marketing obligations, speaker record and tickets.",
   why:"Every signed deal used to be retyped into Xero, three spreadsheets and a Google Form. When the Make.com link broke, invoices simply stopped going out.",
   saved:"22 hours a month",
   steps:[["Trigger","Deal marked Won in HubSpot or Pulse"],["Update","Create exhibitor record"],["Update","Generate deposit and balance invoices in Xero"],["Send","Send deposit email"],
     ["Update","Create onboarding checklist"],["Send","Request logo and assets"],["Send","Request stand specifications"],["Update","Create floor-plan requirement"],
     ["Update","Create marketing obligations"],["Check","Create speaker record if a slot is included"],["Update","Issue ticket allocation"],["Send","Start pre-event communication sequence"]],
   runs:[["16 Sep 14:02","9s","ok","Nova Fertility Clinic · 11 records","€0.03"],["14 Sep 10:40","8s","ok","Velocity Fitness Studios · 9 records","€0.03"],["5 Sep 16:18","9s","ok","Peak Health Labs · 11 records","€0.03"]]},
  {id:"o2", name:"Payment overdue", kind:"automation", owner:"Revenue Agent", ownerKind:"agent", initials:"RV",
   trigger:"Invoice past due date", triggerKind:"event", next:"Daily 09:00", last:"5 accounts in sequence", status:"approval", rate:96, on:true,
   what:"Spots an overdue invoice, updates the account, sends the reminder, tells the owner and escalates to Nikki if it keeps going.",
   why:"Chasing happened in bursts when someone remembered, so the oldest debt got the least attention.",
   saved:"9 hours a month",
   steps:[["Trigger","Invoice passes its due date"],["Update","Mark the account overdue and hold tickets"],["Send","Email reminder (day 1, day 3)"],["Send","Notify the deal owner"],["Approval","Escalate to Nikki after 14 days","gate"]],
   runs:[["Today 09:00","14s","partial","4 sent · 1 escalation waiting","€0.02","Bright Path Fertility passed 14 days"],["Yesterday 09:00","12s","ok","5 sent","€0.02"],["Fri 09:00","11s","ok","3 sent","€0.01"]]},
  {id:"o3", name:"Speaker confirmed", kind:"automation", owner:"Production Agent", ownerKind:"agent", initials:"PR",
   trigger:"Speaker confirms", triggerKind:"event", next:"Event-based", last:"Orla Kenny · 8 of 8 steps", status:"healthy", rate:98, on:true,
   what:"Turns a yes from a speaker into a speaker record, asset requests, a session, a content room, a deck deadline, a marketing slot and an AV handover line.",
   why:"Speakers were tracked across WhatsApp groups and a sheet, so decks and headshots arrived late or not at all.",
   saved:"14 hours a month",
   steps:[["Trigger","Speaker confirms"],["Update","Create speaker record"],["Send","Request bio"],["Send","Request headshot"],["Update","Assign session"],["Update","Add content-room task"],["Update","Create deck deadline"],["Update","Add to marketing queue"],["Update","Prepare AV handover"]],
   runs:[["23 Sep 11:20","6s","ok","Orla Kenny","€0.01"],["19 Sep 15:02","6s","ok","Dr Ciara Moloney","€0.01"],["12 Sep 10:15","7s","ok","Rob Lipsett","€0.01"]]},
  {id:"o4", name:"Exhibitor asset reminders", kind:"routine", owner:"Exhibitor Agent", ownerKind:"agent", initials:"EX",
   trigger:"Daily, 07:30", triggerKind:"schedule", next:"Tomorrow", last:"11 reminders sent", status:"healthy", rate:97, on:true,
   what:"Checks every exhibitor for missing logos, bios, headshots and stand specs, and chases in the owner's name.",
   why:"The old Google Form → download → folder → social flow lost assets between steps.",
   saved:"8 hours a month",
   steps:[["Trigger","Every day at 07:30"],["Find","Exhibitors with missing assets"],["Check","Skip anyone chased in the last 48 hours"],["Send","Personal reminder with upload link"],["Update","Log it on the fulfilment record"]],
   runs:[["Today 07:30","21s","ok","11 reminders","€0.02"],["Yesterday 07:30","19s","ok","9 reminders","€0.02"]]},
  {id:"o5", name:"Morning briefing", kind:"routine", owner:"Briefing Agent", ownerKind:"agent", initials:"BR",
   trigger:"Daily, 07:00", triggerKind:"schedule", next:"Tomorrow", last:"Delivered 07:02", status:"healthy", rate:100, on:true,
   what:"Reads both events overnight and tells Nikki the few things that actually need her.",
   why:"Nikki was opening HubSpot, Xero, three sheets and WhatsApp before her first coffee.",
   saved:"10 hours a month",
   steps:[["Trigger","Every day at 07:00"],["Find","Overnight changes across money, exhibitors, production and growth"],["Check","Drop anything already handled"],["Draft","Write the briefing"],["Send","Post to Home and WhatsApp"]],
   runs:[["Today 07:00","22s","ok","1 briefing","€0.02"],["Yesterday 07:00","19s","ok","1 briefing","€0.02"]]},
  {id:"o6", name:"Deck deadline chase", kind:"routine", owner:"Production Agent", ownerKind:"agent", initials:"PR",
   trigger:"Deck past due", triggerKind:"event", next:"Tomorrow 10:00", last:"3 overdue · 2 reminders each", status:"approval", rate:91, on:true,
   what:"Chases late decks on WhatsApp and email, flags anything blocking AV review and hands Sarah the list.",
   why:"Late decks meant formatting over the weekend before the event.",
   saved:"6 hours a month",
   steps:[["Trigger","Deck passes its deadline"],["Send","WhatsApp nudge"],["Send","Email reminder after 24 hours"],["Check","Is it blocking AV review?"],["Approval","Sarah decides whether to escalate","gate"]],
   runs:[["Today 10:00","8s","partial","3 chased · Brennan blocking AV","€0.01"],["Yesterday 10:00","7s","ok","2 chased","€0.01"]]},
  {id:"o7", name:"Xero payment matching", kind:"automation", owner:"Revenue Agent", ownerKind:"agent", initials:"RV",
   trigger:"Hourly", triggerKind:"schedule", next:"In 52 min", last:"6 matched · 2 unmatched", status:"healthy", rate:97, on:true,
   what:"Matches bank payments to invoices, marks them paid in Xero and HubSpot, and asks for a yes when confidence is below 98%.",
   why:"Payments sat unmatched for weeks and exhibitors got chased for money they had already paid.",
   saved:"12 hours a month",
   steps:[["Trigger","Every hour"],["Find","New bank payments"],["Check","Match to open invoices"],["Approval","Human yes below 98% confidence","gate"],["Update","Mark paid in Xero and HubSpot"]],
   runs:[["Today 08:00","3s","ok","6 matched · 1 needs a yes","€0.00"],["Today 07:00","2s","ok","0 new","€0.00"]]},
  {id:"o8", name:"Canada Pilot clone", kind:"task", owner:"Nikki Dwyer", ownerKind:"person", initials:"ND",
   trigger:"Manual", triggerKind:"event", next:"Waiting on decisions", last:"27 of 27 workflows cloned", status:"approval", rate:100, on:true,
   what:"Clones the Future Fertility Dublin operating model into a new event, then lists the local decisions it can't make on its own.",
   why:"Dublin used to be a pile of processes. Now it's a template.",
   saved:"20 hours a month",
   steps:[["Trigger","Nikki starts a new event from a template"],["Update","Clone 27 workflows and 14 email sequences"],["Update","Clone 3 contract templates"],["Check","List localisation decisions"],["Approval","Nikki signs off the six decisions","gate"]],
   runs:[["22 Sep 12:10","41s","ok","27 workflows · 6 decisions raised","€0.06"]]},
  {id:"o9", name:"Crew roster to WhatsApp", kind:"routine", owner:"Event Ops Agent", ownerKind:"agent", initials:"EO",
   trigger:"Roster changes", triggerKind:"event", next:"Event-based", last:"12 crew added", status:"healthy", rate:99, on:true,
   what:"Posts roster changes, shift times and call sheets into the crew WhatsApp group. Pulse stays the source of truth.",
   why:"Around 100 casual staff were managed from one phone.",
   saved:"7 hours a month",
   steps:[["Trigger","A shift or role changes"],["Draft","Write the crew update"],["Send","Post to the WhatsApp group"],["Update","Log who has confirmed"]],
   runs:[["Thu 16:20","5s","ok","12 crew added","€0.01"]]},
  {id:"o10", name:"Make.com legacy scenarios", kind:"automation", owner:"Ops Watchdog", ownerKind:"agent", initials:"OW",
   trigger:"Retiring", triggerKind:"schedule", next:"Last one off 4 Oct", last:"3 of 4 retired", status:"failed", rate:74, on:false,
   what:"The old HubSpot → Make.com → Xero chain. Kept read-only while the last scenario (HubSpot ↔ Xero contact sync) moves into Pulse.",
   why:"When the API token changed, invoices stopped being issued and nobody noticed for days.",
   saved:"0 hours a month",
   steps:[["Trigger","HubSpot deal stage change"],["Send","Make.com scenario","external"],["Send","Xero invoice","external"],["Update","Google Sheet row"]],
   runs:[["3 Jul 02:14","1.2s","failed","0 invoices","€0.00","401: token revoked · invoices not issued"],["2 Jul 23:14","4s","ok","2 invoices","€0.01"]]}
];

const OPS_FILTERS = [
  ["all","All"], ["routine","Agent routines"], ["automation","Automations"],
  ["report","Scheduled reports"], ["task","Recurring tasks"], ["approval","Needs approval"], ["failed","Failed"]
];

const WORK_SECTIONS = [
  {id:"tasks", label:"Tasks", blurb:"Everything assigned to you or your team, in one permission-filtered list.",
   views:["All tasks","Due tasks","Review","Done"], filters:["Due date","Any status","Anyone","Any due date"]},
  {id:"approvals", label:"Approvals", blurb:"Requests and their steps. Every decision is written as the person who made it.",
   views:["Awaiting you","Awaiting others","Decided"], filters:["Raised date","Any value","Anyone"]},
  {id:"workflows", label:"Workflows", blurb:"Automations and agent routines — what runs on its own, and who owns it.",
   views:[], filters:[]},
  {id:"schedules", label:"Schedules", blurb:"The team calendar: when recurring work fires and what it costs the week.",
   views:[], filters:[]}
];

const WORK_TASKS = [
  {id:"w1", title:"Chase Nova Fertility deposit", status:"In progress", priority:"High", who:"KC",
   due:"4d overdue", late:true, client:"Nova Fertility Clinic", day:"Today", mins:"15 mins", view:"Due tasks"},
  {id:"w2", title:"Confirm Peak Health floor position", status:"Review", priority:"Medium", who:"ND",
   due:"Due today", late:false, client:"Peak Health Labs", day:"Today", mins:"10 mins", view:"Review"},
  {id:"w3", title:"Format Dr Brennan deck", status:"Not started", priority:"High", who:"SK",
   due:"Blocked · deck late", late:true, client:"Dr Aoife Brennan", day:"Tue", mins:"2 hours", view:"Due tasks"},
  {id:"w4", title:"Approve Men's Health campaign", status:"Review", priority:"Medium", who:"ND",
   due:"Due Tue 09:00", late:false, client:"Future Men's Health", day:"Tue", mins:"10 mins", view:"Review"},
  {id:"w5", title:"Confirm electrical requirements with builder", status:"In progress", priority:"High", who:"RW",
   due:"Due Wed", late:false, client:"Brightwell Exhibition Build", day:"Wed", mins:"45 mins", view:"All tasks"},
  {id:"w6", title:"Fill 8 Men's Health programme slots", status:"In progress", priority:"High", who:"SK",
   due:"Speaker lock 13 Nov", late:false, client:"Future Men's Health", day:"Any day", mins:"Ongoing", view:"All tasks"},
  {id:"w7", title:"Sign off Canada localisation decisions", status:"Not started", priority:"Medium", who:"ND",
   due:"Fri", late:false, client:"Canada Pilot", day:"Fri", mins:"1 hour", view:"All tasks"},
  {id:"w8", title:"Send European Fertility Network contract reminder", status:"Done", priority:"Medium", who:"KC",
   due:"Done Friday", late:false, client:"European Fertility Network", day:"Fri", mins:"5 mins", view:"Done", done:true}
];

const WORKFLOWS = [
  {name:"New exhibitor won", state:"live", trigger:"event · deal.won",
   actions:[["xero.invoice.create","external"],["exhibitor.create","write"]], lastRun:"16 Sep 14:02",
   result:"11 records created", resultKind:"ok", runSummary:"14 ok",
   runs:["ok","ok","ok","ok","ok","ok","ok","ok","ok","ok","ok","ok","ok","ok"]},
  {name:"Payment overdue", state:"live", trigger:"schedule · daily 09:00",
   actions:[["notify.email","write"],["tasks.create","write"]], lastRun:"Today 09:00",
   result:"4 sent · 1 escalation", resultKind:"warn", runSummary:"12 ok · 2 partial",
   runs:["ok","ok","ok","partial","ok","ok","ok","ok","ok","ok","ok","ok","ok","partial"]},
  {name:"Speaker confirmed", state:"live", trigger:"event · speaker.confirmed",
   actions:[["speaker.create","write"],["notify.whatsapp","external"]], lastRun:"23 Sep 11:20",
   result:"ok", resultKind:"ok", runSummary:"14 ok",
   runs:["ok","ok","ok","ok","ok","ok","ok","ok","ok","ok","ok","ok","ok","ok"]},
  {name:"Make.com legacy chain", state:"failing", trigger:"retiring · 1 scenario left",
   actions:[["make.scenario","external"]], lastRun:"3 Jul 02:14",
   result:"token revoked · invoices not issued", resultKind:"bad", runSummary:"retired",
   runs:["ok","ok","ok","ok","ok","ok","ok","ok","ok","ok","failed","failed","idle","idle"]}
];

const SCHEDULES = [
  {id:"s1", name:"Morning briefing", cadence:"Every day · 07:00", next:"Tomorrow 07:00", owner:"Briefing Agent", on:true, day:1},
  {id:"s2", name:"Exhibitor asset reminders", cadence:"Daily · 07:30", next:"Tomorrow 07:30", owner:"Exhibitor Agent", on:true, day:1},
  {id:"s3", name:"Payment overdue sequence", cadence:"Daily · 09:00", next:"Tomorrow 09:00", owner:"Revenue Agent", on:true, day:1},
  {id:"s4", name:"Deck deadline chase", cadence:"Daily · 10:00", next:"Tomorrow 10:00", owner:"Production Agent", on:true, day:2},
  {id:"s5", name:"Weekly pipeline review", cadence:"Mondays · 08:30", next:"Mon 08:30", owner:"Kathleen Corr", on:true, day:0},
  {id:"s6", name:"Floor-plan sync to builder", cadence:"Fridays · 16:00", next:"Fri 16:00", owner:"Robyn Walsh", on:true, day:4}
];

const WIDGET_DEFS = [["briefing","Morning briefing"],["inbox","Today's priorities"],["work","My work"],["activity","Activity"],["kpi","Today's numbers"]];
const WORK_WIDGETS = [
  {id:"queue", label:"My queue", value:"7", hint:"assigned to you", icon:"work", queue:"mine"},
  {id:"late", label:"Running late", value:"3", hint:"past their due date", icon:"health", queue:"overdue"},
  {id:"unassigned", label:"Unassigned", value:"2", hint:"nobody owns it yet", icon:"teams", queue:"unassigned"},
  {id:"week", label:"Next 7 days", value:"9", hint:"due this week", icon:"visits", queue:"upcoming"}
];
const PERSONALITIES = ["Straight-talking","Warm","Formal","Dry"];
const ANSWER_STYLES = ["Short answers","Show the working","Ask before acting"];
/* Every context source and every registered tool the agent could be granted —
   the builder shows the whole catalogue, grouped, rather than a sample. */
const CONTEXT_DEFS = [
  ["Companies","records","Clinics, brands, partners and their history"],
  ["Contacts","records","Exhibitor, sponsor and supplier people"],
  ["Files","records","Contracts, floor plans and decks"],
  ["Tasks","work","Queues, owners, due dates"],
  ["Exhibitors","work","Onboarding, stands, assets"],
  ["Speakers","work","Sessions, decks, AV"],
  ["Invoices","money","Deposits, balances, overdue"],
  ["Deals","money","Pipeline, packages, contracts"],
  ["Payments","money","Bank matches and receipts"],
  ["Activity log","system","Every event, agent and human"],
  ["Campaigns","system","Audience, tickets, affiliates"],
  ["Events","system","Timelines, staff, suppliers"]
];
const CONTEXT_SOURCES = CONTEXT_DEFS.map(c => c[0]);
const SKILL_DEFS = [
  ["Search records","read"],["Summarise activity","read"],["Read invoices","read"],
  ["Read the floor plan","read"],["Check permissions","read"],
  ["Draft email","write"],["Create task","write"],["Update record","write"],
  ["Move a stand","write"],["Raise approval","write"],
  ["Send email","external"],["Send WhatsApp","external"],["Post to Xero","external"],["Push to HubSpot","external"]
];
/* The two questions the agent asks back once it knows the job. */
const TRAIN_PHASES = [
  ["Reading the whole ontology", "6,410 records"],
  ["Learning how this business words things", "exhibitor → partner"],
  ["Researching consumer health events", "12 sources"],
  ["Writing its own system prompt", "1,240 tokens"]
];
const BRIEF_QUESTIONS = [
  {title:"What should it cover?", sub:"Pick as many as you like, we can refine later.",
   options:[["Money","Deposits, overdue and cash"],["Exhibitors","Readiness, assets, floor plan"],
            ["Production","Decks, programme gaps, AV"],["Growth","Tickets, campaigns, affiliates"],
            ["Something else","Tell me in the next message"]]},
  {title:"When should it land?", sub:"One is enough to start.",
   options:[["Every morning 07:00","Before the day starts"],["Weekdays 08:00","Monday to Friday only"],
            ["Only when something changes","Event-driven, no noise"],["On demand","When you ask for it"]]}
];
/* The words under a name, keyed to the same state the face lights with. */
const STATE_LABELS = {working:"working", thinking:"thinking", waiting:"waiting on you",
  complete:"up to date", attention:"needs you", idle:"idle"};

const FACE_SHAPES = [
  ["crown-pebble","Crown pebble"],["executive-capsule","Executive capsule"],["shield","Shield"],
  ["glass-visor","Glass visor"],["control-cube","Control cube"],["low-dome","Low dome"],
  ["offset-pebble","Offset pebble"],["rim-capsule","Rim capsule"],["wide-eyed","Wide-eyed"],
  ["precision-brow","Precision brow"],["tall-unit","Tall unit"],["soft-asymmetric","Soft asymmetric"]
];
/* Shell colours only — deliberately desaturated so none of them reads as a
   state. The eyes, rim and dots always carry the state colour. */
const FACE_TINTS = [
  ["#191c1f","Graphite"],["#1b2430","Slate"],["#241b2e","Aubergine"],
  ["#2a2118","Bronze"],["#16241f","Pine"],["#2b1b1e","Oxblood"]
];

/* ---- ontology graph: generation, Dijkstra traversal, canvas render ---- */
const CLUSTERS = [
  ["Companies",           "#E0524C", 0.00, 0.62, 46],
  ["Contacts",            "#EEB8B1", 0.90, 0.70, 52],
  ["Files",               "#b06cf0", 1.75, 0.66, 58],
  ["Deals & contracts",   "#f0c04b", 2.55, 0.72, 44],
  ["Invoices",            "#7fd6a0", 3.35, 0.60, 38],
  ["Exhibitors & stands", "#4A72F5", 4.15, 0.70, 40],
  ["Speakers & sessions", "#6ad0f0", 4.95, 0.64, 30],
  ["Campaigns",           "#f0994b", 5.65, 0.72, 34]
];

function mulberry(seed){
  return function(){
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/* Hub-and-spoke clusters around a dense phyllotaxis core, in unit space
   (-1..1 on both axes) so the layout is resolution independent. */
const _hexCache = {};
function hexRGB(hex){
  if (_hexCache[hex]) return _hexCache[hex];
  const h = hex.replace("#", "");
  const v = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  _hexCache[hex] = v;
  return v;
}


function buildGraph(){
  const rnd = mulberry(20260902);
  const nodes = [], edges = [], adj = [];
  const add = (x, y, z, r, cluster, kind) => {
    nodes.push({x, y, z, r, cluster, kind}); adj.push([]); return nodes.length - 1;
  };
  const link = (a, b) => {
    const dx = nodes[a].x - nodes[b].x, dy = nodes[a].y - nodes[b].y, dz = nodes[a].z - nodes[b].z;
    const w = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.004;
    const id = edges.length;
    edges.push({a, b, w});
    adj[a].push([b, w, id]); adj[b].push([a, w, id]);
  };

  // the core is a filled sphere on a Fibonacci lattice, not a disc
  const CORE = 880, coreIds = [];
  for (let i = 0; i < CORE; i++){
    const t = (i + 0.5) / CORE;
    const phi = Math.acos(1 - 2 * t);
    const theta = i * 2.39996;
    const shell = 0.16 + 0.28 * Math.pow(rnd(), 0.5);
    const grade = rnd();
    coreIds.push(add(
      Math.sin(phi) * Math.cos(theta) * shell * 1.04,
      Math.cos(phi) * shell * 0.96,
      Math.sin(phi) * Math.sin(theta) * shell,
      grade < 0.06 ? 3.4 + rnd() * 1.4 : grade < 0.3 ? 2.1 + rnd() * 0.7 : 1.0 + rnd() * 0.8, 0, "core"));
  }
  // lattice neighbours plus a mesh of chords, so the sphere reads as a volume
  for (let i = 1; i < coreIds.length; i++){
    link(coreIds[i], coreIds[i - 1]);
    if (i >= 13) link(coreIds[i], coreIds[i - 13]);
    if (i >= 21 && i % 2 === 0) link(coreIds[i], coreIds[i - 21]);
    if (i >= 34 && i % 3 === 0) link(coreIds[i], coreIds[i - 34]);
    if (i >= 55 && i % 4 === 0) link(coreIds[i], coreIds[i - 55]);
    if (i >= 89 && i % 5 === 0) link(coreIds[i], coreIds[i - 89]);
    if (i % 6 === 0) link(coreIds[i], coreIds[Math.floor(rnd() * coreIds.length)]);
  }

  // a mid shell between the nucleus and the lobes: the layer that makes it
  // read as a network rather than a ball with satellites
  const MID = 560, midIds = [];
  for (let i = 0; i < MID; i++){
    const t = (i + 0.5) / MID;
    const phi = Math.acos(1 - 2 * t), theta = i * 2.39996 + 0.7;
    const d = 0.52 + 0.16 * Math.pow(rnd(), 0.6);
    const g2 = rnd();
    midIds.push(add(
      Math.sin(phi) * Math.cos(theta) * d * 1.02,
      Math.cos(phi) * d * 0.96,
      Math.sin(phi) * Math.sin(theta) * d,
      g2 < 0.05 ? 2.6 + rnd() * 1.0 : g2 < 0.3 ? 1.6 + rnd() * 0.6 : 0.8 + rnd() * 0.7, 0, "core"));
  }
  for (let i = 0; i < midIds.length; i++){
    if (i >= 1) link(midIds[i], midIds[i - 1]);
    if (i >= 17) link(midIds[i], midIds[i - 17]);
    if (i >= 29 && i % 2 === 0) link(midIds[i], midIds[i - 29]);
    // radial spokes tying the shell to the nucleus
    if (i % 2 === 0) link(midIds[i], coreIds[Math.floor(rnd() * coreIds.length)]);
    if (i % 9 === 0) link(midIds[i], coreIds[Math.floor(rnd() * coreIds.length)]);
  }

  // clusters ride a sphere: each hub gets its own latitude as well as longitude
  const hubs = [], clusterLeaves = [];
  const onSphere = (lon, lat, d0) => { const d = d0 * 1.22;
    return [Math.cos(lat) * Math.cos(lon) * d * 1.02, Math.sin(lat) * d * 0.96, Math.cos(lat) * Math.sin(lon) * d]; };
  CLUSTERS.forEach((c, ci) => {
    const [, , ang, dist, leaves] = c;
    const lat = (ci % 2 ? 1 : -1) * (0.26 + rnd() * 0.5);
    const wob = 1.06 + rnd() * 0.16;
    const hp = onSphere(ang, lat, dist * wob);
    const hub = add(hp[0], hp[1], hp[2], 5.4, ci, "hub");
    hubs.push(hub);
    const mine = [];
    clusterLeaves.push(mine);
    for (let k = 0; k < 3; k++) link(hub, coreIds[Math.floor(rnd() * coreIds.length)]);
    for (let k = 0; k < 5; k++) link(hub, midIds[Math.floor(rnd() * midIds.length)]);

    const subs = 5 + Math.floor(rnd() * 4);
    const subIds = [];
    for (let s = 0; s < subs; s++){
      const sa = ang + (rnd() - 0.5) * 0.52, sl = lat + (rnd() - 0.5) * 0.3;
      const sd = dist + 0.08 + rnd() * 0.18;
      const sp = onSphere(sa, sl, sd);
      const sub = add(sp[0], sp[1], sp[2], 3.2, ci, "sub");
      subIds.push(sub);
      link(sub, hub);
      if (s > 0 && rnd() < 0.7) link(sub, subIds[s - 1]);
      const fan = Math.floor((leaves * 7.4) / subs);
      const spread = 0.17 + rnd() * 0.2;
      let prev = -1;
      for (let l = 0; l < fan; l++){
        const la = sa + (rnd() - 0.5) * spread * 2 + (rnd() - 0.5) * 0.06;
        const ll = sl + (rnd() - 0.5) * spread * 1.1;
        const ld = sd + 0.03 + Math.pow(rnd(), 0.8) * 0.17;
        const lp = onSphere(la, ll, ld);
        const lg = rnd();
        const leaf = add(lp[0], lp[1], lp[2],
          lg < 0.08 ? 2.8 + rnd() * 1.2 : lg < 0.34 ? 1.8 + rnd() * 0.6 : 1.0 + rnd() * 0.7, ci, "leaf");
        link(leaf, sub);
        mine.push(leaf);
        if (rnd() < 0.14) link(leaf, hub);
        if (prev >= 0 && rnd() < 0.34) link(leaf, prev);
        if (rnd() < 0.16) link(leaf, midIds[Math.floor(rnd() * midIds.length)]);
        prev = leaf;
      }
    }
  });
  // far satellites hanging off the outer leaves
  CLUSTERS.forEach((c, ci) => {
    const [, , ang, dist] = c;
    for (let s = 0; s < 7; s++){
      const sa = ang + (rnd() - 0.5) * 1.5, sl = (rnd() - 0.5) * 1.3;
      const sd = dist + 0.42 + rnd() * 0.22;
      const ap = onSphere(sa, sl, sd);
      const anchor = add(ap[0], ap[1], ap[2], 2.4, ci, "sub");
      link(anchor, hubs[ci]);
      const n = 14 + Math.floor(rnd() * 18);
      for (let l = 0; l < n; l++){
        const la = sa + (rnd() - 0.5) * 0.9, ll = sl + (rnd() - 0.5) * 0.7;
        const ld = sd + 0.02 + Math.pow(rnd(), 0.8) * 0.18;
        const p = onSphere(la, ll, ld);
        const leaf = add(p[0], p[1], p[2], 0.8 + rnd() * 0.9, ci, "leaf");
        link(leaf, anchor);
        clusterLeaves[ci].push(leaf);
      }
    }
  });

  // two hub rings and long chords across the sphere
  hubs.forEach((h, i) => {
    link(h, hubs[(i + 1) % hubs.length]);
    link(h, hubs[(i + 2) % hubs.length]);
    if (i % 3 === 0) link(h, hubs[(i + 4) % hubs.length]);
  });
  // neighbouring clusters share records, so their leaves cross-link
  for (let ci = 0; ci < clusterLeaves.length; ci++){
    const a = clusterLeaves[ci], b = clusterLeaves[(ci + 1) % clusterLeaves.length];
    const n = 26 + Math.floor(rnd() * 16);
    for (let k = 0; k < n; k++){
      link(a[Math.floor(rnd() * a.length)], b[Math.floor(rnd() * b.length)]);
    }
    // and a good number reach right across to the far side
    for (let k = 0; k < 12; k++){
      const far = clusterLeaves[(ci + 3) % clusterLeaves.length];
      link(a[Math.floor(rnd() * a.length)], far[Math.floor(rnd() * far.length)]);
    }
    for (let k = 0; k < 8; k++){
      const far = clusterLeaves[(ci + 4) % clusterLeaves.length];
      link(a[Math.floor(rnd() * a.length)], far[Math.floor(rnd() * far.length)]);
    }
  }

  let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9, minZ = 1e9, maxZ = -1e9;
  for (const n of nodes){
    if (n.x < minX) minX = n.x; if (n.x > maxX) maxX = n.x;
    if (n.y < minY) minY = n.y; if (n.y > maxY) maxY = n.y;
    if (n.z < minZ) minZ = n.z; if (n.z > maxZ) maxZ = n.z;
  }
  const bounds = {minX, maxX, minY, maxY, cx:(minX + maxX) / 2, cy:(minY + maxY) / 2,
    cz:(minZ + maxZ) / 2, w:maxX - minX, h:maxY - minY, d:maxZ - minZ,
    radius: Math.max(maxX - minX, maxY - minY, maxZ - minZ) / 2,
    reach: nodes.reduce((m, n) => Math.max(m, Math.sqrt(n.x * n.x + n.y * n.y + n.z * n.z)), 0)};
  return {nodes, edges, adj, hubs, coreIds, bounds};
}

export {
  INK,
  BODY,
  DIM,
  FAINT,
  LIME,
  GREEN,
  AMBER,
  RED,
  NEUTRAL,
  MONO,
  ICONS,
  REC_SECTIONS,
  CONTACTS,
  FILE_TREE,
  ONTO_NODES,
  ONTO_EDGES,
  REC_TEMPLATES,
  REC_TEMPLATE_CATS,
  PEOPLE,
  ROLE_LEVELS,
  PERM_KEYS,
  GRANT_DEFS,
  ROLE_SCOPES,
  DEFAULT_PERMS,
  INTEGRATIONS,
  BG_DEFS,
  THEMES,
  ADMIN_ICONS,
  ADMIN_CARDS,
  ADMIN_GROUPS,
  SRC_TINT,
  SRC_ABBR,
  DATA_EVENTS,
  PEOPLE_EVENTS,
  AI_EVENTS,
  STREAM_DEFS,
  NAV,
  ITEMS,
  ORDER,
  ANSWERS,
  synthesizeCustomArea,
  pickAnswer,
  ORGS,
  TEAMS,
  LOCATIONS,
  AGENT_DEFS,
  KPI_DEFS,
  ASPECT_DEFS,
  FILTER_GROUPS,
  OPS_DEFS,
  OPS_FILTERS,
  WORK_SECTIONS,
  WORK_TASKS,
  WORKFLOWS,
  SCHEDULES,
  WIDGET_DEFS,
  WORK_WIDGETS,
  PERSONALITIES,
  ANSWER_STYLES,
  CONTEXT_DEFS,
  CONTEXT_SOURCES,
  SKILL_DEFS,
  TRAIN_PHASES,
  BRIEF_QUESTIONS,
  STATE_LABELS,
  FACE_SHAPES,
  FACE_TINTS,
  CLUSTERS,
  mulberry,
  _hexCache,
  hexRGB,
  buildGraph
};
