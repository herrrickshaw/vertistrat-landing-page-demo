export const SITE_NAME = "VertiStrat Solutions LLP";
export const CONTACT_EMAIL = "contact@vertistratsolution.com";
export const CONTACT_PHONE_DISPLAY = "+91 70222 59460";
export const CONTACT_PHONE_TEL = "+917022259460";
export const OFFICE_ADDRESS_LINES = [
  "Plot No. 141, Gurusamy Road",
  "Near Queen Street & VGN Monte Carlo",
  "Nolambur, Chennai 600095",
  "Tamil Nadu, India",
];
export const OFFICE_MAP_URL = "https://maps.app.goo.gl/GJttKbejiqa7yPgR6";
export const OFFICE_MAP_EMBED_URL = "https://www.google.com/maps?q=13.0698439,80.1638938&z=16&output=embed";

// Contact form delivery: our Google Form (owned by contact@vertistratsolution.com).
// GOOGLE_FORM_URL opens it full-page; GOOGLE_FORM_EMBED_URL is the same form sized for the iframe.
export const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSd--m9-cFuThNg9y9phKTJzgTD4BqaaFy_8GApDB9zJwswPXw/viewform";
export const GOOGLE_FORM_EMBED_URL = `${GOOGLE_FORM_URL}?embedded=true`;

// Replace with the firm's verified booking page when available; never invent a booking account.
export const DIAGNOSTIC_BOOKING_URL: string = "";
export const DIAGNOSTIC_CALL_URL = DIAGNOSTIC_BOOKING_URL || GOOGLE_FORM_URL;
export const LANDING_DEMO_NOTICE = "Illustrative figures for demo purposes";
export const LANDING_IMPACT = [
  { value: 98, prefix: "", suffix: "%", label: "On-Time Delivery" },
  { value: 150, prefix: "", suffix: "+", label: "Enterprise Projects" },
  { value: 40, prefix: "₹", suffix: "Cr+", label: "Capital Saved" },
  { value: 35, prefix: "", suffix: "%", label: "Average Schedule Recovery" },
] as const;
export const LANDING_STEPS = [
  { id: "diagnostic", number: "01", title: "Diagnostic & Mapping", short: "Find the real constraints.", description: "Clarity before commitment. We map the programme as it is — not as the plan says it should be — and identify the decisions that unlock delivery.", duration: "2–3 weeks", deliverables: ["Programme health & critical-path assessment", "Stakeholder, dependency & risk mapping", "Cost-to-complete and schedule baseline", "Prioritised recovery roadmap"] },
  { id: "integration", number: "02", title: "Seamless Integration", short: "Connect every workstream.", description: "One plan. One source of truth. We align your people, partners and systems around a practical delivery rhythm, with clear ownership at every handoff.", duration: "3–6 weeks", deliverables: ["Integrated master schedule", "Governance cadence & decision rights", "Vendor and workstream alignment", "Executive reporting & escalation framework"] },
  { id: "execution", number: "03", title: "Managed Execution", short: "Turn the plan into progress.", description: "We stay close to the work. From milestone reviews to issue resolution, we run the delivery engine and give your leadership the visibility to act early.", duration: "Programme lifecycle", deliverables: ["Embedded programme management", "Milestone, budget & scope controls", "Active risk and change management", "Handover and capability transfer"] },
] as const;
export const LANDING_CASES = [
  { sector: "Manufacturing", title: "Tier-1 Auto Component Manufacturer", challenge: "A plant expansion stalled between engineering and commissioning.", outcome: "From disconnected workstreams to a commissioning-ready programme.", metrics: [{ label: "Schedule variance", before: "+12 weeks", after: "+2 weeks" }, { label: "Cost exposure", before: "+18%", after: "+4%" }, { label: "Reporting cycle", before: "14 days", after: "1 day" }], detail: "This illustrative scenario brings engineering, procurement and commissioning into one critical-path plan. A weekly decision forum resolves cross-team dependencies, while a daily exception dashboard focuses leadership on actions rather than status collection. The before-and-after values demonstrate how a recovery engagement could be presented; they are not verified client results." },
  { sector: "Energy & Biofuels", title: "2G Ethanol Plant Developer", challenge: "Procurement delays put a capital-intensive energy project at risk.", outcome: "A clearer critical path. A more controlled path to completion.", metrics: [{ label: "Schedule variance", before: "+20 weeks", after: "+6 weeks" }, { label: "Cost exposure", before: "+22%", after: "+7%" }, { label: "Reporting cycle", before: "21 days", after: "2 days" }], detail: "In this demo example, a delivery diagnostic identifies equipment lead times and interface dependencies as the programme's main constraints. Procurement priorities are connected to construction readiness, and a shared milestone register makes changes visible across contractors. These figures and this developer descriptor are illustrative only, not a claim about an actual engagement." },
  { sector: "Infrastructure", title: "State Industrial Development Corporation", challenge: "Multiple contractors. Fragmented reporting. No single delivery view.", outcome: "One programme view across sites, contractors and leadership.", metrics: [{ label: "Milestones at risk", before: "38%", after: "9%" }, { label: "Open escalations", before: "42", after: "8" }, { label: "Reporting cycle", before: "30 days", after: "3 days" }], detail: "This illustrative PMO scenario unifies contractor schedules, escalation routes and executive reporting across a multi-site programme. Clear decision rights and a common issue register reduce duplicate follow-up and bring emerging risks into a single leadership view. The anonymised organisation and all outcomes are demo content, not verified case evidence." },
] as const;

export const BLOG_URL = "https://masaladeutsch.blogspot.com";
export const BLOG_POST_FEED_BASE = `${BLOG_URL}/feeds/posts/default`;
export const BLOG_FEED_URL = `${BLOG_URL}/feeds/posts/default?alt=json&max-results=12`;
export const MAX_FEATURED = 3;

export const GITHUB_USER = "herrrickshaw";
export const GITHUB_REPOS_URL = `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=6`;

// PLACEHOLDER: replace REPLACE_REPO with the repository that hosts trade_ideas.json
export const TRADE_IDEAS_URL =
  "https://raw.githubusercontent.com/herrrickshaw/REPLACE_REPO/main/trade_ideas.json";
export const TRADE_STALE_DAYS = 7;

export const DISCLAIMER =
  "Information only. Not investment advice. Not a recommendation to buy or sell any security. Replace with the firm's regulatory registration details and risk disclosures before publishing.";
