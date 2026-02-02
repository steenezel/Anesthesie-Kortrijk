import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert, apple, ChevronRight } from "lucide-react";

const calculators = [
  {
    id: "last",
    title: "LAST-Calculator",
    description: "Toxiciteit lokale anesthetica",
    path: "/calculator/last",
    icon: <ShieldAlert className="h-6 w-6 text-red-500" />,
    color: "border-red-100 bg-red-50"
  },
  {
    id: "apfel",
    title: "Apfel-Score",
    description: "Risico op PONV",
    path: "/calculator/apfel",
    icon: <apple className="h-6 w-6 text-blue-600" />,
    color: "border-blue-100 bg-blue-50"
  }
];

export default function CalculatorList() {
  return (
    <div className="space-y-6 pb-20">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900">
          Calculators
        </h1>
        <p className="text-slate-500 text-sm italic">
          Klinische beslissingssteun
        </p>
      </div>

      <div className="grid gap-4">
        {calculators.map((calc) => (
          <Link key={calc.id} href={calc.path}>
            <Card className={`cursor-pointer border-2 transition-all hover:shadow-md active:scale-[0.98] ${calc.color}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    {calc.icon}
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800 uppercase tracking-tight">
                      {calc.title}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      {calc.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}