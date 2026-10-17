import * as React from "react";
import { CustomerHeader } from "@/components/customer/customer-header";

export default function CustomerOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      {/* Customer Top Bar with Cart Count Badge */}
      <CustomerHeader />

      {/* Main Customer Body */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-4">{children}</main>
    </div>
  );
}
