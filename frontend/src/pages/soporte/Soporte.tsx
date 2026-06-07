import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { incidenciasMock, Incidencia } from "@/data/mock";
import { StatusBadge } from "@/components/StatusBadge";
import { Activity, Clock, AlertOctagon, ServerCrash, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function Soporte() {
  const [list, setList] = useState(incidenciasMock);
  const [sel, setSel] = useState<Incidencia | null>(null);
  const [comment, setComment] = useState("");

  const sev = { baja: "bg-info text-info-foreground", media: "bg-warning text-warning-foreground", alta: "bg-destructive text-destructive-foreground" } as const;

  const metricas = [
    { l: "Uptime 30d", v: "99.94%", i: Activity, cls: "bg-accent/10 text-accent" },
    { l: "Latencia P95", v: "324ms", i: Clock, cls: "bg-info/10 text-info" },
    { l: "Errores 24h", v: "17", i: AlertOctagon, cls: "bg-warning/10 text-warning" },
    { l: "Cola Celery", v: "8 jobs", i: ServerCrash, cls: "bg-destructive/10 text-destructive" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Panel de soporte</h1>
        <p className="text-muted-foreground">Monitoreo técnico e incidencias</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricas.map(m => (
          <Card key={m.l} className="p-5">
            <div className={`w-10 h-10 rounded-lg grid place-items-center mb-3 ${m.cls}`}><m.i className="w-5 h-5" /></div>
            <div className="text-2xl font-bold">{m.v}</div>
            <div className="text-xs text-muted-foreground">{m.l}</div>
          </Card>
        ))}
      </div>

      <Card className="p-5 bg-accent/5 border-accent/30">
        <div className="text-sm"><b className="text-accent">142</b> bloqueos temporales expirados liberados automáticamente en las últimas 24h.</div>
      </Card>

      <Card>
        <div className="p-4 border-b font-semibold">Incidencias</div>
        <Table>
          <TableHeader><TableRow><TableHead>Título</TableHead><TableHead>Severidad</TableHead><TableHead>Estado</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {list.map(i => (
              <TableRow key={i.id}>
                <TableCell className="font-medium">{i.titulo}<div className="text-xs text-muted-foreground">{i.descripcion}</div></TableCell>
                <TableCell><span className={`px-2 py-0.5 rounded text-xs font-semibold ${sev[i.severidad]}`}>{i.severidad.toUpperCase()}</span></TableCell>
                <TableCell><StatusBadge status={i.estado} /></TableCell>
                <TableCell><Button size="sm" variant="outline" onClick={() => setSel(i)}>Ver</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!sel} onOpenChange={() => setSel(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{sel?.titulo}</DialogTitle></DialogHeader>
          {sel && (
            <div className="space-y-3 text-sm">
              <p>{sel.descripcion}</p>
              <div>
                <label className="text-xs font-medium">Cambiar estado</label>
                <Select defaultValue={sel.estado} onValueChange={(v) => {
                  setList(list.map(x => x.id === sel.id ? { ...x, estado: v as any } : x));
                  toast.success("Estado actualizado");
                }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["ABIERTA", "EN_PROCESO", "RESUELTA"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium flex items-center gap-1"><MessageSquare className="w-3 h-3" />Comentario</label>
                <Textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => { toast.success("Comentario registrado"); setSel(null); setComment(""); }} className="bg-gradient-accent border-0">Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
