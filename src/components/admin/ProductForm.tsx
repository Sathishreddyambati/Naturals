"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type VariantForm = {
  id?: number;
  packSize: string;
  sku: string;
  price: string; // rupees as string for input
  compareAtPrice: string;
  stock: string;
  isActive: boolean;
};

type ProductFormData = {
  id?: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  images: string[];
  ingredients: string;
  usage: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  variants: VariantForm[];
};

export default function ProductForm({ initial }: { initial?: ProductFormData }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ProductFormData>(
    initial ?? {
      slug: "",
      name: "",
      tagline: "",
      description: "",
      category: "powders",
      images: [],
      ingredients: "",
      usage: "",
      isActive: true,
      isFeatured: false,
      sortOrder: 0,
      variants: [{ packSize: "", sku: "", price: "", compareAtPrice: "", stock: "0", isActive: true }],
    },
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateVariant(index: number, patch: Partial<VariantForm>) {
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v, i) => (i === index ? { ...v, ...patch } : v)),
    }));
  }

  function addVariant() {
    setForm((f) => ({
      ...f,
      variants: [...f.variants, { packSize: "", sku: "", price: "", compareAtPrice: "", stock: "0", isActive: true }],
    }));
  }

  function removeVariant(index: number) {
    setForm((f) => ({ ...f, variants: f.variants.filter((_, i) => i !== index) }));
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: data });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "Upload failed");
      setForm((f) => ({ ...f, images: [...f.images, result.url] }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImage(idx: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      slug: form.slug.trim().toLowerCase().replace(/\s+/g, "-"),
      name: form.name,
      tagline: form.tagline,
      description: form.description,
      category: form.category,
      images: form.images,
      ingredients: form.ingredients,
      usage: form.usage,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      sortOrder: Number(form.sortOrder) || 0,
      variants: form.variants.map((v) => ({
        id: v.id,
        packSize: v.packSize,
        sku: v.sku,
        price: Math.round(Number(v.price) * 100),
        compareAtPrice: v.compareAtPrice ? Math.round(Number(v.compareAtPrice) * 100) : null,
        stock: Number(v.stock) || 0,
        isActive: v.isActive,
      })),
    };

    try {
      const url = form.id ? `/api/admin/products/${form.id}` : "/api/admin/products";
      const method = form.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save product");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="font-display text-lg font-semibold text-white">Basic Information</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Slug (URL)">
            <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Tagline">
            <input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Category">
            <input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls} />
          </Field>
        </div>
        <Field label="Description" className="mt-4">
          <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} />
        </Field>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Ingredients">
            <input value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Usage">
            <input value={form.usage} onChange={(e) => setForm({ ...form, usage: e.target.value })} className={inputCls} />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-lime" />
            Active (visible on storefront)
          </label>
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="accent-lime" />
            Featured on homepage
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="font-display text-lg font-semibold text-white">Images</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {form.images.map((img, i) => (
            <div key={i} className="relative h-24 w-24 overflow-hidden rounded-xl border border-white/10">
              <Image src={img} alt="" fill className="object-cover" />
              <button type="button" onClick={() => removeImage(i)} className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white">
                ✕
              </button>
            </div>
          ))}
          <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 text-xs text-white/50 hover:border-lime/50">
            {uploading ? "Uploading..." : "+ Upload"}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </label>
        </div>
        <p className="mt-2 text-xs text-white/40">JPG/PNG, up to 2MB. First image is used as the primary thumbnail.</p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-white">Pack Sizes & Pricing</h2>
          <button type="button" onClick={addVariant} className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-semibold text-white/80 hover:border-lime hover:text-lime">
            + Add Pack Size
          </button>
        </div>
        <div className="mt-4 flex flex-col gap-4">
          {form.variants.map((v, i) => (
            <div key={i} className="grid grid-cols-2 gap-3 rounded-xl border border-white/10 p-4 sm:grid-cols-6">
              <Field label="Pack Size">
                <input required value={v.packSize} onChange={(e) => updateVariant(i, { packSize: e.target.value })} className={inputCls} placeholder="100g" />
              </Field>
              <Field label="SKU">
                <input required value={v.sku} onChange={(e) => updateVariant(i, { sku: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Price (₹)">
                <input required type="number" min="0" step="0.01" value={v.price} onChange={(e) => updateVariant(i, { price: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Compare At (₹)">
                <input type="number" min="0" step="0.01" value={v.compareAtPrice} onChange={(e) => updateVariant(i, { compareAtPrice: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Stock">
                <input required type="number" min="0" value={v.stock} onChange={(e) => updateVariant(i, { stock: e.target.value })} className={inputCls} />
              </Field>
              <div className="flex items-end justify-between gap-2">
                <label className="flex items-center gap-1.5 text-xs text-white/60">
                  <input type="checkbox" checked={v.isActive} onChange={(e) => updateVariant(i, { isActive: e.target.checked })} className="accent-lime" />
                  Active
                </label>
                {form.variants.length > 1 && (
                  <button type="button" onClick={() => removeVariant(i)} className="text-xs font-semibold text-red-400 hover:underline">
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="rounded-full bg-lime px-6 py-3 text-sm font-bold uppercase tracking-wide text-midnight disabled:opacity-60">
          {saving ? "Saving..." : form.id ? "Save Changes" : "Create Product"}
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-lime/60";

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1 text-xs font-medium text-white/60 ${className}`}>
      {label}
      {children}
    </label>
  );
}
