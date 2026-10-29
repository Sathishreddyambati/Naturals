import { db } from "@/db";
import { orders, products, productVariants, customers } from "@/db/schema";
import { sql, eq, desc } from "drizzle-orm";
import Link from "next/link";
import { formatPaise } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [revenueRow] = await db
    .select({
      revenue: sql<number>`coalesce(sum(case when ${orders.paymentStatus} = 'paid' then ${orders.total} else 0 end), 0)`.mapWith(Number),
      paidOrders: sql<number>`count(case when ${orders.paymentStatus} = 'paid' then 1 end)`.mapWith(Number),
      totalOrders: sql<number>`count(*)`.mapWith(Number),
      pendingOrders: sql<number>`count(case when ${orders.status} = 'pending_payment' then 1 end)`.mapWith(Number),
    })
    .from(orders);

  const [customerCount] = await db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(customers);
  const [productCount] = await db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(products);

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
    .orderBy(productVariants.stock)
    .limit(8);

  const recentOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(6);

  const stats = [
    { label: "Revenue (Paid)", value: formatPaise(revenueRow.revenue) },
    { label: "Paid Orders", value: revenueRow.paidOrders },
    { label: "Pending Payment", value: revenueRow.pendingOrders },
    { label: "Total Orders", value: revenueRow.totalOrders },
    { label: "Customers", value: customerCount.count },
    { label: "Products", value: productCount.count },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-white">Dashboard</h1>
      <p className="mt-1 text-sm text-white/50">Overview of your store performance.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs text-white/50">{s.label}</p>
            <p className="mt-2 font-display text-xl font-semibold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-white">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs font-semibold text-lime hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-4 flex flex-col divide-y divide-white/10">
            {recentOrders.length === 0 && <p className="py-6 text-sm text-white/40">No orders yet.</p>}
            {recentOrders.map((o) => (
              <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center justify-between py-3 text-sm hover:text-lime">
                <span>{o.orderNumber}</span>
                <span className="text-white/50">{o.status.replace("_", " ")}</span>
                <span className="font-semibold">{formatPaise(o.total)}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-white">Low Stock Alerts</h2>
            <Link href="/admin/products" className="text-xs font-semibold text-lime hover:underline">
              Manage
            </Link>
          </div>
          <div className="mt-4 flex flex-col divide-y divide-white/10">
            {lowStock.length === 0 && <p className="py-6 text-sm text-white/40">All stock levels healthy.</p>}
            {lowStock.map((v) => (
              <div key={v.id} className="flex items-center justify-between py-3 text-sm">
                <span>
                  {v.productName} ({v.packSize})
                </span>
                <span className={`font-semibold ${v.stock === 0 ? "text-red-400" : "text-lime"}`}>{v.stock} left</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
