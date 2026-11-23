import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { jsonp } from "@/lib/jsonp";

function pendingScript(): HTMLScriptElement {
  const script = document.head.querySelector("script[src]");
  if (!script) throw new Error("no script injected");
  return script as HTMLScriptElement;
}

describe("jsonp", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.head.innerHTML = "";
  });
  afterEach(() => {
    vi.useRealTimers();
    document.head.innerHTML = "";
  });

  it("injects a script with a unique callback and resolves with the payload", async () => {
    const p = jsonp("https://feed.example/x?alt=json-in-script");
    const script = pendingScript();
    const cb = new URL(script.src).searchParams.get("callback")!;
    expect(cb).toMatch(/^__vsFeed\d+_\d+$/);
    expect(script.src).toContain("alt=json-in-script&callback=");
    (window as unknown as Record<string, (d: unknown) => void>)[cb]!({ ok: 1 });
    await expect(p).resolves.toEqual({ ok: 1 });
    expect((window as unknown as Record<string, unknown>)[cb]).toBeUndefined();
    expect(document.head.querySelector("script")).toBeNull();
  });

  it("uses ? when the URL has no query string and gives each call its own callback", () => {
    void jsonp("https://feed.example/a").catch(() => {});
    void jsonp("https://feed.example/b").catch(() => {});
    const [a, b] = Array.from(document.head.querySelectorAll("script")) as HTMLScriptElement[];
    expect(a!.src).toMatch(/\/a\?callback=__vsFeed/);
    expect(new URL(a!.src).searchParams.get("callback")).not.toBe(
      new URL(b!.src).searchParams.get("callback"),
    );
  });

  it("rejects when the script fails to load and cleans up", async () => {
    const p = jsonp("https://feed.example/x");
    const script = pendingScript();
    const cb = new URL(script.src).searchParams.get("callback")!;
    script.onerror!(new Event("error"));
    await expect(p).rejects.toThrow("Feed failed");
    expect((window as unknown as Record<string, unknown>)[cb]).toBeUndefined();
    expect(document.head.querySelector("script")).toBeNull();
  });

  it("times out after exactly 10 seconds", async () => {
    const p = jsonp("https://feed.example/x");
    const assertion = expect(p).rejects.toThrow("timeout");
    await vi.advanceTimersByTimeAsync(9_999);
    expect(document.head.querySelector("script")).not.toBeNull();
    await vi.advanceTimersByTimeAsync(1);
    await assertion;
    expect(document.head.querySelector("script")).toBeNull();
  });

  it("does not time out after a successful response", async () => {
    const p = jsonp("https://feed.example/x");
    const cb = new URL(pendingScript().src).searchParams.get("callback")!;
    (window as unknown as Record<string, (d: unknown) => void>)[cb]!("done");
    await expect(p).resolves.toBe("done");
    await vi.advanceTimersByTimeAsync(20_000);
    expect(vi.getTimerCount()).toBe(0);
  });
});
