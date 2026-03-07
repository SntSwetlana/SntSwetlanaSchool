import React, { useEffect, useMemo, useRef, useState } from "react";
import "./NewsFeed.css";

export type NewsKind =
  | "idiom"
  | "news"
  | "tip"
  | "collocation"
  | "vocab"
  | "grammar"
  | "phrase"
  | "anecdote";

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type NewsItem = {
  id: string;
  kind: NewsKind;
  title: string;

  excerpt?: string | null;
  body?: string | null;

  source?: string | null;
  url?: string | null;
  created_at?: string | null;
  // новые поля из твоей таблицы
  level?: string | null;
  image_url?: string | null;
  phonetic?: string | null;
  is_hot?: boolean | null;
  tags?: (string | null)[] | null; // у тебя Array<Nullable<Text>>
};

function formatDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

const KIND_LABEL: Record<NewsKind, string> = {
  idiom: "Idiom",
  news: "News",
  tip: "Tip",
  collocation: "Collocation",
  vocab: "Vocabulary",
  grammar: "Grammar",
  phrase: "Phrase",
  anecdote: "Anecdote",
};

// простая “иконка” справа в шапке как на скрине
function kindIcon(kind: NewsKind) {
  switch (kind) {
    case "grammar":
      return "🧪";
    case "vocab":
      return "📗";
    case "collocation":
      return "🔗";
    case "idiom":
      return "💬";
    case "phrase":
      return "📝";
    case "tip":
      return "✨";
    case "news":
      return "🗞️";
    case "anecdote":
      return "🎭";
    default:
      return "📌";
  }
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function speakText(text?: string | null) {
  if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.95;
  u.pitch = 1;
  window.speechSynthesis.speak(u);
}
export default function NewsFeed({
  endpoint = "/api/news",
  initialLimit = 20,
}: {
  endpoint?: string;
  initialLimit?: number;
}) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // settings
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<"all" | NewsKind>("all");
  const [level, setLevel] = useState<"all" | CefrLevel>("all");
  const [onlyHot, setOnlyHot] = useState(false);
  const [withImages, setWithImages] = useState(false);

  const [limit, setLimit] = useState(clamp(initialLimit, 5, 50));

  // для “Next up” можно просто вычислять следующую карточку локально
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr("");

        const params = new URLSearchParams();
        params.set("limit", String(limit));
        if (kind !== "all") params.set("kind", kind);

        // Эти параметры заработают, когда ты добавишь на сервере фильтры.
        // Сейчас не мешают (сервер просто игнорит).
        if (level !== "all") params.set("level", level);
        if (onlyHot) params.set("hot", "1");
        if (withImages) params.set("has_image", "1");

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
  }, [endpoint, limit, kind, level, onlyHot, withImages]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return items;
    return items.filter((x) => {
      const s = `${x.title ?? ""} ${x.excerpt ?? ""} ${x.body ?? ""} ${x.tags?.join(" ") ?? ""}`.toLowerCase();
      return s.includes(qq);
    });
  }, [items, q]);

  const headerTitle = useMemo(() => {
    if (kind === "all") return "Feed";
    return KIND_LABEL[kind];
  }, [kind]);

  const openItem = (n: NewsItem) => {
    if (n.url) window.open(n.url, "_blank", "noreferrer");
  };

  return (
    <div className="nf">
      <div className="nf-head">
        <div className="nf-head-left">
          <div className="nf-title">{headerTitle}</div>
          <div className="nf-sub">Daily practice & short posts</div>
        </div>

        <div className="nf-controls">
          <input
            className="nf-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
          />

          <select
            className="nf-select"
            value={kind}
            onChange={(e) => setKind(e.target.value as any)}
            aria-label="Filter by kind"
          >
            <option value="all">All</option>
            <option value="idiom">Idioms</option>
            <option value="collocation">Collocations</option>
            <option value="vocab">Vocabulary</option>
            <option value="grammar">Grammar</option>
            <option value="phrase">Phrases</option>
            <option value="tip">Tips</option>
            <option value="news">English-world News</option>
            <option value="anecdote">Anecdotes</option>
          </select>

          <select
            className="nf-select"
            value={level}
            onChange={(e) => setLevel(e.target.value as any)}
            aria-label="Filter by level"
          >
            <option value="all">All levels</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
            <option value="C2">C2</option>
          </select>

          <label className="nf-check">
            <input type="checkbox" checked={onlyHot} onChange={(e) => setOnlyHot(e.target.checked)} />
            <span>Hot</span>
          </label>

          <label className="nf-check">
            <input type="checkbox" checked={withImages} onChange={(e) => setWithImages(e.target.checked)} />
            <span>Images</span>
          </label>

          <select
            className="nf-select nf-select-sm"
            value={String(limit)}
            onChange={(e) => setLimit(clamp(Number(e.target.value), 5, 50))}
            aria-label="Page size"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="30">30</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      {loading && <div className="nf-muted">Loading…</div>}
      {err && <div className="nf-error">{err}</div>}

      <div className="nf-list" ref={listRef}>
        {!loading && !err && filtered.length === 0 && <div className="nf-muted">No items.</div>}

        {filtered.map((n, idx) => {
          const levelText = (n.level ?? "B1").toUpperCase();
          const dateText = formatDate(n.created_at);
          const next = filtered[idx + 1];

          return (
            <article
              key={n.id}
              className={"nf-card " + (n.url ? "is-click" : "")}
              onClick={() => openItem(n)}
              role={n.url ? "link" : undefined}
              tabIndex={n.url ? 0 : -1}
              onKeyDown={(e) => {
                if (!n.url) return;
                if (e.key === "Enter" || e.key === " ") openItem(n);
              }}
            >
              {/* CARD HEADER */}
              <header className="nf-card-h">
                <div className="nf-card-h-left">
                  <div className="nf-card-meta">
                    <button
                      className="nf-speak-btn"
                      type="button"
                      aria-label={`Listen to title: ${n.title}`}
                      title="Listen"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(n.title);
                      }}
                    >
                      🔊
                    </button>

                    <button
                      className="nf-kind-ico"
                      type="button"
                      aria-label={n.kind}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {kindIcon(n.kind)}
                    </button>

                    <span className="nf-pill">{KIND_LABEL[n.kind]}</span>
                    <span className="nf-pill ghost">{levelText}</span>
                    {dateText ? <span className="nf-meta nf-meta-last">{dateText}</span> : <span className="nf-meta nf-meta-last" />}
                  </div>

                  <div className="nf-card-title">{n.title}</div>
                </div>
              </header>
              {/* CARD BODY */}
              <div className="nf-card-b">
                {n.image_url ? (
                  <div className="nf-media">
                    <img className="nf-img" src={n.image_url} alt="" loading="lazy" />
                  </div>
                ) : null}
              </div>

              <div className="nf-card-translate">
                <div className="nf-content">
                  {/* “Prompt / short task line” like on screenshot */}
                  {n.excerpt ? <div className="nf-excerpt">{n.excerpt}</div> : null}

                  {n.phonetic ? <div className="nf-phon">{n.phonetic}</div> : null}

                  {n.body ? <div className="nf-body">{n.body}</div> : null}

                  {n.tags?.length ? (
                    <div className="nf-tags">
                      {n.tags.filter(Boolean).slice(0, 6).map((t) => (
                        <span className="nf-tag" key={t as string}>{t}</span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* CARD FOOTER like “Next up” */}
              <footer className="nf-card-f">
                <button
                  className="nf-next"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const el = (listRef.current?.querySelectorAll(".nf-card")?.[idx + 1] as HTMLElement) ?? null;
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  disabled={!next}
                  aria-label={next ? `Open next: ${next.title}` : "No next card"}
                >
                  <span>▶</span>
                </button>

                <div className="nf-foot-right">
                  {n.source ? <span className="nf-foot">{n.source}</span> : null}
                  {next ? <span className="nf-foot muted">Because you practiced {KIND_LABEL[n.kind]}</span> : null}
                </div>
              </footer>
            </article>
          );
        })}
      </div>
    </div>
  );
}