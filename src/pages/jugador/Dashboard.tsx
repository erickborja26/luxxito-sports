import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { useReservas } from "@/context/ReservasContext";
import { Calendar, MapPin, Star, Plus, CalendarCheck, Trophy } from "lucide-react";
import { CourtLines, iconoDeporte, Futbol } from "@/components/SportsBackground";
import { canchas } from "@/data/mock";

// Borde izquierdo según estado, mismo lenguaje que Mis reservas
const bordeEstado: Record<string, string> = {
  CONFIRMADA: "border-l-accent",
  BLOQUEADA: "border-l-slot-locked",
  PENDIENTE: "border-l-warning",
  CANCELADA: "border-l-destructive",
  VENCIDA: "border-l-muted-foreground",
};

const scoringStyles: Record<string, { label: string; cls: string }> = {
  nuevo: { label: "Nuevo", cls: "from-slate-400 to-slate-600" },
  frecuente: { label: "Frecuente", cls: "from-accent to-emerald-500" },
  vip: { label: "VIP", cls: "from-amber-400 to-orange-500" },
};

const etiquetaEstado: Record<string, string> = {
  CONFIRMADA: "Confirmada",
  BLOQUEADA: "En proceso de pago",
  PENDIENTE: "Pendiente de validación",
  CANCELADA: "Cancelada",
  VENCIDA: "Vencida",
};

export default function JugadorDashboard() {
  const { user } = useAuth();
  const { reservas } = useReservas();
  const score = scoringStyles[user?.scoring || "nuevo"];
  const proximas = reservas.filter(r => ["CONFIRMADA", "BLOQUEADA", "PENDIENTE"].includes(r.estado));
  const historial = reservas.filter(r => ["CANCELADA", "VENCIDA"].includes(r.estado));

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-hero text-white p-6 lg:p-10 shadow-elegant">
        {/* Geometría abstracta del hero */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute -right-32 -top-44 w-[26rem] h-[26rem] motion-safe:animate-spin-slow [animation-duration:120s]">
            <CourtLines className="w-full h-full text-white opacity-[0.10]" />
          </div>
          <div className="absolute -left-16 -bottom-20 w-72 h-72 rounded-full bg-accent/30 blur-3xl motion-safe:animate-aurora" />
          <div className="absolute -inset-x-1/4 top-0 h-full -rotate-12 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent motion-safe:animate-beam" />
          {/* Retícula sutil */}
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              maskImage: "radial-gradient(ellipse 70% 90% at 85% 50%, black 20%, transparent 70%)",
              WebkitMaskImage: "radial-gradient(ellipse 70% 90% at 85% 50%, black 20%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold">
              Hola,{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, hsl(152 75% 58%), hsl(170 80% 55%))" }}
              >
                {user?.name}
              </span>
            </h1>
            <p className="text-white/75 mt-1">Tus reservas y horarios favoritos en un solo lugar.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link to="/jugador/reservas">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm transition-all duration-200">
                <CalendarCheck className="w-4 h-4 mr-2" />Mis reservas
              </Button>
            </Link>
            <Link to="/jugador/disponibilidad">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-accent border-0 shadow-glow hover:-translate-y-0.5 hover:brightness-110 transition-all duration-200">
                <Plus className="w-4 h-4 mr-2" />Reservar cancha
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className={`p-5 bg-gradient-to-br ${score.cls} text-white border-0`}>
          <div className="flex items-center gap-2 mb-2"><Star className="w-4 h-4" /><span className="text-sm font-medium">Tu nivel</span></div>
          <div className="text-3xl font-bold">{score.label}</div>
          <p className="text-xs text-white/80 mt-1">Seña requerida: {user?.scoring === "nuevo" ? "50%" : "20%"}</p>
        </Card>
        <Card className="p-5 transition-shadow duration-200 hover:shadow-elegant">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-7 h-7 rounded-lg bg-accent/10 grid place-items-center">
              <CalendarCheck className="w-4 h-4 text-accent" aria-hidden="true" />
            </span>
            <span className="text-sm text-muted-foreground">Próximas reservas</span>
          </div>
          <div className="text-3xl font-bold tabular-nums">{proximas.length}</div>
        </Card>
        <Card className="p-5 transition-shadow duration-200 hover:shadow-elegant">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-7 h-7 rounded-lg bg-accent/10 grid place-items-center">
              <Trophy className="w-4 h-4 text-accent" aria-hidden="true" />
            </span>
            <span className="text-sm text-muted-foreground">Total jugadas</span>
          </div>
          <div className="text-3xl font-bold tabular-nums">{reservas.length}</div>
        </Card>
      </div>

      <section>
        <h2 className="text-xl font-bold mb-3">Próximas reservas</h2>
        {proximas.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="font-semibold mb-1">No tienes reservas próximas</p>
            <p className="text-sm text-muted-foreground mb-3">¡Anímate a jugar! Reserva tu cancha en menos de un minuto.</p>
            <Link to="/jugador/disponibilidad"><Button className="bg-gradient-accent border-0"><Plus className="w-4 h-4 mr-2" />Reservar cancha</Button></Link>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {proximas.map(r => {
              const dep = canchas.find(c => c.id === r.canchaId)?.deporte || "Fútbol";
              const Icono = iconoDeporte[dep] || Futbol;
              return (
                <Card key={r.id} className={`p-5 border-l-4 ${bordeEstado[r.estado] || "border-l-border"} hover:shadow-elegant hover:-translate-y-0.5 transition-all duration-200`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-accent/10 grid place-items-center"><Icono className="w-8 h-8" /></div>
                      <div>
                        <div className="font-semibold">{r.canchaNombre}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" aria-hidden="true" />{r.complejoNombre}</div>
                      </div>
                    </div>
                    <StatusBadge status={r.estado} label={etiquetaEstado[r.estado]} />
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4" aria-hidden="true" />
                    <span className="capitalize">{new Date(r.fechaInicio).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">S/ {r.precio}</span>
                    <Link to="/jugador/confirmacion" state={{ reserva: r, pendiente: r.estado === "PENDIENTE" }}>
                      <Button variant="outline" size="sm">Ver detalle</Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Historial</h2>
        {historial.length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">Tu historial está vacío.</Card>
        ) : (
          <Card className="divide-y">
            {historial.map(r => {
              const dep = canchas.find(c => c.id === r.canchaId)?.deporte || "Fútbol";
              const Icono = iconoDeporte[dep] || Futbol;
              return (
                <div key={r.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-muted grid place-items-center shrink-0 opacity-70">
                      <Icono className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{r.canchaNombre} · {r.complejoNombre}</div>
                      <div className="text-xs text-muted-foreground">{new Date(r.fechaInicio).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" })}</div>
                    </div>
                  </div>
                  <StatusBadge status={r.estado} label={etiquetaEstado[r.estado]} className="shrink-0" />
                </div>
              );
            })}
          </Card>
        )}
      </section>
    </div>
  );
}
