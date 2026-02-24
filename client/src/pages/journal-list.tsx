import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, ChevronLeft, BookOpenCheck, FileText, Clock, Stethoscope, Activity, Zap } from "lucide-react";

const allArticles = import.meta.glob('../content/journal-club/*.md', { query: 'raw', eager: true });

const DISCIPLINES = ["Anesthesie", "ICU", "Urgentie"];

export default function Journalclub() {
  // 1. Data voorbereiden met uitgebreide parsing
  const articles = Object.keys(allArticles).map((path) => {
    const fileName = path.split('/').pop()?.replace('.md', '') || "";
    const fileData = allArticles[path] as any;
    const rawContent = String(fileData.default || fileData || "");

    const titleMatch = rawContent.match(/title: "(.*)"/);
    const dateMatch = rawContent.match(/date: "(.*)"/);
    // Zoek naar disciplines: ["A", "B"] of disciplines: A, B
    const discMatch = rawContent.match(/disciplines: \[(.*)\]/) || rawContent.match(/disciplines: (.*)/);
    
    const disciplines = discMatch 
      ? discMatch[1].replace(/"/g, '').split(',').map(d => d.trim()) 
      : [];

    return { 
      id: fileName, 
      title: titleMatch ? titleMatch[1] : fileName.replace(/-/g, ' '),
      date: dateMatch ? new Date(dateMatch[1]) : new Date(0),
      disciplines
    };
  });

  // Sorteren op datum (nieuwste eerst)
  const sortedArticles = [...articles].sort((a, b) => b.date.getTime() - a.date.getTime());
  
  // De 5 nieuwste
  const recentArticles = sortedArticles.slice(0, 5);

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-500 max-w-2xl mx-auto px-4">
      <Link href="/">
        <div className="flex items-center text-slate-400 font-black uppercase text-[10px] tracking-widest cursor-pointer py-4 group">
          <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 
          Terug naar Home
        </div>
      </Link>

      <section>
        <h1 className="text-4xl font-black tracking-tighter uppercase text-slate-900 mb-2">Journal Club</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600">Wetenschappelijke Updates AZ Groeninge</p>
      </section>

      {/* RECENT TOEGEVOEGD */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
          <Clock className="h-4 w-4" /> Recent Toegevoegd
        </h2>
        <div className="grid gap-2">
          {recentArticles.map(article => <ArticleCard key={article.id} article={article} />)}
        </div>
      </section>

      {/* SECTIES PER DISCIPLINE */}
      {DISCIPLINES.map(disc => {
        const discArticles = sortedArticles.filter(a => a.disciplines.includes(disc));
        if (discArticles.length === 0) return null;

        return (
          <section key={disc} className="space-y-3 pt-4">
            <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-900">
              {disc === "Anesthesie" && <Stethoscope className="h-4 w-4 text-blue-500" />}
              {disc === "ICU" && <Activity className="h-4 w-4 text-purple-500" />}
              {disc === "Urgentie" && <Zap className="h-4 w-4 text-orange-500" />}
              {disc}
            </h2>
            <div className="grid gap-2">
              {discArticles.map(article => <ArticleCard key={article.id} article={article} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}

// Herbruikbaar kaartje
function ArticleCard({ article }: { article: any }) {
  return (
    <Link href={`/journalclub/${article.id}`}>
      <Card className="hover:border-teal-500 transition-all cursor-pointer border-slate-200 shadow-sm bg-white overflow-hidden">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <div className="p-2 bg-slate-50 rounded-lg text-slate-400 shrink-0">
              <BookOpenCheck className="h-5 w-5" />
            </div>
            <div className="truncate">
              <span className="font-bold text-slate-700 uppercase tracking-tight text-sm block truncate">
                {article.title}
              </span>
              <div className="flex gap-1 mt-1">
                {article.disciplines.map((d: string) => (
                  <span key={d} className="text-[8px] font-black px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded uppercase">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
        </CardContent>
      </Card>
    </Link>
  );
}