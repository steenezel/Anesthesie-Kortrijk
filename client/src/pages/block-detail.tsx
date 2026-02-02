import { useRoute, Link } from "wouter";
import { ChevronLeft, Eye, Image as ImageIcon, Info, Layers, Crosshair } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown"; // Zorg dat dit geïmporteerd is

const allBlocks = import.meta.glob('../content/blocks/*.md', { query: 'raw', eager: true });

function ImageGrid({ images, title }: { images: string[], title: string }) {
  if (!images || images.length === 0) return null;
  return (
    <div className="space-y-2 my-4 animate-in fade-in slide-in-from-bottom-3">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{title}</h3>
      <div className="grid gap-3">
        {images.map((img, index) => (
          <img key={index} src={img} alt={`${title} ${index + 1}`} className="rounded-2xl border-2 border-slate-100 shadow-sm w-full object-cover" />
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

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto">
      <Link href="/blocks">
        <a className="flex items-center text-teal-600 font-black uppercase text-[10px] tracking-[0.2em] hover:opacity-70 transition-opacity">
          <ChevronLeft className="h-4 w-4 mr-1" /> Terug naar overzicht
        </a>
      </Link>

      <h1 className="text-4xl font-black tracking-tighter uppercase text-slate-900 leading-none">
        {blockData.title}
      </h1>

      <div className="aspect-video bg-slate-100 rounded-3xl border-2 border-slate-200 relative overflow-hidden shadow-md">
        {heroImage ? (
          <img src={heroImage} alt="Sono-View" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-300">
            <ImageIcon className="h-12 w-12 opacity-20" />
          </div>
        )}
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1.5 rounded-2xl h-14 mb-8">
          <TabsTrigger value="info" className="rounded-xl text-[10px] font-black uppercase tracking-widest">Info</TabsTrigger>
          <TabsTrigger value="anatomy" className="rounded-xl text-[10px] font-black uppercase tracking-widest">Anatomie</TabsTrigger>
          <TabsTrigger value="technique" className="rounded-xl text-[10px] font-black uppercase tracking-widest">Techniek</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="space-y-4">
          <Card className="border-slate-200 rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600 mb-3">Indicatie</h3>
              <p className="text-sm text-slate-700 font-medium leading-relaxed">{blockData.indication}</p>
            </CardContent>
          </Card>

          {/* DE FIX: REACT MARKDOWN VOOR DE BODY */}
          {blockData.body && (
            <Card className="border-teal-100 bg-teal-50/40 rounded-2xl shadow-sm border-dashed">
              <CardContent className="p-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-700 mb-3">Expert Tips AZ Groeninge</h3>
                <div className="prose prose-sm prose-slate max-w-none 
                  prose-headings:uppercase prose-headings:tracking-tighter prose-headings:font-black 
                  prose-p:text-slate-700 prose-p:leading-relaxed
                  prose-li:text-slate-700 prose-li:font-medium">
                  <ReactMarkdown>{blockData.body}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="anatomy" className="space-y-6">
          <Card className="border-slate-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600 mb-3">Anatomie</h3>
            <p className="text-sm text-slate-700 font-medium">{blockData.anatomy}</p>
          </Card>
          <ImageGrid images={blockData.diagramImages} title="Diagrammen" />
        </TabsContent>

        <TabsContent value="technique" className="space-y-6">
          <Card className="border-slate-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600 mb-3">Settings</h3>
            <p className="text-sm text-slate-700 font-medium">{blockData.settings}</p>
          </Card>
          <ImageGrid images={blockData.posImages} title="Positionering" />
        </TabsContent>
      </Tabs>
    </div>
  );
}