export default function CartPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold font-display text-[var(--text)]">Your Cart</h1>
      <div className="p-6 bg-[var(--bg-raised)] rounded-[var(--r-card)] border border-[var(--border)] text-center text-xs text-[var(--text-muted)]">
        Your cart is empty. Add delicious items from the menu!
      </div>
    </div>
  );
}
