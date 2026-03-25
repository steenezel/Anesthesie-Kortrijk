import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ChevronRight, ChevronLeft, Scan, Plus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface DbPocus {
  id: string;
  title: string;
}

export default function PocusList() {
  const [search, setSearch] = useState("");

  const { data: pocusItems, isLoading } = useQuery<DbPocus[]>({
    queryKey: ['pocus-cloud-only'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pocus')
        .select('id, title')
        .order('title');
      if (error) throw error;
      return data || [];
    }
  });

  const filteredList = useMemo(() => {
    return (pocusItems || []).filter((item: any) => 
      item.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [pocusItems, search]);

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center text-blue-600">
      <Loader2 className="animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <div className="bg-white px-6 pt-12 pb-6 shadow-sm sticky top-0 z-20">
        <div className="max-w-xl mx-auto">
          <Link href="/">
            <div className="flex items-center text-blue-600 font-black uppercase text-[10px] tracking-widest mb-6 cursor-pointer">
              <ChevronLeft className="h-4 w-4 mr-1" /> Dashboard
            </div>
          </Link>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-6">POCUS</h1>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input 
              placeholder="Zoek een scan..." 
              className="pl-12 h-14 rounded-2xl border-none bg-slate-100 font-bold text-lg shadow-inner focus-visible:ring-blue-600"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 mt-8 space-y-3">
        {filteredList.length > 0 ? (
          filteredList.map((item: any) => (
            <Link key={item.id} href={`/pocus/${item.id}`}>
              <Card className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer group rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center p-3">
                    <div className="p-3 rounded-xl mr-4 bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      <Scan size={20} />
                    </div>
                    <div className="flex-1">
                      <span className="font-black text-slate-800 uppercase tracking-tight text-sm block">
                        {item.title}
                      </span>
                    </div>
                    <ChevronRight className="text-slate-200 group-hover:text-blue-600 transition-colors" size={20} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="text-center py-12 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
            Geen scans gevonden
          </div>
        )}
      </div>

      <Link href="/admin?type=pocus">
        <button className="fixed bottom-24 right-6 p-4 bg-blue-600 text-white rounded-full shadow-2xl hover:scale-110 active:scale-90 transition-all z-30">
          <Plus size={28} />
        </button>
      </Link>
    </div>
  );
}