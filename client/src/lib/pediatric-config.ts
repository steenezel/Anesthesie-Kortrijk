// client/src/lib/pediatric-config.ts

export interface PediatricMed {
  name: string;
  dosePerKg: number;
  unit: "mg" | "mcg" | "ml" | "J";
  maxDose?: number;
  concentration?: number;
  category: "inductie" | "supportive" | "resus";
  precisionDose?: number;   // Aantal decimalen voor de dosis (mg/mcg/J)
  precisionVolume?: number; // Aantal decimalen voor het volume (ml)
}

export const pediatricMeds: PediatricMed[] = [
  // --- INDUCTIE & EMERGENCY DRUGS ---
  { 
    name: "Propofol 1%", 
    dosePerKg: 3, 
    unit: "mg", 
    maxDose: 150, 
    concentration: 10, 
    category: "inductie", 
    precisionDose: 0, 
    precisionVolume: 0 
  },
    { 
    name: "Midazolam", 
    dosePerKg: 0.1, 
    unit: "mg", 
    maxDose: 5, 
    concentration: 1, 
    category: "inductie", 
    precisionDose: 1, 
    precisionVolume: 1 
  },
  { 
    name: "Sufentanil", 
    dosePerKg: 0.15, 
    unit: "mcg", 
    maxDose: 10, 
    concentration: 5, 
    category: "inductie", 
    precisionDose: 1, 
    precisionVolume: 1 
  },
  { 
    name: "Alfentanil", 
    dosePerKg: 15, 
    unit: "mcg", 
    maxDose: 500, 
    concentration: 500, 
    category: "inductie", 
    precisionDose: 0, 
    precisionVolume: 1 
  },
  { 
    name: "Fentanyl", 
    dosePerKg: 4, 
    unit: "mcg", 
    maxDose: 100, 
    concentration: 50, 
    category: "inductie", 
    precisionDose: 0, 
    precisionVolume: 1 
  },{ 
    name: "Succinylcholine", 
    dosePerKg: 2, 
    unit: "mg", 
    maxDose: 100, 
    concentration: 50, 
    category: "inductie", 
    precisionDose: 0, 
    precisionVolume: 1 
  },
  { 
    name: "Rocuronium", 
    dosePerKg: 0.9, 
    unit: "mg", 
    maxDose: 50, 
    concentration: 10, 
    category: "inductie", 
    precisionDose: 1, 
    precisionVolume: 1 
  },

  // --- SUPPORTIVE ---
  { 
    name: "Ondansetron", 
    dosePerKg: 0.1, 
    unit: "mg", 
    maxDose: 4, 
    concentration: 2, 
    category: "supportive", 
    precisionDose: 1, 
    precisionVolume: 2 
  },
  { 
    name: "Cefazoline", 
    dosePerKg: 30, 
    unit: "mg", 
    maxDose: 2000, 
    category: "supportive", 
    precisionDose: 0 
  },
  { 
    name: "Amoxiclav", 
    dosePerKg: 30, 
    unit: "mg", 
    maxDose: 1200, 
    category: "supportive", 
    precisionDose: 0 
  },
    { 
    name: "Metronidazole", 
    dosePerKg: 10, 
    unit: "mg", 
    maxDose: 500,
    concentration: 5, 
    category: "supportive", 
    precisionDose: 0,
    precisionVolume: 0  
  },
  { 
    name: "Paracetamol", 
    dosePerKg: 15, 
    unit: "mg", 
    maxDose: 1000, 
    concentration: 10, 
    category: "supportive", 
    precisionDose: 0, 
    precisionVolume: 0 
  },
  { 
    name: "Ibuprofen", 
    dosePerKg: 10, 
    unit: "mg", 
    maxDose: 400, 
    category: "supportive", 
    precisionDose: 0 
  },
    { 
    name: "Morfine", 
    dosePerKg: 1, 
    unit: "mg", 
    maxDose: 10,
    concentration: 1,
    category: "supportive", 
    precisionDose: 1,
    precisionVolume: 1 
  },

  // --- RESUS / EMERGENCY (Zowel in Drugs als Resus tab) ---
  { 
    name: "Adrenaline", 
    dosePerKg: 10, 
    unit: "mcg", 
    maxDose: 1000, 
    concentration: 100, 
    category: "resus", 
    precisionDose: 0, 
    precisionVolume: 1 
  },
  { 
    name: "Atropine", 
    dosePerKg: 20, 
    unit: "mcg", 
    maxDose: 500, 
    concentration: 200, 
    category: "resus", 
    precisionDose: 0, 
    precisionVolume: 2 
  },
  { 
    name: "Defibrillatie (bifasisch)", 
    dosePerKg: 4, 
    unit: "J", 
    maxDose: 200,
    category: "resus", 
    precisionDose: 0 
  }
];