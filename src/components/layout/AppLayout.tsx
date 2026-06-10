import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth, Role } from "@/context/AuthContext";
import {
  LayoutDashboard, Calendar, Trophy,
  BarChart3, LogOut, Menu, X, Building2, Activity, DollarSign, Package, Receipt
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const menus: Record<Role, { to: string; label: string; icon: LucideIcon }[]> = {
  jugador: [
    { to: "/jugador", label: "Dashboard", icon: LayoutDashboard },
    { to: "/jugador/disponibilidad", label: "Disponibilidad", icon: Calendar },
  ],
  admin: [
    { to: "/admin", label: "Resumen", icon: LayoutDashboard },
    { to: "/admin/reservas", label: "Reservas", icon: Calendar },
    { to: "/admin/canchas", label: "Canchas", icon: Trophy },
    { to: "/admin/precios", label: "Precios dinámicos", icon: DollarSign },
    { to: "/admin/pagos", label: "Validar pagos", icon: Receipt },
    { to: "/admin/extras", label: "Inventario", icon: Package },
    { to: "/admin/reportes", label: "Reportes", icon: BarChart3 },
    { to: "/admin/onboarding", label: "Onboarding", icon: Building2 },
  ],
  soporte: [
    { to: "/soporte", label: "Monitoreo", icon: Activity },
  ],
};

const roleBadge: Record<Role, string> = {
  jugador: "bg-accent text-accent-foreground",
  admin: "bg-info text-info-foreground",
  soporte: "bg-warning text-warning-foreground",
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  if (!user) return null;

  const items = menus[user.role];

  return (
    <div className="min-h-screen flex w-full bg-muted/30">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="px-6 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <img
              src="/luxxito-sports-logo.png"
              alt="LuxxitoSports"
              className="h-10 w-auto"
            />
            <div>
              <div className="font-bold text-base tracking-tight">LuxxitoSports</div>
              <div className="text-xs opacity-60 capitalize">Panel {user.role}</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow" : "hover:bg-sidebar-accent"
                }`
              }
            >
              <it.icon className="w-4 h-4" /> {it.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <button onClick={() => { logout(); navigate("/"); }} className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm hover:bg-sidebar-accent">
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)}>
          <aside className="w-72 h-full bg-sidebar text-sidebar-foreground p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <img
                  src="/luxxito-sports-logo.png"
                  alt="LuxxitoSports"
                  className="h-9 w-auto"
                />
                <span className="font-bold">LuxxitoSports</span>
              </div>
              <button onClick={() => setOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <nav className="space-y-1">
              {items.map((it) => (
                <NavLink key={it.to} to={it.to} end onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm ${isActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent"}`
                  }>
                  <it.icon className="w-4 h-4" /> {it.label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-card border-b flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setOpen(true)}><Menu className="w-5 h-5" /></button>
            <img
              src="/luxxito-sports-logo.png"
              alt="LuxxitoSports"
              className="h-8 w-auto lg:hidden"
            />
          </div>
          <div className="flex items-center gap-3">
            <Badge className={roleBadge[user.role]}>{user.role.toUpperCase()}</Badge>
            <div className="text-sm hidden sm:block">
              <div className="font-medium leading-tight">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-accent grid place-items-center text-accent-foreground font-semibold">
              {user.name[0]?.toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
