import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function computeCouponDiscount(code: string | null | undefined, subtotal: number) {
  if (!code) return { discount: 0, couponCode: null as string | null, coupon: null };
  const normalized = code.trim().toUpperCase();
  const [coupon] = await db.select().from(coupons).where(eq(coupons.code, normalized));
  if (!coupon || !coupon.isActive) throw new Error("Invalid or expired coupon");
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    throw new Error("This coupon has expired");
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new Error("This coupon has reached its usage limit");
  }
  if (subtotal < coupon.minOrderValue) {
    throw new Error(`Minimum order value is ₹${(coupon.minOrderValue / 100).toFixed(0)} for this coupon`);
  }
  let discount =
    coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.min(discount, subtotal);
  return { discount, couponCode: coupon.code, coupon };
}
