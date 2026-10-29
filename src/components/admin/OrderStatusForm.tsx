"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUSES = ["pending_payment", "processing", "shipped", "delivered", "cancelled", "failed", "refunded"];

export default function OrderStatusForm({
  orderId,
  currentStatus,
  trackingCarrier,
  trackingNumber,
}: {
  orderId: number;
  currentStatus: string;
  trackingCarrier: string | null;
  trackingNumber: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [carrier, setCarrier] = useState(trackingCarrier ?? "");
  const [number, setNumber] = useState(trackingNumber ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, trackingCarrier: carrier, trackingNumber: number }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update order");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <h2 className="font-display text-lg font-semibold text-white">Update Status</h2>
      <label className="flex flex-col gap-1.5 text-xs font-medium text-white/60">
        Order Status
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-white/15 bg-midnight-soft px-3 py-2 text-sm text-white outline-none focus:border-lime/60">
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-xs font-medium text-white/60">
        Tracking Carrier
        <input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="e.g. Delhivery" className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime/60" />
      </label>
      <label className="flex flex-col gap-1.5 text-xs font-medium text-white/60">
        Tracking Number
        <input value={number} onChange={(e) => setNumber(e.target.value)} className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime/60" />
      </label>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button onClick={handleSave} disabled={saving} className="rounded-full bg-lime py-2.5 text-xs font-bold uppercase tracking-wide text-midnight disabled:opacity-60">
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
