import React from "react";
import { useRoute, Link } from "wouter";
import { ChevronLeft, FileWarning, Clock, Loader2, Pencil, CloudDownload } from "lucide-react";
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
  const fromDiscipline = queryParams.get('fromDiscipline');

  const { data: dbProtocol, isLoading } = useQuery({
    queryKey: ['protocol', id],
    queryFn: async () => {
      if (!id || !id.includes("-")) return null;
      const { data } = await supabase.from('protocols').select('*').eq('id', id).single();
      return data;
    },
    enabled: !!id
  });

  let content = "";
  let title = "";

  if (dbProtocol) {
    content = dbProtocol.content;
    title = dbProtocol.title;
  } else {
    const fileKey = Object.keys(allProtocols).find(key => key.toLowerCase().endsWith(`/${id?.toLowerCase()}.md`));
    const fileData = fileKey ? (allProtocols[fileKey] as any) : null;
    content = String(fileData?.default || fileData || "").trim();
    title = content.split('\n')[0].replace('# ', '') || id?.replace(/-/g, ' ') || "";
  }

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-teal-600" /></div>;
  if (!content) return <div className="p-10 text-center"><FileWarning className="mx-auto mb-4 text-slate-300" /><p className="font-black uppercase text-slate-500">Protocol niet gevonden</p></div>;

return (
  <div className="min-h-screen bg-white pb-20 px-4">
    {/* Header balk met Terug-knop links en Edit/Migreer rechts */}
    <div className="flex items-center justify-between py-4 sticky top-0 bg-white/80 backdrop-blur-md z-10">
      <Link href={fromDiscipline ? `/protocols?discipline=${fromDiscipline}` : "/protocols"}>
        <div className="flex items-center text-teal-600 font-black uppercase text-[10px] tracking-widest cursor-pointer group">
          <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 
          {fromDiscipline ? `Terug naar ${fromDiscipline}` : "Terug"}
        </div>
      </Link>

      <div className="flex items-center gap-2">
        {/* EDIT KNOP: Verschijnt alleen als het protocol uit Supabase komt */}
        {dbProtocol && (
          <Link href={`/admin?type=protocols&id=${dbProtocol.id}`}>
            <a className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-teal-600 hover:bg-teal-50 transition-all flex items-center gap-2 font-black text-[9px] uppercase tracking-widest">
              <Pencil size={14} /> Edit
            </a>
          </Link>
        )}

        {/* MIGREER KNOP: Verschijnt alleen als het een lokaal .md bestand is */}
        {!dbProtocol && content && (
          <Link href={`/admin?migrate=${id}&type=protocols`}>
            <a className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-all flex items-center gap-2 font-black text-[9px] uppercase tracking-widest border border-amber-100">
              <CloudDownload size={14} /> Migreer naar Cloud
            </a>
          </Link>
        )}
      </div>
    </div>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900 leading-tight mb-2 italic">
          {title}
        </h1>
        <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8">
          <Clock className="h-3 w-3 mr-1" /> Laatste update: {new Date().toLocaleDateString('nl-BE')}
        </div>

        <div className="prose prose-slate max-w-none">
          <MarkdownRenderer content={content} />
          
          {/* CALCULATOR SHORTCODES */}
          {content.includes("[DANTROLEEN_CALC]") && <div className="mt-8 pt-8 border-t border-slate-100"><DantroleenCalc /></div>}
          {content.includes("[PEDS_MRI_CALC]") && <div className="mt-8 pt-8 border-t border-slate-100"><SedationPedsCalculator /></div>}
        </div>
      </div>
    </div>
  );
}