import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-white/70 sm:px-8">
      <h1 className="font-display text-4xl font-semibold text-white">Terms of Service</h1>
      <p className="mt-3 text-sm text-white/40">Last updated: {new Date().getFullYear()}</p>

      <div className="mt-8 flex flex-col gap-6 leading-relaxed text-sm">
        <Section title="Acceptance of Terms">
          By accessing or using the Indira Naturals website, you agree to be bound by these Terms
          of Service and our Privacy Policy.
        </Section>
        <Section title="Orders & Pricing">
          All prices are listed in Indian Rupees (INR) and are subject to change without notice.
          We reserve the right to refuse or cancel any order, including in cases of pricing
          errors, suspected fraud, or stock unavailability discovered after an order is placed.
        </Section>
        <Section title="Payments">
          Online payments are processed via Razorpay. Orders are confirmed only after successful
          payment verification. Cash on Delivery, where offered, is settled at the time of
          delivery.
        </Section>
        <Section title="Shipping">
          Please refer to our Shipping & Returns page for delivery timelines and charges.
        </Section>
        <Section title="Returns & Refunds">
          Returns and refunds are handled as described in our Shipping & Returns policy. Approved
          refunds are issued to the original payment method.
        </Section>
        <Section title="Limitation of Liability">
          Indira Naturals is not liable for indirect, incidental or consequential damages arising
          from the use of our products or website, to the extent permitted by law.
        </Section>
        <Section title="Governing Law">
          These terms are governed by the laws of India.
        </Section>
        <Section title="Contact">
          Questions about these terms can be sent to {process.env.NEXT_PUBLIC_SUPPORT_EMAIL}.
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
