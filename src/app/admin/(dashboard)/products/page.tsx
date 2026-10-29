import { db } from "@/db";
import { products, productVariants } from "@/db/schema";
import Link from "next/link";
import Image from "next/image";
import { formatPaise } from "@/lib/money";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const rows = await db.select().from(products).orderBy(products.sortOrder);
  const variantRows = await db.select().from(productVariants);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">Products</h1>
          <p className="mt-1 text-sm text-white/50">Manage your catalog, pack sizes and stock.</p>
        </div>
        <Link href="/admin/products/new" className="rounded-full bg-lime px-5 py-2.5 text-sm font-bold text-midnight">
          + Add Product
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-white/50">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Pack Sizes</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((p) => {
              const variants = variantRows.filter((v) => v.productId === p.id);
              const stock = variants.reduce((s, v) => s + v.stock, 0);
              return (
                <tr key={p.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-white/5">
                        {p.images[0] && <Image src={p.images[0]} alt={p.name} fill className="object-cover" />}
                      </div>
                      <span className="font-medium text-white">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/60">{p.category}</td>
                  <td className="px-4 py-3 text-white/60">{variants.map((v) => v.packSize).join(", ")}</td>
                  <td className="px-4 py-3">
                    <span className={stock === 0 ? "text-red-400" : stock <= 15 ? "text-lime" : "text-white/70"}>{stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${p.isActive ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}>
                      {p.isActive ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/products/${p.id}/edit`} className="text-xs font-semibold text-cobalt-soft hover:underline">
                        Edit
                      </Link>
                      <DeleteProductButton id={p.id} name={p.name} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
