import { useState } from "react";
import { ChevronDown, StickyNote } from "lucide-react";
import { useUserNotes } from "@/hooks/use-user-notes";
import type { NoteTargetType } from "@/lib/user-content";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function UserNotesPanel({
  targetType,
  targetId,
}: {
  targetType: NoteTargetType;
  targetId: string;
}) {
  const [open, setOpen] = useState(false);
  const { content, setContent, saveNow, saveState, isLoading } = useUserNotes(
    targetType,
    targetId,
  );

  if (!targetId && targetType !== "general") return null;

  const statusLabel =
    saveState === "saving"
      ? "Opslaan…"
      : saveState === "saved"
        ? "Opgeslagen"
        : saveState === "offline"
          ? "Offline bewaard"
          : "";

  return (
    <div className="mt-10 max-w-3xl mx-auto border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/80">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left"
      >
        <StickyNote className="h-4 w-4 text-teal-600 shrink-0" />
        <span className="flex-1 text-[11px] font-black uppercase tracking-widest text-slate-700">
          Mijn Notities
        </span>
        {statusLabel && (
          <span className="text-[10px] font-bold uppercase tracking-wide text-teal-600">
            {statusLabel}
          </span>
        )}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-100 bg-white">
          <p className="pt-3 text-[10px] text-slate-400 font-medium">
            Alleen zichtbaar voor jou — bv. chirurgenvoorkeuren of tips.
          </p>
          <Textarea
            value={content}
            disabled={isLoading}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Typ hier je persoonlijke notities…"
            className="min-h-[120px] rounded-xl border-slate-200 text-sm"
          />
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-xl text-[10px] font-black uppercase tracking-widest"
              onClick={() => saveNow()}
            >
              Opslaan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
