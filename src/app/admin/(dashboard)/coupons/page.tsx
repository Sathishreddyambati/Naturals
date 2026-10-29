import { db } from "@/db";
import { coupons } from "@/db/schema";
import { desc } from "drizzle-orm";
import CouponManager from "@/components/admin/CouponManager";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const rows = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
  return (
    <CouponManager
      initialCoupons={rows.map((c) => ({ ...c, expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null }))}
    />
  );
}
