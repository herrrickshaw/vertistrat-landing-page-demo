import { describe, expect, it } from "vitest";
import { excerpt, formatDate, isStale, mapFeed, parseTradeIdeas, stripHtml } from "./feeds";

describe("stripHtml", () => {
  it("drops script/style blocks and tags, decodes entities, collapses whitespace", () => {
    const html =
      "<style>p{}</style><p>A&nbsp;&amp;&nbsp;B</p><SCRIPT>x()</SCRIPT> &quot;q&quot; &#39;s&#39; &lt;t&gt;\n\n  end ";
    expect(stripHtml(html)).toBe(`A & B "q" 's' <t> end`);
  });
});

describe("excerpt", () => {
  it("returns short text unchanged, including exactly max length", () => {
    expect(excerpt("short")).toBe("short");
    expect(excerpt("x".repeat(160))).toBe("x".repeat(160));
  });
  it("cuts at the last space when it is past 80 characters, else hard-cuts, and appends an ellipsis", () => {
    const words = `${"a".repeat(100)} ${"b".repeat(100)}`;
    expect(excerpt(words)).toBe(`${"a".repeat(100)}…`);
    const early = `${"a".repeat(50)} ${"b".repeat(200)}`;
    expect(excerpt(early)).toBe(`${early.slice(0, 160)}…`);
    expect(excerpt(`${"a".repeat(81)} ${"b".repeat(200)}`)).toBe(`${"a".repeat(81)}…`);
    expect(excerpt(`${"a".repeat(80)} ${"b".repeat(200)}`)).toBe(
      `${`${"a".repeat(80)} ${"b".repeat(79)}`}…`,
    );
    expect(excerpt("w ".repeat(100), 20)).toBe(`${"w ".repeat(100).slice(0, 20).trim()}…`);
  });
});

describe("mapFeed", () => {
  it("returns an empty list for missing or malformed feeds", () => {
    expect(mapFeed(null)).toEqual([]);
    expect(mapFeed({})).toEqual([]);
    expect(mapFeed({ feed: {} })).toEqual([]);
  });

  it("maps every field and prefers the Blogger thumbnail upscaled to the card size", () => {
    const [a] = mapFeed({
      feed: {
        entry: [
          {
            id: { $t: "tag:1" },
            title: { $t: "Hello" },
            link: [{ rel: "alternate", href: "https://b/x" }],
            published: { $t: "2026-08-01T00:00:00Z" },
            media$thumbnail: { url: "https://img/s72-c/pic.jpg" },
            content: { $t: '<img src="inline.jpg"><p>Body &amp; text</p>' },
            category: [{ term: "Energy" }, { term: "" }, { term: "Trade" }],
          },
        ],
      },
    });
    expect(a).toEqual({
      id: "tag:1",
      title: "Hello",
      link: "https://b/x",
      published: "2026-08-01T00:00:00Z",
      image: "https://img/w600-h340-c/pic.jpg",
      excerpt: "Body & text",
      categories: ["Energy", "Trade"],
    });
  });

  it("falls back: summary for content, inline image, index id, Untitled and empty link", () => {
    const [a, b] = mapFeed({
      feed: {
        entry: [
          { summary: { $t: "<img src='s.png'>sum" } },
          {
            title: { $t: "" },
            content: { $t: "none" },
            media$thumbnail: { url: "https://i/s72/p.jpg" },
          },
        ],
      },
    });
    expect(a).toMatchObject({
      id: "0",
      title: "Untitled",
      link: "",
      published: "",
      image: "s.png",
      excerpt: "sum",
      categories: [],
    });
    expect(b!.id).toBe("1");
    expect(b!.image).toBe("https://i/w600-h340-c/p.jpg");
  });

  it("has no image when neither thumbnail nor inline image exists", () => {
    expect(mapFeed({ feed: { entry: [{ content: { $t: "<p>x</p>" } }] } })[0]!.image).toBeNull();
  });
});

describe("formatDate", () => {
  it("formats valid ISO dates in en-GB and returns empty for invalid input", () => {
    expect(formatDate("2026-08-19T00:00:00Z")).toBe("19 Aug 2026");
    expect(formatDate("nonsense")).toBe("");
    expect(formatDate("")).toBe("");
  });
});

describe("parseTradeIdeas", () => {
  it("rejects non-arrays", () => {
    expect(() => parseTradeIdeas({})).toThrow("Expected a JSON array");
    expect(() => parseTradeIdeas(null)).toThrow("Expected a JSON array");
  });

  it("keeps valid rows, normalises numbers and strings, and drops invalid rows", () => {
    const rows = parseTradeIdeas([
      {
        symbol: "A",
        action: "SELL",
        entry: 1.5,
        target: "2",
        stop: Number.NaN,
        thesis: 7,
        asOf: 20260101,
      },
      { symbol: "B", exchange: "NSE", action: "HOLD", entry: Infinity, target: 0 },
      { symbol: 5, action: "BUY" },
      { action: "BUY" },
      null,
      "str",
      { symbol: "C", action: "buy" },
    ]);
    expect(rows).toEqual([
      {
        symbol: "A",
        exchange: "",
        action: "SELL",
        entry: 1.5,
        target: null,
        stop: null,
        thesis: "7",
        asOf: "20260101",
      },
      {
        symbol: "B",
        exchange: "NSE",
        action: "HOLD",
        entry: null,
        target: 0,
        stop: null,
        thesis: "",
        asOf: "",
      },
    ]);
    for (const action of ["BUY", "WATCH", "SELL", "HOLD"])
      expect(parseTradeIdeas([{ symbol: "S", action }])).toHaveLength(1);
  });
});

describe("isStale", () => {
  const now = new Date("2026-10-23T00:00:00Z");
  it("treats exactly the limit as fresh and one millisecond more as stale", () => {
    expect(isStale("2026-10-16", now)).toBe(false);
    expect(isStale("2026-10-16", new Date(now.getTime() + 1))).toBe(true);
  });
  it("honours a custom window and treats unparseable dates as stale", () => {
    expect(isStale("2026-10-20", now, 2)).toBe(true);
    expect(isStale("2026-10-21", now, 2)).toBe(false);
    expect(isStale("not-a-date", now)).toBe(true);
    expect(isStale("", now)).toBe(true);
  });
  it("defaults to the current time", () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(isStale(today)).toBe(false);
    expect(isStale("2000-01-01")).toBe(true);
  });
});
