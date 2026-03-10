// ============================================================
// App.tsx — B2G Intelligence Hub
// Routes: Dashboard / TenderSearch / StrategyRoom / KnowledgeBase
// Layout: Persistent sidebar navigation
// ============================================================

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import TenderSearch from "./pages/TenderSearch";
import StrategyRoom from "./pages/StrategyRoom";
import KnowledgeBase from "./pages/KnowledgeBase";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/tender" component={TenderSearch} />
        <Route path="/tender-search" component={TenderSearch} />
        <Route path="/strategy" component={StrategyRoom} />
        <Route path="/knowledge" component={KnowledgeBase} />
        <Route path="/notifications" component={Dashboard} />
        <Route path="/settings" component={Dashboard} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
