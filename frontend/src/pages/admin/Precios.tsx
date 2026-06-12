import { useState } from "react";
import { Info, Plus, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { canchas, ReglaPrecio, reglasPrecioMock } from "@/data/mock";

type PriceRule = ReglaPrecio & { activo: boolean; nombre: string };
type PriceForm = Omit<PriceRule, "id" | "activo">;

const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const initialRules: PriceRule[] = reglasPrecioMock.map((rule, index) => ({
  ...rule,
  activo: true,
  nombre: index === 0 ? "Hora pico nocturna" : index === 1 ? "Fin de semana" : "Promoción lunes",
}));

export default function Precios() {
  const [rules, setRules] = useState<PriceRule[]>(initialRules);
  const [deleteTarget, setDeleteTarget] = useState<PriceRule | null>(null);
  const [form, setForm] = useState<PriceForm>({
    nombre: "",
    canchaId: canchas[0].id,
    diaSemana: "Viernes",
    horaInicio: "18:00",
    horaFin: "22:00",
    tarifa: 150,
  });

  const addRule = () => {
    if (!form.nombre.trim()) {
      toast.error("Escribe un nombre para identificar la regla.");
      return;
    }
    if (form.horaFin <= form.horaInicio) {
      toast.error("La hora final debe ser posterior a la inicial.");
      return;
    }
    if (form.tarifa <= 0) {
      toast.error("La tarifa debe ser mayor a cero.");
      return;
    }
    const overlaps = rules.some((rule) => (
      rule.activo
      && rule.canchaId === form.canchaId
      && rule.diaSemana === form.diaSemana
      && rule.horaInicio < form.horaFin
      && rule.horaFin > form.horaInicio
    ));
    if (overlaps) {
      toast.error("Ya existe una regla activa que se cruza con ese horario.");
      return;
    }
    setRules((current) => [...current, { ...form, id: crypto.randomUUID(), activo: true }]);
    setForm((current) => ({ ...current, nombre: "" }));
    toast.success("Regla de precio creada.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Precios dinámicos</h1>
        <p className="text-muted-foreground">Ajusta tarifas por cancha, día y franja horaria sin crear reglas conflictivas.</p>
      </div>

      <Card className="flex gap-3 border-info/30 bg-info/5 p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-info" />
        <p className="text-sm">Cuando no exista una regla activa, el sistema utilizará automáticamente la tarifa estándar configurada en la cancha.</p>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1fr_1.35fr]">
        <Card className="p-5">
          <h2 className="font-semibold">Nueva regla</h2>
          <p className="mb-5 text-sm text-muted-foreground">Define una franja específica. El sistema evitará solapamientos.</p>
          <div className="space-y-4">
            <div><Label htmlFor="rule-name">Nombre de la regla</Label><Input id="rule-name" placeholder="Ej. Hora valle mañanas" value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} /></div>
            <div><Label>Cancha</Label><Select value={form.canchaId} onValueChange={(value) => setForm({ ...form, canchaId: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{canchas.map((court) => <SelectItem key={court.id} value={court.id}>{court.nombre}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Día de la semana</Label><Select value={form.diaSemana} onValueChange={(value) => setForm({ ...form, diaSemana: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{days.map((day) => <SelectItem key={day} value={day}>{day}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Desde</Label><Input type="time" value={form.horaInicio} onChange={(event) => setForm({ ...form, horaInicio: event.target.value })} /></div>
              <div><Label>Hasta</Label><Input type="time" value={form.horaFin} onChange={(event) => setForm({ ...form, horaFin: event.target.value })} /></div>
            </div>
            <div><Label htmlFor="dynamic-price">Tarifa por hora (S/)</Label><Input id="dynamic-price" type="number" min="1" value={form.tarifa} onChange={(event) => setForm({ ...form, tarifa: Number(event.target.value) })} /></div>
            <Button className="w-full" onClick={addRule}><Plus className="mr-2 h-4 w-4" />Crear regla</Button>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-5 flex items-center justify-between">
            <div><h2 className="font-semibold">Reglas configuradas</h2><p className="text-sm text-muted-foreground">{rules.filter((rule) => rule.activo).length} reglas activas.</p></div>
          </div>
          {rules.length === 0 ? (
            <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">No hay reglas dinámicas. Se aplicarán las tarifas estándar.</div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => {
                const court = canchas.find((item) => item.id === rule.canchaId);
                const baseRate = court?.tarifaEstandar ?? rule.tarifa;
                const isIncrease = rule.tarifa >= baseRate;
                return (
                  <div key={rule.id} className={`rounded-xl border p-4 ${rule.activo ? "" : "opacity-60"}`}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{rule.nombre}</span>
                          <Badge variant="outline">{rule.diaSemana}</Badge>
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">{court?.nombre} · {rule.horaInicio} - {rule.horaFin}</div>
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-1 font-bold text-accent">
                            {isIncrease ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                            S/ {rule.tarifa}
                          </div>
                          <div className="text-xs text-muted-foreground">Base S/ {baseRate}</div>
                        </div>
                        <Switch checked={rule.activo} onCheckedChange={(checked) => setRules((current) => current.map((item) => item.id === rule.id ? { ...item, activo: checked } : item))} aria-label={`Activar regla ${rule.nombre}`} />
                        <Button size="icon" variant="ghost" aria-label={`Eliminar regla ${rule.nombre}`} onClick={() => setDeleteTarget(rule)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Eliminar regla de precio</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">La franja volverá a utilizar la tarifa estándar de la cancha. ¿Deseas eliminar <strong>{deleteTarget?.nombre}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => { if (deleteTarget) setRules((current) => current.filter((rule) => rule.id !== deleteTarget.id)); setDeleteTarget(null); toast.success("Regla eliminada."); }}>Eliminar regla</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
