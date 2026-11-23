import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { getRouter } from "@/router";

describe("getRouter", () => {
  it("creates a fresh router and query client per call", () => {
    const a = getRouter();
    const b = getRouter();
    expect(a).not.toBe(b);
    expect(a.options.context.queryClient).toBeInstanceOf(QueryClient);
    expect(a.options.context.queryClient).not.toBe(b.options.context.queryClient);
  });

  it("restores scroll and never serves a preloaded route as stale", () => {
    const router = getRouter();
    expect(router.options.scrollRestoration).toBe(true);
    expect(router.options.defaultPreloadStaleTime).toBe(0);
  });

  it("knows the site's pages", () => {
    const router = getRouter();
    for (const path of [
      "/",
      "/about",
      "/manufacturing",
      "/it-services",
      "/biofuels-energy",
      "/insights",
      "/trade-ideas",
    ]) {
      expect(router.matchRoutes(path).at(-1)?.routeId, path).not.toBe("__root__");
    }
    expect(router.matchRoutes("/nope").at(-1)?.routeId).toBe("__root__");
  });
});
