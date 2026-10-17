export default function CustomerAccountPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold font-display text-[var(--text)]">Your Account</h1>
      <div className="p-6 bg-[var(--bg-raised)] rounded-[var(--r-card)] border border-[var(--border)] text-center text-xs text-[var(--text-muted)]">
        Customer profile, phone number, and saved delivery addresses will appear here.
      </div>
    </div>
  );
}
