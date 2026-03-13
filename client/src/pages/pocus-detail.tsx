import React from "react";
import { useRoute, Link } from "wouter";
import { ChevronLeft, FileWarning, Loader2, Pencil, CloudDownload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

const allPocus = import.meta.glob('../content/pocus/*.md', { query: 'raw', eager: true });

export default function PocusDetail() {
  const [, params] = useRoute("/pocus/:id");
  const id = params?.id;

  const queryParams = new URLSearchParams(window.location.search);
  const backUrl = queryParams.get('from') || '/pocus';
  const isFromProtocol = queryParams.has('from');

  const fileKey = Object.keys(allPocus).find(key => key.toLowerCase().endsWith(`/${id?.toLowerCase()}.md`));
  const fileData = fileKey ? (allPocus[fileKey] as any) : null;
  const rawContent = fileData?.default || fileData;

  const { data: dbPocus, isLoading } = useQuery({
    queryKey: ['pocus', id],
    queryFn: async () => {
      if (!id || !id.includes("-")) return null;
      const { data } = await supabase.from('pocus').select('*').eq('id', id).single();
      return data;
    },
    enabled: !!id
  });

  // Hulpfunctie om lokale bestanden te parsen naar de 3 secties (zoals in je origineel)
  const getLocalData = () => {
    const fileKey = Object.keys(allPocus).find(key => key.toLowerCase().endsWith(`/${id?.toLowerCase()}.md`));
    const fileData = fileKey ? (allPocus[fileKey] as any) : null;
    const raw = String(fileData?.default || fileData || "");
    
    // Simpele split logica op basis van je huidige titels
    const sections = raw.split(/## /);
    return {
      title: raw.split('\n')[0].replace('# ', '') || id?.replace(/-/g, ' '),
      indicaties: sections.find(s => s.toLowerCase().startsWith('indicaties')) || "",
      techniek: sections.find(s => s.toLowerCase().startsWith('techniek')) || "",
      interpretatie: sections.find(s => s.toLowerCase().startsWith('interpretatie')) || ""
    };
  };

  const local = !dbPocus ? getLocalData() : null;
  const title = dbPocus?.title || local?.title;

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-teal-600" /></div>;

  return (
  <div className="min-h-screen bg-white pb-20 px-4">
    <div className="flex items-center justify-between py-4 sticky top-0 bg-white/80 backdrop-blur-md z-10">
      <Link href={backUrl}>
        <div className="flex items-center text-blue-600 font-black uppercase text-[10px] tracking-widest cursor-pointer group">
          <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 
          {isFromProtocol ? "Terug naar Protocol" : "Terug naar Pocus"}
        </div>
      </Link>

      <div className="flex items-center gap-2">
        {dbPocus && (
          <Link href={`/admin?type=pocus&id=${dbPocus.id}`}>
            <a className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-blue-600 transition-all flex items-center gap-2 font-black text-[9px] uppercase tracking-widest">
              <Pencil size={14} /> Edit
            </a>
          </Link>
        )}

        {!dbPocus && rawContent && (
          <Link href={`/admin?migrate=${id}&type=pocus`}>
            <a className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-all flex items-center gap-2 font-black text-[9px] uppercase tracking-widest border border-amber-100">
              <CloudDownload size={14} /> Migreer naar Cloud
            </a>
          </Link>
        )}
      </div>
    </div>
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-8 italic text-slate-900">
          {title}
        </h1>

        <Tabs defaultValue="indicaties" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100 rounded-2xl p-1">
            <TabsTrigger value="indicaties" className="rounded-xl font-black text-[10px] uppercase">Indicaties</TabsTrigger>
            <TabsTrigger value="techniek" className="rounded-xl font-black text-[10px] uppercase">Techniek</TabsTrigger>
            <TabsTrigger value="interpretatie" className="rounded-xl font-black text-[10px] uppercase">Interpretatie</TabsTrigger>
          </TabsList>
          
          <TabsContent value="indicaties" className="mt-6 prose prose-slate max-w-none">
            <MarkdownRenderer content={dbPocus?.content_indicaties || local?.indicaties || ""} />
          </TabsContent>
          
          <TabsContent value="techniek" className="mt-6 prose prose-slate max-w-none">
            <MarkdownRenderer content={dbPocus?.content_techniek || local?.techniek || ""} />
          </TabsContent>
          
          <TabsContent value="interpretatie" className="mt-6 prose prose-slate max-w-none">
            <MarkdownRenderer content={dbPocus?.content_interpretatie || local?.interpretatie || ""} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}