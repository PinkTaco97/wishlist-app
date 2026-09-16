import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { deleteItem, normalizeUrl, updateItem } from "@/lib/items";
import { scrapeImageUrl } from "@/lib/scrape-image";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  if (!body?.title || typeof body.title !== "string") {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const url = normalizeUrl(body.url);
  const manualImageUrl = normalizeUrl(body.imageUrl);
  const imageUrl = manualImageUrl ?? (url ? await scrapeImageUrl(url) : null);

  const item = updateItem(Number(id), {
    title: body.title,
    url,
    imageUrl,
    category: body.category ?? null,
    notes: body.notes ?? null,
    price: body.price ? Number(body.price) : null,
  });

  return NextResponse.json(item);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  deleteItem(Number(id));
  return NextResponse.json({ ok: true });
}
