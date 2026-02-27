import { Switch, Route, useLocation } from "wouter";
import { useState, useEffect } from "react"; // Toegevoegd voor de login
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import { Lock, ShieldCheck } from "lucide-react"; // Voor het login scherm
import Home from "@/pages/home";
import ProtocolDetail from "@/pages/protocol-detail";
import ProtocolList from "./pages/protocol-list";
import Blocks from "@/pages/blocks";
import BlockDetail from "@/pages/block-detail";
import CalculatorPage from "@/pages/last";
import CalculatorList from "@/pages/calculator-list";
import ApfelCalculator from "@/pages/apfel";
import PedsCalculator from "@/pages/peds-calculator";
import DantroleenPage from "@/pages/dantroleen.js";
import ChecklistPage from "@/pages/checklist";
import InfoPage from "@/pages/info";
import NotFound from "@/pages/not-found";
import ContactsPage from "@/pages/contacts";
import GamePage from "@/pages/game";
import SearchPage from "@/pages/search";
import OnboardingPage from "@/pages/onboarding";
import Journalclub from "@/pages/journal-list";
import JournalDetail from "@/pages/journal-detail";
import WordlePage from "./pages/WordlePage";
import { BottomNav } from "@/components/bottom-nav";
import SedationCalculatorPage from "@/pages/sedation-peds";


// --- DE BEWAKER (AuthGuard) ---
function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  // STEL HIER DE PINCODE IN
  const CORRECT_PIN = import.meta.env.VITE_APP_PIN; // Code is ingesteld in Vercel/Settings/Environment Variables VITE_APP_PIN 

  useEffect(() => {
    // Kijken of we al ingelogd zijn in deze browser
    const authStatus = localStorage.getItem("ane_kortrijk_auth");
    if (authStatus === "true") setIsAuthenticated(true);
  }, []);

  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault(); // Voorkom dat de pagina herlaadt
    if (pin === CORRECT_PIN) {
      localStorage.setItem("ane_kortrijk_auth", "true");
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPin("");
      // Vibratie op mobiel bij foutieve code (indien ondersteund)
      if (navigator.vibrate) navigator.vibrate(200);
    }
  };

  if (!isAuthenticated) {
    return (
        <div className="fixed inset-0 bg-slate-950 flex flex-col justify-center items-center z-[9999] px-6 pt-[env(safe-area-inset-top)]">
        <div className="w-full max-w-sm space-y-10 mx-auto">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-teal-500/10 rounded-3xl flex items-center justify-center mb-6 border border-teal-500/20">
              <Lock className="h-8 w-8 text-teal-500" />
            </div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
              ANE <span className="text-teal-500">Kortrijk</span>
            </h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Medical Access Only</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="PINCODE"
                className={`w-full h-20 text-center text-4xl font-mono tracking-[0.5em] rounded-3xl bg-slate-900 border-2 transition-all ${
                  error ? 'border-red-500 text-red-500 animate-shake' : 'border-slate-800 text-white focus:border-teal-500'
                } focus:outline-none shadow-2xl`}
                autoFocus
              />
            </div>
            
            <button 
              type="submit"
              className="w-full h-16 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="h-5 w-5" /> Inloggen
            </button>
            
            {error && (
              <p className="text-red-500 text-[10px] font-black uppercase text-center tracking-widest animate-in fade-in slide-in-from-top-1">
                Toegang geweigerd
              </p>
            )}
          </form>
          
          <p className="text-center text-slate-600 text-[9px] uppercase font-medium tracking-widest">
            AZ Groeninge • Anesthesie & Reanimatie
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    // We gebruiken een kleine timeout om de browser de tijd te geven
    // de nieuwe pagina-inhoud te laden voordat we scrollen.
    const timer = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant", // "instant" voorkomt dat je de pagina ziet omhoog glijden
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [location]); // Telkens als 'location' verandert, start dit effect

  return null; // Deze component toont niets op het scherm
}

// --- DE ROUTER ---
function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 px-4 pb-6 sm:px-6 lg:px-8 max-w-2xl mx-auto w-full pt-[max(20px,env(safe-area-inset-top))]">
        <ScrollToTop /> {/* Zorgt voor de reset bij elke paginawissel */}
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/protocols" component={ProtocolList} />
          <Route path="/protocols/:id" component={ProtocolDetail} />
          <Route path="/blocks" component={Blocks} />
          <Route path="/blocks/:id" component={BlockDetail} />
          <Route path="/calculator" component={CalculatorList} />
          <Route path="/calculator/last" component={CalculatorPage} />
          <Route path="/calculator/apfel" component={ApfelCalculator} />
          <Route path="/calculator/peds-calculator" component={PedsCalculator} />
          <Route path="/calculator/dantroleen" component={DantroleenPage} />
          <Route path="/contacts" component={ContactsPage} />
          <Route path="/game" component={GamePage} />
          <Route path="/search" component={SearchPage} />
          <Route path="/checklist" component={ChecklistPage} />
          <Route path="/info" component={InfoPage} />
          <Route path="/wordle" component={WordlePage} />
          <Route path="/onboarding" component={OnboardingPage} />
          <Route path="/journalclub" component={Journalclub} />
          <Route path="/journalclub/:id" component={JournalDetail} />
          <Route path="/calculator/sedation-peds" component={SedationCalculatorPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <BottomNav />
    </div>
  );
}



// --- DE HOOFD APP ---
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Analytics />
      {/* We wikkelen de Router in de AuthGuard */}
      <AuthGuard>
        <Router />
      </AuthGuard>
    </QueryClientProvider>
  );
}

export default App;