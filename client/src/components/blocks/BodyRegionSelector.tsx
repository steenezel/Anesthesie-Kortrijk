import {
  BODY_REGION_OPTIONS,
  type BodyRegionId,
} from "@/data/body-map-regions";
import { cn } from "@/lib/utils";

interface BodyRegionSelectorProps {
  value: BodyRegionId[];
  onChange: (regions: BodyRegionId[]) => void;
}

export function BodyRegionSelector({ value, onChange }: BodyRegionSelectorProps) {
  const toggle = (regionId: BodyRegionId) => {
    onChange(
      value.includes(regionId)
        ? value.filter((id) => id !== regionId)
        : [...value, regionId]
    );
  };

  return (
    <div className="space-y-2">
      <label className="ml-1 text-[10px] font-black uppercase text-slate-400">
        Lichaamsdelen (atlas)
      </label>
      <p className="ml-1 text-[11px] text-slate-500">
        Kies waar deze techniek op de anatomie-atlas verschijnt. Meerdere keuzes mogelijk.
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {BODY_REGION_OPTIONS.map((region) => {
          const isSelected = value.includes(region.id);
          return (
            <button
              key={region.id}
              type="button"
              onClick={() => toggle(region.id)}
              className={cn(
                "rounded-2xl border-2 px-3 py-3 text-left transition-all active:scale-[0.98]",
                isSelected
                  ? "border-teal-600 bg-teal-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <span
                className="mb-2 inline-block h-3 w-3 rounded-full border"
                style={{
                  backgroundColor: region.color,
                  borderColor: region.borderColor,
                }}
              />
              <span
                className={cn(
                  "block text-[10px] font-black uppercase leading-tight tracking-tight",
                  isSelected ? "text-teal-800" : "text-slate-700"
                )}
              >
                {region.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
