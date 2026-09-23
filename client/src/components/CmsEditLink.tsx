import { Link } from "wouter";
import { Pencil } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { canEditCms } from "@shared/permissions";
import { cn } from "@/lib/utils";

export function CmsEditLink({
  href,
  label = "Edit",
  className,
}: {
  href: string;
  label?: string;
  className?: string;
}) {
  const { user, offlineSession } = useAuth();
  if (offlineSession || !canEditCms(user?.role)) return null;

  return (
    <Link href={href}>
      <div
        className={cn(
          "p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-teal-600 cursor-pointer flex items-center gap-2 font-black text-[9px] uppercase tracking-widest",
          className,
        )}
      >
        <Pencil size={14} /> {label}
      </div>
    </Link>
  );
}
