"use client";

import React, { useEffect, useMemo, useState } from "react";
import { fetchEarnings } from "@/lib/api";
import { Card, EmptyState, LoadingSkeleton, SectionHeader } from "@/components/ui";
import type { Payout } from "@/lib/mockData";

function formatMoney(amount: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

function payoutChip(type: Payout["type"]) {
  const base = "retro-chip";
  if (type === "bonus") return `${base} status-active`;
  if (type === "adjustment") return `${base} status-issue`;
  return `${base} status-upcoming`;
}

export default function EarningsPage() {
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"api" | "mock">("mock");
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{ periodLabel: string; totalPayoutUsd: number; bonusesUsd: number; deliveriesCount: number } | null>(
    null
  );
  const [payouts, setPayouts] = useState<Payout[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      const res = await fetchEarnings();
      if (!alive) return;

      if (!res.ok) {
        setError(res.error);
        setLoading(false);
        return;
      }

      setSource(res.source);
      setSummary(res.data.summary);
      setPayouts([...res.data.payouts].sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1)));
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, []);

  const avgPerDelivery = useMemo(() => {
    if (!summary || summary.deliveriesCount === 0) return 0;
    return summary.totalPayoutUsd / summary.deliveriesCount;
  }, [summary]);

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Earnings"
        subtitle="Payout history, bonuses, and quick stats."
        right={<span className="retro-chip status-upcoming">DATA: {source.toUpperCase()}</span>}
      />

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LoadingSkeleton lines={6} />
          <LoadingSkeleton lines={6} />
        </div>
      ) : error ? (
        <EmptyState title="Couldn’t load earnings" body={error} />
      ) : !summary ? (
        <EmptyState title="No earnings data" body="Try again later." />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5">
              <div className="text-xs font-extrabold text-[color:var(--muted)]">TOTAL ({summary.periodLabel})</div>
              <div className="mt-2 text-3xl font-extrabold">{formatMoney(summary.totalPayoutUsd)}</div>
              <div className="mt-2 text-sm text-[color:var(--muted)]">Across {summary.deliveriesCount} deliveries</div>
            </Card>

            <Card className="p-5">
              <div className="text-xs font-extrabold text-[color:var(--muted)]">BONUSES</div>
              <div className="mt-2 text-3xl font-extrabold">{formatMoney(summary.bonusesUsd)}</div>
              <div className="mt-2 text-sm text-[color:var(--muted)]">Promos, streaks, peak hours</div>
            </Card>

            <Card className="p-5">
              <div className="text-xs font-extrabold text-[color:var(--muted)]">AVG / DELIVERY</div>
              <div className="mt-2 text-3xl font-extrabold">{formatMoney(avgPerDelivery)}</div>
              <div className="mt-2 text-sm text-[color:var(--muted)]">Helpful for goal setting</div>
            </Card>
          </div>

          <Card className="p-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold">Payout history</h2>
                <p className="text-sm text-[color:var(--muted)]">Most recent first.</p>
              </div>
            </div>

            {payouts.length === 0 ? (
              <div className="mt-4 text-sm text-[color:var(--muted)]">No payouts yet.</div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-left text-xs text-[color:var(--muted)]">
                      <th className="pr-3">DATE</th>
                      <th className="pr-3">TYPE</th>
                      <th className="pr-3">DESCRIPTION</th>
                      <th className="text-right">AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((p) => (
                      <tr key={p.id} className="retro-card">
                        <td className="p-3 font-semibold">{formatDate(p.dateISO)}</td>
                        <td className="p-3">
                          <span className={payoutChip(p.type)}>{p.type.toUpperCase()}</span>
                        </td>
                        <td className="p-3 text-sm">{p.description}</td>
                        <td className="p-3 text-right font-extrabold">{formatMoney(p.amountUsd)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
