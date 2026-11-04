export type InsightItem = { title: string; url: string; postId: string; published: string; excerpt: string };
export type InsightTheme = { theme: string; slug: string; items: InsightItem[] };

export const INSIGHT_THEMES: InsightTheme[] = [
  {
    theme: "Industrial policy & incentives",
    slug: "industrial-policy",
    items: [
      { title: "Where India's Factories Actually Get Built — IEM State & Sector Analysis", url: "https://masaladeutsch.blogspot.com/2026/08/where-indias-factories-actually-get.html", postId: "2906394065511429472", published: "2026-08-02", excerpt: "DPIIT's Industrial Entrepreneurs Memoranda, Part A (intent filed) vs Part B (implemented), broken down by state and by sector." },
      { title: "IEM Conversion — A Historical Performance Review (2017–2025)", url: "https://masaladeutsch.blogspot.com/2026/08/iem-conversion-historical-performance.html", postId: "4687418058398482443", published: "2026-08-02", excerpt: "Every year of DPIIT's Industrial Entrepreneurs Memoranda since 2017: how much investment intent was filed versus how much actually got built." },
      { title: "Priority Export Destinations by Growth Sector, & Real PLI Coverage", url: "https://masaladeutsch.blogspot.com/2026/08/priority-export-destinations-by-growth.html", postId: "1687650766601616182", published: "2026-08-02", excerpt: "Maps the 12 fastest-growing, highest-value export chapters to their top destinations, and checks how much of each the PLI schemes really cover." },
      { title: "Priority Trade Partners by Import-Growth Sector, & Real PLI Coverage", url: "https://masaladeutsch.blogspot.com/2026/08/priority-trade-partners-by-import.html", postId: "2916027213729149958", published: "2026-08-02", excerpt: "Maps the 12 fastest-growing import chapters to their top supplier countries, and where PLI coverage actually reaches." },
    ],
  },
  {
    theme: "Energy, fuels & biofuels",
    slug: "energy",
    items: [
      { title: "Blending on a Budget: Energy Density and Cost Per Kilometre, Across Four Fuel Pairs", url: "https://masaladeutsch.blogspot.com/2026/08/blending-on-budget-energy-density-and.html", postId: "753290623294277289", published: "2026-08-19", excerpt: "Ethanol in petrol and isobutanol in diesel both carry less energy than the fuel they replace. What that does to cost per kilometre across four blending mandates." },
      { title: "India's Ethanol Surplus Buys About Five Blend Points. E30, Diesel and Jet Fuel Need Twice the Supply.", url: "https://masaladeutsch.blogspot.com/2026/10/indias-ethanol-surplus-buys-about-five.html", postId: "3153858344526767482", published: "2026-10-29", excerpt: "1,776 crore litres offered against a need of about 1,050 in 2025-26 — yet the surplus covers only about five more points of petrol blending." },
      { title: "Ethanol Blending & the OMC Books — E20 today vs E30 + SGST", url: "https://masaladeutsch.blogspot.com/2026/07/ethanol-blending-omc-books-e20-today-vs.html", postId: "2440503955529656350", published: "2026-07-24", excerpt: "Every litre of ethanol swaps a high-tax petrol litre for a lightly taxed one, reshaping oil-marketer margins, the exchequer and the export book." },
      { title: "The Grain Value Loop — Integrated Rice Biorefinery Pitch", url: "https://masaladeutsch.blogspot.com/2026/07/the-grain-value-loop-integrated-rice.html", postId: "6758993569034587827", published: "2026-07-31", excerpt: "An integrated rice biorefinery that turns byproducts the government already procures into edible oil, food-grade derivatives and fuel." },
    ],
  },
  {
    theme: "Trade & tariffs",
    slug: "trade",
    items: [
      { title: "India Mineral-Oil (HSN Ch.27) Trade × Pricing Dashboard", url: "https://masaladeutsch.blogspot.com/2026/08/india-mineral-oil-hsn-ch27-trade.html", postId: "6935574229087271959", published: "2026-07-30", excerpt: "The trade and duty picture for base oil and other Chapter 27 mineral-oil lines." },
      { title: "Guar Gum: India's $3.5 Billion Export Peak, the Crash After, and Why the Crop Still Makes Sense on Poor Soil", url: "https://masaladeutsch.blogspot.com/2026/08/guar-gum-indias-35-billion-export-peak.html", postId: "5630156769104678345", published: "2026-08-16", excerpt: "India supplies roughly 80% of the world's guar gum. The boom, the crash, and why the crop still suits arid, low-fertility land." },
      { title: "Where India's Forex Goes — Country Deficits & a Decade of Policy History", url: "https://masaladeutsch.blogspot.com/2026/08/where-indias-forex-goes-country.html", postId: "7656109891324685688", published: "2026-08-02", excerpt: "India's FY2025-26 bilateral trade balance ranked by partner country, and the policy history behind the largest deficits." },
      { title: "Five-Year Synthesis: Trade, Currency & Policy, FY2021-22 to FY2025-26", url: "https://masaladeutsch.blogspot.com/2026/08/five-year-synthesis-trade-currency.html", postId: "3143408713196154814", published: "2026-08-02", excerpt: "Trade totals, goods versus services, currency and policy, re-cut to one consistent five-year window." },
    ],
  },
  {
    theme: "Agriculture & food processing",
    slug: "agri-food",
    items: [
      { title: "The Milk India Doesn't Drink: Cheese and the Value-Added Dairy Opportunity", url: "https://masaladeutsch.blogspot.com/2026/08/the-milk-india-doesnt-drink-cheese-and.html", postId: "8789563962657892583", published: "2026-08-19", excerpt: "India made 247.87 million tonnes of milk in 2024-25 and sells about two-thirds of it as liquid milk. The case for value-added dairy." },
      { title: "FCI Grain Flow — Procurement · Storage · Disposal Dashboard", url: "https://masaladeutsch.blogspot.com/2026/07/fci-grain-flow-procurement-storage.html", postId: "4373434185961835516", published: "2026-07-31", excerpt: "India's foodgrain system in one view: what the government buys, what it holds against buffer norms, and where the grain goes." },
      { title: "The Price of Grain: MSP, MSV, and the Arithmetic of the Indian Grain State", url: "https://masaladeutsch.blogspot.com/2026/07/the-price-of-grain-msp-msv-and.html", postId: "9054600943880295003", published: "2026-07-23", excerpt: "How India prices its harvest for farmers, ration shops, distilleries and export markets." },
      { title: "Jai Kisan, Jai Javan — An FCI-Based Military Ration Strategy", url: "https://masaladeutsch.blogspot.com/2026/08/jai-kisan-jai-javan-fci-based-military.html", postId: "9053217851150932322", published: "2026-08-04", excerpt: "A proposal to produce armed-forces rations from FCI-sourced, domestically milled grain, linking food security with defence procurement." },
    ],
  },
  {
    theme: "Capital, deals & climate",
    slug: "capital-climate",
    items: [
      { title: "Global Biofuels M&A: A Bankruptcy, a Bolt-On, and Where the Capital Is Actually Going", url: "https://masaladeutsch.blogspot.com/2026/08/global-biofuels-m-bankruptcy-bolt-on.html", postId: "2475957256188991627", published: "2026-08-19", excerpt: "A $2 billion renewable-diesel refinery in Chapter 11, a bolt-on acquisition, and where biofuels capital is actually flowing." },
      { title: "Raising Green Debt Globally: The REC EuroYen Playbook, the CBI Stamp, and Every Avenue an Indian Issuer Actually Has", url: "https://masaladeutsch.blogspot.com/2026/08/raising-green-debt-globally-rec-euroyen.html", postId: "724360608693582400", published: "2026-08-03", excerpt: "REC's certified EuroYen green bonds, and every route an Indian issuer has to raise green debt abroad." },
      { title: "PET Recycling Already Cuts Emissions 60%+. The New MOEFCC Rules Are About Making That System Traceable", url: "https://masaladeutsch.blogspot.com/2026/08/pet-recycling-already-cuts-emissions-60.html", postId: "7452695219826556995", published: "2026-08-16", excerpt: "Recycled PET uses 70–79% less energy than virgin plastic. The new rules are about traceability, not volume." },
      { title: "Not a Drop Out: Ethanol's Zero-Liquid-Discharge Rule, and the Treatment-Capacity Gap Behind It", url: "https://masaladeutsch.blogspot.com/2026/08/not-drop-out-ethanols-zero-liquid.html", postId: "7714544472537767701", published: "2026-08-17", excerpt: "Zero liquid discharge for distilleries tightened over two decades. The treatment-capacity gap behind the rule." },
    ],
  },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function formatInsightDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d} ${MONTHS[Number(m) - 1]} ${y}`;
}
export const isLiveUrl = (u: string) => /^https?:\/\//.test(u);

export const articleSlug = (url: string): string => (url.split("/").pop() ?? "").replace(/\.html$/, "");
export const findArticle = (slug: string): InsightItem | undefined => INSIGHT_THEMES.flatMap((theme) => theme.items).find((article) => articleSlug(article.url) === slug);
