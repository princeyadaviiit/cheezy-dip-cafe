import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PublicMenuPage() {
  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 py-6">
      <header className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="text-xl font-bold font-display text-[var(--text)]">Cafe Menu</h1>
          <p className="text-xs text-[var(--text-muted)]">Public View with Live Prices</p>
        </div>
        <Link href="/order">
          <Button size="sm" variant="primary">
            Start Order
          </Button>
        </Link>
      </header>
      <div className="py-8 text-center text-sm text-[var(--text-muted)]">
        Menu items loading...
      </div>
    </div>
  );
}
