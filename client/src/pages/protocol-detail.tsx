import { useRoute, Link } from "wouter";
import { ChevronLeft, Clock, AlertCircle, FileWarning, MessageSquare, Share2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent } from "@/components/ui/card";

// We scannen alle markdown bestanden
const allProtocols = import.meta.glob('../src/content/protocols/**/*.md', { query: 'raw', eager: true });

export default function ProtocolDetail() {
  const [, params] = useRoute("/protocols/:path*");
  const fullPath = params?.path || "";
  
  // 1. Haal de pure bestandsnaam uit de URL (het laatste deel na de slash)
  // Voorbeeld: van "orthopedie/nieuwe-heup" maken we "nieuwe-heup"
  const targetFile = fullPath.split('/').pop()?.toLowerCase();

  // 2. Zoek in alle beschikbare bestanden naar een match met die bestandsnaam
  const fileKey = Object.keys(allProtocols).find(key => {
    const fileNameInKey = key.split('/').pop()?.replace('.md', '').toLowerCase();
    return fileNameInKey === targetFile;
  });

  const fileData = fileKey ? (allProtocols[fileKey] as any) : null;
  const rawContent = fileData?.default || fileData;
  
  // 3. FOUTAFHANDELING + DEBUG HULP
  if (!rawContent) {
    return (
      <div className="p-10 text-center space-y-4">
        <FileWarning className="h-12 w-12 mx-auto text-slate-300" />
        <p className="text-slate-500 font-black uppercase tracking-tighter">Protocol niet gevonden</p>
        <div className="text-[9px] text-slate-400 font-mono bg-slate-50 p-3 rounded-xl border text-left overflow-auto max-h-40">
          <p className="text-teal-600 mb-1 font-bold">// Debug Info:</p>
          <p>Gezocht naar: {targetFile}.md</p>
          <p className="mt-2 border-t pt-2 italic">Beschikbare bestanden:</p>
          {Object.keys(allProtocols).map(k => <p key={k}>• {k.split('/').pop()}</p>)}
        </div>
        <Link href="/protocols">
          <a className="inline-block mt-4 text-teal-600 text-xs font-black uppercase underline">Terug naar de lijst</a>
        </Link>
      </div>
    );
  }

  // Content parsing
  const parts = rawContent.split('---').filter(Boolean);
  const hasFrontmatter = rawContent.startsWith('---');
  const metadataRaw = hasFrontmatter ? parts[0] : "";
  const markdownBody = hasFrontmatter ? (parts.length > 2 ? parts.slice(1).join('---') : parts[1]) : rawContent;

  const title = metadataRaw.match(/title: "(.*)"/)?.[1] || targetFile?.replace(/-/g, ' ');
  const lastUpdated = metadataRaw.match(/lastUpdated: "(.*)"/)?.[1] || "Recent";

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <Link href="/protocols">
        <a className="flex items-center text-teal-600 font-black uppercase text-[10px] tracking-widest hover:opacity-70">
          <ChevronLeft className="h-4 w-4 mr-1" /> Terug naar overzicht
        </a>
      </Link>

      <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900 leading-[0.9]">
        {title}
      </h1>
      
      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider pb-4">
        <Clock className="h-3 w-3" /> Laatste revisie: {lastUpdated}
      </div>

      <div className="prose prose-slate prose-sm max-w-none 
        prose-headings:uppercase prose-headings:tracking-tighter prose-headings:font-black
        prose-headings:text-slate-900 prose-headings:mb-2 prose-headings:mt-8
        prose-strong:text-teal-600 prose-li:marker:text-teal-500">
        <ReactMarkdown>{markdownBody}</ReactMarkdown>
      </div>

      <Card className="bg-amber-50 border-amber-200 border-2 mt-12 rounded-2xl shadow-none">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-[11px] text-amber-900 leading-tight font-medium italic">
            Dit protocol dient als ondersteuning in AZ Groeninge Kortrijk. De klinische blik van de anesthesist is altijd leidend.
          </p>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-2 gap-3 mt-10">
        <a href={`https://api.whatsapp.com/send?text=Protocol: ${window.location.href}`} className="flex flex-col items-center p-4 bg-green-50 rounded-2xl border border-green-100">
          <Share2 className="h-5 w-5 text-green-600 mb-1" />
          <span className="text-[8px] font-black uppercase tracking-widest text-green-700">Deel</span>
        </a>
        <a href={`mailto:pieterjan.steelant@azgroeninge.be?subject=Feedback: ${title}`} className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <MessageSquare className="h-5 w-5 text-teal-600 mb-1" />
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-700">Feedback</span>
        </a>
      </div>
    </div>
  );
}