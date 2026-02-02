import { useRoute, Link } from "wouter";
import { ChevronLeft, Info, Eye, Settings, Image as ImageIcon, Layers, Crosshair } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Scan alle markdown bestanden "eager" (direct inladen)
const allBlocks = import.meta.glob('../content/blocks/*.md', { query: 'raw', eager: true });

// HULPCOMPONENT VOOR AFBEELDINGEN-ROOSTERS
function ImageGrid({ images, title }: { images: string[], title: string }) {
  if (!images || images.length === 0) return null;
  return (
    <div className="space-y-2 my-4 animate-in fade-in slide-in-from-bottom-3">
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{title}</h3>
      <div className="grid gap-3">
        {images.map((img, index) => (
          <img key={index} src={img} alt={`${title} ${index + 1}`} className="rounded-xl border-2 border-slate-100 shadow-sm w-full object-cover" />
        ))}
      </div>
    </div>
  );
}

export default function BlockDetail() {
  const [, params] = useRoute("/blocks/:id");
  const id = params?.id;
  const path = `../content/blocks/${id}.md`;
  const file = allBlocks[path] as any;

  if (!file) return <div className="p-8 text-center text-slate-500">Block niet gevonden.</div>;

  const rawContent = file.default;
  
  // Parser voor enkele tekstvelden
  const getField = (field: string) => {
    const match = rawContent.match(new RegExp(`${field}: "(.*)"`));
    return match ? match[1] : "";
  };

  // NIEUW: Parser voor komma-gescheiden lijsten van beelden
 // Parser voor komma-gescheiden lijsten van beelden met expliciete types voor TS
  const getListField = (field: string): string[] => {
    const raw = getField(field);
    if (!raw) return [];
    
        return raw
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);
  };
  const blockData = {
    title: getField("title"),
    indication: getField("indication"),
    anatomy: getField("anatomy"),
    settings: getField("settings"),
    // Haal de lijsten op
    sonoImages: getListField("sono_images"),
    posImages: getListField("position_images"),
    diagramImages: getListField("diagram_images"),
  };

  // De eerste sono-afbeelding is de "hero" afbeelding bovenaan
  const heroImage = blockData.sonoImages.length > 0 ? blockData.sonoImages[0] : null;
  // De overige sono-afbeeldingen voor in het tabblad
  const extraSonoImages = blockData.sonoImages.slice(1);

  return (
    <div className="space-y-6 pb-24">
      <Link href="/blocks">
        <a className="flex items-center text-teal-600 font-bold uppercase text-[10px] tracking-widest cursor-pointer hover:opacity-70 transition-opacity">
          <ChevronLeft className="h-4 w-4 mr-1" /> Terug naar overzicht
        </a>
      </Link>

      <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900 leading-none">
        {blockData.title}
      </h1>

      {/* HERO IMAGE (Eerste sono beeld) */}
      <div className="aspect-video bg-slate-100 rounded-2xl border-2 border-slate-200 relative overflow-hidden shadow-sm group">
        {heroImage ? (
          <>
           <img src={heroImage} alt="Primaire sono-anatomie" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
           <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded-md text-[10px] text-white font-bold uppercase tracking-wider flex items-center">
             <Eye className="h-3 w-3 mr-1" /> Sono-View 1
           </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-300">
            <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Geen beeld</span>
          </div>
        )}
      </div>

      {/* TABS */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1 rounded-xl h-12 mb-6">
          <TabsTrigger value="info" className="text-xs font-bold uppercase data-[state=active]:bg-white data-[state=active]:text-teal-700 data-[state=active]:shadow-sm rounded-lg flex gap-2"><Info className="h-4 w-4"/> Info</TabsTrigger>
          <TabsTrigger value="anatomy" className="text-xs font-bold uppercase data-[state=active]:bg-white data-[state=active]:text-teal-700 data-[state=active]:shadow-sm rounded-lg flex gap-2"><Layers className="h-4 w-4"/> Anatomie</TabsTrigger>
          <TabsTrigger value="technique" className="text-xs font-bold uppercase data-[state=active]:bg-white data-[state=active]:text-teal-700 data-[state=active]:shadow-sm rounded-lg flex gap-2"><Crosshair className="h-4 w-4"/> Techniek</TabsTrigger>
        </TabsList>
        
        {/* TAB CONTENT: INFO */}
        <TabsContent value="info">
          <Card className="border-slate-200 shadow-sm bg-white"><CardContent className="p-5 text-sm text-slate-700 font-medium leading-relaxed">
            <h3 className="text-xs font-black uppercase tracking-widest text-teal-600 mb-2">Indicatie & Doel</h3>
            {blockData.indication}
          </CardContent></Card>
        </TabsContent>

        {/* TAB CONTENT: ANATOMIE */}
        <TabsContent value="anatomy" className="space-y-4">
          <Card className="border-slate-200 shadow-sm bg-white"><CardContent className="p-5 text-sm text-slate-700 font-medium leading-relaxed">
             <h3 className="text-xs font-black uppercase tracking-widest text-teal-600 mb-2">Sono-Anatomie</h3>
             <p>{blockData.anatomy}</p>
          </CardContent></Card>
          
          {/* Diagrammen */}
          <ImageGrid images={blockData.diagramImages} title="Schematische weergave" />
          
          {/* Extra sono beelden (als die er zijn) */}
          <ImageGrid images={extraSonoImages} title="Extra Sono-Views & Variaties" />
        </TabsContent>

        {/* TAB CONTENT: TECHNIEK (Vroeger Settings) */}
        <TabsContent value="technique" className="space-y-4">
           <Card className="border-slate-200 shadow-sm bg-white"><CardContent className="p-5 text-sm text-slate-700 font-medium leading-relaxed">
             <h3 className="text-xs font-black uppercase tracking-widest text-teal-600 mb-2">Settings & Uitvoering</h3>
            {blockData.settings}
          </CardContent></Card>

           {/* Positionering foto's */}
           <ImageGrid images={blockData.posImages} title="Positionering & Naaldvoering" />
        </TabsContent>
      </Tabs>
    </div>
  );
}