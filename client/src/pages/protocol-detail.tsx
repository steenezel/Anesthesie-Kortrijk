import React from "react";
import { useRoute, Link } from "wouter";
import { ChevronLeft, FileWarning, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from 'rehype-raw';
import Zoom from 'react-medium-image-zoom';
import remarkBreaks from 'remark-breaks';
import 'react-medium-image-zoom/dist/styles.css';
import DantroleenCalc from '../components/calculators/DantroleenCalc.js';
import SedationPedsCalculator from "@/components/calculators/SedationPedsCalculator";

// We scannen alle markdown bestanden
const allProtocols = import.meta.glob('../content/protocols/**/*.md', { query: 'raw', eager: true });

export default function ProtocolDetail() {
  const [, params] = useRoute("/protocols/:id");
  const id = params?.id?.toLowerCase();
  const queryParams = new URLSearchParams(window.location.search);
  const fromDiscipline = queryParams.get('fromDiscipline');

  // Zoek het bestand dat eindigt op /id.md
  const fileKey = Object.keys(allProtocols).find(key => 
    key.toLowerCase().endsWith(`/${id}.md`)
  );

  const fileData = fileKey ? (allProtocols[fileKey] as any) : null;
  const rawContent = String(fileData?.default || fileData || "").trim();
  
  if (!rawContent) {
    return (
      <div className="p-10 text-center">
        <FileWarning className="h-10 w-10 mx-auto text-slate-300 mb-4" />
        <p className="text-slate-500 font-black uppercase tracking-tighter">Protocol niet gevonden</p>
        <Link href="/protocols" className="text-teal-600 text-xs font-black uppercase underline">Terug naar lijst</Link>
      </div>
    );
  }

  // --- LOGICA VOOR TITEL & CONTENT ---
  const titleMatch = rawContent.match(/title: "(.*)"/);
  const title = titleMatch ? titleMatch[1] : id?.replace(/-/g, ' ');

  // Strip de frontmatter (alles tussen de eerste --- en ---)
  const markdownBody = rawContent.replace(/^---[\s\S]*?---/, '').trim();

  const markdownComponents = {
    // AFBEELDINGEN
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

    // ACCENTEN
    strong: ({ children }: any) => (
      <strong className="font-bold text-teal-900 mr-[0.25em]">
        {children}
      </strong>
    ),

    // DE BELANGRIJKE RECURSIEVE BLOCKQUOTE PARSER
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
    },

    // CALCULATORS
    SedationPedsCalculator: () => <SedationPedsCalculator />,
    sedationpedscalculator: () => <SedationPedsCalculator />, // Backup voor case-sensitivity
    dantroleencalc: () => <DantroleenCalc />,
    
    // TABELLEN
    table: ({ children }: any) => (
      <div className="my-8 overflow-x-auto rounded-2xl border-2 border-slate-100 shadow-sm bg-white">
        <table className="min-w-full border-collapse">{children}</table>
      </div>
    ),
    thead: ({ children }: any) => <thead className="bg-slate-50/80 backdrop-blur-sm">{children}</thead>,
    tr: ({ children }: any) => <tr className="border-b border-slate-100 last:border-0">{children}</tr>,
    th: ({ children }: any) => (
      <th className="px-4 py-3 text-left text-[10px] font-black uppercase text-slate-500 tracking-widest border-r border-slate-100 last:border-0">
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="px-4 py-3 text-sm text-slate-700 font-medium border-r border-slate-100 last:border-0 whitespace-pre-line">
        {children}
      </td>
    ),
  };

  return (
    <div className="space-y-6 pb-20 px-4 animate-in fade-in duration-700">
      <Link href="/protocols">
        <div className="flex items-center text-teal-600 font-black uppercase text-[10px] tracking-widest cursor-pointer py-2 group">
          <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 
          {fromDiscipline ? `Terug naar ${fromDiscipline}` : "Terug naar overzicht"}
        </div>
      </Link>

      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900 leading-tight">
          {title}
        </h1>
        <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
          <Clock className="h-3 w-3 mr-1" /> Laatste update: {new Date().toLocaleDateString('nl-BE')}
        </div>
      </div>

      <hr className="border-slate-100" />

      <div className="prose prose-slate prose-sm max-w-none 
        prose-ul:list-disc prose-li:marker:text-teal-600
        prose-strong:text-teal-900 prose-strong:font-bold
        prose-h3:uppercase prose-h3:tracking-tighter prose-h3:text-slate-800 prose-h3:font-bold prose-h3:mt-8 prose-h3:mb-4">

        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeRaw]}
          components={markdownComponents as any}
        >
          {markdownBody}
        </ReactMarkdown>
      </div>
    </div>
  );
}