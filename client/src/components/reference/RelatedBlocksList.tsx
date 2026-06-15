import { Link } from "wouter";
import { ChevronRight, Crosshair } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface RelatedBlocksListProps {
  blockIds?: string[];
}

export function RelatedBlocksList({ blockIds }: RelatedBlocksListProps) {
  const { data: blocks, isLoading } = useQuery({
    queryKey: ["reference-blocks", blockIds],
    queryFn: async () => {
      if (!blockIds?.length) return [];
      const { data, error } = await supabase
        .from("blocks")
        .select("id, title")
        .in("id", blockIds);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!blockIds?.length,
  });

  if (!blockIds?.length) {
    return (
      <p className="text-sm text-slate-500 italic">
        Nog geen LRA-technieken gekoppeld aan deze structuur.
      </p>
    );
  }

  if (isLoading) {
    return <p className="text-xs text-slate-400">Technieken laden…</p>;
  }

  if (!blocks?.length) {
    return (
      <p className="text-sm text-slate-500">
        Gekoppelde technieken: {blockIds.join(", ")} (IDs — titels volgen in CMS)
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {blocks.map((block) => (
        <li key={block.id}>
          <Link href={`/blocks/${block.id}?from=/blocks/referentie/dermatomen`}>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3 text-left transition-colors hover:border-teal-200 hover:bg-teal-50/50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                <Crosshair size={16} />
              </span>
              <span className="flex-1 text-sm font-black uppercase tracking-tight text-slate-800">
                {block.title}
              </span>
              <ChevronRight className="shrink-0 text-slate-300" size={18} />
            </button>
          </Link>
        </li>
      ))}
    </ul>
  );
}
