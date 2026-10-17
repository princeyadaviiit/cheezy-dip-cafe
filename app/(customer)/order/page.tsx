export default function CustomerOrderPage() {
  return (
    <div className="space-y-4">
      <div className="p-3 bg-[var(--bg-raised)] rounded-[var(--r-card)] border border-[var(--border)]">
        <h1 className="text-base font-bold font-display text-[var(--text)]">Select Your Items</h1>
        <p className="text-xs text-[var(--text-muted)]">Order with live availability</p>
      </div>
      <div className="text-center py-12 text-xs text-[var(--text-muted)]">
        Interactive menu with cart controls will load here.
      </div>
    </div>
  );
}
