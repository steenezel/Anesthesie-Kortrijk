import React from "react";
import { useRoute, Link } from "wouter";
import { ChevronLeft, Clock, Loader2, Stethoscope, Activity, Siren, Zap, Pencil, CloudDownload } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

const allJournals = import.meta.glob('../content/journal-club/*.md', { query: 'raw', eager: true });

const DISCIPLINE_CONFIG: Record<string, any> = {
  "Anesthesie": { icon: Stethoscope, color: "text-blue-500", bg: "bg-blue-50" },
  "Intensieve": { icon: Activity, color: "text-purple-500", bg: "bg-purple-50" },
  "Urgentie": { icon: Siren, color: "text-orange-500", bg: "bg-orange-50" },
  "Pijn": { icon: Zap, color: "text-cyan-500", bg: "bg-cyan-50" }
};

export default function JournalDetail() {
  const [, params] = useRoute("/journalclub/:id");
  const id = params?.id;

  // 1. UUID Check
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || "");

  const { data: dbArticle, isLoading } = useQuery({
    queryKey: ['journal-article', id],
    queryFn: async () => {
      if (!id || !isUuid) return null;
      const { data } = await supabase.from('journal_club').select('*').eq('id', id).single();
      return data;
    },
    enabled: !!id && isUuid
  });

  // 2. Lokale fallback
  const fileKey = Object.keys(allJournals).find(key => key.toLowerCase().endsWith(`/${id?.toLowerCase()}.md`));
  const fileData = fileKey ? (allJournals[fileKey] as any) : null;
  const rawContent = fileData?.default || fileData || "";

  const title = dbArticle?.title || rawContent.match(/title: "(.*)"/)?.[1] || id?.replace(/-/g, ' ');
  const content = dbArticle?.content || rawContent.replace(/---[\s\S]*?---/, '').trim();
  const disciplines = dbArticle?.disciplines || rawContent.match(/disciplines: \[(.*)\]/)?.[1]?.replace(/"/g, '').split(',') || [];

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-teal-600" /></div>;

  return (
    <div className="min-h-screen bg-white pb-20 px-4">
      <div className="flex items-center justify-between py-4 sticky top-0 bg-white/80 backdrop-blur-md z-10 max-w-3xl mx-auto w-full">
        <Link href="/journalclub">
          <div className="flex items-center text-teal-600 font-black uppercase text-[10px] tracking-widest cursor-pointer group">
            <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Overzicht
          </div>
        </Link>
        <div className="flex gap-2">
          {dbArticle ? (
            <Link href={`/admin?type=journal_club&id=${dbArticle.id}`}>
              <div className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-teal-600 cursor-pointer flex items-center gap-2 font-black text-[9px] uppercase tracking-widest">
                <Pencil size={14} /> Edit
              </div>
            </Link>
          ) : rawContent && (
            <Link href={`/admin?migrate=${id}&type=journal_club`}>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl cursor-pointer flex items-center gap-2 font-black text-[9px] uppercase tracking-widest border border-amber-100">
                <CloudDownload size={14} /> Migreer naar Cloud
              </div>
            </Link>
          )}
        </div>
      </div>

      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex flex-wrap gap-2 mb-4">
          {disciplines.map((d: string) => {
            const cleanD = d.trim();
            const conf = DISCIPLINE_CONFIG[cleanD] || { icon: Clock, color: "text-slate-400", bg: "bg-slate-50" };
            return (
              <span key={cleanD} className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${conf.bg} ${conf.color} text-[10px] font-black uppercase tracking-widest`}>
                <conf.icon size={12} /> {cleanD}
              </span>
            );
          })}
        </div>

        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-4 uppercase italic">
          {title}
        </h1>
        
        <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-300 mb-8 pb-8 border-b border-slate-50">
          <Clock className="h-3 w-3 mr-1" /> 
          {dbArticle ? `Cloud Sync: ${new Date(dbArticle.created_at).toLocaleDateString('nl-BE')}` : "Lokaal bestand"}
        </div>

        <div className="prose prose-slate max-w-none">
          <MarkdownRenderer content={content} />
        </div>
      </div>
    </div>
  );
}