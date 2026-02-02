import { useRoute, Link } from "wouter";
import { ChevronLeft, FileText, FileSearch } from "lucide-react";

export default function DisciplineDetail() {
  const [, params] = useRoute("/protocols/:discipline");
  const discipline = params?.discipline;

  // Belangrijk: scan breed genoeg
  const modules = import.meta.glob("./**/*.tsx");
  
  const protocols = Object.keys(modules)
    .filter((path) => {
      const parts = path.split("/");
      // Match alleen als het bestand IN de map van de discipline staat
      return parts[1] === discipline && parts[2] !== "index.tsx";
    })
    .map((path) => {
      const fileName = path.split("/").pop()?.replace(".tsx", "");
      return { 
        name: fileName, 
        path: `/protocols/${discipline}/${fileName}` 
      };
    });

  return (
    <div className="p-4">
      <Link href="/protocols">
        <a className="flex items-center text-teal-600 mb-6 font-medium active:opacity-60">
          <ChevronLeft size={20} /> Terug naar overzicht
        </a>
      </Link>

      <h1 className="text-2xl font-bold text-slate-800 mb-6 capitalize">
        {discipline?.replace("-", " ")}
      </h1>

      <div className="grid gap-2">
        {protocols.length > 0 ? (
          protocols.map((proto) => (
            <Link key={proto.path} href={proto.path}>
              <a className="flex items-center p-4 bg-white rounded-xl border border-slate-200 shadow-sm active:bg-slate-50 transition-colors">
                <FileText className="text-slate-400 mr-3" size={18} />
                <span className="text-slate-700 capitalize">
                  {proto.name?.replace(/-/g, " ")}
                </span>
              </a>
            </Link>
          ))
        ) : (
          <div className="text-center p-10">
            <FileSearch className="mx-auto text-slate-200 mb-2" size={40} />
            <p className="text-slate-400 italic">Geen protocollen in {discipline}.</p>
          </div>
        )}
      </div>
    </div>
  );
}