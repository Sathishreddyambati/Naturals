import { db } from "@/db";
import { customers, orders } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { formatPaise } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const rows = await db
    .select({
      id: customers.id,
      name: customers.name,
      email: customers.email,
      phone: customers.phone,
      createdAt: customers.createdAt,
      orderCount: sql<number>`count(${orders.id})`.mapWith(Number),
      totalSpent: sql<number>`coalesce(sum(case when ${orders.paymentStatus} = 'paid' then ${orders.total} else 0 end), 0)`.mapWith(Number),
    })
    .from(customers)
    .leftJoin(orders, eq(orders.customerId, customers.id))
    .groupBy(customers.id)
    .orderBy(desc(customers.createdAt));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-white">Customers</h1>
      <p className="mt-1 text-sm text-white/50">{rows.length} registered customers</p>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-white/50">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Total Spent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium text-white">{c.name}</td>
                <td className="px-4 py-3 text-white/60">{c.email}</td>
                <td className="px-4 py-3 text-white/60">{c.phone ?? "—"}</td>
                <td className="px-4 py-3 text-white/70">{c.orderCount}</td>
                <td className="px-4 py-3 font-semibold text-lime">{formatPaise(c.totalSpent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
