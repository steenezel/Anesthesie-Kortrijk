import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

interface ReferenceZoomImageProps {
  src: string;
  alt: string;
  attribution?: string;
}

export function ReferenceZoomImage({ src, alt, attribution }: ReferenceZoomImageProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
      <Zoom>
        <img src={src} alt={alt} className="w-full rounded-xl" />
      </Zoom>
      <p className="mt-3 px-1 text-[10px] leading-relaxed text-slate-400">
        Tik op de afbeelding om te vergroten.
      </p>
      {attribution && (
        <p className="mt-2 px-1 text-[9px] leading-relaxed text-slate-400 italic">{attribution}</p>
      )}
    </div>
  );
}
