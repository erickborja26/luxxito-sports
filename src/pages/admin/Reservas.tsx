import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { reservasMock, Reserva } from "@/data/mock";
import { StatusBadge } from "@/components/StatusBadge";
import { Eye, Wrench, X } from "lucide-react";
import { toast } from "sonner";

export default function ReservasAdmin() {
  const [estado, setEstado] = useState<string>("todas");
  const [sel, setSel] = useState<Reserva | null>(null);
  const [cancelar, setCancelar] = useState<Reserva | null>(null);

  const filtradas = reservasMock.filter(r => estado === "todas" || r.estado === estado);

  const horas24 = cancelar ? (new Date(cancelar.fechaInicio).getTime() - Date.now()) / 3600000 >= 24 : false;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Reservas</h1>
          <p className="text-muted-foreground">Gestiona y filtra todas las reservas</p>
        </div>
      </div>

      <Card className="p-4 grid grid-cols-2 md:grid-cols-5 gap-3">
        <Input type="date" />
        <Input placeholder="Cancha" />
        <Input placeholder="Jugador" />
        <Select value={estado} onValueChange={setEstado}>
          <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todos los estados</SelectItem>
            {["PENDIENTE", "BLOQUEADA", "CONFIRMADA", "CANCELADA", "VENCIDA"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline"><Wrench className="w-4 h-4 mr-1" />Bloquear horario</Button>
      </Card>

      <Card>
        <Table>
          <TableHeader><TableRow>
            <TableHead>Cancha</TableHead><TableHead>Jugador</TableHead><TableHead>Fecha</TableHead>
            <TableHead>Método</TableHead><TableHead>Total</TableHead><TableHead>Estado</TableHead><TableHead>Acciones</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filtradas.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.canchaNombre}</TableCell>
                <TableCell>{r.jugador}</TableCell>
                <TableCell>{new Date(r.fechaInicio).toLocaleString("es-PE")}</TableCell>
                <TableCell>{r.metodoPago || "-"}</TableCell>
                <TableCell>S/ {r.precio}</TableCell>
                <TableCell><StatusBadge status={r.estado} /></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => setSel(r)}><Eye className="w-4 h-4" /></Button>
                    {r.estado !== "CANCELADA" && r.estado !== "VENCIDA" && (
                      <Button size="icon" variant="ghost" onClick={() => setCancelar(r)}><X className="w-4 h-4 text-destructive" /></Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!sel} onOpenChange={() => setSel(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detalle de reserva</DialogTitle></DialogHeader>
          {sel && (
            <div className="space-y-2 text-sm">
              <p><b>ID:</b> {sel.id}</p>
              <p><b>Cancha:</b> {sel.canchaNombre} · {sel.complejoNombre}</p>
              <p><b>Jugador:</b> {sel.jugador}</p>
              <p><b>Inicio:</b> {new Date(sel.fechaInicio).toLocaleString("es-PE")}</p>
              <p><b>Fin:</b> {new Date(sel.fechaFin).toLocaleString("es-PE")}</p>
              <p><b>Total:</b> S/ {sel.precio}</p>
              <p><b>Estado:</b> <StatusBadge status={sel.estado} /></p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!cancelar} onOpenChange={() => setCancelar(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cancelar reserva</DialogTitle></DialogHeader>
          {cancelar && (
            <div className="space-y-3">
              <p className="text-sm">¿Cancelar reserva de <b>{cancelar.canchaNombre}</b>?</p>
              <div className={`p-3 rounded-md text-sm ${horas24 ? "bg-accent/10 text-accent-foreground border border-accent/30" : "bg-destructive/10 text-destructive border border-destructive/30"}`}>
                {horas24 ? "✓ Faltan 24h o más: reembolso completo." : "⚠️ Menos de 24h: no hay reembolso."}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelar(null)}>Cerrar</Button>
            <Button variant="destructive" onClick={() => { toast.success("Reserva cancelada"); setCancelar(null); }}>Confirmar cancelación</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
