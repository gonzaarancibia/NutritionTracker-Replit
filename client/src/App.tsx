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
import Header from "@/components/Header";
import MobileNavigation from "@/components/MobileNavigation";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard}/>
      <Route path="/daily-log" component={DailyLog}/>
      <Route path="/my-meals" component={MyMeals}/>
      <Route path="/ai-assistant" component={AIAssistant}/>
      <Route path="/statistics" component={Statistics}/>
      <Route path="/profile" component={Profile}/>
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col h-screen">
        <Header />
        <main className="flex-1 overflow-auto pb-20 md:pb-6 bg-gray-50">
          <Router />
        </main>
        <MobileNavigation />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
