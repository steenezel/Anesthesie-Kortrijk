import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { BottomNav } from "@/components/bottom-nav"; // Je navigatiebalk
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ProtocolsPage from "@/pages/protocols";
import BlocksPage from "@/pages/blocks";
import CalculatorsHub from "@/pages/calculators"; 
import LastCalculator from "@/pages/calculators/last";
import ApfelScore from "@/pages/calculators/apfel";
import ContactsPage from "@/pages/contacts";
import OnboardingPage from "@/pages/onboarding";
import GamePage from "@/pages/game";

function Router() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20"> {/* pb-20 maakt ruimte voor de BottomNav */}
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/protocols" component={ProtocolsPage} />
        <Route path="/blocks" component={BlocksPage} />
        <Route path="/calculators" component={CalculatorsHub} />
        <Route path="/calculators/last" component={LastCalculator} />
        <Route path="/calculators/apfel" component={ApfelScore} />
        <Route path="/contacts" component={ContactsPage} />
        <Route path="/onboarding" component={OnboardingPage} />
        <Route path="/game" component={GamePage} />
        
        {/* Fallback naar 404 */}
        <Route component={NotFound} />
      </Switch>
      
      {/* Navigatiebalk staat hier: altijd bereikbaar */}
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster /> {/* Voor meldingen zoals "Gekopieerd naar klembord" */}
    </QueryClientProvider>
  );
}

export default App;
