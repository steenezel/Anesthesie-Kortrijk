import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from 'rehype-raw';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

// Hulpfunctie om tekst te extraheren voor de [!TIP] checks
const flattenText = (node: any): string => {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(flattenText).join('');
  if (node?.props?.children) return flattenText(node.props.children);
  return '';
};

export function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  // 1. Detecteer of het HTML (Cloud) is of Markdown (Lokaal)
  const isHtml = /<[a-z][\s\S]*>/i.test(content);

  // --- CLOUD / HTML MODUS ---
  if (isHtml) {
    return (
      <div 
        className="prose prose-slate max-w-none break-words
          /* POCUS Sub-kopjes styling (H2) */
          prose-h2:text-[10px] prose-h2:font-black prose-h2:uppercase prose-h2:tracking-[0.2em] prose-h2:text-blue-600 prose-h2:mb-2 prose-h2:mt-8 prose-h2:border-b prose-h2:border-blue-100 prose-h2:pb-1
          prose-h3:text-lg prose-h3:font-black prose-h3:text-slate-900 prose-h3:mt-4
          /* Afbeeldingen styling */
          prose-img:rounded-3xl prose-img:shadow-xl prose-img:my-6 prose-img:border prose-img:border-slate-100
          /* Tabel styling */
          prose-table:border-collapse prose-td:p-3 prose-th:bg-slate-50 prose-th:font-black prose-th:uppercase prose-th:text-[10px]
          /* Blockquote styling voor HTML */
          prose-blockquote:border-l-4 prose-blockquote:border-emerald-500 prose-blockquote:bg-emerald-50 prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl prose-blockquote:text-emerald-900 prose-blockquote:italic"
      >
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    );
  }

  // --- LOKAAL / MARKDOWN MODUS ---
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        // DE BLOCKQUOTE CODE VOOR MARKDOWN:
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
        // Afbeeldingen zoom voor Markdown
        img: ({ node, ...props }: any) => (
          <div className="my-8">
            <Zoom><img {...props} className="rounded-3xl shadow-xl border border-slate-100 w-full h-auto" /></Zoom>
            {props.alt && <p className="text-center text-[10px] font-bold uppercase text-slate-400 mt-3 tracking-widest">{props.alt}</p>}
          </div>
        ),
        // Video handler voor Markdown
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