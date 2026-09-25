import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  AlertCircle,
  ChevronLeft,
  Activity,
  Droplets,
  Wind,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalculatorPageBookmark } from "@/components/CalculatorPageBookmark";
import {
  interpretAbg,
  type AbgInput,
  type AbgResult,
} from "@/utils/acid-base-calculator";

type FieldKey =
  | "ph"
  | "pco2"
  | "hco3"
  | "na"
  | "cl"
  | "albumin"
  | "pao2"
  | "fio2";

function parseOptional(raw: string): number | undefined {
  const t = raw.trim();
  if (!t) return undefined;
  const n = Number(t.replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

function statusBadge(result: AbgResult) {
  if (result.phStatus === "acidemia") {
    return { label: "Acidemie", className: "bg-rose-100 text-rose-800 border-rose-200" };
  }
  if (result.phStatus === "alkalemia") {
    return { label: "Alkalemie", className: "bg-sky-100 text-sky-800 border-sky-200" };
  }
  return { label: "Normale pH", className: "bg-emerald-100 text-emerald-800 border-emerald-200" };
}

export default function AcidBaseCalculator() {
  const [ph, setPh] = useState("7.40");
  const [pco2, setPco2] = useState("40");
  const [hco3, setHco3] = useState("24");
  const [na, setNa] = useState("");
  const [cl, setCl] = useState("");
  const [albumin, setAlbumin] = useState("40");
  const [pao2, setPao2] = useState("");
  const [fio2, setFio2] = useState("");
  const [chronicity, setChronicity] = useState<"acute" | "chronic">("acute");

  const setters: Record<FieldKey, (v: string) => void> = {
    ph: setPh,
    pco2: setPco2,
    hco3: setHco3,
    na: setNa,
    cl: setCl,
    albumin: setAlbumin,
    pao2: setPao2,
    fio2: setFio2,
  };

  const values: Record<FieldKey, string> = {
    ph,
    pco2,
    hco3,
    na,
    cl,
    albumin,
    pao2,
    fio2,
  };

  const result = useMemo(() => {
    const phN = parseOptional(ph);
    const pco2N = parseOptional(pco2);
    const hco3N = parseOptional(hco3);
    if (phN == null || pco2N == null || hco3N == null) return null;

    const input: AbgInput = {
      ph: phN,
      pco2: pco2N,
      hco3: hco3N,
      na: parseOptional(na),
      cl: parseOptional(cl),
      albumin: parseOptional(albumin),
      pao2: parseOptional(pao2),
      fio2: parseOptional(fio2),
      chronicity,
    };
    return interpretAbg(input);
  }, [ph, pco2, hco3, na, cl, albumin, pao2, fio2, chronicity]);

  const badge = result ? statusBadge(result) : null;

  const field = (
    key: FieldKey,
    label: string,
    unit?: string,
    step = "0.1",
  ) => (
    <div className="space-y-1.5">
      <Label
        htmlFor={`abg-${key}`}
        className="text-[10px] font-black uppercase tracking-widest text-slate-500"
      >
        {label}
        {unit ? (
          <span className="ml-1 font-bold text-slate-400 normal-case tracking-normal">
            ({unit})
          </span>
        ) : null}
      </Label>
      <Input
        id={`abg-${key}`}
        inputMode="decimal"
        type="text"
        step={step}
        value={values[key]}
        onChange={(e) => setters[key](e.target.value)}
        className="h-11 rounded-xl border-slate-200 font-bold text-slate-800"
        placeholder="—"
      />
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      <CalculatorPageBookmark calculatorId="acid-base" />
      <Link href="/calculator">
        <a className="flex items-center text-teal-600 font-bold uppercase text-xs tracking-widest">
          <ChevronLeft className="h-4 w-4" /> Terug naar overzicht
        </a>
      </Link>

      <Card className="border-slate-200 shadow-xl overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-br from-teal-50 to-slate-50/80">
          <div className="flex items-start gap-3">
            <div className="bg-teal-100 p-2.5 rounded-xl shadow-sm">
              <Activity className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-black uppercase tracking-tighter text-slate-900">
                Zuur-Base & ABG
              </CardTitle>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                Interpretatie · Anion gap · Compensatie
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-8">
          {/* Kern ABG */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-slate-700">
              <Droplets className="h-4 w-4 text-teal-600" />
              <h3 className="text-xs font-black uppercase tracking-widest">
                Arterieel bloedgas
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {field("ph", "pH")}
              {field("pco2", "PCO₂", "mmHg", "1")}
              {field("hco3", "HCO₃", "mmol/L", "0.1")}
            </div>
          </section>

          {/* Elektrolyten */}
          <section className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-700">
              Elektrolyten (optioneel)
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {field("na", "Na⁺", "mmol/L", "1")}
              {field("cl", "Cl⁻", "mmol/L", "1")}
              {field("albumin", "Albumine", "g/L", "1")}
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Albumine standaard 40 g/L voor AG-correctie (Figge).
            </p>
          </section>

          {/* Oxygenatie */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-slate-700">
              <Wind className="h-4 w-4 text-teal-600" />
              <h3 className="text-xs font-black uppercase tracking-widest">
                Oxygenatie (optioneel)
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {field("pao2", "PaO₂", "mmHg", "1")}
              {field("fio2", "FiO₂", "%", "1")}
            </div>
          </section>

          {/* Chronischheid */}
          <section className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-700">
              Respiratoire stoornis
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: "acute" as const, label: "Acuut" },
                  { id: "chronic" as const, label: "Chronisch" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setChronicity(opt.id)}
                  className={`p-3 rounded-xl border-2 text-xs font-black uppercase tracking-widest transition-all ${
                    chronicity === opt.id
                      ? "border-teal-600 bg-teal-50 text-teal-800"
                      : "border-slate-100 text-slate-500"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Bepaalt de verwachte HCO₃-compensatie bij primaire respiratoire stoornissen.
            </p>
          </section>

          {/* Resultaat */}
          {result && (
            <div className="space-y-4">
              <div className="p-6 bg-slate-900 rounded-2xl text-white shadow-inner space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  {badge && (
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
                    Primair proces
                  </p>
                  <p className="text-lg font-black leading-snug text-teal-300">
                    {result.primaryDisorder}
                  </p>
                </div>

                {result.disorders.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {result.disorders.map((d) => (
                      <span
                        key={d}
                        className="text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                )}

                <ul className="space-y-1.5 pt-2 border-t border-slate-700">
                  {result.summary.map((line, i) => (
                    <li key={i} className="text-xs text-slate-300 leading-relaxed">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-2 gap-2">
                {result.anionGapCorrected != null && (
                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      Anion gap
                    </p>
                    <p className="text-xl font-black text-slate-800">
                      {result.anionGapCorrected}
                      <span className="text-xs font-bold text-slate-400 ml-1">
                        {result.elevatedAnionGap ? "↑" : "norm"}
                      </span>
                    </p>
                    {result.anionGap != null &&
                      result.anionGap !== result.anionGapCorrected && (
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Ruwe AG {result.anionGap}
                        </p>
                      )}
                  </div>
                )}
                {result.deltaGap != null && (
                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      Delta / delta
                    </p>
                    <p className="text-xl font-black text-slate-800">{result.deltaGap}</p>
                  </div>
                )}
                {result.expectedPco2 && (
                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 col-span-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      Verwachte PCO₂
                    </p>
                    <p className="text-lg font-black text-slate-800">
                      {result.expectedPco2.low}–{result.expectedPco2.high}{" "}
                      <span className="text-sm font-bold text-slate-400">
                        (mid {result.expectedPco2.mid})
                      </span>
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {result.expectedPco2.formula}
                    </p>
                  </div>
                )}
                {result.expectedHco3 && (
                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 col-span-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      Verwachte HCO₃
                    </p>
                    <p className="text-lg font-black text-slate-800">
                      {result.expectedHco3.low}–{result.expectedHco3.high}{" "}
                      <span className="text-sm font-bold text-slate-400">
                        (mid {result.expectedHco3.mid})
                      </span>
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {result.expectedHco3.formula}
                    </p>
                  </div>
                )}
                {result.pfRatio != null && (
                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      P/F-ratio
                    </p>
                    <p className="text-xl font-black text-slate-800">{result.pfRatio}</p>
                  </div>
                )}
                {result.aaGradient != null && (
                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      A–a gradient
                    </p>
                    <p className="text-xl font-black text-slate-800">
                      {result.aaGradient}
                      <span className="text-xs font-bold text-slate-400 ml-1">mmHg</span>
                    </p>
                  </div>
                )}
              </div>

              {result.warnings.length > 0 && (
                <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                  <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
                  <ul className="space-y-1">
                    {result.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {!result && (
            <div className="flex gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 text-xs">
              <AlertCircle className="h-5 w-5 shrink-0 text-slate-400" />
              <p>Vul minstens pH, PCO₂ en HCO₃ in voor interpretatie.</p>
            </div>
          )}

          <div className="flex gap-3 p-4 bg-teal-50 border border-teal-100 rounded-xl text-teal-900 text-xs">
            <AlertCircle className="h-5 w-5 shrink-0 text-teal-600" />
            <p>
              Beslissingssteun — geen vervanging voor klinische correlatie. Formules:
              Winter (met. acidose), acute/chronische respiratoire regels, AG +
              albuminecorrectie, Δ/Δ, A–a bij Patm 760 mmHg.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
