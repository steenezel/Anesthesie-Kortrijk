import React from "react";
import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";
import AnesthesiaWordle from "@/components/AnesthesiaWordle";

export default function WordlePage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Navigatie header */}
      <div className="p-4 flex items-center">
        <Link href="/">
          <a className="flex items-center text-teal-600 font-black uppercase text-[10px] tracking-widest">
            <ChevronLeft className="h-4 w-4 mr-1" /> Terug
          </a>
        </Link>
      </div>

      <div className="px-4">
        <AnesthesiaWordle />
      </div>
      
      <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-8 px-8">
        Elke dag een nieuw medisch vijfletterwoord
      </p>
    </div>
  );
}