import { Link, useRoute } from "wouter";
import { ChevronLeft } from "lucide-react";
import { KaraShell } from "@/components/kara/KaraShell";
import { ReferenceZoomImage } from "@/components/reference/ReferenceZoomImage";
import { getPlexusById } from "@/data/reference/plexus";
import NotFound from "@/pages/not-found";

export default function ReferencePlexusDetailPage() {
  const [, params] = useRoute("/blocks/referentie/plexus/:id");
  const plexus = getPlexusById(params?.id ?? "");

  if (!plexus) {
    return <NotFound />;
  }

  const hasMainImage = !!plexus.imageSrc;
  const hasExtraImages = (plexus.extraImages?.length ?? 0) > 0;

  return (
    <KaraShell activeTab="referentie" showAdminButton={false}>
      <div className="px-6 py-4 max-w-2xl mx-auto">
        <Link href="/blocks/referentie/plexus">
          <button
            type="button"
            className="flex items-center text-indigo-600 font-black uppercase text-[10px] tracking-widest mb-6 group"
          >
            <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Plexus-anatomie
          </button>
        </Link>

        <div className="mb-6">
          <p className="text-[10px] font-bold font-mono text-teal-600 mb-1">{plexus.levels}</p>
          <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">
            {plexus.title}
          </h2>
          {plexus.description && (
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">{plexus.description}</p>
          )}
        </div>

        <div className="space-y-8">
          {hasMainImage ? (
            <ReferenceZoomImage
              src={plexus.imageSrc!}
              alt={`${plexus.title} — anatomisch schema`}
              attribution={plexus.attribution}
            />
          ) : (
            !hasExtraImages && (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-16 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">
                  Afbeelding volgt
                </p>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                  Het schema voor de {plexus.title.toLowerCase()} wordt nog aangeleverd door de
                  dienst.
                </p>
              </div>
            )
          )}

          {plexus.extraImages?.map((image) => (
            <section key={image.src}>
              <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                {image.title}
              </h3>
              <ReferenceZoomImage
                src={image.src}
                alt={image.title}
                attribution={image.attribution}
              />
            </section>
          ))}
        </div>
      </div>
    </KaraShell>
  );
}
