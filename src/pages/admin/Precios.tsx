import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { canchas, reglasPrecioMock } from "@/data/mock";
import { Plus, Info, Trash2 } from "lucide-react";
import { toast } from "sonner";

const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function Precios() {
  const [reglas, setReglas] = useState(reglasPrecioMock);
  const [form, setForm] = useState<any>({ canchaId: canchas[0].id, diaSemana: "Viernes", horaInicio: "18:00", horaFin: "22:00", tarifa: 150 });

  const agregar = () => {
    if (form.horaFin <= form.horaInicio) return toast.error("Hora fin debe ser mayor a hora inicio");
    setReglas([...reglas, { id: crypto.randomUUID(), ...form }]);
    toast.success("Regla creada");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Precios dinámicos</h1>
        <p className="text-muted-foreground">Crea reglas por cancha, día y horario</p>
      </div>

      <Card className="p-5 bg-info/5 border-info/30 flex gap-3 items-start">
        <Info className="w-5 h-5 text-info mt-0.5" />
        <p className="text-sm">Si no existe una regla específica para un slot, se aplica la <b>tarifa estándar</b> de la cancha.</p>
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold mb-3">Nueva regla</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div><Label>Cancha</Label>
            <Select value={form.canchaId} onValueChange={(v) => setForm({ ...form, canchaId: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{canchas.map(c => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Día</Label>
            <Select value={form.diaSemana} onValueChange={(v) => setForm({ ...form, diaSemana: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{dias.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Inicio</Label><Input type="time" value={form.horaInicio} onChange={(e) => setForm({ ...form, horaInicio: e.target.value })} /></div>
          <div><Label>Fin</Label><Input type="time" value={form.horaFin} onChange={(e) => setForm({ ...form, horaFin: e.target.value })} /></div>
          <div><Label>Tarifa S/</Label><Input type="number" value={form.tarifa} onChange={(e) => setForm({ ...form, tarifa: +e.target.value })} /></div>
        </div>
        <Button className="mt-4 bg-gradient-accent border-0" onClick={agregar}><Plus className="w-4 h-4 mr-1" />Agregar regla</Button>
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold mb-3">Reglas activas</h2>
        <div className="space-y-2">
          {reglas.map(r => {
            const c = canchas.find(c => c.id === r.canchaId);
            return (
              <div key={r.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{c?.nombre} · {r.diaSemana}</div>
                  <div className="text-xs text-muted-foreground">{r.horaInicio} - {r.horaFin}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-accent">S/ {r.tarifa}/h</span>
                  <Button size="icon" variant="ghost" onClick={() => setReglas(reglas.filter(x => x.id !== r.id))}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
