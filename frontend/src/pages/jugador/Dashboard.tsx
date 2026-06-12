import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { useReservas } from "@/context/ReservasContext";
import {
  Star,
  Plus,
  CalendarCheck,
  Trophy,
  AlertTriangle,
  Share2,
  MapPin,
  Info,
  Moon,
  Sun,
} from "lucide-react";
import { iconoDeporte, Futbol } from "@/components/SportsBackground";

const BalonFutbol = iconoDeporte["Fútbol"];
const BalonBasquet = iconoDeporte["Básquet"];
const BalonTenis = iconoDeporte["Tenis"];
import { canchas } from "@/data/mock";
import { useClima } from "@/hooks/useClima";

// Tema visual completo por deporte
const temaDeporte: Record<string, {
  gradiente: string;       // clases Tailwind para el fondo
  lineas: string;          // patrón SVG inline para las líneas de cancha
  circulo: string;         // color del anillo central
  acento: string;          // color del icono de clima y detalles
}> = {
  "Fútbol": {
    gradiente: "from-emerald-950 via-emerald-900 to-slate-950",
    lineas: "repeating-linear-gradient(90deg, transparent 0, transparent 79px, rgba(255,255,255,0.07) 79px, rgba(255,255,255,0.07) 80px)",
    circulo: "border-white/15",
    acento: "text-emerald-300",
  },
  "Básquet": {
    gradiente: "from-orange-950 via-orange-900 to-slate-950",
    lineas: "repeating-linear-gradient(0deg, transparent 0, transparent 59px, rgba(255,255,255,0.07) 59px, rgba(255,255,255,0.07) 60px), repeating-linear-gradient(90deg, transparent 0, transparent 59px, rgba(255,255,255,0.07) 59px, rgba(255,255,255,0.07) 60px)",
    circulo: "border-orange-400/30",
    acento: "text-orange-300",
  },
  "Tenis": {
    gradiente: "from-lime-950 via-lime-900 to-slate-950",
    lineas: "repeating-linear-gradient(0deg, transparent 0, transparent 39px, rgba(255,255,255,0.08) 39px, rgba(255,255,255,0.08) 40px)",
    circulo: "border-lime-400/30",
    acento: "text-lime-300",
  },
  "Pádel": {
    gradiente: "from-sky-950 via-sky-900 to-slate-950",
    lineas: "repeating-linear-gradient(90deg, transparent 0, transparent 49px, rgba(255,255,255,0.07) 49px, rgba(255,255,255,0.07) 50px), repeating-linear-gradient(0deg, transparent 0, transparent 49px, rgba(255,255,255,0.07) 49px, rgba(255,255,255,0.07) 50px)",
    circulo: "border-sky-400/30",
    acento: "text-sky-300",
  },
  "Vóley": {
    gradiente: "from-violet-950 via-violet-900 to-slate-950",
    lineas: "repeating-linear-gradient(0deg, transparent 0, transparent 59px, rgba(255,255,255,0.07) 59px, rgba(255,255,255,0.07) 60px)",
    circulo: "border-violet-400/30",
    acento: "text-violet-300",
  },
};

const scoringStyles: Record<
  string,
  { label: string; cls: string; progreso: number; siguiente: string }
> = {
  nuevo: {
    label: "Nuevo",
    cls: "from-slate-400 to-slate-600",
    progreso: 20,
    siguiente: "Faltan 5 partidos para el nivel \"Frecuente\" (solo 20% de adelanto)",
  },
  frecuente: {
    label: "Frecuente",
    cls: "from-accent to-emerald-500",
    progreso: 80,
    siguiente: "Faltan 2 partidos para el nivel \"Elite\" (solo 5% de adelanto)",
  },
  vip: {
    label: "VIP",
    cls: "from-amber-400 to-orange-500",
    progreso: 100,
    siguiente: "¡Nivel máximo alcanzado!",
  },
};

export default function JugadorDashboard() {
  const { user } = useAuth();
  const { reservas } = useReservas();
  const clima = useClima();
  const score = scoringStyles[user?.scoring || "nuevo"];

  const proximas = reservas.filter(r => ["CONFIRMADA", "BLOQUEADA", "PENDIENTE"].includes(r.estado));
  const pendientes = reservas.filter(r => r.estado === "PENDIENTE");
  const confirmadas = reservas.filter(r => r.estado === "CONFIRMADA");

  // Reserva confirmada más cercana en el tiempo
  const proximoJuego = [...confirmadas].sort(
    (a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime()
  )[0];

  const deporteProximo = proximoJuego
    ? (canchas.find(c => c.id === proximoJuego.canchaId)?.deporte ?? "Fútbol")
    : "Fútbol";
  const IconoDeporteProximo = iconoDeporte[deporteProximo] || Futbol;
  const tema = temaDeporte[deporteProximo] ?? temaDeporte["Fútbol"];

  const textoClima = clima
    ? `Clima: ${clima.temperatura}°C, ${clima.descripcion} (${clima.esNoche ? "Noche" : "Día"})`
    : "Cargando clima…";
  const IconoClima = clima?.esNoche === false ? Sun : Moon;

  let fechaJuego = "";
  if (proximoJuego) {
    const f = new Date(proximoJuego.fechaInicio);
    const dia = f.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "short", year: "numeric" });
    const h12 = f.getHours() % 12 || 12;
    const ampm = f.getHours() >= 12 ? "P.M." : "A.M.";
    fechaJuego = `${dia} - ${h12}:${String(f.getMinutes()).padStart(2, "0")} ${ampm}`.toUpperCase();
  }

  const compartirJuego = () => {
    if (!proximoJuego) return;
    const texto = `¡Tengo partido en ${proximoJuego.canchaNombre} (${proximoJuego.complejoNombre}) el ${fechaJuego}! ¿Te apuntas? ⚽`;
    if (navigator.share) {
      navigator.share({ title: "Mi próximo juego", text: texto }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank");
    }
  };

  return (
    <div className="space-y-4 max-w-7xl">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-hero text-white p-5 lg:p-7 shadow-elegant">
        {/* Fondo del hero: pelotas flotando suavemente */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute right-[8%] top-2 w-20 h-20 opacity-25 motion-safe:animate-float-slow">
            <BalonFutbol className="w-full h-full" />
          </div>
          <div className="absolute right-[26%] -bottom-4 w-14 h-14 opacity-20 motion-safe:animate-float-slower">
            <BalonBasquet className="w-full h-full" />
          </div>
          <div className="absolute right-[42%] top-4 w-9 h-9 opacity-20 motion-safe:animate-drift">
            <BalonTenis className="w-full h-full" />
          </div>
          <div className="absolute -right-10 -bottom-16 w-64 h-64 rounded-full bg-accent/25 blur-3xl" />
          <div className="absolute -left-16 -bottom-20 w-72 h-72 rounded-full bg-accent/20 blur-3xl motion-safe:animate-aurora" />
          <div className="absolute -inset-x-1/4 top-0 h-full -rotate-12 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent motion-safe:animate-beam" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">
              Hola,{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, hsl(152 75% 58%), hsl(170 80% 55%))" }}
              >
                {user?.name}
              </span>
            </h1>
            <p className="text-white/75 mt-0.5 text-sm">¡Prepárate para tu próximo juego y gestiona tus reservas fácilmente!</p>
          </div>
          <div className="flex flex-row gap-2">
            <Link to="/jugador/reservas">
              <Button size="sm" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm transition-all duration-200">
                <CalendarCheck className="w-4 h-4 mr-2" />Mis reservas
              </Button>
            </Link>
            <Link to="/jugador/disponibilidad">
              <Button size="sm" className="bg-gradient-accent border-0 shadow-glow hover:-translate-y-0.5 hover:brightness-110 transition-all duration-200">
                <Plus className="w-4 h-4 mr-2" />Reservar cancha
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        {/* Tarjeta nivel — gradiente + hover lift + glow sutil */}
        <Card
          className={`relative overflow-hidden p-4 bg-gradient-to-br ${score.cls} text-white border-0 cursor-default group
            transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)]`}
        >
          <Star
            aria-hidden="true"
            className="absolute -right-4 -bottom-5 w-24 h-24 text-white/[0.10] transition-all duration-300 group-hover:text-white/[0.18] group-hover:scale-110 group-hover:rotate-12"
          />
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 drop-shadow" />
              <span className="text-sm font-medium">Tu nivel</span>
            </div>
            <span className="text-sm font-semibold tabular-nums opacity-90">{score.progreso}%</span>
          </div>
          <div className="text-2xl font-bold tracking-tight">{score.label}</div>
          <div
            className="mt-2 h-1.5 rounded-full bg-white/25 overflow-hidden"
            role="progressbar"
            aria-valuenow={score.progreso}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progreso hacia el siguiente nivel"
          >
            <div
              className="h-full rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)] transition-all duration-700"
              style={{ width: `${score.progreso}%` }}
            />
          </div>
          <p className="text-xs text-white/75 mt-1.5 leading-snug">{score.siguiente}</p>
        </Card>

        {/* Tarjeta próximas reservas — marca de agua + acento superior */}
        <Card
          className="relative overflow-hidden p-4 cursor-default group
            transition-all duration-200 hover:-translate-y-1 hover:shadow-elegant hover:ring-1 hover:ring-accent/30"
        >
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent to-emerald-400" />
          <CalendarCheck
            aria-hidden="true"
            className="absolute -right-4 -bottom-5 w-24 h-24 text-accent/[0.07] transition-all duration-300 group-hover:text-accent/[0.14] group-hover:scale-110 group-hover:-rotate-6"
          />
          <div className="flex items-center gap-2 mb-2">
            <span className="w-7 h-7 rounded-lg bg-accent/10 grid place-items-center transition-colors duration-200 group-hover:bg-accent/20">
              <CalendarCheck className="w-4 h-4 text-accent" aria-hidden="true" />
            </span>
            <span className="text-sm text-muted-foreground">Próximas reservas</span>
          </div>
          <div className="text-3xl font-bold tabular-nums">{proximas.length}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {proximas.length === 1 ? "partido agendado" : "partidos agendados"}
          </p>
        </Card>

        {/* Tarjeta partidos jugados — marca de agua + acento superior */}
        <Card
          className="relative overflow-hidden p-4 cursor-default group
            transition-all duration-200 hover:-translate-y-1 hover:shadow-elegant hover:ring-1 hover:ring-accent/30"
        >
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 to-accent" />
          <Trophy
            aria-hidden="true"
            className="absolute -right-4 -bottom-5 w-24 h-24 text-accent/[0.07] transition-all duration-300 group-hover:text-accent/[0.14] group-hover:scale-110 group-hover:-rotate-6"
          />
          <div className="flex items-center gap-2 mb-2">
            <span className="w-7 h-7 rounded-lg bg-accent/10 grid place-items-center transition-colors duration-200 group-hover:bg-accent/20">
              <Trophy className="w-4 h-4 text-accent" aria-hidden="true" />
            </span>
            <span className="text-sm text-muted-foreground">Partidos jugados</span>
          </div>
          <div className="text-3xl font-bold tabular-nums">{confirmadas.length}</div>
          <p className="text-xs text-muted-foreground mt-1">reservas confirmadas</p>
        </Card>
      </div>

      {pendientes.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-warning/40 bg-warning/10 px-4 py-2.5 text-sm" role="alert">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0" aria-hidden="true" />
          <p className="text-amber-800 dark:text-amber-200">
            <span className="font-semibold">¡Atención!</span> Tienes {pendientes.length} {pendientes.length === 1 ? "reserva pendiente" : "reservas pendientes"} de validación y pago.{" "}
            <Link to="/jugador/reservas" className="font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity duration-200">
              [Ver reservas]
            </Link>
          </p>
        </div>
      )}

      <section aria-label="Tu próximo juego">
        {proximoJuego ? (
          <div
            className="relative overflow-hidden rounded-2xl text-white shadow-elegant group
              transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
          >
            {/* Fondo dinámico según deporte */}
            <div aria-hidden="true" className={`absolute inset-0 bg-gradient-to-br ${tema.gradiente}`}>
              <div
                className="absolute inset-0 opacity-30 transition-opacity duration-300 group-hover:opacity-40"
                style={{ backgroundImage: tema.lineas }}
              />
              <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border ${tema.circulo} transition-transform duration-500 group-hover:scale-110`} />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 w-28 h-28 opacity-[0.08] motion-safe:animate-float-slow">
                <IconoDeporteProximo className="w-full h-full" />
              </div>
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/10 to-transparent" />
            </div>

            <div className="relative z-10 p-5 lg:p-6 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm grid place-items-center shrink-0">
                    <IconoDeporteProximo className="w-8 h-8" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-widest text-white/70 uppercase">Tu próximo juego:</p>
                    <h2 className="text-xl lg:text-2xl font-bold truncate">
                      {proximoJuego.canchaNombre} - {proximoJuego.complejoNombre}
                    </h2>
                    <p className="text-base font-semibold text-white/90">{fechaJuego}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-black/40 backdrop-blur-sm px-3 py-2 shrink-0">
                  <IconoClima className={`w-4 h-4 ${tema.acento}`} aria-hidden="true" />
                  <div className="text-xs">
                    <p className="font-semibold">Weather</p>
                    <p className="text-white/80">{textoClima}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
                <div className="space-y-1.5 shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold tabular-nums whitespace-nowrap">S/ {proximoJuego.precio}</span>
                    <StatusBadge status="CONFIRMADA" label="Confirmada" />
                  </div>
                  <p className="text-xs text-white/75 flex items-center gap-1.5">
                    <IconoClima className={`w-3.5 h-3.5 shrink-0 ${tema.acento}`} aria-hidden="true" />
                    {textoClima}
                  </p>
                </div>
                <div className="flex flex-wrap lg:flex-nowrap lg:justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={compartirJuego}
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm transition-all duration-200"
                  >
                    <Share2 className="w-4 h-4 mr-2" aria-hidden="true" />Compartir con amigos
                  </Button>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(proximoJuego.complejoNombre + " Lima Perú")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm transition-all duration-200"
                    >
                      <MapPin className="w-4 h-4 mr-2" aria-hidden="true" />Ver ruta en Maps/Waze
                    </Button>
                  </a>
                  <Link to="/jugador/confirmacion" state={{ reserva: proximoJuego, pendiente: false }}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm transition-all duration-200"
                    >
                      <Info className="w-4 h-4 mr-2" aria-hidden="true" />Detalles completos
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="font-semibold mb-1">No tienes partidos próximos</p>
            <p className="text-sm text-muted-foreground mb-3">¡Anímate a jugar! Reserva tu cancha en menos de un minuto.</p>
            <Link to="/jugador/disponibilidad">
              <Button className="bg-gradient-accent border-0"><Plus className="w-4 h-4 mr-2" />Reservar cancha</Button>
            </Link>
          </Card>
        )}
      </section>
    </div>
  );
}
