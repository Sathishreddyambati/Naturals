import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import type { ReactNode } from "react";

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-midnight">
      <AdminSidebar adminName={session.name} adminEmail={session.email} />
      <main className="flex-1 overflow-x-hidden px-5 py-8 sm:px-10">{children}</main>
    </div>
  );
}
