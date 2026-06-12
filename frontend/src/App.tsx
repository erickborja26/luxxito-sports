import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth, Role } from "@/context/AuthContext";
import { ReservasProvider } from "@/context/ReservasContext";
import { ReactNode } from "react";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AppLayout from "./components/layout/AppLayout";
import JugadorDashboard from "./pages/jugador/Dashboard";
import Disponibilidad from "./pages/jugador/Disponibilidad";
import Reservar from "./pages/jugador/Reservar";
import Comprobante from "./pages/jugador/Comprobante";
import Confirmacion from "./pages/jugador/Confirmacion";
import MisReservas from "./pages/jugador/MisReservas";
import AdminDashboard from "./pages/admin/Dashboard";
import Onboarding from "./pages/admin/Onboarding";
import Canchas from "./pages/admin/Canchas";
import Precios from "./pages/admin/Precios";
import ReservasAdmin from "./pages/admin/Reservas";
import Pagos from "./pages/admin/Pagos";
import Extras from "./pages/admin/Extras";
import Reportes from "./pages/admin/Reportes";
import Soporte from "./pages/soporte/Soporte";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const Guard = ({ roles, children }: { roles: Role[]; children: ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <ReservasProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />

            <Route element={<Guard roles={["jugador"]}><AppLayout /></Guard>}>
              <Route path="/jugador" element={<JugadorDashboard />} />
              <Route path="/jugador/disponibilidad" element={<Disponibilidad />} />
              <Route path="/jugador/reservar" element={<Reservar />} />
              <Route path="/jugador/comprobante" element={<Comprobante />} />
              <Route path="/jugador/confirmacion" element={<Confirmacion />} />
              <Route path="/jugador/reservas" element={<MisReservas />} />
            </Route>

            <Route element={<Guard roles={["admin"]}><AppLayout /></Guard>}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/onboarding" element={<Onboarding />} />
              <Route path="/admin/canchas" element={<Canchas />} />
              <Route path="/admin/precios" element={<Precios />} />
              <Route path="/admin/reservas" element={<ReservasAdmin />} />
              <Route path="/admin/pagos" element={<Pagos />} />
              <Route path="/admin/extras" element={<Extras />} />
              <Route path="/admin/reportes" element={<Reportes />} />
            </Route>

            <Route element={<Guard roles={["soporte"]}><AppLayout /></Guard>}>
              <Route path="/soporte" element={<Soporte />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </ReservasProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
