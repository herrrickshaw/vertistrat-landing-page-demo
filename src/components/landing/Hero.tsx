import { ArrowDown, ArrowRight, Check, Circle, Factory, Fuel, Building2, Cpu, Layers3, MoveUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function DeliveryVisual() {
  return <div className="delivery-visual" role="img" aria-label="Illustrative programme delivery dashboard showing an aligned critical path from diagnostic through handover">
    <div className="flex items-center justify-between border-b border-landing-line px-5 py-5 sm:px-6">
      <div className="flex items-center gap-3"><Layers3 className="size-5 text-landing-gold" /><div><p className="text-sm font-semibold">Programme control centre</p><p className="mt-1 text-xs text-landing-muted">One plan. Every workstream.</p></div></div>
      <span className="flex items-center gap-1.5 text-xs text-landing-green"><span className="size-1.5 rounded-full bg-landing-green" />Aligned</span>
    </div>
    <div className="p-5 sm:p-6">
      <div className="mb-5 flex justify-between"><span className="text-xs text-landing-muted">INTEGRATED DELIVERY ROADMAP</span><span className="text-xs text-landing-muted">01 — 06</span></div>
      <div className="gantt-grid">
        <div className="gantt-header"><span>WORKSTREAM</span>{["01", "02", "03", "04", "05", "06"].map(n => <span key={n}>{n}</span>)}</div>
        {[{ name: "Diagnostic", start: "gantt-start-1", width: "gantt-span-2", done: true }, { name: "Integration", start: "gantt-start-2", width: "gantt-span-3", done: true }, { name: "Execution", start: "gantt-start-3", width: "gantt-span-4", done: false }, { name: "Handover", start: "gantt-start-6", width: "gantt-span-1", done: false }].map(row => <div key={row.name} className="gantt-row"><span className="flex items-center gap-2 text-xs">{row.done ? <Check className="size-3 text-landing-green" /> : <Circle className="size-3 text-landing-muted" />}{row.name}</span><div className="gantt-track"><span className={`gantt-bar ${row.start} ${row.width} ${row.done ? "gantt-complete" : ""}`} /></div></div>)}
      </div>
      <div className="mt-7 flex items-center gap-2 border-t border-landing-line pt-4 text-xs text-landing-muted"><span className="size-2 rotate-45 bg-landing-gold" />Critical path secured<span className="ml-auto">Illustrative view</span></div>
    </div>
    <div className="flex items-center gap-3 border-t border-landing-line bg-landing-panel px-5 py-4 sm:px-6"><div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-landing-line"><MoveUpRight className="size-4 text-landing-gold" /></div><div><p className="text-sm font-medium">Complexity, connected.</p><p className="mt-1 text-xs text-landing-muted">People · Partners · Programme</p></div></div>
  </div>;
}

export function Hero() {
  return <section aria-labelledby="hero-title" className="landing-hero bg-landing-navy text-landing-light">
    <div className="container-site relative grid gap-12 py-16 md:grid-cols-12 md:gap-8 md:py-20 lg:py-24">
      <div className="md:col-span-7 lg:col-span-7">
        <p className="mb-6 flex items-center gap-2 text-xs font-semibold text-landing-gold"><span className="h-px w-6 bg-landing-gold" />Project Delivery &amp; Management Consulting</p>
        <p className="mb-4 text-sm font-medium text-landing-muted">Vertistrat Solutions</p>
        <h1 id="hero-title" className="landing-h1 font-extrabold">From Project<br className="hidden lg:block" /> Complexity to<br className="hidden lg:block" /> <span className="text-landing-gold">Execution Clarity</span></h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-landing-muted lg:text-lg lg:leading-8">We diagnose, integrate and run the delivery engine behind your most critical programmes — so capital projects land on time, on budget and on scope.</p>
        <div className="mt-8 flex flex-wrap gap-4"><Button asChild variant="diagnostic" className="h-12 px-5"><a href="#contact">Schedule Project Diagnostic<ArrowRight /></a></Button><Button asChild variant="diagnosticOutline" className="h-12 px-5"><a href="#case-studies">View Case Studies<ArrowDown /></a></Button></div>
        <p className="mt-6 flex items-center gap-2 text-xs text-landing-muted"><Check className="size-4 text-landing-gold" />Independent thinking. Embedded delivery. Measurable progress.</p>
      </div>
      <div className="flex items-center md:col-span-5"><DeliveryVisual /></div>
      <div className="flex items-center gap-3 border-t border-landing-line pt-6 text-xs text-landing-muted md:col-span-12"><span className="text-landing-gold">01 /</span>Strategy is only the beginning.<a href="#framework" className="ml-auto inline-flex items-center gap-2 text-landing-light hover:text-landing-gold">How we work<ArrowDown className="size-4" /></a></div>
    </div>
  </section>;
}

export function TrustStrip() {
  // PLACEHOLDERS: neutral sector wordmarks; swap with authorised, verified client logos only.
  const sectors = [{ name: "MANUFACTURING", icon: Factory }, { name: "ENERGY", icon: Fuel }, { name: "INFRASTRUCTURE", icon: Building2 }, { name: "TECHNOLOGY", icon: Cpu }];
  return <section aria-label="Sector coverage" className="border-b border-landing-border bg-landing-surface py-8 text-landing-ink"><div className="container-site"><p className="text-center text-xs leading-5 text-landing-secondary">Trusted across manufacturing, energy, infrastructure and technology programmes</p><ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4">{sectors.map(({ name, icon: Icon }) => <li key={name} className="flex items-center justify-center gap-3 text-landing-secondary opacity-65 transition-colors hover:text-landing-amber hover:opacity-100"><Icon className="size-6 shrink-0" strokeWidth={1.5} /><span className="text-[11px] font-bold sm:text-sm">{name}</span></li>)}</ul><p className="mt-4 text-center text-[10px] text-landing-secondary">Sector placeholders · not client endorsements</p></div></section>;
}