import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth, Role } from "@/context/AuthContext";
import {
  LayoutDashboard, Calendar, Trophy,
  BarChart3, LogOut, Menu, X, Building2, Activity, DollarSign, Package, Receipt
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import SportsBackground from "@/components/SportsBackground";
import { cn } from "@/lib/utils";

const menus: Record<Role, { to: string; label: string; icon: LucideIcon }[]> = {
  jugador: [
    { to: "/jugador", label: "Dashboard", icon: LayoutDashboard },
    { to: "/jugador/disponibilidad", label: "Disponibilidad", icon: Calendar },
    { to: "/jugador/reservas", label: "Mis reservas", icon: Receipt },
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

const roleLabel: Record<Role, string> = {
  jugador: "Jugador",
  admin: "Administrador",
  soporte: "Soporte",
};

const NavItems = ({ items, onNavigate }: { items: { to: string; label: string; icon: any }[]; onNavigate?: () => void }) => (
  <>
    {items.map((it) => (
      <NavLink
        key={it.to}
        to={it.to}
        end
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            isActive
              ? "bg-white/[0.07] text-white"
              : "text-sidebar-foreground/70 hover:bg-white/[0.04] hover:text-sidebar-foreground"
          )
        }
      >
        {({ isActive }) => (
          <>
            <span
              aria-hidden="true"
              className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-accent transition-all duration-200",
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"
              )}
            />
            <span
              className={cn(
                "w-8 h-8 rounded-lg grid place-items-center transition-colors duration-200",
                isActive ? "bg-accent/20 text-accent" : "bg-white/[0.04] text-sidebar-foreground/60 group-hover:text-sidebar-foreground"
              )}
            >
              <it.icon className="w-4 h-4" />
            </span>
            {it.label}
            {isActive && <span aria-hidden="true" className="ml-auto w-1.5 h-1.5 rounded-full bg-accent shadow-glow" />}
          </>
        )}
      </NavLink>
    ))}
  </>
);

const SidebarFooter = ({ name, role, onLogout }: { name: string; role: Role; onLogout: () => void }) => (
  <div className="p-3 border-t border-sidebar-border space-y-2">
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-sidebar-accent/60">
      <div className="w-9 h-9 rounded-full bg-gradient-accent grid place-items-center text-accent-foreground font-semibold shrink-0 shadow-glow">
        {name[0]?.toUpperCase()}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium truncate">{name}</div>
        <div className="text-[11px] opacity-60">{roleLabel[role]}</div>
      </div>
    </div>
    <button
      onClick={onLogout}
      className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-sidebar-foreground/70 hover:bg-destructive/15 hover:text-destructive transition-colors duration-200 cursor-pointer"
    >
      <LogOut className="w-4 h-4" /> Cerrar sesión
    </button>
  </div>
);

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  if (!user) return null;

  const items = menus[user.role];
  const salir = () => { logout(); navigate("/"); };

  return (
    <div className="min-h-screen flex w-full bg-muted/30">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border overflow-hidden sticky top-0 h-screen shrink-0">
        {/* Resplandor decorativo */}
        <div aria-hidden="true" className="absolute -top-20 -left-20 w-56 h-56 rounded-full bg-accent/15 blur-3xl pointer-events-none motion-safe:animate-drift" />

        <div className="px-6 py-5 border-b border-sidebar-border relative">
          <div className="flex items-center gap-2">
            <img
              src="/luxxito-sports-logo.png"
              alt="LuxxitoSports"
              className="h-10 w-auto"
            />
            <div>
              <div className="font-bold text-base tracking-tight">LuxxitoSports</div>
              <div className="text-xs opacity-60">Panel {roleLabel[user.role]}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto relative">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest opacity-40">Menú</p>
          <NavItems items={items} />
        </nav>

        <SidebarFooter name={user.name} role={user.role} onLogout={salir} />
      </aside>

      {/* Drawer móvil */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <aside
            className="w-[min(18rem,calc(100vw-2rem))] h-full bg-sidebar text-sidebar-foreground flex flex-col rounded-r-2xl shadow-elegant motion-safe:animate-slide-in-left overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Menú principal"
          >
            <div className="flex justify-between items-center px-5 py-4 border-b border-sidebar-border">
              <div className="flex items-center gap-2">
                <img
                  src="/luxxito-sports-logo.png"
                  alt="LuxxitoSports"
                  className="h-9 w-auto"
                />
                <span className="font-bold">LuxxitoSports</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="w-9 h-9 grid place-items-center rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              <NavItems items={items} onNavigate={() => setOpen(false)} />
            </nav>
            <SidebarFooter name={user.name} role={user.role} onLogout={salir} />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 relative">
        {user.role === "jugador" && <SportsBackground />}
        <header className="h-14 bg-card/80 backdrop-blur-md border-b flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden w-10 h-10 grid place-items-center rounded-lg hover:bg-muted transition-colors cursor-pointer"
              onClick={() => setOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
            <img
              src="/luxxito-sports-logo.png"
              alt="LuxxitoSports"
              className="h-8 w-auto lg:hidden"
            />
            <span className="font-semibold lg:hidden">LuxxitoSports</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={cn(roleBadge[user.role], "border-0 shadow-sm")}>{roleLabel[user.role]}</Badge>
            <div className="text-sm hidden sm:block">
              <div className="font-medium leading-tight">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-accent grid place-items-center text-accent-foreground font-semibold">
              {user.name[0]?.toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 animate-fade-in relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
