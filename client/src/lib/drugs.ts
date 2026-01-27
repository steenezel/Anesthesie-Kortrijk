export interface DrugInfo {
  id: string;
  name: string;
  maxDoseMgPerKg: number;
}

export const DRUG_DATA: DrugInfo[] = [
  { id: "ropivacaine", name: "Ropivacaïne", maxDoseMgPerKg: 3 },
  { id: "bupivacaine", name: "Bupivacaïne", maxDoseMgPerKg: 2 },
  { id: "levobupivacaine", name: "Levobupivacaïne", maxDoseMgPerKg: 2.5 },
  { id: "lidocaine", name: "Lidocaïne", maxDoseMgPerKg: 4.5 },
  { id: "lidocaine_epi", name: "Lidocaïne + Adrenaline", maxDoseMgPerKg: 7 },
];

export interface SelectedDrug {
  instanceId: string;
  drugId: string;
  doseMg: number;
  volumeMl: number;
  concentration: number; // in mg/ml
  usePercentage: boolean;
}

export function calculateMaxDose(weight: number, drugId: string, isHypervascular: boolean): number {
  const drug = DRUG_DATA.find(d => d.id === drugId);
  if (!drug) return 0;
  
  let maxDose = weight * drug.maxDoseMgPerKg;
  if (isHypervascular) {
    maxDose *= 0.8;
  }
  return maxDose;
}

export function calculateIntralipid(weight: number) {
  return {
    bolus: weight * 1.5, // 1.5 mL/kg
    infusion: weight * 0.25, // 0.25 mL/kg/min
  };
}
