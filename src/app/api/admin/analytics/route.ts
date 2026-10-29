import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, products, productVariants, customers } from "@/db/schema";
import { sql, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const [revenueRow] = await db
    .select({
      revenue: sql<number>`coalesce(sum(case when ${orders.paymentStatus} = 'paid' then ${orders.total} else 0 end), 0)`.mapWith(Number),
      paidOrders: sql<number>`count(case when ${orders.paymentStatus} = 'paid' then 1 end)`.mapWith(Number),
      totalOrders: sql<number>`count(*)`.mapWith(Number),
      pendingOrders: sql<number>`count(case when ${orders.status} = 'pending_payment' then 1 end)`.mapWith(Number),
    })
    .from(orders);

  const [customerCount] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(customers);

  const [productCount] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(products);

  const lowStock = await db
    .select({
      id: productVariants.id,
      packSize: productVariants.packSize,
      stock: productVariants.stock,
      productName: products.name,
    })
    .from(productVariants)
    .leftJoin(products, eq(productVariants.productId, products.id))
    .where(sql`${productVariants.stock} <= 10`)
    .orderBy(productVariants.stock);

  return NextResponse.json({
    revenue: revenueRow.revenue,
    paidOrders: revenueRow.paidOrders,
    totalOrders: revenueRow.totalOrders,
    pendingOrders: revenueRow.pendingOrders,
    customerCount: customerCount.count,
    productCount: productCount.count,
    lowStock,
  });
}
