import { useLocation, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, MessageCircle, CalendarCheck, Clock3 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { ReservaJugador } from "@/context/ReservasContext";
import { toast } from "sonner";

// Patrón pseudo-QR determinístico a partir del código de reserva
const celdasQR = (codigo: string) => {
  let h = 0;
  for (const ch of codigo) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return Array.from({ length: 100 }, (_, i) => ((h >> i % 32) ^ (i * 2654435761)) % 3 === 0);
};

export default function Confirmacion() {
  const loc = useLocation();
  const state = (loc.state as { reserva?: ReservaJugador; pendiente?: boolean }) || {};
  const reserva = state.reserva;
  const pendiente = state.pendiente ?? reserva?.estado === "PENDIENTE";

  const codigo = reserva?.codigo || "LX-DEMO01";
  const celdas = celdasQR(codigo);

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8 text-center">
        <div className={`w-20 h-20 mx-auto rounded-full grid place-items-center mb-4 ${pendiente ? "bg-warning/20 text-warning" : "bg-accent/20 text-accent"}`}>
          {pendiente ? <Clock3 className="w-10 h-10" /> : <CheckCircle className="w-10 h-10" />}
        </div>
        <h1 className="text-2xl font-bold">{pendiente ? "¡Comprobante recibido!" : "¡Reserva confirmada!"}</h1>
        <p className="text-muted-foreground mb-4">
          {pendiente
            ? "Tu reserva quedará confirmada cuando validemos tu pago (máximo 30 minutos). Te avisaremos."
            : "Tu pago fue aprobado. Te esperamos en la cancha."}
        </p>
        <StatusBadge status={pendiente ? "PENDIENTE" : "CONFIRMADA"} label={pendiente ? "Pendiente de validación" : "Confirmada"} />

        <div className="my-6 p-4 bg-muted rounded-lg text-left space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Código de reserva</span><span className="font-mono font-bold">{codigo}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Cancha</span><span className="font-medium">{reserva?.canchaNombre || "Cancha 1"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Complejo</span><span className="font-medium">{reserva?.complejoNombre || "Luxxito San Borja"}</span></div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fecha y hora</span>
            <span className="font-medium">
              {reserva ? new Date(reserva.fechaInicio).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" }) : "—"}
            </span>
          </div>
          {reserva?.extras && reserva.extras.length > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Extras</span>
              <span className="font-medium text-right">{reserva.extras.map(e => `${e.nombre} ×${e.cantidad}`).join(", ")}</span>
            </div>
          )}
          <div className="flex justify-between"><span className="text-muted-foreground">Método de pago</span><span className="font-medium">{reserva?.metodoPago || "Tarjeta"}</span></div>
          <div className="flex justify-between border-t pt-2 mt-2"><span className="font-bold">Total</span><span className="font-bold">S/ {reserva?.precio ?? 0}</span></div>
        </div>

        <div className="my-6 inline-block p-4 bg-white border-2 rounded-lg">
          <div className="w-40 h-40 grid grid-cols-10 gap-0.5" role="img" aria-label={`Código QR de ingreso para la reserva ${codigo}`}>
            {celdas.map((on, i) => (
              <div key={i} className={on ? "bg-foreground" : "bg-transparent"} />
            ))}
          </div>
          <p className="text-xs mt-2 text-muted-foreground">Muestra este QR al ingresar · {codigo}</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          <Button variant="outline" onClick={() => toast.success("Comprobante descargado en PDF (demo).")}>
            <Download className="w-4 h-4 mr-2" />Descargar
          </Button>
          <Button variant="outline" onClick={() => toast.success("Detalle enviado por WhatsApp (demo).")}>
            <MessageCircle className="w-4 h-4 mr-2" />WhatsApp
          </Button>
          <Link to="/jugador/reservas">
            <Button className="bg-gradient-accent border-0"><CalendarCheck className="w-4 h-4 mr-2" />Ver mis reservas</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
