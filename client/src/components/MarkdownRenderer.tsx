import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
// @ts-expect-error - KaTeX contrib doesn't have official types, but we need the JS
import renderMathInElement from "katex/dist/contrib/auto-render";
import parse, { domToReact, HTMLReactParserOptions, Element } from "html-react-parser";

// Verbeterde flattenText voor TS compatibiliteit
const flattenText = (node: any): string => {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(flattenText).join("");
  if (React.isValidElement(node) && node.props && (node.props as any).children) {
    return flattenText((node.props as any).children);
  }
  return "";
};

const renderVideoBlock = (url: string) => {
  const trimmed = url.trim();
  if (!trimmed) return null;
  return (
    <div className="my-8 w-full overflow-hidden rounded-3xl shadow-xl bg-black aspect-video border border-slate-100">
      <video
        controls
        playsInline
        preload="metadata"
        className="w-full h-full object-contain"
        src={trimmed}
      >
        <source src={trimmed} type="video/mp4" />
      </video>
    </div>
  );
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

  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (!(domNode instanceof Element)) return;

      if (domNode.name === "img") {
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

      if (domNode.name === "blockquote") {
        const childrenReact = domToReact(domNode.children as any);
        const fullText = flattenText(childrenReact);
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
            <div className="text-slate-700 italic font-medium">{childrenReact}</div>
          </div>
        );
      }

      if (domNode.name === "video") {
        const src = domNode.attribs.src || (domNode.children?.find((c: any) => c.name === "source") as any)?.attribs?.src;
        return renderVideoBlock(src);
      }
    },
  };

  const isHtml = /<[a-z][\s\S]*>/i.test(content);

  if (isHtml) {
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
        // FIX: Gebruik any voor props om mismatch met ReactMarkdown types te voorkomen
        blockquote: (props: any) => {
          const { children } = props;
          const fullText = flattenText(children);
          const isWarning = /\[!(WARNING|CAUTION)\]/i.test(fullText);
          const isInfo = /\[!INFO\]/i.test(fullText);
          const config = isWarning
            ? { styles: "border-red-500 bg-red-50", title: "⚠️ WAARSCHUWING", color: "text-red-600" }
            : isInfo
            ? { styles: "border-blue-500 bg-blue-50", title: "ℹ️ INFORMATIE", color: "text-blue-600" }
            : { styles: "border-emerald-500 bg-emerald-50", title: "💡 TIP", color: "text-emerald-600" };

          const cleanNode = (node: any): any => {
            if (typeof node === "string") return node.replace(/\[!(TIP|INFO|WARNING|CAUTION)\]/gi, "").trim();
            if (Array.isArray(node)) return node.map(cleanNode);
            if (React.isValidElement(node)) {
              return React.cloneElement(node, { 
                children: cleanNode((node.props as any).children) 
              } as any);
            }
            return node;
          };

          return (
            <div className={`my-8 border-l-4 rounded-r-2xl p-6 ${config.styles}`}>
              <div className={`text-[10px] font-black tracking-widest mb-2 ${config.color}`}>{config.title}</div>
              <div className="text-slate-700 font-medium italic">{cleanNode(children)}</div>
            </div>
          );
        },
        img: (props: any) => {
          const { node, ...rest } = props;
          return (
            <div className="my-8">
              <Zoom>
                <img {...rest} className="rounded-3xl shadow-xl border border-slate-100 w-full h-auto" />
              </Zoom>
            </div>
          );
        },
        p: (props: any) => {
          const { children } = props;
          const text = flattenText(children);

          // Shortcode detectie [VIDEO:url]
          if (text.includes("[VIDEO:")) {
            const videoUrl = text.match(/\[VIDEO:(.*?)\]/)?.[1];
            if (videoUrl) return renderVideoBlock(videoUrl);
          }

          // video:// detectie
          if (text.startsWith("video://")) {
            const url = text.replace("video://", "").trim();
            return renderVideoBlock(url);
          }

          return <div className="mb-4 last:mb-0 leading-relaxed text-slate-700">{parse(content, options)}</div>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}