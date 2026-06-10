import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";
import ChassePatate from "@/components/ChassePatate";

export default function ChassePatatePage() {
  return (
    <div className="min-h-screen pb-12" style={{ backgroundColor: "#F5E6C4" }}>
      <div className="p-4 flex items-center">
        <Link href="/">
          <a
            className="flex items-center font-black uppercase text-[10px] tracking-widest"
            style={{ color: "#2A7B8E" }}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Terug
          </a>
        </Link>
      </div>

      <div className="px-4">
        <ChassePatate />
      </div>

      <p
        className="text-center text-[9px] font-bold uppercase tracking-[0.3em] mt-8 px-8"
        style={{ color: "#D4840A" }}
      >
        Rad het wielerwoord — of de fiets rijdt weg
      </p>
    </div>
  );
}
