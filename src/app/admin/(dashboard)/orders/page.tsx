import { db } from "@/db";
import { orders } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { formatPaise } from "@/lib/money";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  pending_payment: "bg-amber-500/15 text-amber-300",
  processing: "bg-cobalt/20 text-cobalt-soft",
  shipped: "bg-blue-500/15 text-blue-300",
  delivered: "bg-emerald-500/15 text-emerald-300",
  cancelled: "bg-white/10 text-white/50",
  failed: "bg-red-500/15 text-red-300",
  refunded: "bg-purple-500/15 text-purple-300",
};

export default async function AdminOrdersPage() {
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-white">Orders</h1>
      <p className="mt-1 text-sm text-white/50">{rows.length} total orders</p>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-white/50">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((o) => (
              <tr key={o.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="font-medium text-white hover:text-lime">
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-white/60">{o.email}</td>
                <td className="px-4 py-3 text-white/60">
                  {o.paymentMethod === "cod" ? "COD" : "Razorpay"} · {o.paymentStatus}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[o.status] ?? "bg-white/10 text-white/60"}`}>
                    {o.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-white">{formatPaise(o.total)}</td>
                <td className="px-4 py-3 text-white/50">{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
