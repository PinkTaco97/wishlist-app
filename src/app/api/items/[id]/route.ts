import { NextResponse } from "next/server";
import { deleteItem } from "@/lib/items";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  deleteItem(Number(id));
  return NextResponse.json({ ok: true });
}
