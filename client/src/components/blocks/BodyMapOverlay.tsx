import { motion } from "framer-motion";
import {
  BODY_MAP_IMAGE,
  type BodyRegionConfig,
  type BodyRegionId,
} from "@/data/body-map-regions";

interface BodyMapOverlayProps {
  regions: BodyRegionConfig[];
  selectedRegion: BodyRegionId | null;
  blockCounts: Partial<Record<BodyRegionId, number>>;
  onRegionClick: (regionId: BodyRegionId) => void;
}

const MARKER_SIZE = 44;

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
  return (
    <button
      type="button"
      className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 touch-manipulation flex-col items-center gap-1"
      style={{ left: `${region.x}%`, top: `${region.y}%` }}
      onClick={() => onRegionClick(region.id)}
      aria-label={`${region.label}, ${blockCount} technieken`}
    >
      <motion.span
        className="relative flex items-center justify-center rounded-full border-2 shadow-sm"
        style={{
          width: MARKER_SIZE,
          height: MARKER_SIZE,
          backgroundColor: region.color,
          borderColor: region.borderColor,
        }}
        initial={false}
        animate={{
          scale: isSelected ? 1.15 : 1,
          boxShadow: isSelected
            ? `0 0 0 4px ${region.color}`
            : "0 1px 3px rgba(0,0,0,0.12)",
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {blockCount > 0 && (
          <span className="text-[11px] font-black text-white drop-shadow-sm">{blockCount}</span>
        )}
      </motion.span>
      <span
        className="max-w-[72px] rounded-md bg-white/90 px-1.5 py-0.5 text-center text-[7px] font-black uppercase leading-tight tracking-wide text-slate-700 shadow-sm"
      >
        {region.label}
      </span>
    </button>
  );
}

export function BodyMapOverlay({
  regions,
  selectedRegion,
  blockCounts,
  onRegionClick,
}: BodyMapOverlayProps) {
  return (
    <div className="relative mx-auto w-full max-w-lg">
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
  );
}
