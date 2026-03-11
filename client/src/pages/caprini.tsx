import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, AlertTriangle, ShieldCheck, Activity } from "lucide-react";
import { Link } from "wouter";

// Definitie van de risicofactoren
const RISK_FACTORS = [
  { id: "age41", label: "Leeftijd 41-60 jaar", points: 1, cat: "Patiënt" },
  { id: "minorSurg", label: "Kleine ingreep (<45 min)", points: 1, cat: "Chirurgie" },
  { id: "bmi25", label: "BMI > 25 kg/m²", points: 1, cat: "Patiënt" },
  { id: "swollen", label: "Gezwollen benen (actueel)", points: 1, cat: "Patiënt" },
  { id: "varicose", label: "Varicosis", points: 1, cat: "Patiënt" },
  { id: "preg", label: "Zwanger of postpartum (<1 mnd)", points: 1, cat: "Patiënt" },
  { id: "abort", label: "Recurrente spontane abortus", points: 1, cat: "Voorgeschiedenis" },
  { id: "ocp", label: "Orale anticonceptie / HRT", points: 1, cat: "Medicatie" },
  { id: "sepsis", label: "Sepsis (<1 mnd)", points: 1, cat: "Status" },
  { id: "lung", label: "Ernstige longziekte / Pneumonie (<1 mnd)", points: 1, cat: "Status" },
  { id: "copd", label: "Abnormale longfunctie (COPD)", points: 1, cat: "Voorgeschiedenis" },
  { id: "ami", label: "Acuut MI (<1 mnd)", points: 1, cat: "Status" },
  { id: "chf", label: "Hartfalen (<1 mnd)", points: 1, cat: "Status" },
  { id: "ibd", label: "Inflammatory Bowel Disease", points: 1, cat: "Voorgeschiedenis" },
  { id: "bedrest", label: "Bedrust (medische patiënt)", points: 1, cat: "Status" },
  
  { id: "age61", label: "Leeftijd 61-74 jaar", points: 2, cat: "Patiënt" },
  { id: "majorSurg", label: "Grote open chirurgie (>45 min)", points: 2, cat: "Chirurgie" },
  { id: "lapSurg", label: "Laparoscopie (>45 min)", points: 2, cat: "Chirurgie" },
  { id: "arthroSurg", label: "Arthroscopie", points: 2, cat: "Chirurgie" },
  { id: "malignancy", label: "Maligniteit (actueel of verleden)", points: 2, cat: "Voorgeschiedenis" },
  { id: "immobile", label: "Bedrust (>72 uur)", points: 2, cat: "Status" },
  { id: "cast", label: "Gips / Immobilisatie (<1 mnd)", points: 2, cat: "Status" },
  { id: "cvc", label: "Centraal veneuze toegang", points: 2, cat: "Status" },

  { id: "age75", label: "Leeftijd ≥ 75 jaar", points: 3, cat: "Patiënt" },
  { id: "historyVte", label: "Voorgeschiedenis DVT/PE", points: 3, cat: "Voorgeschiedenis" },
  { id: "familyVte", label: "Familiale anamnese VTE", points: 3, cat: "Voorgeschiedenis" },
  { id: "leiden", label: "Factor V Leiden / Prothrombine mutatie", points: 3, cat: "Labo" },
  { id: "lupus", label: "Lupus anticoagulans / Anticardiolipine", points: 3, cat: "Labo" },
  { id: "hit", label: "HIT (Heparine Geïnduceerde Thrombocytopenie)", points: 3, cat: "Voorgeschiedenis" },

  { id: "stroke", label: "CVA (<1 mnd)", points: 5, cat: "Status" },
  { id: "arthroplasty", label: "Electieve totale heup/knie arthroplastie", points: 5, cat: "Chirurgie" },
  { id: "fracture", label: "Heup-, bekken- of beenfractuur (<1 mnd)", points: 5, cat: "Status" },
  { id: "trauma", label: "Multitrauma (<1 mnd)", points: 5, cat: "Status" },
  { id: "spinal", label: "Acute dwarslaesie (<1 mnd)", points: 5, cat: "Status" },
];

export default function CapriniCalculator() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const totalScore = useMemo(() => {
    return RISK_FACTORS
      .filter(f => selectedIds.includes(f.id))
      .reduce((sum, f) => sum + f.points, 0);
  }, [selectedIds]);

  const riskLevel = useMemo(() => {
    if (totalScore <= 1) return { label: "Zeer laag", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", advice: "Vroege mobilisatie" };
    if (totalScore === 2) return { label: "Laag", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", advice: "Mechanische profylaxe (IPC/kousen)" };
    if (totalScore <= 4) return { label: "Matig", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", advice: "LMWH of mechanische profylaxe" };
    return { label: "Hoog", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", advice: "LMWH + Mechanische profylaxe" };
  }, [totalScore]);

  const toggleFactor = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const categories = Array.from(new Set(RISK_FACTORS.map(f => f.cat)));

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="p-4 flex items-center bg-white border-b">
        <Link href="/calculator">
          <a className="flex items-center text-slate-500 font-black uppercase text-[10px] tracking-widest">
            <ChevronLeft className="h-4 w-4 mr-1" /> Terug
          </a>
        </Link>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tighter uppercase text-slate-900">Caprini Score</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">VTE Risico Assessment</p>
        </div>

        {/* Score Display Area */}
        <Card className={`sticky top-4 z-10 border-2 shadow-lg transition-all ${riskLevel.bg} ${riskLevel.border}`}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-slate-500 opacity-70">Totaal Score</span>
              <span className={`text-4xl font-black ${riskLevel.color}`}>{totalScore}</span>
            </div>
            <div className="text-right">
              <span className={`text-xs font-black uppercase px-2 py-1 rounded-full ${riskLevel.bg} ${riskLevel.color} border border-current mb-1 inline-block`}>
                {riskLevel.label} Risico
              </span>
              <p className="text-[10px] font-bold text-slate-600 uppercase leading-tight max-w-[150px]">
                {riskLevel.advice}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Factors List */}
        <div className="space-y-6">
          {categories.map(cat => (
            <div key={cat} className="space-y-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{cat}</h3>
              <div className="grid gap-2">
                {RISK_FACTORS.filter(f => f.cat === cat).map(factor => (
                  <div 
                    key={factor.id}
                    onClick={() => toggleFactor(factor.id)}
                    className={`flex items-center space-x-3 p-3 rounded-xl border-2 transition-all cursor-pointer bg-white
                      ${selectedIds.includes(factor.id) ? 'border-teal-500 bg-teal-50/30' : 'border-slate-100'}`}
                  >
                    <Checkbox checked={selectedIds.includes(factor.id)} onCheckedChange={() => {}} />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-800 leading-tight">{factor.label}</p>
                    </div>
                    <span className="text-[10px] font-black text-slate-400">+{factor.points}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 mt-6">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <p className="text-[10px] text-amber-800 font-medium leading-relaxed italic">
            Deze score is een hulpmiddel. Klinisch oordeel en lokale protocollen omtrent bloedingsrisico primeren steeds.
          </p>
        </div>
      </div>
    </div>
  );
}