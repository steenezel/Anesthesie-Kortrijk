import { Switch, Route, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import { Lock, ShieldCheck } from "lucide-react";
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
import OnboardingSelection from "@/pages/onboarding-selection";
import Journalclub from "@/pages/journal-list";
import JournalDetail from "@/pages/journal-detail";
import WordlePage from "./pages/WordlePage";
import { BottomNav } from "@/components/bottom-nav";
import SedationCalculatorPage from "@/pages/sedation-peds";
import PocusList from "@/pages/pocus-list";
import PocusDetail from "@/pages/pocus-detail";
import Marketplace from "@/pages/marketplace";
import PainPumpPage from "@/pages/painpump";
import CapriniCalculator from "@/pages/caprini";
import AdminEditor from "@/pages/admin-editor";

// --- AUTH GUARD COMPONENT ---
function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("pocus_auth");
    if (auth === "true") setIsAuthenticated(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.toLowerCase() === "stijn" || password.toLowerCase() === "steenezel") {
      localStorage.setItem("pocus_auth", "true");
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPassword("");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white font-sans">
        <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="text-center space-y-4">
            <div className="inline-flex p-4 rounded-3xl bg-blue-500/10 border border-blue-500/20 mb-4">
              <Lock className="w-12 h-12 text-blue-500" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter italic uppercase">Anesthesie<br/><span className="text-blue-500">Kortrijk</span></h1>
            <p className="text-slate-400 font-medium">Beveiligde toegang voor artsen en stagiairs.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Wachtwoord"
                className={`w-full h-16 bg-slate-900 border-2 rounded-2xl px-6 font-bold text-center text-xl transition-all outline-none focus:ring-4 focus:ring-blue-500/20 ${error ? 'border-red-500 animate-bounce' : 'border-slate-800 focus:border-blue-500'}`}
                autoFocus
              />
            </div>
            <button type="submit" className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-3">
              <ShieldCheck className="w-6 h-6" /> Toegang Verlenen
            </button>
            {error && <p className="text-center text-red-400 font-bold text-sm uppercase tracking-wider">Onjuist wachtwoord</p>}
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// --- ROUTER COMPONENT ---
function Router() {
  const [location] = useLocation();
  
  // Controleer of de huidige route de admin editor is
  // location is een string, dus we gebruiken startsWith om de TS-fout te voorkomen
  const isAdmin = location.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* DYNAMISCHE BREEDTE:
          Als isAdmin true is, halen we max-w-screen-md weg (max-w-none)
          zodat de editor de volledige breedte kan gebruiken.
      */}
      <main className={`
        container mx-auto px-4 pt-4 pb-24 transition-all duration-300
        ${isAdmin ? 'max-w-none w-full lg:px-12' : 'max-w-screen-md'}
      `}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/protocols" component={ProtocolList} />
          <Route path="/protocols/:id" component={ProtocolDetail} />
          <Route path="/blocks" component={Blocks} />
          <Route path="/blocks/:id" component={BlockDetail} />
          <Route path="/calculators" component={CalculatorList} />
          <Route path="/calculator/last" component={CalculatorPage} />
          <Route path="/calculator/apfel" component={ApfelCalculator} />
          <Route path="/calculator/peds" component={PedsCalculator} />
          <Route path="/calculator/dantroleen" component={DantroleenPage} />
          <Route path="/calculator/painpump" component={PainPumpPage} />
          <Route path="/contacts" component={ContactsPage} />
          <Route path="/game" component={GamePage} />
          <Route path="/search" component={SearchPage} />
          <Route path="/checklist" component={ChecklistPage} />
          <Route path="/info" component={InfoPage} />
          <Route path="/wordle" component={WordlePage} />
          <Route path="/onboarding" component={OnboardingSelection} /> 
          <Route path="/onboarding/:type" component={OnboardingPage} />
          <Route path="/journalclub" component={Journalclub} />
          <Route path="/journalclub/:id" component={JournalDetail} />
          <Route path="/calculator/sedation-peds" component={SedationCalculatorPage} />
          <Route path="/pocus" component={PocusList} />
          <Route path="/pocus/:id" component={PocusDetail} />
          <Route path="/marketplace" component={Marketplace} />
          <Route path="/calculator/caprini" component={CapriniCalculator} />
          <Route path="/admin" component={AdminEditor} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <BottomNav />
    </div>
  );
}

// --- HOOFD APP ---
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Analytics />
      <AuthGuard>
        <Router />
      </AuthGuard>
    </QueryClientProvider>
  );
}

export default App;