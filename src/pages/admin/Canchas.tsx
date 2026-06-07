import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { canchas as data } from "@/data/mock";
import { Plus, Trophy, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function Canchas() {
  const [list, setList] = useState(data);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de canchas</h1>
          <p className="text-muted-foreground">CRUD de canchas de tu complejo</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="bg-gradient-accent border-0"><Plus className="w-4 h-4 mr-1" />Nueva cancha</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nueva cancha</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nombre</Label><Input /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Deporte</Label><Input defaultValue="Fútbol" /></div>
                <div><Label>Superficie</Label><Input defaultValue="Grass" /></div>
              </div>
              <div className="grid grid-cols-3 gap-2 items-end">
                <label className="flex items-center gap-2 text-sm"><Switch defaultChecked /> Techado</label>
                <label className="flex items-center gap-2 text-sm"><Switch defaultChecked /> Iluminación</label>
                <div><Label>Tarifa</Label><Input type="number" defaultValue={120} /></div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => { toast.success("Cancha creada"); setOpen(false); }} className="bg-gradient-accent border-0">Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="cards">
        <TabsList><TabsTrigger value="cards">Tarjetas</TabsTrigger><TabsTrigger value="table">Tabla</TabsTrigger></TabsList>
        <TabsContent value="cards" className="mt-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map(c => (
              <Card key={c.id} className="p-5 hover:shadow-elegant transition">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 grid place-items-center"><Trophy className="w-6 h-6 text-accent" /></div>
                  <Badge variant={c.activo ? "default" : "secondary"} className={c.activo ? "bg-accent text-accent-foreground" : ""}>{c.activo ? "Activo" : "Inactivo"}</Badge>
                </div>
                <div className="font-semibold">{c.nombre}</div>
                <div className="text-xs text-muted-foreground">{c.deporte} · {c.superficie}</div>
                <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
                  {c.techado && <Badge variant="outline">Techado</Badge>}
                  {c.iluminacion && <Badge variant="outline">Iluminada</Badge>}
                </div>
                <div className="mt-3 pt-3 border-t flex justify-between items-center">
                  <span className="font-bold">S/ {c.tarifaEstandar}</span>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost"><Edit className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="table" className="mt-4">
          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Deporte</TableHead><TableHead>Superficie</TableHead><TableHead>Tarifa</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
              <TableBody>
                {list.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.nombre}</TableCell>
                    <TableCell>{c.deporte}</TableCell>
                    <TableCell>{c.superficie}</TableCell>
                    <TableCell>S/ {c.tarifaEstandar}</TableCell>
                    <TableCell><Badge className={c.activo ? "bg-accent text-accent-foreground" : ""}>{c.activo ? "Activo" : "Inactivo"}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
