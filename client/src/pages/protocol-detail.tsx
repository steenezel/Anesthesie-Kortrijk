import { useRoute, Link } from "wouter";
import { ChevronLeft, Clock, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent } from "@/components/ui/card";

// Haal alle markdown bestanden op uit alle submappen
const allProtocols = import.meta.glob('../content/protocols/**/*.md', { query: 'raw', eager: true });

export default function ProtocolDetail() {
  // We verwachten nu zowel de discipline als de id in de URL
  const [, params] = useRoute("/protocols/:discipline/:id");
  const { discipline, id } = params || {};
  
  // Zoek het bestand op basis van het geneste pad
  const path = `../content/protocols/${discipline}/${id}.md`;
  const rawContent = allProtocols[path] as string;

  if (!rawContent) {
    return (
      <div className="p-10 text-center text-slate-500 font-bold uppercase tracking-tighter">
        Protocol niet gevonden. Controleer het pad: {path}
      </div>
    );
  }

  // Eenvoudige extractie van Frontmatter en Body
  const parts = rawContent.split('---');
  const metadataRaw = parts[1];
  const markdownBody = parts[2];

  const title = metadataRaw.match(/title: "(.*)"/)?.[1];
  const disciplineName = metadataRaw.match(/discipline: "(.*)"/)?.[1];
  const lastUpdated = metadataRaw.match(/lastUpdated: "(.*)"/)?.[1];

  return (
    <div className="space-y-6 pb-20">
      <Link href="/protocols">
        <div className="flex items-center text-slate-400 font-bold uppercase text-[10px] tracking-widest cursor-pointer hover:text-slate-600 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Terug naar {disciplineName || "overzicht"}
        </div>
      </Link>

      <div className="space-y-1">
        <div className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full inline-block font-black uppercase tracking-tighter">
          {disciplineName}
        </div>
        <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900 leading-tight">
          {title}
        </h1>
        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <Clock className="h-3 w-3" /> Laatste revisie: {lastUpdated}
        </div>
      </div>

      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0 prose prose-slate prose-sm max-w-none 
          prose-headings:uppercase prose-headings:tracking-tighter prose-headings:font-black
          prose-headings:text-slate-900 prose-headings:mb-2 prose-headings:mt-6
          prose-strong:text-blue-600 prose-li:marker:text-blue-500">
          <ReactMarkdown>{markdownBody}</ReactMarkdown>
        </CardContent>
      </Card>

      <Card className="bg-amber-50 border-amber-200 border-2 mt-10">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
          <div className="text-[11px] text-amber-800 leading-tight">
            <strong>Klinische besluitvorming:</strong> Dit protocol dient als leidraad. Wijk af indien de patiëntstatus of chirurgische context dit vereist.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}