# Vertistrat – Landing Page Demo

Build a multi-page marketing website for VERTISTRAT SOLUTIONS LLP, a consulting firm for manufacturing and IT services that also does investment facilitation (the kind of work done by investment promotion agencies like Invest India or state agencies such as GITA). Do NOT claim any affiliation with those agencies, and do not invent client names, statistics or credentials. Use clearly marked placeholders where real facts are needed.

VISUAL DIRECTION: serious, modern consulting look. Deep navy ink (#0D1B2A), cool off-white background (#F1F4F5), brand blue (#14407A), and ONE amber accent (#E58A00) used sparingly (underline highlights, small markers). Fonts: Bricolage Grotesque for headings, IBM Plex Sans for body, IBM Plex Mono for small uppercase labels. Support light and dark mode. Sharp 4-6px corners, thin 1px borders, generous spacing. Logo: three ascending bars (blue, blue, amber) beside the word VertiStrat. No stock-photo clichés, no purple gradients, no emoji.

PAGES (React Router, shared header with nav and shared footer):
1. Home: hero "Strategy that goes from the policy desk to the plant floor." with a side card showing four layers: L4 Policy, L3 Plant, L2 Platform, L1 People. Then Services (two practice cards), an Investment facilitation dark band (Investor briefing, Incentive mapping, Agency liaison, Aftercare), Approach (Diagnose, Design, Deliver, Hand over), Sectors chips (Automotive and EV components, Electronics and semiconductors, Engineering goods, Pharma and medical devices, Food processing, Chemicals and specialty materials, Renewable energy equipment, Global capability centres, SaaS and IT services), a Featured articles strip (latest 3 from the blog feed, see below), and a Contact form.
2. About: why the firm exists (projects stall between layers: plant plan, incentive application and IT landscape written by different advisers that contradict each other), four principles (Recommend with reasons; Scope in writing; Independent of vendors and sites; Hand over then step back), three client types (overseas manufacturers, Indian manufacturers, IT services firms), a Partners section with three placeholder cards.
3. Manufacturing advisory: six workstreams (Feasibility and market entry, Site selection, Project reports, Approvals and incentives, Supply chain localisation, Operations improvement), a deliverables table by phase, sector chips, CTA.
4. IT services advisory: two audiences (IT services firms: delivery/GCC set-up, entity and incentives, hiring plan, build-operate-transfer, go-to-market; Manufacturers: Industry 4.0 roadmap, vendor selection, programme governance, cloud/data/cyber readiness, change management), three engagement models (Assess, Set up, Assure), CTA.
5. Insights: lists featured articles pulled live from the Masala Deutsch blog, plus three short sample explainer cards (comparing states for a plant site, build-operate-transfer, reading incentive conditions) marked "Sample draft".
6. Trade ideas: see below.

LIVE DATA INTEGRATIONS (client-side fetch, no backend needed):
- Featured articles: fetch https://masaladeutsch.blogspot.com/feeds/posts/default?alt=json&max-results=12 (this endpoint returns 200). Map feed.entry[] to title (entry.title.$t), link (entry.link where rel==='alternate'), published date, first image (media$thumbnail or first img in content.$t) and a ~160-char plain-text excerpt. Render as article cards linking out in a new tab. Put the blog URL and a MAX_FEATURED constant in src/config.ts. Show skeleton loaders, and a friendly error/empty state with a link to the blog if the fetch fails. Allow filtering by blog label/category if entry.category exists.
- Open-source work from GitHub: GitHub username is herrrickshaw. Add a small "From our GitHub" section on the Insights page listing the 6 most recently updated public repos via https://api.github.com/users/herrrickshaw/repos?sort=updated&per_page=6 (name, description, language, stars, updated date, link). Handle the unauthenticated rate limit gracefully with an error state.
- Trade ideas page: read a JSON file from GitHub raw content. Put in src/config.ts: TRADE_IDEAS_URL = 'https://raw.githubusercontent.com/herrrickshaw/REPLACE_REPO/main/trade_ideas.json' (a clearly marked placeholder to edit). Expected schema: [{ "symbol": string, "exchange": string, "action": "BUY"|"WATCH"|"SELL"|"HOLD", "entry": number|null, "target": number|null, "stop": number|null, "thesis": string, "asOf": "YYYY-MM-DD" }]. Render as a sortable, filterable table (filter by action, exchange) with coloured action pills, an "as of" date and a stale-data warning badge if asOf is older than 7 days. Include an empty state explaining how to publish a trade_ideas.json, plus a sample-data toggle that clearly labels rows "SAMPLE DATA, NOT A RECOMMENDATION". Show a prominent disclaimer block on this page and the footer: "Information only. Not investment advice. Not a recommendation to buy or sell any security. Replace with the firm's regulatory registration details and risk disclosures before publishing." Never present sample rows as real.

CONTACT FORM: validate name and message, show an inline success message. For now do not send anywhere; add a TODO comment and a config flag so it can be wired to email or a backend later.

QUALITY: fully responsive down to 360px with no horizontal scroll, visible keyboard focus states, semantic landmarks, descriptive page titles and meta descriptions per route, prefers-reduced-motion respected. Keep copy plain and direct, no filler. Email placeholder: hello@vertistrat.example.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c8917024-17a3-445d-b8dd-27a09e0ddbbd).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
