"use client";

import { useRouter } from "next/navigation";
import StarRating from "@/components/product/StarRating";

type ReviewRow = {
  id: number;
  productName: string | null;
  customerName: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
};

export default function ReviewModeration({ reviews }: { reviews: ReviewRow[] }) {
  const router = useRouter();

  async function setApproved(id: number, isApproved: boolean) {
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved }),
    });
    router.refresh();
  }

  async function remove(id: number) {
    if (!confirm("Delete this review?")) return;
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-white">Reviews</h1>
      <p className="mt-1 text-sm text-white/50">Approve genuine reviews before they appear publicly.</p>

      <div className="mt-8 flex flex-col gap-4">
        {reviews.length === 0 && <p className="text-white/40">No reviews submitted yet.</p>}
        {reviews.map((r) => (
          <div key={r.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium text-white">
                  {r.customerName} <span className="text-white/40">on</span> {r.productName}
                </p>
                <StarRating rating={r.rating} />
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${r.isApproved ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>
                {r.isApproved ? "Approved" : "Pending"}
              </span>
            </div>
            <p className="mt-3 text-sm text-white/70">{r.comment}</p>
            <div className="mt-4 flex gap-3">
              {!r.isApproved && (
                <button onClick={() => setApproved(r.id, true)} className="rounded-full bg-lime px-4 py-1.5 text-xs font-bold text-midnight">
                  Approve
                </button>
              )}
              {r.isApproved && (
                <button onClick={() => setApproved(r.id, false)} className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-semibold text-white/80">
                  Unpublish
                </button>
              )}
              <button onClick={() => remove(r.id)} className="rounded-full border border-red-400/40 px-4 py-1.5 text-xs font-semibold text-red-400">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
