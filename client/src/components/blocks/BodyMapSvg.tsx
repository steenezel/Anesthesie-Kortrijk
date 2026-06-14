import { motion } from "framer-motion";
import type { BodyRegionId, BodyViewSide } from "@/data/body-map-regions";

interface BodyMapSvgProps {
  view: BodyViewSide;
  selectedRegion: BodyRegionId | null;
  onRegionClick: (regionId: BodyRegionId) => void;
}

/** Placeholder stylized silhouette — replace paths with final artwork later. */
const REGION_PATHS: Record<
  BodyViewSide,
  Partial<Record<BodyRegionId, { d: string; label: { x: number; y: number } }>>
> = {
  front: {
    neck: {
      d: "M 92 28 C 88 36, 88 44, 90 52 L 110 52 C 112 44, 112 36, 108 28 Z",
      label: { x: 100, y: 42 },
    },
    "upper-limb": {
      d: "M 52 54 L 38 54 C 28 58, 22 72, 20 96 L 18 128 C 18 136, 24 140, 30 138 L 36 132 C 40 118, 44 98, 48 82 L 52 72 Z M 148 54 L 162 54 C 172 58, 178 72, 180 96 L 182 128 C 182 136, 176 140, 170 138 L 164 132 C 160 118, 156 98, 152 82 L 148 72 Z",
      label: { x: 30, y: 100 },
    },
    "thorax-anterior": {
      d: "M 72 54 L 88 52 L 112 52 L 128 54 L 132 68 L 130 108 L 70 108 L 68 68 Z",
      label: { x: 100, y: 82 },
    },
    abdomen: {
      d: "M 70 108 L 130 108 L 128 148 L 124 168 L 76 168 L 72 148 Z",
      label: { x: 100, y: 138 },
    },
    "lower-limb": {
      d: "M 76 168 L 88 168 L 92 228 L 90 268 L 82 268 L 80 228 Z M 112 168 L 124 168 L 120 228 L 118 268 L 110 268 L 108 228 Z",
      label: { x: 100, y: 220 },
    },
  },
  back: {
    "upper-limb": {
      d: "M 50 56 L 36 58 C 26 64, 20 80, 18 104 L 16 132 C 16 140, 22 142, 28 140 L 34 128 C 38 110, 44 90, 48 74 Z M 150 56 L 164 58 C 174 64, 180 80, 182 104 L 184 132 C 184 140, 178 142, 172 140 L 166 128 C 162 110, 156 90, 152 74 Z",
      label: { x: 28, y: 102 },
    },
    "thorax-posterior": {
      d: "M 74 54 L 88 52 L 112 52 L 126 54 L 130 70 L 128 112 L 72 112 L 70 70 Z",
      label: { x: 100, y: 84 },
    },
    "lower-limb": {
      d: "M 78 168 L 90 168 L 94 230 L 92 268 L 84 268 L 82 230 Z M 110 168 L 122 168 L 118 230 L 116 268 L 108 268 L 106 230 Z",
      label: { x: 100, y: 222 },
    },
  },
};

function BodySilhouette({ view }: { view: BodyViewSide }) {
  const headY = view === "front" ? 18 : 20;

  return (
    <g className="pointer-events-none" aria-hidden="true">
      <ellipse cx="100" cy={headY} rx="16" ry="18" className="fill-slate-200 stroke-slate-300" strokeWidth="1.5" />
      <path
        d="M 84 36 C 78 52, 76 72, 76 168 C 76 200, 80 240, 82 268 L 118 268 C 120 240, 124 200, 124 168 C 124 72, 122 52, 116 36 Z"
        className="fill-slate-100 stroke-slate-300"
        strokeWidth="1.5"
      />
    </g>
  );
}

function RegionPath({
  regionId,
  d,
  label,
  isSelected,
  onRegionClick,
}: {
  regionId: BodyRegionId;
  d: string;
  label: { x: number; y: number };
  isSelected: boolean;
  onRegionClick: (regionId: BodyRegionId) => void;
}) {
  return (
    <g className="cursor-pointer touch-manipulation">
      <motion.path
        d={d}
        role="button"
        tabIndex={0}
        aria-label={regionId.replace(/-/g, " ")}
        initial={false}
        animate={{
          fill: isSelected ? "rgba(13, 148, 136, 0.55)" : "rgba(148, 163, 184, 0.25)",
          stroke: isSelected ? "rgb(13, 148, 136)" : "rgb(148, 163, 184)",
          strokeWidth: isSelected ? 2.5 : 1.5,
        }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onRegionClick(regionId)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onRegionClick(regionId);
          }
        }}
      />
      <text
        x={label.x}
        y={label.y}
        textAnchor="middle"
        className="pointer-events-none fill-slate-600 text-[6px] font-bold uppercase tracking-wide select-none"
      >
        {regionId.split("-")[0]}
      </text>
    </g>
  );
}

export function BodyMapSvg({ view, selectedRegion, onRegionClick }: BodyMapSvgProps) {
  const regions = REGION_PATHS[view];

  return (
    <svg
      viewBox="0 0 200 280"
      className="mx-auto h-auto w-full max-w-[280px] select-none"
      aria-label={`Anatomy map, ${view} view`}
    >
      <BodySilhouette view={view} />
      {Object.entries(regions).map(([id, config]) => {
        if (!config) return null;
        const regionId = id as BodyRegionId;
        return (
          <RegionPath
            key={regionId}
            regionId={regionId}
            d={config.d}
            label={config.label}
            isSelected={selectedRegion === regionId}
            onRegionClick={onRegionClick}
          />
        );
      })}
    </svg>
  );
}
