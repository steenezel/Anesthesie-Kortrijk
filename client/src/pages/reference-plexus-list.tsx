import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";
import { KaraShell } from "@/components/kara/KaraShell";
import { PlexusList } from "@/components/reference/PlexusList";

export default function ReferencePlexusListPage() {
  return (
    <KaraShell activeTab="referentie" showAdminButton={false}>
      <div className="px-6 py-4 max-w-2xl mx-auto">
        <Link href="/blocks/referentie">
          <button
            type="button"
            className="flex items-center text-indigo-600 font-black uppercase text-[10px] tracking-widest mb-6 group"
          >
            <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Referentie
          </button>
        </Link>

        <div className="mb-6">
          <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">
            Plexus-anatomie
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Overzicht van de vier hoofdplexussen en hun zenuwtakken.
          </p>
        </div>

        <PlexusList />
      </div>
    </KaraShell>
  );
}
