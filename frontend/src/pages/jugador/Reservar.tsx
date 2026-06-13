import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { api, Paginated, unwrap } from "@/lib/api";
import { Cancha, Extra, ExtraReservado, mapExtra, mapReservation } from "@/lib/domain";
import { AlertTriangle, ArrowLeft, Check, CreditCard, Smartphone, Upload, Clock, Loader2, Plus, Minus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const steps = ["Horario", "Extras", "Pago"];
const HOLD_SECONDS = 20 * 60;

type Slot = { hora: string; horaFin: string; precio: number };
type Seleccion = { cancha: Cancha; slot: Slot; fecha: string };

export default function Reservar() {
  const loc = useLocation();
  const nav = useNavigate();
  const sel = loc.state as Seleccion | null;

  const [step, setStep] = useState(0);
  const [seconds, setSeconds] = useState(HOLD_SECONDS);
  const [extras, setExtras] = useState<Record<string, number>>({});
  const [extrasDisponibles, setExtrasDisponibles] = useState<Extra[]>([]);
  const [holdId, setHoldId] = useState<string | null>(null);
  const [metodo, setMetodo] = useState<"Tarjeta" | "Yape" | "Transferencia">("Tarjeta");
  const [pagando, setPagando] = useState(false);
  const [confirmarSalida, setConfirmarSalida] = useState(false);

  // Sin selección previa no hay bloqueo activo: volver a disponibilidad
  useEffect(() => {
    if (!sel) {
      toast.info("Primero elige un horario disponible para iniciar tu reserva.");
      nav("/jugador/disponibilidad", { replace: true });
    }
  }, [sel, nav]);

  useEffect(() => {
    if (!sel) return;
    api<Paginated<any> | any[]>("/extras/?page_size=100")
      .then((data) => setExtrasDisponibles(
        unwrap(data).map(mapExtra).filter((extra) => extra.complejoId === sel.cancha.complejoId),
      ))
      .catch((error) => toast.error(error.message));
  }, [sel]);

  useEffect(() => {
    const t = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (seconds === 0) {
      toast.error("Tu bloqueo de 20 minutos expiró.", {
        description: "El horario volvió a estar disponible para otros jugadores. Elige uno nuevamente.",
      });
      nav("/jugador/disponibilidad");
    }
    if (seconds === 120) toast.warning("Quedan menos de 2 minutos para completar tu reserva.");
    if (seconds === 300) toast.info("Quedan 5 minutos de bloqueo.");
  }, [seconds, nav]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const urgente = seconds < 120;
  const progreso = (seconds / HOLD_SECONDS) * 100;

  const carrito: ExtraReservado[] = useMemo(
    () => Object.entries(extras)
      .filter(([, q]) => q > 0)
      .map(([id, cantidad]) => {
        const e = extrasDisponibles.find(x => x.id === id)!;
        return { id: e.id, nombre: e.nombre, cantidad, precio: e.precio };
      }),
    [extras, extrasDisponibles]
  );
  const totalExtras = carrito.reduce((acc, e) => acc + e.precio * e.cantidad, 0);
  const precioCancha = sel?.slot.precio ?? 0;
  const total = precioCancha + totalExtras;

  if (!sel) return null;

  const cambiarExtra = (id: string, delta: number) => {
    const e = extrasDisponibles.find(x => x.id === id)!;
    if (e.estado === "DANADO") return toast.error(`"${e.nombre}" no está disponible por mantenimiento.`);
    if (e.cantidad === 0) return toast.error(`"${e.nombre}" está agotado por ahora.`);
    const actual = extras[id] || 0;
    if (delta > 0 && actual >= e.cantidad) {
      return toast.warning(`Solo quedan ${e.cantidad} unidades de "${e.nombre}".`);
    }
    setExtras(p => ({ ...p, [id]: Math.max(0, actual + delta) }));
  };

  const crearBloqueo = async () => {
    if (holdId) return holdId;
    const hold = await api<any>("/bloqueos/", {
      method: "POST",
      body: JSON.stringify({
        cancha_id: sel.cancha.id,
        fecha: sel.fecha,
        hora_inicio: sel.slot.hora,
        hora_fin: sel.slot.horaFin,
        extras: carrito.map((item) => ({ extra_id: item.id, cantidad: item.cantidad })),
      }),
    });
    setHoldId(hold.id_bloqueo);
    setSeconds(Math.max(0, Math.floor((new Date(hold.expira_en).getTime() - Date.now()) / 1000)));
    return hold.id_bloqueo as string;
  };

  const crearReserva = async () => {
    const bloqueoId = await crearBloqueo();
    const data = await api<any>("/reservas/", {
      method: "POST",
      body: JSON.stringify({ bloqueo_id: bloqueoId }),
    });
    return mapReservation(data);
  };

  const pagarAhora = async () => {
    setPagando(true);
    try {
      const reserva = await crearReserva();
      await api(`/reservas/${reserva.id}/pagos/`, {
        method: "POST",
        body: JSON.stringify({
          metodo: "TARJETA",
          monto_pagado: total.toFixed(2),
          referencia: `WEB-${Date.now()}`,
        }),
      });
      reserva.estado = "CONFIRMADA";
      reserva.metodoPago = "TARJETA";
      toast.success("¡Pago aprobado! Tu reserva está confirmada.");
      nav("/jugador/confirmacion", { state: { reserva } });
    } catch (error) {
      setPagando(false);
      toast.error(error instanceof Error ? error.message : "No se pudo completar el pago");
    }
  };

  const irAComprobante = async () => {
    setPagando(true);
    try {
      const reserva = await crearReserva();
      nav("/jugador/comprobante", { state: { reserva, total, metodo } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear la reserva");
      setPagando(false);
    }
  };

  const cancelarBloqueo = async () => {
    if (holdId) await api(`/bloqueos/${holdId}/`, { method: "DELETE" }).catch(() => undefined);
    toast.info("Reserva cancelada. El horario fue liberado.");
    nav("/jugador/disponibilidad");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Countdown del bloqueo temporal: siempre visible */}
      <div
        role="timer"
        aria-live="polite"
        aria-label={`Tiempo restante del bloqueo: ${mm} minutos ${ss} segundos`}
        className={cn(
          "rounded-xl p-4 space-y-2",
          urgente ? "bg-destructive text-destructive-foreground animate-pulse-glow" : "bg-warning/15"
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className={cn("flex items-center gap-2 text-sm font-medium", !urgente && "text-warning")}>
            <Clock className="w-4 h-4" />
            {urgente ? "¡Tu bloqueo está por expirar!" : "Horario bloqueado para ti mientras completas el pago"}
          </div>
          <div className={cn("font-mono text-2xl font-bold tabular-nums", !urgente && "text-warning")}>{mm}:{ss}</div>
        </div>
        <Progress value={progreso} className={cn("h-1.5", urgente ? "bg-destructive-foreground/20" : "bg-warning/20")} />
      </div>

      {/* Indicador de pasos */}
      <div className="flex items-center justify-between" aria-label={`Paso ${step + 1} de ${steps.length}: ${steps[step]}`}>
        {steps.map((s, i) => (
          <div key={s} className="flex-1 flex items-center">
            <div className={cn("w-9 h-9 rounded-full grid place-items-center font-bold text-sm transition-colors duration-200", i <= step ? "bg-gradient-accent text-accent-foreground" : "bg-muted text-muted-foreground")}>
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <div className={cn("ml-2 text-sm font-medium hidden sm:block", i <= step ? "text-foreground" : "text-muted-foreground")}>{s}</div>
            {i < steps.length - 1 && <div className={cn("flex-1 h-0.5 mx-3 transition-colors duration-200", i < step ? "bg-accent" : "bg-muted")} />}
          </div>
        ))}
      </div>

      <Card className="p-6">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Confirma tu horario</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-md bg-muted"><div className="text-muted-foreground text-xs">Cancha</div><div className="font-semibold">{sel.cancha.nombre} · {sel.cancha.deporte}</div></div>
              <div className="p-3 rounded-md bg-muted"><div className="text-muted-foreground text-xs">Fecha y hora</div><div className="font-semibold">{new Date(`${sel.fecha}T${sel.slot.hora}`).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" })}</div></div>
              <div className="p-3 rounded-md bg-muted"><div className="text-muted-foreground text-xs">Duración</div><div className="font-semibold">1 hora</div></div>
              <div className="p-3 rounded-md bg-gradient-accent text-accent-foreground"><div className="text-xs opacity-90">Precio</div><div className="font-bold text-lg">S/ {sel.slot.precio}</div></div>
            </div>
            <p className="text-xs text-muted-foreground">Si algo no coincide, puedes volver atrás sin perder el bloqueo.</p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Agrega extras (opcional)</h2>
              {carrito.length > 0 && (
                <Badge className="bg-accent text-accent-foreground">
                  <ShoppingCart className="w-3 h-3 mr-1" />{carrito.reduce((a, e) => a + e.cantidad, 0)} en carrito
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              {extrasDisponibles.map(e => {
                const disabled = e.estado === "DANADO" || e.cantidad === 0;
                const q = extras[e.id] || 0;
                return (
                  <div key={e.id} className={cn("flex items-center justify-between p-3 border rounded-lg transition-colors", disabled ? "opacity-50" : "hover:border-accent/50")}>
                    <div>
                      <div className="font-medium">{e.nombre}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        S/ {e.precio} c/u · Stock: {e.cantidad}
                        {e.estado === "DANADO" && <Badge variant="destructive" className="text-[10px]">No disponible</Badge>}
                        {e.estado !== "DANADO" && e.cantidad === 0 && <Badge variant="destructive" className="text-[10px]">Agotado</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="outline" aria-label={`Quitar ${e.nombre}`} disabled={disabled || q === 0} onClick={() => cambiarExtra(e.id, -1)}><Minus className="w-3 h-3" /></Button>
                      <span className="w-6 text-center font-semibold" aria-live="polite">{q}</span>
                      <Button size="icon" variant="outline" aria-label={`Agregar ${e.nombre}`} disabled={disabled} onClick={() => cambiarExtra(e.id, 1)}><Plus className="w-3 h-3" /></Button>
                    </div>
                  </div>
                );
              })}
            </div>
            {totalExtras > 0 && (
              <div className="text-sm text-right text-muted-foreground">Subtotal extras: <span className="font-semibold text-foreground">S/ {totalExtras}</span></div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Elige tu método de pago</h2>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Método de pago">
              {[
                { v: "Tarjeta" as const, i: CreditCard, d: "Confirmación inmediata" },
                { v: "Yape" as const, i: Smartphone, d: "Requiere comprobante" },
                { v: "Transferencia" as const, i: Upload, d: "Requiere comprobante" },
              ].map(m => (
                <button
                  key={m.v}
                  role="radio"
                  aria-checked={metodo === m.v}
                  onClick={() => setMetodo(m.v)}
                  className={cn("p-3 sm:p-4 rounded-lg border-2 transition-colors duration-200 flex flex-col items-center gap-1.5 cursor-pointer", metodo === m.v ? "border-accent bg-accent/5" : "border-border hover:border-muted-foreground")}
                >
                  <m.i className="w-6 h-6" />
                  <span className="text-sm font-medium">{m.v}</span>
                  <span className="text-[10px] text-muted-foreground text-center">{m.d}</span>
                </button>
              ))}
            </div>

            <div className="p-4 bg-muted rounded-lg space-y-1 text-sm">
              <div className="flex justify-between"><span>Cancha ({sel.slot.hora}, 1 hora)</span><span>S/ {sel.slot.precio}</span></div>
              {carrito.map(e => (
                <div key={e.nombre} className="flex justify-between text-muted-foreground"><span>{e.nombre} × {e.cantidad}</span><span>S/ {e.precio * e.cantidad}</span></div>
              ))}
              {carrito.length === 0 && <div className="flex justify-between text-muted-foreground"><span>Extras</span><span>S/ 0</span></div>}
              <div className="flex justify-between font-bold text-base pt-2 border-t"><span>Total a pagar</span><span>S/ {total}</span></div>
            </div>

            <div className="text-xs flex items-start gap-2 text-muted-foreground bg-warning/10 p-3 rounded-md" role="note">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              Tu reserva se confirma al aprobarse el pago. Con Yape o transferencia, queda <b>pendiente</b> hasta que validemos tu comprobante (máx. 30 minutos).
            </div>
          </div>
        )}
      </Card>

      <div className="flex flex-wrap justify-between gap-2">
        <Button
          variant="outline"
          disabled={pagando}
          onClick={() => (step === 0 ? setConfirmarSalida(true) : setStep(step - 1))}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />{step === 0 ? "Cancelar reserva" : "Atrás"}
        </Button>
        {step < 2 ? (
          <Button className="bg-gradient-accent border-0" onClick={() => setStep(step + 1)}>Continuar</Button>
        ) : metodo === "Tarjeta" ? (
          <Button className="bg-gradient-accent border-0 min-w-44" disabled={pagando} onClick={pagarAhora}>
            {pagando ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Procesando pago…</>) : (<><CreditCard className="w-4 h-4 mr-2" />Pagar S/ {total}</>)}
          </Button>
        ) : (
          <Button className="bg-gradient-accent border-0" onClick={irAComprobante}>
            <Upload className="w-4 h-4 mr-2" />Continuar y subir comprobante
          </Button>
        )}
      </div>

      {/* Confirmación antes de abandonar: el usuario no pierde el bloqueo por error */}
      <AlertDialog open={confirmarSalida} onOpenChange={setConfirmarSalida}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar esta reserva?</AlertDialogTitle>
            <AlertDialogDescription>
              Perderás el bloqueo del horario {sel.slot.hora} en {sel.cancha.nombre} y volverá a estar disponible para otros jugadores. No se realizará ningún cobro.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Seguir reservando</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={cancelarBloqueo}
            >
              Sí, cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
