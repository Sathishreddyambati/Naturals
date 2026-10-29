import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-white/70 sm:px-8">
      <h1 className="font-display text-4xl font-semibold text-white">Privacy Policy</h1>
      <p className="mt-3 text-sm text-white/40">Last updated: {new Date().getFullYear()}</p>

      <div className="mt-8 flex flex-col gap-6 leading-relaxed">
        <Section title="Information We Collect">
          We collect the information you provide directly to us, such as your name, email
          address, phone number and shipping address when you place an order, create an account,
          subscribe to our newsletter, or contact us.
        </Section>
        <Section title="How We Use Your Information">
          We use your information to process and fulfil orders, communicate with you about your
          orders, respond to enquiries, improve our products and services, and send updates if
          you&apos;ve opted in to marketing communications.
        </Section>
        <Section title="Payment Information">
          Payments are processed securely by Razorpay. We do not store your card, UPI or banking
          credentials on our servers — all payment data is handled directly by Razorpay&apos;s
          PCI-DSS compliant infrastructure.
        </Section>
        <Section title="Data Sharing">
          We do not sell your personal information. We share data only with service providers
          that help us operate our store (such as payment processing and shipping), and only to
          the extent necessary to provide our services.
        </Section>
        <Section title="Cookies">
          We use essential cookies to keep you signed in and to remember your cart and wishlist.
        </Section>
        <Section title="Your Rights">
          You may request access to, correction of, or deletion of your personal data at any time
          by contacting us at {process.env.NEXT_PUBLIC_SUPPORT_EMAIL}.
        </Section>
        <Section title="Contact">
          For privacy-related questions, reach us at {process.env.NEXT_PUBLIC_SUPPORT_EMAIL}.
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm">{children}</p>
    </section>
  );
}
