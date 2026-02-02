import { useRoute, Link } from "wouter";
import { ChevronLeft, Clock, AlertCircle, FileWarning, MessageSquare, Share2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent } from "@/components/ui/card";

// We scannen alle markdown bestanden
// Let op: pad is relatief t.o.v. client/src/pages/
const allProtocols = import.meta.glob('../content/protocols/**/*.md', { 
  query: 'raw', 
  eager: true 
});

export default function ProtocolDetail() {
  const [, params] = useRoute("/protocols/:path*");
  const fullPath = params?.path || "";
  
  // 1. Haal de pure bestandsnaam uit de URL
  const targetFile = fullPath.split('/').pop()?.toLowerCase();

  // 2. Zoek in de beschikbare bestanden
  const fileKey = Object.keys(allProtocols).find(key => {
    const fileNameInKey = key.split('/').pop()?.replace('.md', '').toLowerCase();
    return fileNameInKey === targetFile;
  });

  const fileData = fileKey ? (allProtocols[fileKey] as any) : null;
  // In Vite met query: 'raw' zit de tekst vaak direct in de waarde of in .default
  const rawContent = typeof fileData === 'string' ? fileData : fileData?.default;
  
  // 3. DIAGNOSTISCH VENSTER (Verschijnt alleen bij fout)
  if (!rawContent) {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
          <FileWarning className="h-12 w-12 mx-auto text-red-400 mb-4" />
          <h2 className="text-red-900 font-black uppercase tracking-tighter text-xl">Protocol niet gevonden</h2>
          <p className="text-red-700 text-sm mt-2">De app kon <strong>{targetFile}.md</strong> niet vinden.</p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 overflow-hidden">
          <h3 className="text-teal-400 font-mono text-xs uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">
            Systeem Diagnose
          </h3>
          <div className="space-y-4 font-mono text-[10px]">
            <div>
              <p className="text-slate-500 uppercase">Gevraagd pad:</p>
              <p className="text-white">protocols/{fullPath}</p>
            </div>
            <div>
              <p className="text-slate-500 uppercase italic">Gevonden bestanden in geheugen ({Object.keys(allProtocols).length}):</p>
              <div className="text-teal-500 mt-2 max-h-40 overflow-y-auto">
                {Object.keys(allProtocols).length > 0 ? (
                  Object.keys(allProtocols).map(key => (
                    <p key={key}>• {key}</p>
                  ))
                ) : (
                  <p className="text-red-500 font-bold underline">FOUT: De lijst met protocollen is volledig LEEG!</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <Link href="/protocols">
          <a className="block w-full py-4 text-center bg-slate-100 text-slate-600 rounded-xl font-black uppercase tracking-widest text-[10px]">
            Terug naar lijst
          </a>
        </Link>
      </div>
    );
  }

  // Content parsing (Frontmatter)
  const parts = rawContent.split('---').filter(Boolean);
  const hasFrontmatter = rawContent.startsWith('---');
  const metadataRaw = hasFrontmatter ? parts[0] : "";
  const markdownBody = hasFrontmatter ? (parts.length > 2 ? parts.slice(1).join('---') : parts[1]) : rawContent;

  const title = metadataRaw.match(/title: "(.*)"/)?.[1] || targetFile?.replace(/-/g, ' ');
  const lastUpdated = metadataRaw.match(/lastUpdated: "(.*)"/)?.[1] || "Recent";

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <Link href="/protocols">
        <a className="flex items-center text-teal-600 font-black uppercase text-[10px] tracking-widest hover:opacity-70 transition-opacity">
          <ChevronLeft className="h-4 w-4 mr-1" /> Terug naar overzicht
        </a>
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
            <strong>Klinische herinnering:</strong> Dit protocol is een ondersteuning voor AZ Groeninge Kortrijk. De klinische status van de patiënt primeert.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}