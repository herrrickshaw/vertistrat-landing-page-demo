import { afterEach, describe, expect, it, vi } from "vitest";
import { reportLovableError } from "@/lib/lovable-error-reporting";

afterEach(() => {
  delete window.__lovableEvents;
  delete window.__lovableReportRuntimeError;
  vi.unstubAllGlobals();
});

describe("reportLovableError", () => {
  it("sends the exception with route context and boundary options", () => {
    const captureException = vi.fn();
    window.__lovableEvents = { captureException };
    const err = new Error("x");
    reportLovableError(err, { boundary: "root" });
    expect(captureException).toHaveBeenCalledWith(
      err,
      { source: "react_error_boundary", route: window.location.pathname, boundary: "root" },
      { mechanism: "react_error_boundary", handled: false, severity: "error" },
    );
  });

  it("lets caller context override the defaults", () => {
    const captureException = vi.fn();
    window.__lovableEvents = { captureException };
    reportLovableError("e", { source: "custom", route: "/r" });
    expect(captureException.mock.calls[0]![1]).toMatchObject({ source: "custom", route: "/r" });
  });

  it("forwards a runtime-error payload with message, stack and pathname", () => {
    const hook = vi.fn();
    window.__lovableReportRuntimeError = hook;
    const err = new Error("kaput");
    reportLovableError(err);
    expect(hook).toHaveBeenCalledWith({
      message: "kaput",
      stack: err.stack,
      filename: window.location.pathname,
    });
  });

  it("omits the stack for non-Error values", () => {
    const hook = vi.fn();
    window.__lovableReportRuntimeError = hook;
    reportLovableError("just text");
    expect(hook.mock.calls[0]![0]).toEqual({
      message: "just text",
      filename: window.location.pathname,
    });
    expect("stack" in hook.mock.calls[0]![0]).toBe(false);
  });

  it.each([
    [new Response(null, { status: 503 }), "Response 503"],
    [{ message: "from supabase", code: "x" }, "from supabase"],
    [{ message: "" }, '{"message":""}'],
    [{ message: 5 }, '{"message":5}'],
    [null, "null"],
    [undefined, "undefined"],
    [42, "42"],
  ])("describes %j for the runtime hook", (value, expected) => {
    const hook = vi.fn();
    window.__lovableReportRuntimeError = hook;
    reportLovableError(value);
    expect(hook.mock.calls[0]![0].message).toBe(expected);
  });

  it("truncates huge serialisations to 2000 characters and survives circular values", () => {
    const hook = vi.fn();
    window.__lovableReportRuntimeError = hook;
    reportLovableError({ blob: "z".repeat(5_000) });
    expect(hook.mock.calls[0]![0].message).toHaveLength(2_000);
    const circular: Record<string, unknown> = {};
    circular["me"] = circular;
    reportLovableError(circular);
    expect(hook.mock.calls[1]![0].message).toBe("[object Object]");
  });

  it("is a no-op without the editor hooks and without a window", () => {
    expect(() => reportLovableError(new Error("x"))).not.toThrow();
    const captureException = vi.fn();
    window.__lovableEvents = { captureException };
    vi.stubGlobal("window", undefined);
    try {
      reportLovableError(new Error("x"));
    } finally {
      vi.unstubAllGlobals();
    }
    expect(captureException).not.toHaveBeenCalled();
  });
});
