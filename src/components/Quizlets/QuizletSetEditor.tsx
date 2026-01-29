import React, { useEffect, useMemo, useState } from "react";
import "./QuizletSetEditor.css";

type CardDraft = {
  id: string;
  term: string;
  definition: string;
  imageFile?: File | null;
};

const uid = () => (crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));

function createEmptyCard(): CardDraft {
  return { id: uid(), term: "", definition: "", imageFile: null };
}

export default function QuizletSetEditor({ setId, slug, autoCreate = false }: { setId: string; slug: string, autoCreate?: boolean }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [search, setSearch] = useState("");
    const [suggestions, setSuggestions] = useState(true);

    const [cards, setCards] = useState<CardDraft[]>([]);
    const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
    const [saveMsg, setSaveMsg] = useState<string>("");


    useEffect(() => {
      let cancelled = false;

      async function load() {
        const res = await fetch(`/api/quizlet/sets/${setId}/full`, {
          credentials: "include",
        });

        if (cancelled) return;

        if (!res.ok) {
          setSaveState("error");
          setSaveMsg(`Load failed: ${res.status}`);
          return;
        }

        const data = await res.json();
        setTitle(data.set.title ?? "");
        setDescription(data.set.description ?? "");
        setCards(
          (data.cards ?? []).map((c: any) => ({
            id: c.id,
            term: c.term,
            definition: c.explanation,
            imageFile: null,
          }))
        );
      }

      load();
      return () => {
        cancelled = true;
      };
    }, [setId]);

    async function onDone() {
    // 1) сохранить set
    await fetch(`/api/quizlet/sets/${setId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        slug,
        title,
        description,
        language_level: null,
      }),
    });

    // 2) заменить карточки целиком
    await fetch(`/api/quizlet/sets/${setId}/cards:replace`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        cards: cards
          .map((c) => ({
            term: c.term.trim(),
            explanation: c.definition.trim(),
          }))
          .filter((c) => c.term && c.explanation),
      }),
    });
  }
    async function onSave() {
    try {
        setSaveState("saving");
        setSaveMsg("");

        // 1) upsert set
        const setRes = await fetch(`/api/quizlet/sets/${setId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            slug,                // важно: slug передай пропсом
            title,
            description: description || null,
            language_level: null,
            source_url: window.location.href,
        }),
        });

        if (!setRes.ok) {
        const text = await setRes.text().catch(() => "");
        throw new Error(`Set save failed: ${setRes.status} ${text}`);
        }

        // 2) replace cards
        const payloadCards = cards
        .map((c) => ({
            term: c.term.trim(),
            explanation: c.definition.trim(),
        }))
        .filter((c) => c.term && c.explanation);

        const cardsRes = await fetch(`/api/quizlet/sets/${setId}/cards:replace`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ cards: payloadCards }),
        });

        if (!cardsRes.ok) {
        const text = await cardsRes.text().catch(() => "");
        throw new Error(`Cards save failed: ${cardsRes.status} ${text}`);
        }

        setSaveState("saved");
        setSaveMsg(`Saved: ${payloadCards.length} cards`);

        // через 2.5с убираем "Saved"
        window.setTimeout(() => {
        setSaveState("idle");
        setSaveMsg("");
        }, 2500);
    } catch (e: any) {
        setSaveState("error");
        setSaveMsg(e?.message ?? "Save failed");
    }
    }

  const filteredCards = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter(
      (c) => c.term.toLowerCase().includes(q) || c.definition.toLowerCase().includes(q)
    );
  }, [cards, search]);

  function addCard() {
    setCards((prev) => [...prev, createEmptyCard()]);
  }

  function updateCard(id: string, patch: Partial<CardDraft>) {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function removeCard(id: string) {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }

  function importExample() {
    // Заглушка: тут можно открыть модалку импорта/вставки текста
    // Например: term — definition по строкам
    alert("Import: сюда можно добавить импорт из текста/CSV.");
  }

  return (
    <div className="qz-editor">
      {/* Top bar */}
      <div className="qz-topbar">
        <div className="qz-topbar-left" />
        <div className="qz-topbar-center">
          <div className="qz-search">
            <span className="qz-search-icon" aria-hidden="true">🔎</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for study guides"
              aria-label="Search"
            />
          </div>
        </div>
        <div className="qz-topbar-right">
        <button
            className="qz-btn"
            type="button"
            onClick={onSave}
            disabled={saveState === "saving"}
            title="Save to database"
        >
            {saveState === "saving" ? "Saving..." : "Save"}
        </button>

        <button className="qz-btn qz-btn-primary" onClick={() => { /* done/close */ }} type="button">
            Done
        </button>
        </div>
      </div>
       {saveState !== "idle" && (
            <div className={`qz-savebanner ${saveState}`}>
                {saveState === "saving" && "Saving to database..."}
                {saveState === "saved" && (saveMsg || "Saved successfully")}
                {saveState === "error" && (saveMsg || "Save failed")}
            </div>
        )}

      <div className="qz-page">
        {/* Back */}
        <div className="qz-backrow">
          <button className="qz-link" type="button">
            ← <span>Back to set</span>
          </button>
        </div>

        {/* Public badge */}
        <div className="qz-badgerow">
          <span className="qz-badge">
            <span className="qz-badge-dot" aria-hidden="true">🌐</span>
            Public
          </span>
        </div>

        {/* Title / description */}
        <div className="qz-meta">
          <label className="qz-label">Title</label>
          <input
            className="qz-input qz-input-lg"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
          />

          <input
            className="qz-input qz-input-lg qz-input-muted"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
          />
        </div>

        {/* Toolbar */}
        <div className="qz-toolbar">
          <div className="qz-toolbar-left">
            <button className="qz-chipbtn" type="button" onClick={importExample}>
              <span aria-hidden="true">＋</span> Import
            </button>
            <button className="qz-chipbtn" type="button" onClick={() => alert("Diagram")}>
              <span aria-hidden="true">＋</span> Add diagram
            </button>
          </div>

          <div className="qz-toolbar-right">
            <div className="qz-suggest">
              <span className="qz-suggest-label">Suggestions</span>
              <button
                type="button"
                className={`qz-toggle ${suggestions ? "is-on" : ""}`}
                onClick={() => setSuggestions((v) => !v)}
                aria-pressed={suggestions}
              >
                <span className="qz-toggle-knob" />
              </button>
            </div>

            <button className="qz-iconbtn" type="button" title="Shuffle" aria-label="Shuffle">
              ⇄
            </button>
            <button className="qz-iconbtn" type="button" title="Keyboard" aria-label="Keyboard">
              ⌨
            </button>
            <button className="qz-iconbtn" type="button" title="Trash all" aria-label="Trash all">
              🗑
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="qz-cards">
          {filteredCards.map((card, index) => (
            <div className="qz-cardrow" key={card.id}>
              <div className="qz-cardrow-num">{index + 1}</div>

              <div className="qz-card">
                <div className="qz-card-main">
                  <div className="qz-field">
                    <input
                      className="qz-field-input"
                      value={card.term}
                      onChange={(e) => updateCard(card.id, { term: e.target.value })}
                      placeholder="Term"
                    />
                    <div className="qz-field-meta">TERM</div>
                  </div>

                  <div className="qz-field">
                    <input
                      className="qz-field-input"
                      value={card.definition}
                      onChange={(e) => updateCard(card.id, { definition: e.target.value })}
                      placeholder="Definition"
                    />
                    <div className="qz-field-meta">DEFINITION</div>
                  </div>
                </div>

                <div className="qz-card-side">
                  <label className="qz-imagebox" title="Add image">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        updateCard(card.id, { imageFile: e.target.files?.[0] ?? null })
                      }
                      style={{ display: "none" }}
                    />
                    <div className="qz-imagebox-inner">
                      <div className="qz-imagebox-icon" aria-hidden="true">🖼</div>
                      <div className="qz-imagebox-text">Image</div>
                    </div>
                  </label>

                  <div className="qz-card-actions">
                    <button className="qz-iconbtn" type="button" title="Drag" aria-label="Drag">
                      ≡
                    </button>
                    <button
                      className="qz-iconbtn"
                      type="button"
                      title="Delete"
                      aria-label="Delete"
                      onClick={() => removeCard(card.id)}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="qz-addrow">
            <button className="qz-addbtn" type="button" onClick={addCard}>
              + Add card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
