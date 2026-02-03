import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Delivery Dashboard",
  description: "Retro-themed delivery personnel dashboard for managing deliveries, earnings, and support.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="retro-shell">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
