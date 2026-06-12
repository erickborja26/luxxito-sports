import { useState } from "react";
import { AlertTriangle, Check, Clock3, Eye, Receipt, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Comprobante, comprobantesMock } from "@/data/mock";

function VoucherPreview({ voucher }: { voucher: Comprobante }) {
  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border bg-white text-slate-900 shadow-elegant">
      <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-5 text-white">
        <div className="text-xs uppercase tracking-[0.2em]">Comprobante digital</div>
        <div className="mt-1 text-2xl font-bold">{voucher.metodo}</div>
      </div>
      <div className="space-y-4 p-6">
        <div className="text-center">
          <div className="text-xs text-slate-500">Monto enviado</div>
          <div className="text-4xl font-bold">S/ {voucher.monto.toFixed(2)}</div>
        </div>
        <div className="border-t pt-4 text-sm">
          <div className="flex justify-between py-1"><span className="text-slate-500">Remitente</span><strong>{voucher.jugador}</strong></div>
          <div className="flex justify-between py-1"><span className="text-slate-500">Operación</span><strong>{voucher.id.toUpperCase()}8942</strong></div>
          <div className="flex justify-between py-1"><span className="text-slate-500">Reserva</span><strong>{voucher.reservaId}</strong></div>
          <div className="flex justify-between py-1"><span className="text-slate-500">Fecha</span><strong>{new Date(voucher.subidoEn).toLocaleString("es-PE")}</strong></div>
        </div>
        <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
          <ShieldCheck className="h-4 w-4" />Operación completada
        </div>
      </div>
    </div>
  );
}

export default function Pagos() {
  const [vouchers, setVouchers] = useState<Comprobante[]>(comprobantesMock);
  const [preview, setPreview] = useState<Comprobante | null>(null);
  const [approveTarget, setApproveTarget] = useState<Comprobante | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Comprobante | null>(null);
  const [reason, setReason] = useState("");

  const approve = () => {
    if (!approveTarget) return;
    setVouchers((current) => current.filter((voucher) => voucher.id !== approveTarget.id));
    setApproveTarget(null);
    toast.success("Comprobante aprobado. La reserva fue confirmada.");
  };

  const reject = () => {
    if (!rejectTarget) return;
    if (reason.trim().length < 8) {
      toast.error("Escribe un motivo de al menos 8 caracteres.");
      return;
    }
    setVouchers((current) => current.filter((voucher) => voucher.id !== rejectTarget.id));
    setRejectTarget(null);
    setReason("");
    toast.success("Comprobante rechazado. El jugador podrá enviar uno nuevo.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pagos pendientes</h1>
          <p className="text-muted-foreground">Compara el comprobante con el monto esperado antes de aprobar o rechazar.</p>
        </div>
        <Badge variant="outline" className="w-fit px-3 py-1.5">{vouchers.length} por revisar</Badge>
      </div>

      <Card className="flex gap-3 border-info/30 bg-info/5 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-info" />
        <div className="text-sm">
          <div className="font-medium">Validación segura</div>
          <p className="text-muted-foreground">Comprueba monto, titular, código de operación y reserva. Si algo no coincide, rechaza indicando un motivo claro.</p>
        </div>
      </Card>

      {vouchers.length === 0 ? (
        <Card className="p-12 text-center">
          <Receipt className="mx-auto mb-3 h-11 w-11 text-muted-foreground" />
          <h2 className="font-semibold">Bandeja al día</h2>
          <p className="text-sm text-muted-foreground">No quedan comprobantes pendientes de validación.</p>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {vouchers.map((voucher, index) => {
            const amountMatches = voucher.monto === voucher.montoEsperado;
            const remainingMinutes = Math.max(3, 24 - index * 13);
            return (
              <Card key={voucher.id} className={`overflow-hidden ${amountMatches ? "" : "border-destructive/40"}`}>
                <div className="flex items-start justify-between border-b p-5">
                  <div>
                    <div className="font-semibold">{voucher.jugador}</div>
                    <div className="text-xs text-muted-foreground">Reserva {voucher.reservaId} · {voucher.metodo}</div>
                  </div>
                  <Badge className={remainingMinutes < 10 ? "bg-warning text-warning-foreground" : "bg-secondary text-secondary-foreground"}>
                    <Clock3 className="mr-1 h-3 w-3" />{remainingMinutes} min
                  </Badge>
                </div>
                <div className="grid gap-4 p-5 sm:grid-cols-[150px_1fr]">
                  <button
                    className="group relative aspect-[4/5] overflow-hidden rounded-xl border bg-gradient-to-br from-emerald-50 to-cyan-100 text-left"
                    onClick={() => setPreview(voucher)}
                    aria-label={`Ver comprobante de ${voucher.jugador}`}
                  >
                    <div className="absolute inset-0 grid place-items-center p-3">
                      <Receipt className="h-12 w-12 text-emerald-500/60" />
                    </div>
                    <div className="absolute inset-x-2 bottom-2 flex items-center justify-center rounded-lg bg-white/90 py-2 text-xs font-medium shadow">
                      <Eye className="mr-1 h-3 w-3" />Ver imagen
                    </div>
                  </button>
                  <div className="flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between"><span className="text-sm text-muted-foreground">Monto informado</span><span className="font-bold">S/ {voucher.monto}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-muted-foreground">Monto esperado</span><span className="font-bold">S/ {voucher.montoEsperado}</span></div>
                      <div className={`rounded-lg border p-3 text-sm ${amountMatches ? "border-accent/30 bg-accent/5 text-accent" : "border-destructive/30 bg-destructive/5 text-destructive"}`}>
                        {amountMatches ? "El monto coincide con la reserva." : `Existe una diferencia de S/ ${Math.abs(voucher.montoEsperado - voucher.monto)}.`}
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button className="flex-1" disabled={!amountMatches} onClick={() => setApproveTarget(voucher)}><Check className="mr-2 h-4 w-4" />Aprobar</Button>
                      <Button className="flex-1" variant="destructive" onClick={() => setRejectTarget(voucher)}><X className="mr-2 h-4 w-4" />Rechazar</Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Imagen del comprobante</DialogTitle></DialogHeader>
          {preview && <VoucherPreview voucher={preview} />}
          <DialogFooter><Button variant="outline" onClick={() => setPreview(null)}>Cerrar imagen</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!approveTarget} onOpenChange={(open) => !open && setApproveTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Aprobar comprobante</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Se confirmará la reserva <strong>{approveTarget?.reservaId}</strong> por S/ {approveTarget?.monto}. ¿Los datos del comprobante son correctos?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveTarget(null)}>Volver a revisar</Button>
            <Button onClick={approve}>Sí, aprobar pago</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rejectTarget} onOpenChange={(open) => { if (!open) { setRejectTarget(null); setReason(""); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rechazar comprobante</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm font-medium">¿Seguro que deseas rechazar este comprobante?</p>
            <p className="text-sm text-muted-foreground">La reserva seguirá pendiente y el jugador recibirá el motivo para corregir el pago.</p>
            <div>
              <Label htmlFor="reject-reason">Motivo del rechazo</Label>
              <Textarea id="reject-reason" rows={4} placeholder="Ej. El monto enviado no coincide con el total de la reserva." value={reason} onChange={(event) => setReason(event.target.value)} />
              <div className="mt-1 text-right text-xs text-muted-foreground">{reason.trim().length}/8 caracteres mínimos</div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectTarget(null); setReason(""); }}>Cancelar</Button>
            <Button variant="destructive" onClick={reject}>Confirmar rechazo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
