import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Suspense, lazy } from "react";
import Index from "./pages/Index";
import { ReferralTracker } from "@/components/ReferralTracker";
import { AdminRoute } from "@/components/AdminRoute";
import { Loader2 } from "lucide-react";

// Lazy load pages
const MyNumbers = lazy(() => import("./pages/MyNumbers"));
const Rankings = lazy(() => import("./pages/Rankings"));
const CustomerAccount = lazy(() => import("./pages/CustomerAccount"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy load admin pages
const AdminAuth = lazy(() => import("./pages/admin/AdminAuth"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminRaffle = lazy(() => import("./pages/admin/AdminRaffle"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments"));
const AdminDraw = lazy(() => import("./pages/admin/AdminDraw"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminReferralSettings = lazy(() => import("./pages/admin/AdminReferralSettings"));
const AdminRankings = lazy(() => import("./pages/admin/AdminRankings"));
const OrganizerSettings = lazy(() => import("./pages/admin/OrganizerSettings"));
const OrganizerSignup = lazy(() => import("./pages/OrganizerSignup"));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="h-screen w-full flex items-center justify-center bg-slot-background">
    <Loader2 className="h-10 w-10 animate-spin text-gold" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ReferralTracker />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/conta" element={<CustomerAccount />} />
              <Route path="/meus-numeros" element={<MyNumbers />} />
              <Route path="/rankings" element={<Rankings />} />

              {/* Admin auth */}
              <Route path="/admin/login" element={<AdminAuth />} />

              {/* Admin protected routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="rifa" element={<AdminRaffle />} />
                  <Route path="pagamentos" element={<AdminPayments />} />
                  <Route path="sorteio" element={<AdminDraw />} />
                  <Route path="clientes" element={<AdminCustomers />} />
                  <Route path="rankings" element={<AdminRankings />} />
                  <Route path="referral-settings" element={<AdminReferralSettings />} />
                  <Route path="settings" element={<OrganizerSettings />} />
                </Route>
              </Route>

              <Route path="/signup-organizer" element={<OrganizerSignup />} />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
