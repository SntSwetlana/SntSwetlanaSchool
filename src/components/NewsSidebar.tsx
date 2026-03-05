import React from "react";
import NewsFeed from "./NewsFeed/NewsFeed"; // твой компонент ленты

export default function NewsSidebar() {
  return (
    <aside className="app-sidebar app-sidebar--right" aria-label="News sidebar">
      <div className="app-sidebar__inner">
        <NewsFeed endpoint="/api/news" limit={12} />
      </div>
    </aside>
  );
}