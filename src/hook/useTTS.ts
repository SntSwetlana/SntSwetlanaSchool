import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type TTSOptions = {
  lang?: string;          // например "ru-RU" или "en-US"
  rate?: number;          // 0.1..10 (обычно 0.8..1.2)
  pitch?: number;         // 0..2
  volume?: number;        // 0..1
  voiceNameIncludes?: string; // например "Google" или "Russian"
};

export function useTTS(opts: TTSOptions = {}) {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const speakingRef = useRef(false);

  const {
    lang = "ru-RU",
    rate = 1,
    pitch = 1,
    volume = 1,
    voiceNameIncludes,
  } = opts;

  useEffect(() => {
    if (!supported) return;

    const synth = window.speechSynthesis;

    const load = () => {
      const v = synth.getVoices();
      setVoices(v);
    };

    load();
    // В некоторых браузерах голоса приходят асинхронно
    synth.onvoiceschanged = load;

    return () => {
      synth.onvoiceschanged = null;
    };
  }, [supported]);

  const voice = useMemo(() => {
    if (!voices.length) return undefined;

    // 1) по языку
    let candidates = voices.filter(v => (v.lang || "").toLowerCase().startsWith(lang.toLowerCase().slice(0, 2)));
    if (!candidates.length) candidates = voices;

    // 2) по подстроке имени (если задано)
    if (voiceNameIncludes) {
      const byName = candidates.filter(v => (v.name || "").toLowerCase().includes(voiceNameIncludes.toLowerCase()));
      if (byName.length) candidates = byName;
    }

    // 3) prefer default
    return candidates.find(v => v.default) ?? candidates[0];
  }, [voices, lang, voiceNameIncludes]);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    speakingRef.current = false;
  }, [supported]);

  const speak = useCallback(
    (text: string) => {
      if (!supported) return;
      const t = (text || "").trim();
      if (!t) return;

      // останавливаем предыдущее
      window.speechSynthesis.cancel();

      const u = new SpeechSynthesisUtterance(t);
      u.lang = lang;
      u.rate = rate;
      u.pitch = pitch;
      u.volume = volume;
      if (voice) u.voice = voice;

      u.onstart = () => { speakingRef.current = true; };
      u.onend = () => { speakingRef.current = false; };
      u.onerror = () => { speakingRef.current = false; };

      window.speechSynthesis.speak(u);
    },
    [supported, lang, rate, pitch, volume, voice]
  );

  return { supported, voices, voice, speak, stop };
}
