import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Schedule from "./pages/Schedule";
import Patients from "./pages/Patients";
import Medications from "./pages/Medications";
import Calculator from "./pages/Calculator";
import More from "./pages/More";
import NotFound from "./pages/NotFound";
import '@/i18n';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/medications" element={<Medications />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/more" element={<More />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
