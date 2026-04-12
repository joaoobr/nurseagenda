import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import SubscriptionGate from "@/components/SubscriptionGate";
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
import { initDeepLinkListener } from '@/lib/deepLinks';

const queryClient = new QueryClient();

const DeepLinkHandler = () => {
  const navigate = useNavigate();
  useEffect(() => {
    initDeepLinkListener(navigate);
  }, [navigate]);
  return null;
};

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
                      {/* Free routes - always accessible */}
                      <Route path="/" element={<Index />} />
                      <Route path="/subscription" element={<Subscription />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/more" element={<More />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/admin" element={<Admin />} />

                      {/* Premium routes - gated by subscription */}
                      <Route path="/schedule" element={<SubscriptionGate><Schedule /></SubscriptionGate>} />
                      <Route path="/patients" element={<SubscriptionGate><Patients /></SubscriptionGate>} />
                      <Route path="/medications" element={<SubscriptionGate><Medications /></SubscriptionGate>} />
                      <Route path="/calculator" element={<SubscriptionGate><Calculator /></SubscriptionGate>} />
                      <Route path="/nursing-notes" element={<SubscriptionGate><NursingNotes /></SubscriptionGate>} />
                      <Route path="/vital-signs" element={<SubscriptionGate><VitalSigns /></SubscriptionGate>} />
                      <Route path="/checklists" element={<SubscriptionGate><Checklists /></SubscriptionGate>} />

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
