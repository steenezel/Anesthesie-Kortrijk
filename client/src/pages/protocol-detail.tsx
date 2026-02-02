import { useRoute, Link } from "wouter";
import { ChevronLeft, Clock, AlertCircle, FileWarning } from "lucide-react";
import ReactMarkdown from "react-markdown";

const allProtocols = import.meta.glob('../content/protocols/**/*.md', { query: 'raw', eager: true });

export default function ProtocolDetail() {
  const [, params] = useRoute("/protocols/:id");
  const id = params?.id?.toLowerCase();

  // We zoeken het bestand dat eindigt op /id.md
  const fileKey = Object.keys(allProtocols).find(key => 
    key.toLowerCase().endsWith(`/${id}.md`)
  );

  const fileData = fileKey ? (allProtocols[fileKey] as any) : null;
  const rawContent = fileData?.default || fileData;

  if (!rawContent) {
    return (
      <div className="p-10 text-center">
        <FileWarning className="h-10 w-10 mx-auto text-slate-300 mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-tighter">Protocol niet gevonden</p>
        <Link href="/protocols" className="text-teal-600 text-xs font-black uppercase underline">Terug naar lijst</Link>
      </div>
    );
  }

  const parts = rawContent.split('---').filter(Boolean);
  const markdownBody = rawContent.startsWith('---') ? parts[1] : rawContent;
  const title = rawContent.match(/title: "(.*)"/)?.[1] || id?.replace(/-/g, ' ');

  return (
    <div className="space-y-6 pb-20">
      <Link href="/protocols">
        <div className="flex items-center text-teal-600 font-black uppercase text-[10px] tracking-widest cursor-pointer">
          <ChevronLeft className="h-4 w-4 mr-1" /> Terug naar overzicht
        </div>
      </Link>
      <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900 leading-tight">{title}</h1>
      <div className="prose prose-slate prose-sm max-w-none prose-strong:text-teal-700">
        <ReactMarkdown>{markdownBody}</ReactMarkdown>
      </div>
    </div>
  );
}