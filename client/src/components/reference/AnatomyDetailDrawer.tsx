import ReactMarkdown from "react-markdown";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { ReferenceStructure } from "@/data/reference/types";
import { RelatedBlocksList } from "@/components/reference/RelatedBlocksList";

interface AnatomyDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  structure: ReferenceStructure | null;
}

function Section({ title, content }: { title: string; content?: string }) {
  if (!content) return null;

  return (
    <section className="space-y-2">
      <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-teal-600">{title}</h3>
      <div className="prose prose-sm prose-slate max-w-none text-slate-700">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </section>
  );
}

export function AnatomyDetailDrawer({ open, onOpenChange, structure }: AnatomyDetailDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="rounded-t-[28px] border-slate-100 pb-8 max-h-[88vh]">
        <DrawerHeader className="border-b border-slate-100 px-6 pb-4 text-left">
          <DrawerTitle className="text-2xl font-black uppercase tracking-tight text-slate-900">
            {structure?.labelFull ?? structure?.label ?? "—"}
          </DrawerTitle>
          <DrawerDescription className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
            {structure?.kind ?? "referentie"}
          </DrawerDescription>
        </DrawerHeader>

        {structure && (
          <div className="space-y-6 overflow-y-auto px-6 pt-4 max-h-[calc(88vh-8rem)]">
            <Section title="Herkomst" content={structure.origin} />
            <Section title="Verloop" content={structure.course} />
            <Section title="Sensorisch" content={structure.sensory} />
            <Section title="Motorisch" content={structure.motor} />
            <Section title="Klinisch beeld bij uitval" content={structure.clinicalDeficit} />
            <Section title="Opmerkingen" content={structure.notes} />

            <section className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-teal-600">
                Gekoppelde LRA-technieken
              </h3>
              <RelatedBlocksList blockIds={structure.blockIds} />
            </section>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
