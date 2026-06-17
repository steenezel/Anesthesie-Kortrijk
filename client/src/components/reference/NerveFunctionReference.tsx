import { NERVE_TEST_IMAGES, NERVE_TEST_INTRO } from "@/data/reference/nerve-tests";
import { ReferenceZoomImage } from "@/components/reference/ReferenceZoomImage";

export function NerveFunctionReference() {
  return (
    <div className="space-y-8">
      <p className="rounded-2xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-xs leading-relaxed text-indigo-950">
        {NERVE_TEST_INTRO}
      </p>

      {NERVE_TEST_IMAGES.map((image) => (
        <section key={image.id} className="space-y-3">
          <div>
            <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">
              {image.title}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">{image.subtitle}</p>
          </div>
          <ReferenceZoomImage
            src={image.src}
            alt={image.alt}
            attribution={image.attribution}
          />
        </section>
      ))}
    </div>
  );
}
