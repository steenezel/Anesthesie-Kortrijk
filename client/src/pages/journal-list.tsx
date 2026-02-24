import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, BookOpenCheck, FileText } from "lucide-react";

// We halen alle markdown bestanden uit de journal-club map
const allArticles = import.meta.glob('../content/journal-club/*.md', { query: 'raw', eager: true });

export default function Journalclub() {
  // 1. Data voorbereiden
  const articles = Object.keys(allArticles).map((path) => {
    const fileName = path.split('/').pop()?.replace('.md', '') || "";
    const fileData = allArticles[path] as any;
    const rawContent = String(fileData.default || fileData || "");

    // Frontmatter titel extractie
    const titleMatch = rawContent.match(/title: "(.*)"/);
    const title = titleMatch ? titleMatch[1] : fileName.replace(/-/g, ' ');

    return { id: fileName, title };
  });

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <header className="space-y-2">
        <h1 className="text-4xl font-black tracking-tighter uppercase text-slate-900">
          Journal <span className="text-teal-600">Club</span>
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          AZ Groeninge • Literatuur & Research
        </p>
      </header>

      <hr className="border-slate-100" />

      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">
          Recent toegevoegd
        </h2>
        
        <div className="grid gap-2">
          {articles.length > 0 ? (
            articles.map((article) => (
              <Link key={article.id} href={`/journalclub/${article.id}`}>
                <Card className="hover:border-teal-500 transition-all cursor-pointer border-slate-200 shadow-none bg-white">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                        <BookOpenCheck className="h-5 w-5" />
                      </div>
                      <span className="font-bold text-slate-700 uppercase tracking-tight text-sm">
                        {article.title}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-3xl">
              <FileText className="h-8 w-8 mx-auto text-slate-200 mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Nog geen artikelen beschikbaar
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}