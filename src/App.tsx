import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Schedule from "./pages/Schedule";
import Patients from "./pages/Patients";
import Medications from "./pages/Medications";
import Calculator from "./pages/Calculator";
import Profile from "./pages/Profile";
import NursingNotes from "./pages/NursingNotes";
import VitalSigns from "./pages/VitalSigns";
import More from "./pages/More";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import About from "./pages/About";
import Checklists from "./pages/Checklists";
import Admin from "./pages/Admin";
import Subscription from "./pages/Subscription";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import '@/i18n';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/schedule" element={<Schedule />} />
                      <Route path="/patients" element={<Patients />} />
                      <Route path="/medications" element={<Medications />} />
                      <Route path="/calculator" element={<Calculator />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/nursing-notes" element={<NursingNotes />} />
                      <Route path="/vital-signs" element={<VitalSigns />} />
                      <Route path="/checklists" element={<Checklists />} />
                      <Route path="/admin" element={<Admin />} />
                      <Route path="/subscription" element={<Subscription />} />
                      <Route path="/more" element={<More />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
