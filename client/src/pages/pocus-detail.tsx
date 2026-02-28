import React from "react";
import { useRoute, Link } from "wouter";
import { ChevronLeft, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
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

  // Helper om velden uit de frontmatter te trekken
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
    pathology: getField("pathology"),
    algorhythm: getField("algorhythm"),
    body: rawContent.replace(/^---[\s\S]*?---/, '').trim()
  };
  const splitBody = (content: string) => {
    // We splitsen op de Markdown headers
    const parts = content.split(/##\s+(?:Acquisitie|Interpretatie)/i);
    return {
      algemeen: parts[0] || "",
      acquisitie: content.includes("## Acquisitie") ? content.split(/##\s+Acquisitie/i)[1].split(/##\s+Interpretatie/i)[0] : "",
      interpretatie: content.includes("## Interpretatie") ? content.split(/##\s+Interpretatie/i)[1] : ""
    };
  };

  const bodySections = splitBody(pocusData.body);

  const markdownComponents = {
    p: ({ children }: any) => <p className="mb-6 leading-relaxed text-slate-700 font-medium">{children}</p>,
    strong: ({ children }: any) => <strong className="font-bold text-teal-900">{children}</strong>,
    img: ({ src, alt }: any) => (
      <div className="my-10">
        <Zoom><img src={src} alt={alt} className="rounded-3xl border border-slate-100 shadow-md w-full" /></Zoom>
      </div>
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

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto px-4 pt-4">
      <Link href={backUrl}>
        <div className="flex items-center text-teal-600 font-black uppercase text-[10px] tracking-[0.2em] hover:opacity-70 cursor-pointer">
          <ChevronLeft className="h-4 w-4 mr-1" /> 
          {isFromProtocol ? "Terug naar protocol" : "Terug naar overzicht"}
        </div>
      </Link>

      <h1 className="text-4xl font-black tracking-tighter uppercase text-slate-900 leading-none">
        {pocusData.title}
      </h1>

      <Tabs defaultValue="algemeen" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1.5 rounded-2xl h-14 mb-8">
          <TabsTrigger value="algemeen" className="rounded-xl text-[10px] font-black uppercase">Algemeen</TabsTrigger>
          <TabsTrigger value="acquisitie" className="rounded-xl text-[10px] font-black uppercase">Acquisitie</TabsTrigger>
          <TabsTrigger value="interpretatie" className="rounded-xl text-[10px] font-black uppercase">Interpretatie</TabsTrigger>
        </TabsList>
        
{/* TAB 1: ALGEMEEN */}
<TabsContent value="algemeen" className="space-y-4">
  <SmartContent label="Indicatie" content={pocusData.indication} />
  <SmartContent label="Anatomie" content={pocusData.anatomy} />
  <SmartContent label="Klinische Context" content={pocusData.context} />
  
  {bodySections.algemeen && (
    <div className="prose prose-sm prose-slate max-w-none pt-4 border-t border-slate-100">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]} 
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={markdownComponents as any}
        children={bodySections.algemeen} 
      />
    </div>
  )}
</TabsContent>

{/* TAB 2: ACQUISITIE */}
<TabsContent value="acquisitie" className="space-y-4">
  <SmartContent label="Toestel & Setup" content={pocusData.setup} />
  <SmartContent label="Patiënt Positie" content={pocusData.patpos} />
  <SmartContent label="Probe Locatie" content={pocusData.probepos} />
  <SmartContent label="Referentiebeeld" content={pocusData.reference} />
  
  {bodySections.acquisitie && (
    <div className="prose prose-sm prose-slate max-w-none pt-4 border-t border-slate-100">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]} 
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={markdownComponents as any}
        children={bodySections.acquisitie} 
      />
    </div>
  )}
</TabsContent>

{/* TAB 3: INTERPRETATIE */}
<TabsContent value="interpretatie" className="space-y-4">
  <SmartContent label="Normaalbeeld" content={pocusData.clearsign} />
  <SmartContent label="Pathologie" content={pocusData.pathology} />
  <SmartContent label="Beslisboom / Algoritme" content={pocusData.algorhythm} />
  
  {bodySections.interpretatie && (
    <div className="prose prose-sm prose-slate max-w-none pt-4 border-t border-slate-100">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]} 
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={markdownComponents as any}
        children={bodySections.interpretatie} 
      />
    </div>
  )}
</TabsContent>
      </Tabs>
    </div>
  );
}

// DE SLIMME COMPONENT: Herkent tekst vs afbeelding
function SmartContent({ label, content }: { label: string, content: string }) {
  if (!content) return null;

  const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(content.trim());

  return (
    <Card className="border-slate-100 bg-slate-50/50 rounded-2xl shadow-none overflow-hidden">
      <CardContent className="p-4">
        <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</h3>
        {isImage ? (
          <Zoom>
            <img src={content.trim()} alt={label} className="rounded-xl border border-slate-200 w-full object-cover max-h-64 shadow-sm" />
          </Zoom>
        ) : (
          <p className="text-xs text-slate-800 font-bold leading-tight whitespace-pre-wrap">{content}</p>
        )}
      </CardContent>
    </Card>
  );
}