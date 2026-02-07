import React, { useEffect, useMemo, useState } from "react";
import "./QuizletSetsList.css";

export type QuizletSetListItem = {
  id: string;
  slug: string;
  title: string;
  owner_name?: string;
  is_draft?: boolean; 
  cards_count: number;
  created_at?: string;
};

type SortMode = "recent" | "title";

export default function QuizletSetsList({
    onOpen,
    onCreate,
    }: {
    onOpen: (setId: string, slug: string) => void;
    onCreate: (setId: string, slug: string) => void;
    }) {
  const [items, setItems] = useState<QuizletSetListItem[]>([]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortMode>("recent");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");

    useEffect(() => {
    console.log("QuizletSetsList mounted");

    (async () => {
        console.log("QuizletSetsList: fetching /api/quizlet/sets");
        setLoading(true);
        setErr("");

        try {
        const res = await fetch("/api/quizlet/sets", { credentials: "include" });
        console.log("QuizletSetsList: status", res.status);

        const data = await res.json().catch(() => null);
        console.log("QuizletSetsList: data", data);

        if (!res.ok) throw new Error(`Load sets failed: ${res.status}`);

        const list =
            Array.isArray(data)
            ? data
            : data?.items
                ? data.items
                : [
                    ...(data?.in_progress ?? []),
                    ...(data?.this_week ?? []),
                    ...(data?.recent ?? []),
                ];

        setItems(list);
        } catch (e: any) {
        console.error(e);
        setErr(e?.message ?? "Failed");
        } finally {
        setLoading(false);
        }
    })();
    }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let list = items;

    if (s) {
      list = list.filter((x) => {
        const hay = `${x.title} ${x.slug}`.toLowerCase();
        return hay.includes(s);
      });
    }

    if (sort === "title") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // recent: если created_at нет — оставим как есть
      list = [...list].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
    }

    return list;
  }, [items, q, sort]);

  return (
    <div className="qzl">
      <div className="qzl-row">
        <div className="qzl-sort">
          <button className="qzl-sortbtn" type="button" onClick={() => setSort(sort === "recent" ? "title" : "recent")}>
            {sort === "recent" ? "Recent" : "Title"} <span className="qzl-caret">▾</span>
          </button>
          <button  
            className="qzl-add-set" 
            type="button"
            onClick={() => {
              const raw = window.prompt("Set slug (например: spotlight-8-unit-1)", "new-set");
              if (!raw) return;

              const slug = raw
                .trim()
                .toLowerCase()
                .replace(/['"]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");

              if (!slug) return;

              const setId = crypto.randomUUID();
              onCreate(setId, slug);
            }}
          >
            + Add Set
          </button>
        </div>

        <div className="qzl-search">
          <span className="qzl-search-ico" aria-hidden="true">🔎</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search flashcards"
            aria-label="Search flashcards"
          />
        </div>
      </div>

      {loading && <div className="qzl-muted">Loading…</div>}
      {err && <div className="qzl-error">{err}</div>}

      <div className="qzl-section">
        <div className="qzl-section-title">THIS WEEK</div>

        <div className="qzl-list">
          {filtered.map((it) => (
            <button
              key={it.id}
              className="qzl-item"
              type="button"
              onClick={() => onOpen(it.id, it.slug)}
            >
              <div className="qzl-item-top">
                <div className="qzl-terms">{it.cards_count} terms</div>

                <div className="qzl-meta">
                  <span className="qzl-avatar" aria-hidden="true"></span>
                  <span className="qzl-owner">{it.owner_name ?? "SntSwetlana"}</span>
                  <span className="qzl-pill">Teacher</span>
                </div>
              </div>

              <div className="qzl-title">
                {it.is_draft ? <span className="qzl-draft">(Draft) </span> : null}
                {it.title}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
