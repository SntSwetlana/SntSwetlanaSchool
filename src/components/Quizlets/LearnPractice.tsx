import React, { useEffect, useMemo, useState } from "react";
import type { MatchCard } from "./MatchGame";
import "./LearnPractice.css";

type LearnQ = {
  idx: number;
  prompt: string;   // definition
  correct: string;  // term
  options: string[];
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildLearnQuestions(cards: MatchCard[], count = 16): LearnQ[] {
  const usable = cards.filter((c) => c.term?.trim() && c.explanation?.trim());
  if (!usable.length) return [];
  const pick = shuffle(usable).slice(0, Math.min(count, usable.length));

  return pick.map((c, i) => {
    const wrongPool = usable.filter((x) => x.id !== c.id).map((x) => x.term);
    const wrong = shuffle(wrongPool).slice(0, 3);
    const options = shuffle([c.term, ...wrong]).slice(0, 4);
    return { idx: i, prompt: c.explanation, correct: c.term, options };
  });
}

/** collapse whitespace and trim */
function normalizeSpaces(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/** remove anything in (...) including parentheses; also collapse spaces */
function stripParenContent(s: string): string {
  return normalizeSpaces(s.replace(/\([^)]*\)/g, " "));
}

/** canonical form for comparison: lower + no bracket content + normalized spaces */
function canonAnswer(s: string): string {
  return stripParenContent(s).toLowerCase();
}

function playOkSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const o1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    o1.type = "sine";
    o1.frequency.setValueAtTime(880, now);
    g1.gain.setValueAtTime(0.0001, now);
    g1.gain.exponentialRampToValueAtTime(0.18, now + 0.01);
    g1.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    o1.connect(g1).connect(ctx.destination);
    o1.start(now);
    o1.stop(now + 0.13);

    const o2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    o2.type = "sine";
    o2.frequency.setValueAtTime(1175, now + 0.06);
    g2.gain.setValueAtTime(0.0001, now + 0.06);
    g2.gain.exponentialRampToValueAtTime(0.12, now + 0.07);
    g2.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    o2.connect(g2).connect(ctx.destination);
    o2.start(now + 0.06);
    o2.stop(now + 0.17);

    setTimeout(() => ctx.close().catch(() => {}), 220);
  } catch {
    // no-op
  }
}

function speakText(text: string, lang = "en-US", rate = 1) {
  try {
    const s = window.speechSynthesis;
    if (!s) return;

    const t = text?.trim();
    if (!t) return;

    s.cancel();

    const u = new SpeechSynthesisUtterance(t);
    u.lang = lang;
    u.rate = rate;

    const voices = s.getVoices?.() ?? [];
    const v =
      voices.find((x) => x.lang === lang) ||
      voices.find((x) => x.lang?.startsWith(lang.split("-")[0]));
    if (v) u.voice = v;

    s.speak(u);
  } catch {
    // no-op
  }
}

export default function LearnPractice({
  userId,
  setId,
  cards,
  onClose,
}: {
  userId: string;
  setId: string;
  cards: MatchCard[];
  onClose: () => void;
}) {
  const learnQs = useMemo(() => buildLearnQuestions(cards, 16), [cards]);
  const total = learnQs.length;

  const FIRST_MCQ = 8; // после 8 включаем ввод

  const [i, setI] = useState(0);

  // mcq state
  const [picked, setPicked] = useState<string | null>(null);

  // input state
  const [typed, setTyped] = useState("");
  const [showHint, setShowHint] = useState(false);

  const [result, setResult] = useState<"idle" | "correct" | "wrong">("idle");

  useEffect(() => {
    setI(0);
    setPicked(null);
    setTyped("");
    setShowHint(false);
    setResult("idle");
  }, [userId, setId, cards]);

  useEffect(() => {
    try {
      window.speechSynthesis?.getVoices?.();
    } catch {}
  }, []);

  const done = total > 0 && i >= total;
  const q = done ? null : learnQs[i];
  const isInputMode = !done && i >= FIRST_MCQ;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();

      if (e.key === "Enter") {
        if (done) return;

        if (result === "idle") {
          if (isInputMode) submitTyped();
        } else {
          next();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, result, typed, i, total, done, isInputMode]);

  const correctForHint = q ? stripParenContent(q.correct) : "";

  const pickOption = (v: string) => {
    if (!q) return;
    if (result !== "idle") return;

    const ok = v === q.correct;
    setPicked(v);
    setResult(ok ? "correct" : "wrong");

    if (ok) {
      playOkSound();
      speakText(v, "en-US", 1);
    }
  };

  const submitTyped = () => {
    if (!q) return;
    if (result !== "idle") return;

    const user = canonAnswer(typed);
    const right = canonAnswer(q.correct);

    const ok = !!user && user === right;
    setResult(ok ? "correct" : "wrong");

    if (ok) {
      playOkSound();
      speakText(stripParenContent(q.correct), "en-US", 1);
    }
  };

  const dontKnow = () => {
    if (!q) return;
    if (result !== "idle") return;

    setPicked(null);
    setResult("wrong");
  };

  const next = () => {
    if (!q) return;
    if (result === "idle") return;

    const wasCorrect = result === "correct";

    setPicked(null);
    setTyped("");
    setShowHint(false);
    setResult("idle");

    // прогресс только за correct
    if (wasCorrect) {
      setI((x) => x + 1);
    }
  };

  // прогресс до 100% (когда i === total)
  const progressPct = total ? (Math.min(i, total) / total) * 100 : 0;

  return (
    <div className="qlp">
      {/* topbar */}
      <div className="qlp-top">
        <div className="qlp-top-left">
          <div className="qlp-brand" aria-hidden="true">
            <span className="qlp-brand-dot" />
          </div>
          <button className="qlp-mode" type="button">
            Learn <span className="qlp-caret">▾</span>
          </button>
        </div>

        <div className="qlp-top-right">
          <button className="qlp-icon" type="button" aria-label="Settings" title="Settings">
            ⚙
          </button>
          <button className="qlp-icon" type="button" aria-label="Close" title="Close" onClick={onClose}>
            ✕
          </button>
        </div>
      </div>

      {/* progress */}
      <div className="qlp-progressWrap" aria-label="Progress">
        <div className="qlp-progress">
          <div className={"qlp-badge " + (i === 0 ? "is-active" : "")}>0</div>

          <div className="qlp-bars" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPct}>
            <div className="qlp-barsFill" style={{ width: `${progressPct}%` }} />
          </div>

          <div className={"qlp-badge " + (done ? "is-active" : "")}>{total || 0}</div>
        </div>
      </div>

      {/* main card */}
      <div className="qlp-stage">
        <div className="qlp-card">
          {total === 0 ? (
            <div className="qlp-definition">No questions</div>
          ) : done ? (
            <>
              <div className="qlp-sectionHead">
                <div className="qlp-label">Finished</div>
              </div>

              <div className="qlp-definition">Nice work! You completed this Learn session.</div>

              <div className="qlp-foot">
                <button className="qlp-next" type="button" onClick={onClose}>
                  Close
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Definition header */}
              <div className="qlp-sectionHead">
                <div className="qlp-label">Definition</div>
                <button className="qlp-audio" type="button" aria-label="Play audio" title="Play audio">
                  🔈
                </button>
              </div>

              <div className="qlp-definition">{q ? q.prompt : ""}</div>

              <div className="qlp-divider" />

              {/* mode switch */}
              {!isInputMode ? (
                <>
                  <div className="qlp-label2">Choose an answer</div>

                  <div className="qlp-opts">
                    {q?.options?.map((opt, idx) => {
                      const isPicked = picked === opt;
                      const isCorrect = q!.correct === opt;

                      let cls = "qlp-opt";
                      if (result !== "idle") {
                        if (isPicked && isCorrect) cls += " is-correct";
                        else if (isPicked && !isCorrect) cls += " is-wrong";
                        else if (isCorrect) cls += " is-correct-hint";
                      }

                      return (
                        <button
                          key={opt}
                          className={cls}
                          type="button"
                          onClick={() => pickOption(opt)}
                          disabled={result !== "idle"}
                        >
                          <span className="qlp-num">{idx + 1}</span>
                          <span className="qlp-text">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="qlp-foot">
                    <button className="qlp-dk" type="button" onClick={dontKnow} disabled={result !== "idle"}>
                      Don&apos;t know?
                    </button>

                    {result !== "idle" && (
                      <button className="qlp-next" type="button" onClick={next}>
                        {result === "correct" ? "Next" : "Try again"}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="qlp-label2">Your answer</div>

                  <input
                    className="qlp-input"
                    value={typed}
                    onChange={(e) => setTyped(e.target.value)}
                    placeholder="Type the answer in English"
                    autoFocus
                    disabled={result !== "idle"}
                  />

                  <div className="qlp-footInput">
                    <button
                      className="qlp-hintBtn"
                      type="button"
                      onClick={() => setShowHint(true)}
                      disabled={result !== "idle"}
                    >
                      Show hint
                    </button>

                    <div className="qlp-footRight">
                      <button className="qlp-dk" type="button" onClick={dontKnow} disabled={result !== "idle"}>
                        Don&apos;t know?
                      </button>

                      <button
                        className={"qlp-answerBtn " + (typed.trim() ? "" : "is-disabled")}
                        type="button"
                        onClick={() => (result === "idle" ? submitTyped() : next())}
                        disabled={!typed.trim() && result === "idle"}
                      >
                        {result === "idle" ? "Answer" : result === "correct" ? "Next" : "Try again"}
                      </button>
                    </div>
                  </div>

                  {showHint && (
                    <div className="qlp-hintLine">
                      Hint: <span className="qlp-hintWord">{correctForHint}</span>
                    </div>
                  )}

                  {result !== "idle" && (
                    <div className={"qlp-feedback " + (result === "correct" ? "is-ok" : "is-bad")}>
                      {result === "correct" ? (
                        <>Correct ✅</>
                      ) : (
                        <>
                          Not quite. Correct answer: <b>{correctForHint}</b>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          <div className="qlp-debug">
            mode: {done ? "done" : isInputMode ? "input" : "mcq"} • i: {i} / {total}
          </div>
        </div>
      </div>
    </div>
  );
}