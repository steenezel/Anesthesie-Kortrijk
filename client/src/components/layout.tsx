import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Home, ClipboardList, Info as InfoIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/checklist", icon: ClipboardList, label: "Emergency" },
    { href: "/info", icon: InfoIcon, label: "Info" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans max-w-md mx-auto shadow-2xl overflow-hidden border-x border-border">
      
      {/* Header */}
      <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="BlockSafe Kortrijk Logo" className="h-10 w-10 object-contain" />
            <h1 className="text-xl font-heading font-bold text-foreground tracking-tight">
              BlockSafe Kortrijk
            </h1>
          </div>
          <div className="text-[10px] bg-secondary px-2 py-1 rounded-full font-mono text-muted-foreground border border-border">
            v1.0
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-24 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-border z-50 pb-safe max-w-md mx-auto">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 cursor-pointer",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}>
                  <item.icon className={cn("h-6 w-6", isActive && "fill-current opacity-20")} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={cn("text-[10px] font-medium", isActive ? "font-bold" : "")}>
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
