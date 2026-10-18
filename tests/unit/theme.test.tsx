import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { ThemeProvider, useTheme } from "@/components/theme/theme-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";

function ThemeConsumer() {
  const { theme } = useTheme();
  return <div data-testid="current-theme">{theme}</div>;
}

describe("Theme System (Light Mode by Default + Switcher)", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("defaults to light theme when no storage preference exists", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
        <ThemeToggle />
      </ThemeProvider>
    );

    expect(screen.getByTestId("current-theme").textContent).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("renders ThemeToggle with accessible min 44px touch target", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const toggleBtn = screen.getByRole("button", { name: /switch to dark theme/i });
    expect(toggleBtn).toBeDefined();
    expect(toggleBtn.className).toContain("min-h-[44px]");
    expect(toggleBtn.className).toContain("min-w-[44px]");
  });

  it("toggles to dark theme on click and updates html class and storage", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
        <ThemeToggle />
      </ThemeProvider>
    );

    const toggleBtn = screen.getByRole("button", { name: /switch to dark theme/i });
    fireEvent.click(toggleBtn);

    expect(screen.getByTestId("current-theme").textContent).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("cheezy_dip_theme")).toBe("dark");

    // Toggle back to light
    const switchBackBtn = screen.getByRole("button", { name: /switch to light theme/i });
    fireEvent.click(switchBackBtn);

    expect(screen.getByTestId("current-theme").textContent).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("cheezy_dip_theme")).toBe("light");
  });
});
