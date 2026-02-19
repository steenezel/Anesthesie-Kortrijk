// client/src/pages/dantroleen.tsx
import { Link } from "wouter";
import { ChevronLeft, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DantroleenCalc from "../components/calculators/DantroleenCalc.js";

export default function DantroleenPage() {
  return (
    <div className="space-y-6 pb-20">
      <Link href="/calculator">
        <a className="flex items-center text-blue-600 font-bold uppercase text-xs tracking-widest">
          <ChevronLeft className="h-4 w-4" /> Terug naar overzicht
        </a>
      </Link>

      <Card className="border-slate-200 shadow-xl">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-xl font-black uppercase tracking-tighter">
            Dantroleen (MH)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          
          {/* Hier wordt de gedeelde calculator opgeroepen */}
          <DantroleenCalc />

          <div className="flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs">
            <Info className="h-5 w-5 shrink-0 text-blue-600" />
            <div className="space-y-2">
              <p><strong>Stock AZ Groeninge:</strong> 20 flacons in de antidota-koffer (PAZA). Reserve in de Vanas-kast (V9).</p>
              <p><strong>Bereiding:</strong> Los elke flacon van 20mg op in 60ml Aqua ad injectabilia. Krachtig schudden is noodzakelijk.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}