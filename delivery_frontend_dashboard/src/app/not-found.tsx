import Link from "next/link";
import React from "react";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <section className="retro-card p-6" role="alert" aria-live="assertive">
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight">404 — Page Not Found</h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">The page you’re looking for doesn’t exist.</p>
        </header>

        <div className="mt-6">
          <Link className="retro-btn inline-block bg-[color:var(--primary)] text-white" href="/">
            Back to Deliveries
          </Link>
        </div>
      </section>
    </main>
  );
}
