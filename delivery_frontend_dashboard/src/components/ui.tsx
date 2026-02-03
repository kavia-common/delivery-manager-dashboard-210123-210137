"use client";

import React from "react";

export function Card({
  children,
  className = "",
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { className?: string }) {
  return (
    <div className={`retro-card ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-[color:var(--muted)]">{subtitle}</p> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

export function StatusBadge({ status }: { status: "active" | "upcoming" | "completed" | "issue" }) {
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: "ACTIVE", cls: "status-active" },
    upcoming: { label: "UPCOMING", cls: "status-upcoming" },
    completed: { label: "DONE", cls: "status-completed" },
    issue: { label: "ISSUE", cls: "status-issue" },
  };
  const s = map[status];
  return <span className={`retro-chip ${s.cls}`}>{s.label}</span>;
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <Card className="p-5">
      <h2 className="text-lg font-extrabold">{title}</h2>
      <p className="mt-1 text-sm text-[color:var(--muted)]">{body}</p>
    </Card>
  );
}

export function LoadingSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <Card className="p-5">
      <div className="h-4 w-44 bg-black/10 rounded mb-3" />
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, idx) => (
          <div key={idx} className="h-3 w-full bg-black/10 rounded" />
        ))}
      </div>
    </Card>
  );
}
