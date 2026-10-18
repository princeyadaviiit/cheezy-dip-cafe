"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";

export function PhoneSignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/order";

  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [otp, setOtp] = React.useState(["", "", "", "", "", ""]);
  const [step, setStep] = React.useState<"phone" | "otp">("phone");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [resendTimer, setResendTimer] = React.useState(30);
  const canResend = resendTimer === 0;

  // Timer countdown
  React.useEffect(() => {
    if (step !== "otp" || resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const cleaned = phoneNumber.replace(/\D/g, "");
    if (cleaned.length < 10) {
      setErrorMessage("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setIsLoading(true);
    // Simulate/Trigger Clerk phone verification
    setTimeout(() => {
      setIsLoading(false);
      setStep("otp");
      setResendTimer(30);
    }, 700);
  };

  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setErrorMessage("Please enter all 6 digits of the OTP code.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    setTimeout(() => {
      setIsLoading(false);
      // Success redirection preserving context
      router.push(redirectUrl);
    }, 800);
  };

  const handleResend = () => {
    if (!canResend) return;
    setResendTimer(30);
    setOtp(["", "", "", "", "", ""]);
    setErrorMessage("");
  };

  return (
    <div className="w-full max-w-sm mx-auto p-5 bg-[var(--bg-raised)] rounded-[var(--r-card)] border border-[var(--border)] shadow-[var(--shadow-float)]">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center gap-2 mb-6">
        <div className="relative w-16 h-16 rounded-full overflow-hidden border border-[var(--brand-primary)] bg-[var(--bg)] shadow">
          <Image
            src="/brand/logo.jpeg"
            alt="Cheezy Dip Cafe"
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h2 className="text-xl font-extrabold font-display text-[var(--text)]">
            {step === "phone" ? "Enter Your Mobile" : "Verify OTP Code"}
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {step === "phone"
              ? "We use phone login to track your dine-in & delivery orders."
              : `6-digit code sent to +91 ${phoneNumber}`}
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 p-2.5 rounded-[var(--r-input)] bg-[var(--status-problem)]/10 border border-[var(--status-problem)]/30 text-xs text-[var(--status-problem)] text-center font-medium">
          {errorMessage}
        </div>
      )}

      {step === "phone" ? (
        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Mobile Number
            </label>
            <div className="flex items-center gap-2">
              <span className="min-h-[44px] px-3 flex items-center justify-center bg-[var(--bg)] border border-[var(--border)] rounded-[var(--r-input)] text-sm font-semibold text-[var(--text-muted)] select-none">
                🇮🇳 +91
              </span>
              <Input
                type="tel"
                inputMode="tel"
                placeholder="98765 43210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                autoFocus
                required
              />
            </div>
            <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Standard SMS rates apply • India numbers only
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full font-bold shadow-md cursor-pointer"
            isLoading={isLoading}
          >
            Send OTP
          </Button>
        </form>
      ) : (
        <form onSubmit={handleOtpSubmit} className="space-y-5">
          {/* OTP Digit Boxes */}
          <div className="flex justify-between gap-1.5">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-input-${idx}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-11 h-12 text-center text-lg font-bold font-mono bg-[var(--bg)] border border-[var(--border)] rounded-[var(--r-input)] text-[var(--text)] focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] focus:outline-none transition-colors"
                autoFocus={idx === 0}
              />
            ))}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full font-bold shadow-md cursor-pointer"
            isLoading={isLoading}
          >
            Verify & Continue
          </Button>

          {/* Resend and Edit controls */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setErrorMessage("");
              }}
              className="text-[var(--text-muted)] hover:text-[var(--text)] flex items-center gap-1 p-1 min-h-[36px] cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Edit Number
            </button>

            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                className="text-[var(--brand-primary)] font-semibold hover:underline flex items-center gap-1 p-1 min-h-[36px] cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Resend OTP
              </button>
            ) : (
              <span className="text-[var(--text-muted)]">
                Resend in {resendTimer}s
              </span>
            )}
          </div>
        </form>
      )}

      {/* Trust Notice */}
      <div className="mt-6 pt-3 border-t border-[var(--border)] text-center">
        <p className="text-[11px] text-[var(--text-muted)]">
          Protected by Cheezy Dip Secure Identity. Your table and cart will be preserved.
        </p>
      </div>
    </div>
  );
}
