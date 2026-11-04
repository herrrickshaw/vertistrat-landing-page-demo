import { describe, expect, it } from "vitest";
import { LANDING_IMPACT, DIAGNOSTIC_BOOKING_URL, DIAGNOSTIC_CALL_URL, GOOGLE_FORM_URL } from "@/config";

describe("Explicitly illustrative home performance figures", () => {
  it("uses 98 percent on-time delivery", () => expect(LANDING_IMPACT[0]).toMatchObject({ value: 98, suffix: "%" }));
  it("uses 150 plus enterprise projects", () => expect(LANDING_IMPACT[1]).toMatchObject({ value: 150, suffix: "+" }));
  it("uses 40 crore plus capital saved", () => expect(LANDING_IMPACT[2]).toMatchObject({ value: 40, prefix: "₹", suffix: "Cr+" }));
  it("uses 35 percent average schedule recovery", () => expect(LANDING_IMPACT[3]).toMatchObject({ value: 35, suffix: "%" }));
  it("keeps enquiries in the Google Form until a real booking destination is supplied", () => {
    expect(DIAGNOSTIC_BOOKING_URL).toBe("");
    expect(DIAGNOSTIC_CALL_URL).toBe(GOOGLE_FORM_URL);
  });
});