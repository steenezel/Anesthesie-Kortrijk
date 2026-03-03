import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Briefcase, ChevronRight, ChevronLeft } from "lucide-react";

export default function OnboardingSelection() {
  const choices = [
    {
      id: "staf",
      title: "Onboarding Staf",
      description: "Voor nieuwe stafleden en residenten",
      path: "/onboarding/staf", // we mappen 'staf' later aan onboarding.md
      icon: <Briefcase className="h-6 w-6 text-teal-600" />,
      color: "border-teal-100 bg-teal-50"
    },
    {
      id: "aso",
      title: "Onboarding ASO",
      description: "Specifieke info voor assistenten (ASO/mso)",
      path: "/onboarding/aso", // we mappen 'aso' later aan onboarding-aso.md
      icon: <GraduationCap className="h-6 w-6 text-blue-600" />,
      color: "border-blue-100 bg-blue-50"
    }
  ];

  return (
    <div className="space-y-6 pb-24 px-4 animate-in fade-in duration-700">
      <Link href="/">
        <div className="flex items-center text-slate-400 font-black uppercase text-[10px] tracking-widest cursor-pointer py-2 group">
          <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 
          Terug naar Home
        </div>
      </Link>
      
      <header className="mb-8">
        <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900">
          On<span className="text-teal-600">boarding</span>
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Maak je keuze
        </p>
      </header>

      <div className="grid gap-4">
        {choices.map((choice) => (
          <Link key={choice.id} href={choice.path}>
            <Card className={`cursor-pointer border-2 transition-all active:scale-[0.98] ${choice.color}`}>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-2xl shadow-sm">
                    {choice.icon}
                  </div>
                  <div>
                    <h2 className="font-black text-slate-900 uppercase tracking-tight text-lg">
                      {choice.title}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      {choice.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-slate-300" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
