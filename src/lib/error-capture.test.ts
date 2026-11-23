import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("error-capture", () => {
  const realConsoleError = console.error;
  let logged: unknown[][];

  beforeEach(async () => {
    vi.resetModules();
    vi.useFakeTimers();
    logged = [];
    console.error = (...args: unknown[]) => void logged.push(args);
  });
  afterEach(() => {
    console.error = realConsoleError;
    vi.useRealTimers();
  });

  async function load() {
    return await import("@/lib/error-capture");
  }

  it("describeError keeps stack, status and the cause chain", async () => {
    const { describeError } = await load();
    const root = Object.assign(new Error("root"), { statusCode: 502 });
    const top = new Error("top", { cause: root });
    const text = describeError(top);
    expect(text).toContain("Error: top");
    expect(text).toContain("caused by: ");
    expect(text).toContain("Error: root");
    expect(text).toContain(" (status 502)");
    expect(describeError(Object.assign(new Error("s"), { status: 404 }))).toContain(
      " (status 404)",
    );
    expect(describeError(Object.assign(new Error("s"), { status: "404" }))).not.toContain(
      "(status",
    );
  });

  it("describeError handles non-errors and limits depth and length", async () => {
    const { describeError } = await load();
    expect(describeError("plain")).toBe("plain");
    expect(describeError({ a: 1 })).toBe('{"a":1}');
    const circular: Record<string, unknown> = {};
    circular["self"] = circular;
    expect(describeError(circular)).toBe("[object Object]");
    expect(describeError(undefined)).toBe("");
    expect(describeError(null)).toBe("");
    let chain: Error = new Error("e7");
    for (let i = 6; i >= 0; i--) chain = new Error(`e${i}`, { cause: chain });
    const parts = describeError(chain).split("caused by: ").length;
    expect(parts).toBe(5);
    const big = new Error("x");
    big.stack = "s".repeat(9_000);
    expect(describeError(big)).toHaveLength(8_000);
  });

  it("wraps console.error: expands errors, passes other arguments through, and records the error", async () => {
    const { consumeLastCapturedError } = await load();
    const err = new Error("boom");
    console.error("msg", err, 42);
    expect(logged).toHaveLength(1);
    expect(logged[0]![0]).toBe("msg");
    expect(String(logged[0]![1])).toContain("Error: boom");
    expect(logged[0]![2]).toBe(42);
    expect(consumeLastCapturedError()).toBe(err);
    expect(consumeLastCapturedError()).toBeUndefined();
  });

  it("only remembers a captured error for 5 seconds", async () => {
    const { consumeLastCapturedError } = await load();
    const err = new Error("old");
    console.error(err);
    vi.advanceTimersByTime(5_000);
    expect(consumeLastCapturedError()).toBe(err);
    console.error(err);
    vi.advanceTimersByTime(5_001);
    expect(consumeLastCapturedError()).toBeUndefined();
    expect(consumeLastCapturedError()).toBeUndefined();
  });

  it("records window error and unhandledrejection events", async () => {
    const { consumeLastCapturedError } = await load();
    const boom = new Error("evt");
    const ev = new Event("error") as ErrorEvent;
    Object.defineProperty(ev, "error", { value: boom });
    globalThis.dispatchEvent(ev);
    expect(consumeLastCapturedError()).toBe(boom);
    globalThis.dispatchEvent(new Event("error"));
    expect(consumeLastCapturedError()).toBeInstanceOf(Event);
    const rej = new Event("unhandledrejection") as PromiseRejectionEvent;
    Object.defineProperty(rej, "reason", { value: "why" });
    globalThis.dispatchEvent(rej);
    expect(consumeLastCapturedError()).toBe("why");
  });
});
