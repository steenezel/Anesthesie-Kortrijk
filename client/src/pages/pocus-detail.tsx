import React from "react";
import { useRoute, Link } from "wouter";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { CmsEditLink } from "@/components/CmsEditLink";
import { BookmarkButton } from "@/components/BookmarkButton";
import { cacheContent, readCachedContent } from "@/lib/offline";

export default function PocusDetail() {
  const [, params] = useRoute("/pocus/:id");
  const id = params?.id;

  const { data: dbPocus, isLoading } = useQuery({
    queryKey: ['pocus-detail', id],
    queryFn: async () => {
      const cacheKey = `pocus_${id}`;
      if (!navigator.onLine) {
        const cached = readCachedContent<any>(cacheKey);
        if (cached) return cached;
      }
      const { data, error } = await supabase
        .from('pocus')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      if (data) cacheContent(cacheKey, data);
      return data;
    },
    enabled: !!id
  });

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center text-blue-600">
      <Loader2 className="animate-spin" />
    </div>
  );

  if (!dbPocus) return <div className="p-20 text-center font-black uppercase tracking-widest text-slate-400">Scan niet gevonden</div>;

  return (
    <div className="min-h-screen bg-white pb-20 px-4">
      <div className="flex items-center justify-between py-4 sticky top-0 bg-white/80 backdrop-blur-md z-10 max-w-3xl mx-auto w-full">
        <Link href="/pocus">
          <div className="flex items-center text-blue-600 font-black uppercase text-[10px] tracking-widest cursor-pointer group">
            <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Overzicht
          </div>
        </Link>
        <div className="flex gap-2 items-center">
          <BookmarkButton itemType="pocus" itemId={dbPocus.id} />
          <CmsEditLink
            href={`/admin?type=pocus&id=${dbPocus.id}`}
            label="Bewerken"
            className="hover:text-blue-600 transition-colors"
          />
        </div>
      </div>

      <div className="p-6 max-w-3xl mx-auto w-full">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-8 italic text-slate-900 leading-[0.85]">
          {dbPocus.title}
        </h1>

        <Tabs defaultValue="indicaties" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100 rounded-2xl p-1 mb-8">
            <TabsTrigger value="indicaties" className="rounded-xl font-black text-[10px] uppercase">Indicaties</TabsTrigger>
            <TabsTrigger value="techniek" className="rounded-xl font-black text-[10px] uppercase">Techniek</TabsTrigger>
            <TabsTrigger value="interpretatie" className="rounded-xl font-black text-[10px] uppercase">Interpretatie</TabsTrigger>
          </TabsList>
          
          <TabsContent value="indicaties" className="outline-none">
            <MarkdownRenderer content={dbPocus.content_indicaties || ""} />
          </TabsContent>
          
          <TabsContent value="techniek" className="outline-none">
            <MarkdownRenderer content={dbPocus.content_techniek || ""} />
          </TabsContent>
          
          <TabsContent value="interpretatie" className="outline-none">
            <MarkdownRenderer content={dbPocus.content_interpretatie || ""} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
