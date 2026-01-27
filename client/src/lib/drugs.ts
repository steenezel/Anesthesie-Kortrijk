export interface Drug {
  id: string;
  name: string;
  maxDoseMgPerKg: number;
  absoluteMaxDoseMg?: number;
  defaultConcentration?: number; // percentage
  hasEpiVariant?: boolean;
  epiMaxDoseMgPerKg?: number;
  epiAbsoluteMaxDoseMg?: number;
  concentrations: number[]; // common concentrations available
}

export const DRUGS: Drug[] = [
  {
    id: "lidocaine",
    name: "Lidocaine (Xylocaine)",
    maxDoseMgPerKg: 4.5,
    absoluteMaxDoseMg: 300,
    hasEpiVariant: true,
    epiMaxDoseMgPerKg: 7,
    epiAbsoluteMaxDoseMg: 500,
    defaultConcentration: 1,
    concentrations: [0.5, 1, 1.5, 2, 4],
  },
  {
    id: "bupivacaine",
    name: "Bupivacaine (Marcaine)",
    maxDoseMgPerKg: 2, // Conservative limit (ranges 2-2.5)
    absoluteMaxDoseMg: 175,
    hasEpiVariant: true,
    epiMaxDoseMgPerKg: 2, // Epi doesn't significantly increase safe toxic dose for cardiac toxicity concerns, unlike Lido
    epiAbsoluteMaxDoseMg: 225, // Some variability here, keeping safe
    defaultConcentration: 0.25,
    concentrations: [0.25, 0.5, 0.75],
  },
  {
    id: "ropivacaine",
    name: "Ropivacaine (Naropin)",
    maxDoseMgPerKg: 3,
    absoluteMaxDoseMg: 200,
    defaultConcentration: 0.2,
    concentrations: [0.2, 0.5, 0.75, 1],
  },
  {
    id: "mepivacaine",
    name: "Mepivacaine (Carbocaine)",
    maxDoseMgPerKg: 7,
    absoluteMaxDoseMg: 400,
    defaultConcentration: 1.5,
    concentrations: [1, 1.5, 2, 3],
  },
  {
    id: "prilocaine",
    name: "Prilocaine (Citanest)",
    maxDoseMgPerKg: 8, // <70kg: 6mg/kg, >70kg: 600mg
    absoluteMaxDoseMg: 600, 
    defaultConcentration: 2,
    concentrations: [0.5, 1, 2, 3], // Often dental uses 4%
  }
];

export function calculateMaxDose(weight: number, drug: Drug, withEpi: boolean = false) {
  const isEpi = withEpi && drug.hasEpiVariant;
  const dosePerKg = isEpi ? (drug.epiMaxDoseMgPerKg || drug.maxDoseMgPerKg) : drug.maxDoseMgPerKg;
  const absoluteMax = isEpi ? (drug.epiAbsoluteMaxDoseMg || drug.absoluteMaxDoseMg) : drug.absoluteMaxDoseMg;

  let calculatedMax = weight * dosePerKg;
  
  // Cap at absolute max if defined
  if (absoluteMax && calculatedMax > absoluteMax) {
    calculatedMax = absoluteMax;
  }

  return {
    maxDoseMg: parseFloat(calculatedMax.toFixed(1)),
    dosePerKg,
    isCapped: absoluteMax ? calculatedMax >= absoluteMax : false,
    absoluteMax
  };
}
