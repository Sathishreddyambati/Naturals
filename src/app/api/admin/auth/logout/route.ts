import { NextResponse } from "next/server";
import { clearSessionCookie, ADMIN_COOKIE } from "@/lib/auth";

export async function POST() {
  await clearSessionCookie(ADMIN_COOKIE);
  return NextResponse.json({ ok: true });
}
