import React from "react";
import { Info, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from 'rehype-raw';
import Zoom from 'react-medium-image-zoom';
import remarkBreaks from 'remark-breaks';
import 'react-medium-image-zoom/dist/styles.css';

// We halen specifiek het onboarding bestand binnen
const onboardingFiles = import.meta.glob('../content/onboarding.md', { query: 'raw', eager: true });

export default function OnboardingPage() {
  // Omdat het één specifiek bestand is, pakken we de eerste key
  const fileKey = Object.keys(onboardingFiles)[0];
  const fileData = fileKey ? (onboardingFiles[fileKey] as any) : null;
  const rawContent = String(fileData?.default || fileData || "").trim();

  // Hergebruik van jouw Frontmatter-stripper
  const markdownBody = rawContent.replace(/^---[\s\S]*?---/, '').trim();
  const title = rawContent.match(/title: "(.*)"/)?.[1] || "Onboarding";
  const subtitle = rawContent.match(/subtitle: "(.*)"/)?.[1] || "AZ Groeninge";

  // Identieke component mapping als in je protocollen
  const markdownComponents = {
    img: ({ src, alt }: { src?: string; alt?: string }) => (
      <div className="my-8">
        <Zoom>
          <img src={src} alt={alt} className="w-full h-auto rounded-2xl shadow-lg border border-slate-100" />
        </Zoom>
        {alt && <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 mt-4">{alt}</p>}
      </div>
    ),
    
    strong: ({ children }: any) => <strong className="font-bold text-teal-900">{children}</strong>,

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
        ? { styles: "border-blue-500 bg-blue-50", title: "ℹ️ LOGISTIEK", color: "text-blue-600" }
        : { styles: "border-emerald-500 bg-emerald-50", title: "💡 TIP", color: "text-emerald-600" };

      const cleanRecursive = (node: any): any => {
        if (typeof node === 'string') return node.replace(/\[!WARNING\]|\[!INFO\]|\[!TIP\]/g, "").trimStart();
        if (Array.isArray(node)) return node.map(cleanRecursive);
        if (node?.props?.children) {
          return React.cloneElement(node, { ...node.props, children: cleanRecursive(node.props.children) } as any);
        }
        return node;
      };

      return (
        <div className={`my-4 border-l-8 p-5 rounded-r-3xl shadow-sm ${config.styles}`}>
          <div className={`font-black text-[10px] mb-1 tracking-[0.2em] ${config.color}`}>{config.title}</div>
          <div className="text-slate-900 leading-snug font-normal whitespace-pre-wrap [&_p]:m-0">
            {cleanRecursive(children)}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6 pb-24 px-4 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900">
          {title.split('boarding')[0]}<span className="text-teal-600">boarding</span>
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          {subtitle}
        </p>
      </header>

      <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
        <Clock className="h-3 w-3 mr-1" /> Info laatst gecontroleerd: {new Date().toLocaleDateString('nl-BE')}
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