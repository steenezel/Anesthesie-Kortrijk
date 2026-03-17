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

  const parseOptions: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode instanceof Element && domNode.name === 'video') {
        const { src } = domNode.attribs;
        return (
          <div className="my-8 rounded-3xl overflow-hidden shadow-2xl bg-black aspect-video">
            <video controls playsInline src={src} className="w-full h-full" preload="metadata" />
          </div>
        );
      }
    }
  };

  return (
    <div ref={htmlContainerRef} className="prose prose-slate max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={{
          h2: ({ children }: { children: React.ReactNode }) => (
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4 mt-8 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              {children}
            </h2>
          ),
          blockquote: ({ children }: { children: React.ReactNode }) => {
            const text = flattenText(children);
            let config = { styles: "bg-emerald-50 border-emerald-200", color: "text-emerald-600", title: "💡 TIP" };
            if (text.includes("WAARSCHUWING:")) config = { styles: "bg-red-50 border-red-200", color: "text-red-600", title: "⚠️ WAARSCHUWING" };
            if (text.includes("INFO:")) config = { styles: "bg-blue-50 border-blue-200", color: "text-blue-600", title: "ℹ️ INFO" };

            const cleanNode = (node: any): any => {
              if (typeof node === 'string') return node.replace(/WAARSCHUWING:|INFO:/g, '').trim();
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
                <div className="my-8 rounded-3xl overflow-hidden shadow-2xl bg-black aspect-video">
                  <video controls className="w-full h-full" preload="metadata"><source src={url} type="video/mp4" /></video>
                </div>
              );
            }
            return <div className="mb-4 leading-relaxed text-slate-700">{parse(content, parseOptions)}</div>;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}