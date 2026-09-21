import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { EDRA_QUIZ_BANK } from "@/data/quiz/questions";
import {
  pickQuizQuestions,
  reportQuizResult,
  shuffleQuestionOptions,
  type QuizProgressRow,
  type ShuffledQuestion,
} from "@/data/quiz/pick";
import {
  QUIZ_CATEGORIES,
  QUIZ_CATEGORY_LIST,
  QUIZ_ROUND_SIZE,
  type QuizCategoryId,
} from "@/data/quiz/types";

type FilterId = QuizCategoryId | "all";
type Phase = "setup" | "running" | "summary";

interface AnsweredItem {
  question: ShuffledQuestion;
  selectedIndex: number;
}

const LETTERS = ["A", "B", "C", "D"] as const;

export function KaraQuiz() {
  const [filter, setFilter] = useState<FilterId>("all");
  const [phase, setPhase] = useState<Phase>("setup");
  const [round, setRound] = useState<ShuffledQuestion[]>([]);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<AnsweredItem[]>([]);
  const [srsProgress, setSrsProgress] = useState<QuizProgressRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/quiz/progress", { credentials: "include" });
        if (!res.ok) return;
        const rows = (await res.json()) as QuizProgressRow[];
        if (!cancelled) setSrsProgress(rows);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const poolCount = useMemo(
    () => (filter === "all" ? EDRA_QUIZ_BANK.length : EDRA_QUIZ_BANK.filter((q) => q.category === filter).length),
    [filter]
  );

  const startRound = () => {
    const picked = pickQuizQuestions(EDRA_QUIZ_BANK, QUIZ_ROUND_SIZE, filter, srsProgress).map(
      shuffleQuestionOptions,
    );
    if (picked.length === 0) return;
    setRound(picked);
    setStep(0);
    setSelected(null);
    setAnswers([]);
    setPhase("running");
  };

  const commitAndAdvance = () => {
    if (selected === null) return;
    const current = round[step];
    const correct = selected === current.displayCorrectIndex;
    void reportQuizResult(current.id, correct);
    const nextAnswers = [...answers, { question: current, selectedIndex: selected }];
    if (step + 1 >= round.length) {
      setAnswers(nextAnswers);
      setPhase("summary");
      return;
    }
    setAnswers(nextAnswers);
    setStep(step + 1);
    setSelected(null);
  };

  if (phase === "setup") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">EDRA-oefenquiz</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Vijf originele SBA-vragen per ronde, over het EDRA-curriculum (anatomie, fysica, blocks, farmacologie,
            complicaties). Feedback volgt pas na de volledige ronde — zoals op het examen.
          </p>
        </div>

        <Card className="border-none shadow-sm rounded-2xl">
          <CardContent className="p-5 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Categorie</p>
            <div className="flex flex-wrap gap-2">
              <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label="Alles" />
              {QUIZ_CATEGORY_LIST.map(([id, label]) => (
                <FilterChip key={id} active={filter === id} onClick={() => setFilter(id)} label={label} />
              ))}
            </div>
            <p className="text-xs text-slate-500">
              {poolCount} vragen in deze selectie · {EDRA_QUIZ_BANK.length} in de volledige bank
            </p>
            <Button
              type="button"
              className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-xs"
              disabled={poolCount === 0}
              onClick={startRound}
            >
              Start ronde ({Math.min(QUIZ_ROUND_SIZE, poolCount)} vragen)
            </Button>
          </CardContent>
        </Card>

        <p className="text-[10px] text-slate-400 leading-relaxed">
          Oefenvragen voor interne opleiding, geen officiële ESRA-examenvragen. Niet overgenomen uit
          auteursrechtelijk beschermde MCQ-boeken.
        </p>
      </div>
    );
  }

  if (phase === "summary") {
    const score = answers.filter((item) => item.selectedIndex === item.question.displayCorrectIndex).length;
    const total = answers.length;

    return (
      <div className="space-y-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary mb-2">Ronde afgerond</p>
          <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">
            Score {score}/{total}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {score === total
              ? "Alle antwoorden juist. Hou dit tempo aan."
              : "Bekijk de toelichting bij elke vraag en start een nieuwe ronde."}
          </p>
        </div>

        <Progress value={(score / total) * 100} className="h-2.5" />

        <div className="space-y-3">
          {answers.map((item, index) => {
            const correct = item.selectedIndex === item.question.displayCorrectIndex;
            return (
              <Card key={item.question.id} className="border-none shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    {correct ? (
                      <CheckCircle2 className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 mb-1">
                        Vraag {index + 1} · {QUIZ_CATEGORIES[item.question.category]}
                      </p>
                      <p className="text-sm font-semibold text-slate-800 leading-snug">{item.question.stem}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 pl-8">
                    {item.question.displayOptions.map((option, optionIndex) => {
                      const isCorrect = optionIndex === item.question.displayCorrectIndex;
                      const isChosen = optionIndex === item.selectedIndex;
                      return (
                        <div
                          key={`${item.question.id}-${optionIndex}`}
                          className={cn(
                            "rounded-xl px-3 py-2 text-xs leading-snug",
                            isCorrect && "bg-teal-50 text-teal-900 font-semibold",
                            !isCorrect && isChosen && "bg-red-50 text-red-800",
                            !isCorrect && !isChosen && "bg-slate-50 text-slate-500"
                          )}
                        >
                          <span className="font-black mr-2">{LETTERS[optionIndex]}</span>
                          {option}
                          {isCorrect && <span className="ml-2 font-black uppercase tracking-widest text-[9px]">Juist</span>}
                          {!isCorrect && isChosen && (
                            <span className="ml-2 font-black uppercase tracking-widest text-[9px]">Jouw antwoord</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-8">{item.question.explanation}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Button
          type="button"
          className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-xs"
          onClick={startRound}
        >
          <RotateCcw className="h-4 w-4" /> Nog een ronde
        </Button>
        <button
          type="button"
          className="w-full text-[10px] font-black uppercase tracking-[0.2em] text-slate-400"
          onClick={() => setPhase("setup")}
        >
          Andere categorie
        </button>
      </div>
    );
  }

  const question = round[step];
  const progress = ((step + 1) / round.length) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">
            Vraag {step + 1} / {round.length}
          </p>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mt-1">
            {QUIZ_CATEGORIES[question.category]}
          </p>
        </div>
        <span className="text-xs font-black text-slate-300">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />

      <Card className="border-none shadow-sm rounded-2xl">
        <CardContent className="p-5 space-y-5">
          <p className="text-base font-semibold text-slate-900 leading-snug">{question.stem}</p>
          <div className="space-y-2">
            {question.displayOptions.map((option, index) => {
              const active = selected === index;
              return (
                <button
                  key={`${question.id}-${index}`}
                  type="button"
                  onClick={() => setSelected(index)}
                  className={cn(
                    "w-full text-left rounded-2xl px-4 py-3.5 flex items-start gap-3 transition-all border",
                    active
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-slate-50 text-slate-700 border-transparent hover:bg-slate-100"
                  )}
                >
                  {active ? (
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 mt-0.5 shrink-0 text-slate-300" />
                  )}
                  <span className="text-sm leading-snug">
                    <span className="font-black mr-2 text-[11px]">{LETTERS[index]}</span>
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
          <Button
            type="button"
            className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-xs"
            disabled={selected === null}
            onClick={commitAndAdvance}
          >
            {step + 1 >= round.length ? "Bekijk resultaat" : "Volgende vraag"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors",
        active ? "bg-primary text-primary-foreground" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
      )}
    >
      {label}
    </button>
  );
}
