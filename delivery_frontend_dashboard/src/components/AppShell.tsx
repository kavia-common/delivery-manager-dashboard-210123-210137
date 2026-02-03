"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useMemo } from "react";

type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
};

const navItems: NavItem[] = [
  { href: "/", label: "Deliveries", shortLabel: "Deliveries" },
  { href: "/earnings", label: "Earnings", shortLabel: "Earnings" },
  { href: "/notifications", label: "Notifications", shortLabel: "Alerts" },
  { href: "/support", label: "Support", shortLabel: "Support" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const activeLabel = useMemo(() => {
    const item = navItems.find((n) => isActive(pathname, n.href));
    return item?.label ?? "Dashboard";
  }, [pathname]);

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-30">
        <div className="retro-grid border-b-3 border-[color:var(--ink)] bg-[color:var(--bg)]/90 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="retro-card px-3 py-2 flex items-center gap-2">
                <span className="font-extrabold tracking-tight">DELIVERY</span>
                <span className="retro-chip status-upcoming">v1</span>
              </div>
              <div className="hidden sm:block text-sm text-[color:var(--muted)]">
                <span className="font-bold text-[color:var(--text)]">{activeLabel}</span> • optimized for mobile & desktop
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`retro-btn text-sm ${active ? "bg-[color:var(--primary)] text-white" : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-4 py-6 pb-24 md:pb-6">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden md:block">
            <nav className="retro-card p-4" aria-label="Primary navigation">
              <h2 className="text-sm font-extrabold tracking-wide text-[color:var(--muted)] mb-3">NAV</h2>
              <ul className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`retro-btn w-full block ${active ? "bg-[color:var(--primary)] text-white" : ""}`}
                        aria-current={active ? "page" : undefined}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4 retro-card p-3">
                <div className="text-xs font-extrabold text-[color:var(--muted)]">QUICK TIP</div>
                <div className="text-sm mt-1">
                  Use <span className="retro-kbd">Map</span> on a delivery to open Google Maps directions.
                </div>
              </div>
            </nav>
          </aside>

          <main className="min-w-0">{children}</main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t-3 border-[color:var(--ink)] bg-[color:var(--bg)]"
        aria-label="Bottom navigation"
      >
        <ul className="mx-auto max-w-6xl px-2 py-2 grid grid-cols-4 gap-2">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`retro-btn w-full text-center text-xs px-2 py-3 ${
                    active ? "bg-[color:var(--primary)] text-white" : ""
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.shortLabel}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
