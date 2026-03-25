import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { 
  Search as SearchIcon, 
  ChevronRight, 
  BookOpen, 
  Syringe, 
  X, 
  Activity, 
  Loader2, 
  GraduationCap 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

// Interface moet exact matchen met de RETURNS TABLE van de SQL functie
interface SearchResult {
  result_id: string;
  title: string;
  type: 'pocus' | 'blocks' | 'protocols' | 'journal_club';
  discipline: string;
  snippet: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset timer als de gebruiker typt
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (query.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Debounce van 300ms om database-belasting te beperken
    searchTimeout.current = setTimeout(async () => {
      try {
        const { data, error } = await supabase.rpc('global_search', { 
          search_term: query 
        });

        if (error) {
          console.error("Supabase RPC error:", error);
          throw error;
        }
        
        setResults(data || []);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [query]);

  // Configuratie voor iconen, kleuren en routes per module
  const getModuleConfig = (type: string) => {
    switch (type) {
      case 'pocus':
        return { icon: Activity, color: "bg-blue-500", path: "/pocus" };
      case 'blocks':
        return { icon: Syringe, color: "bg-purple-500", path: "/blocks" };
      case 'protocols':
        return { icon: BookOpen, color: "bg-teal-500", path: "/protocols" };
      case 'journal_club':
        return { icon: GraduationCap, color: "bg-orange-500", path: "/journalclub" };
      default:
        return { icon: BookOpen, color: "bg-slate-500", path: "/protocols" };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* ZOEKBALK HEADER */}
      <div className="bg-white border-b sticky top-0 z-50 px-4 py-4 shadow-sm">
        <div className="relative max-w-xl mx-auto">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
            ) : (
              <SearchIcon className="h-5 w-5" />
            )}
          </div>
          <Input
            autoFocus
            placeholder="Zoek in titels en inhoud..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-12 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500/20 transition-all text-base font-medium"
          />
          {query && (
            <button 
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-slate-500" />
            </button>
          )}
        </div>
      </div>

      {/* RESULTATEN LIJST */}
      <div className="max-w-xl mx-auto p-4 space-y-3">
        {results.length > 0 ? (
          results.map((result) => {
            const config = getModuleConfig(result.type);
            const Icon = config.icon;

            return (
              <Link 
                key={`${result.type}-${result.result_id}`} 
                href={`${config.path}/${result.result_id}`}
              >
                <Card className="group cursor-pointer border-none shadow-sm hover:shadow-md active:scale-[0.98] transition-all rounded-[2rem] overflow-hidden bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Icoon met module-specifieke kleur */}
                        <div className={`p-3 rounded-2xl ${config.color} text-white shadow-lg shadow-current/10 group-hover:scale-110 transition-transform`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-black text-slate-900 uppercase text-xs tracking-tight truncate">
                              {result.title}
                            </h3>
                            <span className="text-[8px] font-black bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full uppercase tracking-widest whitespace-nowrap">
                              {result.discipline || result.type}
                            </span>
                          </div>
                          {/* Snippet van de inhoud (HTML tags verwijderd voor schone weergave) */}
                          <p className="text-[10px] text-slate-500 italic line-clamp-1 opacity-70">
                            {result.snippet 
                              ? `${result.snippet.replace(/<[^>]*>/g, '').trim()}...` 
                              : 'Klik voor details'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-teal-500 transition-colors shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        ) : query.length > 1 && !isLoading ? (
          <div className="p-12 text-center text-slate-400">
            <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-5" />
            <p className="text-sm font-black uppercase tracking-widest opacity-40">
              Niets gevonden voor "{query}"
            </p>
          </div>
        ) : !isLoading && (
          <div className="p-12 text-center text-slate-300">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">
              Begin met typen om te zoeken...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}