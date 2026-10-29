import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCustomerSession } from "@/lib/auth";

export async function GET() {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.customerId, Number(session.sub)))
    .orderBy(desc(orders.createdAt));
  return NextResponse.json({ orders: rows });
}
