import { OSTEOTOME_IMAGES, OSTEOTOME_INTRO } from "@/data/reference/osteotomes";
import { ReferenceZoomImage } from "@/components/reference/ReferenceZoomImage";

export function OsteotomeReference() {
  return (
    <div className="space-y-8">
      <p className="rounded-2xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-xs leading-relaxed text-indigo-950">
        {OSTEOTOME_INTRO}
      </p>

      {OSTEOTOME_IMAGES.map((image) => (
        <section key={image.id} className="space-y-3">
          <div>
            <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">
              {image.title}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">{image.subtitle}</p>
          </div>
          <ReferenceZoomImage src={image.src} alt={image.alt} />
        </section>
      ))}
    </div>
  );
}
