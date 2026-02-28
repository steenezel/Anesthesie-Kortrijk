import React from "react";
import { useRoute, Link } from "wouter";
import { ChevronLeft, Info, Camera, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

const allPocus = import.meta.glob('../content/pocus/*.md', { query: 'raw', eager: true });

export default function PocusDetail() {
  const [, params] = useRoute("/pocus/:id");
  const id = params?.id;

  const fileKey = Object.keys(allPocus).find(key => key.toLowerCase().endsWith(`/${id?.toLowerCase()}.md`));
  const rawContent = fileKey ? (allPocus[fileKey] as any).default || allPocus[fileKey] : null;

  if (!rawContent) return <div className="p-12 text-center font-black uppercase tracking-tighter text-slate-400">Protocol niet gevonden</div>;

  const parts = typeof rawContent === 'string' ? rawContent.split('---') : [];
  const content = parts.length > 2 ? parts.slice(2).join('---') : rawContent;
  const title = content.match(/# (.*)/)?.[1] || id?.replace(/-/g, ' ');

  const markdownComponents = {
    strong: ({ ...props }) => <strong className="text-teal-900 font-black" {...props} />,
    blockquote: ({ children }: any) => {
      const content = children[1]?.props?.children?.[0] || "";
      let style = "border-l-4 border-slate-300 bg-slate-50 p-4 my-4 rounded-r-xl";
      if (content.includes("[!TIP]")) style = "border-l-4 border-emerald-500 bg-emerald-50/50 p-4 my-4 rounded-r-xl";
      if (content.includes("[!WARNING]")) style = "border-l-4 border-amber-500 bg-amber-50/50 p-4 my-4 rounded-r-xl";
      return <div className={style}>{children}</div>;
    },
    img: ({ src, alt }: any) => (
      <div className="my-6">
        <Zoom>
          <img src={src} alt={alt} className="rounded-2xl shadow-sm border border-slate-100 w-full" />
        </Zoom>
        {alt && <p className="text-[10px] text-center mt-2 font-bold text-slate-400 uppercase tracking-widest">{alt}</p>}
      </div>
    )
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="p-6 bg-slate-50 border-b border-slate-100">
        <Link href="/pocus">
          <div className="flex items-center text-teal-600 font-black uppercase text-[10px] tracking-[0.2em] mb-4 cursor-pointer">
            <ChevronLeft className="h-4 w-4 mr-1" /> Overzicht
          </div>
        </Link>
        <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900 leading-tight">{title}</h1>
      </div>

      <Tabs defaultValue="algemeen" className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b border-slate-100 bg-white h-14 px-6 gap-6 overflow-x-auto no-scrollbar">
          <TabsTrigger value="algemeen" className="data-[state=active]:border-b-2 data-[state=active]:border-teal-600 rounded-none px-0 h-14 font-black uppercase text-[10px] tracking-widest gap-2">
            <Info size={14} /> Algemeen
          </TabsTrigger>
          <TabsTrigger value="acquisitie" className="data-[state=active]:border-b-2 data-[state=active]:border-teal-600 rounded-none px-0 h-14 font-black uppercase text-[10px] tracking-widest gap-2">
            <Camera size={14} /> Acquisitie
          </TabsTrigger>
          <TabsTrigger value="interpretatie" className="data-[state=active]:border-b-2 data-[state=active]:border-teal-600 rounded-none px-0 h-14 font-black uppercase text-[10px] tracking-widest gap-2">
            <Eye size={14} /> Interpretatie
          </TabsTrigger>
        </TabsList>

        <div className="px-6 py-4 prose prose-slate max-w-none">
          <TabsContent value="algemeen">
            <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw]}>
              {content.split('## Acquisitie')[0]}
            </ReactMarkdown>
          </TabsContent>
          
          <TabsContent value="acquisitie">
            <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw]}>
              {'## Acquisitie' + content.split('## Acquisitie')[1]?.split('## Interpretatie')[0]}
            </ReactMarkdown>
          </TabsContent>

          <TabsContent value="interpretatie">
            <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw]}>
              {'## Interpretatie' + content.split('## Interpretatie')[1]}
            </ReactMarkdown>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}