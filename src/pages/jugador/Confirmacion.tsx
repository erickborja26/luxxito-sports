import { useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, MessageCircle, CalendarCheck, Clock3, Check, MapPin } from "lucide-react";
import { ReservaJugador } from "@/context/ReservasContext";
import { CourtLines } from "@/components/SportsBackground";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Lluvia de confeti al confirmar el pago; oculta si el usuario prefiere menos movimiento
const Confeti = () => {
  const piezas = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.9,
        duration: 2.6 + Math.random() * 1.8,
        color: ["#10b981", "#fbbf24", "#2563eb", "#ef4444", "#d9ed4f", "#e8702a"][i % 6],
        size: 6 + Math.random() * 6,
      })),
    []
  );
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden motion-reduce:hidden">
      {piezas.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 animate-confetti-fall rounded-[2px]"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.45,
            backgroundColor: p.color,
            "--confetti-duration": `${p.duration}s`,
            "--confetti-delay": `${p.delay}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

// Patrón pseudo-QR determinístico a partir del código de reserva
const celdasQR = (codigo: string) => {
  let h = 0;
  for (const ch of codigo) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return Array.from({ length: 144 }, (_, i) => ((h >> i % 32) ^ (i * 2654435761)) % 3 === 0);
};

const Dato = ({ etiqueta, valor, mono = false }: { etiqueta: string; valor: string; mono?: boolean }) => (
  <div>
    <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">{etiqueta}</div>
    <div className={cn("text-sm font-semibold", mono && "font-mono")}>{valor}</div>
  </div>
);

export default function Confirmacion() {
  const loc = useLocation();
  const state = (loc.state as { reserva?: ReservaJugador; pendiente?: boolean }) || {};
  const reserva = state.reserva;
  const pendiente = state.pendiente ?? reserva?.estado === "PENDIENTE";

  const codigo = reserva?.codigo || "LX-DEMO01";
  const celdas = celdasQR(codigo);
  const inicio = reserva ? new Date(reserva.fechaInicio) : new Date();

  const pasos = pendiente
    ? [
        { label: "Comprobante enviado", estado: "done" as const },
        { label: "En validación", estado: "active" as const },
        { label: "Confirmada", estado: "pending" as const },
      ]
    : [
        { label: "Pago aprobado", estado: "done" as const },
        { label: "Reserva confirmada", estado: "done" as const },
        { label: "Listo para jugar", estado: "done" as const },
      ];

  return (
    <div className="max-w-lg mx-auto">
      {!pendiente && <Confeti />}

      {/* Ticket */}
      <div className="rounded-3xl overflow-hidden shadow-elegant bg-card">
        {/* Cabecera oscura */}
        <div className="relative overflow-hidden bg-gradient-hero text-white px-6 sm:px-8 pt-8 pb-6 text-center">
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none">
            <div className="absolute -right-28 -top-32 w-80 h-80 motion-safe:animate-spin-slow [animation-duration:120s]">
              <CourtLines className="w-full h-full text-white opacity-[0.10]" />
            </div>
            <div className="absolute -left-20 -bottom-24 w-64 h-64 rounded-full bg-accent/25 blur-3xl motion-safe:animate-aurora" />
            <div className="absolute -inset-x-1/4 top-0 h-full -rotate-12 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent motion-safe:animate-beam" />
          </div>

          <div className="relative z-10">
            <div
              className={cn(
                "w-16 h-16 mx-auto rounded-2xl grid place-items-center mb-4 motion-safe:animate-pop-in backdrop-blur-sm",
                pendiente ? "bg-warning/25 text-warning shadow-[0_0_40px_hsl(32_95%_55%/0.35)]" : "bg-accent/25 text-accent shadow-glow"
              )}
            >
              {pendiente ? <Clock3 className="w-8 h-8" /> : <CheckCircle className="w-8 h-8" />}
            </div>
            <h1 className="text-2xl font-bold">{pendiente ? "¡Comprobante recibido!" : "¡Nos vemos en la cancha!"}</h1>
            <p className="text-sm text-white/70 mt-1 max-w-xs mx-auto">
              {pendiente
                ? "Validaremos tu pago en máximo 30 minutos y te avisaremos."
                : "Tu pago fue aprobado y tu horario está asegurado."}
            </p>

            {/* Timeline de estado */}
            <div className="flex items-center justify-center mt-6 mb-1">
              {pasos.map((p, i) => (
                <div key={p.label} className="flex items-center">
                  <div className="flex flex-col items-center w-24">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full grid place-items-center text-[11px] font-bold transition-colors",
                        p.estado === "done" && "bg-accent text-accent-foreground",
                        p.estado === "active" && "bg-warning text-warning-foreground motion-safe:animate-pulse",
                        p.estado === "pending" && "bg-white/15 text-white/50"
                      )}
                    >
                      {p.estado === "done" ? <Check className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <span className={cn("text-[10px] mt-1.5 leading-tight", p.estado === "pending" ? "text-white/40" : "text-white/80")}>
                      {p.label}
                    </span>
                  </div>
                  {i < pasos.length - 1 && (
                    <div className={cn("w-8 sm:w-12 h-0.5 -mt-5", p.estado === "done" ? "bg-accent" : "bg-white/15")} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Perforación del ticket */}
        <div className="relative h-0">
          <div className="absolute -left-3.5 -top-3.5 w-7 h-7 rounded-full" style={{ backgroundColor: "hsl(var(--background))" }} />
          <div className="absolute -right-3.5 -top-3.5 w-7 h-7 rounded-full" style={{ backgroundColor: "hsl(var(--background))" }} />
          <div className="absolute inset-x-6 -top-px border-t-2 border-dashed border-border" />
        </div>

        {/* Cuerpo del ticket */}
        <div className="px-6 sm:px-8 py-6 space-y-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-lg font-bold leading-tight">{reserva?.canchaNombre || "Cancha 1"}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />{reserva?.complejoNombre || "Luxxito San Borja"}
              </div>
            </div>
            <span className="font-mono text-xs font-bold bg-muted rounded-lg px-3 py-1.5">{codigo}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-4">
            <Dato etiqueta="Fecha" valor={inicio.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })} />
            <Dato etiqueta="Hora" valor={inicio.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })} />
            <Dato etiqueta="Duración" valor="1 hora" />
            <Dato etiqueta="Método de pago" valor={reserva?.metodoPago || "Tarjeta"} />
            <Dato
              etiqueta="Extras"
              valor={reserva?.extras && reserva.extras.length > 0 ? reserva.extras.map(e => `${e.nombre} ×${e.cantidad}`).join(", ") : "Ninguno"}
            />
          </div>

          {/* Total destacado */}
          <div className="flex items-center justify-between rounded-2xl bg-gradient-accent text-accent-foreground px-5 py-3.5">
            <span className="text-sm font-medium opacity-90">Total pagado</span>
            <span className="text-2xl font-bold">S/ {reserva?.precio ?? 0}</span>
          </div>

          {/* QR con marco de escáner */}
          <div className="flex flex-col items-center pt-1">
            <div className="relative p-4 bg-white rounded-2xl ring-1 ring-border shadow-card">
              {/* Esquinas del visor */}
              <span aria-hidden="true" className="absolute top-1.5 left-1.5 w-4 h-4 border-t-2 border-l-2 border-accent rounded-tl-md" />
              <span aria-hidden="true" className="absolute top-1.5 right-1.5 w-4 h-4 border-t-2 border-r-2 border-accent rounded-tr-md" />
              <span aria-hidden="true" className="absolute bottom-1.5 left-1.5 w-4 h-4 border-b-2 border-l-2 border-accent rounded-bl-md" />
              <span aria-hidden="true" className="absolute bottom-1.5 right-1.5 w-4 h-4 border-b-2 border-r-2 border-accent rounded-br-md" />
              <div className="w-36 h-36 grid grid-cols-12 gap-px" role="img" aria-label={`Código QR de ingreso para la reserva ${codigo}`}>
                {celdas.map((on, i) => (
                  <div key={i} className={on ? "bg-slate-900 rounded-[1px]" : "bg-transparent"} />
                ))}
              </div>
            </div>
            <p className="text-xs mt-2.5 text-muted-foreground">Muestra este QR al ingresar al complejo</p>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-5">
        <Button variant="outline" className="bg-card" onClick={() => toast.success("Comprobante descargado en PDF (demo).")}>
          <Download className="w-4 h-4 mr-2" />Descargar
        </Button>
        <Button variant="outline" className="bg-card" onClick={() => toast.success("Detalle enviado por WhatsApp (demo).")}>
          <MessageCircle className="w-4 h-4 mr-2" />WhatsApp
        </Button>
        <Link to="/jugador/reservas" className="col-span-2 sm:col-span-1">
          <Button className="w-full bg-gradient-accent border-0 shadow-glow hover:-translate-y-0.5 hover:brightness-110 transition-all duration-200">
            <CalendarCheck className="w-4 h-4 mr-2" />Mis reservas
          </Button>
        </Link>
      </div>
    </div>
  );
}
