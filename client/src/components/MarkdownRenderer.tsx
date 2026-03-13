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
        blockquote: ({ children }: any) => {
          const fullText = flattenText(children);
          const isWarning = fullText.includes("[!WARNING]");
          const isInfo = fullText.includes("[!INFO]");
          const isTip = fullText.includes("[!TIP]");

          if (!isWarning && !isInfo && !isTip) {
            return <blockquote className="border-l-4 border-slate-200 pl-6 my-8 text-slate-600 italic">{children}</blockquote>;
          }

          const config = isWarning
            ? { styles: "border-red-500 bg-red-50", title: "⚠️ WAARSCHUWING", color: "text-red-600" }
            : isInfo
            ? { styles: "border-blue-500 bg-blue-50", title: "ℹ️ INFORMATIE", color: "text-blue-600" }
            : { styles: "border-emerald-500 bg-emerald-50", title: "💡 TIP", color: "text-emerald-600" };

          const cleanRecursive = (node: any): any => {
            if (typeof node === 'string') return node.replace(/\[!WARNING\]|\[!INFO\]|\[!TIP\]/g, "").trimStart();
            if (Array.isArray(node)) return node.map(cleanRecursive);
            if (node?.props?.children) {
              return React.cloneElement(node, { ...node.props, children: cleanRecursive(node.props.children) });
            }
            return node;
          };

          return (
            <div className={`my-8 border-l-4 rounded-r-2xl p-6 ${config.styles}`}>
              <div className={`text-[10px] font-black tracking-widest mb-2 ${config.color}`}>
                {config.title}
              </div>
              <div className="text-slate-700 leading-relaxed font-medium">
                {cleanRecursive(children)}
              </div>
            </div>
          );
        },
        img: ({ node, ...props }: any) => (
          <div className="my-8">
            <Zoom>
              <img {...props} className="rounded-3xl shadow-xl border border-slate-100 w-full h-auto" />
            </Zoom>
            {props.alt && <p className="text-center text-[10px] font-bold uppercase text-slate-400 mt-3 tracking-widest">{props.alt}</p>}
          </div>
        ),
        // Video handler voor video:// syntax
        p: ({ children }: any) => {
          const text = flattenText(children);
          if (text.startsWith("video://")) {
            const url = text.replace("video://", "").trim();
            return (
              <video controls className="w-full rounded-3xl shadow-lg my-6 bg-black">
                <source src={url} type="video/mp4" />
              </video>
            );
          }
          return <p className="leading-relaxed mb-4">{children}</p>;
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
}