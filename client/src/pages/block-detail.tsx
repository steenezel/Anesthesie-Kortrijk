import React from "react";
import { useRoute, Link } from "wouter";
import { ChevronLeft, Loader2, Pencil, CloudDownload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import CaudalCalculator from "@/components/CaudalCalculator";

const allBlocks = import.meta.glob('../content/blocks/*.md', { query: 'raw', eager: true });

export default function BlockDetail() {
  const [, params] = useRoute("/blocks/:id");
  const id = params?.id;
  const queryParams = new URLSearchParams(window.location.search);
  const backUrl = queryParams.get('from') || '/blocks';
  const isFromProtocol = queryParams.has('from');


  const fileKey = Object.keys(allBlocks).find(key => key.toLowerCase().endsWith(`/${id?.toLowerCase()}.md`));
  const fileData = fileKey ? (allBlocks[fileKey] as any) : null;
  const rawContent = fileData?.default || fileData;

  const { data: dbBlock, isLoading } = useQuery({
    queryKey: ['block', id],
    queryFn: async () => {
      if (!id || !id.includes("-")) return null; // UUID check
      const { data } = await supabase.from('blocks').select('*').eq('id', id).single();
      return data;
    },
    enabled: !!id
  });

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  // Render logica voor de tabs (versimpeld voor database)
  const renderTab = (content: string, id: string) => (
    <TabsContent value={id} className="mt-6 prose prose-slate max-w-none">
      <MarkdownRenderer content={content} />
      {/* Check of er een calculator moet worden getoond */}
      {id === 'algemeen' && content.includes('[CAUDAL_CALC]') && <CaudalCalculator />}
    </TabsContent>
  );

        return (
  <div className="min-h-screen bg-white pb-20 px-4">
    <div className="flex items-center justify-between py-4 sticky top-0 bg-white/80 backdrop-blur-md z-10">
      <Link href={backUrl}>
        <div className="flex items-center text-purple-600 font-black uppercase text-[10px] tracking-widest cursor-pointer group">
          <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 
          {isFromProtocol ? "Terug naar Protocol" : "Terug naar Blocks"}
        </div>
      </Link>

      <div className="flex items-center gap-2">
        {dbBlock && (
          <Link href={`/admin?type=blocks&id=${dbBlock.id}`}>
            <a className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-purple-600 transition-all flex items-center gap-2 font-black text-[9px] uppercase tracking-widest">
              <Pencil size={14} /> Edit
            </a>
          </Link>
        )}

        {!dbBlock && rawContent && (
          <Link href={`/admin?migrate=${id}&type=blocks`}>
            <a className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-all flex items-center gap-2 font-black text-[9px] uppercase tracking-widest border border-amber-100">
              <CloudDownload size={14} /> Migreer naar Cloud
            </a>
          </Link>
        )}
      </div>
    </div>
    
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-8 italic text-slate-900">
          {dbBlock?.title || id?.replace(/-/g, ' ')}
        </h1>

        <Tabs defaultValue="algemeen" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100 rounded-2xl p-1">
            <TabsTrigger value="algemeen" className="rounded-xl font-black text-[10px] uppercase">Algemeen</TabsTrigger>
            <TabsTrigger value="anatomie" className="rounded-xl font-black text-[10px] uppercase">Anatomie</TabsTrigger>
            <TabsTrigger value="techniek" className="rounded-xl font-black text-[10px] uppercase">Techniek</TabsTrigger>
          </TabsList>
          
          {renderTab(dbBlock?.content_general || "", "algemeen")}
          {renderTab(dbBlock?.content_anatomy || "", "anatomie")}
          {renderTab(dbBlock?.content_technique || "", "techniek")}
        </Tabs>
      </div>
    </div>
  );
}