import React, { useEffect, useMemo, useState } from "react";
import "./QuizletFoldersList.css";

export type FolderListItem = {
  id: string;
  title: string;
  sets_count: number;
  updated_at: string;
};

type SortMode = "recent" | "title";

type FolderSetItem = {
  id: string;
  slug: string;
  title: string;
  terms_count?: number;
  updated_at?: string;
};

type AvailableSetItem = {
  id: string;
  title: string;
  terms_count?: number;
  updated_at?: string;
};

export default function QuizletFoldersList({
  onOpen,
  onOpenSet,
  onCreate,
  onRename,
  onDelete
}: {
  onOpen: (folderId: string) => void;
  onOpenSet: (setId: string, slug: string) => void;
  onCreate: (folderId: string, title: string) => void;
  onRename: (folderId: string, currentTitle: string) => void;
  onDelete: (folderId: string) => void;
}) {
  const [items, setItems] = useState<FolderListItem[]>([]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortMode>("recent");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [openFolderId, setOpenFolderId] = useState<string | null>(null);
  const [setsByFolder, setSetsByFolder] = useState<Record<string, FolderSetItem[]>>({});
  const [setsLoadingByFolder, setSetsLoadingByFolder] = useState<Record<string, boolean>>({});
  const [setsErrByFolder, setSetsErrByFolder] = useState<Record<string, string>>({});

  const [pickOpen, setPickOpen] = useState(false);
  const [pickFolderId, setPickFolderId] = useState<string | null>(null);

  const [availableSets, setAvailableSets] = useState<AvailableSetItem[]>([]);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [availableErr, setAvailableErr] = useState("");

  const [selectedSetIds, setSelectedSetIds] = useState<Set<string>>(new Set());

  const PAGE_SIZE = 10;

  const [setQuery, setSetQuery] = useState("");
  const [debouncedSetQuery, setDebouncedSetQuery] = useState("");

  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
  const t = setTimeout(() => setDebouncedSetQuery(setQuery.trim()), 300);
  return () => clearTimeout(t);
}, [setQuery]);


useEffect(() => {
  if (!pickOpen || !pickFolderId) return;
  fetchSetsPage({ folderId: pickFolderId, cursor: null, q: debouncedSetQuery, reset: true });
}, [debouncedSetQuery, pickOpen, pickFolderId]);

useEffect(() => {
  if (!pickOpen || !pickFolderId) return;
  if (!sentinelRef.current) return;

  const el = sentinelRef.current;

  const obs = new IntersectionObserver(
    (entries) => {
      const first = entries[0];
      if (!first.isIntersecting) return;

      if (hasMore && nextCursor && !availableLoading && !loadingMore) {
        fetchSetsPage({
          folderId: pickFolderId,
          cursor: nextCursor,
          q: debouncedSetQuery,
          reset: false,
        });
      }
    },
    {
      root: document.querySelector(".qfl-modalBody"),
      rootMargin: "120px",
      threshold: 0.0,
    }
  );

  obs.observe(el);
  return () => obs.disconnect();
}, [pickOpen, pickFolderId, hasMore, nextCursor, availableLoading, loadingMore, debouncedSetQuery]);


async function fetchSetsPage(opts: { folderId: string; cursor?: string | null; q?: string; reset?: boolean }) {
  const { folderId, cursor = null, q = "", reset = false } = opts;

  if (reset) {
    setAvailableLoading(true);
  } else {
    setLoadingMore(true);
  }
  setAvailableErr("");

  try {
    const params = new URLSearchParams();
    params.set("limit", String(PAGE_SIZE));
    if (cursor) params.set("cursor", cursor);
    if (q) params.set("q", q);

    const res = await fetch(`/api/quizlet/sets?${params.toString()}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error(`Load sets failed: ${res.status}`);
    const data = await res.json().catch(() => null);

    const items: AvailableSetItem[] =
    Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
        ? data.items
        : [
            ...(data?.in_progress ?? []),
            ...(data?.this_week ?? []),
            ...(data?.recent ?? []),
          ];

  const nc: string | null = data?.nextCursor ?? data?.next_cursor ?? null;

    const existing = new Set((setsByFolder[folderId] ?? []).map((x) => x.id));
    const filteredItems = items.filter((x) => !existing.has(x.id));

    if (reset) {
      setAvailableSets(filteredItems);
    } else {
      setAvailableSets((prev) => {
        const seen = new Set(prev.map((x) => x.id));
        const add = filteredItems.filter((x) => !seen.has(x.id));
        return [...prev, ...add];
      });
    }

    setNextCursor(nc);
    setHasMore(Boolean(nc));
  } catch (e: any) {
    setAvailableErr(e?.message ?? "Failed");
  } finally {
    setAvailableLoading(false);
    setLoadingMore(false);
  }
}
async function openPicker(folderId: string) {
  setPickFolderId(folderId);
  setPickOpen(true);

  setSelectedSetIds(new Set());
  setAvailableSets([]);
  setNextCursor(null);
  setHasMore(true);
  setSetQuery("");
  setDebouncedSetQuery("");
  console.log("Opening picker for folder", folderId);
  await fetchSetsPage({ folderId, cursor: null, q: "", reset: true });
}

function toggleSelected(setId: string) {
  setSelectedSetIds((prev) => {
    const next = new Set(prev);
    if (next.has(setId)) next.delete(setId);
    else next.add(setId);
    return next;
  });
}

async function confirmAddSets() {
  if (!pickFolderId) return;
  const setIds = Array.from(selectedSetIds);
  if (setIds.length === 0) return;

  try {
    const res = await fetch(`/api/quizlet/folders/${pickFolderId}/sets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ set_ids: Array.from(selectedSetIds) }),
    });
    const text = await res.text();
        if (!res.ok) throw new Error(text || `Add sets failed: ${res.status}`);

    await loadFolderSets(pickFolderId, true);

    setItems((prev) =>
      prev.map((f) =>
        f.id === pickFolderId
          ? { ...f, sets_count: (setsByFolder[pickFolderId]?.length ?? f.sets_count) } // временно
          : f
      )
    );

    setItems((prev) =>
      prev.map((f) =>
        f.id === pickFolderId
          ? { ...f, sets_count: (setsByFolder[pickFolderId]?.length ?? f.sets_count) + setIds.length }
          : f
      )
    );

    const fres = await fetch("/api/quizlet/folders", { credentials: "include" });
    if (fres.ok) setItems(await fres.json());
    await loadFolderSets(pickFolderId, true);

    setPickOpen(false);
    } catch (e: any) {
      alert(e?.message ?? "Failed to add sets");
    }
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch("/api/quizlet/folders", { credentials: "include" });
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

    if (s) list = list.filter((x) => x.title.toLowerCase().includes(s));

    if (sort === "title") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    } else {
      list = [...list].sort((a, b) =>
        (b.updated_at ?? "").localeCompare(a.updated_at ?? "")
      );
    }

    return list;
  }, [items, q, sort]);

  async function loadFolderSets(folderId: string, force = false) {
  if (!force && setsByFolder[folderId]) return;

  setSetsLoadingByFolder((p) => ({ ...p, [folderId]: true }));
  setSetsErrByFolder((p) => ({ ...p, [folderId]: "" }));

  try {
    const res = await fetch(`/api/quizlet/folders/${folderId}/sets`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error(`Load sets failed: ${res.status}`);
    const data = await res.json();
    const arr: FolderSetItem[] = Array.isArray(data) ? data : [];
    setSetsByFolder((p) => ({ ...p, [folderId]: arr }));
  } catch (e: any) {
    setSetsErrByFolder((p) => ({ ...p, [folderId]: e?.message ?? "Failed" }));
  } finally {
    setSetsLoadingByFolder((p) => ({ ...p, [folderId]: false }));
  }
}


  async function removeSetFromFolder(folderId: string, setId: string) {
    // optimistic UI
    const prev = setsByFolder[folderId] ?? [];
    setSetsByFolder((p) => ({
      ...p,
      [folderId]: prev.filter((s) => s.id !== setId)
    }));

    try {
      const res = await fetch(`/api/quizlet/folders/${folderId}/sets/${setId}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) throw new Error(`Remove set failed: ${res.status}`);

      setItems((p) =>
        p.map((f) =>
          f.id === folderId
            ? { ...f, sets_count: Math.max(0, (f.sets_count ?? 0) - 1) }
            : f
        )
      );
    } catch (e: any) {
      setSetsByFolder((p) => ({ ...p, [folderId]: prev }));
      alert(e?.message ?? "Failed to remove set");
    }
  }

  function toggleFolder(folderId: string) {
    setOpenFolderId((curr) => (curr === folderId ? null : folderId));
    if (openFolderId !== folderId) loadFolderSets(folderId);
  }

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

          <button
            className="qzl-add-set"
            type="button"
            onClick={() => {
              const raw = window.prompt(
                "Folder title (например: Unit 1)",
                "New folder"
              );
              if (!raw) return;

              const title = raw.trim();
              if (!title) return;

              const folderId = crypto.randomUUID();
              onCreate(folderId, title);
              setItems((p) => [
                { id: folderId, title, sets_count: 0, updated_at: new Date().toISOString() },
                ...p
              ]);
            }}
          >
            + Add Folder
          </button>
        </div>

        <div className="qfl-search">
          <span className="qfl-search-ico" aria-hidden="true">🔎</span>
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
        {filtered.map((f) => {
          const isOpen = openFolderId === f.id;
          const sets = setsByFolder[f.id] ?? [];
          const setsLoading = !!setsLoadingByFolder[f.id];
          const setsErr = setsErrByFolder[f.id] ?? "";

          return (
            <div key={f.id} className="qfl-folderblock">
              {/* header row (folder item) */}
              <div
                className="qfl-item"
                role="button"
                tabIndex={0}
                onClick={() => toggleFolder(f.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleFolder(f.id);
                  }
                }}
                aria-expanded={isOpen}
              >
                <div className="qfl-item-top">
                  <div className="qfl-sets">{f.sets_count} sets</div>

                  <div className="qfl-actions">
                    {/* Optional:  viewer */}
                    <button
                      className="qfl-iconbtn"
                      type="button"
                      title="Open folder viewer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpen(f.id);
                      }}
                    >
                      ↗
                    </button>

                    <button
                      className="qfl-iconbtn"
                      type="button"
                      title="Rename folder"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRename(f.id, f.title);
                      }}
                    >
                      ✏️
                    </button>

                    <button
                      className="qfl-iconbtn"
                      type="button"
                      title="Delete folder"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete folder "${f.title}"?`)) onDelete(f.id);
                      }}
                    >
                      🗑
                    </button>

                    {f.updated_at ? new Date(f.updated_at).toLocaleDateString() : ""}
                  </div>
                </div>

                <div className="qfl-title">
                  {f.title}
                  <span className="qfl-expand">{isOpen ? "▴" : "▾"}</span>
                </div>
              </div>

              {/* expanded sets panel */}
              {isOpen && (
                <div className="qfl-setsPanel">
                  {setsLoading && <div className="qfl-muted">Loading sets…</div>}
                  {setsErr && <div className="qfl-error">{setsErr}</div>}

                  {!setsLoading && !setsErr && sets.length === 0 && (
                    <div className="qfl-muted">
                      {!setsLoading && !setsErr && sets.length === 0 && (
                      <div className="qfl-empty">
                        <button
                          className="qfl-emptyAdd"
                          type="button"
                          onClick={() => openPicker(f.id)}
                          aria-label="Add sets to folder"
                          title="Add sets"
                        >
                          <span className="qfl-plus">+</span>
                        </button>
                        <div className="qfl-emptyText">Add sets to this folder</div>
                      </div>
                    )}</div>
                  )}

                  {!setsLoading && !setsErr && sets.length > 0 && (
                    <div className="qfl-setsList">
                    {sets.map((s) => (
                      <div key={s.id} className="qfl-setRow">
                        <div
                          className="qfl-setClick"
                          role="button"
                          tabIndex={0}
                          onClick={() => onOpenSet(s.id, s.slug)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onOpenSet(s.id, s.slug);
                            }
                          }}
                        >
                          <div className="qfl-setMain">
                            <div className="qfl-setTitle">{s.title}</div>
                            <div className="qfl-setMeta">
                              {typeof s.terms_count === "number" ? `${s.terms_count} terms` : ""}
                              {s.updated_at ? ` • ${new Date(s.updated_at).toLocaleDateString()}` : ""}
                            </div>
                          </div>
                        </div>

                        <button
                          className="qfl-iconbtn"
                          type="button"
                          title="Remove set from folder"
                          onClick={() => removeSetFromFolder(f.id, s.id)}
                        >
                          ✖
                        </button>
                      </div>
                    ))}                    
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {pickOpen && (
      <div
        className="qfl-modalOverlay"
        role="presentation"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) setPickOpen(false);
        }}
      >
        <div
          className="qfl-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Choose sets"
        >
          <div className="qfl-modalHeader">
            <div className="qfl-modalTitle">Choose sets</div>
            <button className="qfl-iconbtn" type="button" onClick={() => setPickOpen(false)} title="Close">
              ✖
            </button>
          </div>

          <div className="qfl-modalBody">
            <div className="qfl-pickSearch">
              <span className="qfl-search-ico">🔎</span>
              <input
                value={setQuery}
                onChange={(e) => setSetQuery(e.target.value)}
                placeholder="Search sets"
              />
            </div>

            {availableLoading && <div className="qfl-muted">Loading…</div>}
            {availableErr && <div className="qfl-error">{availableErr}</div>}

            {!availableLoading && !availableErr && availableSets.length === 0 && (
              <div className="qfl-muted">No sets found.</div>
            )}

            {!availableLoading && !availableErr && availableSets.length > 0 && (
              <div className="qfl-pickList">
                {availableSets.map((s) => {
                  const checked = selectedSetIds.has(s.id);
                  return (
                    <label key={s.id} className="qfl-pickRow">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSelected(s.id)}
                      />
                      <div className="qfl-pickMain">
                        <div className="qfl-pickTitle">{s.title}</div>
                        <div className="qfl-pickMeta">
                          {typeof s.terms_count === "number" ? `${s.terms_count} terms` : ""}
                          {s.updated_at ? ` • ${new Date(s.updated_at).toLocaleDateString()}` : ""}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          {/* sentinel для infinite scroll */}
          <div ref={sentinelRef} style={{ height: 1 }} />

          {loadingMore && <div className="qfl-muted" style={{ padding: "10px 2px" }}>Loading more…</div>}
          {!loadingMore && !hasMore && availableSets.length > 0 && (
            <div className="qfl-muted" style={{ padding: "10px 2px" }}>End of list</div>
          )}
          </div>

          <div className="qfl-modalFooter">
            <button className="qfl-sortbtn" type="button" onClick={() => setPickOpen(false)}>
              Cancel
            </button>
            <button
              className="qzl-add-set"
              type="button"
              disabled={selectedSetIds.size === 0}
              onClick={confirmAddSets}
            >
              Add selected ({selectedSetIds.size})
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
