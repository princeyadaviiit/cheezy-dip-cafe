import * as React from "react";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center max-w-md mx-auto w-full px-4 py-8">
      <div className="mb-4 text-center">
        <h1 className="text-xl font-extrabold font-display text-[var(--text)] tracking-tight">
          Cheezy dip <span className="text-[var(--brand-primary)]">cafe</span>
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Sign in to place orders, track live food status, and view past orders.
        </p>
      </div>
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/order"
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "bg-[var(--bg-raised)] border border-[var(--border)] shadow-[var(--shadow-float)] rounded-[var(--r-card)] text-[var(--text)]",
            headerTitle: "font-display font-extrabold text-[var(--text)]",
            headerSubtitle: "text-[var(--text-muted)] text-xs",
            formButtonPrimary:
              "bg-[var(--brand-primary)] hover:opacity-90 text-white font-bold text-xs py-2.5 rounded-[var(--r-button)] min-h-[44px]",
            formFieldInput:
              "rounded-[var(--r-input)] bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] min-h-[44px]",
            footerActionLink: "text-[var(--brand-primary)] hover:underline font-semibold",
          },
        }}
      />
    </div>
  );
}
