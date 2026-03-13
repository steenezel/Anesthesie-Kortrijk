import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ChevronRight, ChevronLeft, Crosshair, BookOpen, Activity, Plus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// 1. Definieer hoe een Block uit de database eruit ziet
interface DbBlock {
  id: string;
  title: string;
  content_general: string;
  created_at: string;
}

// Scan automatisch alle lokale .md bestanden
const allBlockFiles = import.meta.glob('../content/blocks/*.md', { query: 'raw', eager: true });

export default function Blocks() {
  const [search, setSearch] = useState("");

  // 2. Haal de Cloud data op uit Supabase
  const { data: dbBlocks, isLoading: dbLoading } = useQuery<DbBlock[]>({
    queryKey: ['blocks-cloud'],
    queryFn: async () => {
      const { data, error } = await supabase.from('blocks').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // 3. Combineer lokaal en cloud (De "Keuken")
  const blocksList = useMemo(() => {
    // A. Lokale bestanden verwerken
    const local = Object.keys(allBlockFiles).map((path) => {
      const fileName = path.split('/').pop()?.replace('.md', '') || "";
      const fileData = allBlockFiles[path] as any;
      const rawContent = fileData.default || fileData;
      const titleMatch = typeof rawContent === 'string' ? rawContent.match(/title: "(.*)"/) : null;
      
      return { 
        id: fileName, 
        title: titleMatch ? titleMatch[1] : fileName.replace(/-/g, ' '),
        isCloud: false 
      };
    });

    // B. Cloud items verwerken
    const cloud = (dbBlocks || []).map((b: DbBlock) => ({
      id: b.id,
      title: b.title,
      isCloud: true
    }));

    // C. Samenvoegen en sorteren
    return [...local, ...cloud].sort((a, b) => a.title.localeCompare(b.title));
  }, [dbBlocks]);

  // 4. Filteren op zoekopdracht
  const filteredBlocks = blocksList.filter(block => 
    block.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* HEADER & ZOEKBALK */}
      <div className="bg-white px-6 pt-12 pb-8 rounded-b-[40px] shadow-sm border-b border-slate-100">
        <Link href="/">
          <button className="flex items-center text-slate-400 font-black uppercase text-[10px] tracking-widest mb-6 group">
            <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Home
          </button>
        </Link>
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-black tracking-tightest uppercase text-slate-900 leading-none">
              LRA <span className="text-teal-600">Blocks</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600">Regionale Technieken</p>
              {dbLoading && <Loader2 className="h-3 w-3 animate-spin text-teal-600" />}
            </div>
          </div>
          <div className="p-4 bg-teal-50 text-teal-600 rounded-3xl">
            <Crosshair size={32} />
          </div>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-600 transition-colors" size={20} />
          <Input 
            className="w-full pl-12 h-14 bg-slate-50 border-none rounded-2xl font-bold text-slate-600 placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-teal-500/20 transition-all"
            placeholder="Zoek een techniek..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* LIJST */}
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

      {/* PLUS KNOP */}
      <Link href="/admin?type=blocks">
        <button className="fixed bottom-24 right-6 p-4 bg-teal-600 text-white rounded-full shadow-2xl z-50 hover:scale-110 active:scale-95 transition-all flex items-center justify-center">
          <Plus size={28} />
        </button>
      </Link>
    </div>
  );
}