import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, BookOpen, Stethoscope, Activity, Scissors } from "lucide-react";

const allProtocols = import.meta.glob('../content/protocols/**/*.md', { query: 'raw', eager: true });

export default function ProtocolList() {
  const [selectedDiscipline, setSelectedDiscipline] = useState<string | null>(null);

  // 1. Data voorbereiden uit de bestanden
  const protocols = Object.keys(allProtocols).map((path) => {
    const pathParts = path.split('/');
    let discipline = pathParts[pathParts.length - 2];
    
    // Als de discipline 'protocols' is, betekent het dat het bestand in de hoofdmap staat
    if (discipline.toLowerCase() === 'protocols') {
      discipline = 'Algemeen';
    }

    const fileName = pathParts[pathParts.length - 1].replace('.md', '');
    const fileData = allProtocols[path] as any;
    const rawContent = fileData.default || fileData;
    
    const titleMatch = typeof rawContent === 'string' ? rawContent.match(/title: "(.*)"/) : null;
    const title = titleMatch ? titleMatch[1] : fileName.replace(/-/g, ' ');

    return { discipline, id: fileName, title };
  });

  // 2. Unieke disciplines ophalen voor het keuzemenu
  const disciplines = Array.from(new Set(protocols.map(p => p.discipline)));

  // 3. Filter de lijst op basis van selectie
  const filteredProtocols = selectedDiscipline 
    ? protocols.filter(p => p.discipline === selectedDiscipline)
    : [];

  return (
    <div className="space-y-8 pb-20">
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tighter uppercase text-slate-900">
          Protocollen <span className="text-blue-600">Anesthesie</span>
        </h1>
        <p className="text-slate-500 font-medium italic text-sm underline decoration-blue-200">
          Maak een keuze uit de disciplines
        </p>
      </div>

      {/* STAP 1: HET KEUZEMENU (DISCIPLINES) */}
      <div className="grid grid-cols-2 gap-3">
        {disciplines.map((disc) => (
          <button
            key={disc}
            onClick={() => setSelectedDiscipline(disc === selectedDiscipline ? null : disc)}
            className={`p-4 rounded-xl border-2 transition-all text-left flex flex-col gap-3 ${
              selectedDiscipline === disc 
                ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100" 
                : "border-slate-100 bg-white hover:border-slate-300 shadow-sm"
            }`}
          >
            <div className={`p-2 w-fit rounded-lg ${selectedDiscipline === disc ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
              <Scissors className="h-5 w-5" />
            </div>
            <span className="font-black uppercase tracking-tighter text-sm leading-none">
              {disc}
            </span>
          </button>
        ))}
      </div>

      {/* STAP 2: DE LIJST MET INGREPEN (VERSCHIJNT BIJ SELECTIE) */}
      {selectedDiscipline && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-xs font-black uppercase tracking-widest text-blue-600">
              Ingrepen: {selectedDiscipline}
            </h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              {filteredProtocols.length} items
            </span>
          </div>

          <div className="grid gap-2">
            {filteredProtocols.map((protocol) => (
              <Link key={protocol.id} href={`/protocols/${protocol.discipline}/${protocol.id}`}>
                <Card className="hover:border-blue-400 transition-all cursor-pointer group border-slate-200 shadow-none hover:shadow-md active:scale-[0.98]">
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
      )}

      {/* Placeholder als er nog niets gekozen is */}
      {!selectedDiscipline && (
        <div className="py-20 text-center space-y-3 opacity-40">
          <Activity className="h-8 w-8 mx-auto text-slate-300" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Selecteer een discipline om de lijst te laden
          </p>
        </div>
      )}
    </div>
  );
}