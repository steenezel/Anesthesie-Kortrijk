import { Link, useLocation } from "wouter";
import { Home, Calculator, Phone, BookOpen, GraduationCap } from "lucide-react";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/protocols", icon: BookOpen, label: "Protocollen" },
    { href: "/calculator", icon: Calculator, label: "Calculator" },
    { href: "/contacts", icon: Phone, label: "Lijst" },
    { href: "/onboarding", icon: GraduationCap, label: "Onboard" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 pb-safe z-50">
      <div className="max-w-2xl mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${isActive ? 'text-teal-600' : 'text-slate-400'}`}>
                <item.icon className={`h-5 w-5 ${isActive ? 'fill-teal-50' : ''}`} />
                <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}