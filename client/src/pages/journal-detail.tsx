import React from "react";
import { useRoute, Link } from "wouter";
import { ChevronLeft, FileWarning, ExternalLink, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';

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
        <Link href="/journalclub" className="text-teal-600 text-xs font-black uppercase underline">Terug naar lijst</Link>
      </div>
    );
  }

  // Extractie van Metadata uit Frontmatter
  const markdownBody = rawContent.replace(/^---[\s\S]*?---/, '').trim();
  const title = rawContent.match(/title: "(.*)"/)?.[1] || id?.replace(/-/g, ' ');
  const pubmedId = rawContent.match(/pubmed_id: "(.*)"/)?.[1];

  return (
    <div className="space-y-6 pb-20 px-4 animate-in fade-in duration-700">
      <Link href="/journalclub">
        <div className="flex items-center text-slate-500 font-black uppercase text-[10px] tracking-widest cursor-pointer py-2 group">
          <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 
          Terug naar Journal Club
        </div>
      </Link>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="bg-teal-100 text-teal-700 text-[9px] font-black px-2 py-1 rounded w-fit uppercase tracking-widest">
            Scientific Review
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900 leading-[1.1]">
            {title}
          </h1>
        </div>

        {/* PubMed Knop: Enkel zichtbaar als pubmed_id bestaat */}
        {pubmedId && (
          <a 
            href={`https://pubmed.ncbi.nlm.nih.gov/${pubmedId}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
          >
            <ExternalLink className="h-3 w-3" />
            Bekijk op PubMed
          </a>
        )}
      </div>

      <hr className="border-slate-100" />

      <div className="prose prose-slate prose-sm max-w-none 
        prose-h3:uppercase prose-h3:tracking-tighter prose-h3:text-teal-700 prose-h3:font-bold prose-h3:mt-8 prose-h3:mb-4
        prose-strong:text-teal-900 prose-blockquote:border-teal-500 prose-blockquote:bg-teal-50/50 prose-blockquote:rounded-r-2xl">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeRaw]}
        >
          {markdownBody}
        </ReactMarkdown>
      </div>
    </div>
  );
}