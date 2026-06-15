import { useState, useMemo, useEffect } from "react";
import { Link, useSearch } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ChevronRight, Crosshair, BookOpen, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { InteractiveBodyMap } from "@/components/blocks/InteractiveBodyMap";
import { KaraShell } from "@/components/kara/KaraShell";
import { parseBodyRegions } from "@/data/body-map-regions";

interface DbBlock {
  id: string;
  title: string;
  content_general: string;
  body_regions?: string[] | null;
  created_at: string;
}

const allBlockFiles = import.meta.glob('../content/blocks/*.md', { query: 'raw', eager: true });

type BlocksViewMode = "atlas" | "list";

export default function Blocks() {
  const searchString = useSearch();
  const initialView: BlocksViewMode = new URLSearchParams(searchString).get("view") === "list" ? "list" : "atlas";
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<BlocksViewMode>(initialView);

  useEffect(() => {
    const view = new URLSearchParams(searchString).get("view");
    if (view === "list") setViewMode("list");
    else if (view === "atlas" || !view) setViewMode("atlas");
  }, [searchString]);

  const { data: dbBlocks, isLoading: dbLoading } = useQuery<DbBlock[]>({
    queryKey: ['blocks-cloud'],
    queryFn: async () => {
      const { data, error } = await supabase.from('blocks').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const blocksList = useMemo(() => {
    const local = Object.keys(allBlockFiles).map((path) => {
      const fileName = path.split('/').pop()?.replace('.md', '') || "";
      const fileData = allBlockFiles[path] as { default?: string };
      const rawContent = fileData.default || "";
      const titleMatch = typeof rawContent === 'string' ? rawContent.match(/title: "(.*)"/) : null;

      return {
        id: fileName,
        title: titleMatch ? titleMatch[1] : fileName.replace(/-/g, ' '),
        isCloud: false
      };
    });

    const cloud = (dbBlocks || []).map((b: DbBlock) => ({
      id: b.id,
      title: b.title,
      isCloud: true
    }));

    return [...local, ...cloud].sort((a, b) => a.title.localeCompare(b.title));
  }, [dbBlocks]);

  const atlasBlocks = useMemo(
    () =>
      (dbBlocks || []).map((block) => ({
        id: block.id,
        title: block.title,
        body_regions: parseBodyRegions(block.body_regions),
      })),
    [dbBlocks]
  );

  const filteredBlocks = blocksList.filter(block =>
    block.title.toLowerCase().includes(search.toLowerCase())
  );

  const activeTab = viewMode === "list" ? "list" : "atlas";

  return (
    <KaraShell
      activeTab={activeTab}
      isLoading={dbLoading}
      headerExtra={
        viewMode === "list" ? (
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-600 transition-colors" size={20} />
            <Input
              className="w-full pl-12 h-14 bg-slate-50 border-none rounded-2xl font-bold text-slate-600 placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-teal-500/20 transition-all"
              placeholder="Zoek een techniek..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        ) : undefined
      }
    >
      {viewMode === "atlas" ? (
        <div className="px-6 py-6 max-w-2xl mx-auto">
          <InteractiveBodyMap blocks={atlasBlocks} isLoading={dbLoading} />
        </div>
      ) : (
        <div className="px-6 py-8 grid gap-3 max-w-2xl mx-auto">
          {filteredBlocks.length > 0 ? (
            filteredBlocks.map((block) => (
              <Link key={block.id} href={`/blocks/${block.id}`}>
                <Card className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer group active:scale-[0.98] overflow-hidden rounded-2xl">
                  <CardContent className="p-0">
                    <div className="flex items-center p-2">
                      <div className={`p-2 rounded-xl mr-4 ${block.isCloud ? 'bg-teal-50 text-teal-600' : 'bg-slate-50 text-slate-400'} group-hover:bg-teal-600 group-hover:text-white transition-all duration-300`}>
                        <Crosshair size={16} />
                      </div>
                      <div className="flex-1">
                        <span className="font-black text-slate-800 uppercase tracking-tight text-sm block">
                          {block.title}
                        </span>
                        {block.isCloud && (
                          <span className="text-[7px] font-black text-amber-600 uppercase tracking-[0.2em]">Cloud Sync</span>
                        )}
                      </div>
                      <ChevronRight className="text-slate-200 group-hover:text-teal-600 transition-colors" size={20} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="text-center p-16 bg-white rounded-[32px] border-2 border-dashed border-slate-100">
              <BookOpen className="mx-auto mb-4 text-slate-200" size={48} />
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] italic">Geen technieken gevonden.</p>
            </div>
          )}
        </div>
      )}
    </KaraShell>
  );
}
