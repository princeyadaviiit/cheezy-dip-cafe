export default function KitchenPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-4 max-w-lg mx-auto w-full">
      <header className="flex justify-between items-center pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="text-xl font-extrabold font-display text-[var(--brand-primary)]">Kitchen Display</h1>
          <p className="text-xs text-[var(--text-muted)]">Live orders & preparation queue</p>
        </div>
      </header>
      <div className="py-12 text-center text-xs text-[var(--text-muted)]">
        Waiting for incoming kitchen orders...
      </div>
    </div>
  );
}
