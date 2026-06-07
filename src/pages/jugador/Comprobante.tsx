import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function Comprobante() {
  const loc = useLocation();
  const nav = useNavigate();
  const { total = 100, metodo = "Yape" } = (loc.state as any) || {};
  const [preview, setPreview] = useState<string | null>(null);
  const [met, setMet] = useState(metodo === "Tarjeta" ? "Yape" : metodo);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => setPreview(r.result as string); r.readAsDataURL(f);
  };

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview) return toast.error("Sube una imagen del comprobante");
    toast.success("Comprobante enviado. Estado: PENDIENTE_REVISION");
    nav("/jugador/confirmacion", { state: { sel: loc.state?.sel, total, metodo: met, pendiente: true } });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-1">Subir comprobante de pago</h1>
        <p className="text-sm text-muted-foreground mb-6">Los pagos manuales se validan en máximo 30 minutos.</p>
        <form onSubmit={enviar} className="space-y-4">
          <div>
            <Label>Método</Label>
            <Select value={met} onValueChange={setMet}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="Yape">Yape</SelectItem><SelectItem value="Transferencia">Transferencia</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Monto pagado (S/)</Label><Input type="number" defaultValue={total} required /></div>
            <div><Label>Nº referencia / operación</Label><Input placeholder="000123456" required /></div>
          </div>
          <div>
            <Label>Imagen del comprobante</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/40 transition cursor-pointer">
              <input id="file" type="file" accept="image/*" onChange={handleFile} className="hidden" />
              <label htmlFor="file" className="cursor-pointer">
                {preview ? (
                  <img src={preview} alt="Comprobante" className="max-h-64 mx-auto rounded-md" />
                ) : (
                  <div className="text-muted-foreground"><Upload className="w-8 h-8 mx-auto mb-2" />Click para subir imagen</div>
                )}
              </label>
            </div>
          </div>
          <Button type="submit" className="w-full bg-gradient-accent border-0"><CheckCircle className="w-4 h-4 mr-2" />Enviar para validación</Button>
        </form>
      </Card>
    </div>
  );
}
