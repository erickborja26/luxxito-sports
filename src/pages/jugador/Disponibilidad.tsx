import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { complejos, canchas, deportes, generarSlots, Cancha } from "@/data/mock";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Clock, Home, Lightbulb, MapPin, SearchX, Timer } from "lucide-react";

type Slot = { hora: string; estado: "libre" | "bloqueado" | "reservado" | "mantenimiento"; precio: number };

// Estados visibles para el jugador (texto + color, nunca solo color)
const estadoSlot = {
  libre: { etiqueta: "🟢 Disponible", corto: "Disponible", clase: "bg-slot-free text-white hover:brightness-110 active:scale-95 cursor-pointer shadow-card" },
  bloqueado: { etiqueta: "🟡 En proceso", corto: "En proceso", clase: "bg-slot-locked/80 text-white cursor-not-allowed" },
  reservado: { etiqueta: "🔴 Ocupada", corto: "Ocupada", clase: "bg-slot-booked/80 text-white cursor-not-allowed" },
  mantenimiento: { etiqueta: "⚙️ Mantenimiento", corto: "Mant.", clase: "bg-slot-maintenance/80 text-white cursor-not-allowed" },
} as const;

const mensajeNoDisponible: Record<string, string> = {
  reservado: "El horario seleccionado ya no está disponible. Por favor elige otro.",
  bloqueado: "Otro jugador está reservando este horario. Vuelve a intentarlo en unos minutos o elige otro.",
  mantenimiento: "La cancha está en mantenimiento en este horario. Elige otro horario disponible.",
};

const horas = Array.from({ length: 14 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);
const hoy = new Date().toISOString().slice(0, 10);

export default function Disponibilidad() {
  const [complejo, setComplejo] = useState("c1");
  const [deporte, setDeporte] = useState("todos");
  const [fecha, setFecha] = useState(hoy);
  const [horaDesde, setHoraDesde] = useState("todas");
  const [cargando, setCargando] = useState(true);
  const [sel, setSel] = useState<{ cancha: Cancha; slot: Slot } | null>(null);
  const nav = useNavigate();

  // Simula la consulta al backend para dar feedback de carga al cambiar filtros
  useEffect(() => {
    setCargando(true);
    const t = setTimeout(() => setCargando(false), 450);
    return () => clearTimeout(t);
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
        <h1 className="text-3xl font-bold">Consultar disponibilidad</h1>
        <p className="text-muted-foreground">Encuentra tu horario perfecto. Precios actualizados en tiempo real.</p>
      </div>

      {/* Filtros */}
      <Card className="p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                {deportes.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="f-fecha">Fecha</Label>
            <Input id="f-fecha" type="date" min={hoy} value={fecha} onChange={e => setFecha(e.target.value)} />
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
      </Card>

      {/* Leyenda de estados: texto + color, no solo color */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm" aria-label="Leyenda de estados">
        {Object.values(estadoSlot).map(e => (
          <span key={e.etiqueta} className="font-medium">{e.etiqueta}</span>
        ))}
      </div>

      <p className="text-sm text-muted-foreground capitalize">
        Mostrando disponibilidad para el {fechaLegible} en {complejoSel?.nombre}.
      </p>

      {cargando ? (
        <div className="space-y-5" aria-busy="true" aria-label="Buscando horarios disponibles">
          {[1, 2].map(i => (
            <Card key={i} className="p-5 space-y-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-72" />
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {Array.from({ length: 14 }).map((_, j) => <Skeleton key={j} className="h-12 rounded-md" />)}
              </div>
            </Card>
          ))}
        </div>
      ) : canchasFiltradas.length === 0 ? (
        <Card className="p-10 text-center">
          <SearchX className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-lg font-semibold mb-1">No encontramos canchas con esos filtros</p>
          <p className="text-sm text-muted-foreground mb-4">Prueba con otro deporte u otro complejo.</p>
          <Button variant="outline" onClick={limpiarFiltros}>Restablecer filtros</Button>
        </Card>
      ) : (
        <div className="space-y-5">
          {canchasFiltradas.map(c => {
            const slots = generarSlots(c.id, fecha).filter(s => horaDesde === "todas" || s.hora >= horaDesde);
            const libres = slots.filter(s => s.estado === "libre").length;
            return (
              <Card key={c.id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <div className="font-semibold">{c.nombre} · {c.deporte}</div>
                    <div className="text-xs text-muted-foreground">{c.superficie} {c.techado && "· Techado"} {c.iluminacion && "· Iluminada"}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-accent border-accent/40">{libres} horarios disponibles</Badge>
                    <span className="text-xs text-muted-foreground">Tarifa base S/ {c.tarifaEstandar}</span>
                  </div>
                </div>
                {slots.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-3">No hay horarios desde las {horaDesde}. Prueba con una hora anterior.</p>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                    {slots.map(s => {
                      const e = estadoSlot[s.estado];
                      return (
                        <button
                          key={s.hora}
                          onClick={() => onSlot(c, s)}
                          title={`${e.corto} · ${s.hora} · S/ ${s.precio}`}
                          aria-label={`${s.hora}, ${e.corto}, ${s.estado === "libre" ? `S/ ${s.precio}` : "no seleccionable"}`}
                          aria-disabled={s.estado !== "libre"}
                          className={cn("rounded-md py-2 px-1 text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1", e.clase)}
                        >
                          <div className="font-semibold">{s.hora}</div>
                          <div className="text-[10px] opacity-90">{s.estado === "libre" ? `S/ ${s.precio}` : e.corto}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Detalle de cancha + confirmación de selección */}
      <Dialog open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{sel?.cancha.nombre} · {sel?.cancha.deporte}</DialogTitle>
            <DialogDescription>Revisa el detalle antes de iniciar tu reserva.</DialogDescription>
          </DialogHeader>
          {sel && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-3 rounded-md bg-muted flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground">Complejo</div>
                    <div className="font-medium">{complejoSel?.nombre}</div>
                    <div className="text-xs text-muted-foreground">{complejoSel?.direccion}</div>
                  </div>
                </div>
                <div className="p-3 rounded-md bg-muted flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground">Fecha y hora</div>
                    <div className="font-medium capitalize">{fechaLegible}</div>
                    <div className="text-xs text-muted-foreground">{sel.slot.hora} · 1 hora</div>
                  </div>
                </div>
                <div className="p-3 rounded-md bg-muted flex items-center gap-2">
                  <Home className="w-4 h-4 text-accent shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground">Superficie</div>
                    <div className="font-medium">{sel.cancha.superficie}</div>
                    <div className="text-xs text-muted-foreground">{sel.cancha.techado ? "Techado" : "Al aire libre"}</div>
                  </div>
                </div>
                <div className="p-3 rounded-md bg-muted flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-accent shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground">Iluminación</div>
                    <div className="font-medium">{sel.cancha.iluminacion ? "Sí" : "No"}</div>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-md bg-gradient-accent text-accent-foreground flex items-center justify-between">
                <span className="text-sm">Precio del horario</span>
                <span className="font-bold text-xl">S/ {sel.slot.precio}</span>
              </div>
              <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                <Timer className="w-3.5 h-3.5 mt-0.5 shrink-0 text-warning" />
                Al iniciar la reserva, este horario quedará bloqueado para ti durante 20 minutos mientras completas el pago.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSel(null)}>Volver</Button>
            <Button
              className="bg-gradient-accent border-0"
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
