import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { complejos, canchas, deportes, generarSlots } from "@/data/mock";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const leyenda = [
  { c: "bg-slot-free", l: "Libre" },
  { c: "bg-slot-locked", l: "Bloqueado" },
  { c: "bg-slot-booked", l: "Reservado" },
  { c: "bg-slot-maintenance", l: "Mantenimiento" },
];

export default function Disponibilidad() {
  const [complejo, setComplejo] = useState("c1");
  const [deporte, setDeporte] = useState("Fútbol");
  const [fecha, setFecha] = useState("2026-06-08");
  const [sel, setSel] = useState<any>(null);
  const nav = useNavigate();

  const canchasFiltradas = canchas.filter(c => c.complejoId === complejo && c.deporte === deporte && c.activo);

  const onSlot = (cancha: any, slot: any) => {
    if (slot.estado !== "libre") {
      toast.error(slot.estado === "reservado" ? "Slot ya reservado" : slot.estado === "bloqueado" ? "Slot bloqueado temporalmente" : "Cancha en mantenimiento");
      return;
    }
    setSel({ cancha, slot });
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold">Consultar disponibilidad</h1>
        <p className="text-muted-foreground">Encuentra tu horario perfecto. Precios actualizados en tiempo real.</p>
      </div>

      <Card className="p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div><Label>Complejo</Label>
            <Select value={complejo} onValueChange={setComplejo}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{complejos.map(c => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Deporte</Label>
            <Select value={deporte} onValueChange={setDeporte}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{deportes.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Fecha</Label><Input type="date" value={fecha} onChange={e => setFecha(e.target.value)} /></div>
          <div><Label>Rango horario</Label><Input type="time" defaultValue="18:00" /></div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-4 text-xs">
        {leyenda.map(l => (<div key={l.l} className="flex items-center gap-1.5"><span className={cn("w-3 h-3 rounded", l.c)} />{l.l}</div>))}
      </div>

      {canchasFiltradas.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-lg font-semibold mb-2">Sin disponibilidad</p>
          <p className="text-sm text-muted-foreground">Prueba cambiar el deporte o complejo.</p>
        </Card>
      ) : (
        <div className="space-y-5">
          {canchasFiltradas.map(c => {
            const slots = generarSlots(c.id, fecha);
            return (
              <Card key={c.id} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold">{c.nombre} · {c.deporte}</div>
                    <div className="text-xs text-muted-foreground">{c.superficie} {c.techado && "· Techado"} {c.iluminacion && "· Iluminada"}</div>
                  </div>
                  <span className="text-xs text-muted-foreground">Tarifa base S/ {c.tarifaEstandar}</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-7 lg:grid-cols-14 gap-1.5">
                  {slots.map(s => {
                    const map: any = { libre: "bg-slot-free hover:scale-105", bloqueado: "bg-slot-locked opacity-70", reservado: "bg-slot-booked opacity-80", mantenimiento: "bg-slot-maintenance opacity-60" };
                    return (
                      <button key={s.hora} onClick={() => onSlot(c, s)}
                        className={cn("rounded-md py-2 px-1 text-white text-xs font-medium transition", map[s.estado])}>
                        <div>{s.hora}</div>
                        <div className="text-[10px] opacity-90">S/{s.precio}</div>
                      </button>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirmar selección</DialogTitle></DialogHeader>
          {sel && (
            <div className="space-y-2 text-sm">
              <p><b>Cancha:</b> {sel.cancha.nombre}</p>
              <p><b>Fecha:</b> {fecha} a las {sel.slot.hora}</p>
              <p><b>Precio:</b> S/ {sel.slot.precio}</p>
              <p className="text-xs text-warning">Iniciar reserva activa un bloqueo temporal de 20 minutos.</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSel(null)}>Cancelar</Button>
            <Button className="bg-gradient-accent border-0" onClick={() => nav("/jugador/reservar", { state: sel })}>Iniciar reserva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
