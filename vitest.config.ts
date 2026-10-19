import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/unit/**/*.{test,spec}.{ts,tsx}"],
    testTimeout: 20000,
    hookTimeout: 20000,
    pool: "threads",
    isolate: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./"),
      "server-only": path.resolve(process.cwd(), "./tests/mocks/empty.ts"),
    },
  },
});
