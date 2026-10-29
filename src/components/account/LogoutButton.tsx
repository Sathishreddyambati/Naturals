"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
      className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white/80 hover:border-lime hover:text-lime"
    >
      Sign Out
    </button>
  );
}
