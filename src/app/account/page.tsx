import { redirect } from "next/navigation";
import Link from "next/link";
import { getCustomerSession } from "@/lib/auth";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatPaise } from "@/lib/money";
import Reveal from "@/components/ui/Reveal";
import LogoutButton from "@/components/account/LogoutButton";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/login");

  const myOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.customerId, Number(session.sub)))
    .orderBy(desc(orders.createdAt));

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:px-8">
      <Reveal className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cobalt-soft">My Account</p>
          <h1 className="font-display mt-3 text-3xl font-semibold text-white">Hi, {session.name}</h1>
          <p className="mt-1 text-sm text-white/50">{session.email}</p>
        </div>
        <LogoutButton />
      </Reveal>

      <h2 className="mt-12 font-display text-xl font-semibold text-white">Order History</h2>
      {myOrders.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-white/50">
          <p>You haven&apos;t placed any orders yet.</p>
          <Link href="/shop" className="mt-4 inline-block rounded-full bg-lime px-6 py-2.5 text-sm font-bold text-midnight">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {myOrders.map((order) => (
            <Link
              key={order.id}
              href={`/order/${order.orderNumber}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-lime/30"
            >
              <div>
                <p className="font-medium text-white">{order.orderNumber}</p>
                <p className="text-xs text-white/50">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <span className="rounded-full bg-cobalt/20 px-3 py-1 text-xs font-semibold uppercase text-cobalt-soft">
                {order.status.replace("_", " ")}
              </span>
              <span className="font-semibold text-lime">{formatPaise(order.total)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
