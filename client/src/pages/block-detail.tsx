import { useRoute } from "wouter";
import { ChevronLeft, Info, Eye, Settings } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BlockDetail() {
  const [, params] = useRoute("/blocks/:id");
  const id = params?.id;

  // Mock data for demonstration
  const blockData = {
    title: id?.replace("-", " ").toUpperCase() + " Block",
    indication: "Indicatie: Chirurgie aan de schouder of proximale humerus.",
    anatomy: "Relevante sono-anatomie: Plexus brachialis tussen m. scalenus anterior en medius.",
    settings: "Echograaf: Lineaire probe (10-15 MHz), diepte 2-3 cm."
  };

  return (
    <div className="space-y-6 pb-20">
      <Link href="/blocks">
        <div className="flex items-center text-slate-400 font-bold uppercase text-[10px] tracking-widest cursor-pointer hover:text-slate-600 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Terug naar overzicht
        </div>
      </Link>

      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900 leading-tight">
          {blockData.title}
        </h1>
      </div>

      <div className="aspect-video bg-slate-100 rounded-2xl border-2 border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group">
        <Eye className="h-10 w-10 text-slate-300 group-hover:scale-110 transition-transform" />
        <span className="text-[10px] font-bold text-slate-400 uppercase mt-2">Echo beeld placeholder</span>
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-[10px] text-white font-bold uppercase tracking-wider">
          Fig. 1: Sono-anatomie
        </div>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1 rounded-xl h-12">
          <TabsTrigger value="info" className="rounded-lg gap-2 text-xs font-bold uppercase"><Info className="h-4 w-4" /> Info</TabsTrigger>
          <TabsTrigger value="anatomy" className="rounded-lg gap-2 text-xs font-bold uppercase"><Eye className="h-4 w-4" /> Anatomie</TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg gap-2 text-xs font-bold uppercase"><Settings className="h-4 w-4" /> Settings</TabsTrigger>
        </TabsList>
        <div className="mt-4">
          <TabsContent value="info" className="animate-in fade-in slide-in-from-bottom-2">
            <Card className="border-slate-200">
              <CardContent className="p-4 text-sm text-slate-600 leading-relaxed">
                {blockData.indication}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="anatomy">
            <Card className="border-slate-200">
              <CardContent className="p-4 text-sm text-slate-600 leading-relaxed">
                {blockData.anatomy}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="settings">
            <Card className="border-slate-200">
              <CardContent className="p-4 text-sm text-slate-600 leading-relaxed">
                {blockData.settings}
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
