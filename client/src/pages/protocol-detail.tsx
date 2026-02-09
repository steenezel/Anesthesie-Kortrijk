import { useRoute, Link } from "wouter";
import { ChevronLeft, FileWarning, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

// We scannen alle markdown bestanden
const allProtocols = import.meta.glob('../content/protocols/**/*.md', { query: 'raw', eager: true });

export default function ProtocolDetail() {
  const [, params] = useRoute("/protocols/:id");
  const id = params?.id?.toLowerCase();

  // Zoek het bestand dat eindigt op /id.md
  const fileKey = Object.keys(allProtocols).find(key => 
    key.toLowerCase().endsWith(`/${id}.md`)
  );

  const fileData = fileKey ? (allProtocols[fileKey] as any) : null;
  const rawContent = fileData?.default || fileData;

  if (!rawContent) {
    return (
      <div className="p-10 text-center">
        <FileWarning className="h-10 w-10 mx-auto text-slate-300 mb-4" />
        <p className="text-slate-500 font-black uppercase tracking-tighter">Protocol niet gevonden</p>
        <Link href="/protocols" className="text-teal-600 text-xs font-black uppercase underline">Terug naar lijst</Link>
      </div>
    );
  }

  // Parsing van de markdown body en titel
  const parts = rawContent.split('---').filter(Boolean);
  const markdownBody = rawContent.startsWith('---') ? parts[1] : rawContent;
  const title = rawContent.match(/title: "(.*)"/)?.[1] || id?.replace(/-/g, ' ');

  return (
    <div className="space-y-6 pb-20 px-4 animate-in fade-in duration-500">
      {/* NAVIGATIE */}
      <Link href="/protocols">
        <div className="flex items-center text-teal-600 font-black uppercase text-[10px] tracking-widest cursor-pointer py-2 group">
          <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 
          Terug naar overzicht
        </div>
      </Link>

      {/* TITEL SECTIE */}
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900 leading-tight">
          {title}
        </h1>
        <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
          <Clock className="h-3 w-3 mr-1" /> Laatste update: {new Date().toLocaleDateString('nl-BE')}
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* MARKDOWN CONTENT MET UPGRADED LAYOUT */}
        <div className="prose prose-slate prose-base max-w-none 
        /* Zorg dat lijsten altijd bolletjes tonen en een kleur hebben */
        prose-ul:list-disc prose-li:marker:text-teal-600
        /* Je bestaande styling voor koppen en vetgedrukte tekst */
        prose-strong:text-teal-700 prose-strong:font-black
        prose-h3:uppercase prose-h3:tracking-tighter prose-h3:text-slate-800 prose-h3:font-bold prose-h3:mt-8 prose-h3:mb-4">

        <ReactMarkdown
          components={{
            // Deze functie vervangt elke ![](url) in je markdown
            // We vertellen TypeScript dat 'src' en 'alt' van het type 'any' of specifiek 'string' zijn
          img: ({ src, alt }: { src?: string; alt?: string }) => (
        <div className="my-8">
          <Zoom>
            <img 
             src={src} 
             alt={alt} 
             className="w-full h-auto rounded-2xl shadow-lg border border-slate-100 transition-all hover:shadow-xl" 
            />
         </Zoom>
        {alt && (
          <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-4 px-4 leading-relaxed">
        {alt}
        </p>
        )}
        </div>
)
          }}
        >
          {markdownBody}
        </ReactMarkdown>
      </div>
    </div>
  );
}