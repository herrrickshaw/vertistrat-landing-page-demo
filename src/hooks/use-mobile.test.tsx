import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useIsMobile } from "@/hooks/use-mobile";

function setup(width: number) {
  const listeners = new Set<() => void>();
  const mql = {
    matches: false,
    addEventListener: vi.fn((_t: string, cb: () => void) => listeners.add(cb)),
    removeEventListener: vi.fn((_t: string, cb: () => void) => listeners.delete(cb)),
  };
  const matchMedia = vi.fn(() => mql);
  vi.stubGlobal("matchMedia", matchMedia);
  Object.defineProperty(window, "innerWidth", { value: width, configurable: true, writable: true });
  Object.defineProperty(window, "matchMedia", {
    value: matchMedia,
    configurable: true,
    writable: true,
  });
  return { listeners, mql, matchMedia };
}

afterEach(() => vi.unstubAllGlobals());

describe("useIsMobile", () => {
  it.each([
    [767, true],
    [768, false],
    [320, true],
    [1280, false],
  ])("is %i px wide -> mobile=%s", (w, expected) => {
    setup(w);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(expected);
  });

  it("queries the max-width 767px breakpoint", () => {
    const { matchMedia } = setup(1000);
    renderHook(() => useIsMobile());
    expect(matchMedia).toHaveBeenCalledWith("(max-width: 767px)");
  });

  it("updates when the media query changes and unsubscribes on unmount", () => {
    const { listeners, mql } = setup(1000);
    const { result, unmount } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
    expect(mql.addEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    act(() => {
      (window as unknown as { innerWidth: number }).innerWidth = 500;
      listeners.forEach((cb) => cb());
    });
    expect(result.current).toBe(true);
    unmount();
    expect(mql.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    expect(listeners.size).toBe(0);
  });
});
