import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import DailyLog from "@/pages/DailyLog";
import MyMeals from "@/pages/MyMeals";
import AIAssistant from "@/pages/AIAssistant";
import Statistics from "@/pages/Statistics";
import Profile from "@/pages/Profile";
import AuthPage from "@/pages/auth-page";
import Header from "@/components/Header";
import MobileNavigation from "@/components/MobileNavigation";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/daily-log" component={DailyLog} />
      <ProtectedRoute path="/my-meals" component={MyMeals} />
      <ProtectedRoute path="/ai-assistant" component={AIAssistant} />
      <ProtectedRoute path="/statistics" component={Statistics} />
      <ProtectedRoute path="/profile" component={Profile} />
      <Route path="/auth" component={AuthPage} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex flex-col h-screen">
          <Header />
          <main className="flex-1 overflow-auto pb-20 md:pb-6 bg-gray-50">
            <Router />
          </main>
          <MobileNavigation />
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
