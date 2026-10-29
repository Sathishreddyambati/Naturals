"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  if (pathname?.startsWith("/admin")) return null;

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <footer className="border-t border-white/10 bg-midnight">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-5">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/images/logo.png" alt="Indira Naturals" width={34} height={34} />
              <span className="font-display text-lg font-semibold text-white">Indira Naturals</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/50">
              Single-ingredient natural powders — garlic, ginger, onion, tomato and more — dried
              and milled to lock in real flavour. Nothing added, nothing hidden.
            </p>
            <form onSubmit={subscribe} className="mt-6 flex max-w-sm gap-2">
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-lime/60"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="shrink-0 rounded-full bg-lime px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-midnight hover:scale-105 transition-transform disabled:opacity-60"
              >
                Join
              </button>
            </form>
            {status === "done" && <p className="mt-2 text-xs text-lime">You&apos;re on the list 🌿</p>}
            {status === "error" && <p className="mt-2 text-xs text-red-400">Something went wrong.</p>}
          </div>

          <FooterCol
            title="Shop"
            links={[
              { href: "/shop", label: "All Products" },
              { href: "/wishlist", label: "Wishlist" },
              { href: "/cart", label: "Cart" },
              { href: "/track-order", label: "Track Order" },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { href: "/our-story", label: "Our Story" },
              { href: "/recipes", label: "Recipes" },
              { href: "/contact", label: "Contact" },
            ]}
          />
          <FooterCol
            title="Policies"
            links={[
              { href: "/shipping-returns", label: "Shipping & Returns" },
              { href: "/privacy-policy", label: "Privacy Policy" },
              { href: "/terms", label: "Terms of Service" },
            ]}
          />
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Indira Naturals. All rights reserved.</p>
          <p>
            {process.env.NEXT_PUBLIC_SUPPORT_EMAIL} · {process.env.NEXT_PUBLIC_SUPPORT_PHONE}
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-white/90">{title}</h4>
      <ul className="mt-4 flex flex-col gap-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-white/50 transition-colors hover:text-lime">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
