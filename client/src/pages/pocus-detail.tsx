import React from "react";
import { useRoute, Link } from "wouter";
import { ChevronLeft, Loader2, Pencil, Info } from "lucide-react";
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
    <div className="flex h-screen items-center justify-center text-blue-600">
      <Loader2 className="animate-spin" />
    </div>
  );

  if (!dbPocus) return <div className="p-20 text-center font-black uppercase tracking-widest text-slate-400">Scan niet gevonden</div>;

  return (
    <div className="min-h-screen bg-white pb-20 px-4">
      {/* STICKY HEADER */}
      <div className="flex items-center justify-between py-4 sticky top-0 bg-white/80 backdrop-blur-md z-10 max-w-3xl mx-auto w-full">
        <Link href="/pocus">
          <div className="flex items-center text-blue-600 font-black uppercase text-[10px] tracking-widest cursor-pointer group">
            <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Overzicht
          </div>
        </Link>
        <Link href={`/admin?type=pocus&id=${dbPocus.id}`}>
          <div className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-blue-600 cursor-pointer flex items-center gap-2 font-black text-[9px] uppercase tracking-widest transition-colors">
            <Pencil size={14} /> Bewerken
          </div>
        </Link>
      </div>

      <div className="p-6 max-w-3xl mx-auto w-full">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-8 italic text-slate-900 leading-[0.85]">
          {dbPocus.title}
        </h1>

        <Tabs defaultValue="indicaties" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100 rounded-2xl p-1 mb-8">
            <TabsTrigger value="indicaties" className="rounded-xl font-black text-[10px] uppercase">Algemeen</TabsTrigger>
            <TabsTrigger value="techniek" className="rounded-xl font-black text-[10px] uppercase">Acquisitie</TabsTrigger>
            <TabsTrigger value="interpretatie" className="rounded-xl font-black text-[10px] uppercase">Interpretatie</TabsTrigger>
          </TabsList>
          
          <TabsContent value="indicaties" className="outline-none">
            <div className="bg-blue-50/50 p-5 rounded-[2rem] mb-10 border border-blue-100 flex gap-4 items-start">
              <div className="bg-blue-600 p-2 rounded-xl text-white shrink-0"><Info size={18}/></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Status</p>
                <p className="text-sm font-bold text-slate-700 leading-tight">Geverifieerde Cloud Content</p>
              </div>
            </div>
            <MarkdownRenderer content={dbPocus.content_indicaties || ""} />
          </TabsContent>
          
          <TabsContent value="techniek" className="outline-none">
            <MarkdownRenderer content={dbPocus.content_techniek || ""} />
          </TabsContent>
          
          <TabsContent value="interpretatie" className="outline-none">
            <MarkdownRenderer content={dbPocus.content_interpretatie || ""} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}