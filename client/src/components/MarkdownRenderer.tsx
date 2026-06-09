import React from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import "katex/dist/katex.min.css";

const flattenText = (node: any): string => {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(flattenText).join("");
  if (React.isValidElement(node) && node.props && (node.props as any).children) {
    return flattenText((node.props as any).children);
  }
  return "";
};

const cleanCalloutTokens = (node: any): any => {
  if (typeof node === "string") {
    return node.replace(/\[!(TIP|INFO|WARNING|CAUTION)\]/gi, "").trimStart();
  }

  if (Array.isArray(node)) {
    return node.map(cleanCalloutTokens);
  }

  if (React.isValidElement(node)) {
    return React.cloneElement(node, {
      ...node.props,
      children: cleanCalloutTokens((node.props as any).children),
    } as any);
  }

  return node;
};

const extractVideoUrl = (text: string): string | null => {
  const shortcodeMatch = text.match(/\[VIDEO:(.*?)\]/i);
  if (shortcodeMatch?.[1]) return shortcodeMatch[1].trim();

  const videoProtocolMatch = text.match(/^video:\/\/(.+)$/i);
  if (videoProtocolMatch?.[1]) return videoProtocolMatch[1].trim();

  const videoPrefixMatch = text.match(/^video:\s*(.+)$/i);
  if (videoPrefixMatch?.[1]) return videoPrefixMatch[1].trim();

  return null;
};

const renderVideoBlock = (url: string) => {
  const trimmed = url.trim();
  if (!trimmed) return null;

  return (
    <div className="my-8 w-full overflow-hidden rounded-3xl border border-slate-100 bg-black shadow-xl aspect-video">
      <video controls playsInline preload="metadata" className="h-full w-full object-contain" src={trimmed}>
        <source src={trimmed} type="video/mp4" />
      </video>
    </div>
  );
};

export function MarkdownRenderer({ content }: { content: string }) {
  if (!content?.trim()) return null;

  return (
    <div
      className="prose prose-slate max-w-none [hyphens:auto] break-words
        prose-h2:text-[10px] prose-h2:font-black prose-h2:uppercase prose-h2:tracking-[0.2em] prose-h2:text-blue-600 prose-h2:mb-2 prose-h2:mt-8 prose-h2:border-b prose-h2:border-blue-100 prose-h2:pb-1
        prose-a:text-blue-600 prose-a:font-bold prose-a:no-underline hover:prose-a:underline"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          blockquote: (props: any) => {
            const { children } = props;
            const fullText = flattenText(children);
            const isWarning = /\[!(WARNING|CAUTION)\]/i.test(fullText);
            const isInfo = /\[!INFO\]/i.test(fullText);
            const isTip = /\[!TIP\]/i.test(fullText);

            if (!isWarning && !isInfo && !isTip) {
              return <blockquote className="my-8 border-l-4 border-slate-200 pl-6 text-slate-600">{children}</blockquote>;
            }

            const config = isWarning
              ? { styles: "border-red-500 bg-red-50", title: "WAARSCHUWING", color: "text-red-600" }
              : isInfo
                ? { styles: "border-blue-500 bg-blue-50", title: "INFO", color: "text-blue-600" }
                : { styles: "border-emerald-500 bg-emerald-50", title: "TIP", color: "text-emerald-600" };

            return (
              <div className={`my-4 rounded-r-3xl border-l-8 p-5 shadow-sm ${config.styles}`}>
                <div className={`mb-1 text-[10px] font-black tracking-[0.2em] ${config.color}`}>{config.title}</div>
                <div className="leading-snug font-normal text-slate-900 whitespace-pre-wrap [&_p]:m-0">
                  {cleanCalloutTokens(children)}
                </div>
              </div>
            );
          },
          img: (props: any) => {
            const { alt, ...rest } = props;
            const isSmall = typeof alt === "string" && alt.includes("size-small");
            return (
              <div className={isSmall ? "my-4" : "my-8"}>
                <Zoom>
                  <img
                    {...rest}
                    alt={alt}
                    className={
                      isSmall
                        ? "w-auto max-h-32 rounded-lg border border-slate-200"
                        : "h-auto w-full rounded-2xl border border-slate-100 shadow-lg"
                    }
                  />
                </Zoom>
              </div>
            );
          },
          p: (props: any) => {
            const { children } = props;
            const text = flattenText(children).trim();
            const videoUrl = extractVideoUrl(text);

            if (videoUrl) {
              return renderVideoBlock(videoUrl);
            }

            return <p className="mb-4 last:mb-0 leading-relaxed text-slate-700">{children}</p>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
