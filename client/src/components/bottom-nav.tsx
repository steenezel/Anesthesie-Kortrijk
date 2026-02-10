import { Link, useLocation } from "wouter";
import { Home, Calculator, Phone, BookOpen, GraduationCap, Crosshair } from "lucide-react";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/protocols", icon: BookOpen, label: "Protocollen" },
    { href: "/blocks", icon: Crosshair, label: "Blocks" }, // Nieuwe toevoeging
    { href: "/calculator", icon: Calculator, label: "Calculators" },
    { href: "/contacts", icon: Phone, label: "Lijst" },
    { href: "/onboarding", icon: GraduationCap, label: "Onboard" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 pb-safe z-50">
      <div className="max-w-2xl mx-auto flex justify-around items-center h-16 px-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon; // We slaan het icoon even op in een variabele met hoofdletter

          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${isActive ? 'text-teal-600' : 'text-slate-400'}`}>
                <Icon className={`h-5 w-5 ${isActive ? 'fill-teal-50' : ''}`} />
                <span className="text-[9px] font-black uppercase tracking-tighter whitespace-nowrap">
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}