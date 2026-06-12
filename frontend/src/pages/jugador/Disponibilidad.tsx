import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { api, Paginated, unwrap } from "@/lib/api";
import { Cancha, Complejo, Deporte, mapCourt } from "@/lib/domain";
import { Futbol, Tenis, Basquet, Voley, Padel, CourtLines } from "@/components/SportsBackground";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Clock, Flame, Home, Lightbulb, MapPin, SearchX, Sparkles, Timer } from "lucide-react";

type Slot = { hora: string; horaFin: string; estado: "libre" | "bloqueado" | "reservado" | "mantenimiento"; precio: number };

// Estados visibles para el jugador (texto + color, nunca solo color)
const leyenda = [
  { etiqueta: "🟢 Disponible" },
  { etiqueta: "🟡 En proceso" },
  { etiqueta: "🔴 Ocupada" },
  { etiqueta: "⚙️ Mantenimiento" },
];

const mensajeNoDisponible: Record<string, string> = {
  reservado: "El horario seleccionado ya no está disponible. Por favor elige otro.",
  bloqueado: "Otro jugador está reservando este horario. Vuelve a intentarlo en unos minutos o elige otro.",
  mantenimiento: "La cancha está en mantenimiento en este horario. Elige otro horario disponible.",
};

const iconoDeporte: Record<string, ({ className }: { className?: string }) => JSX.Element> = {
  "Fútbol": Futbol,
  "Tenis": Tenis,
  "Básquet": Basquet,
  "Vóley": Voley,
  "Pádel": Padel,
};

const horas = Array.from({ length: 14 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);
const fmtFecha = (d: Date) => d.toLocaleDateString("en-CA"); // yyyy-mm-dd en hora local
const hoy = fmtFecha(new Date());

const proximosDias = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  return d;
});

// Chip de horario según estado
const SlotChip = ({ slot, onClick }: { slot: Slot; onClick: () => void }) => {
  const punta = Number(slot.hora.slice(0, 2)) >= 18;

  if (slot.estado === "libre") {
    return (
      <button
        onClick={onClick}
        title={`Disponible · ${slot.hora} · S/ ${slot.precio}`}
        aria-label={`${slot.hora}, disponible, S/ ${slot.precio}`}
        className="group rounded-xl border border-accent/30 bg-accent/[0.06] py-2.5 px-1 transition-all duration-200 cursor-pointer
          hover:bg-gradient-accent hover:border-transparent hover:shadow-glow hover:scale-[1.05] active:scale-95
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
      >
        <div className="flex items-center justify-center gap-1 font-bold text-sm text-foreground group-hover:text-white transition-colors">
          {slot.hora}
          {punta && <Flame className="w-3 h-3 text-warning group-hover:text-white" aria-label="Hora punta" />}
        </div>
        <div className="text-[11px] font-semibold text-accent group-hover:text-white/90 transition-colors">S/ {slot.precio}</div>
      </button>
    );
  }

  const cfg = {
    reservado: { dot: "bg-slot-booked", label: "Ocupada" },
    bloqueado: { dot: "bg-slot-locked motion-safe:animate-pulse", label: "En proceso" },
    mantenimiento: { dot: "bg-slot-maintenance", label: "Mant." },
  }[slot.estado];

  return (
    <button
      onClick={onClick}
      title={`${cfg.label} · ${slot.hora}`}
      aria-label={`${slot.hora}, ${cfg.label}, no seleccionable`}
      aria-disabled="true"
      className="rounded-xl border border-border/60 bg-muted/40 py-2.5 px-1 cursor-not-allowed
        [background-image:repeating-linear-gradient(45deg,transparent,transparent_6px,hsl(var(--border)/0.30)_6px,hsl(var(--border)/0.30)_7px)]"
    >
      <div className="font-bold text-sm text-muted-foreground/60">{slot.hora}</div>
      <div className="flex items-center justify-center gap-1 text-[10px] font-medium text-muted-foreground/70">
        <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} aria-hidden="true" />
        {cfg.label}
      </div>
    </button>
  );
};

export default function Disponibilidad() {
  const [complejos, setComplejos] = useState<Complejo[]>([]);
  const [deportes, setDeportes] = useState<Deporte[]>([]);
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [slotsByCourt, setSlotsByCourt] = useState<Record<string, Slot[]>>({});
  const [complejo, setComplejo] = useState("");
  const [deporte, setDeporte] = useState("todos");
  const [fecha, setFecha] = useState(hoy);
  const [horaDesde, setHoraDesde] = useState("todas");
  const [cargando, setCargando] = useState(true);
  const [sel, setSel] = useState<{ cancha: Cancha; slot: Slot } | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    Promise.all([
      api<Paginated<Complejo> | Complejo[]>("/complejos/?page_size=100"),
      api<Deporte[]>("/deportes/"),
      api<Paginated<any> | any[]>("/canchas/?page_size=100"),
    ]).then(([complexes, sports, courts]) => {
      const complexList = unwrap(complexes);
      setComplejos(complexList);
      setDeportes(sports);
      setCanchas(unwrap(courts).map(mapCourt));
      if (!complejo && complexList.length) setComplejo(complexList[0].id);
    }).catch((error) => toast.error(error.message));
  }, []);

  useEffect(() => {
    if (!complejo) return;
    setCargando(true);
    const sport = deportes.find((item) => item.nombre === deporte);
    const params = new URLSearchParams({
      complejo_id: complejo,
      fecha,
      hora_desde: horaDesde === "todas" ? "08:00" : horaDesde,
    });
    if (sport) params.set("deporte_id", String(sport.id));
    api<any>(`/canchas/disponibilidad/?${params}`)
      .then((data) => {
        const mapped: Record<string, Slot[]> = {};
        data.resultados.forEach((item: any) => {
          mapped[item.cancha_id] = item.slots.map((slot: any) => ({
            hora: slot.hora_inicio,
            horaFin: slot.hora_fin,
            estado: slot.estado === "LIBRE" ? "libre"
              : slot.estado === "BLOQUEADO" ? "bloqueado"
              : slot.estado === "MANTENIMIENTO" ? "mantenimiento" : "reservado",
            precio: Number(slot.precio),
          }));
        });
        setSlotsByCourt(mapped);
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setCargando(false));
  }, [complejo, deporte, fecha, horaDesde]);

  const canchasFiltradas = useMemo(
    () => canchas.filter(c => c.complejoId === complejo && (deporte === "todos" || c.deporte === deporte) && c.activo),
    [complejo, deporte]
  );

  const complejoSel = complejos.find(c => c.id === complejo);

  const onSlot = (cancha: Cancha, slot: Slot) => {
    if (slot.estado !== "libre") {
      toast.error(mensajeNoDisponible[slot.estado], {
        description: "Los horarios se actualizan en tiempo real.",
      });
      return;
    }
    setSel({ cancha, slot });
  };

  const limpiarFiltros = () => {
    setDeporte("todos");
    setHoraDesde("todas");
    toast.info("Filtros restablecidos");
  };

  const fechaLegible = new Date(fecha + "T00:00").toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent bg-accent/10 rounded-full px-3 py-1 mb-2">
          <Sparkles className="w-3 h-3" /> Precios actualizados en tiempo real
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold">Consultar disponibilidad</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Encuentra tu horario perfecto y reserva en menos de un minuto.</p>
      </div>

      {/* Filtros + selector de días */}
      <Card className="rounded-2xl bg-card/80 backdrop-blur-md shadow-card overflow-hidden">
        <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="f-complejo">Complejo</Label>
            <Select value={complejo} onValueChange={setComplejo}>
              <SelectTrigger id="f-complejo"><SelectValue /></SelectTrigger>
              <SelectContent>{complejos.map(c => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="f-deporte">Deporte</Label>
            <Select value={deporte} onValueChange={setDeporte}>
              <SelectTrigger id="f-deporte"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los deportes</SelectItem>
                {deportes.map(d => <SelectItem key={d.id} value={d.nombre}>{d.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="f-hora">Hora desde</Label>
            <Select value={horaDesde} onValueChange={setHoraDesde}>
              <SelectTrigger id="f-hora"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Cualquier hora</SelectItem>
                {horas.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tira de días estilo booking */}
        <div className="border-t bg-muted/30 px-4 sm:px-5 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]" role="radiogroup" aria-label="Elegir fecha">
            {proximosDias.map((d, i) => {
              const v = fmtFecha(d);
              const activo = v === fecha;
              return (
                <button
                  key={v}
                  role="radio"
                  aria-checked={activo}
                  onClick={() => setFecha(v)}
                  className={cn(
                    "flex flex-col items-center w-14 shrink-0 rounded-xl border py-2 transition-all duration-200 cursor-pointer",
                    activo
                      ? "bg-gradient-accent text-white border-transparent shadow-glow"
                      : "bg-card border-border text-muted-foreground hover:border-accent/50 hover:text-foreground"
                  )}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wide">
                    {i === 0 ? "Hoy" : d.toLocaleDateString("es-PE", { weekday: "short" }).replace(".", "")}
                  </span>
                  <span className="text-lg font-bold leading-tight">{d.getDate()}</span>
                  <span className="text-[9px] uppercase opacity-75">{d.toLocaleDateString("es-PE", { month: "short" }).replace(".", "")}</span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Leyenda de estados: texto + color, no solo color */}
      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm" aria-label="Leyenda de estados">
        {leyenda.map(l => (
          <span key={l.etiqueta} className="inline-flex items-center font-medium bg-card border rounded-full px-3 py-1 shadow-card">
            {l.etiqueta}
          </span>
        ))}
        <span className="inline-flex items-center gap-1 text-muted-foreground ml-1">
          <Flame className="w-3.5 h-3.5 text-warning" /> hora punta
        </span>
      </div>

      <p className="text-sm text-muted-foreground">
        Mostrando disponibilidad para el <span className="capitalize font-medium text-foreground">{fechaLegible}</span> en {complejoSel?.nombre}.
      </p>

      {cargando ? (
        <div className="space-y-5" aria-busy="true" aria-label="Buscando horarios disponibles">
          {[1, 2].map(i => (
            <Card key={i} className="rounded-2xl overflow-hidden">
              <Skeleton className="h-24 w-full rounded-none" />
              <div className="p-4 sm:p-5 grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-2">
                {Array.from({ length: 14 }).map((_, j) => <Skeleton key={j} className="h-14 rounded-xl" />)}
              </div>
            </Card>
          ))}
        </div>
      ) : canchasFiltradas.length === 0 ? (
        <Card className="p-10 text-center rounded-2xl">
          <SearchX className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-lg font-semibold mb-1">No encontramos canchas con esos filtros</p>
          <p className="text-sm text-muted-foreground mb-4">Prueba con otro deporte u otro complejo.</p>
          <Button variant="outline" onClick={limpiarFiltros}>Restablecer filtros</Button>
        </Card>
      ) : (
        <div className="space-y-5">
          {canchasFiltradas.map((c, idx) => {
            const slots = slotsByCourt[c.id] || [];
            const libres = slots.filter(s => s.estado === "libre").length;
            const pct = slots.length ? Math.round((libres / slots.length) * 100) : 0;
            const Icono = iconoDeporte[c.deporte] || Futbol;
            return (
              <Card
                key={c.id}
                className="rounded-2xl overflow-hidden animate-fade-in transition-shadow duration-200 hover:shadow-elegant"
                style={{ animationDelay: `${idx * 90}ms`, animationFillMode: "both" }}
              >
                {/* Cabecera oscura de la cancha */}
                <div className="relative bg-gradient-hero text-white px-4 sm:px-5 py-4 overflow-hidden">
                  <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none">
                    <CourtLines className="absolute -right-20 -top-28 w-72 h-72 text-white opacity-[0.08]" />
                    <div className="absolute -left-16 -bottom-20 w-48 h-48 rounded-full bg-accent/20 blur-3xl" />
                  </div>
                  <div className="relative flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 grid place-items-center shrink-0">
                        <Icono className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="font-semibold">{c.nombre} · {c.deporte}</div>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <span className="text-[10px] bg-white/10 border border-white/10 rounded-full px-2 py-0.5">{c.superficie}</span>
                          {c.techado && <span className="text-[10px] bg-white/10 border border-white/10 rounded-full px-2 py-0.5">Techado</span>}
                          {c.iluminacion && <span className="text-[10px] bg-white/10 border border-white/10 rounded-full px-2 py-0.5">Iluminada</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider text-white/55">Desde</div>
                      <div className="font-bold text-xl leading-tight">S/ {c.tarifaEstandar}</div>
                    </div>
                  </div>
                  {/* Medidor de disponibilidad */}
                  <div className="relative flex items-center gap-2.5 mt-3">
                    <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-gradient-accent rounded-full transition-[width] duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[11px] text-white/70 whitespace-nowrap">{libres} de {slots.length} libres</span>
                  </div>
                </div>

                {/* Grilla de horarios */}
                <div className="p-4 sm:p-5">
                  {slots.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">No hay horarios desde las {horaDesde}. Prueba con una hora anterior.</p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-2 text-center">
                      {slots.map(s => <SlotChip key={s.hora} slot={s} onClick={() => onSlot(c, s)} />)}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detalle de cancha + confirmación de selección */}
      <Dialog open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>{sel?.cancha.nombre} · {sel?.cancha.deporte}</DialogTitle>
            <DialogDescription>Revisa el detalle antes de iniciar tu reserva.</DialogDescription>
          </DialogHeader>
          {sel && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="p-3 rounded-xl bg-muted flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground">Complejo</div>
                    <div className="font-medium">{complejoSel?.nombre}</div>
                    <div className="text-xs text-muted-foreground">{complejoSel?.direccion}</div>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-muted flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground">Fecha y hora</div>
                    <div className="font-medium capitalize">{fechaLegible}</div>
                    <div className="text-xs text-muted-foreground">{sel.slot.hora} · 1 hora</div>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-muted flex items-center gap-2">
                  <Home className="w-4 h-4 text-accent shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground">Superficie</div>
                    <div className="font-medium">{sel.cancha.superficie}</div>
                    <div className="text-xs text-muted-foreground">{sel.cancha.techado ? "Techado" : "Al aire libre"}</div>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-muted flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-accent shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground">Iluminación</div>
                    <div className="font-medium">{sel.cancha.iluminacion ? "Sí" : "No"}</div>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-accent text-accent-foreground flex items-center justify-between">
                <span className="text-sm">Precio del horario</span>
                <span className="font-bold text-xl">S/ {sel.slot.precio}</span>
              </div>
              <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                <Timer className="w-3.5 h-3.5 mt-0.5 shrink-0 text-warning" />
                Al iniciar la reserva, este horario quedará bloqueado para ti durante 20 minutos mientras completas el pago.
              </p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSel(null)}>Volver</Button>
            <Button
              className="bg-gradient-accent border-0 shadow-glow hover:-translate-y-0.5 hover:brightness-110 transition-all duration-200"
              onClick={() => nav("/jugador/reservar", { state: { ...sel, fecha } })}
            >
              Iniciar reserva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
