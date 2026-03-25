import React, { useMemo } from "react"; // <--- useMemo toegevoegd
import { useRoute, Link } from "wouter";
import { ChevronLeft, Loader2, Pencil, CloudDownload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import CaudalCalculator from "@/components/CaudalCalculator";

const allBlocks = import.meta.glob('../content/blocks/*.md', { query: 'raw', eager: true });

export default function BlockDetail() {
  const [, params] = useRoute("/blocks/:id");
  const id = params?.id;
  const queryParams = new URLSearchParams(window.location.search);
  const backUrl = queryParams.get('from') || '/blocks';

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || "");

  const { data: dbBlock, isLoading } = useQuery({
    queryKey: ['block', id],
    queryFn: async () => {
      if (!id || !isUuid) return null;
      const { data } = await supabase.from('blocks').select('*').eq('id', id).single();
      return data;
    },
    enabled: !!id && isUuid
  });

  const fileKey = Object.keys(allBlocks).find(key => key.toLowerCase().endsWith(`/${id?.toLowerCase()}.md`));
  const fileData = fileKey ? (allBlocks[fileKey] as any) : null;
  const rawContent = fileData?.default || fileData || "";

  const local = useMemo(() => {
    if (!rawContent) return { title: id?.replace(/-/g, ' '), general: "", anatomy: "", technique: "" };
    const sections = rawContent.split(/\n## /);
    return {
      title: rawContent.match(/title: "(.*)"/)?.[1] || id?.replace(/-/g, ' '),
      general: sections[0].replace(/^# .*\n/, '').replace(/---[\s\S]*?---/, '').trim(),
      anatomy: sections.find((s: string) => /anatomie|scan/i.test(s))?.replace(/.*anatomie.*\n|.*anatomy.*\n/i, "") || "",
      technique: sections.find((s: string) => /techniek|technique/i.test(s))?.replace(/.*techniek.*\n|.*technique.*\n/i, "") || ""
    };
  }, [rawContent, id]);

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-teal-600" /></div>;

  return (
    <div className="min-h-screen bg-white pb-20 px-4">
      <div className="flex items-center justify-between py-4 sticky top-0 bg-white/80 backdrop-blur-md z-10 max-w-3xl mx-auto w-full">
        <Link href={backUrl}>
          <div className="flex items-center text-teal-600 font-black uppercase text-[10px] tracking-widest cursor-pointer group">
            <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Terug
          </div>
        </Link>
        <div className="flex gap-2">
          {dbBlock ? (
            <Link href={`/admin?type=blocks&id=${dbBlock.id}`}>
              <div className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-teal-600 cursor-pointer flex items-center gap-2 font-black text-[9px] uppercase tracking-widest">
                <Pencil size={14} /> Edit
              </div>
            </Link>
          ) : rawContent && (
            <Link href={`/admin?migrate=${id}&type=blocks`}>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl cursor-pointer flex items-center gap-2 font-black text-[9px] uppercase tracking-widest border border-amber-100">
                <CloudDownload size={14} /> Migreer
              </div>
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto mt-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-8 italic text-slate-900 leading-none">
          {dbBlock?.title || local.title}
        </h1>

        <Tabs defaultValue="algemeen" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100 rounded-2xl p-1">
            <TabsTrigger value="algemeen" className="rounded-xl font-black text-[10px] uppercase">Algemeen</TabsTrigger>
            <TabsTrigger value="anatomie" className="rounded-xl font-black text-[10px] uppercase">Anatomie</TabsTrigger>
            <TabsTrigger value="techniek" className="rounded-xl font-black text-[10px] uppercase">Techniek</TabsTrigger>
          </TabsList>
          
          <TabsContent value="algemeen" className="mt-6 prose prose-slate max-w-none">
            <MarkdownRenderer content={dbBlock?.content_general || local.general} />
            {id === "caudaal-blok" && <CaudalCalculator />}
          </TabsContent>
          <TabsContent value="anatomie" className="mt-6 prose prose-slate max-w-none">
            <MarkdownRenderer content={dbBlock?.content_anatomy || local.anatomy} />
          </TabsContent>
          <TabsContent value="techniek" className="mt-6 prose prose-slate max-w-none">
            <MarkdownRenderer content={dbBlock?.content_technique || local.technique} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}