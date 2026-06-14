import { Link } from "wouter";
import { ChevronRight, Crosshair } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { BodyRegion } from "@/data/body-map-regions";

interface RegionBlocksDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  region: BodyRegion | null;
}

export function RegionBlocksDrawer({ open, onOpenChange, region }: RegionBlocksDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="rounded-t-[28px] border-slate-100 pb-8">
        <DrawerHeader className="border-b border-slate-100 px-6 pb-4 text-left">
          <DrawerTitle className="text-xl font-black uppercase tracking-tight text-slate-900">
            {region?.label ?? "Select a region"}
          </DrawerTitle>
          <DrawerDescription className="text-[10px] font-black uppercase tracking-[0.25em] text-teal-600">
            Beschikbare LRA technieken
          </DrawerDescription>
        </DrawerHeader>

        {region && (
          <ul className="max-h-[50vh] overflow-y-auto px-4 pt-2">
            {region.blocks.map((block) => (
              <li key={block.id}>
                <Link
                  href={`/blocks/${block.id}?from=/blocks`}
                  onClick={() => onOpenChange(false)}
                >
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-4 text-left transition-colors active:bg-teal-50 hover:bg-slate-50"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                      <Crosshair size={18} />
                    </span>
                    <span className="flex-1 font-black uppercase tracking-tight text-slate-800 text-sm">
                      {block.label}
                    </span>
                    <ChevronRight className="shrink-0 text-slate-300" size={20} />
                  </button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </DrawerContent>
    </Drawer>
  );
}
