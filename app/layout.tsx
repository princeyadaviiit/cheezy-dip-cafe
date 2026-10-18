import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { CartProvider } from "@/lib/cart/cart-context";
import { ThemeProvider } from "@/components/theme/theme-provider";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "700", "800"],
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FDFBF7",
};

export const metadata: Metadata = {
  title: "Cheezy dip cafe | Melting In Every Bite",
  description: "Mobile-first cafe ordering for dine-in and delivery. Melting cheese burgers, crispy loaded fries, authentic momos, pizzas, and shakes.",
};

const clerkPublishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  "pk_test_Y2hlZXp5LWRpcC1jYWZlLmNsZXJrLmFjY291bnRzLmRldiQ";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${bricolage.variable} ${figtree.variable}`}
      >
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                try {
                  var t = localStorage.getItem('cheezy_dip_theme');
                  if (t === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              `,
            }}
          />
        </head>
        <body className="antialiased min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-150">
          <ThemeProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
