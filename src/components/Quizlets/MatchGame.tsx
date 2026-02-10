import React from "react";
import "./MatchGame.css";

export type MatchCard = {
  id: string;
  term: string;
  explanation: string;
};

type Tile = {
  id: string; // `${cardId}:t|d`
  cardId: string;
  side: "term" | "def";
  text: string;
};

type CardStats = {
  seen: boolean;
  wrong: number;
  correct: number;
  streak: number; // подряд correct
  lastSeenAt?: string;
};

type MatchProgress = {
  completedCardIds: string[];
  statsByCard: Record<string, CardStats>;
  bestTimeMs?: number; // best time per batch
  updatedAt: string;
};

const LEARN_STREAK = 2; // карточка считается выученной после N подряд correct
const DEFAULT_ROUND_SIZE = 6;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sampleN<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, Math.min(n, arr.length));
}

function storageKey(userId: string, setId: string) {
  return `match_progress:${userId}:${setId}`;
}

function ensureStats(progress: MatchProgress, cardIds: string[]) {
  const next = { ...(progress.statsByCard ?? {}) };
  for (const id of cardIds) {
    if (!next[id]) {
      next[id] = { seen: false, wrong: 0, correct: 0, streak: 0 };
    } else {
      // на всякий случай, если старые записи без streak
      next[id] = {
        seen: !!next[id].seen,
        wrong: Number(next[id].wrong ?? 0),
        correct: Number(next[id].correct ?? 0),
        streak: Number(next[id].streak ?? 0),
        lastSeenAt: next[id].lastSeenAt,
      };
    }
  }
  return next;
}

function loadProgress(userId: string, setId: string): MatchProgress {
  const raw = localStorage.getItem(storageKey(userId, setId));
  if (!raw) {
    return { completedCardIds: [], statsByCard: {}, bestTimeMs: undefined, updatedAt: new Date().toISOString() };
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      completedCardIds: Array.isArray(parsed?.completedCardIds) ? parsed.completedCardIds : [],
      statsByCard: parsed?.statsByCard && typeof parsed.statsByCard === "object" ? parsed.statsByCard : {},
      bestTimeMs: typeof parsed?.bestTimeMs === "number" ? parsed.bestTimeMs : undefined,
      updatedAt: typeof parsed?.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return { completedCardIds: [], statsByCard: {}, bestTimeMs: undefined, updatedAt: new Date().toISOString() };
  }
}

function saveProgress(userId: string, setId: string, p: MatchProgress) {
  localStorage.setItem(storageKey(userId, setId), JSON.stringify(p));
}

function resetProgress(userId: string, setId: string) {
  localStorage.removeItem(storageKey(userId, setId));
}

function makeTiles(cards: MatchCard[]): Tile[] {
  const tiles: Tile[] = [];
  for (const c of cards) {
    tiles.push({ id: `${c.id}:t`, cardId: c.id, side: "term", text: c.term });
    tiles.push({ id: `${c.id}:d`, cardId: c.id, side: "def", text: c.explanation });
  }
  return shuffle(tiles);
}

/**
 * Выбор батча:
 *  1) ошибочные (wrong > 0) и не выученные
 *  2) новые (seen=false) и не выученные
 *  3) остальные не выученные
 * Если не хватает — добираем из всех (чтобы игра не стопорилась)
 */
function pickNextBatch(all: MatchCard[], progress: MatchProgress, roundSize: number): MatchCard[] {
  if (!all.length) return [];
  const completed = new Set(progress.completedCardIds ?? []);
  const statsByCard = ensureStats(progress, all.map((c) => c.id));

  const notCompleted = all.filter((c) => !completed.has(c.id));

  const mistakes = notCompleted.filter((c) => (statsByCard[c.id]?.wrong ?? 0) > 0);
  const newOnes = notCompleted.filter((c) => !(statsByCard[c.id]?.seen ?? false));
  const rest = notCompleted.filter(
    (c) => !mistakes.some((m) => m.id === c.id) && !newOnes.some((n) => n.id === c.id)
  );

  const picked: MatchCard[] = [];

  for (const c of shuffle(mistakes)) {
    if (picked.length >= roundSize) break;
    picked.push(c);
  }
  for (const c of shuffle(newOnes)) {
    if (picked.length >= roundSize) break;
    if (!picked.some((p) => p.id === c.id)) picked.push(c);
  }
  for (const c of shuffle(rest)) {
    if (picked.length >= roundSize) break;
    if (!picked.some((p) => p.id === c.id)) picked.push(c);
  }

  if (picked.length < roundSize) {
    const need = roundSize - picked.length;
    const pool = all.filter((c) => !picked.some((p) => p.id === c.id));
    picked.push(...sampleN(pool, need));
  }

  return picked.slice(0, Math.min(roundSize, all.length));
}

function formatSeconds(ms: number) {
  return (ms / 1000).toFixed(1); // 649.9
}

export default function MatchGame({
  userId,
  setId,
  cards,
  onClose,
  roundSize = DEFAULT_ROUND_SIZE,
}: {
  userId: string;
  setId: string;
  cards: MatchCard[];
  onClose: () => void;
  roundSize?: number;
}) {
  // ---- progress ----
  const [progress, setProgress] = React.useState<MatchProgress>(() => {
    const p = loadProgress(userId, setId);
    return { ...p, statsByCard: ensureStats(p, cards.map((c) => c.id)) };
  });

  // если cards пришли позже (async) — добросим stats
  React.useEffect(() => {
    setProgress((p) => {
      const next = { ...p, statsByCard: ensureStats(p, cards.map((c) => c.id)) };
      saveProgress(userId, setId, next);
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards.length]);

  const completed = React.useMemo(() => new Set(progress.completedCardIds), [progress.completedCardIds]);
  const statsByCard = React.useMemo(() => ensureStats(progress, cards.map((c) => c.id)), [progress, cards]);

  // ---- batch state ----
  const [batchCards, setBatchCards] = React.useState<MatchCard[]>([]);
  const [tiles, setTiles] = React.useState<Tile[]>([]);
  const [batchTileCount, setBatchTileCount] = React.useState(0);

  const [picked, setPicked] = React.useState<Tile[]>([]);
  const [solvedTileIds, setSolvedTileIds] = React.useState<Set<string>>(new Set());
  const [lock, setLock] = React.useState(false);

  const [showCongrats, setShowCongrats] = React.useState(false);

  // ---- timer ----
  const [startTs, setStartTs] = React.useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = React.useState(0);
  const elapsedRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);
  const pausedRef = React.useRef(false);

  React.useEffect(() => {
    elapsedRef.current = elapsedMs;
  }, [elapsedMs]);

  React.useEffect(() => {
    if (startTs === null) return;

    function tick(now: number) {
      if (!pausedRef.current) {
        const ms = now - startTs;
        setElapsedMs(ms);
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [startTs]);

  // ---- derived counters ----
  const learnedCount = React.useMemo(
    () => cards.filter((c) => completed.has(c.id)).length,
    [cards, completed]
  );

  const remainingCount = React.useMemo(
    () => cards.filter((c) => !completed.has(c.id)).length,
    [cards, completed]
  );

  const mistakesCount = React.useMemo(() => {
    return cards.filter(
      (c) => !completed.has(c.id) && (statsByCard[c.id]?.wrong ?? 0) > 0
    ).length;
  }, [cards, completed, statsByCard]);

  const totalWrong = React.useMemo(
    () => cards.reduce((sum, c) => sum + (statsByCard[c.id]?.wrong ?? 0), 0),
    [cards, statsByCard]
  );

  const hardestCards = React.useMemo(() => {
    return cards
      .map((c) => ({ ...c, wrong: statsByCard[c.id]?.wrong ?? 0 }))
      .filter((c) => c.wrong > 0)
      .sort((a, b) => b.wrong - a.wrong)
      .slice(0, 5);
  }, [cards, statsByCard]);

  // ---- helpers: start batch from a given progress (важно для reset / continue) ----
  const startBatchFromProgress = React.useCallback(
    (nextProgressBase: MatchProgress) => {
      if (!cards.length) return;

      const statsEnsured = ensureStats(nextProgressBase, cards.map((c) => c.id));
      const nextProgress: MatchProgress = { ...nextProgressBase, statsByCard: statsEnsured };

      const nextBatch = pickNextBatch(cards, nextProgress, roundSize);

      const nowIso = new Date().toISOString();
      const nextStats = { ...statsEnsured };
      for (const c of nextBatch) {
        nextStats[c.id] = {
          ...(nextStats[c.id] ?? { seen: false, wrong: 0, correct: 0, streak: 0 }),
          seen: true,
          lastSeenAt: nowIso,
        };
      }

      const finalProgress: MatchProgress = {
        ...nextProgress,
        statsByCard: nextStats,
        updatedAt: nowIso,
      };

      setProgress(finalProgress);
      saveProgress(userId, setId, finalProgress);

      const nextTiles = makeTiles(nextBatch);
      setBatchCards(nextBatch);
      setTiles(nextTiles);
      setBatchTileCount(nextTiles.length);

      setSolvedTileIds(new Set());
      setPicked([]);
      setLock(false);
      setShowCongrats(false);

      // timer restart
      setElapsedMs(0);
      pausedRef.current = false;
      setStartTs(performance.now());
    },
    [cards, roundSize, userId, setId]
  );

  const startBatch = React.useCallback(() => {
    startBatchFromProgress(progress);
  }, [startBatchFromProgress, progress]);

  // старт при первом рендере
  React.useEffect(() => {
    if (!cards.length) return;
    startBatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards.length]);

  // ---- reset ----
  function handleResetProgress() {
    const fresh: MatchProgress = {
      completedCardIds: [],
      statsByCard: {},
      bestTimeMs: undefined,
      updatedAt: new Date().toISOString(),
    };
    resetProgress(userId, setId);
    startBatchFromProgress(fresh);
  }

  // ---- progress updates ----
  function markWrong(cardId: string) {
    const nowIso = new Date().toISOString();
    setProgress((prev) => {
      const ensured = ensureStats(prev, cards.map((c) => c.id));
      const cur = ensured[cardId] ?? { seen: true, wrong: 0, correct: 0, streak: 0 };

      const next: MatchProgress = {
        ...prev,
        statsByCard: {
          ...ensured,
          [cardId]: {
            ...cur,
            seen: true,
            wrong: cur.wrong + 1,
            streak: 0, // промах сбивает стрик
            lastSeenAt: nowIso,
          },
        },
        updatedAt: nowIso,
      };
      saveProgress(userId, setId, next);
      return next;
    });
  }

  function markCorrect(cardId: string) {
    const nowIso = new Date().toISOString();
    setProgress((prev) => {
      const ensured = ensureStats(prev, cards.map((c) => c.id));
      const cur = ensured[cardId] ?? { seen: true, wrong: 0, correct: 0, streak: 0 };
      const nextStreak = cur.streak + 1;

      const isLearnedNow = nextStreak >= LEARN_STREAK;
      const alreadyLearned = prev.completedCardIds.includes(cardId);
      const nextCompleted = isLearnedNow && !alreadyLearned ? [...prev.completedCardIds, cardId] : prev.completedCardIds;

      const next: MatchProgress = {
        ...prev,
        completedCardIds: nextCompleted,
        statsByCard: {
          ...ensured,
          [cardId]: {
            ...cur,
            seen: true,
            correct: cur.correct + 1,
            streak: nextStreak,
            lastSeenAt: nowIso,
          },
        },
        updatedAt: nowIso,
      };
      saveProgress(userId, setId, next);
      return next;
    });
  }

  // ---- click tile ----
  function pickTile(tile: Tile) {
    if (lock) return;
    if (picked.some((p) => p.id === tile.id)) return;
    if (picked.length === 2) return;

    const nextPicked = [...picked, tile];
    setPicked(nextPicked);

    if (nextPicked.length !== 2) return;

    const [a, b] = nextPicked;
    const isMatch = a.cardId === b.cardId && a.side !== b.side;

    setLock(true);

    window.setTimeout(() => {
      if (isMatch) {
        markCorrect(a.cardId);

        setSolvedTileIds((prev) => {
          const next = new Set(prev);
          next.add(a.id);
          next.add(b.id);

          const solvedCount = next.size;

          // батч завершён = все плитки скрыты
          if (batchTileCount > 0 && solvedCount === batchTileCount) {
            pausedRef.current = true;

            // best time per batch
            const t = elapsedRef.current;
            setProgress((p) => {
              const best = p.bestTimeMs == null ? t : Math.min(p.bestTimeMs, t);
              const nextP: MatchProgress = { ...p, bestTimeMs: best, updatedAt: new Date().toISOString() };
              saveProgress(userId, setId, nextP);
              return nextP;
            });

            setShowCongrats(true);
          }

          return next;
        });

        setPicked([]);
        setLock(false);
      } else {
        // промах — обе карточки получают wrong (и streak сбивается)
        markWrong(a.cardId);
        markWrong(b.cardId);

        setPicked([]);
        setLock(false);
      }
    }, 250);
  }

  // ---- tiles to render ----
  const visibleTiles = React.useMemo(() => tiles.filter((t) => !solvedTileIds.has(t.id)), [tiles, solvedTileIds]);
  const tilesLeft = visibleTiles.length;

  return (
    <div className="mg">
      <div className="mg-top">
        <div className="mg-left">
          <button className="mg-btn" type="button" onClick={onClose} title="Close">
            ✕
          </button>
          <div className="mg-title">Match</div>

          <div className="mg-meta">
            Learned: <b>{learnedCount}</b> • Remaining: <b>{remainingCount}</b> • Mistakes: <b>{mistakesCount}</b>
          </div>
        </div>

        {progress.bestTimeMs != null && (
          <div className="mg-best">Best: {formatSeconds(progress.bestTimeMs)}</div>
        )}

        <div className="mg-title">
          <span className="mg-timer">{formatSeconds(elapsedMs)}</span>
        </div>

        <div className="mg-right">
          <button className="mg-btn" type="button" onClick={handleResetProgress}>
            Reset progress
          </button>
        </div>
      </div>

      {/* progress bar */}
      <div className="mg-progress" aria-label="Progress">
        <div
          className="mg-progressbar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={cards.length}
          aria-valuenow={learnedCount}
          aria-valuetext={`${learnedCount} learned out of ${cards.length}`}
        >
          <div
            className="mg-progressfill"
            style={{ width: `${cards.length ? (learnedCount / cards.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="mg-sub">
        Current batch: <b>{batchCards.length}</b> pairs • Tiles left: <b>{tilesLeft/2}</b>
        {totalWrong > 0 ? (
          <span style={{ marginLeft: 12 }}>• Total wrong: <b>{totalWrong}</b></span>
        ) : null}
      </div>

      <div className="mg-grid">
        {tiles.map((t) => {
          const isPicked = picked.some((p) => p.id === t.id);
          const isSolved = solvedTileIds.has(t.id);

          return (
            <button
              key={t.id}
              className={`mg-tile ${isPicked ? "is-picked" : ""} ${isSolved ? "is-solved" : ""}`}
              type="button"
              onClick={() => pickTile(t)}
              disabled={lock || isSolved}
              aria-hidden={isSolved ? "true" : "false"}
            >
              {isSolved ? "" : t.text}
            </button>
          );
        })}
      </div>

      {/* optional: mini stats */}
      {hardestCards.length > 0 && (
        <div className="mg-sub" style={{ opacity: 0.85 }}>
          Hardest:{" "}
          {hardestCards.map((c) => (
            <span key={c.id} style={{ marginRight: 10 }}>
              <b>{c.term}</b> ({c.wrong})
            </span>
          ))}
        </div>
      )}

      {/* Congrats modal */}
      {showCongrats && (
        <div className="mg-modalOverlay" role="presentation">
          <div className="mg-modal" role="dialog" aria-modal="true" aria-label="Batch completed">
            <div className="mg-modalHeader">
              <div className="mg-modalTitle">🎉 Nice! Batch completed</div>
            </div>

            <div className="mg-modalBody">
              <div className="mg-modalText">You cleared all pairs in this batch.</div>
              <div className="mg-modalText">
                Time: <b>{formatSeconds(elapsedRef.current)}</b> • Learned: <b>{learnedCount}</b> / {cards.length} • Remaining:{" "}
                <b>{remainingCount}</b>
              </div>
              <div className="mg-modalText" style={{ opacity: 0.85 }}>
                Learn rule: card becomes learned after <b>{LEARN_STREAK}</b> correct in a row.
              </div>
            </div>

            <div className="mg-modalFooter">
              <button className="mg-btn" type="button" onClick={onClose}>
                Stop
              </button>
              <button
                className="mg-btn mg-btn-primary"
                type="button"
                onClick={() => {
                  setShowCongrats(false);
                  startBatch();
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
