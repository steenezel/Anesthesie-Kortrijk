import { useRoute, Link } from "wouter";
import { ChevronLeft, FileText } from "lucide-react";

export default function DisciplineDetail() {
  const [, params] = useRoute("/protocols/:discipline");
  const discipline = params?.discipline;

  // We scannen alle bestanden in de submappen
  const modules = import.meta.glob("./**/*.tsx");
  
  // Filter enkel de bestanden die in de actieve discipline-map staan
  const protocols = Object.keys(modules)
    .filter((path) => path.includes(`./${discipline}/`))
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
        <a className="flex items-center text-teal-600 mb-6 font-medium">
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
              <a className="flex items-center p-4 bg-white rounded-xl border border-slate-200 active:bg-slate-50">
                <FileText className="text-slate-400 mr-3" size={18} />
                <span className="text-slate-700 capitalize">{proto.name?.replace("-", " ")}</span>
              </a>
            </Link>
          ))
        ) : (
          <p className="text-slate-400 italic">Geen protocollen gevonden in deze map.</p>
        )}
      </div>
    </div>
  );
}