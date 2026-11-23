import { cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installIntersectionObserver, renderApp } from "./support/renderApp";

vi.mock("@/config", async (orig) => ({
  ...(await orig<typeof import("@/config")>()),
  TRADE_IDEAS_URL: "https://data.example/trade_ideas.json",
}));

const row = (symbol: string, over: Record<string, unknown> = {}) => ({
  symbol,
  exchange: "NSE",
  action: "BUY",
  entry: 10,
  target: 12,
  stop: 9,
  thesis: `Thesis ${symbol}`,
  asOf: "2026-10-20",
  ...over,
});
const respond = (status: number, body: unknown) =>
  vi.fn(() => Promise.resolve(new Response(JSON.stringify(body), { status })));

beforeEach(() => installIntersectionObserver());
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("trade ideas (published data URL)", () => {
  it("fetches the file uncached and lists the valid rows", async () => {
    const fetchMock = respond(200, [
      row("AAA"),
      row("BBB", { exchange: "BSE", action: "SELL" }),
      { symbol: "BAD", action: "MAYBE" },
    ]);
    vi.stubGlobal("fetch", fetchMock);
    await renderApp("/trade-ideas");
    await screen.findByText("Thesis AAA");
    expect(fetchMock).toHaveBeenCalledWith("https://data.example/trade_ideas.json", {
      cache: "no-store",
    });
    expect(document.querySelectorAll("tbody tr")).toHaveLength(2);
    expect(screen.queryByText("The URL is still a placeholder.")).toBeNull();
    expect(within(document.querySelector("tbody") as HTMLElement).getByText("SELL")).toHaveClass(
      "bg-destructive",
    );
    expect(document.querySelector("caption")).toHaveTextContent(/^Trade ideas$/);
  });

  it("shows a loading notice while the file is being fetched", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {})),
    );
    await renderApp("/trade-ideas");
    expect(await screen.findByText("Loading…")).toBeInTheDocument();
  });

  it("treats a 404 as 'nothing published yet'", async () => {
    vi.stubGlobal("fetch", respond(404, {}));
    await renderApp("/trade-ideas");
    expect(await screen.findByText("No trade ideas published.")).toBeInTheDocument();
    expect(screen.queryByText("The URL is still a placeholder.")).toBeNull();
  });

  it.each([
    ["a server error", () => respond(500, {})],
    ["a network failure", () => vi.fn(() => Promise.reject(new Error("down")))],
    ["a body that is not an array", () => respond(200, { rows: [] })],
  ])("explains the problem on %s, and sample data still works", async (_n, make) => {
    vi.stubGlobal("fetch", make());
    await renderApp("/trade-ideas");
    expect(await screen.findByText(/Couldn't load the trade ideas file/)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Show sample data"));
    expect(document.querySelectorAll("tbody tr")).toHaveLength(4);
  });

  it("flags data older than seven days as stale, but not data exactly seven days old", async () => {
    vi.stubGlobal("fetch", respond(200, [row("OLD", { asOf: "2026-10-15" })]));
    vi.useFakeTimers({ toFake: ["Date"], now: new Date("2026-10-23T00:00:00Z") });
    await renderApp("/trade-ideas");
    await screen.findByText("Thesis OLD");
    expect(screen.getByText("Stale: older than 7 days")).toBeInTheDocument();
    cleanup();
    vi.stubGlobal("fetch", respond(200, [row("EDGE", { asOf: "2026-10-16" })]));
    await renderApp("/trade-ideas");
    await screen.findByText("Thesis EDGE");
    expect(screen.queryByText(/^Stale/)).toBeNull();
    expect(screen.getByText("As of 16 Oct 2026")).toBeInTheDocument();
  });

  it("uses the newest asOf across rows for the freshness label", async () => {
    vi.stubGlobal(
      "fetch",
      respond(200, [row("A", { asOf: "2026-10-01" }), row("B", { asOf: "2026-10-20" })]),
    );
    await renderApp("/trade-ideas");
    await waitFor(() => expect(screen.getByText("As of 20 Oct 2026")).toBeInTheDocument());
  });
});
