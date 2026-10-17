import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-between px-4 py-8 max-w-md mx-auto w-full text-center">
      {/* Brand Hero */}
      <section className="flex flex-col items-center gap-4 pt-6">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-[var(--brand-primary)] shadow-2xl bg-black">
          <Image
            src="/brand/logo.jpeg"
            alt="Cheezy Dip Cafe"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold font-display tracking-tight text-[var(--text)]">
            Cheezy dip cafe
          </h1>
          <p className="text-xs uppercase tracking-widest text-[var(--brand-primary)] font-bold">
            Melting In Every Bite
          </p>
          <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto pt-1">
            Gourmet burgers, loaded fries, cheesy pizzas and thick shakes made fresh.
          </p>
        </div>
      </section>

      {/* Hero Visual */}
      <section className="w-full my-6">
        <div className="relative w-full aspect-video rounded-[var(--r-card)] overflow-hidden border border-[var(--border)] shadow-lg">
          <Image
            src="/brand/cheesy_dip_hero.jpg"
            alt="Cheezy Dip Special"
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* Primary Actions (View Menu and Order visible without scrolling) */}
      <section className="w-full flex flex-col gap-3 pb-6">
        <Link href="/order" className="w-full">
          <Button variant="primary" size="lg" className="w-full text-base font-bold shadow-md">
            Order Now
          </Button>
        </Link>
        <Link href="/menu" className="w-full">
          <Button variant="secondary" size="lg" className="w-full text-base font-semibold">
            View Menu
          </Button>
        </Link>
      </section>
    </main>
  );
}
