import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Star } from "lucide-react";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { supabase } from "@/lib/supabase";
import { cacheContent, readCachedContent } from "@/lib/offline";
import { cn } from "@/lib/utils";
import type { BookmarkItemType } from "@/lib/user-content";

const CALCULATOR_META: Record<string, { title: string; href: string }> = {
  last: { title: "LAST-Calculator", href: "/calculator/last" },
  painpump: { title: "Painpump", href: "/calculator/painpump" },
  caprini: { title: "Caprini-Score", href: "/calculator/caprini" },
  apfel: { title: "Apfel-Score", href: "/calculator/apfel" },
  peds: { title: "Pediatrische doses", href: "/calculator/peds" },
  dantroleencalc: { title: "Dantroleen", href: "/calculator/dantroleen" },
  "sedation-peds": { title: "Peds Sedatie MRI", href: "/calculator/sedation-peds" },
};

const TYPE_LABEL: Record<BookmarkItemType, string> = {
  protocol: "Protocollen",
  block: "Blocks",
  pocus: "POCUS",
  calculator: "Calculators",
};

type TitleRow = { id: string; title: string };

async function fetchTitles(table: "protocols" | "blocks" | "pocus"): Promise<TitleRow[]> {
  const cacheKey = `titles_${table}`;
  if (!navigator.onLine) {
    return readCachedContent<TitleRow[]>(cacheKey) ?? [];
  }
  const { data } = await supabase.from(table).select("id, title");
  const rows = (data ?? []) as TitleRow[];
  cacheContent(cacheKey, rows);
  return rows;
}

function hrefFor(itemType: BookmarkItemType, itemId: string) {
  if (itemType === "protocol") return `/protocols/${itemId}`;
  if (itemType === "block") return `/blocks/${itemId}`;
  if (itemType === "pocus") return `/pocus/${itemId}`;
  return CALCULATOR_META[itemId]?.href ?? `/calculator/${itemId}`;
}

/** Normalize ALL-CAPS CMS titles to readable title case for the favorites list. */
function toDisplayTitle(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;

  const letters = trimmed.replace(/[^A-Za-zÀ-ÿ]/g, "");
  if (!letters.length) return trimmed;

  const upperCount = [...letters].filter((c) => c === c.toUpperCase() && c !== c.toLowerCase()).length;
  if (upperCount / letters.length < 0.7) return trimmed;

  return trimmed
    .toLowerCase()
    .replace(/(^|[\s\-_/([{"'])(\S)/g, (_m, sep: string, ch: string) => sep + ch.toUpperCase());
}

export function HomeFavoritesSection() {
  const [open, setOpen] = useState(true);
  const { bookmarks } = useBookmarks();

  const { data: protocols = [] } = useQuery({
    queryKey: ["fav-titles", "protocols"],
    queryFn: () => fetchTitles("protocols"),
    staleTime: 5 * 60_000,
  });
  const { data: blocks = [] } = useQuery({
    queryKey: ["fav-titles", "blocks"],
    queryFn: () => fetchTitles("blocks"),
    staleTime: 5 * 60_000,
  });
  const { data: pocus = [] } = useQuery({
    queryKey: ["fav-titles", "pocus"],
    queryFn: () => fetchTitles("pocus"),
    staleTime: 5 * 60_000,
  });

  const titleMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of protocols) map.set(`protocol:${row.id}`, row.title);
    for (const row of blocks) map.set(`block:${row.id}`, row.title);
    for (const row of pocus) map.set(`pocus:${row.id}`, row.title);
    for (const [id, meta] of Object.entries(CALCULATOR_META)) {
      map.set(`calculator:${id}`, meta.title);
    }
    return map;
  }, [protocols, blocks, pocus]);

  const grouped = useMemo(() => {
    const groups: Record<BookmarkItemType, typeof bookmarks> = {
      protocol: [],
      block: [],
      pocus: [],
      calculator: [],
    };
    for (const bm of bookmarks) {
      groups[bm.itemType]?.push(bm);
    }
    return groups;
  }, [bookmarks]);

  if (bookmarks.length === 0) return null;

  return (
    <div className="mb-4 rounded-2xl border border-amber-100 bg-amber-50/40 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-3"
      >
        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
        <span className="flex-1 text-left text-[11px] font-black uppercase tracking-widest text-slate-700">
          Persoonlijke Favorieten
        </span>
        <span className="text-[10px] font-bold text-slate-400">{bookmarks.length}</span>
        <ChevronDown
          className={cn("h-4 w-4 text-slate-400 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-3">
          {(Object.keys(TYPE_LABEL) as BookmarkItemType[]).map((type) => {
            const items = grouped[type];
            if (!items.length) return null;
            return (
              <div key={type}>
                <p className="px-1 mb-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                  {TYPE_LABEL[type]}
                </p>
                <div className="space-y-1">
                  {items.map((item) => {
                    const title = toDisplayTitle(
                      titleMap.get(`${item.itemType}:${item.itemId}`) || item.itemId,
                    );
                    return (
                      <Link key={`${item.itemType}:${item.itemId}`} href={hrefFor(item.itemType, item.itemId)}>
                        <div className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-800 normal-case active:scale-[0.99] border border-slate-100">
                          {title}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
