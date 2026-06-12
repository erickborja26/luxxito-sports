import { FormEvent, useEffect, useState } from "react";
import { AlertTriangle, Edit, Package, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, Paginated, unwrap } from "@/lib/api";
import { Extra, mapExtra } from "@/lib/domain";

type ExtraForm = Pick<Extra, "nombre" | "tipo" | "cantidad" | "estado" | "precio">;

const emptyExtra: ExtraForm = { nombre: "", tipo: "Equipo", cantidad: 1, estado: "OPERATIVO", precio: 10 };

export default function Extras() {
  const [extras, setExtras] = useState<Extra[]>([]);
  const [complexId, setComplexId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Extra | null>(null);
  const [form, setForm] = useState<ExtraForm>(emptyExtra);

  const load = async () => {
    const [extrasData, complexes] = await Promise.all([
      api<Paginated<any> | any[]>("/extras/?page_size=100"),
      api<Paginated<any> | any[]>("/complejos/?page_size=100"),
    ]);
    setExtras(unwrap(extrasData).map(mapExtra));
    setComplexId(unwrap(complexes)[0]?.id || "");
  };

  useEffect(() => {
    load().catch((error) => toast.error(error.message));
  }, []);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyExtra);
    setDialogOpen(true);
  };

  const openEdit = (extra: Extra) => {
    setEditingId(extra.id);
    setForm({ nombre: extra.nombre, tipo: extra.tipo, cantidad: extra.cantidad, estado: extra.estado, precio: extra.precio });
    setDialogOpen(true);
  };

  const saveExtra = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.nombre.trim() || !form.tipo.trim()) {
      toast.error("Completa el nombre y tipo del extra.");
      return;
    }
    if (form.cantidad < 0 || form.precio < 0) {
      toast.error("El stock y el precio no pueden ser negativos.");
      return;
    }
    try {
      await api(editingId ? `/extras/${editingId}/` : "/extras/", {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify({
          complejo_id: complexId,
          nombre: form.nombre,
          tipo: form.tipo,
          cantidad: form.cantidad,
          estado: form.estado,
          precio: form.precio,
          activo: true,
        }),
      });
      await load();
      toast.success(editingId ? "Extra actualizado." : "Extra agregado al inventario.");
      setDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar");
    }
  };

  const totalUnits = extras.reduce((sum, extra) => sum + extra.cantidad, 0);
  const alerts = extras.filter((extra) => extra.cantidad === 0 || extra.estado === "DANADO").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-3xl font-bold">Inventario de extras</h1><p className="text-muted-foreground">Controla equipos, servicios, stock disponible y precio por reserva.</p></div>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />Nuevo extra</Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4"><div className="text-2xl font-bold">{extras.length}</div><div className="text-xs text-muted-foreground">Tipos de extras</div></Card>
        <Card className="p-4"><div className="text-2xl font-bold">{totalUnits}</div><div className="text-xs text-muted-foreground">Unidades disponibles</div></Card>
        <Card className={`p-4 ${alerts ? "border-destructive/30 bg-destructive/5" : ""}`}><div className="text-2xl font-bold">{alerts}</div><div className="text-xs text-muted-foreground">Alertas de inventario</div></Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {extras.map((extra) => {
          const hasAlert = extra.cantidad === 0 || extra.estado === "DANADO";
          return (
            <Card key={extra.id} className={`p-5 ${hasAlert ? "border-destructive/40 bg-destructive/5" : ""}`}>
              <div className="mb-4 flex items-start justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent/10"><Package className="h-5 w-5 text-accent" /></div>
                <StatusBadge status={extra.estado} />
              </div>
              <h2 className="font-semibold">{extra.nombre}</h2>
              <p className="text-sm text-muted-foreground">{extra.tipo}</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/50 p-3"><div className="text-xs text-muted-foreground">Stock</div><div className={`text-xl font-bold ${extra.cantidad === 0 ? "text-destructive" : ""}`}>{extra.cantidad}</div></div>
                <div className="rounded-lg bg-muted/50 p-3"><div className="text-xs text-muted-foreground">Precio</div><div className="text-xl font-bold">S/ {extra.precio}</div></div>
              </div>
              {hasAlert && <div className="mt-3 flex items-center gap-2 text-xs text-destructive"><AlertTriangle className="h-3.5 w-3.5" />{extra.cantidad === 0 ? "Sin stock disponible" : "Marcado como dañado"}</div>}
              <div className="mt-4 flex gap-2 border-t pt-4">
                <Button className="flex-1" size="sm" variant="outline" onClick={() => openEdit(extra)}><Edit className="mr-2 h-3.5 w-3.5" />Editar</Button>
                <Button size="icon" variant="ghost" aria-label={`Eliminar ${extra.nombre}`} onClick={() => setDeleteTarget(extra)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? "Editar extra" : "Nuevo extra"}</DialogTitle></DialogHeader>
          <form onSubmit={saveExtra} className="space-y-4">
            <div><Label htmlFor="extra-name">Nombre</Label><Input id="extra-name" placeholder="Ej. Pelota de fútbol" value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} /></div>
            <div><Label htmlFor="extra-type">Tipo</Label><Input id="extra-type" placeholder="Equipo, servicio, indumentaria..." value={form.tipo} onChange={(event) => setForm({ ...form, tipo: event.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label htmlFor="stock">Stock</Label><Input id="stock" type="number" min="0" value={form.cantidad} onChange={(event) => setForm({ ...form, cantidad: Number(event.target.value) })} /></div>
              <div><Label htmlFor="extra-price">Precio (S/)</Label><Input id="extra-price" type="number" min="0" value={form.precio} onChange={(event) => setForm({ ...form, precio: Number(event.target.value) })} /></div>
            </div>
            <div><Label>Estado</Label><Select value={form.estado} onValueChange={(value: Extra["estado"]) => setForm({ ...form, estado: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="OPERATIVO">Operativo</SelectItem><SelectItem value="DANADO">Dañado</SelectItem></SelectContent></Select></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">{editingId ? "Guardar cambios" : "Agregar extra"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Eliminar extra</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">¿Deseas eliminar <strong>{deleteTarget?.nombre}</strong> del inventario? Ya no podrá agregarse a nuevas reservas.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={async () => {
              if (!deleteTarget) return;
              try {
                await api(`/extras/${deleteTarget.id}/`, { method: "DELETE" });
                setExtras((current) => current.filter((extra) => extra.id !== deleteTarget.id));
                setDeleteTarget(null);
                toast.success("Extra eliminado.");
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "No se pudo eliminar");
              }
            }}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
