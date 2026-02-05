import { Link } from "wouter";
import { Folder, ChevronRight, BookOpen } from "lucide-react";

export default function ProtocolsPage() {
  // We scannen alle Markdown-bestanden in de submappen
  const modules = import.meta.glob("./**/*.md");
  
  // We extraheren de disciplines uit de mappenstructuur (bijv. ./iz/protocol.md -> iz)
  const disciplines = Array.from(
    new Set(
      Object.keys(modules)
        .map((path) => {
          const parts = path.split("/");
          // Pad is "./discipline/bestand.md"
          // parts[0] = "."
          // parts[1] = "discipline-naam"
          return parts.length >= 2 ? parts[1] : null;
        })
        .filter((name): name is string => name !== null)
    )
  ).sort();

  return (
    <div className="p-4 pb-24 animate-in fade-in duration-500">
      {/* HEADER: Aansluitend bij je Home-pagina design */}
      <header className="mb-8 px-2 space-y-1">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
          Protocollen
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Vakgroep Anesthesie Kortrijk • AZ Groeninge
        </p>
      </header>

      {/* DISCIPLINE GRID */}
      <div className="grid gap-3">
        {disciplines.length > 0 ? (
          disciplines.map((discipline) => (
            <Link key={discipline} href={`/protocols/${discipline}`}>
              <div className="flex items-center p-5 bg-white rounded-2xl border-2 border-slate-100 shadow-sm active:scale-[0.98] transition-all cursor-pointer group hover:border-teal-200 hover:shadow-md">
                <div className="p-3 bg-teal-50 rounded-xl mr-4 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
                  <Folder size={20} />
                </div>
                <span className="flex-1 font-black text-slate-800 uppercase tracking-tight text-sm">
                  {discipline.replace(/-/g, " ")}
                </span>
                <ChevronRight className="text-slate-200 group-hover:text-teal-600 transition-colors" size={20} />
              </div>
            </Link>
          ))
        ) : (
          /* EMPTY STATE: Voor als er nog geen .md bestanden zijn gevonden */
          <div className="text-center p-16 bg-white rounded-[32px] border-2 border-dashed border-slate-100">
            <BookOpen className="mx-auto mb-4 text-slate-200" size={48} />
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] italic">
              Geen disciplines gevonden in de database.
            </p>
          </div>
        )}
      </div>

      {/* FOOTER: Subtiele indicatie voor updates */}
      <div className="mt-12 pt-6 border-t border-slate-50 text-center">
        <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">
          Selecteer een discipline voor specifieke richtlijnen
        </p>
      </div>
    </div>
  );
}