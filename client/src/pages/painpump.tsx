import React from "react";
import { Link } from "wouter";
import { ChevronLeft, Info } from "lucide-react";
import PainPumpCalculator from "@/components/calculators/PainPumpCalculator";

export default function PainPumpPage() {
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
        <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900 leading-none">Painpump</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Intrathecale pompcalculatie</p>
      </div>

      <div className="px-4">
        <PainPumpCalculator />
        
        <div className="mt-6 p-4 bg-slate-100 border border-slate-200 rounded-2xl flex gap-3">
          <Info className="h-5 w-5 text-slate-500 shrink-0" />
          <p className="text-[10px] font-bold uppercase text-slate-600 leading-tight">
            Deze berekening is gebaseerd op de referentiestof (meestal morfine). 
            De einddatum wordt berekend op basis van vandaag.
          </p>
        </div>
      </div>
    </div>
  );
}