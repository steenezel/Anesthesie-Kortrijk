import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { BottomNav } from "@/components/bottom-nav"; 
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ProtocolsPage from "@/pages/protocols"; // Dit zoekt naar /protocols/index.tsx
import DisciplineDetail from "@/pages/protocols/DisciplineDetail"; // NIEUW: De ontbrekende import
import BlocksPage from "@/pages/blocks";
import CalculatorsHub from "@/pages/calculators"; 
import LastCalculator from "@/pages/calculators/last";
import ApfelScore from "@/pages/calculators/apfel";
import ContactsPage from "@/pages/contacts";
import OnboardingPage from "@/pages/onboarding";
import GamePage from "@/pages/game";

function Router() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Switch>
        <Route path="/" component={Home} />
        
        {/* Protocol Routes */}
        <Route path="/protocols" component={ProtocolsPage} />
        <Route path="/protocols/:discipline" component={DisciplineDetail} />
        
        <Route path="/blocks" component={BlocksPage} />
        <Route path="/calculators" component={CalculatorsHub} />
        <Route path="/calculators/last" component={LastCalculator} />
        <Route path="/calculators/apfel" component={ApfelScore} />
        <Route path="/contacts" component={ContactsPage} />
        <Route path="/onboarding" component={OnboardingPage} />
        <Route path="/game" component={GamePage} />
        
        <Route component={NotFound} />
      </Switch>
      
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    // Verander 'client={client}' naar 'client={queryClient}'
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;