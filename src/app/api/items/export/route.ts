import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getAllItems } from "@/lib/items";
import { itemsToCsv } from "@/lib/csv";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const csv = itemsToCsv(getAllItems());

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="wishlist-export.csv"',
    },
  });
}
