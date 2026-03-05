import React from "react";
import "./NewsLayout.css";

export default function NewsLayout({
  main,
  rail,
}: {
  main: React.ReactNode;
  rail: React.ReactNode;
}) {
  return (
    <div className="nl">
      <main className="nl-main">{main}</main>
      <aside className="nl-rail" aria-label="Hot news">
        {rail}
      </aside>
    </div>
  );
}