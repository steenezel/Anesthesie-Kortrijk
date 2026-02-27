import React from "react";
import { Link } from "wouter";
import { ChevronLeft, Info } from "lucide-react";
import SedationPedsCalculator from "@/components/calculators/SedationPedsCalculator";

export default function SedationCalculatorPage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="p-4">
        <Link href="/calculator">
          <a className="flex items-center text-teal-600 font-black uppercase text-[10px] tracking-widest">
            <ChevronLeft className="h-4 w-4 mr-1" /> Calculators
          </a>
        </Link>
      </div>

      <div className="px-4 space-y-2 mb-6">
        <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900">Peds Sedatie MRI</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Dexdor & Atropine Dosering</p>
      </div>

      <div className="px-4">
        <SedationPedsCalculator />
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
          <Info className="h-5 w-5 text-blue-500 shrink-0" />
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-blue-800">Protocol Details</p>
            <ul className="text-[11px] text-blue-700 font-medium list-disc ml-4">
              <li>Prep: 200µg Dexdor in 20ml (10µg/ml)</li>
              <li>Atropine: 1ml in 10ml (20µg/ml)</li>
              <li>Inductie: Dexdor 2µg/kg trage IV bolus</li>
              <li>Maint: 0.5µg/kg elke 20 min</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}