import { cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { ArticleGrid, GithubRepos, useArticles } from "@/components/site/Feeds";
import { BLOG_FEED_URL, BLOG_URL, GITHUB_REPOS_URL, GITHUB_USER } from "@/config";
import { jsonp } from "@/lib/jsonp";
import { wrap } from "./support/renderApp";

vi.mock("@/lib/jsonp", () => ({ jsonp: vi.fn() }));
const jsonpMock = vi.mocked(jsonp);

const entry = (n: number, cats: string[] = []) => ({
  id: { $t: `id-${n}` },
  title: { $t: `Article ${n}` },
  link: [{ rel: "alternate", href: `https://blog/${n}` }],
  published: { $t: `2026-08-0${n}T00:00:00Z` },
  content: { $t: `<p>Body ${n}</p>` },
  category: cats.map((term) => ({ term })),
});
const feed = (...entries: unknown[]) => ({ feed: { entry: entries } });
const client = () => new QueryClient({ defaultOptions: { queries: { retry: false } } });

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ArticleGrid", () => {
  beforeEach(() => {
    jsonpMock.mockReset();
  });

  it("requests the feed as JSONP and shows a busy skeleton while loading", () => {
    jsonpMock.mockReturnValue(new Promise(() => {}));
    render(wrap(<ArticleGrid limit={4} />, client()));
    expect(jsonpMock).toHaveBeenCalledWith(BLOG_FEED_URL.replace("alt=json", "alt=json-in-script"));
    const list = screen.getByLabelText("Loading");
    expect(list).toHaveAttribute("aria-busy", "true");
    expect(list.children).toHaveLength(4);
  });

  it("uses six skeleton cards by default", () => {
    jsonpMock.mockReturnValue(new Promise(() => {}));
    render(wrap(<ArticleGrid />, client()));
    expect(screen.getByLabelText("Loading").children).toHaveLength(6);
  });

  it("lists articles as external links, honouring the limit", async () => {
    jsonpMock.mockResolvedValue(feed(entry(1, ["Energy"]), entry(2), entry(3)));
    render(wrap(<ArticleGrid limit={2} />, client()));
    const link = await screen.findByRole("link", { name: /Article 1/ });
    expect(link).toHaveAttribute("href", "https://blog/1");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveTextContent("1 Aug 2026 · Energy");
    expect(link).toHaveTextContent("Body 1");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.queryByText("Article 3")).toBeNull();
    expect(screen.queryByRole("group", { name: "Filter by category" })).toBeNull();
  });

  it("filters by category when filterable and resets with All", async () => {
    jsonpMock.mockResolvedValue(feed(entry(1, ["Trade"]), entry(2, ["Energy", "Trade"]), entry(3)));
    render(wrap(<ArticleGrid filterable />, client()));
    await screen.findByText("Article 1");
    const group = screen.getByRole("group", { name: "Filter by category" });
    expect(
      within(group)
        .getAllByRole("button")
        .map((b) => b.textContent),
    ).toEqual(["All", "Energy", "Trade"]);
    expect(within(group).getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    fireEvent.click(within(group).getByRole("button", { name: "Energy" }));
    expect(within(group).getByRole("button", { name: "Energy" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.queryByText("Article 1")).toBeNull();
    expect(screen.getByText("Article 2")).toBeInTheDocument();
    fireEvent.click(within(group).getByRole("button", { name: "Trade" }));
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Article 1",
      "Article 2",
    ]);
    fireEvent.click(within(group).getByRole("button", { name: "All" }));
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
  });

  it("applies the limit after the category filter", async () => {
    jsonpMock.mockResolvedValue(feed(entry(1, ["A"]), entry(2, ["A"]), entry(3, ["A"])));
    render(wrap(<ArticleGrid filterable limit={2} />, client()));
    await screen.findByText("Article 1");
    fireEvent.click(screen.getByRole("button", { name: "A" }));
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2);
  });

  it("falls back to a link to the blog when the feed fails", async () => {
    jsonpMock.mockRejectedValue(new Error("x"));
    render(wrap(<ArticleGrid />, client()));
    const note = await waitFor(
      () => {
        const n = screen.getByRole("status");
        expect(n).toHaveTextContent("We couldn't load the latest articles right now.");
        return n;
      },
      { timeout: 4000 },
    );
    expect(within(note).getByRole("link", { name: "Read them on the blog" })).toHaveAttribute(
      "href",
      BLOG_URL,
    );
  });

  it("says so when the feed is empty", async () => {
    jsonpMock.mockResolvedValue(feed());
    render(wrap(<ArticleGrid filterable />, client()));
    const note = await waitFor(
      () => {
        const n = screen.getByRole("status");
        expect(n).toHaveTextContent("No articles yet.");
        return n;
      },
      { timeout: 4000 },
    );
    expect(screen.queryByRole("group")).toBeNull();
  });

  it("shows placeholders for articles without an image and renders images when present", async () => {
    jsonpMock.mockResolvedValue(
      feed({ ...entry(1), content: { $t: '<img src="https://img/x.png">t' } }, entry(2)),
    );
    const { container } = render(wrap(<ArticleGrid />, client()));
    await screen.findByText("Article 1");
    expect(container.querySelectorAll("img")).toHaveLength(1);
    expect(container.querySelector("img")).toHaveAttribute("src", "https://img/x.png");
    expect(container.querySelectorAll('div[aria-hidden="true"].bg-muted')).toHaveLength(1);
  });

  it("retries the feed once and caches it for ten minutes", async () => {
    jsonpMock.mockRejectedValueOnce(new Error("first")).mockResolvedValueOnce(feed(entry(1)));
    const c = new QueryClient();
    render(wrap(<ArticleGrid />, c));
    await waitFor(() => expect(screen.getByText("Article 1")).toBeInTheDocument(), {
      timeout: 4000,
    });
    expect(jsonpMock).toHaveBeenCalledTimes(2);
    expect(c.getQueryCache().find({ queryKey: ["blog"] })!.observers[0]!.options.staleTime).toBe(
      600_000,
    );
  });

  it("useArticles exposes the mapped articles", async () => {
    jsonpMock.mockResolvedValue(feed(entry(1)));
    function Probe() {
      const q = useArticles();
      return <p>{q.data?.map((a) => a.title).join(",") ?? "none"}</p>;
    }
    render(wrap(<Probe />, client()));
    expect(await screen.findByText("Article 1")).toBeInTheDocument();
  });
});

describe("GithubRepos", () => {
  const repo = (id: number, over: Record<string, unknown> = {}) => ({
    id,
    name: `repo-${id}`,
    description: `Desc ${id}`,
    language: "Python",
    stargazers_count: id * 3,
    updated_at: "2026-08-19T00:00:00Z",
    html_url: `https://github.com/${GITHUB_USER}/repo-${id}`,
    fork: false,
    ...over,
  });
  const reply = (status: number, body: unknown = []) =>
    vi.fn(() => Promise.resolve(new Response(JSON.stringify(body), { status })));

  it("shows a loading notice, then repositories with language, stars and update date", async () => {
    const fetchMock = reply(200, [repo(1), repo(2, { description: null, language: null })]);
    vi.stubGlobal("fetch", fetchMock);
    render(wrap(<GithubRepos />, client()));
    expect(screen.getByText("Loading repositories…")).toBeInTheDocument();
    const first = await screen.findByRole("link", { name: /repo-1/ });
    expect(fetchMock).toHaveBeenCalledWith(GITHUB_REPOS_URL, {
      headers: { Accept: "application/vnd.github+json" },
    });
    expect(first).toHaveAttribute("href", `https://github.com/${GITHUB_USER}/repo-1`);
    expect(first).toHaveTextContent("Python★ 3Updated 19 Aug 2026");
    const second = screen.getByRole("link", { name: /repo-2/ });
    expect(second).toHaveTextContent("No description.");
    expect(second).toHaveTextContent("★ 6");
    expect(second).not.toHaveTextContent("Python");
  });

  it.each([[403], [429]])("explains the rate limit on HTTP %i", async (status) => {
    vi.stubGlobal("fetch", reply(status));
    render(wrap(<GithubRepos />, client()));
    const note = await waitFor(() => {
      const n = screen.getByRole("status");
      expect(n).toHaveTextContent("GitHub's public rate limit was reached.");
      return n;
    });
    expect(within(note).getByRole("link", { name: "browse the profile directly" })).toHaveAttribute(
      "href",
      `https://github.com/${GITHUB_USER}`,
    );
  });

  it.each([[500], [404]])("reports an unreachable GitHub on HTTP %i", async (status) => {
    vi.stubGlobal("fetch", reply(status));
    render(wrap(<GithubRepos />, client()));
    expect(await screen.findByText(/Couldn't reach GitHub right now\./)).toBeInTheDocument();
  });

  it("reports an unreachable GitHub on a network failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("offline"))),
    );
    render(wrap(<GithubRepos />, client()));
    expect(await screen.findByText(/Couldn't reach GitHub right now\./)).toBeInTheDocument();
  });

  it("says so when there are no public repositories", async () => {
    vi.stubGlobal("fetch", reply(200, []));
    render(wrap(<GithubRepos />, client()));
    expect(await screen.findByText("No public repositories yet.")).toBeInTheDocument();
  });
});
