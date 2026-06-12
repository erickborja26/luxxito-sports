import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { useReservas, ReservaJugador } from "@/context/ReservasContext";
import { Futbol, Tenis, Basquet, Voley, Padel } from "@/components/SportsBackground";
import { MapPin, Plus, XCircle, QrCode, CalendarX2, Info } from "lucide-react";
import { toast } from "sonner";

// Etiquetas humanas para los estados internos
const etiquetaEstado: Record<string, string> = {
  CONFIRMADA: "Confirmada",
  BLOQUEADA: "En proceso de pago",
  PENDIENTE: "Pendiente de validación",
  CANCELADA: "Cancelada",
  VENCIDA: "Vencida",
};

const bordeEstado: Record<string, string> = {
  CONFIRMADA: "border-l-accent",
  BLOQUEADA: "border-l-warning",
  PENDIENTE: "border-l-warning",
  CANCELADA: "border-l-destructive",
  VENCIDA: "border-l-muted-foreground",
};

const iconoDeporte: Record<string, ({ className }: { className?: string }) => JSX.Element> = {
  "Fútbol": Futbol,
  "Tenis": Tenis,
  "Básquet": Basquet,
  "Vóley": Voley,
  "Pádel": Padel,
};

const esActiva = (r: ReservaJugador) => ["CONFIRMADA", "BLOQUEADA", "PENDIENTE"].includes(r.estado);

const horasParaInicio = (r: ReservaJugador) =>
  (new Date(r.fechaInicio).getTime() - Date.now()) / 36e5;

export default function MisReservas() {
  const { reservas, cancelarReserva } = useReservas();
  const [aCancelar, setACancelar] = useState<ReservaJugador | null>(null);
  const nav = useNavigate();

  const activas = useMemo(
    () => reservas.filter(esActiva).sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio)),
    [reservas]
  );
  const historial = useMemo(
    () => reservas.filter(r => !esActiva(r)).sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio)),
    [reservas]
  );

  const confirmarCancelacion = async () => {
    if (!aCancelar) return;
    try {
      await cancelarReserva(aCancelar.id);
      const gratuita = horasParaInicio(aCancelar) >= 24;
      toast.success(`Reserva ${aCancelar.codigo} cancelada.`, {
        description: gratuita
          ? "Cancelaste con más de 24 horas de anticipación: el reembolso es total."
          : "Por cancelar con menos de 24 horas, se retiene la seña según la política.",
      });
      setACancelar(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cancelar la reserva");
    }
  };

  const TarjetaReserva = ({ r }: { r: ReservaJugador }) => {
    const horas = horasParaInicio(r);
    const cancelable = esActiva(r) && horas > 0;
    const inicio = new Date(r.fechaInicio);
    const Icono = Futbol;
    return (
      <Card className={`overflow-hidden rounded-2xl border-l-4 ${bordeEstado[r.estado] || "border-l-border"} transition-all duration-200 hover:shadow-elegant hover:-translate-y-0.5`}>
        <div className="flex">
          {/* Tile de fecha estilo calendario */}
          <div className="w-20 sm:w-24 shrink-0 bg-gradient-hero text-white flex flex-col items-center justify-center py-4 px-2">
            <span className="text-[10px] uppercase tracking-wider opacity-75">
              {inicio.toLocaleDateString("es-PE", { weekday: "short" })}
            </span>
            <span className="text-2xl sm:text-3xl font-bold leading-tight">{inicio.getDate()}</span>
            <span className="text-[11px] uppercase opacity-75">
              {inicio.toLocaleDateString("es-PE", { month: "short" })}
            </span>
            <span className="mt-1.5 text-xs font-semibold bg-white/15 rounded-full px-2 py-0.5">
              {inicio.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          <div className="flex-1 p-4 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-accent/10 grid place-items-center shrink-0">
                  <Icono className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{r.canchaNombre}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 shrink-0" />{r.complejoNombre}
                  </div>
                </div>
              </div>
              <StatusBadge status={r.estado} label={etiquetaEstado[r.estado]} className="shrink-0" />
            </div>

            <div className="text-xs font-mono text-muted-foreground mb-1">{r.codigo}</div>
            {r.extras && r.extras.length > 0 && (
              <div className="text-xs text-muted-foreground truncate">
                Extras: {r.extras.map(e => `${e.nombre} ×${e.cantidad}`).join(", ")}
              </div>
            )}

            <div className="flex flex-wrap justify-between items-center gap-2 mt-2.5">
              <span className="font-bold text-lg">S/ {r.precio}</span>
              <div className="flex gap-2">
                {esActiva(r) && (
                  <Link to="/jugador/confirmacion" state={{ reserva: r, pendiente: r.estado === "PENDIENTE" }}>
                    <Button variant="outline" size="sm"><QrCode className="w-3.5 h-3.5 mr-1.5" />Ver QR</Button>
                  </Link>
                )}
                {cancelable && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setACancelar(r)}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1.5" />Cancelar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Mis reservas</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Consulta, muestra tu QR de ingreso o cancela tus reservas.</p>
        </div>
        <Link to="/jugador/disponibilidad" className="shrink-0">
          <Button className="w-full sm:w-auto bg-gradient-accent border-0 shadow-glow hover:-translate-y-0.5 hover:brightness-110 transition-all duration-200">
            <Plus className="w-4 h-4 mr-2" />Nueva reserva
          </Button>
        </Link>
      </div>

      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-info/10 rounded-xl p-3" role="note">
        <Info className="w-4 h-4 text-info shrink-0 mt-0.5" />
        Política de cancelación: gratuita hasta 24 horas antes del inicio. Después de ese plazo se retiene la seña.
      </div>

      <Tabs defaultValue="activas">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex">
          <TabsTrigger value="activas">Próximas ({activas.length})</TabsTrigger>
          <TabsTrigger value="historial">Historial ({historial.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="activas" className="mt-4">
          {activas.length === 0 ? (
            <Card className="p-10 text-center rounded-2xl">
              <CalendarX2 className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-lg font-semibold mb-1">Aún no tienes reservas próximas</p>
              <p className="text-sm text-muted-foreground mb-4">Encuentra una cancha y reserva en menos de un minuto.</p>
              <Button className="bg-gradient-accent border-0" onClick={() => nav("/jugador/disponibilidad")}>
                <Plus className="w-4 h-4 mr-2" />Reservar cancha
              </Button>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-2 gap-4">
              {activas.map(r => <TarjetaReserva key={r.id} r={r} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="historial" className="mt-4">
          {historial.length === 0 ? (
            <Card className="p-10 text-center rounded-2xl text-sm text-muted-foreground">Tu historial está vacío.</Card>
          ) : (
            <div className="grid lg:grid-cols-2 gap-4">
              {historial.map(r => <TarjetaReserva key={r.id} r={r} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Confirmación de cancelación: acción destructiva con AlertDialog */}
      <AlertDialog open={!!aCancelar} onOpenChange={(o) => !o && setACancelar(null)}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar la reserva {aCancelar?.codigo}?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              {aCancelar && (
                <>
                  <span className="block">
                    {aCancelar.canchaNombre} · {new Date(aCancelar.fechaInicio).toLocaleString("es-PE", { dateStyle: "long", timeStyle: "short" })}
                  </span>
                  <span className="block font-medium text-foreground">
                    {horasParaInicio(aCancelar) >= 24
                      ? "Estás dentro del plazo: la cancelación es gratuita y el reembolso es total."
                      : "Faltan menos de 24 horas para el inicio: se retendrá la seña según la política de cancelación."}
                  </span>
                  <span className="block">Esta acción no se puede deshacer.</span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mantener reserva</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmarCancelacion}
            >
              Sí, cancelar reserva
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
