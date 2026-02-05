import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ChevronRight, Crosshair, BookOpen, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";

// Scan automatisch alle .md bestanden in de blocks map
const allBlockFiles = import.meta.glob('../content/blocks/*.md', { query: 'raw', eager: true });

export default function Blocks() {
  const [search, setSearch] = useState("");

  // 1. Data voorbereiden uit de bestanden
  const blocksList = Object.keys(allBlockFiles).map((path) => {
    const fileName = path.split('/').pop()?.replace('.md', '') || "";
    const fileData = allBlockFiles[path] as any;
    const rawContent = fileData.default || fileData;
    
    // Zoek naar de titel in de frontmatter, anders gebruik de bestandsnaam
    const titleMatch = typeof rawContent === 'string' ? rawContent.match(/title: "(.*)"/) : null;
    const title = titleMatch ? titleMatch[1] : fileName.replace(/-/g, ' ');

    return { 
      id: fileName, 
      title: title 
    };
  }).sort((a, b) => a.title.localeCompare(b.title));

  // 2. Filter de lijst op basis van de zoekopdracht
  const filteredBlocks = blocksList.filter(block => 
    block.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-500 max-w-2xl mx-auto px-2">
      {/* HEADER: Consistent met Protocols */}
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">
          Blocks <span className="text-teal-600">LRA</span>
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          AZ Groeninge • Locoregionale Anesthesie
        </p>
      </header>

      {/* SEARCH BAR: Strakker design met Teal focus */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
        <Input 
          placeholder="ZOEK TECHNIEK..." 
          className="pl-12 h-14 bg-white border-2 border-slate-100 rounded-2xl focus:border-teal-500 focus:ring-0 transition-all uppercase font-bold text-xs tracking-widest shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* BLOCK LIST: Enkele kolom, hoge densiteit */}
      <div className="grid gap-3">
        {filteredBlocks.length > 0 ? (
          filteredBlocks.map((block) => (
            <Link key={block.id} href={`/blocks/${block.id}`}>
              <Card className="group cursor-pointer border-2 border-slate-50 shadow-sm hover:border-teal-200 hover:shadow-md active:scale-[0.98] transition-all rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center p-5">
                    <div className="p-3 bg-slate-50 rounded-xl mr-4 text-slate-400 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
                      <Crosshair size={20} />
                    </div>
                    <span className="flex-1 font-black text-slate-800 uppercase tracking-tight text-sm">
                      {block.title}
                    </span>
                    <ChevronRight className="text-slate-200 group-hover:text-teal-600 transition-colors" size={20} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          /* EMPTY STATE */
          <div className="text-center p-16 bg-white rounded-[32px] border-2 border-dashed border-slate-100">
            <BookOpen className="mx-auto mb-4 text-slate-200" size={48} />
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] italic">
              Geen technieken gevonden.
            </p>
          </div>
        )}
      </div>

      {/* FOOTER INDICATIE */}
      <div className="pt-8 text-center opacity-40">
        <Activity className="h-6 w-6 mx-auto text-slate-300 mb-2" />
        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
          Selecteer een block voor sono-anatomie en tips
        </p>
      </div>
    </div>
  );
}