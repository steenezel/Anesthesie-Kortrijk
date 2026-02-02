import { useRoute, Link } from "wouter";
import { ChevronLeft, Eye, Image as ImageIcon, Info, Layers, Crosshair } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
// NIEUW: Importeer de zoom bibliotheek en styles
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

// Scan alle markdown bestanden
const allBlocks = import.meta.glob('../content/blocks/*.md', { query: 'raw', eager: true });

// HULPCOMPONENT: ImageGrid nu met ZOOM
function ImageGrid({ images, title }: { images: string[], title: string }) {
  if (!images || images.length === 0) return null;
  return (
    <div className="space-y-2 my-4 animate-in fade-in slide-in-from-bottom-3">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{title}</h3>
      <div className="grid gap-3">
        {images.map((img, index) => (
          // We wikkelen elke afbeelding in de Zoom component
          // Let op: de 'key' moet nu op de buitenste Zoom wrapper staan
          <Zoom key={index}>
            <img 
              src={img} 
              alt={`${title} ${index + 1}`} 
              className="rounded-2xl border-2 border-slate-100 shadow-sm w-full object-cover cursor-zoom-in" 
            />
          </Zoom>
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

  if (!file) return <div className="p-12 text-center text-slate-500 font-medium">Block niet gevonden.</div>;

  const rawContent = file.default as string;
  
  // Parsers
  const getField = (field: string) => {
    const match = rawContent.match(new RegExp(`${field}: "(.*)"`));
    return match ? match[1] : "";
  };

  const getListField = (field: string): string[] => {
    const raw = getField(field);
    if (!raw) return [];
    return raw.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
  };

  const getBodyContent = () => {
    const parts = rawContent.split('---');
    if (parts.length < 3) return "";
    return parts.slice(2).join('---').trim();
  };

  const blockData = {
    title: getField("title"),
    indication: getField("indication"),
    anatomy: getField("anatomy"),
    settings: getField("settings"),
    sonoImages: getListField("sono_images"),
    posImages: getListField("position_images"),
    diagramImages: getListField("diagram_images"),
    body: getBodyContent()
  };

  const heroImage = blockData.sonoImages.length > 0 ? blockData.sonoImages[0] : null;

  const extraSonoImages = blockData.sonoImages.slice(1);
  
  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto">
      {/* Navigation */}
      <Link href="/blocks">
        <a className="flex items-center text-teal-600 font-black uppercase text-[10px] tracking-[0.2em] hover:opacity-70 transition-opacity">
          <ChevronLeft className="h-4 w-4 mr-1" /> Terug naar overzicht
        </a>
      </Link>

      <h1 className="text-4xl font-black tracking-tighter uppercase text-slate-900 leading-none">
        {blockData.title}
      </h1>

      {/* HERO IMAGE SECTION MET ZOOM */}
      <div className="aspect-video bg-slate-100 rounded-3xl border-2 border-slate-200 relative overflow-hidden shadow-md group">
        {heroImage ? (
          <>
            {/* Wikkel de hero image in Zoom */}
            <Zoom>
                <img 
                  src={heroImage} 
                  alt="Hoofd-sono-anatomie" 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700 cursor-zoom-in" 
                />
            </Zoom>
            {/* De overlay met het oogje blijft erbuiten, zodat die niet mee zoomt */}
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] text-white font-black uppercase tracking-widest flex items-center pointer-events-none">
              <Eye className="h-3 w-3 mr-2 text-teal-400" /> Sono-View
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-300">
            <ImageIcon className="h-12 w-12 mb-2 opacity-20" />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Geen beeld beschikbaar</span>
          </div>
        )}
      </div>

      {/* TABS */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1.5 rounded-2xl h-14 mb-8">
          <TabsTrigger value="info" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-teal-700 data-[state=active]:shadow-sm">Info</TabsTrigger>
          <TabsTrigger value="anatomy" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-teal-700 data-[state=active]:shadow-sm">Anatomie</TabsTrigger>
          <TabsTrigger value="technique" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-teal-700 data-[state=active]:shadow-sm">Techniek</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600 mb-3">Indicatie & Kliniek</h3>
              <p className="text-sm text-slate-700 font-medium leading-relaxed">{blockData.indication}</p>
            </CardContent>
          </Card>

          {blockData.body && (
            <Card className="border-teal-100 bg-teal-50/40 rounded-2xl shadow-sm border-dashed">
              <CardContent className="p-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-700 mb-3">Expert Tips AZ Groeninge</h3>
                <div className="prose prose-sm prose-slate max-w-none prose-headings:uppercase prose-headings:tracking-tighter prose-headings:font-black prose-p:text-slate-700 prose-p:leading-relaxed prose-li:text-slate-700 prose-li:font-medium">
                  <ReactMarkdown>{blockData.body}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="anatomy" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-slate-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600 mb-3">Structurele anatomie</h3>
            <p className="text-sm text-slate-700 font-medium leading-relaxed">{blockData.anatomy}</p>
          </Card>
          <ImageGrid images={blockData.diagramImages} title="Anatomische diagrammen" />
          <ImageGrid images={extraSonoImages} title="Aanvullende Sono-Views" />
        </TabsContent>

        <TabsContent value="technique" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-slate-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600 mb-3">Instellingen & Benadering</h3>
            <p className="text-sm text-slate-700 font-medium leading-relaxed">{blockData.settings}</p>
          </Card>
          <ImageGrid images={blockData.posImages} title="Patiëntpositie & Naaldvoering" />
        </TabsContent>
      </Tabs>
    </div>
  );
}