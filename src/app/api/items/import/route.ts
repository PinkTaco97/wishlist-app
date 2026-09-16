import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { addItem, normalizeUrl } from "@/lib/items";
import { parseCsv } from "@/lib/csv";
import { scrapeImageUrl } from "@/lib/scrape-image";

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const text = await request.text();
  const rows = parseCsv(text);

  if (rows.length === 0) {
    return NextResponse.json({ error: "No rows found in CSV" }, { status: 400 });
  }

  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    const title = row.title?.trim();
    if (!title) {
      skipped++;
      continue;
    }

    const url = normalizeUrl(row.url);
    const priceValue = row.price ? Number(row.price) : null;
    const price = priceValue != null && !Number.isNaN(priceValue) ? priceValue : null;

    let imageUrl = row.image_url?.trim() || null;
    if (!imageUrl && url) {
      imageUrl = await scrapeImageUrl(url);
    }

    addItem({
      title,
      url,
      imageUrl,
      category: row.category || null,
      notes: row.notes || null,
      price,
    });
    imported++;
  }

  return NextResponse.json({ imported, skipped });
}
