import { useRoute, Link } from "wouter";
import { ChevronLeft, Clock, AlertCircle, FileWarning, MessageSquare, Mail, Share2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent } from "@/components/ui/card";

const allProtocols = import.meta.glob('../content/protocols/**/*.md', { query: 'raw', eager: true });

export default function ProtocolDetail() {
  const [, params] = useRoute("/protocols/:discipline/:id*");
  const { discipline, id } = params || {};
  
  // We zoeken de sleutel in de lijst die (ongeacht hoofdletters) overeenkomt
  const fileKey = Object.keys(allProtocols).find(key => 
    key.toLowerCase().endsWith(`${discipline?.toLowerCase()}/${id?.toLowerCase()}.md`)
  );

  const fileData = fileKey ? (allProtocols[fileKey] as any) : null;
  const rawContent = fileData?.default || fileData;

  if (!rawContent) {
    return (
      <div className="p-10 text-center space-y-4">
        <FileWarning className="h-12 w-12 mx-auto text-slate-300" />
        <p className="text-slate-500 font-bold uppercase tracking-tighter">Content niet gevonden</p>
        <Link href="/protocols" className="text-blue-500 text-xs font-bold uppercase">Terug naar lijst</Link>
      </div>
    );
  }

  // Verbeterde Frontmatter parsing
  const parts = rawContent.split('---').filter(Boolean);
  const hasFrontmatter = rawContent.startsWith('---');
  
  const metadataRaw = hasFrontmatter ? parts[0] : "";
  const markdownBody = hasFrontmatter ? parts[1] : rawContent;

  const title = metadataRaw.match(/title: "(.*)"/)?.[1] || id?.replace(/-/g, ' ');
  const lastUpdated = metadataRaw.match(/lastUpdated: "(.*)"/)?.[1] || "Onbekend";

  return (
    <div className="space-y-6 pb-20">
      <Link href="/protocols">
        <div className="flex items-center text-slate-400 font-bold uppercase text-[10px] tracking-widest cursor-pointer hover:text-slate-600 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Terug naar overzicht
        </div>
      </Link>

      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900 leading-tight">
          {title}
        </h1>
        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <Clock className="h-3 w-3" /> Revisie: {lastUpdated}
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
      
      {/* Waarschuwing onderaan blijft belangrijk voor medische context */}
      <Card className="bg-amber-50 border-amber-200 border-2 mt-10">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
          <div className="text-[11px] text-amber-800 leading-tight">
            <strong>Klinische besluitvorming:</strong> Dit protocol dient als leidraad. Wijk af indien de patiëntstatus dit vereist.
          </div>
        </CardContent>
      </Card>
     {/* COMMUNICATIE SECTIE */}
<div className="mt-12 pt-8 border-t border-slate-100">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    
    {/* WHATSAPP DELEN */}
    <Card className="bg-green-50 border-green-100 shadow-none border">
      <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
        <div className="p-2 bg-white rounded-full shadow-sm">
          <Share2 className="h-5 w-5 text-green-600" />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-green-700">Deel protocol</p>
          <p className="text-[9px] text-green-600 italic leading-tight">Stuur direct naar een collega</p>
        </div>
        <a 
          href={`https://api.whatsapp.com/send?text=Collega, bekijk hier het anesthesie-protocol voor *${title}*: ${window.location.href}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2 bg-white rounded-lg border border-green-200 text-[10px] font-black uppercase tracking-widest text-green-700 hover:bg-green-100 transition-all flex items-center justify-center gap-2"
        >
          WhatsApp
        </a>
      </CardContent>
    </Card>

    {/* EMAIL FEEDBACK */}
    <Card className="bg-slate-50 border-slate-200 shadow-none border border-dashed">
      <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
        <div className="p-2 bg-white rounded-full shadow-sm">
          <MessageSquare className="h-5 w-5 text-blue-500" />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">Suggesties</p>
          <p className="text-[9px] text-slate-500 italic leading-tight">Help dit protocol te verbeteren</p>
        </div>
        <a 
          href={`mailto:pieterjan.steelant@azgroeninge.be?subject=Feedback Protocol: ${title}&body=Mijn suggestie voor ${title}:`}
          className="w-full py-2 bg-white rounded-lg border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
        >
          E-mail
        </a>
      </CardContent>
    </Card>

  </div>
</div>
    </div>
  );
}