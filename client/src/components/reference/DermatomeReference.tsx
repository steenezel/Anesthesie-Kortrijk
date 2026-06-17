import {
  DERMATOME_DETAIL_IMAGES,
  DERMATOME_LANDMARKS,
  DERMATOME_MAP_IMAGE,
  DERMATOME_OVERLAP_NOTE,
} from "@/data/reference/dermatomes";
import { ReferenceZoomImage } from "@/components/reference/ReferenceZoomImage";

export function DermatomeReference() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
          Overzicht lichaam
        </h3>
        <ReferenceZoomImage
          src={DERMATOME_MAP_IMAGE}
          alt="Dermatoomkaart — voor- en achteraanzicht met niveaus C2 tot S5"
        />
      </section>

      <section className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
          Detail — extremiteiten
        </h3>
        {DERMATOME_DETAIL_IMAGES.map((image) => (
          <div key={image.id} className="space-y-2">
            <div>
              <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">
                {image.title}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">{image.subtitle}</p>
            </div>
            <ReferenceZoomImage
              src={image.src}
              alt={image.alt}
              attribution={image.attribution}
            />
          </div>
        ))}
      </section>

      <p className="rounded-2xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-xs leading-relaxed text-indigo-950">
        {DERMATOME_OVERLAP_NOTE}
      </p>

      <section>
        <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
          Belangrijkste dermatomen — klinische landmarks
        </h3>
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Niveau
                </th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Landmark
                </th>
              </tr>
            </thead>
            <tbody>
              {DERMATOME_LANDMARKS.map((row) => (
                <tr
                  key={`${row.levels}-${row.landmark}`}
                  className="border-b border-slate-50 last:border-0"
                >
                  <td className="px-4 py-3 font-mono text-xs font-bold text-teal-700 whitespace-nowrap align-top">
                    {row.levels}
                  </td>
                  <td className="px-4 py-3 text-slate-700 leading-snug">{row.landmark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
