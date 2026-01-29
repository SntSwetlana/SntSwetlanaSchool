import React, { useState } from "react";
import "./Quizlets.css";
import QuizletSidebar from "./QuizletSidebar";
import QuizletSetEditor from "./QuizletSetEditor";
import QuizletSetViewer from "./QuizletSetViewer";
import QuizletSetsList from "./QuizletSetsList";

const TABS = ["Flashcards", "Folders"] as const;
type Tab = (typeof TABS)[number];
type Mode = "list" | "view" | "edit";

interface QuizletsProps {
  name: string;
}

const Quizlets: React.FC<QuizletsProps> = ({ name }) => {
  const [active, setActive] = useState<Tab>("Flashcards");
  const [mode, setMode] = useState<Mode>("list");
  const [opened, setOpened] = useState<{ id: string; slug: string } | null>(null);
  const [collapsed, setCollapsed] = useState(true);

  function openViewer(id: string, slug: string) {
    setOpened({ id, slug });
    setMode("view");
  }

  function backToList() {
    setMode("list");
    setOpened(null);
  }

  function openEdit() {
    setMode("edit");
  }

  // ====== CONTENT SWITCHER ======
  const content = (() => {
    if (mode === "list") {
      return (
        <>
          <h1 className="quizlets-title">{name}'s library</h1>

          {/* tabs (если нужны именно в библиотеке) */}
          <div className="quizlets-tabs-wrap">
            <nav className="quizlets-tabs" role="tablist" aria-orientation="horizontal">
              {TABS.map((tab) => {
                const selected = active === tab;
                return (
                  <div
                    key={tab}
                    className={`AssemblyTab quizlets-tab ${selected ? "is-active" : ""}`}
                    role="tab"
                    aria-selected={selected}
                    tabIndex={selected ? 0 : -1}
                    aria-label={tab}
                    onClick={() => setActive(tab)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActive(tab);
                      }
                    }}
                  >
                    <a
                      href="#"
                      tabIndex={-1}
                      onClick={(e) => {
                        e.preventDefault();
                        setActive(tab);
                      }}
                    >
                      {tab}
                    </a>
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="quizlets-content">
            {active === "Flashcards" ? (
              <QuizletSetsList onOpen={openViewer} />
            ) : (
              <div style={{ padding: 12 }}>Folders (пока пусто)</div>
            )}
          </div>
        </>
      );
    }

    if (!opened) return null;

    if (mode === "view") {
      return (
        <QuizletSetViewer
          setId={opened.id}
          slug={opened.slug}
          onBack={backToList}
          onEdit={openEdit}
          onDeleted={backToList}
        />
      );
    }

    // mode === "edit"
    return (
      <>
        <div style={{ padding: "0 0 12px 0" }}>
          <button className="quizlets-btn" type="button" onClick={() => setMode("view")}>
            ← Back
          </button>
        </div>

        <QuizletSetEditor setId={opened.id} slug={opened.slug} autoCreate={false} />
      </>
    );
  })();

  // ====== LAYOUT WITH SIDEBAR ALWAYS ======
  return (
    <div className="qz-layout">
      <QuizletSidebar initialCollapsed={true} onCollapsedChange={setCollapsed} />

      <main className={`qz-main ${collapsed ? "is-wide" : ""}`}>
        {content}
      </main>
    </div>
  );
};

export default Quizlets;
