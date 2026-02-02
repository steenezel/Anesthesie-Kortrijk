import { Link } from "wouter";
import { ShieldAlert, UserCheck, ChevronRight } from "lucide-react";

export default function CalculatorsHub() {
  const tools = [
    { name: "LAST-Calculator", path: "/calculators/last", icon: <ShieldAlert />, color: "text-red-600" },
    { name: "Apfel-Score", path: "/calculators/apfel", icon: <UserCheck />, color: "text-teal-600" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Calculators</h1>
      <div className="grid gap-4">
        {tools.map((tool) => (
          <Link key={tool.path} href={tool.path}>
            <a className="flex items-center p-4 bg-white rounded-xl border border-slate-200 shadow-sm active:bg-slate-50 transition-colors">
              <div className={`mr-4 ${tool.color}`}>{tool.icon}</div>
              <span className="flex-1 font-medium text-slate-700">{tool.name}</span>
              <ChevronRight className="text-slate-300" />
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}