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
import CalculatorPage from "@/pages/calculator";
import ChecklistPage from "@/pages/checklist";
import InfoPage from "@/pages/info";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    /* We hebben <Layout> verwijderd en vervangen door een eenvoudige container */
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/protocols" component={ProtocolList} />
        <Route path="/protocols/:discipline/:id" component={ProtocolDetail} />
        <Route path="/blocks" component={Blocks} />
        <Route path="/blocks/:id" component={BlockDetail} />
        <Route path="/calculator" component={CalculatorPage} />
        <Route path="/checklist" component={ChecklistPage} />
        <Route path="/info" component={InfoPage} />
        <Route component={NotFound} />
      </Switch>
    </main>
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
