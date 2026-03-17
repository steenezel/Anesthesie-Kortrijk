import React from "react";
import ReactMarkdown, { Components, ExtraProps } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from 'rehype-raw';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
// @ts-ignore
import parse, { domToReact, HTMLReactParserOptions, Element } from 'html-react-parser';

// Helper om tekst uit geneste React nodes te halen
const flattenText = (node: React.ReactNode): string => {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return node.toString();
  if (Array.isArray(node)) return node.map(flattenText).join('');
  if (React.isValidElement(node)) {
    // Cast naar any binnen deze specifieke check om de 'unknown' props error te omzeilen
    return flattenText((node.props as any).children);
  }
  return '';
};

// --- CONFIGURATIE VOOR HTML PARSING (CMS CONTENT) ---
const parseOptions: HTMLReactParserOptions = {
  replace: (domNode) => {
    if (domNode instanceof Element && domNode.name === 'video') {
      return (
        <div className="relative w-full aspect-video my-8 rounded-3xl overflow-hidden shadow-2xl bg-black group">
          <video 
            controls 
            playsInline
            className="w-full h-full object-cover"
            preload="metadata"
          >
            {domToReact(domNode.children as any, parseOptions)}
          </video>
        </div>
      );
    }
  }
};

export function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  const isHtml = content.includes('<') && content.includes('>');

  if (isHtml) {
    return (
      <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-p:leading-relaxed">
        {parse(content, parseOptions)}
      </div>
    );
  }

  // Hier definiëren we de componenten met strikte types voor 'children' en 'node'
  const markdownComponents: Components = {
    // h2 met expliciete types voor de argumenten
    h2: ({ children }: React.HTMLAttributes<HTMLHeadingElement> & ExtraProps) => (
      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-6 mt-12 pb-2 border-b-2 border-slate-100 flex items-center gap-3">
        <span className="w-2 h-8 bg-teal-500 rounded-full"></span>
        {children}
      </h2>
    ),
    
    // blockquote met expliciete types
    blockquote: ({ children }: React.BlockquoteHTMLAttributes<HTMLQuoteElement> & ExtraProps) => {
      const text = flattenText(children);
      let config = {
        styles: "bg-emerald-50 border-emerald-200",
        color: "text-emerald-600",
        title: "💡 TIP"
      };

      if (text.includes("WAARSCHUWING:")) {
        config = { styles: "bg-red-50 border-red-200", color: "text-red-600", title: "⚠️ WAARSCHUWING" };
      } else if (text.includes("INFO:")) {
        config = { styles: "bg-blue-50 border-blue-200", color: "text-blue-600", title: "ℹ️ INFO" };
      }

      return (
        <div className={`my-8 border-l-4 rounded-r-3xl p-6 ${config.styles}`}>
          <div className={`text-[10px] font-black tracking-widest mb-2 ${config.color}`}>{config.title}</div>
          <div className="text-slate-700 leading-relaxed font-medium">{children}</div>
        </div>
      );
    },

    // img met expliciete types om de 'node' error te voorkomen
    img: ({ node, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & ExtraProps) => (
      <div className="my-8">
        <Zoom>
          <img 
            {...props} 
            className="rounded-3xl shadow-xl border border-slate-100 w-full h-auto" 
            alt={props.alt || "Medische afbeelding"}
          />
        </Zoom>
        {props.alt && (
          <p className="text-center text-[10px] font-bold uppercase text-slate-400 mt-3 tracking-widest">
            {props.alt}
          </p>
        )}
      </div>
    ),

    // p met expliciete types
    p: ({ children }: React.HTMLAttributes<HTMLParagraphElement> & ExtraProps) => {
      const text = flattenText(children);
      if (text.startsWith("video://")) {
        const url = text.replace("video://", "").trim();
        return (
          <div className="relative w-full aspect-video my-8 rounded-3xl overflow-hidden shadow-2xl bg-black">
            <video controls className="w-full h-full object-cover" preload="metadata">
              <source src={url} type="video/mp4" />
            </video>
          </div>
        );
      }
      return <p className="mb-4 leading-relaxed text-slate-700">{children}</p>;
    }
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={markdownComponents}
    >
      {content}
    </ReactMarkdown>
  );
}