import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/components/site/ui";
import { Hero, TrustStrip } from "@/components/landing/Hero";
import { Framework } from "@/components/landing/Framework";
import { Impact } from "@/components/landing/Impact";
import { CaseStudies } from "@/components/landing/CaseStudies";
import { LeadCapture } from "@/components/landing/LeadCapture";

export const Route = createFileRoute("/")({
  head: () => pageHead("Project Delivery & Management Consulting", "Vertistrat Solutions brings execution clarity to critical programmes through project diagnostics, seamless integration and managed delivery.", "/"),
  component: Home,
});

function Home() {
  return <div className="landing-page"><Hero /><TrustStrip /><Framework /><Impact /><CaseStudies /><LeadCapture /></div>;
}
