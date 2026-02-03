"use client";

import React, { useEffect, useMemo, useState } from "react";
import { fetchNotifications } from "@/lib/api";
import { Card, EmptyState, LoadingSkeleton, SectionHeader } from "@/components/ui";
import type { NotificationItem } from "@/lib/mockData";

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function severityClass(sev: NotificationItem["severity"]) {
  if (sev === "success") return "status-active";
  if (sev === "warning") return "status-upcoming";
  if (sev === "danger") return "status-issue";
  return "status-completed";
}

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"api" | "mock">("mock");
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      const res = await fetchNotifications();
      if (!alive) return;

      if (!res.ok) {
        setError(res.error);
        setLoading(false);
        return;
      }

      setSource(res.source);
      setItems([...res.data.notifications].sort((a, b) => (a.createdAtISO < b.createdAtISO ? 1 : -1)));
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!showUnreadOnly) return items;
    return items.filter((n) => !n.read);
  }, [items, showUnreadOnly]);

  const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items]);

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Notifications"
        subtitle="Important updates, bonuses, and delivery alerts."
        right={
          <div className="flex items-center gap-2">
            <span className="retro-chip status-upcoming">UNREAD {unreadCount}</span>
            <span className="retro-chip status-upcoming">DATA: {source.toUpperCase()}</span>
          </div>
        }
      />

      <Card className="p-4">
        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              className="size-4"
              checked={showUnreadOnly}
              onChange={(e) => setShowUnreadOnly(e.target.checked)}
            />
            Show unread only
          </label>

          <div className="text-sm text-[color:var(--muted)]">Sorted by most recent</div>
        </div>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          <LoadingSkeleton lines={5} />
          <LoadingSkeleton lines={5} />
        </div>
      ) : error ? (
        <EmptyState title="Couldn’t load notifications" body={error} />
      ) : filtered.length === 0 ? (
        <EmptyState title="All caught up" body="No notifications in this view." />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((n) => (
            <Card key={n.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-extrabold">{n.title}</h2>
                    <span className={`retro-chip ${severityClass(n.severity)}`}>{n.severity.toUpperCase()}</span>
                    {!n.read ? <span className="retro-chip status-active">NEW</span> : null}
                  </div>
                  <p className="mt-2 text-sm">{n.body}</p>
                </div>
                <div className="text-xs text-[color:var(--muted)] whitespace-nowrap">{formatTime(n.createdAtISO)}</div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
