import { Link } from "wouter";
import { Folder, ChevronRight, BookOpen } from "lucide-react";

export default function ProtocolsPage() {
  // We scannen alle .tsx bestanden in de submappen van protocols
  // Dit gebeurt automatisch tijdens het builden door Vite
  const modules = import.meta.glob("./**/*.tsx");
  
  // We halen de unieke mapnamen (disciplines) eruit
  const disciplines = Array.from(
    new Set(
      Object.keys(modules)
        .map((path) => path.split("/")[1]) // Haal de mapnaam na ./ op
        .filter((name) => name !== "index.tsx") // Negeer de hoofdpagina zelf
    )
  ).sort();

  return (
    <div className="p-4 pb-24">
      <header className="mb-8 px-2">
        <h1 className="text-2xl font-bold text-slate-800">Protocollen</h1>
        <p className="text-slate-500 text-sm">AZ Groeninge - Disciplines</p>
      </header>

      <div className="grid gap-3">
        {disciplines.length > 0 ? (
          disciplines.map((discipline) => (
            <Link key={discipline} href={`/protocols/${discipline}`}>
              <a className="flex items-center p-4 bg-white rounded-xl border border-slate-200 shadow-sm active:bg-slate-50 transition-all">
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
          <div className="text-center p-10 text-slate-400">
            <BookOpen className="mx-auto mb-2 opacity-20" size={48} />
            <p>Geen disciplines gevonden in /pages/protocols/</p>
          </div>
        )}
      </div>
    </div>
  );
}