import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { addItem, deleteAllItems, getAllItems, normalizeUrl } from "@/lib/items";
import { scrapeImageUrl } from "@/lib/scrape-image";

export async function GET() {
  return NextResponse.json(getAllItems());
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (!body?.title || typeof body.title !== "string") {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const url = normalizeUrl(body.url);
  const imageUrl = url ? await scrapeImageUrl(url) : null;

  const item = addItem({
    title: body.title,
    url,
    imageUrl,
    category: body.category ?? null,
    notes: body.notes ?? null,
    price: body.price ? Number(body.price) : null,
  });

  return NextResponse.json(item, { status: 201 });
}

export async function DELETE() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  deleteAllItems();
  return NextResponse.json({ ok: true });
}
