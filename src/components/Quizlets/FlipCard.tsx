import React from "react";
import "./FlipCard.css";

export default function FlipCard({
  front,
  back,
  flipped,
  onToggle,
  speakTerm,
  speakExplanation,
  speakLangTerm = "en-US",
  speakLangExplanation = "ru-RU",
}: {
  front: React.ReactNode;
  back: React.ReactNode;
  flipped: boolean;
  onToggle: () => void;
  speakTerm?: string;
  speakExplanation?: string;
  speakLangTerm?: string;
  speakLangExplanation?: string;
}) {
  const pickVoice = React.useCallback((lang: string) => {
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find((v) => v.lang === lang) ||
      voices.find((v) => v.lang?.startsWith(lang.split("-")[0])) ||
      null
    );
  }, []);

  const speakText = React.useCallback(
    (text: string | undefined, lang: string) => {
      const t = (text ?? "").trim();
      if (!t) return;

      window.speechSynthesis.cancel();

      const u = new SpeechSynthesisUtterance(t);
      u.lang = lang;
      u.rate = 1;
      u.pitch = 1;
      u.volume = 1;

      const voice = pickVoice(lang);
      if (voice) u.voice = voice;

      window.speechSynthesis.speak(u);
    },
    [pickVoice]
  );

  // warm up voices
  React.useEffect(() => {
    const handler = () => {
      pickVoice(speakLangTerm);
      pickVoice(speakLangExplanation);
    };
    window.speechSynthesis.onvoiceschanged = handler;
    handler();
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [pickVoice, speakLangTerm, speakLangExplanation]);

  const toggleTimerRef = React.useRef<number | null>(null);
  const isProcessingRef = React.useRef(false);

  const speakThenToggle = React.useCallback((e?: React.UIEvent) => {
    // Предотвращаем множественные вызовы
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    // Берем текст ДО переворота
    const textToSpeak = flipped ? speakExplanation : speakTerm;
    const langToUse = flipped ? speakLangExplanation : speakLangTerm;

    // Озвучиваем
    if (textToSpeak?.trim()) {
      speakText(textToSpeak, langToUse);
    }

    // Переворачиваем
    if (toggleTimerRef.current) window.clearTimeout(toggleTimerRef.current);
    toggleTimerRef.current = window.setTimeout(() => {
      onToggle();
      toggleTimerRef.current = null;
      
      // Сбрасываем флаг обработки через небольшую задержку
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 100);
    }, 120);
  }, [flipped, speakExplanation, speakTerm, speakLangExplanation, speakLangTerm, speakText, onToggle]);

  // Очистка таймеров
  React.useEffect(() => {
    return () => {
      if (toggleTimerRef.current) {
        window.clearTimeout(toggleTimerRef.current);
      }
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.currentTarget !== e.target) return;
    
    if (e.code === "Space" || e.code === "Enter") {
      e.preventDefault();
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.currentTarget !== e.target) return;
    
    if (e.code === "Space" || e.code === "Enter") {
      e.preventDefault();
      speakThenToggle();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Игнорируем клики на внутренних кнопках
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    
    // Обычный клик мышью
    speakThenToggle();
  };

  return (
    <div
      className="fc"
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    >
      <div className={`fc-inner ${flipped ? "is-flipped" : ""}`}>
        <div className="fc-face fc-front">
          {front}

          <div>
            <div className="fc-hint-left">Get a hint</div>

            <button
              type="button"
              className="fc-hint-right"
              aria-label="Play pronunciation"
              title="Play pronunciation"
              onClick={(e) => {
                e.stopPropagation();
                // Озвучиваем текущую сторону без переворота
                const text = flipped ? speakExplanation : speakTerm;
                const lang = flipped ? speakLangExplanation : speakLangTerm;
                speakText(text, lang);
                // Возвращаем фокус на карточку
                (e.currentTarget.closest('[role="button"].fc') as HTMLElement)?.focus();
              }}
              onKeyDown={(e) => e.stopPropagation()}
              onKeyUp={(e) => e.stopPropagation()}
              disabled={!((flipped ? speakExplanation : speakTerm)?.trim())}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#1f1f1f"
              >
                <path d="M560-131v-82q90-26 145-100t55-168q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 127-78 224.5T560-131ZM120-360v-240h160l200-200v640L280-360H120Zm440 40v-322q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320ZM400-606l-86 86H200v80h114l86 86v-252ZM300-480Z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="fc-face fc-back">
          {back}

          <div>
            <button
              type="button"
              className="fc-hint-right"
              aria-label="Play pronunciation"
              title="Play pronunciation"
              onClick={(e) => {
                e.stopPropagation();
                const text = flipped ? speakExplanation : speakTerm;
                const lang = flipped ? speakLangExplanation : speakLangTerm;
                speakText(text, lang);
                (e.currentTarget.closest('[role="button"].fc') as HTMLElement)?.focus();
              }}
              onKeyDown={(e) => e.stopPropagation()}
              onKeyUp={(e) => e.stopPropagation()}
              disabled={!((flipped ? speakExplanation : speakTerm)?.trim())}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#1f1f1f"
              >
                <path d="M560-131v-82q90-26 145-100t55-168q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 127-78 224.5T560-131ZM120-360v-240h160l200-200v640L280-360H120Zm440 40v-322q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320ZM400-606l-86 86H200v80h114l86 86v-252ZM300-480Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}