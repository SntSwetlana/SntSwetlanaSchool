import React, { useEffect, useMemo, useState } from "react";

export type NewsItem = {
  id: string;
  kind: "idiom" | "news" | "tip";
  title: string;          // идиома (или заголовок новости)
  excerpt?: string | null; // перевод/кратко
  body?: string | null;    // пример/текст
  source?: string | null;
  url?: string | null;
  created_at?: string | null; // ISO
};

function formatDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
}

function dayIndex(seed: number, mod: number) {
  // стабильный индекс "идиома дня" (UTC) чтобы у всех одинаково
  const now = new Date();
  const utcDays = Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 86400000);
  return (utcDays + seed) % Math.max(1, mod);
}

export default function NewsFeed({
  endpoint = "/api/news",
  limit = 20,
  seed = 17,
}: {
  endpoint?: string;
  limit?: number;
  seed?: number;
}) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<"all" | "idiom" | "news" | "tip">("all");

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr("");

        const params = new URLSearchParams();
        params.set("limit", String(limit));
        if (kind !== "all") params.set("kind", kind);

        const res = await fetch(`${endpoint}?${params.toString()}`, {
          credentials: "include",
          signal: ac.signal,
        });

        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(`News load failed: ${res.status} ${t}`);
        }

        const data = await res.json();
        const arr: NewsItem[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : [];

        setItems(arr);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setErr(e?.message ?? "Failed");
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [endpoint, limit, kind]);

  const idioms = useMemo(() => items.filter((x) => x.kind === "idiom"), [items]);
  const idiomOfDay = useMemo(() => {
    if (!idioms.length) return null;
    return idioms[dayIndex(seed, idioms.length)];
  }, [idioms, seed]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return items;
    return items.filter((x) => {
      const s = `${x.title ?? ""} ${x.excerpt ?? ""} ${x.body ?? ""}`.toLowerCase();
      return s.includes(qq);
    });
  }, [items, q]);

  return (
    <div className="newsfeed">
      <div className="newsfeed-head">
        <div className="newsfeed-title">News</div>

        <div className="newsfeed-controls">
          <input
            className="newsfeed-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
          />

          <select
            className="newsfeed-select"
            value={kind}
            onChange={(e) => setKind(e.target.value as any)}
            aria-label="Filter"
          >
            <option value="all">All</option>
            <option value="idiom">Idioms</option>
            <option value="news">News</option>
            <option value="tip">Tips</option>
          </select>
        </div>
      </div>

      {/* Idiom of the day */}
      {idiomOfDay && (
        <div className="newsfeed-feature">
          <div className="newsfeed-feature-badge">Idiom of the day</div>
          <div className="newsfeed-feature-title">{idiomOfDay.title}</div>
          {idiomOfDay.excerpt && <div className="newsfeed-feature-excerpt">{idiomOfDay.excerpt}</div>}
          {idiomOfDay.body && <div className="newsfeed-feature-body">{idiomOfDay.body}</div>}
        </div>
      )}

      {loading && <div className="newsfeed-muted">Loading…</div>}
      {err && <div className="newsfeed-error">{err}</div>}

      <div className="newsfeed-list">
        {!loading && !err && filtered.length === 0 && (
          <div className="newsfeed-muted">No items.</div>
        )}

        {filtered.map((n) => (
          <a
            key={n.id}
            className="newsfeed-item"
            href={n.url ?? "#"}
            target={n.url ? "_blank" : undefined}
            rel={n.url ? "noreferrer" : undefined}
            onClick={(e) => {
              if (!n.url) e.preventDefault();
            }}
          >
            <div className="newsfeed-item-top">
              <div className="newsfeed-item-kind">{n.kind.toUpperCase()}</div>
              <div className="newsfeed-item-date">{formatDate(n.created_at)}</div>
            </div>

            <div className="newsfeed-item-title">{n.title}</div>
            {n.excerpt ? <div className="newsfeed-item-excerpt">{n.excerpt}</div> : null}
          </a>
        ))}
      </div>
    </div>
  );
}