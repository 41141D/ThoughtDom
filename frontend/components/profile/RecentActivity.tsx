import Link from "next/link";

type ActivityItem = {
  type: "post" | "comment";
  id: string;
  post_id: string;
  title: string | null;
  excerpt: string;
  score: number;
  created_at: string;
};

export default function RecentActivity({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">No activity yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <Link
          key={`${item.type}-${item.id}`}
          href={`/post/${item.post_id}`}
          className="group flex items-start gap-3 rounded-lg px-2 py-2 -mx-2 transition-colors hover:bg-surface2"
        >
          <span
            className={`reply-type-pill mt-0.5 shrink-0 ${
              item.type === "post" ? "bg-signal/15 text-signal" : "bg-surface2 text-muted"
            }`}
          >
            {item.type}
          </span>
          <div className="min-w-0">
            {item.title && (
              <div className="text-sm text-text/90 group-hover:text-signal transition-colors truncate">
                {item.title}
              </div>
            )}
            <p className="text-xs text-muted line-clamp-1">{item.excerpt}</p>
          </div>
          <div className="ml-auto text-xs text-muted shrink-0 whitespace-nowrap">
            {new Date(item.created_at).toLocaleDateString()}
          </div>
        </Link>
      ))}
    </div>
  );
}
