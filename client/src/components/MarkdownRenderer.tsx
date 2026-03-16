import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// Hulpfunctie om alle tekst uit geneste React-nodes te halen voor checks
const flattenText = (node: any): string => {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(flattenText).join('');
  if (node?.props?.children) return flattenText(node.props.children);
  return '';
};

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
      rehypePlugins={[rehypeRaw, rehypeKatex]}
      components={{
        // CUSTOM BLOCKQUOTE HANDLER (Alerts zoals [!TIP])
        blockquote: ({ children }: any) => {
          const fullText = flattenText(children);
          
          const isWarning = /\[!(WARNING|CAUTION)\]/i.test(fullText);
          const isInfo = /\[!INFO\]/i.test(fullText);
          const isTip = /\[!TIP\]/i.test(fullText);

          // Als er geen tag is, render als standaard blockquote
          if (!isWarning && !isInfo && !isTip) {
            return (
              <blockquote className="border-l-4 border-slate-200 pl-4 italic my-6 text-slate-600">
                {children}
              </blockquote>
            );
          }

          // JOUW SPECIFIEKE CONFIGURATIE
          const config = isWarning
            ? { styles: "border-red-500 bg-red-50", title: "⚠️ WAARSCHUWING", color: "text-red-600" }
            : isInfo
            ? { styles: "border-blue-500 bg-blue-50", title: "ℹ️ INFORMATIE", color: "text-blue-600" }
            : { styles: "border-emerald-500 bg-emerald-50", title: "💡 TIP", color: "text-emerald-600" };

          // Recursieve functie om [!TAG] uit de uiteindelijke tekst te verwijderen (met TS fix)
          const cleanNode = (node: any): any => {
            if (typeof node === 'string') {
              return node.replace(/\[!(TIP|INFO|WARNING|CAUTION)\]/gi, "").trim();
            }
            if (Array.isArray(node)) {
              return node.map(cleanNode);
            }
            if (node?.props?.children) {
              return React.cloneElement(node, {
                children: cleanNode(node.props.children)
              });
            }
            return node;
          };

          return (
            <div className={`my-8 border-l-4 rounded-r-2xl p-6 ${config.styles}`}>
              <div className={`text-[10px] font-black tracking-widest mb-2 ${config.color}`}>
                {config.title}
              </div>
              <div className="text-slate-700 leading-relaxed font-medium prose-p:my-0">
                {cleanNode(children)}
              </div>
            </div>
          );
        },

        // AFBEELDINGEN MET ZOOM
        img: ({ node, ...props }: any) => (
          <div className="my-8">
            <Zoom>
              <img 
                {...props} 
                className="rounded-3xl shadow-xl border border-slate-100 w-full h-auto" 
                loading="lazy"
              />
            </Zoom>
            {props.alt && (
              <p className="text-center text-[10px] font-bold uppercase text-slate-400 mt-3 tracking-widest">
                {props.alt}
              </p>
            )}
          </div>
        ),

        // CUSTOM PARAGRAPH HANDLER (Voor video:// support)
        p: ({ children }: any) => {
          const text = flattenText(children);
          if (text.startsWith("video://")) {
            const url = text.replace("video://", "").trim();
            return (
              <div className="my-8">
                <video 
                  controls 
                  className="w-full rounded-3xl shadow-lg bg-black aspect-video"
                  preload="metadata"
                >
                  <source src={url} type="video/mp4" />
                </video>
              </div>
            );
          }
          return <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>;
        },

        // LINKS
        a: ({ href, children }: any) => (
          <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-teal-600 underline decoration-teal-200 underline-offset-4 hover:text-teal-700 transition-colors"
          >
            {children}
          </a>
        ),

        // LIJSTEN
        ul: ({ children }: any) => <ul className="list-disc pl-6 mb-4 space-y-2 text-slate-700">{children}</ul>,
        ol: ({ children }: any) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-slate-700">{children}</ol>,
        
        // HEADERS
        h1: ({ children }: any) => <h1 className="text-3xl font-black uppercase italic tracking-tighter mt-12 mb-6 text-slate-900 leading-none">{children}</h1>,
        h2: ({ children }: any) => <h2 className="text-xl font-black uppercase tracking-tight mt-10 mb-4 text-slate-800 border-b border-slate-100 pb-2">{children}</h2>,
        h3: ({ children }: any) => <h3 className="text-lg font-bold mt-8 mb-3 text-slate-800">{children}</h3>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}