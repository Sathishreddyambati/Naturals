import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { productVariants, products, orders, coupons } from "@/db/schema";
import { eq, inArray, sql } from "drizzle-orm";
import { checkoutSchema } from "@/lib/validation";
import { computeCouponDiscount } from "@/lib/data/coupons";
import { getShippingFee } from "@/lib/shipping";
import { generateOrderNumber } from "@/lib/ids";
import { getCustomerSession } from "@/lib/auth";
import { getRazorpayClient, isRazorpayConfigured } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const paymentMethod = body?.paymentMethod === "cod" ? "cod" : "razorpay";
  const { email, phone, address, items, couponCode } = parsed.data;

  try {
    const result = await db.transaction(async (tx) => {
      const variantIds = items.map((i) => i.variantId);
      const variantRows = await tx
        .select()
        .from(productVariants)
        .where(inArray(productVariants.id, variantIds))
        .for("update");

      const productIds = Array.from(new Set(variantRows.map((v) => v.productId)));
      const productRows = productIds.length
        ? await tx.select().from(products).where(inArray(products.id, productIds))
        : [];

      const orderItems: Array<{
        productId: number;
        variantId: number;
        name: string;
        packSize: string;
        image: string;
        price: number;
        quantity: number;
      }> = [];

      for (const item of items) {
        const variant = variantRows.find((v) => v.id === item.variantId);
        if (!variant || !variant.isActive) {
          throw new Error("One of the items in your cart is no longer available.");
        }
        const product = productRows.find((p) => p.id === variant.productId);
        if (!product || !product.isActive) {
          throw new Error("One of the items in your cart is no longer available.");
        }
        if (variant.stock < item.quantity) {
          throw new Error(`Only ${variant.stock} unit(s) left for ${product.name} (${variant.packSize}).`);
        }
        orderItems.push({
          productId: product.id,
          variantId: variant.id,
          name: product.name,
          packSize: variant.packSize,
          image: product.images[0] ?? "",
          price: variant.price,
          quantity: item.quantity,
        });
      }

      const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

      let discount = 0;
      let appliedCoupon: string | null = null;
      if (couponCode) {
        const res = await computeCouponDiscount(couponCode, subtotal);
        discount = res.discount;
        appliedCoupon = res.couponCode;
      }

      const shippingFee = getShippingFee(subtotal - discount);
      const total = Math.max(subtotal - discount + shippingFee, 0);

      // Reserve stock atomically
      for (const item of orderItems) {
        await tx
          .update(productVariants)
          .set({ stock: sql`${productVariants.stock} - ${item.quantity}` })
          .where(eq(productVariants.id, item.variantId));
      }

      if (appliedCoupon) {
        await tx
          .update(coupons)
          .set({ usedCount: sql`${coupons.usedCount} + 1` })
          .where(eq(coupons.code, appliedCoupon));
      }

      const session = await getCustomerSession();
      const orderNumber = generateOrderNumber();

      const [order] = await tx
        .insert(orders)
        .values({
          orderNumber,
          customerId: session ? Number(session.sub) : null,
          email,
          phone,
          shippingAddress: address,
          items: orderItems,
          subtotal,
          discount,
          shippingFee,
          total,
          couponCode: appliedCoupon,
          paymentMethod,
          status: paymentMethod === "cod" ? "processing" : "pending_payment",
          paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
          statusHistory: [{ status: "created", at: new Date().toISOString() }],
        })
        .returning();

      return order;
    });

    if (paymentMethod === "cod") {
      return NextResponse.json({
        orderId: result.id,
        orderNumber: result.orderNumber,
        paymentMethod: "cod",
        total: result.total,
      });
    }

    if (!isRazorpayConfigured()) {
      // Roll the order back to cancelled & restore stock since payment can't proceed.
      await restoreOrderStock(result.id);
      return NextResponse.json(
        {
          error:
            "Online payments are not configured yet. Please add real Razorpay API keys, or choose Cash on Delivery.",
        },
        { status: 503 },
      );
    }

    const razorpay = getRazorpayClient();
    const rpOrder = await razorpay.orders.create({
      amount: result.total,
      currency: "INR",
      receipt: result.orderNumber,
      notes: { orderId: String(result.id) },
    });

    await db
      .update(orders)
      .set({ razorpayOrderId: rpOrder.id, updatedAt: new Date() })
      .where(eq(orders.id, result.id));

    return NextResponse.json({
      orderId: result.id,
      orderNumber: result.orderNumber,
      paymentMethod: "razorpay",
      razorpayOrderId: rpOrder.id,
      amount: result.total,
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to place order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

async function restoreOrderStock(orderId: number) {
  await db.transaction(async (tx) => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).for("update");
    if (!order || order.stockRestored) return;
    for (const item of order.items) {
      await tx
        .update(productVariants)
        .set({ stock: sql`${productVariants.stock} + ${item.quantity}` })
        .where(eq(productVariants.id, item.variantId));
    }
    await tx
      .update(orders)
      .set({
        status: "cancelled",
        paymentStatus: "failed",
        stockRestored: true,
        statusHistory: sql`${orders.statusHistory} || ${JSON.stringify([
          { status: "cancelled", at: new Date().toISOString(), note: "Payment gateway unavailable" },
        ])}::jsonb`,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));
  });
}
