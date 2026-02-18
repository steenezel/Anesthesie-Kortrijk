import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Search as SearchIcon, ChevronRight, BookOpen, Syringe, GraduationCap, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// We laden alle content in
const allProtocols = import.meta.glob('../content/protocols/**/*.md', { query: 'raw', eager: true });
const allBlocks = import.meta.glob('../content/blocks/*.md', { query: 'raw', eager: true });

export default function SearchPage() {
  const [query, setQuery] = useState("");

  // We maken een index van alle pagina's
  const searchIndex = useMemo(() => {
    const items: any[] = [];

    // Verwerk protocollen in search.tsx
    Object.entries(allProtocols).forEach(([path, file]: [string, any]) => {
      const content = file.default || file;
      const pathParts = path.split('/');
      
      // We halen de fileName op (bijv. 'gastric-bypass'), exact zoals in je lijst
      const fileName = pathParts[pathParts.length - 1].replace('.md', '');
      
      // Bepaal de categorie voor de beschrijving
      let discipline = pathParts[pathParts.length - 2];
      if (discipline.toLowerCase() === 'protocols') {
        discipline = 'Algemeen';
      }

      const titleMatch = typeof content === 'string' ? content.match(/title: "(.*)"/) : null;
      const indicationMatch = typeof content === 'string' ? content.match(/indication: "(.*)"/) : null;

      items.push({
        title: titleMatch ? titleMatch[1] : fileName.replace(/-/g, ' '),
        description: indicationMatch ? indicationMatch[1] : `Discipline: ${discipline}`,
        // CRUCIAL: We gebruiken hier alleen fileName, net als in protocol-list.tsx
        href: `/protocols/${fileName}`, 
        type: "Protocol",
        icon: BookOpen,
        color: "bg-blue-500",
        content: typeof content === 'string' ? content.toLowerCase() : ""
      });
});
    // Verwerk blocks
    Object.entries(allBlocks).forEach(([path, file]: [string, any]) => {
      const content = file.default || file;
      const titleMatch = content.match(/title: "(.*)"/);
      const indicationMatch = content.match(/indication: "(.*)"/);

      items.push({
        title: titleMatch ? titleMatch[1] : path.split('/').pop(),
        description: indicationMatch ? indicationMatch[1] : "LRA Techniek",
        href: `/blocks/${path.split('/').pop()?.replace('.md', '')}`,
        type: "Block",
        icon: Syringe,
        color: "bg-purple-500",
        content: content.toLowerCase()
      });
    });

    return items;
  }, []);

  // Filter de resultaten op basis van de zoekterm
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return searchIndex.filter(item => 
      item.title.toLowerCase().includes(q) || 
      item.description.toLowerCase().includes(q) ||
      item.content.includes(q)
    ).slice(0, 10); // Maximaal 10 resultaten voor snelheid
  }, [query, searchIndex]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900 leading-none">
          Zoeken
        </h1>
        <Link href="/">
          <div className="p-2 bg-slate-100 rounded-full cursor-pointer hover:bg-slate-200 transition-colors">
            <X className="h-5 w-5 text-slate-500" />
          </div>
        </Link>
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-teal-600" />
        </div>
        <Input 
          autoFocus
          placeholder="Zoek op titel, ziektebeeld of techniek..." 
          className="h-14 pl-12 pr-4 bg-white border-2 border-slate-100 rounded-2xl text-lg font-medium focus-visible:ring-teal-500 focus-visible:border-teal-500 shadow-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {results.length > 0 ? (
          results.map((result, i) => (
            <Link key={i} href={result.href}>
              <Card className="group cursor-pointer hover:shadow-md transition-all border-slate-100 overflow-hidden">
                <CardContent className="p-0 flex items-stretch">
                  <div className={`${result.color} w-1.5`} />
                  <div className="flex-1 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-white transition-colors">
                        <result.icon className={`h-5 w-5 ${result.color.replace('bg-', 'text-')}`} />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 uppercase text-xs tracking-tight">{result.title}</h3>
                        <p className="text-[10px] text-slate-500 italic line-clamp-1">{result.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-teal-500 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : query.length > 1 ? (
          <div className="p-12 text-center text-slate-400">
            <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-10" />
            <p className="text-sm font-medium">Geen resultaten voor "{query}"</p>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-300">
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Typ om te zoeken in alle protocollen</p>
          </div>
        )}
      </div>
    </div>
  );
}