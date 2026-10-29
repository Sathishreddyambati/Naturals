import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { desc } from "drizzle-orm";
import MessagesList from "@/components/admin/MessagesList";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const rows = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  return <MessagesList messages={rows.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))} />;
}
