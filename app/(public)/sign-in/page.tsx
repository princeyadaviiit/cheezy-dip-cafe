import * as React from "react";
import { PhoneSignIn } from "@/components/auth/phone-sign-in";
import { Skeleton } from "@/components/ui/skeleton";

export default function SignInPage() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center max-w-md mx-auto w-full px-4 py-8">
      <React.Suspense
        fallback={
          <div className="w-full max-w-sm p-6 bg-[var(--bg-raised)] rounded-[var(--r-card)] border border-[var(--border)] space-y-4">
            <Skeleton className="w-16 h-16 rounded-full mx-auto" />
            <Skeleton className="w-3/4 h-6 mx-auto" />
            <Skeleton className="w-full h-11" />
            <Skeleton className="w-full h-11" />
          </div>
        }
      >
        <PhoneSignIn />
      </React.Suspense>
    </div>
  );
}
