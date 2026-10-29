import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  orderNumber: z.string().min(3),
  contact: z.string().min(3), // email or phone
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Enter order number and contact info" }, { status: 400 });

  const { orderNumber, contact } = parsed.data;
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber.trim().toUpperCase()));

  if (!order || (order.email.toLowerCase() !== contact.toLowerCase() && order.phone !== contact)) {
    return NextResponse.json({ error: "No matching order found. Check your order number and contact info." }, { status: 404 });
  }

  return NextResponse.json({ order });
}
