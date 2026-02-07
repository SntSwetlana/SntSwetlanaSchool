import { useEffect, useState } from "react";
import FlipCard from "./FlipCard";
import "./QuizletSetViewer.css";

type ApiCard = {
  id: string;
  term: string;
  explanation: string;
};

type ApiSet = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
};

type LearnQ = {
  idx: number;
  prompt: string;
  correct: string;
  options: string[];
};


export default function QuizletSetViewer({
  setId,
  slug,
  onBack,
  onEdit,
  onDeleted,

}: {
  setId: string;
   slug: string;
  onBack: () => void;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [setInfo, setSetInfo] = useState<ApiSet | null>(null);
  const [cards, setCards] = useState<ApiCard[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [learnQs, setLearnQs] = useState<LearnQ[]>([]);
  const [learnI, setLearnI] = useState(0);
  const [learnPicked, setLearnPicked] = useState<string | null>(null);
  const [learnResult, setLearnResult] = useState<"idle" | "correct" | "wrong">("idle");

  // optional controls
  const [trackProgress, setTrackProgress] = useState(false);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
        const target = e.target as HTMLElement;
        if (!target.closest(".qsv-menubox")) setMenuOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
    }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr("");
      setSetInfo(null);
      setCards([]);
      setIdx(0);
      setFlipped(false);

      try {
        const res = await fetch(`/api/quizlet/sets/${setId}/full`, {
          credentials: "include",
        });

        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(`Load failed: ${res.status} ${t}`);
        }

        const data = await res.json();

        if (cancelled) return;

        setSetInfo(data.set);
        setCards(data.cards ?? []);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setId]);
useEffect(() => {
  if (!cards?.length) return;
  setLearnQs(buildLearnQuestions(cards, 7));
  setLearnI(0);
  setLearnPicked(null);
  setLearnResult("idle");
}, [cards]);

function pickOption(v: string) {
  if (!learnQs.length) return;
  const q = learnQs[learnI];
  setLearnPicked(v);
  setLearnResult(v === q.correct ? "correct" : "wrong");
}

function nextLearn() {
  setLearnPicked(null);
  setLearnResult("idle");
  setLearnI((x) => Math.min(x + 1, learnQs.length - 1));
}

function dontKnow() {
  // показываем правильный ответ
  if (!learnQs.length) return;
  setLearnPicked(null);
  setLearnResult("wrong");
}
    const current = cards[idx];

    function shuffle<T>(arr: T[]) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function buildLearnQuestions(cards: Card[], count = 7): LearnQ[] {
        const usable = cards.filter((c) => c.term?.trim() && c.explanation?.trim());
        const pick = shuffle(usable).slice(0, Math.min(count, usable.length));

        return pick.map((c, i) => {
            const wrong = shuffle(
            usable
                .filter((x) => x.id !== c.id)
                .map((x) => x.term)
            ).slice(0, 3);

            const options = shuffle([c.term, ...wrong]).slice(0, 4);

            return {
            idx: i,
            prompt: c.explanation, // показываем “наличными”
            correct: c.term,
            options,
            };
        });
    }

    const total = cards.length;
    const canPrev = idx > 0;
    const canNext = idx < total - 1;

    async function doExport() {
        const res = await fetch(`/api/quizlet/sets/${setId}/full`, { credentials: "include" });
        if (!res.ok) return;

        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });

        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${data?.set?.slug ?? setId}.json`;
        a.click();
        URL.revokeObjectURL(a.href);

        setMenuOpen(false);
    }

    async function doDelete() {
        if (!confirm("Delete this set? This will delete all cards.")) return;

        const res = await fetch(`/api/quizlet/sets/${setId}`, {
            method: "DELETE",
            credentials: "include",
        });

        if (!res.ok) {
            const t = await res.text().catch(() => "");
            alert(`Delete failed: ${res.status} ${t}`);
            return;
        }

        setMenuOpen(false);
        onDeleted();
    }

    function prev() {
        if (!canPrev) return;
        setIdx((v) => v - 1);
        setFlipped(false);
    }
    function next() {
        if (!canNext) return;
        setIdx((v) => v + 1);
        setFlipped(false);
    }

    // keyboard nav
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
        if (e.key === "ArrowLeft") prev();
        if (e.key === "ArrowRight") next();
        if (e.key === " " || e.key === "Enter") setFlipped((v) => !v);
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idx, total]);

  return (
    <div className="qsv">
      {/* top search */}
      <div className="qsv-top">
        <div className="qsv-top-left">
          <div className="qsv-search">
            <span className="qsv-search-ico" aria-hidden="true">🔎</span>
            <input placeholder="Search for practice tests" />
          </div>
        </div>
      </div>

      {/* header */}
      <div className="qsv-head">
        <button className="qsv-breadcrumb" type="button" onClick={onBack}>
          ← <span>Back</span>
        </button>

        <div className="qsv-head-row">
          <div>
            <div className="qsv-folder">📁 {setInfo?.slug ?? "Set"}</div>
            <h1 className="qsv-title">{setInfo?.title ?? "Loading..."}</h1>
          </div>

          <div className="qsv-actions">
            <button className="qsv-pillbtn" type="button">💾 Saved</button>
            <button className="qsv-iconbtn" type="button" title="Share" aria-label="Share">⤴</button>
            <div className="qsv-menubox">
                <button
                className="qsv-iconbtn"
                type="button"
                title="More"
                aria-label="More"
                onClick={() => setMenuOpen((v) => !v)}
                >
                ⋯
                </button>

                {menuOpen && (
                <div className="qsv-menu" role="menu">
                    <button
                    className="qsv-menuitem"
                    type="button"
                    role="menuitem"
                    onClick={() => {
                        setMenuOpen(false);
                        onEdit();
                    }}
                    >
                    ✏️ Edit
                    </button>

                    <button
                    className="qsv-menuitem"
                    type="button"
                    role="menuitem"
                    onClick={doExport}
                    >
                    ⬇️ Export
                    </button>

                    <div className="qsv-menudiv" />

                    <button
                    className="qsv-menuitem danger"
                    type="button"
                    role="menuitem"
                    onClick={doDelete}
                    >
                    🗑 Delete
                    </button>
                </div>
                )}
            </div>
          </div>
        </div>

        <div className="qsv-cta">
          <button className="qsv-ctabtn" type="button">📡 Start a student pass</button>
          <button className="qsv-ctabtn" type="button">🕒 Assign an activity</button>
        </div>
      </div>

      {/* panels */}
      <div className="qsv-panels">
        <div className="qsv-panel">
          <div className="qsv-panel-title">Games</div>
          <div className="qsv-grid">
            <button className="qsv-tile" type="button">Quizlet Live</button>
            <button className="qsv-tile" type="button">Blast</button>
            <button className="qsv-tile" type="button">Match</button>
            <button className="qsv-tile" type="button">Categories</button>
            <button className="qsv-tile" type="button">Blocks</button>
          </div>
        </div>

        <div className="qsv-panel">
          <div className="qsv-panel-title">In-class review</div>
          <div className="qsv-grid qsv-grid-small">
            <button className="qsv-tile is-active" type="button">Flashcards</button>
            <button className="qsv-tile" type="button">Learn</button>
            <button className="qsv-tile" type="button">Test</button>
          </div>
        </div>
      </div>

      {/* flashcards viewer */}
      <div className="qsv-view">
        {loading && <div className="qsv-muted">Loading…</div>}
        {err && <div className="qsv-error">{err}</div>}

        {!loading && !err && total === 0 && (
          <div className="qsv-muted">No cards in this set.</div>
        )}

        {!loading && !err && current && (
          <>
            <div className="qsv-cardwrap">
              <FlipCard
                flipped={flipped}
                onToggle={() => setFlipped((v) => !v)}
                front={<div className="fc-text">{current.term}</div>}
                back={<div className="fc-text">{current.explanation}</div>}
              />
            </div>

            <div className="qsv-bottom">
              <label className="qsv-track">
                <span>Track progress</span>
                <input
                  type="checkbox"
                  checked={trackProgress}
                  onChange={(e) => setTrackProgress(e.target.checked)}
                />
              </label>

              <div className="qsv-nav">
                <button className="qsv-navbtn" disabled={!canPrev} onClick={prev} type="button">
                  ←
                </button>
                <div className="qsv-count">
                  {idx + 1} / {total}
                </div>
                <button className="qsv-navbtn" disabled={!canNext} onClick={next} type="button">
                  →
                </button>
              </div>

              <div className="qsv-tools">
                <button className="qsv-iconbtn" type="button" title="Play" aria-label="Play">▶</button>
                <button className="qsv-iconbtn" type="button" title="Shuffle" aria-label="Shuffle">⟲</button>
                <button className="qsv-iconbtn" type="button" title="Settings" aria-label="Settings">⚙</button>
                <button className="qsv-iconbtn" type="button" title="Fullscreen" aria-label="Fullscreen">⤢</button>
              </div>
            </div>
          </>
        )}
      </div>
      {/* Progress tracker */}
      <div className="qsv-tracker-wrap" aria-label="Progress">
        <div className="qsv-progress" role="progressbar"
            aria-valuemin={1}
            aria-valuemax={total}
            aria-valuenow={idx + 1}
            aria-valuetext={`${idx + 1} of ${total}`}>
            <div
            className="qsv-slider"
            style={{ width: `${total ? ((idx + 1) / total) * 100 : 0}%` }}
            />
        </div>
    </div>
    {/* Created by */}
    <div className="qsv-createdby">
        <div className="qsv-createdby-avatar" aria-hidden="true">🌈</div>
        <div className="qsv-createdby-meta">
        <div className="qsv-createdby-top">
            <div className="qsv-muted">Created by</div>
        </div>
        <div className="qsv-createdby-name">
            <span className="qsv-owner">SntSwetlana</span>
            <span className="qsv-pill">Teacher</span>
        </div>
        <div className="qsv-muted">Created 11 months ago</div>
        </div>
    </div>
      {/* Students also studied */}
  <div className="qsv-section">
    <div className="qsv-section-h">Students also studied</div>

    <div className="qsv-carousel">
      <button className="qsv-carousel-nav" type="button" aria-label="Prev">‹</button>

      <div className="qsv-carousel-track">
        {/* “related sets” */}
        {/* relatedSets.map((s) => (
          <div className="qsv-related" key={s.id}>
            <div className="qsv-related-title">{s.title}</div>

            <div className="qsv-related-badges">
              <span className="qsv-pill">Teacher</span>
              <span className="qsv-pill ghost">{s.cards_count} terms</span>
            </div>

            <div className="qsv-related-bottom">
              <div className="qsv-related-owner">
                <span className="qsv-createdby-avatar" aria-hidden="true">🌈</span>
                <span>SntSwetlana</span>
              </div>
              <button className="qsv-btn-soft" type="button">Preview</button>
            </div>
          </div>
        ))*/}
      </div>

      <button className="qsv-carousel-nav" type="button" aria-label="Next">›</button>
    </div>
  </div>

  {/* Practice questions */}
  <div className="qsv-section">
    <div className="qsv-section-h">Practice questions for this set</div>

    <div className="qsv-practice">
      <div className="qsv-practice-head">
        <div className="qsv-practice-left">
          <div className="qsv-practice-ico" aria-hidden="true">🌀</div>
          <div className="qsv-practice-title">Learn</div>
        </div>
        <div className="qsv-practice-mid">
          {learnQs.length ? `${learnI + 1} / ${learnQs.length}` : "—"}
        </div>
        <div className="qsv-practice-right">
          <span className="qsv-muted">Study using Learn</span>
        </div>
      </div>

      <div className="qsv-practice-body">
        <div className="qsv-practice-prompt">
          {learnQs.length ? learnQs[learnI].prompt : "No questions"}
        </div>

        <div className="qsv-practice-sub">Choose an answer</div>

        <div className="qsv-answers">
          {learnQs.length &&
            learnQs[learnI].options.map((opt, i) => {
              const picked = learnPicked === opt;
              const correct = learnQs[learnI].correct === opt;

              let cls = "qsv-answer";
              if (learnResult !== "idle") {
                if (picked && correct) cls += " is-correct";
                else if (picked && !correct) cls += " is-wrong";
                else if (correct) cls += " is-correct-hint";
              }

              return (
                <button
                  key={opt}
                  className={cls}
                  type="button"
                  onClick={() => pickOption(opt)}
                  disabled={learnResult !== "idle"}
                >
                  <span className="qsv-answer-num">{i + 1}</span>
                  <span className="qsv-answer-text">{opt}</span>
                </button>
              );
            })}
        </div>

        <div className="qsv-practice-foot">
          <button className="qsv-linkbtn" type="button" onClick={dontKnow}>
            Don&apos;t know?
          </button>

          {learnResult !== "idle" && (
            <button className="qsv-btn-primary" type="button" onClick={nextLearn}>
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  </div>

  {/* Terms in this set */}
  <div className="qsv-section">
    <div className="qsv-section-row">
      <div className="qsv-section-h">Terms in this set ({cards.length})</div>
      <button className="qsv-linkbtn" type="button">Your stats ▾</button>
    </div>

    <div className="qsv-terms">
      {cards.map((c) => (
        <div className="qsv-termrow" key={c.id}>
          <div className="qsv-term">{c.term}</div>
          <div className="qsv-def">{c.explanation}</div>
        </div>
      ))}
        </div>
      </div>
    </div>
  );
}
