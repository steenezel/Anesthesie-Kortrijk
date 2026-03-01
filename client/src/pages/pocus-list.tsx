import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ChevronRight, ChevronLeft, Scan, BookOpen, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";

// Scan automatisch alle .md bestanden in de pocus map
const allPocusFiles = import.meta.glob('../content/pocus/*.md', { query: 'raw', eager: true });

export default function PocusList() {
  const [search, setSearch] = useState("");

  const pocusList = Object.keys(allPocusFiles).map((path) => {
    const fileName = path.split('/').pop()?.replace('.md', '') || "";
    const fileData = allPocusFiles[path] as any;
    const rawContent = fileData.default || fileData;
    
    const titleMatch = typeof rawContent === 'string' ? rawContent.match(/title: "(.*)"/) : null;
    const title = titleMatch ? titleMatch[1] : fileName.replace(/-/g, ' ');

    return { id: fileName, title: title };
  }).sort((a, b) => a.title.localeCompare(b.title));

  const filteredPocus = pocusList.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20 p-6">
      <Link href="/">
        <div className="flex items-center text-slate-400 font-black uppercase text-[10px] tracking-widest mb-8 cursor-pointer group">
          <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Terug
        </div>
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tighter uppercase text-slate-900 leading-none mb-2">POCUS</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600">Point of Care Ultrasound</p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input 
          placeholder="ZOEK PROTOCOL..." 
          className="pl-12 py-6 bg-white border-none shadow-sm rounded-2xl font-bold uppercase text-xs tracking-wider"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-3">
        {filteredPocus.length > 0 ? (
          filteredPocus.map((item) => (
            <Link key={item.id} href={`/pocus/${item.id}`}>
              <Card className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer group active:scale-[0.98] overflow-hidden rounded-2xl">
                <CardContent className="p-0">
                  <div className="flex items-center p-2">
                    <div className="p-3 bg-slate-50 rounded-xl mr-4 text-slate-400 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
                      <Scan size={20} />
                    </div>
                    <span className="flex-1 font-black text-slate-800 uppercase tracking-tight text-sm">
                      {item.title}
                    </span>
                    <ChevronRight className="text-slate-200 group-hover:text-teal-600 transition-colors" size={20} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="text-center p-16 bg-white rounded-[32px] border-2 border-dashed border-slate-100">
            <BookOpen className="mx-auto mb-4 text-slate-200" size={48} />
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] italic">Geen protocollen gevonden.</p>
          </div>
        )}
      </div>
    </div>
  );
}