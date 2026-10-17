import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignInPage() {
  return (
    <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full px-4 py-8">
      <div className="p-6 bg-[var(--bg-raised)] rounded-[var(--r-card)] border border-[var(--border)] shadow-md space-y-4 text-center">
        <h1 className="text-xl font-bold font-display text-[var(--text)]">
          Sign In to Order
        </h1>
        <p className="text-xs text-[var(--text-muted)]">
          Enter your 10-digit mobile number to receive a one-time login code.
        </p>
        <div className="space-y-3 pt-2 text-left">
          <Input
            label="Mobile Number"
            placeholder="+91 98765 43210"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
          />
          <Button variant="primary" size="lg" className="w-full">
            Send OTP
          </Button>
        </div>
      </div>
    </div>
  );
}
