import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/layout";
import { Analytics } from "@vercel/analytics/react";
import Home from "@/pages/home";
import ProtocolDetail from "@/pages/protocol-detail";
import ProtocolList from "./pages/protocol-list";
import Blocks from "@/pages/blocks";
import BlockDetail from "@/pages/block-detail";
import CalculatorPage from "@/pages/last";
import CalculatorList from "@/pages/calculator-list";
import ApfelCalculator from "@/pages/apfel";
import ChecklistPage from "@/pages/checklist";
import InfoPage from "@/pages/info";
import NotFound from "@/pages/not-found";
import ContactsPage from "@/pages/contacts";
import GamePage from "@/pages/game";
import OnboardingPage from "@/pages/onboarding";
import { BottomNav } from "@/components/bottom-nav";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 max-w-2xl mx-auto w-full">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/protocols" component={ProtocolList} />
          <Route path="/protocols/:path*" component={ProtocolDetail} />
          <Route path="/blocks" component={Blocks} />
          <Route path="/blocks/:id" component={BlockDetail} />
          <Route path="/calculator" component={CalculatorList} /> {/* De Hub */}
          <Route path="/calculator/last" component={CalculatorPage} /> {/* Je bestaande LAST */}
          <Route path="/calculator/apfel" component={ApfelCalculator} />
          <Route path="/contacts" component={ContactsPage} />
          <Route path="/game" component={GamePage} />
          <Route path="/checklist" component={ChecklistPage} />
          <Route path="/info" component={InfoPage} />
          <Route path="/onboarding" component={OnboardingPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <BottomNav /> {/* DIT MAAKT HET GLOBALE NAVIGATIE */}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Analytics />
      <Router />
    </QueryClientProvider>
  );
}

export default App;