"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function StaffRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--bg)] text-center space-y-3">
      <div className="w-8 h-8 border-3 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin" />
      <p className="text-xs text-[var(--text-muted)] font-medium">
        Redirecting to Unified Admin & Kitchen Operations Portal...
      </p>
      <Link href="/admin">
        <Button variant="outline" size="sm">
          Go to Admin Portal
        </Button>
      </Link>
    </div>
  );
}
