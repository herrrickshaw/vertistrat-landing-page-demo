import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installIntersectionObserver, renderApp } from "./support/renderApp";

const state = vi.hoisted(() => ({ fail: true }));

vi.mock("@/components/site/Sections", async (orig) => ({
  ...(await orig<typeof import("@/components/site/Sections")>()),
  TalkStrip: () => {
    if (state.fail) throw new Error("talk strip exploded");
    return <p>talk strip ok</p>;
  },
}));

const reporter = vi.fn();
let errorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  installIntersectionObserver();
  state.fail = true;
  reporter.mockClear();
  window.__lovableEvents = { captureException: reporter };
  errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  errorSpy.mockRestore();
  delete window.__lovableEvents;
});

describe("root error boundary", () => {
  it("shows a recovery screen, logs the error and reports it with the boundary name", async () => {
    await renderApp("/about");
    expect(await screen.findByText("This page didn't load")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go home" })).toHaveAttribute("href", "/");
    await waitFor(() => expect(reporter).toHaveBeenCalled());
    const [error, context, options] = reporter.mock.calls[0]!;
    expect((error as Error).message).toBe("talk strip exploded");
    expect(context).toMatchObject({
      boundary: "tanstack_root_error_component",
      source: "react_error_boundary",
    });
    expect(options).toMatchObject({ handled: false, severity: "error" });
    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: "talk strip exploded" }),
    );
  });

  it("'Try again' re-runs the route once the cause is fixed", async () => {
    await renderApp("/about");
    const retry = await screen.findByRole("button", { name: "Try again" });
    state.fail = false;
    fireEvent.click(retry);
    expect(await screen.findByText("talk strip ok")).toBeInTheDocument();
    expect(screen.queryByText("This page didn't load")).toBeNull();
  });
});
