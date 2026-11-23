import { cleanup, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DISCLAIMER } from "@/config";
import { installIntersectionObserver, renderApp } from "./support/renderApp";

beforeEach(() => {
  installIntersectionObserver();
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.reject(new Error("must not be called with a placeholder URL"))),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const rowsOf = () =>
  Array.from(document.querySelectorAll("tbody tr")).map((tr) =>
    tr.querySelector("td")!.textContent!.replace("Sample", ""),
  );

describe("trade ideas (placeholder data URL)", () => {
  it("shows the disclaimer and explains how to publish, without fetching", async () => {
    await renderApp("/trade-ideas");
    expect(screen.getByRole("note")).toHaveTextContent(DISCLAIMER);
    expect(screen.getByText("No trade ideas published.")).toBeInTheDocument();
    expect(screen.getByText("The URL is still a placeholder.")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
    expect(document.querySelector("table")).toBeNull();
  });

  it("previews the layout with clearly labelled sample data", async () => {
    await renderApp("/trade-ideas");
    fireEvent.click(screen.getByLabelText("Show sample data"));
    expect(screen.getByText("Sample data, not a recommendation")).toBeInTheDocument();
    expect(document.querySelector("caption")).toHaveTextContent(
      "Trade ideas (sample data, not a recommendation)",
    );
    expect(rowsOf()).toEqual(["SAMPLE-A", "SAMPLE-B", "SAMPLE-C", "SAMPLE-D"]);
    expect(screen.getAllByText("Sample")).toHaveLength(4);
    expect(screen.getByText("As of 5 Jan 2026")).toBeInTheDocument();
    expect(screen.queryByText(/^Stale/)).toBeNull(); // sample data is never flagged stale
    const rows = document.querySelectorAll("tbody tr");
    expect(within(rows[2] as HTMLElement).getByText("BUY")).toHaveClass("bg-success");
    expect(within(rows[1] as HTMLElement).getAllByText("—")).toHaveLength(3); // HOLD row: missing numbers render as an em dash
    expect(within(rows[2] as HTMLElement).getByText("250")).toBeInTheDocument();
  });

  it("filters by action and exchange and resets the exchange when sample data is toggled", async () => {
    await renderApp("/trade-ideas");
    fireEvent.click(screen.getByLabelText("Show sample data"));
    fireEvent.change(screen.getByLabelText(/^Action/), { target: { value: "BUY" } });
    expect(rowsOf()).toEqual(["SAMPLE-C"]);
    fireEvent.change(screen.getByLabelText(/^Action/), { target: { value: "ALL" } });
    const exchange = screen.getByLabelText(/^Exchange/) as HTMLSelectElement;
    expect(Array.from(exchange.options).map((o) => o.value)).toEqual([
      "ALL",
      "BSE",
      "NASDAQ",
      "NSE",
    ]);
    fireEvent.change(exchange, { target: { value: "NSE" } });
    expect(rowsOf()).toEqual(["SAMPLE-A", "SAMPLE-C"]);
    fireEvent.change(screen.getByLabelText(/^Action/), { target: { value: "SELL" } });
    expect(rowsOf()).toEqual([]); // no NSE SELL: falls back to the empty notice
    expect(screen.getByText("No trade ideas published.")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Show sample data")); // toggling resets the exchange filter
    fireEvent.click(screen.getByLabelText("Show sample data"));
    expect((screen.getByLabelText(/^Exchange/) as HTMLSelectElement).value).toBe("ALL");
  });

  it("sorts by a column, toggling direction, with aria-sort reflecting the state", async () => {
    await renderApp("/trade-ideas");
    fireEvent.click(screen.getByLabelText("Show sample data"));
    const header = (name: string) => screen.getByRole("columnheader", { name: new RegExp(name) });
    expect(header("As of")).toHaveAttribute("aria-sort", "descending");
    expect(header("Symbol")).toHaveAttribute("aria-sort", "none");
    fireEvent.click(within(header("Symbol")).getByRole("button"));
    expect(header("Symbol")).toHaveAttribute("aria-sort", "ascending");
    expect(rowsOf()).toEqual(["SAMPLE-A", "SAMPLE-B", "SAMPLE-C", "SAMPLE-D"]);
    expect(header("Symbol")).toHaveTextContent("Symbol ↑");
    fireEvent.click(within(header("Symbol")).getByRole("button"));
    expect(header("Symbol")).toHaveAttribute("aria-sort", "descending");
    expect(rowsOf()).toEqual(["SAMPLE-D", "SAMPLE-C", "SAMPLE-B", "SAMPLE-A"]);
    fireEvent.click(within(header("Action")).getByRole("button"));
    expect(rowsOf()).toEqual(["SAMPLE-C", "SAMPLE-B", "SAMPLE-D", "SAMPLE-A"]); // BUY, HOLD, SELL, WATCH
    expect(header("Symbol")).toHaveAttribute("aria-sort", "none");
  });
});
