import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { 
  ChevronRight, 
  ChevronLeft, 
  BookOpenCheck, 
  Clock, 
  Stethoscope, 
  Activity, 
  Zap, 
  FolderOpen, 
  Siren,
  Plus,
  Loader2
} from "lucide-react";

interface DbJournalArticle {
  id: string;
  title: string;
  content: string;
  folder?: string;
  disciplines?: string[];
  created_at: string;
}

const allArticles = import.meta.glob('../content/journal-club/*.md', { query: 'raw', eager: true });

const DISCIPLINES = [
  { id: "Anesthesie", icon: Stethoscope, color: "text-blue-500",   bg: "bg-blue-50"   },
  { id: "Intensieve", icon: Activity,    color: "text-purple-500", bg: "bg-purple-50" },
  { id: "Urgentie",   icon: Siren,       color: "text-orange-500", bg: "bg-orange-50" },
  { id: "Pijn",       icon: Zap,         color: "text-cyan-500",   bg: "bg-cyan-50"   },
];

export default function Journalclub() {
  const [activeFolder, setActiveFolder] = useState<string | null>(null);

  // 1. Haal Cloud Artikelen op
  const { data: dbArticles, isLoading: dbLoading } = useQuery({
    queryKey: ['journal-articles-cloud'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journal_club')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // 2. Data Parsing & Merging
  const processedArticles = useMemo(() => {
    // A. Parse lokale bestanden
    const local = Object.keys(allArticles).map((path) => {
      const fileName = path.split('/').pop()?.replace('.md', '') || "";
      const fileData = allArticles[path] as any;
      const rawContent = String(fileData.default || fileData || "");

      const titleMatch = rawContent.match(/title: "(.*)"/);
      const dateMatch = rawContent.match(/date: "(.*)"/);
      const discMatch = rawContent.match(/disciplines: \[(.*)\]/) || rawContent.match(/disciplines: (.*)/);
      
      const rawDisciplines = discMatch 
        ? discMatch[1].replace(/"/g, '').split(',').map(d => d.trim().toLowerCase()) 
        : [];

      const matchedDisciplines: string[] = [];
      DISCIPLINES.forEach(official => {
        const officialLower = official.id.toLowerCase();
        const hasMatch = rawDisciplines.some(input =>
          input.length >= 3 && (
            officialLower.startsWith(input) ||
            input.startsWith(officialLower.substring(0, 3)) ||
            // legacy aliases
            (officialLower === "intensieve" && input === "icu")
          )
        );
        if (hasMatch) matchedDisciplines.push(official.id);
      });

      return { 
        id: fileName, 
        title: titleMatch ? titleMatch[1] : fileName.replace(/-/g, ' '),
        date: dateMatch ? new Date(dateMatch[1]) : new Date(0),
        disciplines: matchedDisciplines.length > 0 ? matchedDisciplines : ["Varia"],
        isCloud: false
      };
    });

  // B. Transformeer Cloud items naar zelfde formaat
  const cloud = (dbArticles || []).map((art: DbJournalArticle) => ({
    id: art.id,
    title: art.title,
    // Gebruik huidige tijd als fallback zodat nieuwe artikels bovenaan sorteren
    date: art.created_at ? new Date(art.created_at) : new Date(),
    // Lege array [] is truthy → gebruik expliciete length-check
    disciplines: (Array.isArray(art.disciplines) && art.disciplines.length > 0)
      ? art.disciplines
      : ["Varia"],
    isCloud: true,
  }));

    // C. Samenvoegen en Sorteren
    return [...cloud, ...local].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [dbArticles]);

  const recentArticles = processedArticles.slice(0, 5);

  // VIEW: Folder inhoud
  if (activeFolder) {
    const filteredArticles = processedArticles.filter(a => a.disciplines.includes(activeFolder));

    return (
      <div className="space-y-6 pb-24 animate-in slide-in-from-right duration-300 max-w-2xl mx-auto px-4">
        <button onClick={() => setActiveFolder(null)} className="flex items-center text-slate-400 font-black uppercase text-[10px] tracking-widest py-4 group">
          <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Terug
        </button>
        <header className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-teal-600 text-white rounded-3xl shadow-lg"><FolderOpen size={32} /></div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase text-slate-900 leading-none">{activeFolder}</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600 mt-1">{filteredArticles.length} publicaties</p>
          </div>
        </header>
        <div className="grid grid-cols-1 w-full gap-2">
          {filteredArticles.map(article => <ArticleCard key={article.id} article={article} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-24 animate-in fade-in duration-500 max-w-2xl mx-auto px-4">
      <Link href="/"><div className="flex items-center text-slate-400 font-black uppercase text-[10px] tracking-widest cursor-pointer py-4"><ChevronLeft className="h-4 w-4 mr-1" /> Home</div></Link>
      
      <section>
        <h1 className="text-3xl font-black tracking-tightest uppercase text-slate-900 mb-2">Journal <span className="text-teal-600">Club</span></h1>
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600">Evidence Based Medicine</p>
          {dbLoading && <Loader2 className="h-3 w-3 animate-spin text-slate-300" />}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Disciplines</h2>
        
        {/* Floating Action Button voor Admin */}
        <Link href="/admin?type=journal_club">
          <button className="fixed bottom-24 right-6 p-4 bg-teal-600 text-white rounded-full shadow-2xl z-50 hover:scale-110 active:scale-95 transition-all flex items-center justify-center">
            <Plus size={24} />
          </button>
        </Link>

        <div className="grid grid-cols-1 gap-2">
          {DISCIPLINES.map((disc) => (
            <button key={disc.id} onClick={() => setActiveFolder(disc.id)} className="group flex items-center justify-between p-2 bg-white border-2 border-slate-100 rounded-[28px] hover:border-teal-500 transition-all active:scale-95">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${disc.bg} ${disc.color} group-hover:bg-teal-600 group-hover:text-white transition-colors`}><disc.icon size={20} /></div>
                <h3 className="text-base font-black uppercase tracking-tighter text-slate-800">{disc.id}</h3>
              </div>
              <ChevronRight className="text-slate-200 group-hover:text-teal-600" />
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-slate-400"><Clock size={14} /> Recentste toevoegingen</h2>
        <div className="grid gap-2">
          {recentArticles.map(a => <ArticleCard key={a.id} article={a} />)}
        </div>
      </section>
    </div>
  );
}

function ArticleCard({ article }: { article: any }) {
  return (
    <Link href={`/journalclub/${article.id}`}>
      <Card className="hover:border-teal-500 transition-all cursor-pointer border-slate-200 shadow-sm bg-white overflow-hidden group w-full">
        <CardContent className="p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className={`p-2 rounded-lg ${article.isCloud ? 'bg-teal-50 text-teal-600' : 'bg-slate-50 text-slate-400'} group-hover:bg-teal-600 group-hover:text-white shrink-0 transition-colors`}>
              <BookOpenCheck className="h-4 w-4" />
            </div>
            
            <div className="min-w-0 flex-1">
              <span className="text-sm font-bold text-slate-700 leading-snug break-words block truncate">
                {article.title}
              </span>
              
              <div className="flex flex-wrap gap-1 mt-1">
                {article.isCloud && (
                  <span className="text-[7px] font-black px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded uppercase tracking-tighter">Cloud</span>
                )}
                {article.disciplines.map((d: string) => (
                  <span key={d} className="text-[8px] font-semibold px-1.5 py-0.5 bg-slate-100 text-slate-400 rounded uppercase tracking-tighter">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300 shrink-0 group-hover:translate-x-1 transition-transform" />
        </CardContent>
      </Card>
    </Link>
  );
}