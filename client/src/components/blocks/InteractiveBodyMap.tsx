import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { BodyMapSvg } from "@/components/blocks/BodyMapSvg";
import { RegionBlocksDrawer } from "@/components/blocks/RegionBlocksDrawer";
import {
  BODY_REGIONS,
  type BodyRegionId,
  type BodyViewSide,
} from "@/data/body-map-regions";
import { cn } from "@/lib/utils";

interface InteractiveBodyMapProps {
  className?: string;
}

function ViewToggle({
  view,
  onViewChange,
}: {
  view: BodyViewSide;
  onViewChange: (view: BodyViewSide) => void;
}) {
  return (
    <div
      className="relative flex rounded-2xl bg-slate-100 p-1"
      role="tablist"
      aria-label="Body view"
    >
      {(["front", "back"] as const).map((side) => {
        const isActive = view === side;
        return (
          <button
            key={side}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onViewChange(side)}
            className={cn(
              "relative z-10 flex-1 rounded-xl py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
              isActive ? "text-teal-700" : "text-slate-400"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="body-map-view-pill"
                className="absolute inset-0 rounded-xl bg-white shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative">{side === "front" ? "Front" : "Back"}</span>
          </button>
        );
      })}
    </div>
  );
}

export function InteractiveBodyMap({ className }: InteractiveBodyMapProps) {
  const [view, setView] = useState<BodyViewSide>("front");
  const [selectedRegion, setSelectedRegion] = useState<BodyRegionId | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleRegionClick = useCallback((regionId: BodyRegionId) => {
    setSelectedRegion(regionId);
    setDrawerOpen(true);
  }, []);

  const handleViewChange = useCallback((nextView: BodyViewSide) => {
    setView(nextView);
    setSelectedRegion(null);
    setDrawerOpen(false);
  }, []);

  const activeRegion = selectedRegion ? BODY_REGIONS[selectedRegion] : null;

  return (
    <section className={cn("space-y-4", className)}>
      <ViewToggle view={view} onViewChange={handleViewChange} />

      <div className="rounded-[32px] border border-slate-100 bg-white px-4 py-6 shadow-sm">
        <p className="mb-4 text-center text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
          Tap a region
        </p>
        <BodyMapSvg
          view={view}
          selectedRegion={selectedRegion}
          onRegionClick={handleRegionClick}
        />
      </div>

      <RegionBlocksDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        region={activeRegion}
      />
    </section>
  );
}
