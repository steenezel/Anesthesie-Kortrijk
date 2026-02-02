import { Link } from "wouter";
import { Folder, ChevronRight, BookOpen } from "lucide-react";

export default function ProtocolsPage() {
  // We scannen alle bestanden in submappen
  const modules = import.meta.glob("./**/*.tsx");
  
  const disciplines = Array.from(
    new Set(
      Object.keys(modules)
        .map((path) => {
          const parts = path.split("/");
          // Alleen paden als "./mapnaam/bestand.tsx" (lengte 3 of meer)
          // Index 1 is de mapnaam
          return parts.length >= 3 ? parts[1] : null;
        })
        .filter((name): name is string => 
          name !== null && 
          name !== "index.tsx" && 
          name !== "DisciplineDetail" // Sluit het component zelf uit
        )
    )
  ).sort();

  return (
    <div className="p-4 pb-24">
      <header className="mb-8 px-2">
        <h1 className="text-2xl font-bold text-slate-800">Protocollen</h1>
        <p className="text-slate-500 text-sm font-medium">Vakgroep Anesthesie Kortrijk</p>
      </header>

      <div className="grid gap-3">
        {disciplines.length > 0 ? (
          disciplines.map((discipline) => (
            <Link key={discipline} href={`/protocols/${discipline}`}>
              <a className="flex items-center p-4 bg-white rounded-xl border border-slate-200 shadow-sm active:scale-[0.98] transition-all">
                <div className="p-2 bg-teal-50 rounded-lg mr-4 text-teal-600">
                  <Folder size={20} />
                </div>
                <span className="flex-1 font-semibold text-slate-700 capitalize">
                  {discipline.replace("-", " ")}
                </span>
                <ChevronRight className="text-slate-300" size={18} />
              </a>
            </Link>
          ))
        ) : (
          <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-slate-200">
            <BookOpen className="mx-auto mb-3 text-slate-300" size={40} />
            <p className="text-slate-400 text-sm">Geen disciplines gevonden.</p>
          </div>
        )}
      </div>
    </div>
  );
}