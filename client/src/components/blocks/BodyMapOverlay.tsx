import { motion } from "framer-motion";
import {
  BODY_MAP_IMAGE,
  type BodyRegionConfig,
  type BodyRegionId,
} from "@/data/body-map-regions";
import { cn } from "@/lib/utils";

interface BodyMapOverlayProps {
  regions: BodyRegionConfig[];
  selectedRegion: BodyRegionId | null;
  blockCounts: Partial<Record<BodyRegionId, number>>;
  onRegionClick: (regionId: BodyRegionId) => void;
}

function RegionMarker({
  region,
  isSelected,
  blockCount,
  onRegionClick,
}: {
  region: BodyRegionConfig;
  isSelected: boolean;
  blockCount: number;
  onRegionClick: (regionId: BodyRegionId) => void;
}) {
  const markerContent = blockCount > 0 ? String(blockCount) : region.shortLabel;

  return (
    <button
      type="button"
      className="absolute z-10 -translate-x-1/2 -translate-y-1/2 touch-manipulation p-1"
      style={{ left: `${region.x}%`, top: `${region.y}%` }}
      onClick={() => onRegionClick(region.id)}
      aria-label={`${region.label}, ${blockCount} technieken`}
    >
      <motion.span
        className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 text-[10px] font-black text-white shadow-sm sm:h-10 sm:w-10 sm:text-[11px]"
        style={{
          backgroundColor: region.color,
          borderColor: region.borderColor,
        }}
        initial={false}
        animate={{
          scale: isSelected ? 1.2 : 1,
          boxShadow: isSelected
            ? `0 0 0 3px white, 0 0 0 5px ${region.borderColor}`
            : "0 1px 3px rgba(0,0,0,0.15)",
        }}
        whileTap={{ scale: 0.92 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <span className="drop-shadow-sm">{markerContent}</span>
      </motion.span>
    </button>
  );
}

function RegionLegend({
  regions,
  selectedRegion,
  blockCounts,
  onRegionClick,
}: {
  regions: BodyRegionConfig[];
  selectedRegion: BodyRegionId | null;
  blockCounts: Partial<Record<BodyRegionId, number>>;
  onRegionClick: (regionId: BodyRegionId) => void;
}) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
      {regions.map((region) => {
        const isSelected = selectedRegion === region.id;
        const blockCount = blockCounts[region.id] ?? 0;

        return (
          <button
            key={region.id}
            type="button"
            onClick={() => onRegionClick(region.id)}
            className={cn(
              "flex min-h-[52px] items-center gap-2.5 rounded-2xl border-2 px-3 py-2.5 text-left transition-all active:scale-[0.98]",
              isSelected
                ? "border-teal-600 bg-teal-50 shadow-sm"
                : "border-slate-100 bg-slate-50 hover:border-slate-200"
            )}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-[9px] font-black text-white"
              style={{
                backgroundColor: region.color,
                borderColor: region.borderColor,
              }}
            >
              {region.shortLabel}
            </span>
            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  "block text-[9px] font-black uppercase leading-tight tracking-tight",
                  isSelected ? "text-teal-900" : "text-slate-800"
                )}
              >
                {region.label}
              </span>
              <span className="text-[8px] font-bold text-slate-400">
                {blockCount > 0 ? `${blockCount} techniek${blockCount === 1 ? "" : "en"}` : "Geen technieken"}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function BodyMapOverlay({
  regions,
  selectedRegion,
  blockCounts,
  onRegionClick,
}: BodyMapOverlayProps) {
  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="relative">
        <img
          src={BODY_MAP_IMAGE}
          alt="Human body front and back anatomical outline"
          className="w-full rounded-2xl"
          draggable={false}
        />
        {regions.map((region) => (
          <RegionMarker
            key={region.id}
            region={region}
            isSelected={selectedRegion === region.id}
            blockCount={blockCounts[region.id] ?? 0}
            onRegionClick={onRegionClick}
          />
        ))}
      </div>

      <RegionLegend
        regions={regions}
        selectedRegion={selectedRegion}
        blockCounts={blockCounts}
        onRegionClick={onRegionClick}
      />
    </div>
  );
}
