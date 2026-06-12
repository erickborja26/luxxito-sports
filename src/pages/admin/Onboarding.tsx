import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Check, ArrowRight, Trophy } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const steps = ["Complejo", "Canchas", "Horarios", "Precios", "Resumen"];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const nav = useNavigate();
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2"><span className="font-semibold">Configura tu complejo</span><span className="text-muted-foreground">Paso {step + 1} de {steps.length}</span></div>
        <Progress value={progress} />
      </div>

      <Card className="p-6 space-y-4">
        {step === 0 && (<>
          <h2 className="text-xl font-bold">Datos del complejo</h2>
          <div><Label>Nombre</Label><Input placeholder="Mundialitos Club" /></div>
          <div><Label>Dirección</Label><Input placeholder="Av. Aviación 2500" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Ciudad</Label><Input defaultValue="Lima" /></div>
            <div><Label>Coordenadas (opcional)</Label><Input placeholder="-12.0,-77.0" /></div>
          </div>
        </>)}
        {step === 1 && (<>
          <h2 className="text-xl font-bold">Primera cancha</h2>
          <div><Label>Nombre</Label><Input placeholder="Cancha 1" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Deporte</Label><Input defaultValue="Fútbol" /></div>
            <div><Label>Superficie</Label><Input defaultValue="Grass sintético" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> Techado</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> Iluminación</label>
            <div><Label>Tarifa S/</Label><Input type="number" defaultValue={120} /></div>
          </div>
        </>)}
        {step === 2 && (<>
          <h2 className="text-xl font-bold">Horarios de atención</h2>
          {["Lun-Vie", "Sábados", "Domingos"].map(d => (
            <div key={d} className="grid grid-cols-3 gap-2 items-end">
              <div className="text-sm font-medium pb-2">{d}</div>
              <div><Label>Apertura</Label><Input type="time" defaultValue="08:00" /></div>
              <div><Label>Cierre</Label><Input type="time" defaultValue="22:00" /></div>
            </div>
          ))}
        </>)}
        {step === 3 && (<>
          <h2 className="text-xl font-bold">Precio dinámico (opcional)</h2>
          <p className="text-sm text-muted-foreground">Define tarifas para horas pico.</p>
          <div className="grid grid-cols-3 gap-2">
            <div><Label>Día</Label><Input defaultValue="Viernes" /></div>
            <div><Label>Desde</Label><Input type="time" defaultValue="18:00" /></div>
            <div><Label>Hasta</Label><Input type="time" defaultValue="22:00" /></div>
          </div>
          <div><Label>Tarifa hora pico (S/)</Label><Input type="number" defaultValue={160} /></div>
        </>)}
        {step === 4 && (<>
          <div className="text-center py-6">
            <div className="w-20 h-20 rounded-full bg-gradient-accent grid place-items-center mx-auto mb-4 shadow-glow">
              <Trophy className="w-10 h-10 text-accent-foreground" />
            </div>
            <h2 className="text-2xl font-bold">¡Listo en menos de 5 minutos!</h2>
            <p className="text-muted-foreground mt-2">Tu complejo ya está activo y recibiendo reservas.</p>
            <ul className="text-left max-w-sm mx-auto mt-6 space-y-2 text-sm">
              {["Complejo registrado", "1 cancha activa", "Horarios configurados", "Precios dinámicos"].map(t => (
                <li key={t} className="flex items-center gap-2"><Check className="w-4 h-4 text-accent" />{t}</li>
              ))}
            </ul>
          </div>
        </>)}

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>Atrás</Button>
          {step < steps.length - 1 ? (
            <Button className="bg-gradient-accent border-0" onClick={() => setStep(step + 1)}>Siguiente <ArrowRight className="w-4 h-4 ml-1" /></Button>
          ) : (
            <Button className="bg-gradient-accent border-0" onClick={() => { toast.success("Complejo configurado"); nav("/admin"); }}>Ir al panel</Button>
          )}
        </div>
      </Card>
    </div>
  );
}
