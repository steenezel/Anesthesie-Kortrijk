/**
 * Pure ABG / zuur-base interpretatie (geen side effects).
 * Referentiewaarden: adult arterieel; klinische correlatie blijft nodig.
 */

export interface AbgInput {
  ph: number;
  pco2: number;
  hco3: number;
  na?: number;
  cl?: number;
  /** Albumine in g/L (standaard 40). */
  albumin?: number;
  pao2?: number;
  /** FiO₂ als percentage 21–100. */
  fio2?: number;
  /** Voor verwachte metabole compensatie bij respiratoire stoornissen. */
  chronicity?: "acute" | "chronic";
}

export type PhStatus = "acidemia" | "alkalemia" | "normal";

export interface ExpectedRange {
  low: number;
  high: number;
  mid: number;
  formula: string;
}

export interface AbgResult {
  phStatus: PhStatus;
  primaryDisorder: string;
  disorders: string[];
  anionGap: number | null;
  anionGapCorrected: number | null;
  elevatedAnionGap: boolean | null;
  expectedPco2: ExpectedRange | null;
  expectedHco3: ExpectedRange | null;
  compensationNote: string | null;
  deltaGap: number | null;
  deltaGapInterpretation: string | null;
  pfRatio: number | null;
  aaGradient: number | null;
  summary: string[];
  warnings: string[];
}

const PH_LOW = 7.35;
const PH_HIGH = 7.45;
const PCO2_LOW = 35;
const PCO2_HIGH = 45;
const HCO3_LOW = 22;
const HCO3_HIGH = 26;
const HCO3_NORMAL = 24;
const PCO2_NORMAL = 40;
const AG_NORMAL = 12;
const ALBUMIN_NORMAL_G_L = 40;

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function isFiniteNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

/** Winter's formula: expected PaCO₂ bij metabole acidose. */
export function wintersExpectedPco2(hco3: number): ExpectedRange {
  const mid = 1.5 * hco3 + 8;
  return {
    mid: round1(mid),
    low: round1(mid - 2),
    high: round1(mid + 2),
    formula: "Winter: expected PCO₂ = 1.5 × HCO₃ + 8 (±2)",
  };
}

/** Verwachte PaCO₂ bij metabole alkalose (ruwe regel). */
export function metabolicAlkalosisExpectedPco2(hco3: number): ExpectedRange {
  const mid = 0.7 * hco3 + 20;
  return {
    mid: round1(mid),
    low: round1(mid - 5),
    high: round1(mid + 5),
    formula: "Met. alkalose: expected PCO₂ ≈ 0.7 × HCO₃ + 20 (±5)",
  };
}

/** Verwachte HCO₃ bij respiratoire acidose. */
export function respiratoryAcidosisExpectedHco3(
  pco2: number,
  chronicity: "acute" | "chronic",
): ExpectedRange {
  const delta = pco2 - PCO2_NORMAL;
  const factor = chronicity === "acute" ? 0.1 : 0.4;
  const mid = HCO3_NORMAL + factor * delta;
  const tol = chronicity === "acute" ? 2 : 3;
  return {
    mid: round1(mid),
    low: round1(mid - tol),
    high: round1(mid + tol),
    formula:
      chronicity === "acute"
        ? "Acute resp. acidose: ΔHCO₃ ≈ 0.1 × ΔPCO₂"
        : "Chronische resp. acidose: ΔHCO₃ ≈ 0.4 × ΔPCO₂",
  };
}

/** Verwachte HCO₃ bij respiratoire alkalose. */
export function respiratoryAlkalosisExpectedHco3(
  pco2: number,
  chronicity: "acute" | "chronic",
): ExpectedRange {
  const delta = PCO2_NORMAL - pco2;
  const factor = chronicity === "acute" ? 0.2 : 0.5;
  const mid = HCO3_NORMAL - factor * delta;
  const tol = chronicity === "acute" ? 2 : 3;
  return {
    mid: round1(mid),
    low: round1(mid - tol),
    high: round1(mid + tol),
    formula:
      chronicity === "acute"
        ? "Acute resp. alkalose: ΔHCO₃ ≈ 0.2 × ΔPCO₂"
        : "Chronische resp. alkalose: ΔHCO₃ ≈ 0.5 × ΔPCO₂",
  };
}

export function computeAnionGap(na: number, cl: number, hco3: number): number {
  return round1(na - (cl + hco3));
}

/** Correctie voor hypoalbuminemie (albumine in g/L). */
export function correctAnionGapForAlbumin(ag: number, albuminGPerL: number): number {
  return round1(ag + 0.25 * (ALBUMIN_NORMAL_G_L - albuminGPerL));
}

export function computeAaGradient(pao2: number, pco2: number, fio2Percent: number): number {
  const fio2 = fio2Percent / 100;
  const pao2Alveolar = fio2 * (760 - 47) - pco2 / 0.8;
  return round1(pao2Alveolar - pao2);
}

export function computePfRatio(pao2: number, fio2Percent: number): number {
  return round1(pao2 / (fio2Percent / 100));
}

function phStatus(ph: number): PhStatus {
  if (ph < PH_LOW) return "acidemia";
  if (ph > PH_HIGH) return "alkalemia";
  return "normal";
}

function inRange(value: number, low: number, high: number): boolean {
  return value >= low && value <= high;
}

/**
 * Interpreteert ABG-waarden. Ontbrekende optionele velden worden overgeslagen.
 */
export function interpretAbg(input: AbgInput): AbgResult {
  const { ph, pco2, hco3 } = input;
  const chronicity = input.chronicity ?? "acute";
  const albumin = isFiniteNumber(input.albumin) ? input.albumin : ALBUMIN_NORMAL_G_L;

  const warnings: string[] = [];
  const summary: string[] = [];
  const disorders: string[] = [];

  if (!isFiniteNumber(ph) || !isFiniteNumber(pco2) || !isFiniteNumber(hco3)) {
    return {
      phStatus: "normal",
      primaryDisorder: "Onvolledige input",
      disorders: [],
      anionGap: null,
      anionGapCorrected: null,
      elevatedAnionGap: null,
      expectedPco2: null,
      expectedHco3: null,
      compensationNote: null,
      deltaGap: null,
      deltaGapInterpretation: null,
      pfRatio: null,
      aaGradient: null,
      summary: ["Vul minstens pH, PCO₂ en HCO₃ in."],
      warnings: [],
    };
  }

  if (ph < 6.8 || ph > 7.8) warnings.push("Extreme pH — controleer sample en analyse.");
  if (pco2 < 10 || pco2 > 120) warnings.push("Extreme PCO₂ — controleer eenheden (mmHg).");
  if (hco3 < 5 || hco3 > 60) warnings.push("Extreme HCO₃ — controleer waarden.");

  const status = phStatus(ph);
  const lowHco3 = hco3 < HCO3_LOW;
  const highHco3 = hco3 > HCO3_HIGH;
  const lowPco2 = pco2 < PCO2_LOW;
  const highPco2 = pco2 > PCO2_HIGH;

  let primaryDisorder = "Normaal zuur-base evenwicht";
  let expectedPco2: ExpectedRange | null = null;
  let expectedHco3: ExpectedRange | null = null;
  let compensationNote: string | null = null;

  if (status === "acidemia") {
    if (lowHco3 && !highPco2) {
      primaryDisorder = "Metabole acidose";
      disorders.push("Metabole acidose");
      expectedPco2 = wintersExpectedPco2(hco3);
      if (inRange(pco2, expectedPco2.low, expectedPco2.high)) {
        compensationNote = `Respiratoire compensatie adequaat (PCO₂ ${pco2} binnen ${expectedPco2.low}–${expectedPco2.high}).`;
      } else if (pco2 > expectedPco2.high) {
        compensationNote = "PCO₂ hoger dan verwacht → bijkomende respiratoire acidose.";
        disorders.push("Bijkomende respiratoire acidose");
      } else {
        compensationNote = "PCO₂ lager dan verwacht → bijkomende respiratoire alkalose.";
        disorders.push("Bijkomende respiratoire alkalose");
      }
    } else if (highPco2 && !lowHco3) {
      primaryDisorder = "Respiratoire acidose";
      disorders.push(`Respiratoire acidose (${chronicity})`);
      expectedHco3 = respiratoryAcidosisExpectedHco3(pco2, chronicity);
      if (inRange(hco3, expectedHco3.low, expectedHco3.high)) {
        compensationNote = `Metabole compensatie passend bij ${chronicity} (HCO₃ ${hco3} binnen ${expectedHco3.low}–${expectedHco3.high}).`;
      } else if (hco3 < expectedHco3.low) {
        compensationNote = "HCO₃ lager dan verwacht → bijkomende metabole acidose.";
        disorders.push("Bijkomende metabole acidose");
      } else {
        compensationNote = "HCO₃ hoger dan verwacht → bijkomende metabole alkalose.";
        disorders.push("Bijkomende metabole alkalose");
      }
    } else if (lowHco3 && highPco2) {
      primaryDisorder = "Gemengde acidose (metabool + respiratorisch)";
      disorders.push("Metabole acidose", "Respiratoire acidose");
      expectedPco2 = wintersExpectedPco2(hco3);
      compensationNote = "Zowel HCO₃↓ als PCO₂↑ — gemengde acidose waarschijnlijk.";
    } else {
      primaryDisorder = "Acidemie — dominant proces onduidelijk";
      warnings.push("pH laag maar HCO₃/PCO₂ niet eenduidig pathologisch.");
    }
  } else if (status === "alkalemia") {
    if (highHco3 && !lowPco2) {
      primaryDisorder = "Metabole alkalose";
      disorders.push("Metabole alkalose");
      expectedPco2 = metabolicAlkalosisExpectedPco2(hco3);
      if (inRange(pco2, expectedPco2.low, expectedPco2.high)) {
        compensationNote = `Respiratoire compensatie adequaat (PCO₂ ${pco2} binnen ${expectedPco2.low}–${expectedPco2.high}).`;
      } else if (pco2 < expectedPco2.low) {
        compensationNote = "PCO₂ lager dan verwacht → bijkomende respiratoire alkalose.";
        disorders.push("Bijkomende respiratoire alkalose");
      } else {
        compensationNote = "PCO₂ hoger dan verwacht → bijkomende respiratoire acidose.";
        disorders.push("Bijkomende respiratoire acidose");
      }
    } else if (lowPco2 && !highHco3) {
      primaryDisorder = "Respiratoire alkalose";
      disorders.push(`Respiratoire alkalose (${chronicity})`);
      expectedHco3 = respiratoryAlkalosisExpectedHco3(pco2, chronicity);
      if (inRange(hco3, expectedHco3.low, expectedHco3.high)) {
        compensationNote = `Metabole compensatie passend bij ${chronicity} (HCO₃ ${hco3} binnen ${expectedHco3.low}–${expectedHco3.high}).`;
      } else if (hco3 > expectedHco3.high) {
        compensationNote = "HCO₃ hoger dan verwacht → bijkomende metabole alkalose.";
        disorders.push("Bijkomende metabole alkalose");
      } else {
        compensationNote = "HCO₃ lager dan verwacht → bijkomende metabole acidose.";
        disorders.push("Bijkomende metabole acidose");
      }
    } else if (highHco3 && lowPco2) {
      primaryDisorder = "Gemengde alkalose (metabool + respiratorisch)";
      disorders.push("Metabole alkalose", "Respiratoire alkalose");
      compensationNote = "Zowel HCO₃↑ als PCO₂↓ — gemengde alkalose waarschijnlijk.";
    } else {
      primaryDisorder = "Alkalemie — dominant proces onduidelijk";
      warnings.push("pH hoog maar HCO₃/PCO₂ niet eenduidig pathologisch.");
    }
  } else {
    // Normale pH — gecamoufleerde of gemengde stoornissen
    if (lowHco3 && lowPco2) {
      primaryDisorder = "Gecamoufleerde / gecompenseerde metabole acidose (of chronische hyperventilatie)";
      disorders.push("Metabole acidose (gecompenseerd)", "Respiratoire alkalose-component");
      expectedPco2 = wintersExpectedPco2(hco3);
    } else if (highHco3 && highPco2) {
      primaryDisorder = "Gecamoufleerde / gecompenseerde metabole alkalose (of chronische hypoventilatie)";
      disorders.push("Metabole alkalose (gecompenseerd)", "Respiratoire acidose-component");
    } else if (lowHco3 || highHco3 || lowPco2 || highPco2) {
      primaryDisorder = "Normale pH met afwijkende PCO₂/HCO₃ (gemengd of overgecompenseerd)";
      if (lowHco3) disorders.push("Lage HCO₃");
      if (highHco3) disorders.push("Hoge HCO₃");
      if (lowPco2) disorders.push("Lage PCO₂");
      if (highPco2) disorders.push("Hoge PCO₂");
    }
  }

  let anionGap: number | null = null;
  let anionGapCorrected: number | null = null;
  let elevatedAnionGap: boolean | null = null;
  let deltaGap: number | null = null;
  let deltaGapInterpretation: string | null = null;

  if (isFiniteNumber(input.na) && isFiniteNumber(input.cl)) {
    anionGap = computeAnionGap(input.na, input.cl, hco3);
    anionGapCorrected = correctAnionGapForAlbumin(anionGap, albumin);
    elevatedAnionGap = anionGapCorrected > AG_NORMAL + 2;

    if (elevatedAnionGap) {
      if (!disorders.some((d) => d.toLowerCase().includes("metabole acidose"))) {
        disorders.push("Hoog anion gap (HAGMA)");
      } else {
        disorders.push("Hoog anion gap-component");
      }
      const deltaAg = anionGapCorrected - AG_NORMAL;
      const deltaHco3 = HCO3_NORMAL - hco3;
      if (deltaHco3 > 0) {
        deltaGap = round2(deltaAg / deltaHco3);
        if (deltaGap < 1) {
          deltaGapInterpretation =
            "Δ/Δ < 1 → HAGMA + NAGMA (extra normaal-gap acidose).";
          disorders.push("Suggestie bijkomende NAGMA");
        } else if (deltaGap > 2) {
          deltaGapInterpretation =
            "Δ/Δ > 2 → HAGMA + metabole alkalose (of chronische hypercapnie).";
          disorders.push("Suggestie bijkomende metabole alkalose");
        } else {
          deltaGapInterpretation = "Δ/Δ ≈ 1–2 → past bij “pure” HAGMA.";
        }
      }
    } else if (lowHco3 && anionGapCorrected <= AG_NORMAL + 2) {
      disorders.push("Normaal anion gap (NAGMA) waarschijnlijk");
    }
  }

  let pfRatio: number | null = null;
  let aaGradient: number | null = null;
  if (isFiniteNumber(input.pao2) && isFiniteNumber(input.fio2)) {
    if (input.fio2 < 21 || input.fio2 > 100) {
      warnings.push("FiO₂ buiten 21–100% — P/F en A–a kunnen misleidend zijn.");
    }
    pfRatio = computePfRatio(input.pao2, input.fio2);
    aaGradient = computeAaGradient(input.pao2, pco2, input.fio2);
    if (pfRatio < 300) summary.push(`P/F-ratio ${pfRatio} (<300: matige–ernstige oxygenatiestoornis).`);
    else summary.push(`P/F-ratio ${pfRatio}.`);
    summary.push(`A–a gradient ≈ ${aaGradient} mmHg (ruwe schatting bij Patm 760).`);
  }

  summary.unshift(
    status === "normal"
      ? `pH ${ph} (normaal bereik ${PH_LOW}–${PH_HIGH}).`
      : status === "acidemia"
        ? `Acidemie (pH ${ph}).`
        : `Alkalemie (pH ${ph}).`,
  );
  summary.push(`Primair: ${primaryDisorder}.`);
  if (compensationNote) summary.push(compensationNote);
  if (anionGapCorrected != null) {
    summary.push(
      `Anion gap ${anionGap}${anionGap !== anionGapCorrected ? ` → gecorrigeerd ${anionGapCorrected}` : ""} (ref ≈ ${AG_NORMAL}).`,
    );
  }
  if (deltaGapInterpretation) summary.push(deltaGapInterpretation);

  return {
    phStatus: status,
    primaryDisorder,
    disorders: [...new Set(disorders)],
    anionGap,
    anionGapCorrected,
    elevatedAnionGap,
    expectedPco2,
    expectedHco3,
    compensationNote,
    deltaGap,
    deltaGapInterpretation,
    pfRatio,
    aaGradient,
    summary,
    warnings,
  };
}
