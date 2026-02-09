import React from "react";
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
    // 1. Behoud je bestaande afbeelding-logica (onveranderd)
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
    ),

    // 2. NIEUW: De slimme Warning, Info en Tip boxes
    blockquote: ({ children }: { children: any }) => {
      // We zetten de inhoud om naar tekst om te zoeken naar de [!TAGS]
      const childrenArray = React.Children.toArray(children);
      const content = childrenArray.map((child: any) => 
        child.props?.children ? String(child.props.children) : ""
      ).join("");

      const isWarning = content.includes("[!WARNING]");
      const isInfo = content.includes("[!INFO]");
      const isTip = content.includes("[!TIP]");

      // Standaardstijl voor de kaders
      let boxStyles = "my-6 border-l-8 p-6 rounded-r-2xl shadow-sm ";
      let title = "";
      let titleColor = "";

      if (isWarning) {
        boxStyles += "border-red-500 bg-red-50";
        title = "⚠️ WAARSCHUWING";
        titleColor = "text-red-600";
      } else if (isInfo) {
        boxStyles += "border-blue-500 bg-blue-50";
        title = "ℹ️ INFORMATIE";
        titleColor = "text-blue-600";
      } else if (isTip) {
        boxStyles += "border-emerald-500 bg-emerald-50";
        title = "💡 TIP";
        titleColor = "text-emerald-600";
      } else {
        // Geen tag gevonden? Dan tonen we een gewoon standaard citaat
        return <blockquote className="border-l-4 border-slate-200 pl-4 italic my-4 text-slate-600">{children}</blockquote>;
      }

      return (
        <div className={boxStyles}>
          <div className={`font-black text-[10px] mb-2 tracking-[0.2em] ${titleColor}`}>
            {title}
          </div>
          <div className="text-slate-900 leading-relaxed m-0 prose-p:my-0 font-medium">
            {/* We tonen de tekst, maar filteren de [!TAG] eruit voor het oog */}
            {React.Children.map(children, (child: any) => {
              if (child.props && typeof child.props.children === 'string') {
                const newText = child.props.children.replace(/\[!WARNING\]|\[!INFO\]|\[!TIP\]/g, "");
                return React.cloneElement(child, {}, newText);
              }
              return child;
            })}
          </div>
        </div>
      );
    }
  }}
>
  {markdownBody}
</ReactMarkdown>
      </div>
    </div>
  );
}