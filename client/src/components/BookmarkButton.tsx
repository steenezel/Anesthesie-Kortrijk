import { Star } from "lucide-react";
import { useBookmarks } from "@/hooks/use-bookmarks";
import type { BookmarkItemType } from "@/lib/user-content";
import { cn } from "@/lib/utils";

export function BookmarkButton({
  itemType,
  itemId,
  className,
  accentClassName = "text-amber-500",
}: {
  itemType: BookmarkItemType;
  itemId: string | null | undefined;
  className?: string;
  accentClassName?: string;
}) {
  const { isBookmarked, toggle, isToggling } = useBookmarks();
  if (!itemId) return null;

  const active = isBookmarked(itemType, itemId);

  return (
    <button
      type="button"
      aria-label={active ? "Favoriet verwijderen" : "Toevoegen aan favorieten"}
      disabled={isToggling}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(itemType, itemId);
      }}
      className={cn(
        "p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-amber-500 transition-colors active:scale-95 disabled:opacity-60",
        active && accentClassName,
        className,
      )}
    >
      <Star size={16} strokeWidth={2.25} fill={active ? "currentColor" : "none"} />
    </button>
  );
}
