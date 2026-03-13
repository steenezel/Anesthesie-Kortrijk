import React from "react";
import { useRoute, Link } from "wouter";
import { ChevronLeft, FileWarning, Clock, Loader2, Stethoscope, Activity, Siren, Zap, Pencil, CloudDownload } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

const allJournals = import.meta.glob('../content/journal-club/*.md', { query: 'raw', eager: true });

// Configuratie voor de iconen per discipline (matcht jouw mappen)
const DISCIPLINE_CONFIG: Record<string, any> = {
  "Anesthesie": { icon: Stethoscope, color: "text-blue-500", bg: "bg-blue-50" },
  "ICU": { icon: Activity, color: "text-purple-500", bg: "bg-purple-50" },
  "Intensieve": { icon: Activity, color: "text-purple-500", bg: "bg-purple-50" }, // Alias
  "Urgentie": { icon: Siren, color: "text-orange-500", bg: "bg-orange-50" },
  "Pijn": { icon: Zap, color: "text-cyan-500", bg: "bg-cyan-50" }
};

export default function JournalDetail() {
  const [, params] = useRoute("/journalclub/:id");
  const id = params?.id;

  const { data: dbArticle, isLoading } = useQuery({
    queryKey: ['journal-article', id],
    queryFn: async () => {
      if (!id || !id.includes("-")) return null;
      const { data, error } = await supabase.from('journal_club').select('*').eq('id', id).single();
      if (error) return null;
      return data;
    },
    enabled: !!id
  });

  let content = "";
  let title = "";
  let disciplines: string[] = [];
  let date = "";

  if (dbArticle) {
    content = dbArticle.content;
    title = dbArticle.title;
    disciplines = dbArticle.disciplines || [];
    date = new Date(dbArticle.created_at).toLocaleDateString('nl-BE');
  } else {
    const fileKey = Object.keys(allJournals).find(key => key.toLowerCase().endsWith(`/${id?.toLowerCase()}.md`));
    const fileData = fileKey ? (allJournals[fileKey] as any) : null;
    const rawContent = String(fileData?.default || fileData || "").trim();
    
    content = rawContent;
    title = rawContent.split('\n')[0].replace('# ', '') || id?.replace(/-/g, ' ') || "";
    
    // Extract disciplines uit lokale tekst (bijv. zoek naar tags onder de titel)
    // Dit is de logica die je in journal-list ook gebruikt
    const lowerContent = rawContent.toLowerCase();
    if (lowerContent.includes("anesthesie")) disciplines.push("Anesthesie");
    if (lowerContent.includes("icu") || lowerContent.includes("intensieve")) disciplines.push("ICU");
    if (lowerContent.includes("urgentie")) disciplines.push("Urgentie");
    if (lowerContent.includes("pijn")) disciplines.push("Pijn");
    date = "Protocol";
  }

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>;

  if (!content) return <div className="p-10 text-center"><FileWarning className="h-10 w-10 mx-auto text-slate-300 mb-4" /><p className="font-black uppercase tracking-tighter text-slate-500">Niet gevonden</p></div>;

  return (
  <div className="min-h-screen bg-white pb-20 px-4">
    <div className="flex items-center justify-between py-4 sticky top-0 bg-white/80 backdrop-blur-md z-10">
      <Link href="/journalclub">
        <div className="flex items-center text-teal-600 font-black uppercase text-[10px] tracking-widest cursor-pointer group">
          <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 
          Terug naar overzicht
        </div>
      </Link>

      <div className="flex items-center gap-2">
        {dbArticle && (
          <Link href={`/admin?type=journal_club&id=${dbArticle.id}`}>
            <a className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-teal-600 transition-all flex items-center gap-2 font-black text-[9px] uppercase tracking-widest">
              <Pencil size={14} /> Edit
            </a>
          </Link>
        )}

        {!dbArticle && content && (
          <Link href={`/admin?migrate=${id}&type=journal_club`}>
            <a className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-all flex items-center gap-2 font-black text-[9px] uppercase tracking-widest border border-amber-100">
              <CloudDownload size={14} /> Migreer naar Cloud
            </a>
          </Link>
        )}
      </div>
    </div>

       <div className="p-6 max-w-3xl mx-auto">
        {/* DISCIPLINE TAGS BOVENAAN */}
        <div className="flex flex-wrap gap-2 mb-4">
          {disciplines.map(d => {
            const conf = DISCIPLINE_CONFIG[d] || { icon: Clock, color: "text-slate-400", bg: "bg-slate-50" };
            return (
              <span key={d} className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${conf.bg} ${conf.color} text-[10px] font-black uppercase tracking-widest`}>
                <conf.icon size={12} /> {d}
              </span>
            );
          })}
        </div>

        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-4 uppercase">
          {title}
        </h1>

        <div className="flex items-center text-slate-300 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
          <Clock className="h-3 w-3 mr-1.5" /> {date}
        </div>

        <div className="prose prose-slate max-w-none">
          <MarkdownRenderer content={content} />
        </div>
      </div>
    </div>
  );
}