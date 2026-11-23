import { act, cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  GOOGLE_FORM_EMBED_URL,
  GOOGLE_FORM_URL,
  LANDING_CASES,
  LANDING_STEPS,
  CONTACT_EMAIL,
} from "@/config";
import { INSIGHT_THEMES, articleSlug } from "@/data/insights";
import { jsonp } from "@/lib/jsonp";
import { installIntersectionObserver, intersect, observers, renderApp } from "./support/renderApp";

vi.mock("@/lib/jsonp", () => ({ jsonp: vi.fn() }));
const jsonpMock = vi.mocked(jsonp);

beforeEach(() => {
  installIntersectionObserver();
  jsonpMock.mockRejectedValue(new Error("offline"));
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.reject(new Error("offline"))),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const h1 = () => screen.getByRole("heading", { level: 1 });

describe("home page", () => {
  it("renders the landing sections with the demo disclosures", async () => {
    await renderApp("/");
    expect(h1()).toHaveTextContent("From Project Complexity to Execution Clarity");
    expect(screen.getByRole("region", { name: "Sector coverage" })).toHaveTextContent(
      "Sector placeholders · not client endorsements",
    );
    expect(screen.getAllByText(/Illustrative/).length).toBeGreaterThan(2);
    for (const label of [
      "On-Time Delivery",
      "Enterprise Projects",
      "Capital Saved",
      "Average Schedule Recovery",
    ])
      expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Schedule Project Diagnostic/ })).toHaveAttribute(
      "href",
      "#contact",
    );
    expect(screen.getByRole("link", { name: /View Case Studies/ })).toHaveAttribute(
      "href",
      "#case-studies",
    );
  });

  it("keeps enquiries on the Google Form (no booking URL configured)", async () => {
    await renderApp("/");
    const request = screen.getByRole("link", { name: /Request a 30-min diagnostic call/ });
    expect(request).toHaveAttribute("href", GOOGLE_FORM_URL);
    expect(request).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByText("Share your preferred time in the enquiry form.")).toBeInTheDocument();
    expect(screen.getByTitle("Work with VertiStrat enquiry form")).toHaveAttribute(
      "src",
      GOOGLE_FORM_EMBED_URL,
    );
    expect(screen.getAllByRole("link", { name: CONTACT_EMAIL }).length).toBeGreaterThan(0);
  });

  it("switches framework tabs", async () => {
    await renderApp("/");
    const tabs = screen.getByRole("tablist", { name: "Delivery framework" });
    expect(within(tabs).getAllByRole("tab")).toHaveLength(LANDING_STEPS.length);
    expect(screen.getAllByText(LANDING_STEPS[0].short).length).toBeGreaterThan(0);
    const second = within(tabs).getByRole("tab", { name: /Seamless Integration/ });
    fireEvent.mouseDown(second);
    fireEvent.click(second);
    await waitFor(() => expect(second).toHaveAttribute("aria-selected", "true"));
    expect(screen.getAllByText(LANDING_STEPS[1].deliverables[0]!).length).toBeGreaterThan(0);
  });

  it("lists three illustrative case studies with before and after figures", async () => {
    await renderApp("/");
    const articles = document.querySelectorAll("#case-studies article");
    expect(articles).toHaveLength(LANDING_CASES.length);
    LANDING_CASES.forEach((c, i) => {
      expect(articles[i]!.textContent).toContain(c.title);
      c.metrics.forEach((m) => {
        expect(articles[i]!.textContent).toContain(m.before);
        expect(articles[i]!.textContent).toContain(m.after);
      });
    });
    expect(
      screen.getByText("Illustrative case studies · not verified client results"),
    ).toBeInTheDocument();
  });

  it("animates impact counters only when scrolled into view", async () => {
    await renderApp("/");
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
    const counter = screen.getByLabelText("98%");
    expect(counter).toHaveTextContent("98%"); // final value is shown until the animation starts
    const idx = observers.findIndex((o) => o.el === counter);
    expect(idx).toBeGreaterThanOrEqual(0);
    intersect(idx, false);
    expect(observers[idx]!.disconnected).toBe(false); // not intersecting: keep observing
    act(() => intersect(idx, true));
    expect(observers[idx]!.disconnected).toBe(true);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
    });
    expect(counter).toHaveTextContent("98%");
  });

  it("reveals sections via the observer unless reduced motion is requested", async () => {
    await renderApp("/");
    const pending = document.querySelectorAll<HTMLElement>("[data-reveal]");
    expect(pending.length).toBeGreaterThan(0);
    pending.forEach((el) => expect(el.dataset["reveal"]).toBe("pending"));
    const i = observers.findIndex((o) => o.el === pending[0]);
    act(() => intersect(i, true));
    expect(pending[0]!.dataset["reveal"]).toBe("visible");
  });
});

describe("header navigation", () => {
  it("lists the site pages and toggles the mobile menu", async () => {
    await renderApp("/about");
    const main = screen.getByRole("navigation", { name: "Main" });
    for (const label of [
      "About",
      "Manufacturing",
      "IT services",
      "Biofuels & energy",
      "Insights",
      "Trade ideas",
      "Contact",
    ])
      expect(within(main).getByRole("link", { name: label })).toBeInTheDocument();
    expect(within(main).getByRole("link", { name: "About" })).toHaveClass("highlight");
    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("navigation", { name: "Mobile" })).toBeNull();
    fireEvent.click(toggle);
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    const mobile = screen.getByRole("navigation", { name: "Mobile" });
    expect(within(mobile).getAllByRole("link")).toHaveLength(7);
    fireEvent.click(within(mobile).getByRole("link", { name: "Insights" }));
    await waitFor(() => expect(screen.queryByRole("navigation", { name: "Mobile" })).toBeNull());
    expect(await screen.findByRole("heading", { level: 1, name: "Insights" })).toBeInTheDocument();
  });

  it("marks the header scrolled after 24px on the home page only", async () => {
    await renderApp("/");
    const header = document.querySelector("header")!;
    expect(header).toHaveClass("landing-header");
    expect(header).not.toHaveClass("header-scrolled");
    act(() => {
      Object.defineProperty(window, "scrollY", { value: 25, configurable: true });
      window.dispatchEvent(new Event("scroll"));
    });
    expect(header).toHaveClass("header-scrolled");
    act(() => {
      Object.defineProperty(window, "scrollY", { value: 24, configurable: true });
      window.dispatchEvent(new Event("scroll"));
    });
    expect(header).not.toHaveClass("header-scrolled");
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  });

  it("shows the footer details and no talk strip on the home page", async () => {
    await renderApp("/");
    expect(screen.getByRole("contentinfo")).toHaveTextContent("LLPIN: [placeholder]");
    expect(screen.getByRole("link", { name: /^Map/ })).toHaveAttribute(
      "href",
      expect.stringContaining("maps.app.goo.gl"),
    );
    expect(screen.getByRole("link", { name: "+91 70222 59460" })).toHaveAttribute(
      "href",
      "tel:+917022259460",
    );
    cleanup();
    await renderApp("/about");
    expect(document.querySelector("header")).not.toHaveClass("landing-header");
  });
});

describe.each([
  ["/about", /Projects stall between the layers/],
  ["/manufacturing", /Manufacturing advisory/],
  ["/it-services", /IT services advisory/],
  ["/biofuels-energy", /Biofuels, biochemicals & energy/],
])("practice page %s", (path, title) => {
  it("renders its hero and a call to action linking to the contact form", async () => {
    await renderApp(path);
    expect(h1()).toHaveTextContent(title);
    expect(screen.getAllByRole("heading", { level: 2 }).length).toBeGreaterThan(2);
    expect(
      screen
        .getAllByRole("link")
        .some(
          (a) =>
            a.getAttribute("href")?.includes("contact") ||
            a.getAttribute("href") === GOOGLE_FORM_URL ||
            a.getAttribute("href")?.startsWith("mailto:"),
        ),
    ).toBe(true);
  });
});

describe("not found", () => {
  it("shows a 404 with a way home for unknown paths", async () => {
    await renderApp("/zzz");
    expect(h1()).toHaveTextContent("404");
    expect(screen.getByRole("link", { name: "Go home" })).toHaveAttribute("href", "/");
  });
});

describe("article page", () => {
  const first = INSIGHT_THEMES[0]!.items[0]!;
  const slug = articleSlug(first.url);

  it("shows the article header, loading state, and related articles of the same theme", async () => {
    jsonpMock.mockReturnValue(new Promise(() => {}));
    await renderApp(`/insights/${slug}`);
    expect(h1()).toHaveTextContent(first.title);
    expect(screen.getAllByText("Industrial policy & incentives").length).toBeGreaterThan(0);
    expect(screen.getByRole("status", { name: "Loading article" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(screen.getByText("2 Aug 2026", { exact: false })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Originally published on Masala Deutsch/ }),
    ).toHaveAttribute("href", first.url);
    const related = screen
      .getByRole("heading", { level: 2, name: "Related articles" })
      .closest("section")!;
    expect(within(related).getAllByRole("link")).toHaveLength(3);
    expect(within(related).queryByText(first.title)).toBeNull();
    expect(jsonpMock).toHaveBeenCalledWith(
      expect.stringContaining(`/feeds/posts/default/${first.postId}?alt=json-in-script`),
    );
  });

  it("renders the sanitised post body in a shadow root with scrollable tables", async () => {
    jsonpMock.mockResolvedValue({
      entry: {
        content: {
          $t: "<h2>Post</h2><table><tr><td>1</td></tr></table><iframe src='x'></iframe><p onclick='x()'>t</p>",
        },
      },
    });
    await renderApp(`/insights/${slug}`);
    const host = await waitFor(() => {
      const el = document.querySelector("[data-post-body]") as HTMLElement;
      expect(el.shadowRoot?.querySelector("h2")).not.toBeNull();
      return el;
    });
    const shadow = host.shadowRoot!;
    expect(shadow.querySelector("iframe")).toBeNull();
    expect(shadow.querySelector("[onclick]")).toBeNull();
    const scroll = shadow.querySelector(".post-scroll")!;
    expect(scroll.getAttribute("role")).toBe("region");
    expect(scroll.getAttribute("aria-label")).toBe("Article table");
    expect(scroll.querySelector("table")).not.toBeNull();
    expect(screen.queryByText(/interactive charts/)).toBeNull();
  });

  it("warns that interactive charts only work on the blog", async () => {
    jsonpMock.mockResolvedValue({
      entry: { content: { $t: "<p>x</p><script>new Chart(ctx, {});</script>" } },
    });
    await renderApp(`/insights/${slug}`);
    expect(await screen.findByText(/This article has interactive charts\./)).toBeInTheDocument();
    const shadow = (document.querySelector("[data-post-body]") as HTMLElement).shadowRoot!;
    await waitFor(() => expect(shadow.querySelector("p")).not.toBeNull());
    expect(shadow.querySelector("script")).toBeNull(); // the chart script never runs here
    expect(screen.getByRole("link", { name: /View them on Masala Deutsch/ })).toHaveAttribute(
      "href",
      first.url,
    );
  });

  it.each([
    ["the feed fails", () => jsonpMock.mockRejectedValue(new Error("x"))],
    ["the entry has no content", () => jsonpMock.mockResolvedValue({ entry: {} })],
  ])("offers the blog link when %s", async (_n, arrange) => {
    arrange();
    await renderApp(`/insights/${slug}`);
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Couldn't load the article here.");
    expect(within(alert).getByRole("link", { name: /Read on Masala Deutsch/ })).toHaveAttribute(
      "href",
      first.url,
    );
  });

  it("returns a 404 page for an unknown article", async () => {
    await renderApp("/insights/not-a-real-article");
    expect(h1()).toHaveTextContent("404");
    expect(screen.getByRole("link", { name: /← Insights/ })).toHaveAttribute("href", "/insights");
  });
});
