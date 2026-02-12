import React from "react";
import { useRoute, Link } from "wouter";
import { ChevronLeft, FileWarning, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

// We scannen alle markdown bestanden
const allProtocols = import.meta.glob('../content/protocols/**/*.md', { query: 'raw', eager: true });

export default function ProtocolDetail() {
  const [, params] = useRoute("/protocols/:id");
  const id = params?.id?.toLowerCase();

  // Zoek het bestand dat eindigt op /id.md
  const fileKey = Object.keys(allProtocols).find(key => 
    key.toLowerCase().endsWith(`/${id}.md`)
  );

  const fileData = fileKey ? (allProtocols[fileKey] as any) : null;
  const rawContent = fileData?.default || fileData;

  if (!rawContent) {
    return (
      <div className="p-10 text-center">
        <FileWarning className="h-10 w-10 mx-auto text-slate-300 mb-4" />
        <p className="text-slate-500 font-black uppercase tracking-tighter">Protocol niet gevonden</p>
        <Link href="/protocols" className="text-teal-600 text-xs font-black uppercase underline">Terug naar lijst</Link>
      </div>
    );
  }

  // Parsing van de markdown body en titel
  const parts = rawContent.split('---').filter(Boolean);
  const markdownBody = rawContent.startsWith('---') ? parts[1] : rawContent;
  const title = rawContent.match(/title: "(.*)"/)?.[1] || id?.replace(/-/g, ' ');

  return (
    <div className="space-y-6 pb-20 px-4 animate-in fade-in duration-500">
      {/* NAVIGATIE */}
      <Link href="/protocols">
        <div className="flex items-center text-teal-600 font-black uppercase text-[10px] tracking-widest cursor-pointer py-2 group">
          <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 
          Terug naar overzicht
        </div>
      </Link>

      {/* TITEL SECTIE */}
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900 leading-tight">
          {title}
        </h1>
        <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
          <Clock className="h-3 w-3 mr-1" /> Laatste update: {new Date().toLocaleDateString('nl-BE')}
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* MARKDOWN CONTENT MET UPGRADED LAYOUT */}
        <div className="prose prose-slate prose-base max-w-none 
        /* Zorg dat lijsten altijd bolletjes tonen en een kleur hebben */
        prose-ul:list-disc prose-li:marker:text-teal-600
        /* Je bestaande styling voor koppen en vetgedrukte tekst */
        prose-strong:text-teal-700 prose-strong:font-black
        prose-h3:uppercase prose-h3:tracking-tighter prose-h3:text-slate-800 prose-h3:font-bold prose-h3:mt-8 prose-h3:mb-4">

        <ReactMarkdown
        remarkPlugins={[remarkGfm]}
  components={{
    // 1. Behoud je bestaande afbeelding-logica (onveranderd)
    img: ({ src, alt }: { src?: string; alt?: string }) => (
      <div className="my-8">
        <Zoom>
          <img 
            src={src} 
            alt={alt} 
            className="w-full h-auto rounded-2xl shadow-lg border border-slate-100 transition-all hover:shadow-xl" 
          />
        </Zoom>
        {alt && (
          <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-4 px-4 leading-relaxed">
            {alt}
          </p>
        )}
      </div>
    ),

    // 2. NIEUW: De slimme Warning, Info en Tip boxes
    blockquote: ({ children, ...props }: any) => {
  // 1. HULPFUNCTIE: Haalt alle tekst op, hoe diep deze ook verstopt zit
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

  // Fallback voor normale citaten
  if (!isWarning && !isInfo && !isTip) {
    return <blockquote className="border-l-4 border-slate-200 pl-6 italic my-8 text-slate-600">{...props}</blockquote>;
  }

  // 2. RECURSIEVE CLEANER: Verwijdert de tags uit elk tekst-onderdeeltje
  const cleanRecursive = (node: any): any => {
    if (typeof node === 'string') {
      // Verwijdert de tags én eventuele aanhalingstekens of extra spaties aan het begin
      return node.replace(/\[!WARNING\]|\[!INFO\]|\[!TIP\]/g, "").replace(/^[\s"]+/, "");
    }
    if (Array.isArray(node)) {
      return node.map(cleanRecursive);
    }
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
},
  table: ({ children }: any) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 bg-white">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => <thead className="bg-slate-50">{children}</thead>,
  th: ({ children }: any) => <th className="px-4 py-2 text-left text-xs font-bold uppercase text-slate-500 tracking-wider">{children}</th>,
  td: ({ children }: any) => <td className="px-4 py-2 text-sm text-slate-700 border-t border-slate-100">{children}</td>,}}
>
  {markdownBody}
</ReactMarkdown>
      </div>
    </div>
  );
}