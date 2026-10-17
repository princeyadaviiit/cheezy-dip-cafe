import { describe, it, expect } from "vitest";
import { formatPrice, cn } from "@/lib/utils";

describe("Utils Library", () => {
  it("formats integer paise to Indian Rupee string", () => {
    // 10900 paise = ₹109
    const formatted = formatPrice(10900);
    expect(formatted).toContain("109");
    expect(formatted).toMatch(/₹|Rs/);
  });

  it("handles 0 paise correctly", () => {
    const formatted = formatPrice(0);
    expect(formatted).toContain("0");
  });

  it("merges tailwind classes cleanly", () => {
    const result = cn("p-4 text-sm", "text-base", false && "hidden");
    expect(result).toBe("p-4 text-base");
  });
});
