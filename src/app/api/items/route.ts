import { NextRequest, NextResponse } from "next/server";
import { addItem, getAllItems } from "@/lib/items";

export async function GET() {
  return NextResponse.json(getAllItems());
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body?.title || typeof body.title !== "string") {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const item = addItem({
    title: body.title,
    url: body.url ?? null,
    notes: body.notes ?? null,
    price: body.price ? Number(body.price) : null,
  });

  return NextResponse.json(item, { status: 201 });
}
