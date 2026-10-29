import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { reviewSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const [product] = await db.select().from(products).where(eq(products.id, parsed.data.productId));
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  await db.insert(reviews).values({ ...parsed.data, isApproved: false });
  return NextResponse.json({ ok: true, message: "Thanks! Your review will appear after moderation." });
}
