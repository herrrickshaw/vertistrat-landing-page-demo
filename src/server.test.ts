import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const handler = vi.fn();
vi.mock("@tanstack/react-start/server-entry", () => ({
  default: { fetch: (...a: unknown[]) => handler(...a) },
}));

const H3_BODY = JSON.stringify({ status: 500, unhandled: true, message: "HTTPError" });

describe("server entry", () => {
  const realConsoleError = console.error;
  let errors: unknown[][];

  beforeEach(() => {
    vi.resetModules();
    handler.mockReset();
    errors = [];
  });
  afterEach(() => {
    console.error = realConsoleError;
  });

  async function load() {
    // error-capture (imported by the server) wraps console.error: install the spy first so it wraps the spy
    console.error = (...a: unknown[]) => void errors.push(a);
    const mod = await import("@/server");
    return mod.default;
  }

  it("passes ordinary responses through untouched", async () => {
    const res = new Response("ok", { status: 200 });
    handler.mockResolvedValue(res);
    const server = await load();
    expect(await server.fetch(new Request("http://x/"), { env: 1 }, { ctx: 1 })).toBe(res);
    expect(handler).toHaveBeenCalledWith(expect.any(Request), { env: 1 }, { ctx: 1 });
  });

  it("does not inspect responses below 500 or non-JSON 500s", async () => {
    const server = await load();
    const notFound = new Response(H3_BODY, {
      status: 499,
      headers: { "content-type": "application/json" },
    });
    handler.mockResolvedValueOnce(notFound);
    expect(await server.fetch(new Request("http://x/"), {}, {})).toBe(notFound);
    const html500 = new Response(H3_BODY, {
      status: 500,
      headers: { "content-type": "text/html" },
    });
    handler.mockResolvedValueOnce(html500);
    expect(await server.fetch(new Request("http://x/"), {}, {})).toBe(html500);
    const noType = new Response("x", { status: 500 });
    handler.mockResolvedValueOnce(noType);
    expect(await server.fetch(new Request("http://x/"), {}, {})).toBe(noType);
  });

  it.each([
    [
      "a JSON 500 that is not the h3 swallow shape",
      JSON.stringify({ unhandled: true, message: "Other" }),
    ],
    ["unhandled false", JSON.stringify({ unhandled: false, message: "HTTPError" })],
    ["malformed JSON", "{not json"],
  ])("leaves %s alone", async (_label, body) => {
    const res = new Response(body, {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
    handler.mockResolvedValue(res);
    const server = await load();
    expect(await server.fetch(new Request("http://x/"), {}, {})).toBe(res);
  });

  it("replaces an h3-swallowed 500 with the HTML error page and logs the captured error", async () => {
    const res = new Response(H3_BODY, {
      status: 503,
      headers: { "content-type": "application/json" },
    });
    handler.mockResolvedValue(res);
    const server = await load();
    const out = await server.fetch(new Request("http://x/"), {}, {});
    expect(out.status).toBe(500);
    expect(out.headers.get("content-type")).toBe("text/html; charset=utf-8");
    expect(await out.text()).toContain("This page didn't load");
    expect(String(errors[0]![0])).toContain("h3 swallowed SSR error");
    expect(String(errors[0]![0])).toContain("HTTPError");
  });

  it("logs the original error when one was captured just before the swallow", async () => {
    const original = new Error("real cause");
    const res = new Response(H3_BODY, {
      status: 500,
      headers: { "content-type": "application/json" },
    });
    handler.mockImplementation(async () => {
      console.error(original);
      return res;
    });
    const server = await load();
    const out = await server.fetch(new Request("http://x/"), {}, {});
    expect(out.status).toBe(500);
    expect(errors).toHaveLength(2);
    expect(String(errors[1]![0])).toContain("real cause");
    expect(String(errors[1]![0])).not.toContain("h3 swallowed");
  });

  it("returns the HTML error page when the handler throws, and logs the error", async () => {
    const boom = new Error("handler down");
    handler.mockRejectedValue(boom);
    const server = await load();
    const out = await server.fetch(new Request("http://x/"), {}, {});
    expect(out.status).toBe(500);
    expect(out.headers.get("content-type")).toBe("text/html; charset=utf-8");
    expect(await out.text()).toContain("Go home");
    expect(String(errors[0]![0])).toContain("handler down");
  });

  it("serves several requests through the same loaded entry", async () => {
    handler.mockResolvedValue(new Response("a"));
    const server = await load();
    await server.fetch(new Request("http://x/1"), {}, {});
    await server.fetch(new Request("http://x/2"), {}, {});
    expect(handler).toHaveBeenCalledTimes(2);
  });
});
