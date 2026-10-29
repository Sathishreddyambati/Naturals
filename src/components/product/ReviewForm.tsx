"use client";

import { useState } from "react";

export default function ReviewForm({ productId }: { productId: number }) {
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, customerName: name, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setStatus("done");
      setName("");
      setComment("");
      setRating(5);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-lime/30 bg-lime/5 p-6 text-sm text-lime">
        Thank you! Your review has been submitted and will appear after moderation.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <h3 className="font-display text-lg font-semibold text-white">Write a Review</h3>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill={n <= rating ? "#D4FF24" : "none"} stroke="#D4FF24" strokeWidth="1.5">
              <path d="M12 2.5l2.9 6.1 6.6.7-4.9 4.6 1.3 6.6L12 17.6l-5.9 3 1.3-6.6-4.9-4.6 6.6-.7L12 2.5z" />
            </svg>
          </button>
        ))}
      </div>
      <input
        required
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-lime/60"
      />
      <textarea
        required
        placeholder="Share your experience..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-lime/60"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="self-start rounded-full bg-lime px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-midnight disabled:opacity-60"
      >
        {status === "loading" ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
