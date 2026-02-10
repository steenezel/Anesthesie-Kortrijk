import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Baby, Activity, Syringe, Wind, Ruler, AlertCircle, ShieldAlert } from "lucide-react";

export default function PedsCalculator() {
  const [ageValue, setAgeValue] = useState<number>(2);
  const [ageUnit, setAgeUnit] = useState<"weeks" | "months" | "years">("years");
  const [manualWeight, setManualWeight] = useState<number | null>(null);
  const [manualHeight, setManualHeight] = useState<number | null>(null);

  const decimalYear = useMemo(() => {
    if (ageUnit === "weeks") return ageValue / 52.14;
    if (ageUnit === "months") return ageValue / 12;
    return ageValue;
  }, [ageValue, ageUnit]);
  // Schatting lengte: 75cm bij 1j, daarna +6cm per jaar (gemiddelde groeicurve)
const estimatedHeight = useMemo(() => {
  if (decimalYear < 1) return 50 + (decimalYear * 25); // Van 50cm naar 75cm in 1 jaar
  return (decimalYear * 6) + 70; // Versimpelde veilige curve
}, [decimalYear]);

// Gebruik het ingevulde getal, of anders de schatting
const currentHeight = manualHeight !== null ? manualHeight : estimatedHeight;

  const isWeightRequired = decimalYear < 1 && manualWeight === null;
  const estimatedWeight = useMemo(() => {
  if (decimalYear < 1) return 0;
  const rawWeight = (decimalYear + 5) * 2;
  // Rond af naar de dichtstbijzijnde 0.5
  return Math.round(rawWeight * 2) / 2;
}, [decimalYear]);
  const weight = manualWeight !== null ? manualWeight : estimatedWeight;

  const airway = useMemo(() => {
    if (isWeightRequired || weight <= 0) return null;
    
    // 1. Eck Formule (Afgerond op 0.5)
    const eckRaw = 2.44 + (decimalYear * 0.1) + (currentHeight * 0.02) + (weight * 0.016);
    const eckRounded = Math.round(eckRaw * 2) / 2;
    const eck = Math.min(7.0, eckRounded);

    // 2. Cole Formule (Uncuffed & Cuffed)
    const coleUncuffedRaw= (decimalYear / 4) + 4;
    const coleCuffedRaw = (decimalYear / 4) + 3;
    const coleUncuffedRoundedRaw = Math.round(coleUncuffedRaw * 2) / 2;
    const coleCuffedRoundedRaw = Math.round(coleCuffedRaw * 2) / 2;
    const coleCuffed = Math.min(7.0, coleCuffedRoundedRaw);
    const coleUncuffed = Math.min(7.0, coleUncuffedRoundedRaw);

    // 3. Diepte Formule: (age / 2) + 12
    const depth = Math.min(21.0, (decimalYear / 2) + 12);

    let lma = "1";
    if (weight >= 5) lma = "1.5";
    if (weight >= 10) lma = "2";
    if (weight >= 20) lma = "2.5";
    if (weight >= 30) lma = "3";
    if (weight >= 50) lma = "4";

    return {
      eck: eck.toFixed(1),
      coleUncuffed: coleUncuffed.toFixed(1),
      coleCuffed: coleCuffed.toFixed(1),
      lma,
      depth: depth.toFixed(1)
    };
  }, [decimalYear, weight, currentHeight, isWeightRequired]);

  const drugs = useMemo(() => {
    if (isWeightRequired || weight <= 0) return null;
    return {
      sufentanil: { mcg: (weight * 0.15).toFixed(2), ml: (weight * 0.15 / 5).toFixed(2) },
      alfentanil: { mcg: (weight * 15).toFixed(0), ml: (weight * 15 / 500).toFixed(2) },
      propofol: { mg: (weight * 3).toFixed(0), ml: (weight * 3 / 10).toFixed(1) },
      rocuronium: { mg: (weight * 0.9).toFixed(1), ml: (weight * 0.9 / 10).toFixed(2) },
      adrenaline: { mcg: (weight * 10).toFixed(0), ml: (weight * 10 / 100).toFixed(1) },
      // Cefazoline: 30mg/kg met een maximum van 2000mg (2g)
      cefazoline: { mg: Math.min(2000, Math.round(weight * 30)).toFixed(0) },
       // Amoxiclav: 30mg/kg met een maximum van 1000mg (1g)
      amoxiclav: { mg: Math.min(1000, Math.round(weight * 30)).toFixed(0) }
    };
  }, [weight, isWeightRequired]);

  return (
    <div className="space-y-6 pb-20 pt-[env(safe-area-inset-top)] px-4">
      {/* INPUT SECTIE */}
      <Card className={`border-2 transition-colors ${isWeightRequired ? 'border-amber-400 bg-amber-50/20' : 'border-teal-100 shadow-sm'}`}>
        <CardHeader className="p-4 border-b flex flex-row items-center gap-2">
          <Baby className={`h-5 w-5 ${isWeightRequired ? 'text-amber-500' : 'text-teal-600'}`} />
          <CardTitle className="text-sm font-black uppercase tracking-tighter text-slate-700">Patiënt Gegevens</CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-400">Leeftijd</Label>
              <Input type="number" value={ageValue} onChange={(e) => setAgeValue(parseFloat(e.target.value) || 0)} className="text-xl font-mono font-bold h-12" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-400">Eenheid</Label>
              <Select value={ageUnit} onValueChange={(v: any) => setAgeUnit(v)}>
                <SelectTrigger className="h-12 font-bold uppercase text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weeks">Weken</SelectItem>
                  <SelectItem value="months">Maanden</SelectItem>
                  <SelectItem value="years">Jaren</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
  <Label className="text-[10px] uppercase font-bold text-slate-400">Lengte (cm)</Label>
  <Input 
    type="number" 
    placeholder={`Schatting: ${Math.round(estimatedHeight)}`}
    value={manualHeight ?? ""} 
    onChange={(e) => setManualHeight(e.target.value ? parseFloat(e.target.value) : null)} 
    className="text-xl font-mono font-bold h-12" 
  />
</div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-400">Gewicht (kg)</Label>
              <Input 
                type="number" 
                placeholder={decimalYear >= 1 ? `Schat: ${estimatedWeight}` : "Verplicht"}
                value={manualWeight ?? ""}
                onChange={(e) => setManualWeight(e.target.value ? parseFloat(e.target.value) : null)}
                className={`text-xl font-mono font-bold h-12 ${isWeightRequired ? 'border-amber-500 ring-2 ring-amber-100' : 'border-slate-200'}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {isWeightRequired ? (
        <Card className="border-2 border-dashed border-amber-300 bg-amber-50/50">
          <CardContent className="p-8 text-center space-y-3">
            <ShieldAlert className="h-12 w-12 text-amber-500 mx-auto" />
            <h3 className="text-lg font-black uppercase text-amber-800 tracking-tight">Gewicht Verplicht</h3>
            <p className="text-xs text-slate-600 font-medium">Voor kinderen &lt; 1 jaar is een exact gewicht vereist voor veilige dosering.</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="airway">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100 p-1 rounded-xl h-12 shadow-inner">
            <TabsTrigger value="airway" className="text-[10px] font-black uppercase tracking-tighter">Airway</TabsTrigger>
            <TabsTrigger value="drugs" className="text-[10px] font-black uppercase tracking-tighter">Drugs</TabsTrigger>
            <TabsTrigger value="regional" className="text-[10px] font-black uppercase tracking-tighter">Caudaal</TabsTrigger>
          </TabsList>

          <TabsContent value="airway" className="space-y-4">
            {/* ECK FORMULE (PRIMAIR) */}
            <div className="space-y-2">
               <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Formule van Eck (Bouw-gebaseerd)</Label>
               <ResultCard label="ETT Maat (ID)" value={airway?.eck} unit="mm" color="bg-blue-600 text-white shadow-blue-200" />
            </div>

            {/* COLE FORMULE (SECUNDAIR) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Cole Uncuffed</Label>
                <ResultCard label="ID" value={airway?.coleUncuffed} unit="mm" color="bg-slate-50 text-slate-700 border-slate-200" />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Cole Cuffed</Label>
                <ResultCard label="ID" value={airway?.coleCuffed} unit="mm" color="bg-slate-50 text-slate-700 border-slate-200" />
              </div>
            </div>

            {/* MATEN & DIEPTE */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <ResultCard label="ETT Diepte" value={airway?.depth} unit="cm" color="bg-indigo-50 text-indigo-700 border-indigo-100" />
              <ResultCard label="LMA Maat" value={airway?.lma} unit="#" color="bg-violet-50 text-violet-700 border-violet-100" />
            </div>
          </TabsContent>

          <TabsContent value="drugs" className="space-y-4">
             <div className="bg-red-600 p-4 rounded-2xl shadow-lg flex items-center justify-between border-b-4 border-red-800">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-white animate-pulse" />
                  <div>
                    <p className="text-[10px] font-black text-red-100 uppercase tracking-widest">Adrenaline (10µg/kg)</p>
                    <p className="text-2xl font-mono font-black text-white">{drugs?.adrenaline.ml} <span className="text-xs">ml (1:10k)</span></p>
                  </div>
                </div>
              </div>
            <div className="space-y-2">
              <DrugRow label="Propofol 1%" dose={`${drugs?.propofol.mg} mg`} volume={`${drugs?.propofol.ml} ml`} />
              <DrugRow label="Sufentanil (5µg/ml)" dose={`${drugs?.sufentanil.mcg} µg`} volume={`${drugs?.sufentanil.ml} ml`} />
              <DrugRow label="Alfentanil (500µg/ml)" dose={`${drugs?.alfentanil.mcg} µg`} volume={`${drugs?.alfentanil.ml} ml`} />
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Cefazoline (30mg/kg)</p>
                  <p className="text-sm font-bold text-slate-700">{drugs?.cefazoline.mg} mg</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Amoxiclav (30mg/kg)</p>
                  <p className="text-sm font-bold text-slate-700">{drugs?.amoxiclav.mg} mg</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="regional">
            <Card className="border-orange-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-orange-50/50 p-4 border-b border-orange-100">
                <CardTitle className="text-xs font-black uppercase text-orange-800 italic">Caudaal: Ropivacaïne 0.2%</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white border-2 border-orange-50 rounded-2xl">
                    <p className="text-[9px] font-black text-orange-400 uppercase">Sacraal (0.5ml/kg)</p>
                    <p className="text-2xl font-mono font-black text-orange-700">{(weight * 0.5).toFixed(1)} <span className="text-xs font-bold">ml</span></p>
                  </div>
                  <div className="p-4 bg-white border-2 border-orange-50 rounded-2xl">
                    <p className="text-[9px] font-black text-orange-400 uppercase">Thoraco-Lum (1ml/kg)</p>
                    <p className="text-2xl font-mono font-black text-orange-900">{(weight * 1.0).toFixed(1)} <span className="text-xs font-bold">ml</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      <div className="mt-8 pt-6 border-t border-slate-100">
  <a 
    href="https://reafiche.uzgent.be/reafiche.html" 
    target="_blank" 
    rel="noopener noreferrer"
    className="flex items-center justify-center gap-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-100 transition-colors shadow-sm"
  >
    <ShieldAlert className="h-4 w-4 text-slate-400" />
    <span className="text-xs font-black uppercase tracking-tighter">Externe bron: Reafiche UZ Gent</span>
  </a>
</div>

    </div>
  );
}

function ResultCard({ label, value, unit, color }: any) {
  return (
    <div className={`p-4 rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center transition-all ${color}`}>
      <p className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-1">{label}</p>
      <p className="text-3xl font-mono font-black">{value}<span className="text-sm ml-1 font-bold">{unit}</span></p>
    </div>
  );
}

function DrugRow({ label, dose, volume }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-teal-200 transition-colors">
      <div className="space-y-0.5">
        <p className="text-[9px] font-black uppercase text-slate-400 leading-none tracking-tighter">{label}</p>
        <p className="text-sm font-black text-slate-800 italic">{dose}</p>
      </div>
      <div className="text-right px-4 py-2 bg-teal-50 rounded-xl border border-teal-100 min-w-[85px]">
        <p className="text-lg font-mono font-black text-teal-700">{volume}</p>
      </div>
    </div>
  );
}