import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
// @ts-ignore
import renderMathInElement from "katex/dist/contrib/auto-render";
// @ts-ignore
import parse, {
  domToReact,
  HTMLReactParserOptions,
  Element,
} from "html-react-parser";

const flattenText = (node: unknown): string => {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(flattenText).join("");
  if (React.isValidElement(node) && node.props?.children) {
    return flattenText(node.props.children);
  }
  return "";
};

const videoFullTokenRegex = /\[VIDEO:[^\]]+\]/gi;

const renderVideoBlock = (url: string) => {
  const trimmed = url.trim();
  if (!trimmed) return null;
  return (
    <div className="my-8 w-full">
      <video
        controls
        playsInline
        className="rounded-3xl shadow-xl aspect-video bg-black"
        src={trimmed}
      />
    </div>
  );
};

const splitByVideoShortcodes = (text: string) => {
  const captureRegex = /\[VIDEO:([^\]]+)\]/gi;
  const urls = Array.from(text.matchAll(captureRegex))
    .map((m) => m[1]?.trim())
    .filter((u): u is string => !!u && u.length > 0);

  const parts = text.split(videoFullTokenRegex);
  return { urls, parts };
};

const htmlParserOptions: HTMLReactParserOptions = {
  replace: (domNode: unknown) => {
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
      const childrenReact = domToReact(
        domNode.children as unknown as React.ReactNode[]
      );
      const fullText = flattenText({ props: { children: childrenReact } });
      const isWarning = /WAARSCHUWING|LET OP|CAUTION/i.test(fullText);
      const isInfo = /INFO|NOTE/i.test(fullText);
      const config = isWarning
        ? {
            styles: "border-red-500 bg-red-50",
            title: "⚠️ WAARSCHUWING",
            color: "text-red-600",
          }
        : isInfo
        ? {
            styles: "border-blue-500 bg-blue-50",
            title: "ℹ️ INFORMATIE",
            color: "text-blue-600",
          }
        : {
            styles: "border-emerald-500 bg-emerald-50",
            title: "💡 TIP",
            color: "text-emerald-600",
          };

      return (
        <div className={`my-8 border-l-4 rounded-r-2xl p-6 ${config.styles}`}>
          <div
            className={`text-[10px] font-black tracking-widest mb-2 ${config.color}`}
          >
            {config.title}
          </div>
          <div className="text-slate-700 italic font-medium prose-p:my-0">
            {childrenReact}
          </div>
        </div>
      );
    }

    if (domNode.name === "video") {
      const videoSrc =
        domNode.attribs.src ||
        (domNode.children?.find((c: any) => c.name === "source") as any)
          ?.attribs?.src;
      if (!videoSrc) return null;
      return renderVideoBlock(videoSrc);
    }

    if (domNode.name === "p") {
      const childrenReact = domToReact(
        domNode.children as unknown as React.ReactNode[]
      );
      const fullText = flattenText({ props: { children: childrenReact } });
      if (!fullText.includes("[VIDEO:")) return;
      const { urls, parts } = splitByVideoShortcodes(fullText);
      if (urls.length === 0) return;

      const first = parts[0]?.trim() ?? "";
      const last = parts[parts.length - 1]?.trim() ?? "";
      if (urls.length === 1 && first === "" && last === "") {
        return renderVideoBlock(urls[0]);
      }

      const renderTextPart = (txt: string) =>
        txt.trim() ? (
          <p className="mb-4 leading-relaxed text-slate-700">{txt.trim()}</p>
        ) : null;

      return (
        <>
          {renderTextPart(parts[0] ?? "")}
          {urls.map((u, i) => (
            <React.Fragment key={`${u}-${i}`}>
              {renderVideoBlock(u)}
              {renderTextPart(parts[i + 1] ?? "")}
            </React.Fragment>
          ))}
        </>
      );
    }
  },
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
    return (
      <div ref={htmlContainerRef} className="prose prose-slate max-w-none">
        {parse(content, htmlParserOptions)}
      </div>
    );
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeRaw, rehypeKatex]}
      components={{
        blockquote: ({ children }: { children: React.ReactNode }) => {
          const fullText = flattenText(children);
          const isWarning = /\[!(WARNING|CAUTION)\]/i.test(fullText);
          const isInfo = /\[!INFO\]/i.test(fullText);
          const config = isWarning
            ? {
                styles: "border-red-500 bg-red-50",
                title: "⚠️ WAARSCHUWING",
                color: "text-red-600",
              }
            : isInfo
            ? {
                styles: "border-blue-500 bg-blue-50",
                title: "ℹ️ INFORMATIE",
                color: "text-blue-600",
              }
            : {
                styles: "border-emerald-500 bg-emerald-50",
                title: "💡 TIP",
                color: "text-emerald-600",
              };

          if (!isWarning && !isInfo) {
            return (
              <blockquote className="border-l-4 border-slate-200 pl-4 italic my-6">
                {children}
              </blockquote>
            );
          }

          const cleanNode = (node: unknown): React.ReactNode => {
            if (typeof node === "string") {
              return node.replace(/\[!(TIP|INFO|WARNING|CAUTION)\]/gi, "").trim();
            }
            if (Array.isArray(node)) return node.map(cleanNode);
            if (React.isValidElement(node) && node.props?.children) {
              return React.cloneElement(node, {
                children: cleanNode(node.props.children),
              });
            }
            return node as React.ReactNode;
          };

          return (
            <div className={`my-8 border-l-4 rounded-r-2xl p-6 ${config.styles}`}>
              <div
                className={`text-[10px] font-black tracking-widest mb-2 ${config.color}`}
              >
                {config.title}
              </div>
              <div className="text-slate-700 font-medium italic">
                {cleanNode(children)}
              </div>
            </div>
          );
        },
        img: ({ node, ...props }: any) => (
          <div className="my-8">
            <Zoom>
              <img
                {...props}
                className="rounded-3xl shadow-xl border border-slate-100 w-full h-auto"
              />
            </Zoom>
          </div>
        ),
        p: ({ children }: { children: React.ReactNode }) => {
          const text = flattenText(children);

          if (text.includes("[VIDEO:")) {
            const { urls, parts } = splitByVideoShortcodes(text);
            if (urls.length === 0) return <p className="mb-4 leading-relaxed text-slate-700">{children}</p>;

            const first = parts[0]?.trim() ?? "";
            const last = parts[parts.length - 1]?.trim() ?? "";
            if (urls.length === 1 && first === "" && last === "") {
              return renderVideoBlock(urls[0]);
            }

            const renderTextPart = (txt: string) =>
              txt.trim() ? (
                <p className="mb-4 leading-relaxed text-slate-700">{txt.trim()}</p>
              ) : null;

            return (
              <>
                {renderTextPart(parts[0] ?? "")}
                {urls.map((u, i) => (
                  <React.Fragment key={`${u}-${i}`}>
                    {renderVideoBlock(u)}
                    {renderTextPart(parts[i + 1] ?? "")}
                  </React.Fragment>
                ))}
              </>
            );
          }

          if (text.startsWith("video://")) {
            const url = text.replace("video://", "").trim();
            return renderVideoBlock(url);
          }

          return <p className="mb-4 leading-relaxed text-slate-700">{children}</p>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

