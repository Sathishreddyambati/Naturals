"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { HomepageSettings } from "@/lib/data/settings";

export default function HomepageSettingsForm({ initial }: { initial: HomepageSettings }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setDone(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setDone(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 max-w-2xl">
      <Field label="Hero Badge Text">
        <input value={form.heroBadge} onChange={(e) => setForm({ ...form, heroBadge: e.target.value })} className={inputCls} />
      </Field>
      <Field label="Hero Headline">
        <input value={form.heroHeadline} onChange={(e) => setForm({ ...form, heroHeadline: e.target.value })} className={inputCls} />
      </Field>
      <Field label="Hero Subheadline">
        <textarea rows={3} value={form.heroSubheadline} onChange={(e) => setForm({ ...form, heroSubheadline: e.target.value })} className={inputCls} />
      </Field>
      <Field label="Announcement Bar">
        <input value={form.announcementBar} onChange={(e) => setForm({ ...form, announcementBar: e.target.value })} className={inputCls} />
      </Field>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {done && <p className="text-xs text-lime">Saved! Changes are now live on the storefront.</p>}
      <button type="submit" disabled={saving} className="self-start rounded-full bg-lime px-6 py-2.5 text-sm font-bold uppercase text-midnight disabled:opacity-60">
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}

const inputCls = "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime/60";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-medium text-white/60">
      {label}
      {children}
    </label>
  );
}
