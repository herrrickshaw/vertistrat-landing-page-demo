import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  serverFn: undefined as undefined | ((a: { next: () => Promise<unknown> }) => Promise<unknown>),
  csrfOpts: undefined as undefined | { filter: (ctx: { handlerType: string }) => boolean },
  startFactory: undefined as undefined | (() => { requestMiddleware: unknown[] }),
}));

vi.mock("@tanstack/react-start", () => ({
  createMiddleware: () => ({
    server: (fn: typeof state.serverFn) => {
      state.serverFn = fn;
      return { kind: "error-middleware" };
    },
  }),
  createCsrfMiddleware: (opts: typeof state.csrfOpts) => {
    state.csrfOpts = opts;
    return { kind: "csrf-middleware" };
  },
  createStart: (factory: typeof state.startFactory) => {
    state.startFactory = factory;
    return { kind: "start" };
  },
}));

describe("start instance", () => {
  beforeEach(async () => {
    vi.resetModules();
    await import("@/start");
  });

  it("registers the error middleware before the CSRF middleware", () => {
    expect(state.startFactory!()).toEqual({
      requestMiddleware: [{ kind: "error-middleware" }, { kind: "csrf-middleware" }],
    });
  });

  it("only applies CSRF protection to server functions", () => {
    expect(state.csrfOpts!.filter({ handlerType: "serverFn" })).toBe(true);
    expect(state.csrfOpts!.filter({ handlerType: "router" })).toBe(false);
    expect(state.csrfOpts!.filter({ handlerType: "" })).toBe(false);
  });

  it("returns whatever the next handler returns", async () => {
    const res = new Response("fine");
    expect(await state.serverFn!({ next: async () => res })).toBe(res);
  });

  it("rethrows errors that carry a statusCode so the framework can handle them", async () => {
    const http = Object.assign(new Error("nope"), { statusCode: 404 });
    await expect(
      state.serverFn!({
        next: async () => {
          throw http;
        },
      }),
    ).rejects.toBe(http);
    const plain = { statusCode: 0 };
    await expect(
      state.serverFn!({
        next: async () => {
          throw plain;
        },
      }),
    ).rejects.toBe(plain);
  });

  it("turns any other failure into the HTML error page with status 500", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    for (const err of [
      new Error("x"),
      "string failure",
      null,
      undefined,
      { message: "no status" },
    ]) {
      const out = (await state.serverFn!({
        next: async () => {
          throw err;
        },
      })) as Response;
      expect(out.status).toBe(500);
      expect(out.headers.get("content-type")).toBe("text/html; charset=utf-8");
      expect(await out.text()).toContain("This page didn't load");
    }
    expect(log).toHaveBeenCalledTimes(5);
    log.mockRestore();
  });
});
