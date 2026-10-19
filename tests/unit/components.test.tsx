import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

describe("Base UI Components", () => {
  it("renders Button with minimum 44px touch target on md size", () => {
    render(<Button size="md">Test Button</Button>);
    const btn = screen.getByRole("button", { name: /Test Button/i });
    expect(btn.className).toContain("min-h-[44px]");
  });

  it("renders StatusBadge with accessible semantic status text", () => {
    render(<StatusBadge status="preparing" />);
    expect(screen.getByText("In Kitchen")).toBeDefined();
  });

  it("renders custom label on StatusBadge when provided", () => {
    render(<StatusBadge status="placed" label="Custom Placed Label" />);
    expect(screen.getByText("Custom Placed Label")).toBeDefined();
  });

  it("renders BillModal without FSSAI, GST, CGST, or SGST", async () => {
    const { BillModal } = await import("@/components/billing/bill-modal");
    const mockOrder = {
      id: "ord-test-99",
      orderNumber: "9999",
      clerkUserId: "user_test",
      orderType: "dine_in" as const,
      status: "placed" as const,
      paymentStatus: "unpaid" as const,
      subtotalMinor: 25000,
      taxMinor: 0,
      deliveryFeeMinor: 0,
      discountMinor: 0,
      totalMinor: 25000,
      placedAt: new Date().toISOString(),
      items: [
        {
          nameSnapshot: "Paneer Tikka Burger",
          unitPriceMinor: 25000,
          quantity: 1,
          lineTotalMinor: 25000,
        },
      ],
    };

    const { container } = render(
      <BillModal order={mockOrder as any} isOpen={true} onClose={() => {}} />
    );

    expect(screen.getAllByText(/Order Bill & Receipt/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Paneer Tikka Burger")).toBeDefined();
    expect(screen.getAllByText("₹250").length).toBeGreaterThan(0);

    // Verify absence of FSSAI, GSTIN, CGST, and SGST
    const textContent = container.textContent || "";
    expect(textContent).not.toContain("FSSAI");
    expect(textContent).not.toContain("GSTIN");
    expect(textContent).not.toContain("CGST");
    expect(textContent).not.toContain("SGST");
  });
});
