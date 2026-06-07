import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { extrasMock } from "@/data/mock";
import { AlertTriangle, Check, CreditCard, Smartphone, Upload, Clock, X, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const steps = ["Horario", "Extras", "Pago"];

export default function Reservar() {
  const loc = useLocation();
  const nav = useNavigate();
  const sel = loc.state || { cancha: { nombre: "Cancha 1" }, slot: { hora: "19:00", precio: 156 } };

  const [step, setStep] = useState(0);
  const [seconds, setSeconds] = useState(20 * 60);
  const [extras, setExtras] = useState<Record<string, number>>({});
  const [metodo, setMetodo] = useState<"Tarjeta" | "Yape" | "Transferencia">("Tarjeta");

  useEffect(() => {
    const t = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (seconds === 0) { toast.error("Bloqueo expirado"); nav("/jugador/disponibilidad"); }
    if (seconds === 120) toast.warning("¡Quedan menos de 2 minutos!");
  }, [seconds, nav]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const urgente = seconds < 120;

  const totalExtras = Object.entries(extras).reduce((acc, [id, q]) => {
    const e = extrasMock.find(x => x.id === id); return acc + (e?.precio || 0) * q;
  }, 0);
  const total = (sel.slot.precio || 100) + totalExtras;

  const cambiarExtra = (id: string, delta: number) => {
    const e = extrasMock.find(x => x.id === id)!;
    if (e.estado === "DAÑADO" || e.cantidad === 0) return toast.error("Extra no disponible");
    setExtras(p => ({ ...p, [id]: Math.max(0, Math.min(e.cantidad, (p[id] || 0) + delta)) }));
  };

  const simularConflicto = () => {
    if (Math.random() > 0.85) {
      toast.error("Conflicto 409: el horario fue tomado por otro usuario");
      nav("/jugador/disponibilidad");
      return true;
    }
    return false;
  };

  const finalizar = (subirComprobante = false) => {
    if (simularConflicto()) return;
    if (subirComprobante) nav("/jugador/comprobante", { state: { sel, total, metodo } });
    else { toast.success("¡Pago exitoso! Reserva confirmada"); nav("/jugador/confirmacion", { state: { sel, total, metodo } }); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className={cn("rounded-xl p-4 flex items-center justify-between gap-3", urgente ? "bg-destructive text-destructive-foreground animate-pulse-glow" : "bg-warning/15 text-warning-foreground")}>
        <div className="flex items-center gap-2 text-sm font-medium" style={{ color: urgente ? undefined : "hsl(var(--warning))" }}>
          <Clock className="w-4 h-4" /> Bloqueo temporal {urgente && "— ¡APÚRATE!"}
        </div>
        <div className={cn("font-mono text-2xl font-bold", !urgente && "text-warning")}>{mm}:{ss}</div>
      </div>

      <div className="flex items-center justify-between">
        {steps.map((s, i) => (
          <div key={s} className="flex-1 flex items-center">
            <div className={cn("w-9 h-9 rounded-full grid place-items-center font-bold text-sm transition", i <= step ? "bg-gradient-accent text-accent-foreground" : "bg-muted text-muted-foreground")}>
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <div className={cn("ml-2 text-sm font-medium hidden sm:block", i <= step ? "text-foreground" : "text-muted-foreground")}>{s}</div>
            {i < steps.length - 1 && <div className={cn("flex-1 h-0.5 mx-3", i < step ? "bg-accent" : "bg-muted")} />}
          </div>
        ))}
      </div>

      <Card className="p-6">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Confirmar horario</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-md bg-muted"><div className="text-muted-foreground text-xs">Cancha</div><div className="font-semibold">{sel.cancha.nombre}</div></div>
              <div className="p-3 rounded-md bg-muted"><div className="text-muted-foreground text-xs">Hora</div><div className="font-semibold">{sel.slot.hora}</div></div>
              <div className="p-3 rounded-md bg-muted"><div className="text-muted-foreground text-xs">Duración</div><div className="font-semibold">1 hora</div></div>
              <div className="p-3 rounded-md bg-gradient-accent text-accent-foreground"><div className="text-xs opacity-90">Precio</div><div className="font-bold text-lg">S/ {sel.slot.precio}</div></div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Agregar extras</h2>
            <div className="space-y-2">
              {extrasMock.map(e => {
                const disabled = e.estado === "DAÑADO" || e.cantidad === 0;
                const q = extras[e.id] || 0;
                return (
                  <div key={e.id} className={cn("flex items-center justify-between p-3 border rounded-lg", disabled && "opacity-50")}>
                    <div>
                      <div className="font-medium">{e.nombre}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        Stock: {e.cantidad} · S/ {e.precio}
                        {e.estado === "DAÑADO" && <Badge variant="destructive" className="text-[10px]">DAÑADO</Badge>}
                        {e.cantidad === 0 && <Badge variant="destructive" className="text-[10px]">SIN STOCK</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="outline" disabled={disabled || q === 0} onClick={() => cambiarExtra(e.id, -1)}><Minus className="w-3 h-3" /></Button>
                      <span className="w-6 text-center font-semibold">{q}</span>
                      <Button size="icon" variant="outline" disabled={disabled} onClick={() => cambiarExtra(e.id, 1)}><Plus className="w-3 h-3" /></Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Método de pago</h2>
            <div className="grid grid-cols-3 gap-2">
              {[
                { v: "Tarjeta", i: CreditCard },
                { v: "Yape", i: Smartphone },
                { v: "Transferencia", i: Upload },
              ].map(m => (
                <button key={m.v} onClick={() => setMetodo(m.v as any)}
                  className={cn("p-4 rounded-lg border-2 transition flex flex-col items-center gap-2", metodo === m.v ? "border-accent bg-accent/5" : "border-border hover:border-muted-foreground")}>
                  <m.i className="w-6 h-6" /><span className="text-sm font-medium">{m.v}</span>
                </button>
              ))}
            </div>
            <div className="p-4 bg-muted rounded-lg space-y-1 text-sm">
              <div className="flex justify-between"><span>Cancha</span><span>S/ {sel.slot.precio}</span></div>
              <div className="flex justify-between"><span>Extras</span><span>S/ {totalExtras}</span></div>
              <div className="flex justify-between font-bold text-base pt-2 border-t"><span>Total</span><span>S/ {total}</span></div>
            </div>
            <div className="text-xs flex items-start gap-2 text-muted-foreground bg-warning/10 p-3 rounded-md">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              No se confirma la reserva sin pago aprobado o validación manual del comprobante.
            </div>
          </div>
        )}
      </Card>

      <div className="flex justify-between gap-2">
        <Button variant="outline" onClick={() => step === 0 ? nav(-1) : setStep(step - 1)}><X className="w-4 h-4 mr-1" />{step === 0 ? "Cancelar" : "Atrás"}</Button>
        {step < 2 ? (
          <Button className="bg-gradient-accent border-0" onClick={() => setStep(step + 1)}>Continuar</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => finalizar(true)}><Upload className="w-4 h-4 mr-1" />Subir comprobante</Button>
            <Button className="bg-gradient-accent border-0" onClick={() => finalizar(false)}><CreditCard className="w-4 h-4 mr-1" />Pagar ahora</Button>
          </div>
        )}
      </div>
    </div>
  );
}
