import { useState, useEffect } from "react";
import { Drug, calculateMaxDose } from "@/lib/drugs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DrugCardProps {
  drug: Drug;
  weight: number;
}

export function DrugCard({ drug, weight }: DrugCardProps) {
  const [concentration, setConcentration] = useState<string>(drug.defaultConcentration?.toString() || drug.concentrations[0].toString());
  const [withEpi, setWithEpi] = useState(false);

  // Reset epi when drug changes if not available
  useEffect(() => {
    if (!drug.hasEpiVariant) setWithEpi(false);
  }, [drug]);

  const concVal = parseFloat(concentration);
  const result = calculateMaxDose(weight, drug, withEpi);
  
  // Concentration mg/mL = % * 10
  const mgPerMl = concVal * 10;
  const maxVolMl = result.maxDoseMg / mgPerMl;

  const isEpiRelevant = drug.hasEpiVariant && drug.epiMaxDoseMgPerKg && drug.epiMaxDoseMgPerKg > drug.maxDoseMgPerKg;

  return (
    <Card className="overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3 bg-secondary/30">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-heading text-foreground">{drug.name}</CardTitle>
          {result.isCapped && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Capped at absolute max dose ({result.absoluteMax}mg)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        
        {/* Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Concentration (%)</Label>
            <Select value={concentration} onValueChange={setConcentration}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {drug.concentrations.map((c) => (
                  <SelectItem key={c} value={c.toString()}>
                    {c}% ({c * 10} mg/mL)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 flex flex-col justify-end pb-1">
             {drug.hasEpiVariant && (
              <div className="flex items-center justify-between space-x-2 bg-muted/50 p-2 rounded-md border">
                <Label htmlFor={`epi-${drug.id}`} className="text-sm cursor-pointer">With Epinephrine</Label>
                <Switch 
                  id={`epi-${drug.id}`}
                  checked={withEpi} 
                  onCheckedChange={setWithEpi} 
                />
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="bg-primary/5 rounded-lg p-3 text-center border border-primary/10">
            <div className="text-xs text-muted-foreground font-medium mb-1">Max Dose</div>
            <div className="text-2xl font-bold text-primary font-mono tracking-tight">
              {result.maxDoseMg}
              <span className="text-sm font-normal text-muted-foreground ml-1">mg</span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              {result.dosePerKg} mg/kg
            </div>
          </div>

          <div className="bg-primary/10 rounded-lg p-3 text-center border border-primary/20 ring-1 ring-primary/10">
            <div className="text-xs text-muted-foreground font-medium mb-1">Max Volume</div>
            <div className="text-2xl font-bold text-foreground font-mono tracking-tight">
              {maxVolMl.toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground ml-1">mL</span>
            </div>
             <div className="text-[10px] text-muted-foreground mt-1">
              at {concVal}%
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
