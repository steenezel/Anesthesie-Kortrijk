import { useState, useMemo, useEffect } from "react";
import { DRUG_DATA, calculateMaxDose, calculateIntralipid } from "@/lib/drugs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, AlertTriangle, ShieldAlert, Calculator as CalcIcon, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CalculatorPage() {
  const [weight, setWeight] = useState<number>(70);
  const [isHypervascular, setIsHypervascular] = useState(false);
  const [patientRisk, setPatientRisk] = useState<string>("1.0");
  const [selectedDrugs, setSelectedDrugs] = useState<any[]>([]);
  const [showProtocol, setShowProtocol] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Safe Dose Calculator State
  const [safeDrugId, setSafeDrugId] = useState(DRUG_DATA[0].id);
  const [safeConc, setSafeConc] = useState<number>(5);

  const riskValue = parseFloat(patientRisk);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addDrug = () => {
    setSelectedDrugs([
      ...selectedDrugs,
      {
        instanceId: Math.random().toString(36).substr(2, 9),
        drugId: DRUG_DATA[0].id,
        doseMg: 0,
        volumeMl: 0,
        concentration: 10,
      }
    ]);
  };

  const removeDrug = (id: string) => {
    setSelectedDrugs(selectedDrugs.filter(d => d.instanceId !== id));
  };

  const updateDrug = (id: string, updates: Partial<any>) => {
    setSelectedDrugs(selectedDrugs.map(d => {
      if (d.instanceId !== id) return d;
      const next = { ...d, ...updates };
      if ('volumeMl' in updates || 'concentration' in updates) {
        next.doseMg = next.volumeMl * next.concentration;
      } else if ('doseMg' in updates) {
        next.volumeMl = next.concentration > 0 ? next.doseMg / next.concentration : 0;
      }
      return next;
    }));
  };

  const toxicityScore = useMemo(() => {
    if (weight <= 0) return 0;
    return selectedDrugs.reduce((acc, d) => {
      const max = calculateMaxDose(weight, d.drugId, isHypervascular, riskValue);
      return acc + (max > 0 ? d.doseMg / max : 0);
    }, 0);
  }, [selectedDrugs, weight, isHypervascular, riskValue]);

  const safeDoseResult = useMemo(() => {
    const maxMg = calculateMaxDose(weight, safeDrugId, isHypervascular, riskValue);
    const maxMl = safeConc > 0 ? maxMg / safeConc : 0;
    return { maxMg, maxMl };
  }, [weight, safeDrugId, isHypervascular, safeConc, riskValue]);

  const intralipid = calculateIntralipid(weight);

  const getGaugeColor = (score: number) => {
    if (score < 0.5) return "bg-emerald-500";
    if (score < 0.8) return "bg-amber-500";
    return "bg-destructive";
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 pb-20">
      {/* Weight & Type Header */}
      <Card className="border-primary/20 shadow-lg overflow-hidden">
        <div className="bg-primary/5 p-4 border-b border-primary/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="font-heading font-bold text-primary">Patient Config</h2>
          </div>
          <Dialog open={showProtocol} onOpenChange={setShowProtocol}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm" className="font-bold uppercase tracking-tighter shadow-md">
                <ShieldAlert className="mr-1 h-4 w-4" /> Lipid Protocol
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-destructive flex items-center gap-2">
                  <ShieldAlert className="h-8 w-8" /> INTRALIPID 20%
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-destructive/10 p-4 rounded-2xl border-2 border-destructive/20 text-center">
                    <div className="text-xs uppercase font-bold text-destructive mb-1">Bolus (1.5 mL/kg)</div>
                    <div className="text-3xl font-mono font-black text-destructive">{intralipid.bolus.toFixed(1)} <span className="text-sm">mL</span></div>
                  </div>
                  <div className="bg-destructive/5 p-4 rounded-2xl border-2 border-destructive/10 text-center">
                    <div className="text-xs uppercase font-bold text-muted-foreground mb-1">Infusion (0.25 mL/kg/min)</div>
                    <div className="text-3xl font-mono font-black text-foreground">{intralipid.infusion.toFixed(1)} <span className="text-sm">mL/min</span></div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Gewicht (kg)</Label>
              <Input 
                type="number" 
                value={weight === 0 ? "" : weight}
                placeholder="0"
                onChange={(e) => setWeight(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                className="text-2xl font-mono font-bold h-12"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Type Blok</Label>
              <Select value={isHypervascular ? "hyper" : "std"} onValueChange={(v) => setIsHypervascular(v === "hyper")}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="std">Standaard</SelectItem>
                  <SelectItem value="hyper">Hypervasculair (α=0.8)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2 pt-2">
            <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Patiënt Risico Profiel</Label>
            <Select value={patientRisk} onValueChange={setPatientRisk}>
              <SelectTrigger className="h-12 font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1.0">Laag Risico (Standaard, α=1.0)</SelectItem>
                <SelectItem value="0.8">Matig Risico (Ouderdom, mild hart/leverfalen, α=0.8)</SelectItem>
                <SelectItem value="0.7">Hoog Risico (Zwangerschap, ernstig orgaanfalen, α=0.7)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="safe-dose" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/80 p-1.5 rounded-2xl h-14 shadow-inner">
          <TabsTrigger 
            value="safe-dose" 
            className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300 font-black uppercase tracking-tight gap-2 text-xs"
          >
            <ShieldCheck className="h-5 w-5" /> 1. Max Safe Dose
          </TabsTrigger>
          <TabsTrigger 
            value="toxicity" 
            className="rounded-xl data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 font-black uppercase tracking-tight gap-2 text-xs"
          >
            <CalcIcon className="h-5 w-5" /> 2. Toxicity Score
          </TabsTrigger>
        </TabsList>

        <TabsContent value="safe-dose" className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 mb-2">
            <h3 className="text-primary font-black uppercase tracking-tighter text-sm mb-1">Stap 1: Bereken Limiet</h3>
            <p className="text-xs text-muted-foreground">Selecteer molecule en concentratie om de maximale volumes te zien.</p>
          </div>
          <Card className="border-2 border-primary/20 shadow-md">
            <CardContent className="p-6 text-center space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20">
                  <div className="text-[10px] uppercase font-bold text-primary mb-1">Max Dose (mg)</div>
                  <div className="text-3xl font-mono font-black text-primary">{safeDoseResult.maxMg.toFixed(1)}</div>
                </div>
                <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
                  <div className="text-[10px] uppercase font-bold text-emerald-600 mb-1">Max Volume (mL)</div>
                  <div className="text-3xl font-mono font-black text-emerald-600">{safeDoseResult.maxMl.toFixed(1)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Selecteer Molecule</Label>
                <Select value={safeDrugId} onValueChange={setSafeDrugId}>
                  <SelectTrigger className="h-12 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DRUG_DATA.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Concentratie (mg/ml)</Label>
                <Input 
                  type="number" 
                  step="0.5"
                  value={safeConc === 0 ? "" : safeConc}
                  placeholder="0"
                  onChange={(e) => setSafeConc(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                  className="h-12 font-mono text-xl"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="toxicity" className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 mb-2">
            <h3 className="text-amber-600 font-black uppercase tracking-tighter text-sm mb-1">Stap 2: Cumulatieve Check</h3>
            <p className="text-xs text-muted-foreground">Voeg toegediende middelen toe om de totale belasting te controleren.</p>
          </div>
          <Card className="relative overflow-hidden border-2 border-border">
            <div className="absolute top-0 left-0 w-full h-1 bg-muted">
              <motion.div 
                className={`h-full ${getGaugeColor(toxicityScore)}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(toxicityScore * 100, 100)}%` }}
                transition={{ type: "spring", stiffness: 50 }}
              />
            </div>
            <CardContent className="p-6 text-center">
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-widest mb-1">Cumulative Toxicity Score</div>
              <div className={`text-5xl font-mono font-black ${(toxicityScore >= 1) ? 'text-destructive animate-pulse' : ''}`}>
                {(toxicityScore * 100).toFixed(1)}%
              </div>
              {toxicityScore >= 1 && (
                <div className="mt-2 text-destructive font-bold flex items-center justify-center gap-2">
                  <AlertTriangle className="h-5 w-5" /> TOXIC LIMIT EXCEEDED
                </div>
              )}
              {toxicityScore > 0.8 && toxicityScore < 1 && (
                <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-2 text-left">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-800 dark:text-amber-200 font-medium">
                    Opgelet: drempelwaarde lager bij acidemie/hypercapnie.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Toegediende middelen</h3>
              <Button onClick={addDrug} size="sm" variant="outline" className="gap-2 rounded-full border-primary/20 text-primary hover:bg-primary/5">
                <Plus className="h-4 w-4" /> Add Drug
              </Button>
            </div>

            <AnimatePresence mode="popLayout">
              {selectedDrugs.map((drug) => (
                <motion.div key={drug.instanceId} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} layout>
                  <Card className="border-l-4 border-l-primary overflow-visible shadow-sm">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <Select value={drug.drugId} onValueChange={(v) => updateDrug(drug.instanceId, { drugId: v })}>
                          <SelectTrigger className="flex-1 font-bold h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DRUG_DATA.map(d => (
                              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" onClick={() => removeDrug(drug.instanceId)} className="text-muted-foreground hover:text-destructive shrink-0">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase font-bold text-muted-foreground">Conc (mg/ml)</Label>
                          <Input type="number" step="0.5" value={drug.concentration === 0 ? "" : drug.concentration} placeholder="0" onChange={(e) => updateDrug(drug.instanceId, { concentration: e.target.value === "" ? 0 : parseFloat(e.target.value) })} className="font-mono h-9" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase font-bold text-muted-foreground">Volume (mL)</Label>
                          <Input type="number" value={drug.volumeMl === 0 ? "" : drug.volumeMl} placeholder="0" onChange={(e) => updateDrug(drug.instanceId, { volumeMl: e.target.value === "" ? 0 : parseFloat(e.target.value) })} className="font-mono h-9" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-muted/30 p-2 rounded-lg border border-border/50">
                        <div className="text-xs font-bold text-muted-foreground">{drug.doseMg.toFixed(1)} mg</div>
                        <div className="text-xs font-mono font-bold">{((drug.doseMg / calculateMaxDose(weight, drug.drugId, isHypervascular)) * 100).toFixed(1)}% van max</div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            {selectedDrugs.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed rounded-3xl text-muted-foreground bg-muted/20">
                <p className="text-xs font-medium">Geen middelen toegevoegd</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
