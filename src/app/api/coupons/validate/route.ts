import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
  const subtotal = Number(body?.subtotal ?? 0);

  if (!code) return NextResponse.json({ error: "Enter a coupon code" }, { status: 400 });

  const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code));
  if (!coupon || !coupon.isActive) {
    return NextResponse.json({ error: "Invalid or expired coupon" }, { status: 404 });
  }
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
  }
  if (subtotal < coupon.minOrderValue) {
    return NextResponse.json(
      { error: `Minimum order value is ₹${(coupon.minOrderValue / 100).toFixed(0)} for this coupon` },
      { status: 400 },
    );
  }

  let discount =
    coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.min(discount, subtotal);

  return NextResponse.json({
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discount,
  });
}
