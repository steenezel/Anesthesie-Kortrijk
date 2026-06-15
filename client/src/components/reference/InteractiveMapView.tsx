import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { CircleHotspotGeometry, MapViewConfig } from "@/data/reference/types";
import { cn } from "@/lib/utils";

export interface MapHotspotItem {
  id: string;
  label: string;
  geometry: CircleHotspotGeometry;
  color?: string;
}

interface InteractiveMapViewProps {
  mapView: MapViewConfig;
  hotspots: MapHotspotItem[];
  selectedId: string | null;
  onHotspotClick: (id: string) => void;
  className?: string;
}

export function InteractiveMapView({
  mapView,
  hotspots,
  selectedId,
  onHotspotClick,
  className,
}: InteractiveMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const handleZoom = useCallback((delta: number) => {
    setScale((prev) => Math.min(2.5, Math.max(1, prev + delta)));
  }, []);

  return (
    <div className={cn("space-y-3", className)}>
      {mapView.imagePending && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          <p className="font-black uppercase tracking-widest text-[10px] mb-1">Kaart in voorbereiding</p>
          <p className="leading-relaxed">
            De definitieve dermatoomafbeelding wordt aangeleverd door de dienst. Markers en
            teksten zijn al interactief — posities worden gekalibreerd zodra de kaart klaar is.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          {mapView.label}
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => handleZoom(-0.25)}
            disabled={scale <= 1}
            className="h-8 w-8 rounded-lg bg-slate-100 text-sm font-bold text-slate-600 disabled:opacity-40"
            aria-label="Uitzoomen"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => setScale(1)}
            className="h-8 px-2 rounded-lg bg-slate-100 text-[10px] font-black text-slate-500"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => handleZoom(0.25)}
            disabled={scale >= 2.5}
            className="h-8 w-8 rounded-lg bg-slate-100 text-sm font-bold text-slate-600 disabled:opacity-40"
            aria-label="Inzoomen"
          >
            +
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm"
      >
        <div
          className="relative origin-top transition-transform duration-200"
          style={{ transform: `scale(${scale})` }}
        >
          <img
            src={mapView.imageSrc}
            alt={mapView.label}
            className="w-full select-none"
            draggable={false}
          />
          {hotspots.map((hotspot) => {
            const isSelected = selectedId === hotspot.id;
            const { x, y, r } = hotspot.geometry;
            const diameter = r * 2;

            return (
              <button
                key={hotspot.id}
                type="button"
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2 touch-manipulation"
                style={{ left: `${x}%`, top: `${y}%` }}
                onClick={() => onHotspotClick(hotspot.id)}
                aria-label={`${hotspot.label}${isSelected ? ", geselecteerd" : ""}`}
                aria-pressed={isSelected}
              >
                <motion.span
                  className={cn(
                    "flex items-center justify-center rounded-full border-2 font-black text-white shadow-sm",
                    isSelected ? "bg-teal-600 border-teal-800" : "bg-teal-500/90 border-teal-700"
                  )}
                  style={{
                    width: `${Math.max(diameter, 7)}%`,
                    height: `${Math.max(diameter, 7)}%`,
                    minWidth: "2rem",
                    minHeight: "2rem",
                    fontSize: "0.55rem",
                  }}
                  initial={false}
                  animate={{ scale: isSelected ? 1.15 : 1 }}
                  whileTap={{ scale: 0.92 }}
                >
                  {hotspot.label}
                </motion.span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
