import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";
import { renderErrorPage } from "@/lib/error-page";

describe("cn", () => {
  it("joins truthy class names and drops falsy ones", () => {
    const off = false as boolean;
    expect(cn("a", off && "b", undefined, null, "c")).toBe("a c");
    expect(cn({ x: true, y: false })).toBe("x");
  });
  it("lets the later tailwind utility win a conflict", () => {
    expect(cn("p-2 text-sm", "p-4")).toBe("text-sm p-4");
    expect(cn("px-2", "px-2")).toBe("px-2");
  });
});

describe("renderErrorPage", () => {
  it("returns a self-contained HTML document with recovery links", () => {
    const html = renderErrorPage();
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain("<title>This page didn't load</title>");
    expect(html).toContain('onclick="location.reload()"');
    expect(html).toContain('<a class="secondary" href="/">Go home</a>');
    expect(html).not.toContain("<script");
  });
});
