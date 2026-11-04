import { describe, expect, it } from "vitest";
import { INSIGHT_THEMES, articleSlug, findArticle } from "./insights";
import { MOST_READ } from "./mostRead";

describe("curated articles", () => {
  const articles = INSIGHT_THEMES.flatMap((theme) => theme.items);
  it("assigns every article a numeric Blogger post ID and unique slug", () => {
    for (const article of articles) expect(article.postId).toMatch(/^\d+$/);
    expect(new Set(articles.map((article) => articleSlug(article.url))).size).toBe(articles.length);
  });
  it("round-trips every curated article through its slug", () => {
    for (const article of articles) expect(findArticle(articleSlug(article.url))).toBe(article);
  });
  it("resolves all eight most-read URLs", () => {
    expect(MOST_READ).toHaveLength(8);
    for (const article of MOST_READ) expect(findArticle(articleSlug(article.url))?.url).toBe(article.url);
  });
});