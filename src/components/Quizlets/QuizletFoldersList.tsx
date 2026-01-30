import React, { useEffect, useMemo, useState } from "react";
import "./QuizletFoldersList.css";

export type FolderListItem = {
  id: string;
  title: string;
  sets_count: number;
  updated_at: string;
};

type SortMode = "recent" | "title";

export default function QuizletFoldersList({
  onOpen,
}: {
  onOpen: (folderId: string) => void;
}) {
  const [items, setItems] = useState<FolderListItem[]>([]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortMode>("recent");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch("/api/quizlet/folders", {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Load folders failed: ${res.status}`);
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (e: any) {
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
      list = list.filter((x) => x.title.toLowerCase().includes(s));
    }

    if (sort === "title") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    } else {
      list = [...list].sort((a, b) =>
        (b.updated_at ?? "").localeCompare(a.updated_at ?? "")
      );
    }

    return list;
  }, [items, q, sort]);

  return (
    <div className="qfl">
      <div className="qfl-row">
        <div className="qfl-sort">
          <button
            className="qfl-sortbtn"
            type="button"
            onClick={() => setSort(sort === "recent" ? "title" : "recent")}
          >

            {sort === "recent" ? "Recent" : "Title"}{" "}
            <span className="qfl-caret">▾</span>
          </button>
          <button  className="qzl-add-set" type="button"> + Add Folder</button>
        </div>

        <div className="qfl-search">
          <span className="qfl-search-ico">🔎</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search folders"
          />
        </div>
      </div>

      {loading && <div className="qfl-muted">Loading…</div>}
      {err && <div className="qfl-error">{err}</div>}

      <div className="qfl-list">
        {filtered.map((f) => (
          <button
            key={f.id}
            className="qfl-item"
            type="button"
            onClick={() => onOpen(f.id)}
          >
            <div className="qfl-item-top">
              <div className="qfl-sets">{f.sets_count} sets</div>
              <div className="qfl-date">
                {new Date(f.updated_at).toLocaleDateString()}
              </div>
            </div>
            <div className="qfl-title">{f.title}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
