import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { 
  ChevronRight, 
  ChevronLeft, 
  BookOpen, 
  Stethoscope, 
  Activity, 
  Bone, 
  Baby, 
  HeartPulse, 
  GlassWater,
  Hamburger,
  Brain,
  Rose,
  Ear,
  Zap,
  TreePalm,
  Plus,
  Loader2
} from "lucide-react";

// Interface voor TypeScript
interface DbProtocol {
  id: string;
  title: string;
  discipline: string;
  content: string;
  created_at: string;
}

const allProtocols = import.meta.glob('../content/protocols/**/*.md', { query: 'raw', eager: true });

export default function ProtocolList() {
  const [activeDiscipline, setActiveDiscipline] = useState<string | null>(null);

  // 1. Haal Cloud data op
  const { data: dbProtocols, isLoading: dbLoading } = useQuery<DbProtocol[]>({
    queryKey: ['protocols-cloud'],
    queryFn: async () => {
      const { data, error } = await supabase.from('protocols').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // 2. Jouw specifieke Icon-mapping
  const getIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'orthopedie': return <Bone className="h-5 w-5" />;
      case 'urologie': return <GlassWater className="h-5 w-5" />;
      case 'neurochirurgie': return <Brain className="h-5 w-5" />;
      case 'obstetrie-epidurale': return <Rose className="h-5 w-5" />;
      case 'nko': return <Ear className="h-5 w-5" />;
      case 'reanimatie': return <Zap className="h-5 w-5" />;
      case 'buitendiensten': return <TreePalm className="h-5 w-5" />;
      case 'thorax-vaat': return <Stethoscope className="h-5 w-5" />;
      case 'abdominale': return <Hamburger className="h-5 w-5" />;
      case 'pediatrie': return <Baby className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  // 3. Data verwerken (Merge)
  const protocols = useMemo(() => {
    const local = Object.keys(allProtocols).map((path) => {
      const pathParts = path.split('/');
      let discipline = pathParts[pathParts.length - 2];
      if (discipline.toLowerCase() === 'protocols') discipline = 'Algemeen';

      const fileName = pathParts[pathParts.length - 1].replace('.md', '');
      const fileData = allProtocols[path] as any;
      const rawContent = String(fileData?.default || fileData || "").trim();
      const titleMatch = rawContent.match(/title: "(.*)"/);
      
      return {
        id: fileName,
        title: titleMatch ? titleMatch[1] : fileName.replace(/-/g, ' '),
        discipline,
        isCloud: false
      };
    });

    const cloud = (dbProtocols || []).map((p: DbProtocol) => ({
      id: p.id,
      title: p.title,
      discipline: p.discipline || 'Algemeen',
      isCloud: true
    }));

    return [...local, ...cloud].sort((a, b) => a.title.localeCompare(b.title));
  }, [dbProtocols]);

  const disciplines = useMemo(() => {
    const set = new Set(protocols.map(p => p.discipline));
    return Array.from(set).sort();
  }, [protocols]);

  const filteredProtocols = protocols.filter(p => p.discipline === activeDiscipline);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 px-4 pt-8">
      
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tightest uppercase text-slate-900 leading-none mb-2">
          Protocollen
        </h1>
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600">
            Klinische Richtlijnen
          </p>
          {dbLoading && <Loader2 className="h-3 w-3 animate-spin text-teal-600" />}
        </div>
      </div>

      {!activeDiscipline && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in duration-500">
            {disciplines.map((discipline) => (
              <Card 
                key={discipline}
                className="hover:border-teal-500 transition-all cursor-pointer border-slate-100 shadow-sm rounded-[24px] group active:scale-95"
                onClick={() => setActiveDiscipline(discipline)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                      {getIcon(discipline)}
                    </div>
                    <span className="font-black text-slate-800 uppercase tracking-tight text-sm">
                      {discipline}
                    </span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-200 group-hover:text-teal-600" />
                </CardContent>
              </Card>
            ))}
          </div>

          <Link href="/admin?type=protocols">
            <button className="fixed bottom-24 right-6 p-4 bg-teal-600 text-white rounded-full shadow-2xl z-50 hover:scale-110 active:scale-95 transition-all flex items-center justify-center">
              <Plus size={28} />
            </button>
          </Link>
        </>
      )}

      {activeDiscipline && (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
          <button 
            onClick={() => setActiveDiscipline(null)}
            className="flex items-center text-slate-400 font-black uppercase text-[10px] tracking-widest py-2 hover:text-teal-600 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Terug
          </button>
          
          <h2 className="text-xl font-black uppercase tracking-tight text-slate-400 mb-4 ml-1">
            {activeDiscipline}
          </h2>

          <div className="grid gap-2">
            {filteredProtocols.map((protocol) => (
              <Link 
                key={protocol.id} 
                href={`/protocols/${protocol.id}?fromDiscipline=${encodeURIComponent(activeDiscipline)}`}
              >
                <Card className="hover:border-teal-400 transition-all cursor-pointer border-slate-200 shadow-none rounded-2xl group">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${protocol.isCloud ? 'bg-teal-50 text-teal-600' : 'bg-slate-50 text-slate-300'} group-hover:bg-teal-600 group-hover:text-white transition-colors`}>
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700 uppercase tracking-tight text-sm">
                          {protocol.title}
                        </span>
                        {protocol.isCloud && (
                          <span className="text-[7px] font-black text-amber-600 uppercase tracking-widest">Cloud Sync</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-teal-600" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}