"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/products", label: "Products", icon: "🧪" },
  { href: "/admin/orders", label: "Orders", icon: "📦" },
  { href: "/admin/coupons", label: "Coupons", icon: "🏷️" },
  { href: "/admin/reviews", label: "Reviews", icon: "⭐" },
  { href: "/admin/customers", label: "Customers", icon: "👥" },
  { href: "/admin/messages", label: "Messages", icon: "✉️" },
  { href: "/admin/settings", label: "Homepage", icon: "🎛️" },
];

export default function AdminSidebar({ adminName, adminEmail }: { adminName: string; adminEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const content = (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-2.5 border-b border-white/10 px-6 py-5">
        <Image src="/images/logo.png" alt="Indira Naturals" width={30} height={30} />
        <span className="font-display text-sm font-semibold text-white">Indira Admin</span>
      </Link>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-lime/10 text-lime" : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 px-5 py-4">
        <p className="truncate text-xs text-white/50">{adminName}</p>
        <p className="truncate text-[11px] text-white/30">{adminEmail}</p>
        <button
          onClick={async () => {
            await fetch("/api/admin/auth/logout", { method: "POST" });
            router.push("/admin/login");
            router.refresh();
          }}
          className="mt-3 w-full rounded-full border border-white/15 py-2 text-xs font-semibold text-white/70 hover:border-lime hover:text-lime"
        >
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-midnight-soft lg:block">
        {content}
      </aside>
      <div className="fixed left-0 top-0 z-50 flex items-center gap-2 p-3 lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="rounded-full border border-white/15 bg-midnight-soft p-2.5 text-white"
          aria-label="Open menu"
        >
          ☰
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="w-72 bg-midnight-soft">{content}</div>
          <div className="flex-1 bg-black/60" onClick={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
