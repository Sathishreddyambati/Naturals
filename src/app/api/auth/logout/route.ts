import { NextResponse } from "next/server";
import { clearSessionCookie, CUSTOMER_COOKIE } from "@/lib/auth";

export async function POST() {
  await clearSessionCookie(CUSTOMER_COOKIE);
  return NextResponse.json({ ok: true });
}
