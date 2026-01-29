import React, { useEffect, useState } from "react";
import "./QuizletSidebar.css";

type Item = {
  key: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  onClick?: () => void;
};

export default function QuizletSidebar({
  initialCollapsed = true,
  onCollapsedChange,
}: {
  initialCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  useEffect(() => {
    onCollapsedChange?.(collapsed);
  }, [collapsed, onCollapsedChange]);

  const itemsTop: Item[] = [
    { key: "home", icon: "⌂", label: "Home" },
    { key: "library", icon: "📁", label: "Library" },
    { key: "notifications", icon: "🔔", label: "Notifications", badge: "1" },
  ];

  const itemsMid: Item[] = [
    { key: "folder1", icon: "📁", label: "Folder" },
    { key: "folder2", icon: "📁", label: "Folder" },
    { key: "folder3", icon: "📁", label: "Folder" },
  ];

  function toggle() {
    setCollapsed((v) => !v);
  }

  return (
    <aside className={`qsb ${collapsed ? "is-collapsed" : ""}`}>
      <div className="qsb-top">
        <button className="qsb-burger" type="button" onClick={toggle} aria-label="Toggle sidebar" title="Toggle">
          ☰
        </button>
      </div>

      <nav className="qsb-nav">
        <div className="qsb-group">
          {itemsTop.map((it) => (
            <button key={it.key} className="qsb-item" type="button" onClick={it.onClick}>
              <span className="qsb-ico" aria-hidden="true">{it.icon}</span>
              <span className="qsb-label">{it.label}</span>
              {it.badge ? <span className="qsb-badge">{it.badge}</span> : null}
            </button>
          ))}
        </div>

        <div className="qsb-divider" />

        <div className="qsb-group">
          {itemsMid.map((it) => (
            <button key={it.key} className="qsb-item" type="button" onClick={it.onClick}>
              <span className="qsb-ico" aria-hidden="true">{it.icon}</span>
              <span className="qsb-label">{it.label}</span>
            </button>
          ))}
        </div>

        <div className="qsb-divider" />
      </nav>
    </aside>
  );
}
