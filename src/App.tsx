import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TemporalFinanceProvider } from "@/context/TemporalFinanceContext";
import { AppSidebar } from "@/components/temporal/AppSidebar";
import Dashboard from "./pages/Dashboard";
import Ledger from "./pages/Ledger";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TemporalFinanceProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="flex min-h-screen w-full bg-background">
              <AppSidebar />
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/ledger" element={<Ledger />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TemporalFinanceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
