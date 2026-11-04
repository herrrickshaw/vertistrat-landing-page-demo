import { LANDING_DEMO_NOTICE, LANDING_IMPACT } from "@/config";
import { Counter } from "./Motion";

export function Impact() {
  return <section id="impact" aria-labelledby="impact-title" className="bg-landing-navy py-14 text-landing-light md:py-16"><div className="container-site"><div className="mb-10 flex flex-wrap items-center justify-between gap-4"><h2 id="impact-title" className="text-sm font-medium">The difference disciplined delivery can make.</h2><span className="text-xs text-landing-muted">{LANDING_DEMO_NOTICE}</span></div><div className="grid grid-cols-2 md:grid-cols-4">{LANDING_IMPACT.map((metric, index) => <div key={metric.label} className={`impact-cell py-5 ${index > 0 ? "md:border-l md:border-landing-line md:pl-8" : ""}`}><p className="landing-counter font-display text-landing-gold"><Counter {...metric} /></p><p className="mt-3 max-w-48 text-[11px] font-medium uppercase leading-5 text-landing-muted">{metric.label}</p></div>)}</div></div></section>;
}