import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ChevronRight, 
  ChevronLeft, 
  BookOpenCheck, 
  Clock, 
  Stethoscope, 
  Activity, 
  Zap, 
  FolderOpen 
} from "lucide-react";

const allArticles = import.meta.glob('../content/journal-club/*.md', { query: 'raw', eager: true });

const DISCIPLINES = [
  { id: "Anesthesie", icon: Stethoscope, color: "text-blue-500", bg: "bg-blue-50" },
  { id: "ICU", icon: Activity, color: "text-purple-500", bg: "bg-purple-50" },
  { id: "Urgentie", icon: Zap, color: "text-orange-500", bg: "bg-orange-50" },
];

export default function Journalclub() {
  const [activeFolder, setActiveFolder] = useState<string | null>(null);

  // 1. Data Parsing met FUZZY LOGICA
  const processedArticles = useMemo(() => {
    return Object.keys(allArticles).map((path) => {
      const fileName = path.split('/').pop()?.replace('.md', '') || "";
      const fileData = allArticles[path] as any;
      const rawContent = String(fileData.default || fileData || "");

      const titleMatch = rawContent.match(/title: "(.*)"/);
      const dateMatch = rawContent.match(/date: "(.*)"/);
      const discMatch = rawContent.match(/disciplines: \[(.*)\]/) || rawContent.match(/disciplines: (.*)/);
      
      // Raw input naar lowercase array
      const rawDisciplines = discMatch 
        ? discMatch[1].replace(/"/g, '').split(',').map(d => d.trim().toLowerCase()) 
        : [];

      // Fuzzy matching naar de officiële IDs
      const matchedDisciplines: string[] = [];

      DISCIPLINES.forEach(official => {
        const officialLower = official.id.toLowerCase();
        const hasMatch = rawDisciplines.some(input => 
          input.length >= 3 && (officialLower.startsWith(input) || input === "icu")
        );
        if (hasMatch) matchedDisciplines.push(official.id);
      });

      // Fallback naar Varia
      const finalDisciplines = matchedDisciplines.length > 0 ? matchedDisciplines : ["Varia"];

      return { 
        id: fileName, 
        title: titleMatch ? titleMatch[1] : fileName.replace(/-/g, ' '),
        date: dateMatch ? new Date(dateMatch[1]) : new Date(0),
        disciplines: finalDisciplines
      };
    }).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, []);

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

  // VIEW: Hoofdmenu
  return (
    <div className="space-y-10 pb-24 animate-in fade-in duration-500 max-w-2xl mx-auto px-4">
      <Link href="/"><div className="flex items-center text-slate-400 font-black uppercase text-[10px] tracking-widest cursor-pointer py-4"><ChevronLeft className="h-4 w-4 mr-1" /> Home</div></Link>
      
      <section>
        <h1 className="text-5xl font-black tracking-tighter uppercase text-slate-900 mb-2">Journal <span className="text-teal-600">Club</span></h1>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600">Evidence Based Medicine</p>
      </section>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400"><Clock size={14} /> Nieuwste updates</h2>
        <div className="grid gap-2">{recentArticles.map(a => <ArticleCard key={a.id} article={a} />)}</div>
      </section>

      <section className="space-y-4">
        <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Disciplines</h2>
        <div className="grid grid-cols-1 gap-3">
          {DISCIPLINES.map((disc) => (
            <button key={disc.id} onClick={() => setActiveFolder(disc.id)} className="group flex items-center justify-between p-5 bg-white border-2 border-slate-100 rounded-[28px] hover:border-teal-500 transition-all active:scale-95">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${disc.bg} ${disc.color} group-hover:bg-teal-600 group-hover:text-white transition-colors`}><disc.icon size={20} /></div>
                <h3 className="text-base font-black uppercase tracking-tighter text-slate-800">{disc.id}</h3>
              </div>
              <ChevronRight className="text-slate-200 group-hover:text-teal-600" />
            </button>
          ))}
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
            {/* Icoon iets compacter */}
            <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-teal-600 shrink-0">
              <BookOpenCheck className="h-4 w-4" />
            </div>
            
            <div className="min-w-0 flex-1">
              {/* Titel: Gewone tekst, kleiner lettertype, geen all-caps */}
              <span className="text-sm font-semibold text-slate-700 leading-tight block truncate">
                {article.title}
              </span>
              
              {/* Tags: Iets subtieler */}
              <div className="flex flex-wrap gap-1 mt-1">
                {article.disciplines.map((d: string) => (
                  <span key={d} className="text-[7px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-400 rounded uppercase tracking-tighter">
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