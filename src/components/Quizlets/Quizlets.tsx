import React, { useState } from "react";
import "./Quizlets.css";
import QuizletSidebar from "./QuizletSidebar";
import QuizletSetEditor from "./QuizletSetEditor";
import QuizletSetViewer from "./QuizletSetViewer";
import QuizletSetsList from "./QuizletSetsList";
import QuizletFoldersList from "./QuizletFoldersList";

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
  function createSet(setId: string, slug: string) {
    setOpened({ id: setId, slug });
    setMode("edit");
  }


  async function createFolder(folderId: string, title: string) {
  const res = await fetch("/api/quizlet/folders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ id: folderId, title }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Create folder failed:", res.status, text);
    return;
  }
}
async function renameFolder(folderId: string, currentTitle: string) {
  const title = window.prompt("New folder title", currentTitle);
  if (!title || title.trim() === currentTitle) return;

  await fetch(`/api/quizlet/folders/${folderId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ title: title.trim() }),
  });
}

async function openFolderViewer(folderId: string) {
  console.log("open folder viewer:", folderId);
}
async function deleteFolder(folderId: string) {
  await fetch(`/api/quizlet/folders/${folderId}`, {
    method: "DELETE",
    credentials: "include",
  });
}
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
              <QuizletSetsList 
                onOpen={openViewer} 
                onCreate={createSet}
              />
            ) : (
              <QuizletFoldersList 
                  onOpen={openFolderViewer}
                  onCreate={createFolder}
                  onRename={renameFolder}
                  onDelete={deleteFolder}
                  onOpenSet={(setId, slug) => openViewer(setId, slug)} />
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

        <QuizletSetEditor 
          setId={opened.id} 
          slug={opened.slug} 
          autoCreate={true} 
        />
      </>
    );
  })();

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
