import { useRoute, Link } from "wouter";
import { ChevronLeft, FileText, BookOpen } from "lucide-react";

export default function DisciplineDetail() {
  const [, params] = useRoute("/protocols/:discipline");
  const discipline = params?.discipline;

  // We scannen alle Markdown-bestanden in de submappen
  const modules = import.meta.glob("./**/*.md");
  const allPaths = Object.keys(modules);
  
  // Filter de protocollen die bij de geselecteerde discipline horen
  const protocols = allPaths
    .filter((path) => {
      const parts = path.split("/");
      // Match alleen als het bestand in de map van de discipline staat
      // Pad-structuur: ./discipline/protocol-naam.md
      return parts.length >= 2 && parts[1] === discipline;
    })
    .map((path) => {
      const fileName = path.split("/").pop()?.replace(".md", "");
      return { 
        name: fileName || "Naamloos protocol", 
        path: `/protocols/${fileName}` 
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="p-4 pb-24 animate-in fade-in duration-500">
      {/* NAVIGATIE & HEADER */}
      <header className="mb-8 px-2 space-y-4">
        <Link href="/protocols">
          <div className="flex items-center text-teal-600 font-black uppercase text-[10px] tracking-widest cursor-pointer group">
            <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 
            Terug naar disciplines
          </div>
        </Link>
        
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-tight">
            {discipline?.replace(/-/g, " ")}
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Dienst Anesthesie Kortrijk • Protocollen
          </p>
        </div>
      </header>

      {/* PROTOCOL LIJST */}
      <div className="grid gap-3">
        {protocols.length > 0 ? (
          protocols.map((proto) => (
            <Link key={proto.path} href={proto.path}>
              <div className="flex items-center p-5 bg-white rounded-2xl border-2 border-slate-100 shadow-sm active:scale-[0.98] transition-all cursor-pointer group hover:border-teal-200 hover:shadow-md">
                <div className="p-3 bg-slate-50 rounded-xl mr-4 text-slate-400 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
                  <FileText size={20} />
                </div>
                <span className="flex-1 font-black text-slate-800 uppercase tracking-tight text-sm">
                  {proto.name.replace(/-/g, " ")}
                </span>
                <ChevronRight className="text-slate-200 group-hover:text-teal-600 transition-colors" size={20} />
              </div>
            </Link>
          ))
        ) : (
          /* EMPTY STATE */
          <div className="text-center p-16 bg-white rounded-[32px] border-2 border-dashed border-slate-100">
            <BookOpen className="mx-auto mb-4 text-slate-100" size={48} />
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] italic">
              Geen protocollen gevonden in deze categorie.
            </p>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="mt-12 pt-6 border-t border-slate-50 text-center">
        <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest px-8 leading-relaxed">
          Raadpleeg bij twijfel altijd een senior staflid.
        </p>
      </div>
    </div>
  );
}