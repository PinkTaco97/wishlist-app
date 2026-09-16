import * as cheerio from "cheerio";

const FETCH_TIMEOUT_MS = 5000;

export async function scrapeImageUrl(pageUrl: string): Promise<string | null> {
  let parsed: URL;
  try {
    parsed = new URL(pageUrl);
  } catch {
    return null;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return null;
  }

  try {
    const res = await fetch(parsed, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; WishlistApp/1.0)" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;

    const html = await res.text();
    const $ = cheerio.load(html);

    const image =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content");
    if (!image) return null;

    return new URL(image, parsed).toString();
  } catch {
    return null;
  }
}
