import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PostBody } from "./PostBody";

afterEach(cleanup);

const shadow = (container: HTMLElement) =>
  (container.querySelector("[data-post-body]") as HTMLElement).shadowRoot!;

describe("PostBody", () => {
  it("wraps tables and code blocks in labelled, focusable scroll regions", () => {
    const { container } = render(
      <PostBody html="<table><tr><td>1</td></tr></table><pre>code()</pre><p>text</p>" />,
    );
    const regions = shadow(container).querySelectorAll(".post-scroll");
    expect(Array.from(regions).map((r) => r.getAttribute("aria-label"))).toEqual([
      "Article table",
      "Code block",
    ]);
    regions.forEach((r) => {
      expect(r.getAttribute("role")).toBe("region");
      expect(r.getAttribute("tabindex")).toBe("0");
    });
    expect(regions[0]!.querySelector("table")).not.toBeNull();
    expect(regions[1]!.querySelector("pre")).not.toBeNull();
  });

  it("re-renders the shadow content when the html changes and clears it on unmount", () => {
    const { container, rerender, unmount } = render(<PostBody html="<p>first</p>" />);
    const root = shadow(container);
    expect(root.textContent).toContain("first");
    rerender(<PostBody html="<p>second</p>" />);
    expect(root.textContent).toContain("second");
    expect(root.textContent).not.toContain("first");
    expect(root.querySelectorAll("style")).toHaveLength(1);
    unmount();
    expect(root.childNodes).toHaveLength(0);
  });

  it("ships a stylesheet that keeps wide content from overflowing and respects reduced motion", () => {
    const { container } = render(<PostBody html="<p>x</p>" />);
    const css = shadow(container).querySelector("style")!.textContent!;
    expect(css).toContain("max-width: 100% !important");
    expect(css).toContain("prefers-reduced-motion: reduce");
  });
});
