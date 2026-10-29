"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPaise } from "@/lib/money";

type Coupon = {
  id: number;
  code: string;
  type: string;
  value: number;
  minOrderValue: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
};

export default function CouponManager({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "flat">("percent");
  const [value, setValue] = useState("10");
  const [minOrderValue, setMinOrderValue] = useState("0");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function createCoupon(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          type,
          value: type === "percent" ? Number(value) : Math.round(Number(value) * 100),
          minOrderValue: Math.round(Number(minOrderValue) * 100),
          maxDiscount: maxDiscount ? Math.round(Number(maxDiscount) * 100) : null,
          usageLimit: usageLimit ? Number(usageLimit) : null,
          expiresAt: expiresAt || null,
          isActive: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create coupon");
      setShowForm(false);
      setCode("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create coupon");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(id: number, isActive: boolean) {
    await fetch(`/api/admin/coupons/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    router.refresh();
  }

  async function deleteCoupon(id: number) {
    if (!confirm("Delete this coupon?")) return;
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-white">Coupons</h1>
        <button onClick={() => setShowForm((v) => !v)} className="rounded-full bg-lime px-5 py-2.5 text-sm font-bold text-midnight">
          {showForm ? "Cancel" : "+ New Coupon"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createCoupon} className="mt-6 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:grid-cols-3">
          <Field label="Code">
            <input required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className={inputCls} />
          </Field>
          <Field label="Type">
            <select value={type} onChange={(e) => setType(e.target.value as "percent" | "flat")} className={inputCls}>
              <option value="percent">Percent (%)</option>
              <option value="flat">Flat (₹)</option>
            </select>
          </Field>
          <Field label={type === "percent" ? "Value (%)" : "Value (₹)"}>
            <input required type="number" min="1" value={value} onChange={(e) => setValue(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Min Order Value (₹)">
            <input type="number" min="0" value={minOrderValue} onChange={(e) => setMinOrderValue(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Max Discount (₹, optional)">
            <input type="number" min="0" value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Usage Limit (optional)">
            <input type="number" min="1" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Expires At (optional)">
            <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className={inputCls} />
          </Field>
          {error && <p className="col-span-full text-xs text-red-400">{error}</p>}
          <div className="col-span-full">
            <button type="submit" disabled={saving} className="rounded-full bg-lime px-6 py-2.5 text-sm font-bold uppercase text-midnight disabled:opacity-60">
              {saving ? "Saving..." : "Create Coupon"}
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-white/50">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Min Order</th>
              <th className="px-4 py-3">Usage</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {initialCoupons.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-semibold text-white">{c.code}</td>
                <td className="px-4 py-3 text-white/70">{c.type === "percent" ? `${c.value}%` : formatPaise(c.value)}</td>
                <td className="px-4 py-3 text-white/70">{formatPaise(c.minOrderValue)}</td>
                <td className="px-4 py-3 text-white/70">
                  {c.usedCount}
                  {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c.isActive ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-white/50"}`}>
                    {c.isActive ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button onClick={() => toggleActive(c.id, c.isActive)} className="text-xs font-semibold text-cobalt-soft hover:underline">
                      {c.isActive ? "Disable" : "Enable"}
                    </button>
                    <button onClick={() => deleteCoupon(c.id)} className="text-xs font-semibold text-red-400 hover:underline">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime/60";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-white/60">
      {label}
      {children}
    </label>
  );
}
