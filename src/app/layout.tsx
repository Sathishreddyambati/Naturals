import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import { getHomepageSettings } from "@/lib/data/settings";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Indira Naturals";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: `${siteName} — Nature, Refined. Goodness, Unlocked.`,
    template: `%s | ${siteName}`,
  },
  description:
    "Indira Naturals crafts single-ingredient garlic, ginger, onion, tomato and more natural powders — dried and milled to lock in real flavour.",
  keywords: ["Indira Naturals", "garlic powder", "ginger powder", "onion powder", "tomato powder", "natural spice powder"],
  openGraph: {
    title: `${siteName} — Nature, Refined. Goodness, Unlocked.`,
    description: "Single-ingredient natural powders, cinematically crafted.",
    images: ["/images/hero-composition.png"],
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const settings = await getHomepageSettings();
  return (
    <html lang="en">
      <body className="bg-midnight text-[#f4f5f1] antialiased font-body selection:bg-lime">
        <AnnouncementBar text={settings.announcementBar} />
        <Navbar />
        <CartDrawer />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
