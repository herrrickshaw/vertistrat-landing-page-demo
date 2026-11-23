import { cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { Fuel } from "lucide-react";
import { afterEach, describe, expect, it } from "vitest";
import { MostRead } from "@/components/site/MostRead";
import {
  GuideTiles,
  HelpGrid,
  InsightToAdvisory,
  SectorTiles,
  TalkStrip,
} from "@/components/site/Sections";
import {
  Card,
  Chips,
  CTA,
  IconChip,
  PageHero,
  Placeholder,
  SECTORS,
  StatTile,
  Tile,
  bento,
  btn,
  muted,
  pageHead,
} from "@/components/site/ui";
import { INSIGHT_THEMES, articleSlug } from "@/data/insights";
import { MOST_READ, MOST_READ_INDEX_URL } from "@/data/mostRead";
import { GUIDE_TOPICS, guideArticles } from "@/lib/guides";
import { renderInRouter } from "./support/renderApp";

afterEach(cleanup);

describe("MostRead", () => {
  it("lists the most-read articles in rank order, linking to the on-site article pages", async () => {
    await renderInRouter(<MostRead />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(MOST_READ.length);
    expect(items[0]).toHaveTextContent("01");
    expect(items[0]).toHaveTextContent(MOST_READ[0]!.title);
    expect(items[7]).toHaveTextContent("08");
    expect(within(items[0]!).getByRole("link")).toHaveAttribute(
      "href",
      `/insights/${articleSlug(MOST_READ[0]!.url)}`,
    );
    expect(screen.getByRole("link", { name: "All articles →" })).toHaveAttribute(
      "href",
      MOST_READ_INDEX_URL,
    );
    expect(screen.queryByRole("link", { name: "All insights →" })).toBeNull();
    expect(items[0]!.querySelector("h3")).toHaveClass("text-xl");
    expect(items[1]!.querySelector("h3")).not.toHaveClass("text-xl");
  });

  it("colours each card by its first tag and optionally links to all insights", async () => {
    await renderInRouter(<MostRead showInsightsLink className="extra" />);
    const bands = Array.from(document.querySelectorAll("ol li a > span:first-child")).map(
      (b) => b.className.match(/bg-[a-z-]+/)![0],
    );
    expect(bands).toEqual([
      "bg-primary",
      "bg-amber",
      "bg-success",
      "bg-foreground",
      "bg-amber",
      "bg-primary",
      "bg-accent-foreground",
      "bg-amber",
    ]);
    expect(screen.getByRole("link", { name: "All insights →" })).toHaveAttribute(
      "href",
      "/insights",
    );
    expect(document.querySelector("section#most-read")).toHaveClass("extra");
  });
});

describe("Sections", () => {
  it("HelpGrid links each help topic to its practice page or the contact anchor", async () => {
    await renderInRouter(<HelpGrid />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(12);
    expect(screen.getByRole("link", { name: /Site selection/ })).toHaveAttribute(
      "href",
      "/manufacturing",
    );
    expect(screen.getByRole("link", { name: /Vendor selection/ })).toHaveAttribute(
      "href",
      "/it-services",
    );
    expect(screen.getByRole("link", { name: /PLI & scheme claims/ })).toHaveAttribute(
      "href",
      "/#investment",
    );
  });

  it("GuideTiles shows one tile per topic with its article count and first article", async () => {
    await renderInRouter(<GuideTiles />);
    const tiles = screen.getAllByRole("listitem");
    expect(tiles).toHaveLength(GUIDE_TOPICS.length);
    GUIDE_TOPICS.forEach((g, i) => {
      const items = guideArticles(g.key);
      expect(tiles[i]).toHaveTextContent(g.label);
      expect(tiles[i]).toHaveTextContent(
        `${items.length} ${items.length === 1 ? "article" : "articles"}`,
      );
      expect(within(tiles[i]!).getByRole("link")).toHaveAttribute(
        "href",
        `/insights/${articleSlug(items[0]!.url)}`,
      );
    });
  });

  it("InsightToAdvisory pairs every theme with a service and a contact link", async () => {
    await renderInRouter(<InsightToAdvisory />);
    expect(screen.getAllByRole("listitem")).toHaveLength(INSIGHT_THEMES.length);
    expect(screen.getByText("Incentive mapping & approvals")).toBeInTheDocument();
    expect(screen.getByText("Investor briefing & green finance")).toBeInTheDocument();
    screen
      .getAllByRole("link", { name: "Discuss this →" })
      .forEach((a) => expect(a).toHaveAttribute("href", "/#contact"));
  });

  it("TalkStrip links to the contact anchor", async () => {
    await renderInRouter(<TalkStrip />);
    expect(screen.getByRole("link", { name: /Talk to our team/ })).toHaveAttribute(
      "href",
      "/#contact",
    );
  });

  it("SectorTiles opens a sector sheet with related insights and closes it", async () => {
    await renderInRouter(<SectorTiles />);
    const buttons = screen
      .getAllByRole("button", { name: /./ })
      .filter((b) => b.getAttribute("aria-haspopup") === "dialog");
    expect(buttons).toHaveLength(SECTORS.length);
    fireEvent.click(buttons[6]!); // Renewable energy equipment
    const dialog = await waitFor(() => {
      const d = document.querySelector<HTMLElement>('[role="dialog"]');
      expect(d).not.toBeNull();
      return d!;
    });
    expect(dialog.textContent).toContain("Renewable energy equipment");
    expect(dialog.textContent).toContain("Biofuels, green finance and clean-energy equipment.");
    expect(dialog.textContent).toContain("Related insights");
    expect(dialog.querySelector('a[href="/biofuels-energy"]')?.textContent).toContain(
      "See the practice",
    );
    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() => expect(document.querySelector('[role="dialog"]')).toBeNull());
    fireEvent.click(buttons[3]!); // Pharma: no related article pattern
    const second = await waitFor(
      () => document.querySelector<HTMLElement>('[role="dialog"]')!.textContent!,
    );
    expect(second).toContain("Pharma and medical devices");
    expect(second).not.toContain("Related insights");
    expect(second).not.toContain("See the practice");
  });

  it("SectorTiles can show a limited number of sectors", async () => {
    await renderInRouter(<SectorTiles count={3} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });
});

describe("site ui helpers", () => {
  it("pageHead builds title, description and canonical metadata", () => {
    const head = pageHead("About", "Desc", "/about");
    expect(head.meta[0]).toEqual({ title: "About | VertiStrat Solutions LLP" });
    expect(head.meta).toContainEqual({ name: "description", content: "Desc" });
    expect(head.meta).toContainEqual({ property: "og:url", content: "/about" });
    expect(head.links).toEqual([{ rel: "canonical", href: "/about" }]);
  });

  it("muted picks the muted colour for dark tones", () => {
    expect(muted("ink")).toBe("text-ink-muted");
    expect(muted("raised")).toBe("text-ink-muted");
    expect(muted("card")).toBe("text-muted-foreground");
  });

  it("small presentational helpers render their content", async () => {
    await renderInRouter(
      <>
        <Chips items={["a", "b"]} />
        <Placeholder>soon</Placeholder>
        <Card className="c">body</Card>
        <StatTile value="9" label="Nine" tone="ink" />
        <IconChip icon={Fuel} size="lg" tone="amber" />
      </>,
    );
    expect(screen.getAllByRole("listitem").map((l) => l.textContent)).toEqual(["a", "b"]);
    expect(screen.getByText("soon")).toHaveClass("border-dashed");
    expect(screen.getByText("body").className).toContain("c");
    expect(screen.getByText("9")).toBeInTheDocument();
    expect(document.querySelector("span.h-14")).not.toBeNull();
    expect(btn.primary).toContain("bg-primary");
    expect(bento).toContain("lg:grid-cols-4");
  });

  it("PageHero renders eyebrow, title, line, children and an aside (which widens the grid)", async () => {
    await renderInRouter(
      <PageHero eyebrow="Eyebrow" title="Title" line="Line" aside={<p>aside</p>}>
        <button>child</button>
      </PageHero>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Title" })).toBeInTheDocument();
    expect(screen.getByText("Line")).toBeInTheDocument();
    expect(screen.getByText("aside")).toBeInTheDocument();
    expect(document.querySelector(".lg\\:grid-cols-\\[1\\.2fr_1fr\\]")).not.toBeNull();
    cleanup();
    await renderInRouter(<PageHero eyebrow="E" title="T" />);
    expect(document.querySelector(".lg\\:grid-cols-\\[1\\.2fr_1fr\\]")).toBeNull();
  });

  it("CTA links to the contact anchor", async () => {
    await renderInRouter(<CTA title="Hello" text="World" />);
    expect(screen.getByRole("heading", { level: 2, name: "Hello" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start a conversation" })).toHaveAttribute(
      "href",
      "/#contact",
    );
  });

  describe("Tile", () => {
    it("renders a plain tile, a router link, an external link, and an expandable tile", async () => {
      await renderInRouter(
        <>
          <Tile title="Plain" line="line" kicker="K" icon={Fuel} />
          <Tile title="Routed" to="/about" hash="x" />
          <Tile title="External" href="https://example.com/x" />
          <Tile title="Mailto" href="mailto:a@b.c" />
          <Tile title="Expand" more="More text" />
        </>,
      );
      expect(screen.getByText("Plain").closest("div.tile")).not.toBeNull();
      expect(screen.getByText("K")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Routed/ })).toHaveAttribute("href", "/about#x");
      const ext = screen.getByRole("link", { name: /^External/ });
      expect(ext).toHaveAttribute("target", "_blank");
      expect(ext).toHaveAttribute("rel", "noopener noreferrer");
      expect(screen.getByRole("link", { name: /Mailto/ })).not.toHaveAttribute("target");
      const expand = screen.getByRole("button", { name: /Expand/ });
      expect(expand).toHaveAttribute("aria-expanded", "false");
      fireEvent.click(expand);
      expect(expand).toHaveAttribute("aria-expanded", "true");
      fireEvent.keyDown(expand, { key: "Enter" });
      expect(expand).toHaveAttribute("aria-expanded", "false");
      fireEvent.keyDown(expand, { key: " " });
      expect(expand).toHaveAttribute("aria-expanded", "true");
      fireEvent.keyDown(expand, { key: "a" });
      expect(expand).toHaveAttribute("aria-expanded", "true");
    });
  });
});
