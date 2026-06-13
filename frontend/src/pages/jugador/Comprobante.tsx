import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, CheckCircle, Loader2, AlertTriangle, ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { ReservaJugador } from "@/lib/domain";

type EstadoComprobante = {
  reserva: ReservaJugador;
  total: number;
  metodo: string;
};

const MAX_MB = 5;

export default function Comprobante() {
  const loc = useLocation();
  const nav = useNavigate();
  const datos = loc.state as EstadoComprobante | null;

  const [preview, setPreview] = useState<string | null>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);
  const [met, setMet] = useState(datos?.metodo === "Tarjeta" ? "Yape" : datos?.metodo || "Yape");
  const [monto, setMonto] = useState(String(datos?.total ?? ""));
  const [referencia, setReferencia] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!datos) {
      toast.info("Primero elige un horario y completa el paso de pago.");
      nav("/jugador/disponibilidad", { replace: true });
    }
  }, [datos, nav]);

  if (!datos) return null;

  const total = datos.total;
  const montoNum = Number(monto);
  const montoDistinto = monto !== "" && !Number.isNaN(montoNum) && montoNum !== total;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setErrorArchivo("El archivo debe ser una imagen (JPG, PNG o similar).");
      setPreview(null);
      setArchivo(null);
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setErrorArchivo(`La imagen pesa demasiado. El máximo es ${MAX_MB} MB.`);
      setPreview(null);
      setArchivo(null);
      return;
    }
    setErrorArchivo(null);
    setArchivo(f);
    const r = new FileReader();
    r.onload = () => setPreview(r.result as string);
    r.readAsDataURL(f);
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archivo) {
      setErrorArchivo("Sube una foto o captura de tu comprobante para continuar.");
      return;
    }
    setEnviando(true);
    try {
      const body = new FormData();
      body.append("metodo", met === "Yape" ? "BILLETERA_DIGITAL" : "TRANSFERENCIA");
      body.append("monto_pagado", monto);
      body.append("referencia", referencia);
      body.append("comprobante", archivo);
      await api(`/reservas/${datos.reserva.id}/comprobante/`, { method: "POST", body });
      const reserva = { ...datos.reserva, metodoPago: met, estado: "PENDIENTE" as const };
      toast.success("Comprobante recibido. Lo validaremos en máximo 30 minutos.");
      nav("/jugador/confirmacion", { state: { reserva, pendiente: true } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo enviar el comprobante");
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-1">Subir comprobante de pago</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Tu horario sigue bloqueado. Validamos los pagos manuales en máximo 30 minutos y te avisaremos del resultado.
        </p>

        <div className="p-3 mb-5 bg-muted rounded-lg text-sm flex justify-between">
          <span>{datos.reserva.canchaNombre} · {datos.reserva.fechaInicio.slice(11, 16)}</span>
          <span className="font-bold">Total: S/ {total}</span>
        </div>

        <form onSubmit={enviar} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="metodo">Método de pago usado</Label>
            <Select value={met} onValueChange={setMet}>
              <SelectTrigger id="metodo"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Yape">Yape</SelectItem>
                <SelectItem value="Transferencia">Transferencia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="monto">Monto pagado (S/)</Label>
              <Input id="monto" type="number" min={1} step="0.01" value={monto} onChange={e => setMonto(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ref">Nº de operación</Label>
              <Input id="ref" placeholder="Ej. 000123456" value={referencia} onChange={e => setReferencia(e.target.value)} required />
            </div>
          </div>

          {montoDistinto && (
            <p role="alert" className="text-xs flex items-start gap-2 bg-warning/10 text-foreground p-3 rounded-md">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              El monto ingresado (S/ {montoNum}) no coincide con el total de tu reserva (S/ {total}). Si pagaste un monto distinto, la validación podría rechazarse.
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="file">Imagen del comprobante</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/40 transition-colors cursor-pointer">
              <input id="file" type="file" accept="image/*" onChange={handleFile} className="hidden" />
              <label htmlFor="file" className="cursor-pointer block">
                {preview ? (
                  <div className="space-y-2">
                    <img src={preview} alt="Vista previa del comprobante subido" className="max-h-64 mx-auto rounded-md" />
                    <span className="text-xs text-accent inline-flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" />Imagen lista. Click para cambiarla.</span>
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-sm font-medium text-foreground">Click para subir tu comprobante</div>
                    <div className="text-xs mt-1">JPG o PNG, máximo {MAX_MB} MB</div>
                  </div>
                )}
              </label>
            </div>
            {errorArchivo && (
              <p role="alert" className="text-xs text-destructive flex items-center gap-1.5">
                <X className="w-3.5 h-3.5" />{errorArchivo}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full bg-gradient-accent border-0" disabled={enviando}>
            {enviando ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando comprobante…</>) : (<><Upload className="w-4 h-4 mr-2" />Enviar para validación</>)}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Al enviarlo, tu reserva quedará <b>pendiente de validación</b>. Te notificaremos al confirmarse.
          </p>
        </form>
      </Card>
    </div>
  );
}
