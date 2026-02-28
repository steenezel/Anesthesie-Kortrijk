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

const allPocus = import.meta.glob('../content/pocus/*.md', { query: 'raw', eager: true });

export default function PocusDetail() {
  const [, params] = useRoute("/pocus/:id");
  const id = params?.id;

  const queryParams = new URLSearchParams(window.location.search);
  const backUrl = queryParams.get('from') || '/pocus';
  const isFromProtocol = queryParams.has('from');

  const fileKey = Object.keys(allPocus).find(key => 
    key.toLowerCase().endsWith(`/${id?.toLowerCase()}.md`)
  );
  const fileData = fileKey ? (allPocus[fileKey] as any) : null;
  const rawContent = fileData?.default || fileData;

  if (!rawContent) {
    return (
      <div className="p-12 text-center space-y-4">
        <div className="text-slate-500 font-black uppercase tracking-tighter">Onderzoek niet gevonden</div>
        <Link href="/pocus" className="text-teal-600 text-xs font-black uppercase underline block">Terug naar overzicht</Link>
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

  const pocusData = {
    title: getField("title"),
    indication: getField("indication"),
    anatomy: getField("anatomy"),
    context: getField("context"),
    setup: getField("setup"),
    patpos: getField("patpos"),
    probepos: getField("probepos"),
    reference: getField("reference"),
    clearsign: getField("clearsign"),
    pathology: getListField("pathology"),
    algorhythm: getListField("algorhythm"),
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

    strong: ({ children }: any) => (
    <strong className="font-bold text-teal-900 mr-[0.25em]">
      {children}
    </strong>
    ),

    blockquote: ({ children }: any) => {
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
        return <blockquote className="border-l-4 border-slate-200 pl-6 my-8 text-slate-600">{children}</blockquote>;
      }

      const config = isWarning 
        ? { styles: "border-red-500 bg-red-50", title: "⚠️ WAARSCHUWING", color: "text-red-600" }
        : isInfo 
        ? { styles: "border-blue-500 bg-blue-50", title: "ℹ️ INFORMATIE", color: "text-blue-600" }
        : { styles: "border-emerald-500 bg-emerald-50", title: "💡 TIP", color: "text-emerald-600" };

      const cleanRecursive = (node: any): any => {
        if (typeof node === 'string') {
          return node.replace(/\[!WARNING\]|\[!INFO\]|\[!TIP\]/g, "").trimStart();
        }
        if (Array.isArray(node)) return node.map(cleanRecursive);
        if (node?.props?.children) {
          return React.cloneElement(node, {
            ...node.props,
            children: cleanRecursive(node.props.children)
          } as any);
        }
        return node;
      };

      return (
        <div className={`my-4 border-l-8 p-5 rounded-r-3xl shadow-sm ${config.styles}`}>
          <div className={`font-black text-[10px] mb-1 tracking-[0.2em] ${config.color}`}>
            {config.title}
          </div>
          <div className="text-slate-900 leading-snug font-normal whitespace-pre-wrap [&_p]:m-0">
            {cleanRecursive(children)}
          </div>
        </div>
      );
    }
  };

  const renderBodyWithComponents = (content: string) => {
        return (
      <>
        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={markdownComponents as any}>
        </ReactMarkdown>
       </>
    );
  };

  const heroImage = pocusData.reference.length > 0 ? pocusData.reference[0] : null;

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto px-4 pt-4">
      <Link href={backUrl}>
        <a className="flex items-center text-teal-600 font-black uppercase text-[10px] tracking-[0.2em] hover:opacity-70">
          <ChevronLeft className="h-4 w-4 mr-1" /> 
          {isFromProtocol ? "Terug naar protocol" : "Terug naar overzicht"}
        </a>
      </Link>

      <h1 className="text-4xl font-black tracking-tighter uppercase text-slate-900 leading-none">
        {pocusData.title}
      </h1>

      <div className="aspect-video bg-slate-100 rounded-3xl border-2 border-slate-200 relative overflow-hidden shadow-md">
        {heroImage ? (
          <Zoom><img src={heroImage} alt="Main view" className="w-full h-full object-cover cursor-zoom-in" /></Zoom>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-200"><ImageIcon className="h-12 w-12" /></div>
        )}
      </div>

      <Tabs defaultValue="algemeen" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1.5 rounded-2xl h-14 mb-8">
          <TabsTrigger value="algemeen" className="rounded-xl text-[10px] font-black uppercase">Algemeen</TabsTrigger>
          <TabsTrigger value="acquisitie" className="rounded-xl text-[10px] font-black uppercase">Acquisitie</TabsTrigger>
          <TabsTrigger value="interpretatie" className="rounded-xl text-[10px] font-black uppercase">Interpretatie</TabsTrigger>
        </TabsList>
        
        <TabsContent value="algemeen" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SummaryItem label="Indicatie" content={pocusData.indication} />
            <SummaryItem label="Anatomie" content={pocusData.anatomy} />
            <SummaryItem label="Context" content={pocusData.context} />
            </div>
          <div className="prose prose-sm prose-slate max-w-none pt-4">
            {renderBodyWithComponents(pocusData.body)}
          </div>
        </TabsContent>

       <TabsContent value="acquisitie" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SummaryItem label="Setup" content={pocusData.setup} />
            <SummaryItem label="Positionering" content={pocusData.patpos} />
            <SummaryItem label="Probe positionering" content={pocusData.probepos} />
            <SummaryItem label="Referentiebeeld" content={pocusData.reference} />
            </div>
          <div className="prose prose-sm prose-slate max-w-none pt-4">
            {renderBodyWithComponents(pocusData.body)}
          </div>
        </TabsContent>

        <TabsContent value="technique" className="space-y-6">
          <div className="space-y-4">
            <Card className="border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-3">Normaal beeld</h3>
              <p className="text-sm text-slate-700 font-medium leading-relaxed">{pocusData.clearsign}</p>
            </Card>
            <Card className="border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-3">Pathologie</h3>
              <p className="text-sm text-slate-700 font-medium leading-relaxed">{pocusData.pathology}</p>
            </Card>
            {pocusData.algorhythm && (
              <Card className="border-emerald-200 bg-emerald-50/30 rounded-2xl p-6 shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-3">Algoritme</h3>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">{pocusData.algorhythm}</p>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

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