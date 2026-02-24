import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ChevronRight, 
  ChevronLeft, 
  BookOpen, 
  Stethoscope, 
  Activity, 
  Scissors, 
  Baby, 
  HeartPulse 
} from "lucide-react";

// Scan alle markdown bestanden in de protocols map
const allProtocols = import.meta.glob('../content/protocols/**/*.md', { query: 'raw', eager: true });

export default function ProtocolList() {
  // State om bij te houden welke discipline we bekijken
  const [activeDiscipline, setActiveDiscipline] = useState<string | null>(null);

  // 1. Data verwerken
  const protocols = useMemo(() => {
    return Object.keys(allProtocols).map((path) => {
      const pathParts = path.split('/');
      let discipline = pathParts[pathParts.length - 2];
      
      // Fallback voor bestanden die niet in een submap staan
      if (discipline.toLowerCase() === 'protocols') {
        discipline = 'Algemeen';
      }

      const fileName = pathParts[pathParts.length - 1].replace('.md', '');
      const fileData = allProtocols[path] as any;
      const rawContent = fileData.default || fileData;
      
      // Zoek titel in frontmatter
      const titleMatch = typeof rawContent === 'string' ? rawContent.match(/title: "(.*)"/) : null;
      const title = titleMatch ? titleMatch[1] : fileName.replace(/-/g, ' ');

      return { discipline, id: fileName, title };
    });
  }, []);

  // Unieke lijst van disciplines maken voor de "mappen"
  const disciplines = useMemo(() => {
    const unique = Array.from(new Set(protocols.map(p => p.discipline)));
    return unique.sort();
  }, [protocols]);

  // Protocollen filteren op de gekozen discipline
  const filteredProtocols = protocols.filter(p => p.discipline === activeDiscipline);

  // Icon helper
  const getIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'orthopedie': return <Scissors className="h-5 w-5" />;
      case 'pediatrie': return <Baby className="h-5 w-5" />;
      case 'cardio': return <HeartPulse className="h-5 w-5" />;
      case 'algemeen': return <Stethoscope className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  return (
    <div className="p-4 pb-24 space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER LOGICA */}
      {!activeDiscipline ? (
        <div className="space-y-2">
          <Link href="/">
            <div className="flex items-center text-slate-400 font-black uppercase text-[10px] tracking-widest cursor-pointer mb-4 group">
              <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 
              Home
            </div>
          </Link>
          <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900">Protocollen</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">AZ Groeninge • Disciplines</p>
        </div>
      ) : (
        <div className="space-y-2">
          <button 
            onClick={() => setActiveDiscipline(null)}
            className="flex items-center text-teal-600 font-black uppercase text-[10px] tracking-widest cursor-pointer mb-4 group border-none bg-transparent p-0"
          >
            <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 
            Terug naar disciplines
          </button>
          <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900">{activeDiscipline}</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{filteredProtocols.length} Richtlijnen beschikbaar</p>
        </div>
      )}

      <hr className="border-slate-100" />

      {/* SCHERM 1: LIJST MET DISCIPLINES (MAPPEN) */}
      {!activeDiscipline && (
        <div className="grid grid-cols-1 gap-3 animate-in fade-in duration-300">
          {disciplines.map((discipline) => (
            <Card 
              key={discipline} 
              onClick={() => setActiveDiscipline(discipline)}
              className="hover:border-blue-400 transition-all cursor-pointer border-slate-200 shadow-none active:scale-[0.98] group"
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {getIcon(discipline)}
                  </div>
                  <span className="font-bold text-slate-700 uppercase tracking-tight text-sm">
                    {discipline}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* SCHERM 2: LIJST MET PROTOCOLLEN VOOR DE GEKOZEN DISCIPLINE */}
      {activeDiscipline && (
        <div className="grid gap-2 animate-in slide-in-from-right-4 duration-300">
          {filteredProtocols.map((protocol) => (
            <Link 
              key={protocol.id} 
              href={`/protocols/${protocol.id}?fromDiscipline=${encodeURIComponent(activeDiscipline)}`}
            >
              <Card className="hover:border-teal-400 transition-all cursor-pointer border-slate-200 shadow-none">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-4 w-4 text-slate-300" />
                    <span className="font-bold text-slate-700 uppercase tracking-tight text-sm">
                      {protocol.title}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}