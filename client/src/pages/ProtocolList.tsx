import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, BookOpen } from "lucide-react";

// We scannen alle markdown bestanden in de mappen
const allProtocols = import.meta.glob('../content/protocols/**/*.md', { eager: true });

export default function ProtocolList() {
  // We transformeren de bestandslijst naar een bruikbare structuur
  const protocols = Object.keys(allProtocols).map((path) => {
    const pathParts = path.split('/');
    const discipline = pathParts[pathParts.length - 2];
    const fileName = pathParts[pathParts.length - 1].replace('.md', '');
    
    // We proberen de titel uit de inhoud te vissen (simpele extractie)
    const content = allProtocols[path] as any;
    const titleMatch = content.default?.match(/title: "(.*)"/);
    const title = titleMatch ? titleMatch[1] : fileName;

    return { discipline, id: fileName, title };
  });

  // Groeperen per discipline
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
        <p className="text-slate-500 font-medium italic text-sm">Stafleden Kortrijk - Update 2026</p>
      </div>

      {Object.entries(grouped).map(([discipline, items]) => (
        <div key={discipline} className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <div className="h-px w-4 bg-slate-300"></div>
            {discipline}
          </h2>
          <div className="grid gap-2">
            {items.map((protocol) => (
              <Link key={protocol.id} href={`/protocols/${protocol.discipline}/${protocol.id}`}>
                <Card className="hover:border-blue-500 transition-all cursor-pointer group border-slate-200">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                        <BookOpen className="h-4 w-4 text-slate-400 group-hover:text-blue-500" />
                      </div>
                      <span className="font-bold text-slate-700 uppercase tracking-tight text-sm">
                        {protocol.title}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
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