import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CaseStudies } from "@/components/landing/CaseStudies";
import { LANDING_CASES } from "@/config";
import { installIntersectionObserver } from "./support/renderApp";

afterEach(cleanup);

describe("case study dialog", () => {
  it("opens the detail for the clicked case, labels it as a demo, and closes on Escape", async () => {
    installIntersectionObserver();
    render(<CaseStudies />);
    const triggers = Array.from(document.querySelectorAll("button")).filter((b) =>
      /Read the full case/.test(b.textContent ?? ""),
    );
    expect(triggers).toHaveLength(LANDING_CASES.length);
    fireEvent.click(triggers[1]!);
    const dialog = await waitFor(() => {
      const d = document.querySelector<HTMLElement>('[role="dialog"]');
      expect(d).not.toBeNull();
      return d!;
    });
    expect(dialog.textContent).toContain(LANDING_CASES[1].title);
    expect(dialog.textContent).toContain(LANDING_CASES[1].detail);
    expect(dialog.textContent).toContain("Demo scenario — not verified client results.");
    expect(dialog.querySelector('a[href="#contact"]')?.textContent).toContain(
      "Discuss a similar challenge",
    );
    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() => expect(document.querySelector('[role="dialog"]')).toBeNull());
  });
});
