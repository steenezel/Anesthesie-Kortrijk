import React from "react";
import { useRoute, Link } from "wouter";
import { ChevronLeft, FileWarning, ExternalLink, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from 'rehype-raw';
import Zoom from 'react-medium-image-zoom';
import remarkBreaks from 'remark-breaks';
import 'react-medium-image-zoom/dist/styles.css';

const allJournals = import.meta.glob('../content/journal-club/*.md', { query: 'raw', eager: true });

export default function JournalDetail() {
  const [, params] = useRoute("/journalclub/:id");
  const id = params?.id?.toLowerCase();

  const fileKey = Object.keys(allJournals).find(key => 
    key.toLowerCase().endsWith(`/${id}.md`)
  );

  const fileData = fileKey ? (allJournals[fileKey] as any) : null;
  const rawContent = String(fileData?.default || fileData || "").trim();
  
  if (!rawContent) {
    return (
      <div className="p-10 text-center">
        <FileWarning className="h-10 w-10 mx-auto text-slate-300 mb-4" />
        <p className="text-slate-500 font-black uppercase tracking-tighter">Artikel niet gevonden</p>
        <Link href="/journalclub" className="text-teal-600 text-xs font-bold uppercase mt-4 inline-block">
          Terug naar overzicht
        </Link>
      </div>
    );
  }

  // --- STRENGE FRONTMATTER PARSING ---
  // We isoleren eerst de frontmatter (alles tussen de eerste twee ---)
  const frontmatterMatch = rawContent.match(/^---([\s\S]*?)---/);
  const frontmatter = frontmatterMatch ? frontmatterMatch[1] : "";

  // Titel
  const titleMatch = frontmatter.match(/title:\s*"(.*)"/);
  const title = titleMatch ? titleMatch[1] : "Geen titel";

  // PubMed ID
  const pubmedIdMatch = frontmatter.match(/pubmed_id:\s*"(.*)"/);
  const pubmedId = pubmedIdMatch ? pubmedIdMatch[1].trim() : null;

  // DISCIPLINES (Nu met check op "Intensieve" ipv "ICU" in je MD bestanden)
  const disciplinesMatch = frontmatter.match(/disciplines:\s*\[(.*?)\]/);
  const disciplines: string[] = disciplinesMatch 
    ? disciplinesMatch[1]
        .split(',')
        .map(d => d.replace(/["']/g, '').trim())
        .filter(Boolean)
    : [];

  const dateMatch = frontmatter.match(/date:\s*"(.*)"/);
  const dateStr = dateMatch ? dateMatch[1] : null;

  // De eigenlijke tekst (alles na de frontmatter)
  const markdownBody = rawContent.replace(/^---[\s\S]*?---/, "").trim();

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* HEADER NAV */}
      <div className="p-4 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-slate-50">
        <Link href="/journalclub">
          <a className="flex items-center text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-teal-600 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" /> Journal Club
          </a>
        </Link>
      </div>

      <div className="px-6 pt-8 pb-4">
        {/* TAGS */}
        <div className="flex flex-wrap gap-2 mb-4">
          {disciplines.map((tag) => (
            <span 
              key={tag} 
              className="px-2.5 py-1 bg-teal-50 text-teal-700 text-[10px] font-black uppercase rounded-lg border border-teal-100 tracking-wider shadow-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* TITEL & INFO */}
        <div className="space-y-4 mb-8">
          <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900 leading-[0.95]">
            {title}
          </h1>
          <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Clock className="h-3 w-3 mr-1" /> 
            {dateStr ? `Editie: ${dateStr}` : `Gepubliceerd: ${new Date().toLocaleDateString('nl-BE')}`}
          </div>
        </div>

        {pubmedId && (
          <a 
            href={`https://pubmed.ncbi.nlm.nih.gov/${pubmedId}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-600 transition-all active:scale-95 shadow-lg shadow-slate-200 mb-8"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Bekijk op PubMed
          </a>
        )}

        <hr className="border-slate-100 mb-8" />

        {/* MARKDOWN CONTENT MET JOUW SPECIFIEKE STYLING */}
        <article className="prose prose-slate prose-sm max-w-none 
          prose-headings:uppercase prose-headings:tracking-tighter prose-headings:font-black
          prose-h3:text-teal-600 prose-h3:mt-8 prose-h3:mb-4
          prose-p:text-slate-600 prose-p:leading-relaxed
          prose-strong:text-slate-900 prose-strong:font-bold
          prose-ul:list-disc prose-li:marker:text-teal-600
          
          /* Clinical Pearl Styling (Blockquotes) */
          prose-blockquote:border-l-teal-500 
          prose-blockquote:bg-teal-50/50 
          prose-blockquote:py-1 
          prose-blockquote:px-4
          prose-blockquote:rounded-r-xl
          prose-blockquote:not-italic
          prose-blockquote:text-teal-900
          ">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm, remarkBreaks]} 
            rehypePlugins={[rehypeRaw]}
            components={{
              img: ({ node, ...props }: any) => (
                <div className="my-8">
                  <Zoom>
                    <img {...props} className="rounded-3xl shadow-xl border border-slate-100 w-full h-auto" alt={props.alt || "Afbeelding"} />
                  </Zoom>
                  {props.alt && (
                    <p className="text-center text-[10px] font-bold uppercase text-slate-400 mt-3 tracking-widest">
                      {props.alt}
                    </p>
                  )}
                </div>
              ),
              // Verwijder de standaard quotes van blockquotes
              blockquote: ({ children }: { children?: React.ReactNode }) => (
                <blockquote className="before:content-none after:content-none font-medium italic">
                  {children}
                </blockquote>
              )
            }}
          >
            {markdownBody}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
}