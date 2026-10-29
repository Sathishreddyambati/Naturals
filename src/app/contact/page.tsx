"use client";

import { useState } from "react";
import Reveal from "@/components/ui/Reveal";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "General Inquiry", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setStatus("done");
      setForm({ name: "", email: "", subject: "General Inquiry", message: "" });
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:px-8">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cobalt-soft">Get in Touch</p>
        <h1 className="font-display mt-3 text-4xl font-semibold text-white">Contact Us</h1>
        <p className="mt-3 max-w-xl text-white/60">
          Questions about an order, a product, or a partnership? We usually respond within one
          business day.
        </p>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_1fr]">
        {status === "done" ? (
          <div className="rounded-2xl border border-lime/30 bg-lime/5 p-8 text-lime">
            Thanks for reaching out! We&apos;ll get back to you shortly.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                required
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-lime/60"
              />
              <input
                required
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-lime/60"
              />
            </div>
            <select
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="rounded-xl border border-white/15 bg-midnight-soft px-4 py-3 text-sm text-white outline-none focus:border-lime/60"
            >
              <option>General Inquiry</option>
              <option>Order Support</option>
              <option>Wholesale / Bulk Orders</option>
              <option>Feedback</option>
            </select>
            <textarea
              required
              rows={5}
              placeholder="Your message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-lime/60"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={status === "loading"}
              className="self-start rounded-full bg-lime px-6 py-3 text-sm font-bold uppercase tracking-wide text-midnight disabled:opacity-60"
            >
              {status === "loading" ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}

        <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 h-fit">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">Email</h3>
            <p className="mt-1 text-white">{process.env.NEXT_PUBLIC_SUPPORT_EMAIL}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">Phone</h3>
            <p className="mt-1 text-white">{process.env.NEXT_PUBLIC_SUPPORT_PHONE}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">Hours</h3>
            <p className="mt-1 text-white">Mon–Sat, 10am–6pm IST</p>
          </div>
        </div>
      </div>
    </div>
  );
}
