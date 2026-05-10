import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finance Planner",
  description: "Plan budgets, debt payoff, and wishlist purchases."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
