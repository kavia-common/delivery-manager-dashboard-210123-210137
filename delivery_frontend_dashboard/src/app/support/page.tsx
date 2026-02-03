"use client";

import React, { useEffect, useMemo, useState } from "react";
import { fetchSupport } from "@/lib/api";
import { Card, EmptyState, LoadingSkeleton, SectionHeader } from "@/components/ui";
import type { SupportTopic } from "@/lib/mockData";

const SUPPORT_PHONE = "+1 (555) 010-2020";
const SUPPORT_EMAIL = "support@delivery.example";

export default function SupportPage() {
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"api" | "mock">("mock");
  const [error, setError] = useState<string | null>(null);
  const [topics, setTopics] = useState<SupportTopic[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      const res = await fetchSupport();
      if (!alive) return;

      if (!res.ok) {
        setError(res.error);
        setLoading(false);
        return;
      }

      setSource(res.source);
      setTopics(res.data.topics);
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return topics;
    return topics.filter(
      (t) => t.title.toLowerCase().includes(q) || t.body.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
    );
  }, [topics, query]);

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Support"
        subtitle="Get help fast: call, email, or browse quick fixes."
        right={<span className="retro-chip status-upcoming">DATA: {source.toUpperCase()}</span>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h2 className="text-lg font-extrabold">Contact</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">For urgent issues during a delivery, call support.</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <a className="retro-btn bg-[color:var(--success)] text-[color:var(--ink)]" href={`tel:${SUPPORT_PHONE}`}>
              Call {SUPPORT_PHONE}
            </a>
            <a className="retro-btn bg-white" href={`mailto:${SUPPORT_EMAIL}`}>
              Email {SUPPORT_EMAIL}
            </a>
          </div>

          <div className="mt-4 retro-card p-3">
            <div className="text-xs font-extrabold text-[color:var(--muted)]">WHAT TO SHARE</div>
            <ul className="mt-2 text-sm list-disc pl-5 space-y-1">
              <li>Delivery ID (e.g., DEL-10492)</li>
              <li>Short description of the issue</li>
              <li>Customer contact attempt status</li>
            </ul>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-extrabold">Search help</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">Find quick answers without leaving the app.</p>

          <div className="mt-4">
            <label className="text-xs font-extrabold text-[color:var(--muted)]" htmlFor="helpSearch">
              SEARCH
            </label>
            <input
              id="helpSearch"
              className="mt-1 w-full retro-card px-3 py-3 border-3 border-[color:var(--ink)] rounded-[var(--radius-sm)] shadow-[var(--pixel-shadow)]"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., payouts, not answering, unsafe"
            />
          </div>
        </Card>
      </div>

      {loading ? (
        <LoadingSkeleton lines={7} />
      ) : error ? (
        <EmptyState title="Couldn’t load support topics" body={error} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No matches" body="Try a different search term." />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((t) => (
            <Card key={t.id} className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-extrabold">{t.title}</h3>
                <span className="retro-chip status-upcoming">{t.category}</span>
              </div>
              <p className="mt-2 text-sm">{t.body}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
