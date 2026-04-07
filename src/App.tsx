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
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
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
