import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import MyNumbers from "./pages/MyNumbers";
import CustomerAccount from "./pages/CustomerAccount";
import AdminAuth from "./pages/admin/AdminAuth";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRaffle from "./pages/admin/AdminRaffle";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminDraw from "./pages/admin/AdminDraw";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/conta" element={<CustomerAccount />} />
            <Route path="/meus-numeros" element={<MyNumbers />} />
            
            {/* Admin auth */}
            <Route path="/admin/login" element={<AdminAuth />} />
            
            {/* Admin protected routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="rifa" element={<AdminRaffle />} />
              <Route path="pagamentos" element={<AdminPayments />} />
              <Route path="sorteio" element={<AdminDraw />} />
            </Route>
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
