import React, { useMemo } from "react";
import { useRoute, Link } from "wouter";
import { ChevronLeft, Loader2, Pencil, CloudDownload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

const allPocus = import.meta.glob('../content/pocus/*.md', { query: 'raw', eager: true });

export default function PocusDetail() {
  const [, params] = useRoute("/pocus/:id");
  const id = params?.id;

  const queryParams = new URLSearchParams(window.location.search);
  const backUrl = queryParams.get('from') || '/pocus';

  // 1. Check of ID een Cloud-UUID is (voorkomt 400 error bij Supabase)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || "");

  const { data: dbPocus, isLoading } = useQuery({
    queryKey: ['pocus', id],
    queryFn: async () => {
      if (!id || !isUuid) return null;
      const { data } = await supabase.from('pocus').select('*').eq('id', id).single();
      return data;
    },
    enabled: !!id && isUuid
  });

  // 2. Lokale fallback data voor MD bestanden
  const fileKey = Object.keys(allPocus).find(key => key.toLowerCase().endsWith(`/${id?.toLowerCase()}.md`));
  const fileData = fileKey ? (allPocus[fileKey] as any) : null;
  const rawContent = fileData?.default || fileData || "";

  const local = useMemo(() => {
    if (!rawContent || isUuid) return null;
    
    // Frontmatter extractie
    const titleMatch = rawContent.match(/title: "(.*)"/);
    const indicationMatch = rawContent.match(/indication: "(.*)"/);
    
    const sections = rawContent.split(/\n## /);
    
    // Bepaal de inhoud van de eerste tab
    const indicatieContent = indicationMatch 
      ? indicationMatch[1] 
      : sections[0].replace(/^# .*\n/, '').replace(/---[\s\S]*?---/, '').trim();

    return {
      title: titleMatch ? titleMatch[1] : id?.replace(/-/g, ' '),
      indicaties: indicatieContent,
      // Flexibele zoekterm voor de tweede tab (Techniek/Acquisitie/Scan)
      techniek: sections.find((s: string) => /techniek|acquisitie|scan/i.test(s))
        ?.replace(/.*(techniek|acquisitie|scan).*\n/i, "") || "",
      interpretatie: sections.find((s: string) => /interpretatie/i.test(s))
        ?.replace(/.*interpretatie.*\n/i, "") || ""
    };
  }, [rawContent, id, isUuid]);

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  const title = dbPocus?.title || local?.title || id?.replace(/-/g, ' ');

  return (
    <div className="min-h-screen bg-white pb-20 px-4">
      {/* HEADER BALK */}
      <div className="flex items-center justify-between py-4 sticky top-0 bg-white/80 backdrop-blur-md z-10 max-w-3xl mx-auto w-full">
        <Link href={backUrl}>
          <div className="flex items-center text-blue-600 font-black uppercase text-[10px] tracking-widest cursor-pointer group">
            <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Terug
          </div>
        </Link>
        <div className="flex gap-2">
          {dbPocus ? (
            <Link href={`/admin?type=pocus&id=${dbPocus.id}`}>
              <div className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-blue-600 cursor-pointer flex items-center gap-2 font-black text-[9px] uppercase tracking-widest">
                <Pencil size={14} /> Edit
              </div>
            </Link>
          ) : rawContent && (
            <Link href={`/admin?migrate=${id}&type=pocus`}>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl cursor-pointer flex items-center gap-2 font-black text-[9px] uppercase tracking-widest border border-amber-100">
                <CloudDownload size={14} /> Migreer naar Cloud
              </div>
            </Link>
          )}
        </div>
      </div>

      <div className="p-6 max-w-3xl mx-auto w-full">
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-8 italic text-slate-900 leading-[0.9]">
          {title}
        </h1>

        <Tabs defaultValue="indicaties" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100 rounded-2xl p-1">
            <TabsTrigger value="indicaties" className="rounded-xl font-black text-[10px] uppercase">Indicaties</TabsTrigger>
            <TabsTrigger value="techniek" className="rounded-xl font-black text-[10px] uppercase">Techniek</TabsTrigger>
            <TabsTrigger value="interpretatie" className="rounded-xl font-black text-[10px] uppercase">Interpretatie</TabsTrigger>
          </TabsList>
          
          <TabsContent value="indicaties" className="mt-6 prose prose-slate max-w-none break-words overflow-hidden">
            <MarkdownRenderer content={dbPocus?.content_indicaties || local?.indicaties || ""} />
          </TabsContent>
          <TabsContent value="techniek" className="mt-6 prose prose-slate max-w-none break-words overflow-hidden">
            <MarkdownRenderer content={dbPocus?.content_techniek || local?.techniek || ""} />
          </TabsContent>
          <TabsContent value="interpretatie" className="mt-6 prose prose-slate max-w-none break-words overflow-hidden">
            <MarkdownRenderer content={dbPocus?.content_interpretatie || local?.interpretatie || ""} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}