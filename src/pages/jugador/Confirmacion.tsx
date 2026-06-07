import { useLocation, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, MessageCircle, Home, AlertCircle } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

export default function Confirmacion() {
  const loc = useLocation();
  const { sel, total = 100, metodo = "Tarjeta", pendiente = false } = (loc.state as any) || {};

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8 text-center">
        <div className={`w-20 h-20 mx-auto rounded-full grid place-items-center mb-4 ${pendiente ? "bg-warning/20 text-warning" : "bg-accent/20 text-accent"}`}>
          {pendiente ? <AlertCircle className="w-10 h-10" /> : <CheckCircle className="w-10 h-10" />}
        </div>
        <h1 className="text-2xl font-bold">{pendiente ? "¡Comprobante recibido!" : "¡Reserva confirmada!"}</h1>
        <p className="text-muted-foreground mb-4">{pendiente ? "Te avisaremos cuando se valide tu pago." : "Te esperamos en la cancha."}</p>
        <StatusBadge status={pendiente ? "PENDIENTE_REVISION" : "CONFIRMADA"} />

        <div className="my-6 p-4 bg-muted rounded-lg text-left space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Cancha</span><span className="font-medium">{sel?.cancha?.nombre || "Cancha 1"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Hora</span><span className="font-medium">{sel?.slot?.hora || "19:00"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Método</span><span className="font-medium">{metodo}</span></div>
          <div className="flex justify-between border-t pt-2 mt-2"><span className="font-bold">Total</span><span className="font-bold">S/ {total}</span></div>
        </div>

        <div className="my-6 inline-block p-4 bg-white border-2 rounded-lg">
          <div className="w-40 h-40 grid grid-cols-8 gap-0.5">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className={`${(i * 7) % 3 === 0 ? "bg-foreground" : "bg-transparent"}`} />
            ))}
          </div>
          <p className="text-xs mt-2 text-muted-foreground">QR de ingreso</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          <Button variant="outline"><Download className="w-4 h-4 mr-2" />Descargar</Button>
          <Button variant="outline"><MessageCircle className="w-4 h-4 mr-2" />WhatsApp</Button>
          <Link to="/jugador"><Button className="bg-gradient-accent border-0"><Home className="w-4 h-4 mr-2" />Volver</Button></Link>
        </div>
      </Card>
    </div>
  );
}
