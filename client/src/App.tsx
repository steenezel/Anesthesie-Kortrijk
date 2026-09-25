import { Switch, Route, useLocation } from "wouter";
import { useEffect, lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import { Loader2 } from "lucide-react";
import Home from "@/pages/home";
import ProtocolDetail from "@/pages/protocol-detail";
import ProtocolList from "./pages/protocol-list";
import Blocks from "@/pages/blocks";
import BlockDetail from "@/pages/block-detail";
import ReferenceHubPage from "@/pages/reference-hub";
import ReferenceDermatomesPage from "@/pages/reference-dermatomes";
import ReferenceOsteotomesPage from "@/pages/reference-osteotomes";
import ReferenceInnervatiePage from "@/pages/reference-innervatie";
import ReferencePlexusListPage from "@/pages/reference-plexus-list";
import ReferencePlexusDetailPage from "@/pages/reference-plexus-detail";

/** Lazy: houdt de EDRA-vragenbank buiten de main PWA-precache bundle. */
const KaraQuizPage = lazy(() => import("@/pages/kara-quiz"));
import CalculatorPage from "@/pages/last";
import CalculatorList from "@/pages/calculator-list";
import ApfelCalculator from "@/pages/apfel";
import PedsCalculator from "@/pages/peds-calculator";
import DantroleenPage from "@/pages/dantroleen.js";
import ChecklistPage from "@/pages/checklist";
import NotFound from "@/pages/not-found";
import ContactsPage from "@/pages/contacts";
import GamePage from "@/pages/game";
import SearchPage from "@/pages/search";
import OnboardingPage from "@/pages/onboarding";
import OnboardingSelection from "@/pages/onboarding-selection";
import Journalclub from "@/pages/journal-list";
import JournalDetail from "@/pages/journal-detail";
import WordlePage from "./pages/WordlePage";
import ChassePatatePage from "./pages/ChassePatatePage";
import { BottomNav } from "@/components/bottom-nav";
import SedationCalculatorPage from "@/pages/sedation-peds";
import PocusList from "@/pages/pocus-list";
import PocusDetail from "@/pages/pocus-detail";
import Marketplace from "@/pages/marketplace";
import PainPumpPage from "@/pages/painpump";
import CapriniCalculator from "@/pages/caprini";
import AcidBaseCalculator from "@/pages/acid-base";
import AdminEditor from "@/pages/admin-editor";
import LogbookPage from "@/pages/logbook";
import SpinalLogbookPage from "@/pages/SpinalLogbookPage";
import SettingsPage from "@/pages/settings";
import { PwaUpdateListener } from "@/components/PwaUpdateListener";
import { SiteProvider } from "@/hooks/use-site";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { LoginScreen } from "@/components/LoginScreen";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-[9999]">
        <Loader2 className="h-8 w-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <>{children}</>;
}

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [location]);

  return null;
}

function Router() {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");
  const { isKiosk } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ScrollToTop />
      {isKiosk && (
        <div className="bg-amber-500 text-amber-950 text-center text-[10px] font-black uppercase tracking-widest py-1.5 px-3">
          Kiosk-modus — alleen lezen (geen logboek/schrijven)
        </div>
      )}
      <main
        className={`
        container mx-auto px-4 pt-[calc(1rem+env(safe-area-inset-top,0px))] pb-24 transition-all duration-300
        ${isAdmin ? "max-w-none w-full lg:px-12" : "max-w-screen-md"}
      `}
      >
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/protocols" component={ProtocolList} />
          <Route path="/protocols/:id" component={ProtocolDetail} />
          <Route path="/blocks/referentie/dermatomen" component={ReferenceDermatomesPage} />
          <Route path="/blocks/referentie/osteotomen" component={ReferenceOsteotomesPage} />
          <Route path="/blocks/referentie/innervatie" component={ReferenceInnervatiePage} />
          <Route path="/blocks/referentie/plexus/:id" component={ReferencePlexusDetailPage} />
          <Route path="/blocks/referentie/plexus" component={ReferencePlexusListPage} />
          <Route path="/blocks/referentie" component={ReferenceHubPage} />
          <Route path="/blocks/quiz">
            <Suspense
              fallback={
                <div className="flex min-h-[40vh] items-center justify-center text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              }
            >
              <KaraQuizPage />
            </Suspense>
          </Route>
          <Route path="/blocks/:id" component={BlockDetail} />
          <Route path="/blocks" component={Blocks} />
          <Route path="/calculator" component={CalculatorList} />
          <Route path="/smash" component={SpinalLogbookPage} />
          <Route path="/calculators/spinal-logbook" component={SpinalLogbookPage} />
          <Route path="/calculator/spinal-logbook" component={SpinalLogbookPage} />
          <Route path="/calculators" component={CalculatorList} />
          <Route path="/calculator/last" component={CalculatorPage} />
          <Route path="/calculator/apfel" component={ApfelCalculator} />
          <Route path="/calculator/peds" component={PedsCalculator} />
          <Route path="/calculator/peds-calculator" component={PedsCalculator} />
          <Route path="/calculator/dantroleen" component={DantroleenPage} />
          <Route path="/calculator/painpump" component={PainPumpPage} />
          <Route path="/contacts" component={ContactsPage} />
          <Route path="/game" component={GamePage} />
          <Route path="/search" component={SearchPage} />
          <Route path="/checklist" component={ChecklistPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route path="/wordle" component={WordlePage} />
          <Route path="/chasse-patate" component={ChassePatatePage} />
          <Route path="/onboarding" component={OnboardingSelection} />
          <Route path="/onboarding/:type" component={OnboardingPage} />
          <Route path="/journalclub" component={Journalclub} />
          <Route path="/journalclub/:id" component={JournalDetail} />
          <Route path="/calculator/sedation-peds" component={SedationCalculatorPage} />
          <Route path="/pocus" component={PocusList} />
          <Route path="/pocus/:id" component={PocusDetail} />
          <Route path="/marketplace" component={Marketplace} />
          <Route path="/logbook" component={LogbookPage} />
          <Route path="/calculator/caprini" component={CapriniCalculator} />
          <Route path="/calculator/acid-base" component={AcidBaseCalculator} />
          <Route path="/admin" component={AdminEditor} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SiteProvider>
        <AuthProvider>
          <Toaster />
          <PwaUpdateListener />
          <Analytics />
          <AuthGuard>
            <Router />
          </AuthGuard>
        </AuthProvider>
      </SiteProvider>
    </QueryClientProvider>
  );
}

export default App;
