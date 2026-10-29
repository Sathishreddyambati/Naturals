import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-guard";
import { couponSchema } from "@/lib/validation";

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const items = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const body = await req.json().catch(() => null);
  const parsed = couponSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const code = parsed.data.code.toUpperCase();
  const [existing] = await db.select().from(coupons).where(eq(coupons.code, code));
  if (existing) return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });

  await db.insert(coupons).values({
    ...parsed.data,
    code,
    expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
  });
  return NextResponse.json({ ok: true });
}
