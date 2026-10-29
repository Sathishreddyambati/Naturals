import type { Metadata } from "next";
import { formatPaise } from "@/lib/money";
import { getFreeShippingThreshold } from "@/lib/shipping";

export const metadata: Metadata = { title: "Shipping & Returns" };

export default function ShippingReturnsPage() {
  const freeShippingThreshold = getFreeShippingThreshold();
  const flatFee = Number(process.env.SHIPPING_FEE_PAISE ?? 4900);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-white/70 sm:px-8">
      <h1 className="font-display text-4xl font-semibold text-white">Shipping & Returns</h1>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed">
        <Section title="Shipping Rates">
          We charge a flat shipping fee of {formatPaise(flatFee)} on orders across India. Orders
          above {formatPaise(freeShippingThreshold)} ship free. The exact shipping fee for your
          order is always calculated and confirmed at checkout.
        </Section>
        <Section title="Processing Time">
          Orders are processed within 1–2 business days of payment confirmation. You&apos;ll
          receive updates as your order is processed, shipped and delivered — track anytime from
          our Track Order page.
        </Section>
        <Section title="Delivery Time">
          Standard delivery typically takes 3–7 business days depending on your location, handled
          by our courier partners.
        </Section>
        <Section title="Returns">
          If a product arrives damaged, incorrect, or materially different from what was ordered,
          contact us within 48 hours of delivery with photos of the item and packaging at{" "}
          {process.env.NEXT_PUBLIC_SUPPORT_EMAIL}, and we&apos;ll arrange a replacement or refund.
        </Section>
        <Section title="Refunds">
          Approved refunds for online payments are issued to the original payment method via
          Razorpay within 5–7 business days of approval. Cash on Delivery refunds are processed
          via bank transfer.
        </Section>
        <Section title="Order Cancellations">
          Orders can be cancelled before they are shipped by contacting our support team. Once an
          order has shipped, it can no longer be cancelled but may be eligible for return as
          described above.
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2">{children}</p>
    </section>
  );
}
