import "./QuizletSetTile.css";

export type QuizletSetListItem = {
  id: string;          // UUID
  slug: string;
  title: string;
  description?: string | null;
  created_at?: string;
};

export default function QuizletSetTile({
  item,
  onOpen,
}: {
  item: QuizletSetListItem;
  onOpen: (setId: string, slug: string) => void;
}) {
  return (
    <div className="qz-tile">QuizletSetListItem 
      <div className="qz-tile-main">
        <div className="qz-tile-title">{item.title}</div>
        <div className="qz-tile-sub">{item.slug}</div>
        {item.description ? <div className="qz-tile-desc">{item.description}</div> : null}
      </div>

      <div className="qz-tile-actions">
        <button className="qz-tile-btn" type="button" onClick={() => onOpen(item.id, item.slug)}>
          Open
        </button>
      </div>
    </div>
  );
}
