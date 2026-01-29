import React from "react";
import "./FlipCard.css";

export default function FlipCard({
  front,
  back,
  flipped,
  onToggle,
}: {
  front: React.ReactNode;
  back: React.ReactNode;
  flipped: boolean;
  onToggle: () => void;
}) {
  return (
    <button className="fc" type="button" onClick={onToggle} aria-pressed={flipped}>
      <div className={`fc-inner ${flipped ? "is-flipped" : ""}`}>
        <div className="fc-face fc-front">
          {front}
          <div className="fc-hint">Click to flip</div>
        </div>
        <div className="fc-face fc-back">
          {back}
          <div className="fc-hint">Click to flip back</div>
        </div>
      </div>
    </button>
  );
}
