import React from "react";
import { useRoute, Link } from "wouter";
import { ChevronLeft, Loader2, Pencil, Info, Video, Activity, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

export default function PocusDetail() {
  const [, params] = useRoute("/pocus/:id");
  const id = params?.id;

  const { data: dbPocus, isLoading } = useQuery({
    queryKey: ['pocus-detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pocus')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center text-blue-600 bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin h-8 w-8" />
        <p className="text-[10px] font-black uppercase tracking-widest">Protocol Laden...</p>
      </div>
    </div>
  );

  if (!dbPocus) return (
    <div className="p-20 text-center flex flex-col items-center justify-center min-h-screen">
      <div className="text-slate-300 mb-4 font-black text-6xl">?</div>
      <p className="font-black uppercase tracking-widest text-slate-400">Scan niet gevonden</p>
      <Link href="/pocus" className="mt-6 text-blue-600 font-bold uppercase text-xs underline">Terug naar overzicht</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* GECUREERDE HEADER */}
      <div className="bg-slate-900 text-white pt-12 pb-8 px-6 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        
        <div className="relative z-10 flex justify-between items-start mb-8">
          <Link href="/pocus">
            <button className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-all border border-white/5 shadow-xl">
              <ChevronLeft size={20} className="text-white" />
            </button>
          </Link>
          <Link href={`/admin?type=pocus&id=${id}`}>
            <button className="bg-teal-500/20 hover:bg-teal-500/30 p-3 rounded-2xl transition-all border border-teal-500/30 shadow-xl group">
              <Pencil size={20} className="text-teal-400 group-hover:scale-110 transition-transform" />
            </button>
          </Link>
        </div>

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
             <span className="px-3 py-1 bg-blue-500 rounded-full text-[9px] font-black uppercase tracking-widest">POCUS</span>
             <span className="px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-blue-300">AZ Groeninge</span>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter leading-none py-2">
            {dbPocus.title}
          </h1>
        </div>
      </div>

      <div className="px-6 -mt-6 relative z-20">
        <Tabs defaultValue="indicaties" className="w-full">
          <TabsList className="grid grid-cols-3 h-14 bg-white/80 backdrop-blur-xl border border-slate-100 rounded-2xl p-1 shadow-xl mb-8">
            <TabsTrigger value="indicaties" className="rounded-xl font-black text-[10px] uppercase data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
              <Info size={14} className="mr-2 hidden sm:inline" /> Algemeen
            </TabsTrigger>
            <TabsTrigger value="techniek" className="rounded-xl font-black text-[10px] uppercase data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
              <Activity size={14} className="mr-2 hidden sm:inline" /> Acquisitie
            </TabsTrigger>
            <TabsTrigger value="interpretatie" className="rounded-xl font-black text-[10px] uppercase data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
              <Eye size={14} className="mr-2 hidden sm:inline" /> Interpretatie
            </TabsTrigger>
          </TabsList>
          
          {/* TAB 1: INDICATIES */}
          <TabsContent value="indicaties" className="outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-blue-50/50 p-5 rounded-[2rem] mb-8 border border-blue-100 flex gap-4 items-start shadow-sm">
              <div className="bg-blue-600 p-2 rounded-xl text-white shrink-0"><Info size={18}/></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Status</p>
                <p className="text-sm font-bold text-slate-700 leading-tight italic">
                  Dit protocol wordt centraal beheerd via Supabase CMS.
                </p>
              </div>
            </div>
            <MarkdownRenderer content={dbPocus.content_indicaties || ""} />
          </TabsContent>
          
          {/* TAB 2: TECHNIEK */}
          <TabsContent value="techniek" className="outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-slate-50 p-5 rounded-[2rem] mb-8 border border-slate-100 flex gap-4 items-start">
               <div className="bg-slate-800 p-2 rounded-xl text-white shrink-0"><Video size={18}/></div>
               <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Techniek</p>
                 <p className="text-sm font-bold text-slate-700 leading-tight">Positionering & Instellingen</p>
               </div>
            </div>
            <MarkdownRenderer content={dbPocus.content_techniek || ""} />
          </TabsContent>
          
          {/* TAB 3: INTERPRETATIE */}
          <TabsContent value="interpretatie" className="outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
            <MarkdownRenderer content={dbPocus.content_interpretatie || ""} />
          </TabsContent>
        </Tabs>
      </div>

         </div>
  );
}