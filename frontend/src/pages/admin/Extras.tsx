import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { extrasMock } from "@/data/mock";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, AlertTriangle, Package, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Extras() {
  const [list, setList] = useState(extrasMock);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventario de extras</h1>
          <p className="text-muted-foreground">Pelotas, chalecos, árbitros y más</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="bg-gradient-accent border-0"><Plus className="w-4 h-4 mr-1" />Nuevo extra</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuevo extra</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nombre</Label><Input /></div>
              <div className="grid grid-cols-3 gap-2">
                <div><Label>Tipo</Label><Input /></div>
                <div><Label>Cantidad</Label><Input type="number" /></div>
                <div><Label>Precio S/</Label><Input type="number" /></div>
              </div>
            </div>
            <DialogFooter><Button className="bg-gradient-accent border-0" onClick={() => { toast.success("Extra agregado"); setOpen(false); }}>Guardar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map(e => {
          const alerta = e.cantidad === 0 || e.estado === "DAÑADO";
          return (
            <Card key={e.id} className={`p-5 ${alerta ? "border-destructive/40 bg-destructive/5" : ""}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-accent/10 grid place-items-center"><Package className="w-5 h-5 text-accent" /></div>
                <StatusBadge status={e.estado} className="text-[10px]" />
              </div>
              <div className="font-semibold">{e.nombre}</div>
              <div className="text-xs text-muted-foreground">{e.tipo}</div>
              <div className="flex justify-between mt-3 items-end">
                <div>
                  <div className="text-xs text-muted-foreground">Stock</div>
                  <div className={`font-bold text-lg ${e.cantidad === 0 ? "text-destructive" : ""}`}>{e.cantidad}</div>
                </div>
                <div className="font-bold text-accent">S/ {e.precio}</div>
              </div>
              {alerta && (
                <div className="mt-3 text-xs text-destructive flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {e.cantidad === 0 ? "Sin stock disponible" : "Equipo dañado"}
                </div>
              )}
              <div className="flex gap-1 mt-3 pt-3 border-t">
                <Button size="sm" variant="ghost" className="flex-1"><Edit className="w-3 h-3 mr-1" />Editar</Button>
                <Button size="icon" variant="ghost"><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
