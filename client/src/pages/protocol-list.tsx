import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, BookOpen } from "lucide-react";

// CRUCIAL: Voeg { query: 'raw' } toe, anders kan hij de titel niet lezen!
const allProtocols = import.meta.glob('../content/protocols/**/*.md', { query: 'raw', eager: true });

export default function ProtocolList() {
  const protocols = Object.keys(allProtocols).map((path) => {
    const pathParts = path.split('/');
    // De discipline is de mapnaam boven het bestand
    const discipline = pathParts[pathParts.length - 2];
    const fileName = pathParts[pathParts.length - 1].replace('.md', '');
    
    const rawContent = (allProtocols[path] as any).default;
    // We zoeken de titel in de frontmatter
    const titleMatch = rawContent.match(/title: "(.*)"/);
    const title = titleMatch ? titleMatch[1] : fileName;

    return { discipline, id: fileName, title };
  });

  const grouped = protocols.reduce((acc, curr) => {
    if (!acc[curr.discipline]) acc[curr.discipline] = [];
    acc[curr.discipline].push(curr);
    return acc;
  }, {} as Record<string, typeof protocols>);

  return (
    <div className="space-y-8 pb-20">
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tighter uppercase text-slate-900">
          Protocollen <span className="text-blue-600">Anesthesie</span>
        </h1>
        <p className="text-slate-500 font-medium italic text-sm">Update: {new Date().getFullYear()}</p>
      </div>

      {Object.entries(grouped).length === 0 && (
        <div className="p-10 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400 font-bold uppercase text-xs">
          Geen Markdown bestanden gevonden in /content/protocols/
        </div>
      )}

      {Object.entries(grouped).map(([discipline, items]) => (
        <div key={discipline} className="space-y-3">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2">
            <div className="h-1 w-1 bg-blue-500 rounded-full"></div>
            {discipline}
          </h2>
          <div className="grid gap-2">
            {items.map((protocol) => (
              <Link key={protocol.id} href={`/protocols/${protocol.discipline}/${protocol.id}`}>
                <Card className="hover:border-blue-500 transition-all cursor-pointer group border-slate-200 shadow-none hover:shadow-md">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-4 w-4 text-slate-300 group-hover:text-blue-500" />
                      <span className="font-bold text-slate-700 uppercase tracking-tight text-sm">
                        {protocol.title}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}