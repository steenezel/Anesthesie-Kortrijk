import { Link } from "wouter";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type AdminAddColor = "teal" | "blue";

interface AdminAddButtonProps {
  href: string;
  label: string;
  mode: "header" | "fab";
  color?: AdminAddColor;
}

const colorStyles: Record<AdminAddColor, { header: string; fab: string }> = {
  teal: {
    header: "bg-teal-600 hover:bg-teal-700 active:bg-teal-800",
    fab: "bg-teal-600",
  },
  blue: {
    header: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800",
    fab: "bg-blue-600",
  },
};

export function AdminAddButton({ href, label, mode, color = "teal" }: AdminAddButtonProps) {
  const styles = colorStyles[color];

  if (mode === "header") {
    return (
      <Link href={href}>
        <button
          type="button"
          className={cn(
            "hidden lg:inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-[11px] font-black uppercase tracking-wide text-white shadow-md transition-all hover:shadow-lg active:scale-[0.98]",
            styles.header
          )}
        >
          <Plus size={18} strokeWidth={2.5} />
          {label}
        </button>
      </Link>
    );
  }

  return (
    <Link href={href}>
      <button
        type="button"
        className={cn(
          "lg:hidden fixed bottom-24 right-6 z-50 flex items-center justify-center rounded-full p-4 text-white shadow-2xl transition-all hover:scale-110 active:scale-95",
          styles.fab
        )}
        aria-label={label}
      >
        <Plus size={28} />
      </button>
    </Link>
  );
}
