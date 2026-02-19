import React from "react";
import { useRoute, Link } from "wouter";
import { ChevronLeft, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from 'remark-breaks';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

import CaudalCalculator from "@/components/CaudalCalculator";

const allBlocks = import.meta.glob('../content/blocks/*.md', { query: 'raw', eager: true });

export default function BlockDetail() {
  const [, params] = useRoute("/blocks/:id");
  const id = params?.id;

  const queryParams = new URLSearchParams(window.location.search);
  const backUrl = queryParams.get('from') || '/blocks';
  const isFromProtocol = queryParams.has('from');

  const fileKey = Object.keys(allBlocks).find(key => 
    key.toLowerCase().endsWith(`/${id?.toLowerCase()}.md`)
  );
  const fileData = fileKey ? (allBlocks[fileKey] as any) : null;
  const rawContent = fileData?.default || fileData;

  if (!rawContent) {
    return (
      <div className="p-12 text-center space-y-4">
        <div className="text-slate-500 font-black uppercase tracking-tighter">Block niet gevonden</div>
        <Link href="/blocks" className="text-teal-600 text-xs font-black uppercase underline block">Terug naar overzicht</Link>
      </div>
    );
  }

  const getField = (field: string) => {
    const lines = rawContent.split('\n');
    const line = lines.find((l: string) => l.trim().startsWith(`${field}:`));
    if (!line) return "";
    const start = line.indexOf('"');
    const end = line.lastIndexOf('"');
    return (start !== -1 && end !== -1 && start !== end) 
      ? line.substring(start + 1, end).trim() 
      : line.split(':')[1]?.trim() || "";
  };

  const getListField = (field: string): string[] => {
    const raw = getField(field);
    if (!raw) return [];
    return raw.split(',').map((s: string) => s.replace(/"/g, '').trim()).filter((s: string) => s.length > 0);
  };

  // Nieuwe datastructuur conform het voorstel
  const blockData = {
    title: getField("title"),
    // Tab 1: Samenvatting
    indication: getField("indication"),
    distribution: getField("distribution"),
    target: getField("target"),
    volume: getField("volume"),
    // Tab 2: Anatomie
    anatomy: getField("anatomy"),
    // Tab 3: Techniek
    positioning: getField("positioning"), // Nieuw veld 'Installatie'
    settings: getField("settings"),       // 'Scantechniek'
    tips: getField("tips"),               // 'Tips & Tricks'
    
    sonoImages: getListField("sono_images"),
    posImages: getListField("position_images"),
    diagramImages: getListField("diagram_images"),
    body: rawContent.replace(/^---[\s\S]*?---/, '').trim()
  };

  const markdownComponents = {
    p: ({ children }: any) => {
      const content = React.Children.toArray(children).join("");
      if (content.startsWith("video:")) {
        const videoSrc = content.replace("video:", "").trim();
        return (
          <div className="my-8 rounded-[2rem] overflow-hidden shadow-2xl bg-black aspect-video border-4 border-slate-900">
            <video controls playsInline muted loop className="w-full h-full object-cover">
              <source src={videoSrc} type="video/mp4" />
            </video>
          </div>
        );
      }
      return <p className="mb-6 leading-relaxed text-slate-700 font-medium">{children}</p>;
    },
    img: ({ src, alt }: any) => (
      <div className="my-10">
        <Zoom><img src={src} alt={alt} className="rounded-3xl border border-slate-100 shadow-md w-full" /></Zoom>
      </div>
    ),
    blockquote: ({ children }: any) => {
       /* ... (Houd je bestaande blockquote logic voor waarschuwingen/tips) ... */
       return <blockquote className="border-l-4 border-slate-200 pl-6 italic my-8 text-slate-600">{children}</blockquote>;
    }
  };

  const renderBodyWithComponents = (content: string) => {
    const parts = content.split('<CaudalCalc />');
    return (
      <>
        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={markdownComponents as any}>
          {parts[0]}
        </ReactMarkdown>
        {parts.length > 1 && <CaudalCalculator />}
        {parts.length > 1 && (
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={markdownComponents as any}>
            {parts[1]}
          </ReactMarkdown>
        )}
      </>
    );
  };

  const heroImage = blockData.sonoImages.length > 0 ? blockData.sonoImages[0] : null;

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto px-4 pt-4">
      <Link href={backUrl}>
        <a className="flex items-center text-teal-600 font-black uppercase text-[10px] tracking-[0.2em] hover:opacity-70">
          <ChevronLeft className="h-4 w-4 mr-1" /> 
          {isFromProtocol ? "Terug naar protocol" : "Terug naar overzicht"}
        </a>
      </Link>

      <h1 className="text-4xl font-black tracking-tighter uppercase text-slate-900 leading-none">
        {blockData.title}
      </h1>

      <div className="aspect-video bg-slate-100 rounded-3xl border-2 border-slate-200 relative overflow-hidden shadow-md">
        {heroImage ? (
          <Zoom><img src={heroImage} alt="Main view" className="w-full h-full object-cover cursor-zoom-in" /></Zoom>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-200"><ImageIcon className="h-12 w-12" /></div>
        )}
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1.5 rounded-2xl h-14 mb-8">
          <TabsTrigger value="summary" className="rounded-xl text-[10px] font-black uppercase">Samenvatting</TabsTrigger>
          <TabsTrigger value="anatomy" className="rounded-xl text-[10px] font-black uppercase">Anatomie</TabsTrigger>
          <TabsTrigger value="technique" className="rounded-xl text-[10px] font-black uppercase">Techniek</TabsTrigger>
        </TabsList>
        
        {/* TAB 1: SAMENVATTING */}
        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SummaryItem label="Indicatie" content={blockData.indication} />
            <SummaryItem label="Distributie" content={blockData.distribution} />
            <SummaryItem label="Target" content={blockData.target} />
            <SummaryItem label="Volume" content={blockData.volume} />
          </div>
          <div className="prose prose-sm prose-slate max-w-none pt-4">
            {renderBodyWithComponents(blockData.body)}
          </div>
        </TabsContent>

        {/* TAB 2: ANATOMIE */}
        <TabsContent value="anatomy" className="space-y-6">
          <Card className="border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-3">Functionele Anatomie</h3>
            <p className="text-sm text-slate-700 font-medium leading-relaxed">{blockData.anatomy}</p>
          </Card>
          <ImageGrid images={blockData.diagramImages} title="Anatomische Diagrammen" />
        </TabsContent>

        {/* TAB 3: TECHNIEK */}
        <TabsContent value="technique" className="space-y-6">
          <div className="space-y-4">
            <Card className="border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-3">Installatie</h3>
              <p className="text-sm text-slate-700 font-medium leading-relaxed">{blockData.positioning}</p>
            </Card>
            <Card className="border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-3">Scantechniek</h3>
              <p className="text-sm text-slate-700 font-medium leading-relaxed">{blockData.settings}</p>
            </Card>
            {blockData.tips && (
              <Card className="border-emerald-200 bg-emerald-50/30 rounded-2xl p-6 shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-3">Tips & Tricks</h3>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">{blockData.tips}</p>
              </Card>
            )}
          </div>
          <ImageGrid images={blockData.posImages} title="Positionering" />
          <ImageGrid images={blockData.sonoImages.slice(1)} title="Aanvullende Sono-beelden" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Hulpsubcomponent voor de samenvatting items
function SummaryItem({ label, content }: { label: string, content: string }) {
  if (!content) return null;
  return (
    <Card className="border-slate-100 bg-slate-50/50 rounded-2xl shadow-none">
      <CardContent className="p-4">
        <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</h3>
        <p className="text-xs text-slate-800 font-bold leading-tight">{content}</p>
      </CardContent>
    </Card>
  );
}

function ImageGrid({ images, title }: { images: string[], title: string }) {
  if (!images || images.length === 0) return null;
  return (
    <div className="space-y-2 my-4">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{title}</h3>
      <div className="grid gap-3">
        {images.map((img, index) => (
          <Zoom key={index}><img src={img} alt={title} className="rounded-2xl border-2 border-slate-100 w-full object-cover" /></Zoom>
        ))}
      </div>
    </div>
  );
}