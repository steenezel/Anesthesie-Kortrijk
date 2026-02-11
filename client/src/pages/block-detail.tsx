
import React from "react";
import { useRoute, Link } from "wouter";
import { ChevronLeft, Eye, Image as ImageIcon, Info, Layers, Crosshair } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

// Scan alle markdown bestanden
const allBlocks = import.meta.glob('../content/blocks/*.md', { query: 'raw', eager: true });

// HULPCOMPONENT: ImageGrid met ZOOM
function ImageGrid({ images, title }: { images: string[], title: string }) {
  if (!images || images.length === 0) return null;
  return (
    <div className="space-y-2 my-4 animate-in fade-in slide-in-from-bottom-3">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{title}</h3>
      <div className="grid gap-3">
        {images.map((img, index) => (
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

  // NIEUW: Logica voor dynamische terug-link (bv. vanuit een protocol)
  const queryParams = new URLSearchParams(window.location.search);
  const backUrl = queryParams.get('from') || '/blocks';
  const isFromProtocol = queryParams.has('from');

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
  const extraSonoImages = blockData.sonoImages.slice(1);
  
  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto">
      {/* DYNAMISCHE NAVIGATIE */}
      <Link href={backUrl}>
        <a className="flex items-center text-teal-600 font-black uppercase text-[10px] tracking-[0.2em] hover:opacity-70 transition-opacity">
          <ChevronLeft className="h-4 w-4 mr-1" /> 
          {isFromProtocol ? "Terug naar protocol" : "Terug naar overzicht"}
        </a>
      </Link>

      <h1 className="text-4xl font-black tracking-tighter uppercase text-slate-900 leading-none">
        {blockData.title}
      </h1>

      {/* HERO IMAGE SECTION MET ZOOM */}
      <div className="aspect-video bg-slate-100 rounded-3xl border-2 border-slate-200 relative overflow-hidden shadow-md group">
        {heroImage ? (
          <>
            <Zoom>
              <img 
                src={heroImage} 
                alt="Hoofd-sono-anatomie" 
                className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700 cursor-zoom-in" 
              />
            </Zoom>
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
                <ReactMarkdown
  components={{
    // 1. VIDEO HANDLING
    p: ({ children, ...props }: any) => {
  const content = React.Children.toArray(children).join("");
  
  if (content.startsWith("video:")) {
    const videoSrc = content.replace("video:", "").trim();
    return (
      <div className="my-8 rounded-[2rem] overflow-hidden shadow-2xl bg-black aspect-video border-4 border-slate-900 group relative">
        <video 
          controls 
          playsInline 
          muted     
          loop     
          className="w-full h-full object-cover" 
          preload="metadata"
        >
          <source src={videoSrc} type="video/mp4" />
          Je browser ondersteunt geen video.
        </video>
       </div>
    );
  }
  
  return <p className="mb-6 leading-relaxed text-slate-700">{children}</p>;
},

    // 2. IMAGE ZOOM 
    img: ({ src, alt }: { src?: string; alt?: string }) => (
      <div className="my-10">
        <Zoom>
          <img src={src} alt={alt} className="rounded-3xl border border-slate-100 shadow-md w-full" />
        </Zoom>
      </div>
    ),

    // 3. DE DEEP CLEANER BOXES
    blockquote: ({ children, ...props }: any) => {
      const flattenText = (node: any): string => {
        if (typeof node === 'string') return node;
        if (Array.isArray(node)) return node.map(flattenText).join('');
        if (node?.props?.children) return flattenText(node.props.children);
        return '';
      };

      const fullText = flattenText(children);
      const isWarning = fullText.includes("[!WARNING]");
      const isInfo = fullText.includes("[!INFO]");
      const isTip = fullText.includes("[!TIP]");

      if (!isWarning && !isInfo && !isTip) {
        return <blockquote className="border-l-4 border-slate-200 pl-6 italic my-8 text-slate-600">{...props}</blockquote>;
      }

      const cleanRecursive = (node: any): any => {
        if (typeof node === 'string') {
          return node.replace(/\[!WARNING\]|\[!INFO\]|\[!TIP\]/g, "").replace(/^[\s"]+/, "");
        }
        if (Array.isArray(node)) return node.map(cleanRecursive);
        if (node?.props?.children) {
          return React.cloneElement(node, {
            ...node.props,
            children: cleanRecursive(node.props.children)
          });
        }
        return node;
      };

      const config = isWarning 
        ? { styles: "border-red-500 bg-red-50", title: "⚠️ WAARSCHUWING", color: "text-red-600" }
        : isInfo 
        ? { styles: "border-blue-500 bg-blue-50", title: "ℹ️ INFORMATIE", color: "text-blue-600" }
        : { styles: "border-emerald-500 bg-emerald-50", title: "💡 TIP", color: "text-emerald-600" };

      return (
        <div className={`my-8 border-l-8 p-6 rounded-r-3xl shadow-sm ${config.styles}`}>
          <div className={`font-black text-[10px] mb-2 tracking-[0.2em] ${config.color}`}>
            {config.title}
          </div>
          <div className="text-slate-900 leading-relaxed prose-p:my-0 font-medium">
            {cleanRecursive(children)}
          </div>
        </div>
      );
    }
  }}
>
  {blockData.body}
</ReactMarkdown>
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