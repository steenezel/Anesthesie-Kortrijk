import { useRoute, Link } from "wouter";
import { ChevronLeft, Clock, AlertCircle, FileWarning, MessageSquare, Share2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent } from "@/components/ui/card";

const allProtocols = import.meta.glob('../content/protocols/**/*.md', { query: 'raw', eager: true });

export default function ProtocolDetail() {
  const [, params] = useRoute("/protocols/:path*");
  const fullPath = params?.path ? decodeURIComponent(params.path) : "";
  
  // SLIMME ZOEKER: Zoekt het bestand op basis van het einde van het pad
  const fileKey = Object.keys(allProtocols).find(key => {
    const normalizedKey = key.toLowerCase();
    const searchString = `${fullPath.toLowerCase()}.md`;
    // We checken of het pad eindigt op 'discipline/bestand.md' OF gewoon 'bestand.md'
    return normalizedKey.endsWith(searchString) || normalizedKey.endsWith(`/${fullPath.toLowerCase()}.md`);
  });

  const fileData = fileKey ? (allProtocols[fileKey] as any) : null;
  const rawContent = fileData?.default || fileData;
  
  if (!rawContent) {
    return (
      <div className="p-10 text-center space-y-4">
        <FileWarning className="h-12 w-12 mx-auto text-slate-300" />
        <p className="text-slate-500 font-black uppercase tracking-tighter">Content niet gevonden</p>
        <div className="text-[10px] text-slate-400 font-mono bg-slate-50 p-2 rounded border break-all">
          Gezocht naar: {fullPath}.md
        </div>
        <Link href="/protocols" className="inline-block mt-4 text-teal-600 text-xs font-black uppercase underline">
          Terug naar de lijst
        </Link>
      </div>
    );
  }

  // Parsing logica
  const parts = rawContent.split('---').filter(Boolean);
  const hasFrontmatter = rawContent.startsWith('---');
  const metadataRaw = hasFrontmatter ? parts[0] : "";
  const markdownBody = hasFrontmatter ? (parts.length > 2 ? parts.slice(1).join('---') : parts[1]) : rawContent;

  const title = metadataRaw.match(/title: "(.*)"/)?.[1] || fullPath.split('/').pop()?.replace(/-/g, ' ');
  const lastUpdated = metadataRaw.match(/lastUpdated: "(.*)"/)?.[1] || "Recent";

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <Link href="/protocols">
        <div className="flex items-center text-teal-600 font-black uppercase text-[10px] tracking-widest cursor-pointer hover:opacity-70 transition-opacity">
          <ChevronLeft className="h-4 w-4 mr-1" /> Terug naar overzicht
        </div>
      </Link>

      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900 leading-[0.9] mb-2">
          {title}
        </h1>
        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <Clock className="h-3 w-3" /> Laatste revisie: {lastUpdated}
        </div>
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
          <p className="text-[11px] text-amber-900 leading-tight font-medium">
            <strong>Klinische herinnering:</strong> Dit protocol is een ondersteuning. De klinische blik van de anesthesist in Kortrijk primeert.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}