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
import { Calendar, MapPin, Plus, Trophy, XCircle, QrCode, CalendarX2 } from "lucide-react";
import { toast } from "sonner";

// Etiquetas humanas para los estados internos
const etiquetaEstado: Record<string, string> = {
  CONFIRMADA: "Confirmada",
  BLOQUEADA: "En proceso de pago",
  PENDIENTE: "Pendiente de validación",
  CANCELADA: "Cancelada",
  VENCIDA: "Vencida",
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

  const confirmarCancelacion = () => {
    if (!aCancelar) return;
    cancelarReserva(aCancelar.id);
    const gratuita = horasParaInicio(aCancelar) >= 24;
    toast.success(`Reserva ${aCancelar.codigo} cancelada.`, {
      description: gratuita
        ? "Cancelaste con más de 24 horas de anticipación: el reembolso es total."
        : "Por cancelar con menos de 24 horas, se retiene la seña según la política.",
    });
    setACancelar(null);
  };

  const TarjetaReserva = ({ r }: { r: ReservaJugador }) => {
    const horas = horasParaInicio(r);
    const cancelable = esActiva(r) && horas > 0;
    return (
      <Card className="p-5 hover:shadow-elegant transition-shadow duration-200">
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-accent/10 grid place-items-center shrink-0">
              <Trophy className="w-5 h-5 text-accent" />
            </div>
            <div>
              <div className="font-semibold">{r.canchaNombre}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />{r.complejoNombre}
              </div>
              <div className="text-xs font-mono text-muted-foreground mt-0.5">{r.codigo}</div>
            </div>
          </div>
          <StatusBadge status={r.estado} label={etiquetaEstado[r.estado]} />
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
          <Calendar className="w-4 h-4" />
          {new Date(r.fechaInicio).toLocaleString("es-PE", { dateStyle: "full", timeStyle: "short" })}
        </div>
        {r.extras && r.extras.length > 0 && (
          <div className="text-xs text-muted-foreground mb-2">
            Extras: {r.extras.map(e => `${e.nombre} ×${e.cantidad}`).join(", ")}
          </div>
        )}
        <div className="flex justify-between items-center mt-3">
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
      </Card>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mis reservas</h1>
          <p className="text-muted-foreground">Consulta, muestra tu QR de ingreso o cancela tus reservas.</p>
        </div>
        <Link to="/jugador/disponibilidad">
          <Button className="bg-gradient-accent border-0"><Plus className="w-4 h-4 mr-2" />Nueva reserva</Button>
        </Link>
      </div>

      <p className="text-xs text-muted-foreground bg-muted rounded-md p-3">
        Política de cancelación: gratuita hasta 24 horas antes del inicio. Después de ese plazo se retiene la seña.
      </p>

      <Tabs defaultValue="activas">
        <TabsList>
          <TabsTrigger value="activas">Próximas ({activas.length})</TabsTrigger>
          <TabsTrigger value="historial">Historial ({historial.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="activas" className="mt-4">
          {activas.length === 0 ? (
            <Card className="p-10 text-center">
              <CalendarX2 className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-lg font-semibold mb-1">Aún no tienes reservas próximas</p>
              <p className="text-sm text-muted-foreground mb-4">Encuentra una cancha y reserva en menos de un minuto.</p>
              <Button className="bg-gradient-accent border-0" onClick={() => nav("/jugador/disponibilidad")}>
                <Plus className="w-4 h-4 mr-2" />Reservar cancha
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {activas.map(r => <TarjetaReserva key={r.id} r={r} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="historial" className="mt-4">
          {historial.length === 0 ? (
            <Card className="p-10 text-center text-sm text-muted-foreground">Tu historial está vacío.</Card>
          ) : (
            <Card className="divide-y">
              {historial.map(r => (
                <div key={r.id} className="p-4 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-medium">{r.canchaNombre} · {r.complejoNombre}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(r.fechaInicio).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" })} · {r.codigo}
                    </div>
                  </div>
                  <StatusBadge status={r.estado} label={etiquetaEstado[r.estado]} />
                </div>
              ))}
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Confirmación de cancelación: acción destructiva con AlertDialog */}
      <AlertDialog open={!!aCancelar} onOpenChange={(o) => !o && setACancelar(null)}>
        <AlertDialogContent>
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
