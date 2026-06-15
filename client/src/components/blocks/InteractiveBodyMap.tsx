import { useCallback, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { BodyMapOverlay } from "@/components/blocks/BodyMapOverlay";
import { RegionBlocksDrawer } from "@/components/blocks/RegionBlocksDrawer";
import {
  BODY_REGION_OPTIONS,
  buildRegionsWithBlocks,
  type AtlasBlock,
  type BodyRegionId,
} from "@/data/body-map-regions";
import { cn } from "@/lib/utils";

interface InteractiveBodyMapProps {
  blocks: AtlasBlock[];
  isLoading?: boolean;
  className?: string;
}

export function InteractiveBodyMap({ blocks, isLoading, className }: InteractiveBodyMapProps) {
  const [selectedRegion, setSelectedRegion] = useState<BodyRegionId | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const regionsWithBlocks = useMemo(() => buildRegionsWithBlocks(blocks), [blocks]);

  const blockCounts = useMemo(() => {
    const counts: Partial<Record<BodyRegionId, number>> = {};
    for (const region of regionsWithBlocks) {
      counts[region.config.id] = region.blocks.length;
    }
    return counts;
  }, [regionsWithBlocks]);

  const handleRegionClick = useCallback((regionId: BodyRegionId) => {
    setSelectedRegion(regionId);
    setDrawerOpen(true);
  }, []);

  const activeRegion =
    regionsWithBlocks.find((region) => region.config.id === selectedRegion) ?? null;

  return (
    <section className={cn("space-y-4", className)}>
      <div className="rounded-[32px] border border-slate-100 bg-white px-3 py-5 shadow-sm sm:px-4">
        <p className="mb-4 text-center text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
          Tap op de kaart of kies een regio
        </p>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          </div>
        ) : (
          <BodyMapOverlay
            regions={BODY_REGION_OPTIONS}
            selectedRegion={selectedRegion}
            blockCounts={blockCounts}
            onRegionClick={handleRegionClick}
          />
        )}
      </div>

      <RegionBlocksDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        region={activeRegion}
      />
    </section>
  );
}
