import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/AdminProtectedRoute"; // Importar AdminProtectedRoute
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import EmailConfirmationSuccess from "./pages/EmailConfirmationSuccess";
import LoginSuccess from "./pages/LoginSuccess"; // Importar a nova página de sucesso de login
import ClubAuth from "./pages/ClubAuth";
import AdminAuth from "./pages/AdminAuth"; // Importar AdminAuth
import AdminDashboard from "./pages/AdminDashboard"; // Importar AdminDashboard

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/club-auth" element={<ClubAuth />} />
            <Route path="/admin-auth" element={<AdminAuth />} /> {/* Nova rota para login de admin */}
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/email-confirmation-success" element={<EmailConfirmationSuccess />} />
            <Route path="/login-success" element={<LoginSuccess />} /> {/* Nova rota para sucesso de login */}
            
            <Route 
              path="/dashboard/*" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-dashboard/*" 
              element={
                <AdminProtectedRoute> {/* Proteger o dashboard de admin */}
                  <AdminDashboard />
                </AdminProtectedRoute>
              } 
            />
            <Route path="/404" element={<NotFound />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;