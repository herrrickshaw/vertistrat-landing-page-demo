import { Fuel, Landmark, Leaf, Newspaper, Ship, Sprout, TrendingUp } from "lucide-react";
import { describe, expect, it } from "vitest";
import { THEME_ICON, tagIcon, themeIcon } from "./themeIcons";

describe("themeIcon", () => {
  it("maps each insights theme to its icon and falls back to a trend line", () => {
    expect(themeIcon("industrial-policy")).toBe(Landmark);
    expect(themeIcon("energy")).toBe(Fuel);
    expect(themeIcon("trade")).toBe(Ship);
    expect(themeIcon("agri-food")).toBe(Sprout);
    expect(themeIcon("capital-climate")).toBe(TrendingUp);
    expect(themeIcon("")).toBe(TrendingUp);
    expect(Object.keys(THEME_ICON)).toHaveLength(4);
  });
});

describe("tagIcon", () => {
  it.each([
    ["Ethanol & Biofuels", Leaf],
    ["biofuel", Leaf],
    ["Energy & Fuels", Fuel],
    ["FUEL", Fuel],
    ["Trade & Tariffs", Ship],
    ["tariff", Ship],
    ["Food Processing", Sprout],
    ["Agri", Sprout],
    ["Corporate Finance & M&A", TrendingUp],
    ["Capital", TrendingUp],
    ["Industrial Policy", Landmark],
    ["India Trade & Policy", Ship],
    ["Something else", Newspaper],
    ["", Newspaper],
  ])("%s", (tag, icon) => expect(tagIcon(tag)).toBe(icon));
  it("defaults to the generic icon when no tag is given", () => expect(tagIcon()).toBe(Newspaper));
  it("checks ethanol before energy, so 'Ethanol & Energy' is a leaf", () =>
    expect(tagIcon("Ethanol & Energy")).toBe(Leaf));
});
