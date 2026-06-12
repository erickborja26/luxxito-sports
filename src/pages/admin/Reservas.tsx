import { useMemo, useState } from "react";
import { CalendarX2, Eye, Search, Wrench, X } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { canchas, nombreComplejo, Reserva, reservasMock } from "@/data/mock";

type BlockForm = { canchaId: string; date: string; start: string; end: string; reason: string };

export default function ReservasAdmin() {
  const [reservations, setReservations] = useState<Reserva[]>(reservasMock);
  const [status, setStatus] = useState("todas");
  const [date, setDate] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Reserva | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Reserva | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [blockDialog, setBlockDialog] = useState(false);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const [blockForm, setBlockForm] = useState<BlockForm>({
    canchaId: canchas[0].id,
    date: "2026-06-15",
    start: "12:00",
    end: "13:00",
    reason: "",
  });

  const filtered = useMemo(() => reservations.filter((reservation) => {
    const matchesStatus = status === "todas" || reservation.estado === status;
    const matchesDate = !date || reservation.fechaInicio.startsWith(date);
    const query = search.trim().toLocaleLowerCase("es");
    const matchesSearch = !query
      || reservation.jugador.toLocaleLowerCase("es").includes(query)
      || reservation.canchaNombre.toLocaleLowerCase("es").includes(query)
      || reservation.id.toLocaleLowerCase("es").includes(query);
    return matchesStatus && matchesDate && matchesSearch;
  }), [date, reservations, search, status]);

  const hasRefund = cancelTarget
    ? (new Date(cancelTarget.fechaInicio).getTime() - Date.now()) / 3_600_000 >= 24
    : false;

  const cancelReservation = () => {
    if (!cancelTarget) return;
    if (!cancelReason.trim()) {
      toast.error("Escribe el motivo de la cancelación.");
      return;
    }
    setReservations((current) => current.map((reservation) => (
      reservation.id === cancelTarget.id ? { ...reservation, estado: "CANCELADA" } : reservation
    )));
    setCancelTarget(null);
    setCancelReason("");
    toast.success(hasRefund ? "Reserva cancelada. Se procesará el reembolso." : "Reserva cancelada sin reembolso.");
  };

  const requestBlock = () => {
    if (!blockForm.reason.trim()) {
      toast.error("Escribe el motivo del bloqueo.");
      return;
    }
    if (blockForm.end <= blockForm.start) {
      toast.error("La hora final debe ser posterior a la inicial.");
      return;
    }
    const hasConflict = reservations.some((reservation) => (
      reservation.canchaId === blockForm.canchaId
      && reservation.fechaInicio.startsWith(blockForm.date)
      && reservation.estado !== "CANCELADA"
      && reservation.fechaInicio.slice(11, 16) < blockForm.end
      && reservation.fechaFin.slice(11, 16) > blockForm.start
    ));
    if (hasConflict) {
      toast.error("Existe una reserva en ese horario. Cancélala o elige otro rango.");
      return;
    }
    setBlockDialog(false);
    setConfirmBlock(true);
  };

  const createBlock = () => {
    const court = canchas.find((item) => item.id === blockForm.canchaId);
    const block: Reserva = {
      id: `BLQ-${String(reservations.length + 1).padStart(3, "0")}`,
      canchaId: blockForm.canchaId,
      canchaNombre: court?.nombre ?? "Cancha",
      complejoNombre: nombreComplejo(court?.complejoId ?? "c1"),
      jugador: `Bloqueo: ${blockForm.reason}`,
      fechaInicio: `${blockForm.date}T${blockForm.start}`,
      fechaFin: `${blockForm.date}T${blockForm.end}`,
      precio: 0,
      estado: "BLOQUEADA",
    };
    setReservations((current) => [block, ...current]);
    setConfirmBlock(false);
    setBlockForm((current) => ({ ...current, reason: "" }));
    toast.success("Horario bloqueado correctamente.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de reservas</h1>
          <p className="text-muted-foreground">Consulta, filtra, cancela y bloquea horarios sin generar cruces.</p>
        </div>
        <Button onClick={() => setBlockDialog(true)}><Wrench className="mr-2 h-4 w-4" />Bloquear horario</Button>
      </div>

      <Card className="grid gap-3 p-4 md:grid-cols-[1.4fr_1fr_1fr_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Jugador, cancha o código" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <Input aria-label="Filtrar por fecha" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todos los estados</SelectItem>
            {["PENDIENTE", "BLOQUEADA", "CONFIRMADA", "CANCELADA", "VENCIDA"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="ghost" onClick={() => { setSearch(""); setDate(""); setStatus("todas"); }}>Limpiar filtros</Button>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reserva</TableHead>
                <TableHead>Cancha / jugador</TableHead>
                <TableHead>Fecha y hora</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell className="font-mono text-xs">{reservation.id}</TableCell>
                  <TableCell><div className="font-medium">{reservation.canchaNombre}</div><div className="text-xs text-muted-foreground">{reservation.jugador}</div></TableCell>
                  <TableCell><div>{new Date(reservation.fechaInicio).toLocaleDateString("es-PE", { dateStyle: "medium" })}</div><div className="text-xs text-muted-foreground">{reservation.fechaInicio.slice(11, 16)} - {reservation.fechaFin.slice(11, 16)}</div></TableCell>
                  <TableCell>{reservation.metodoPago ?? "No aplica"}</TableCell>
                  <TableCell className="font-semibold">{reservation.precio ? `S/ ${reservation.precio}` : "-"}</TableCell>
                  <TableCell><StatusBadge status={reservation.estado} /></TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" aria-label="Ver detalle" onClick={() => setSelected(reservation)}><Eye className="h-4 w-4" /></Button>
                      {!["CANCELADA", "VENCIDA", "BLOQUEADA"].includes(reservation.estado) && (
                        <Button size="icon" variant="ghost" aria-label="Cancelar reserva" onClick={() => setCancelTarget(reservation)}><X className="h-4 w-4 text-destructive" /></Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {filtered.length === 0 && (
          <div className="p-10 text-center">
            <CalendarX2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <div className="font-medium">No encontramos reservas</div>
            <div className="text-sm text-muted-foreground">Cambia los filtros o limpia la búsqueda.</div>
          </div>
        )}
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detalle de reserva</DialogTitle></DialogHeader>
          {selected && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><div className="text-xs text-muted-foreground">Código</div><div className="font-medium">{selected.id}</div></div>
              <div><div className="text-xs text-muted-foreground">Estado</div><StatusBadge status={selected.estado} /></div>
              <div><div className="text-xs text-muted-foreground">Cancha</div><div className="font-medium">{selected.canchaNombre}</div></div>
              <div><div className="text-xs text-muted-foreground">Jugador</div><div className="font-medium">{selected.jugador}</div></div>
              <div><div className="text-xs text-muted-foreground">Inicio</div><div>{new Date(selected.fechaInicio).toLocaleString("es-PE")}</div></div>
              <div><div className="text-xs text-muted-foreground">Fin</div><div>{new Date(selected.fechaFin).toLocaleString("es-PE")}</div></div>
              <div><div className="text-xs text-muted-foreground">Método de pago</div><div>{selected.metodoPago ?? "No aplica"}</div></div>
              <div><div className="text-xs text-muted-foreground">Total</div><div className="font-semibold">S/ {selected.precio}</div></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cancelar reserva</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">¿Seguro que deseas cancelar la reserva de <strong>{cancelTarget?.jugador}</strong>?</p>
            <div className={`rounded-lg border p-3 text-sm ${hasRefund ? "border-accent/30 bg-accent/5" : "border-destructive/30 bg-destructive/5"}`}>
              {hasRefund ? "La reserva califica para reembolso completo." : "Faltan menos de 24 horas. La reserva no califica para reembolso."}
            </div>
            <div><Label htmlFor="cancel-reason">Motivo de cancelación</Label><Textarea id="cancel-reason" placeholder="Este motivo quedará registrado y será visible para soporte." value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTarget(null)}>Volver</Button>
            <Button variant="destructive" onClick={cancelReservation}>Confirmar cancelación</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={blockDialog} onOpenChange={setBlockDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Bloquear horario</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Cancha</Label><Select value={blockForm.canchaId} onValueChange={(value) => setBlockForm({ ...blockForm, canchaId: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{canchas.map((court) => <SelectItem key={court.id} value={court.id}>{court.nombre}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Fecha</Label><Input type="date" value={blockForm.date} onChange={(event) => setBlockForm({ ...blockForm, date: event.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Desde</Label><Input type="time" value={blockForm.start} onChange={(event) => setBlockForm({ ...blockForm, start: event.target.value })} /></div>
              <div><Label>Hasta</Label><Input type="time" value={blockForm.end} onChange={(event) => setBlockForm({ ...blockForm, end: event.target.value })} /></div>
            </div>
            <div><Label>Motivo</Label><Textarea placeholder="Ej. Mantenimiento preventivo" value={blockForm.reason} onChange={(event) => setBlockForm({ ...blockForm, reason: event.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockDialog(false)}>Cancelar</Button>
            <Button onClick={requestBlock}>Continuar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmBlock} onOpenChange={setConfirmBlock}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirmar bloqueo</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Este horario quedará cerrado para los jugadores. ¿Deseas continuar?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmBlock(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={createBlock}>Sí, bloquear horario</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
