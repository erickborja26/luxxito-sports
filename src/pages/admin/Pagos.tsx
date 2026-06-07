import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { comprobantesMock } from "@/data/mock";
import { Check, X, AlertTriangle, Clock, Receipt } from "lucide-react";
import { toast } from "sonner";

export default function Pagos() {
  const [list, setList] = useState(comprobantesMock);
  const [rechazar, setRechazar] = useState<string | null>(null);
  const [motivo, setMotivo] = useState("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

  const aprobar = (id: string) => { setList(list.filter(c => c.id !== id)); toast.success("Pago aprobado"); };
  const doRechazar = () => {
    if (!motivo.trim()) return toast.error("Indica un motivo");
    setList(list.filter(c => c.id !== rechazar));
    toast.success("Rechazado. Intento de fraude registrado.");
    setRechazar(null); setMotivo("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Validar pagos manuales</h1>
        <p className="text-muted-foreground">Aprueba o rechaza comprobantes en máximo 30 minutos</p>
      </div>

      {list.length === 0 && (
        <Card className="p-10 text-center text-muted-foreground">
          <Receipt className="w-10 h-10 mx-auto mb-2 opacity-50" />Bandeja vacía
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {list.map(c => {
          const subidoMs = new Date(c.subidoEn).getTime();
          const transcurrido = (now - subidoMs) / 60000;
          const restante = Math.max(0, 30 - transcurrido);
          const urgente = restante < 10;
          const expirado = restante === 0;
          const diferencia = c.monto !== c.montoEsperado;

          return (
            <Card key={c.id} className={`p-5 ${expirado ? "border-destructive bg-destructive/5" : urgente ? "border-warning bg-warning/5" : ""}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold">{c.jugador}</div>
                  <div className="text-xs text-muted-foreground">Reserva {c.reservaId} · {c.metodo}</div>
                </div>
                <Badge className={expirado ? "bg-destructive text-destructive-foreground" : urgente ? "bg-warning text-warning-foreground" : "bg-secondary"}>
                  <Clock className="w-3 h-3 mr-1" />{restante.toFixed(0)} min
                </Badge>
              </div>

              <div className="aspect-video bg-gradient-to-br from-muted to-secondary rounded-md grid place-items-center mb-3 text-muted-foreground text-xs">
                [Imagen del voucher]
              </div>

              <div className="space-y-1 text-sm mb-3">
                <div className="flex justify-between"><span className="text-muted-foreground">Monto informado</span><span className="font-semibold">S/ {c.monto}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Monto esperado</span><span className="font-semibold">S/ {c.montoEsperado}</span></div>
                {diferencia && <div className="text-xs text-destructive flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Diferencia detectada</div>}
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => aprobar(c.id)}><Check className="w-4 h-4 mr-1" />Aprobar</Button>
                <Button className="flex-1" variant="destructive" onClick={() => setRechazar(c.id)}><X className="w-4 h-4 mr-1" />Rechazar</Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!rechazar} onOpenChange={() => setRechazar(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rechazar comprobante</DialogTitle></DialogHeader>
          <Textarea placeholder="Motivo del rechazo (se registrará como intento de fraude)" value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={4} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRechazar(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={doRechazar}>Confirmar rechazo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
