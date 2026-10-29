"use client";

import { useRouter } from "next/navigation";

type Message = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export default function MessagesList({ messages }: { messages: Message[] }) {
  const router = useRouter();

  async function toggleRead(id: number, isRead: boolean) {
    await fetch(`/api/admin/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: !isRead }),
    });
    router.refresh();
  }

  async function remove(id: number) {
    if (!confirm("Delete this message?")) return;
    await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-white">Contact Messages</h1>
      <div className="mt-8 flex flex-col gap-4">
        {messages.length === 0 && <p className="text-white/40">No messages yet.</p>}
        {messages.map((m) => (
          <div key={m.id} className={`rounded-2xl border p-5 ${m.isRead ? "border-white/10 bg-white/[0.02]" : "border-lime/30 bg-lime/5"}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium text-white">
                  {m.name} <span className="text-white/40">· {m.email}</span>
                </p>
                <p className="text-xs text-white/50">{m.subject}</p>
              </div>
              <span className="text-xs text-white/40">{new Date(m.createdAt).toLocaleString()}</span>
            </div>
            <p className="mt-3 text-sm text-white/70">{m.message}</p>
            <div className="mt-4 flex gap-3">
              <button onClick={() => toggleRead(m.id, m.isRead)} className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-semibold text-white/80">
                Mark as {m.isRead ? "Unread" : "Read"}
              </button>
              <button onClick={() => remove(m.id)} className="rounded-full border border-red-400/40 px-4 py-1.5 text-xs font-semibold text-red-400">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
