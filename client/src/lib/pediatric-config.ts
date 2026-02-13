export interface PediatricMed {
  name: string;
  dosePerKg: number;
  unit: "mg" | "mcg" | "ml" | "J";
  maxDose?: number;
  concentration?: number; 
  category: "inductie" | "supportive" | "resus";
}

export const pediatricMeds: PediatricMed[] = [
  // INDUCTIE
  { name: "Propofol 1%", dosePerKg: 3, unit: "mg", maxDose: 150, concentration: 10, category: "inductie" },
  { name: "Sufentanil", dosePerKg: 0.15, unit: "mcg", maxDose: 10, concentration: 5, category: "inductie" },
  { name: "Alfentanil", dosePerKg: 15, unit: "mcg", maxDose: 500, concentration: 500, category: "inductie" },
  { name: "Succinylcholine", dosePerKg: 2, unit: "mg", maxDose: 100, concentration: 50, category: "inductie" },
  
  // SUPPORTIVE
  { name: "Ondansetron", dosePerKg: 0.1, unit: "mg", maxDose: 4, concentration: 2, category: "supportive" },
  { name: "Cefazoline", dosePerKg: 30, unit: "mg", maxDose: 2000, concentration: 1, category: "supportive" }, // Conc 1 voor puur mg weergave
  { name: "Amoxiclav", dosePerKg: 30, unit: "mg", maxDose: 1000, concentration: 1, category: "supportive" },
  { name: "Paracetamol", dosePerKg: 15, unit: "mg", maxDose: 1000, concentration: 10, category: "supportive" },
  { name: "Ibuprofen", dosePerKg: 10, unit: "mg", maxDose: 400, concentration: 1, category: "supportive" },

  // RESUS / EMERGENCY (Zowel in Drugs als Resus)
  { name: "Adrenaline", dosePerKg: 10, unit: "mcg", maxDose: 1000, concentration: 100, category: "resus" },
  { name: "Atropine", dosePerKg: 20, unit: "mcg", maxDose: 500, concentration: 250, category: "resus" }, // 0.25mg/ml = 250mcg/ml
  { name: "Defibrillatie", dosePerKg: 4, unit: "J", category: "resus" }
];