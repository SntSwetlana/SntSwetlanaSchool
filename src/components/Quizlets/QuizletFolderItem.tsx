import React, { useEffect, useState } from "react";
import "./Quizlets.css";
import QuizletSetEditor from "./QuizletSetEditor";
import QuizletSetTile, { QuizletSetListItem } from "./QuizletSetTile";

type View =
  | { kind: "list" }
  | { kind: "editor"; setId: string; slug: string };

export default function QuizletFolderItem({ name }: { name: string }) {
  const [view, setView] = useState<View>({ kind: "list" });
  const [items, setItems] = useState<QuizletSetListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  async function loadSets() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/quizlet/sets", { credentials: "include" });
      if (!res.ok) throw new Error(`Load sets failed: ${res.status}`);
      const data = await res.json();
      setItems(data.items ?? data); // подстрой под свой JSON
    } catch (e: any) {
      setError(e?.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (view.kind === "list") loadSets();
  }, [view.kind]);

  function openSet(setId: string, slug: string) {
    setView({ kind: "editor", setId, slug });
  }

  function backToList() {
    setView({ kind: "list" });
  }

  return (
    <div className="quizlets">
      <h1 className="quizlets-title">{name}'s library</h1>

      {view.kind === "list" && (
        <>
          <div className="quizlets-toolbar">
            <div className="quizlets-toolbar-left">
              <input className="quizlets-search" placeholder="Search..." />
            </div>

            <div className="quizlets-toolbar-right">
              {/* тут оставишь свой CreateSetForm / Add set */}
              <button className="quizlets-btn" type="button" onClick={loadSets}>
                Refresh
              </button>
            </div>
          </div>

          {loading && <div style={{ padding: 12 }}>Loading…</div>}
          {error && <div style={{ padding: 12, color: "#b91c1c" }}>{error}</div>}

          <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
            {items.map((it) => (
              <QuizletSetTile key={it.id} item={it} onOpen={openSet} />
            ))}
          </div>
        </>
      )}

      {view.kind === "editor" && (
        <>
          <div style={{ marginBottom: 10 }}>
            <button className="quizlets-btn" type="button" onClick={backToList}>
              ← Back to list
            </button>
          </div>

          <QuizletSetEditor setId={view.setId} slug={view.slug} autoCreate={false} />
        </>
      )}
    </div>
  );
}
