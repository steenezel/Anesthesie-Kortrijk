import React from "react";
import { useRoute, Link } from "wouter";
import { ChevronLeft, Clock, Loader2, Pencil, CloudDownload } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import DantroleenCalc from '../components/calculators/DantroleenCalc.js';
import SedationPedsCalculator from "@/components/calculators/SedationPedsCalculator";

const allProtocols = import.meta.glob('../content/protocols/**/*.md', { query: 'raw', eager: true });

export default function ProtocolDetail() {
  const [, params] = useRoute("/protocols/:id");
  const id = params?.id;
  const queryParams = new URLSearchParams(window.location.search);
  
  // OPGELOST: fromDiscipline ophalen uit de URL
  const fromDiscipline = queryParams.get('fromDiscipline');

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || "");

  const { data: dbProtocol, isLoading } = useQuery({
    queryKey: ['protocol', id],
    queryFn: async () => {
      if (!id || !isUuid) return null;
      const { data } = await supabase.from('protocols').select('*').eq('id', id).single();
      return data;
    },
    enabled: !!id && isUuid
  });

  const fileKey = Object.keys(allProtocols).find(key => key.toLowerCase().endsWith(`/${id?.toLowerCase()}.md`));
  const fileData = fileKey ? (allProtocols[fileKey] as any) : null;
  const localContent = fileData?.default || fileData || "";

  const title = dbProtocol?.title || localContent.match(/title: "(.*)"/)?.[1] || id?.replace(/-/g, ' ');
  const content = dbProtocol?.content || localContent.replace(/---[\s\S]*?---/, '').trim();

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-teal-600" /></div>;

  return (
    <div className="min-h-screen bg-white pb-20 px-4">
      <div className="flex items-center justify-between py-4 sticky top-0 bg-white/80 backdrop-blur-md z-10 max-w-3xl mx-auto w-full">
        <Link href={fromDiscipline ? `/protocols?discipline=${fromDiscipline}` : "/protocols"}>
          <div className="flex items-center text-teal-600 font-black uppercase text-[10px] tracking-widest cursor-pointer group">
            <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 
            {fromDiscipline ? `Terug naar ${fromDiscipline}` : "Terug"}
          </div>
        </Link>
        
        <div className="flex gap-2">
          {dbProtocol ? (
            <Link href={`/admin?type=protocols&id=${dbProtocol.id}`}>
              <div className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-teal-600 cursor-pointer flex items-center gap-2 font-black text-[9px] uppercase tracking-widest">
                <Pencil size={14} /> Edit
              </div>
            </Link>
          ) : localContent && (
            <Link href={`/admin?migrate=${id}&type=protocols`}>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl cursor-pointer flex items-center gap-2 font-black text-[9px] uppercase tracking-widest border border-amber-100">
                <CloudDownload size={14} /> Migreer
              </div>
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto mt-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900 leading-tight mb-2">
          {title}
        </h1>
        <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8">
          <Clock className="h-3 w-3 mr-1" /> 
          {dbProtocol ? `Laatste update: ${new Date(dbProtocol.created_at).toLocaleDateString('nl-BE')}` : "Lokaal bestand"}
        </div>

        <div className="prose prose-slate max-w-none">
          <MarkdownRenderer content={content} />
          {content.includes("[DANTROLEEN_CALC]") && <DantroleenCalc />}
          {content.includes("[PEDS_SEDATION_CALC]") && <SedationPedsCalculator />}
        </div>
      </div>
    </div>
  );
}