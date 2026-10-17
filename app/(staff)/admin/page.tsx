export default function AdminPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-4 max-w-lg mx-auto w-full">
      <header className="flex justify-between items-center pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="text-xl font-extrabold font-display text-[var(--brand-primary)]">Admin Dashboard</h1>
          <p className="text-xs text-[var(--text-muted)]">Live orders, menu toggles & settings</p>
        </div>
      </header>
      <div className="py-12 text-center text-xs text-[var(--text-muted)]">
        Admin dashboard overview loading...
      </div>
    </div>
  );
}
