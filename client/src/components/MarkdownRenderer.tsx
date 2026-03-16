import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from 'rehype-raw';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
// @ts-ignore
import renderMathInElement from 'katex/dist/contrib/auto-render';
// We gebruiken @ts-ignore hier mochten de types in de cloud omgeving nog niet direct geladen zijn
// @ts-ignore
import parse, { domToReact, HTMLReactParserOptions, Element } from 'html-react-parser';

const flattenText = (node: any): string => {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(flattenText).join('');
  if (node?.props?.children) return flattenText(node.props.children);
  return '';
};

export function MarkdownRenderer({ content }: { content: string }) {
  const htmlContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (htmlContainerRef.current) {
      renderMathInElement(htmlContainerRef.current, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
        ],
        throwOnError: false,
      });
    }
  }, [content]);

  if (!content) return null;

  const isHtml = /<[a-z][\s\S]*>/i.test(content);

  if (isHtml) {
    const options: HTMLReactParserOptions = {
      // Hier definiëren we domNode expliciet om de TS7006 error te voorkomen
      replace: (domNode: any) => {
        if (!(domNode instanceof Element)) return;

        if (domNode.name === 'img') {
          return (
            <div className="my-8">
              <Zoom>
                <img 
                  {...domNode.attribs} 
                  className="rounded-3xl shadow-xl border border-slate-100 w-full h-auto" 
                  alt={domNode.attribs.alt || ""}
                />
              </Zoom>
            </div>
          );
        }

        if (domNode.name === 'blockquote') {
            const childrenReact = domToReact(domNode.children as any);
            // Gebruik flattenText om te checken op triggerwoorden
            const fullText = flattenText({ props: { children: childrenReact } });
            
            const isWarning = /WAARSCHUWING|LET OP|CAUTION/i.test(fullText);
            const isInfo = /INFO|NOTE/i.test(fullText);
            
            const config = isWarning
              ? { styles: "border-red-500 bg-red-50", title: "⚠️ WAARSCHUWING", color: "text-red-600" }
              : isInfo
              ? { styles: "border-blue-500 bg-blue-50", title: "ℹ️ INFORMATIE", color: "text-blue-600" }
              : { styles: "border-emerald-500 bg-emerald-50", title: "💡 TIP", color: "text-emerald-600" };

            return (
              <div className={`my-8 border-l-4 rounded-r-2xl p-6 ${config.styles}`}>
                <div className={`text-[10px] font-black tracking-widest mb-2 ${config.color}`}>{config.title}</div>
                <div className="text-slate-700 italic font-medium prose-p:my-0">
                  {childrenReact}
                </div>
              </div>
            );
          }

        if (domNode.name === 'video') {
            return (
              <div className="my-8 overflow-hidden rounded-3xl shadow-xl bg-black aspect-video">
                <video 
                  controls 
                  className="w-full h-full"
                  // Zorg dat de src uit de attributen van de editor komt
                  src={domNode.attribs.src}
                >
                  {/* Fallback voor oudere versies met source tags */}
                  {domNode.children && domToReact(domNode.children as any)}
                </video>
              </div>
            );
          }
      }
    };

    return (
      <div 
        ref={htmlContainerRef}
        className="prose prose-slate max-w-none [hyphens:auto] break-words
          prose-h2:text-[10px] prose-h2:font-black prose-h2:uppercase prose-h2:tracking-[0.2em] prose-h2:text-blue-600 prose-h2:mb-2 prose-h2:mt-8 prose-h2:border-b prose-h2:border-blue-100 prose-h2:pb-1
          prose-a:text-blue-600 prose-a:font-bold prose-a:no-underline hover:prose-a:underline"
      >
        {parse(content, options)}
      </div>
    );
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeRaw, rehypeKatex]}
      components={{
        blockquote: ({ children }: any) => {
          const fullText = flattenText(children);
          const isWarning = /\[!(WARNING|CAUTION)\]/i.test(fullText);
          const isInfo = /\[!INFO\]/i.test(fullText);
          const isTip = /\[!TIP\]/i.test(fullText);

          const config = isWarning
            ? { styles: "border-red-500 bg-red-50", title: "⚠️ WAARSCHUWING", color: "text-red-600" }
            : isInfo
            ? { styles: "border-blue-500 bg-blue-50", title: "ℹ️ INFORMATIE", color: "text-blue-600" }
            : { styles: "border-emerald-500 bg-emerald-50", title: "💡 TIP", color: "text-emerald-600" };

          if (!isWarning && !isInfo && !isTip) {
            return <blockquote className="border-l-4 border-slate-200 pl-4 italic my-6 text-slate-600">{children}</blockquote>;
          }

          const cleanNode = (node: any): any => {
            if (typeof node === 'string') return node.replace(/\[!(TIP|INFO|WARNING|CAUTION)\]/gi, "").trim();
            if (Array.isArray(node)) return node.map(cleanNode);
            if (node?.props?.children) return React.cloneElement(node, { children: cleanNode(node.props.children) });
            return node;
          };

          return (
            <div className={`my-8 border-l-4 rounded-r-2xl p-6 ${config.styles}`}>
              <div className={`text-[10px] font-black tracking-widest mb-2 ${config.color}`}>{config.title}</div>
              <div className="text-slate-700 leading-relaxed font-medium italic">{cleanNode(children)}</div>
            </div>
          );
        },
        img: ({ node, ...props }: any) => (
          <div className="my-8">
            <Zoom><img {...props} className="rounded-3xl shadow-xl border border-slate-100 w-full h-auto" /></Zoom>
            {props.alt && <p className="text-center text-[10px] font-bold uppercase text-slate-400 mt-3 tracking-widest">{props.alt}</p>}
          </div>
        ),
        p: ({ children }: any) => {
          const text = flattenText(children);
          if (text.startsWith("video://")) {
            const url = text.replace("video://", "").trim();
            return (
              <video controls className="w-full rounded-3xl shadow-lg my-6 bg-black aspect-video" preload="metadata">
                <source src={url} type="video/mp4" />
              </video>
            );
          }
          return <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>;
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
}