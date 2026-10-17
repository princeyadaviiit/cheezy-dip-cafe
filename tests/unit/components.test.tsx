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
});
