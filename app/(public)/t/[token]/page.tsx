interface TableEntryPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function TableEntryPage({ params }: TableEntryPageProps) {
  const { token } = await params;

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full px-4 text-center">
      <div className="p-6 bg-[var(--bg-raised)] rounded-[var(--r-card)] border border-[var(--border)] space-y-3">
        <h1 className="text-xl font-bold font-display text-[var(--brand-primary)]">
          Table Detected
        </h1>
        <p className="text-xs text-[var(--text-muted)]">
          Resolving table session for token: <code className="text-white">{token}</code>
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          Setting signed table context cookie and redirecting to menu...
        </p>
      </div>
    </div>
  );
}
