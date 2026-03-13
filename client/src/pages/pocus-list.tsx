import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ChevronRight, ChevronLeft, Scan, BookOpen, Activity, Plus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface DbPocus {
  id: string;
  title: string;
  created_at: string;
}

const allPocusFiles = import.meta.glob('../content/pocus/*.md', { query: 'raw', eager: true });

export default function PocusList() {
  const [search, setSearch] = useState("");

  const { data: dbPocusItems, isLoading: dbLoading } = useQuery<DbPocus[]>({
    queryKey: ['pocus-cloud'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pocus').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const pocusList = useMemo(() => {
    const local = Object.keys(allPocusFiles).map((path) => {
      const fileName = path.split('/').pop()?.replace('.md', '') || "";
      const fileData = allPocusFiles[path] as any;
      const rawContent = fileData.default || fileData;
      const titleMatch = typeof rawContent === 'string' ? rawContent.match(/title: "(.*)"/) : null;
      return { 
        id: fileName, 
        title: titleMatch ? titleMatch[1] : fileName.replace(/-/g, ' '),
        isCloud: false 
      };
    });

    const cloud = (dbPocusItems || []).map((p: DbPocus) => ({
      id: p.id,
      title: p.title,
      isCloud: true
    }));

    return [...local, ...cloud].sort((a, b) => a.title.localeCompare(b.title));
  }, [dbPocusItems]);

  const filteredPocus = pocusList.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-white px-6 pt-12 pb-8 rounded-b-[40px] shadow-sm border-b border-slate-100">
        <Link href="/">
          <button className="flex items-center text-slate-400 font-black uppercase text-[10px] tracking-widest mb-6 group">
            <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Home
          </button>
        </Link>
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-black tracking-tightest uppercase text-slate-900 leading-none">
              POCUS <span className="text-blue-600">Scan</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Point of Care Ultrasound</p>
              {dbLoading && <Loader2 className="h-3 w-3 animate-spin text-blue-600" />}
            </div>
          </div>
          <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl">
            <Scan size={32} />
          </div>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
          <Input 
            className="w-full pl-12 h-14 bg-slate-50 border-none rounded-2xl font-bold text-slate-600 placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-blue-500/20 transition-all"
            placeholder="Zoek een scan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="px-6 py-8 grid gap-3 max-w-2xl mx-auto">
        {filteredPocus.map((item) => (
          <Link key={item.id} href={`/pocus/${item.id}`}>
            <Card className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer group active:scale-[0.98] overflow-hidden rounded-2xl">
              <CardContent className="p-0">
                <div className="flex items-center p-2">
                  <div className={`p-3 rounded-xl mr-4 ${item.isCloud ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'} group-hover:bg-blue-600 group-hover:text-white transition-all duration-300`}>
                    <Scan size={20} />
                  </div>
                  <div className="flex-1">
                    <span className="font-black text-slate-800 uppercase tracking-tight text-sm block">
                      {item.title}
                    </span>
                    {item.isCloud && (
                      <span className="text-[7px] font-black text-blue-600 uppercase tracking-[0.2em]">Live Database</span>
                    )}
                  </div>
                  <ChevronRight className="text-slate-200 group-hover:text-blue-600 transition-colors" size={20} />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* PLUS KNOP */}
      <Link href="/admin?type=pocus">
        <button className="fixed bottom-24 right-6 p-4 bg-blue-600 text-white rounded-full shadow-2xl z-50 hover:scale-110 active:scale-95 transition-all flex items-center justify-center">
          <Plus size={28} />
        </button>
      </Link>
    </div>
  );
}