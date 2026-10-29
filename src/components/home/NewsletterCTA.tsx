import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import MagneticButton from "@/components/ui/MagneticButton";

export default function NewsletterCTA() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24 text-center sm:px-8">
      <Reveal>
        <h2 className="font-display text-3xl font-semibold text-white sm:text-5xl text-balance">
          Ready to cook with <span className="text-gradient-lime">real</span> ingredients?
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-white/60">
          Explore the full Indira Naturals collection of single-ingredient powders, crafted for
          everyday kitchens.
        </p>
        <div className="mt-8 flex justify-center">
          <MagneticButton>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-lime px-8 py-4 text-sm font-bold uppercase tracking-wide text-midnight glow-lime transition-transform hover:scale-[1.03]"
            >
              Shop Now
            </Link>
          </MagneticButton>
        </div>
      </Reveal>
    </section>
  );
}
