export default function ContactPage() {
  return (
    <article className="max-w-md mx-auto w-full px-4 py-8 space-y-4">
      <h1 className="text-2xl font-bold font-display text-[var(--text)]">Contact Us</h1>
      <div className="p-4 bg-[var(--bg-raised)] rounded-[var(--r-card)] border border-[var(--border)] space-y-2 text-xs text-[var(--text-muted)]">
        <p className="font-semibold text-[var(--text)]">Cheezy dip cafe</p>
        <p>Main Market Road, Near City Center</p>
        <p>Phone: +91 98765 43210</p>
        <p>Email: hello@cheezydipcafe.com</p>
        <p className="pt-2 text-[10px] text-[var(--brand-primary)]">FSSAI Lic. No: Pending Owner Input</p>
      </div>
    </article>
  );
}
