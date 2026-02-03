"use client";

import React, { useEffect, useMemo, useState } from "react";
import { fetchDeliveries } from "@/lib/api";
import { buildGoogleMapsDirectionsLink } from "@/lib/maps";
import type { Delivery, DeliveryStatus } from "@/lib/mockData";
import { Card, EmptyState, LoadingSkeleton, SectionHeader, StatusBadge } from "@/components/ui";

type Filter = "all" | DeliveryStatus;

function formatMoney(amount: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(amount);
}

function statusSortRank(s: DeliveryStatus): number {
  // Active first, then upcoming, then issue, then completed.
  if (s === "active") return 0;
  if (s === "upcoming") return 1;
  if (s === "issue") return 2;
  return 3;
}

export default function DeliveriesPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"api" | "mock">("mock");
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setError(null);
      const res = await fetchDeliveries();
      if (!alive) return;

      if (!res.ok) {
        setError(res.error);
        setDeliveries([]);
        setSource("mock");
        setLoading(false);
        return;
      }

      const sorted = [...res.data.deliveries].sort((a, b) => statusSortRank(a.status) - statusSortRank(b.status));
      setDeliveries(sorted);
      setSource(res.source);
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return deliveries;
    return deliveries.filter((d) => d.status === filter);
  }, [deliveries, filter]);

  const counts = useMemo(() => {
    const base = { all: deliveries.length, active: 0, upcoming: 0, completed: 0, issue: 0 } as const;
    const mutable = { ...base } as Record<string, number>;
    for (const d of deliveries) mutable[d.status] += 1;
    return mutable as Record<Filter, number>;
  }, [deliveries]);

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Deliveries"
        subtitle="Track active, upcoming, completed deliveries — and jump to navigation instantly."
        right={<span className="retro-chip status-upcoming">DATA: {source.toUpperCase()}</span>}
      />

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { key: "all", label: "All" },
              { key: "active", label: "Active" },
              { key: "upcoming", label: "Upcoming" },
              { key: "issue", label: "Issues" },
              { key: "completed", label: "Completed" },
            ] as Array<{ key: Filter; label: string }>
          ).map((t) => {
            const active = filter === t.key;
            return (
              <button
                key={t.key}
                type="button"
                className={`retro-btn text-sm ${active ? "bg-[color:var(--primary)] text-white" : ""}`}
                onClick={() => setFilter(t.key)}
              >
                {t.label} <span className="retro-chip ml-2">{counts[t.key]}</span>
              </button>
            );
          })}
          <div className="ml-auto text-sm text-[color:var(--muted)]">
            Tip: tap <span className="retro-kbd">Map</span> to open Google Maps directions
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LoadingSkeleton lines={5} />
          <LoadingSkeleton lines={5} />
        </div>
      ) : error ? (
        <EmptyState title="Couldn’t load deliveries" body={error} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No deliveries in this view" body="Try a different filter tab above." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((d) => (
            <Card key={d.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold tracking-tight">{d.id}</h2>
                    <StatusBadge status={d.status} />
                  </div>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">{d.scheduledWindow}</p>
                </div>

                <a
                  className="retro-btn text-sm bg-[color:var(--success)] text-[color:var(--ink)]"
                  href={buildGoogleMapsDirectionsLink({ lat: d.lat, lng: d.lng, label: d.customerName })}
                  target="_blank"
                  rel="noreferrer"
                >
                  Map
                </a>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="retro-card p-3">
                  <div className="text-xs font-extrabold text-[color:var(--muted)]">CUSTOMER</div>
                  <div className="mt-1 font-bold">{d.customerName}</div>
                  <a className="retro-link text-sm mt-1 inline-block" href={`tel:${d.phone}`}>
                    {d.phone}
                  </a>
                </div>
                <div className="retro-card p-3">
                  <div className="text-xs font-extrabold text-[color:var(--muted)]">ADDRESS</div>
                  <div className="mt-1 text-sm font-semibold">{d.addressLine}</div>
                  <div className="text-sm text-[color:var(--muted)]">
                    {d.city} {d.postalCode}
                  </div>
                </div>
              </div>

              <div className="mt-3 retro-card p-3">
                <div className="text-xs font-extrabold text-[color:var(--muted)]">ORDER</div>
                <div className="mt-1 text-sm">{d.itemsSummary}</div>
              </div>

              {d.notes ? (
                <div className="mt-3 retro-card p-3">
                  <div className="text-xs font-extrabold text-[color:var(--muted)]">NOTES</div>
                  <div className="mt-1 text-sm">{d.notes}</div>
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="retro-chip">Value {formatMoney(d.orderValueUsd)}</span>
                <span className="retro-chip status-active">Payout {formatMoney(d.payoutUsd)}</span>
                {d.bonusUsd > 0 ? <span className="retro-chip status-upcoming">Bonus {formatMoney(d.bonusUsd)}</span> : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
