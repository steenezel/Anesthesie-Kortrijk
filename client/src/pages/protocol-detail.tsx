import { useRoute, Link } from "wouter";
import { ChevronLeft, Clock, AlertCircle, FileWarning } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent } from "@/components/ui/card";

// Pad relatief t.o.v. client/src/pages/
const allProtocols = import.meta.glob('../content/protocols/**/*.md', { query: 'raw', eager: true });

export default function ProtocolDetail() {
  const [, params] = useRoute("/protocols/:path*");
  
  // 1. Haal de bestandsnaam uit de URL (bv. 'nieuwe-heup' uit 'orthopedie/nieuwe-heup')
  // We halen ook eventuele query-parameters (?from=...) weg.
  const fullPath = params?.path ? decodeURIComponent(params.path).split('?')[0] : "";
  const targetFileName = fullPath.split('/').pop()?.toLowerCase();

  // 2. Zoek in de geladen bestanden naar een match op bestandsnaam
  const fileKey = Object.keys(allProtocols).find(key => {
    const fileNameInKey = key.split('/').pop()?.replace('.md', '').toLowerCase();
    return fileNameInKey === targetFileName;
  });

  const fileData = fileKey ? (allProtocols[fileKey] as any) : null;
  // Vite raw import kan in .default zitten of direct de string zijn
  const rawContent = typeof fileData === 'string' ? fileData : fileData?.default;

  // 3. Foutmelding als we echt niets vinden
  if (!rawContent) {
    return (
      <div className="p-10 text-center space-y-4">
        <FileWarning className="h-12 w-12 mx-auto text-red-300" />
        <h2 className="text-xl font-black uppercase text-slate-900 tracking-tighter">Niet gevonden</h2>
        <p className="text-slate-500 text-xs">Gezocht naar: <strong>{targetFileName}.md</strong></p>
        <Link href="/protocols">
          <a className="inline-block mt-4 py-2 px-6 bg-teal-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
            Terug naar lijst
          </a>
        </Link>
      </div>
    );
  }

  // Content verwerken
  const parts = rawContent.split('---').filter(Boolean);
  const hasFrontmatter = rawContent.startsWith('---');
  const metadataRaw = hasFrontmatter ? parts[0] : "";
  const markdownBody = hasFrontmatter ? (parts.length > 2 ? parts.slice(1).join('---') : parts[1]) : rawContent;

  const title = metadataRaw.match(/title: "(.*)"/)?.[1] || targetFileName?.replace(/-/g, ' ');
  const lastUpdated = metadataRaw.match(/lastUpdated: "(.*)"/)?.[1] || "Recent";

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <Link href="/protocols">
        <a className="flex items-center text-teal-600 font-black uppercase text-[10px] tracking-widest">
          <ChevronLeft className="h-4 w-4 mr-1" /> Terug naar overzicht
        </a>
      </Link>

      <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900 leading-none mb-2">
        {title}
      </h1>
      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest border-b pb-4">
        Revisie: {lastUpdated}
      </div>

      <div className="prose prose-slate prose-sm max-w-none 
        prose-headings:uppercase prose-headings:font-black prose-headings:tracking-tighter
        prose-strong:text-teal-700 prose-li:marker:text-teal-500">
        <ReactMarkdown>{markdownBody}</ReactMarkdown>
      </div>

      <Card className="bg-amber-50 border-amber-200 border-2 mt-12 rounded-2xl shadow-none">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
          <p className="text-[11px] text-amber-900 leading-tight font-medium">
            <strong>Klinische herinnering:</strong> Dit protocol voor AZ Groeninge Kortrijk dient als leidraad. De klinische toestand van de patiënt primeert.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}