import { NextRequest, NextResponse } from "next/server";
import { checkPassword, createSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (typeof body?.password !== "string" || !checkPassword(body.password)) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  await createSession();
  return NextResponse.json({ ok: true });
}
