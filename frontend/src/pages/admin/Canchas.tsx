import { FormEvent, useEffect, useState } from "react";
import { Edit, Plus, Power, Save, Trash2, Trophy, Wrench } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, Paginated, unwrap } from "@/lib/api";
import { Cancha, Complejo, Deporte, mapCourt } from "@/lib/domain";

type CourtForm = {
  nombre: string;
  deporte: string;
  superficie: string;
  techado: boolean;
  iluminacion: boolean;
  tarifaEstandar: number;
};
type Schedule = { day: string; enabled: boolean; open: string; close: string };
type MaintenanceBlock = { id: string; canchaId: string; date: string; start: string; end: string; reason: string };

const emptyCourt: CourtForm = {
  nombre: "",
  deporte: "",
  superficie: "SINTETICO",
  techado: false,
  iluminacion: true,
  tarifaEstandar: 120,
};

const initialSchedules: Schedule[] = [
  { day: "Lunes", enabled: true, open: "08:00", close: "22:00" },
  { day: "Martes", enabled: true, open: "08:00", close: "22:00" },
  { day: "Miércoles", enabled: true, open: "08:00", close: "22:00" },
  { day: "Jueves", enabled: true, open: "08:00", close: "22:00" },
  { day: "Viernes", enabled: true, open: "08:00", close: "23:00" },
  { day: "Sábado", enabled: true, open: "09:00", close: "23:00" },
  { day: "Domingo", enabled: true, open: "09:00", close: "21:00" },
];

export default function Canchas() {
  const [courts, setCourts] = useState<Cancha[]>([]);
  const [deportes, setDeportes] = useState<Deporte[]>([]);
  const [complex, setComplex] = useState<Complejo | null>(null);
  const [courtDialog, setCourtDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [courtForm, setCourtForm] = useState<CourtForm>(emptyCourt);
  const [deleteTarget, setDeleteTarget] = useState<Cancha | null>(null);
  const [schedules, setSchedules] = useState(initialSchedules);
  const [maintenance, setMaintenance] = useState<MaintenanceBlock[]>([]);
  const [maintenanceForm, setMaintenanceForm] = useState<Omit<MaintenanceBlock, "id">>({
    canchaId: "",
    date: new Date().toLocaleDateString("en-CA"),
    start: "08:00",
    end: "10:00",
    reason: "",
  });
  const [confirmMaintenance, setConfirmMaintenance] = useState(false);

  const load = async () => {
    const [complexesData, courtsData, sportsData, closuresData] = await Promise.all([
      api<Paginated<Complejo> | Complejo[]>("/complejos/?page_size=100"),
      api<Paginated<any> | any[]>("/canchas/?page_size=100"),
      api<Deporte[]>("/deportes/"),
      api<Paginated<any> | any[]>("/cierres/?page_size=100"),
    ]);
    const selectedComplex = unwrap(complexesData)[0] || null;
    const courtList = unwrap(courtsData).map(mapCourt);
    setComplex(selectedComplex);
    setCourts(courtList);
    setDeportes(sportsData);
    setMaintenance(unwrap(closuresData).map((item: any) => ({
      id: item.id,
      canchaId: item.cancha_id,
      date: item.fecha,
      start: item.hora_inicio,
      end: item.hora_fin,
      reason: item.motivo,
    })));
    if (selectedComplex?.horarios?.length) {
      setSchedules(initialSchedules.map((schedule, index) => {
        const apiSchedule = selectedComplex.horarios?.find((item) => item.dia_semana === index + 1);
        return apiSchedule ? {
          ...schedule,
          enabled: apiSchedule.habilitado,
          open: apiSchedule.hora_apertura.slice(0, 5),
          close: apiSchedule.hora_cierre.slice(0, 5),
        } : schedule;
      }));
    }
    setMaintenanceForm((current) => ({
      ...current,
      canchaId: current.canchaId || courtList[0]?.id || "",
    }));
    setCourtForm((current) => ({
      ...current,
      deporte: current.deporte || sportsData[0]?.nombre || "",
    }));
  };

  useEffect(() => {
    load().catch((error) => toast.error(error.message));
  }, []);

  const openNewCourt = () => {
    setEditingId(null);
    setCourtForm({ ...emptyCourt, deporte: deportes[0]?.nombre || "" });
    setCourtDialog(true);
  };

  const openEditCourt = (court: Cancha) => {
    setEditingId(court.id);
    setCourtForm({
      nombre: court.nombre,
      deporte: court.deporte,
      superficie: court.superficie,
      techado: court.techado,
      iluminacion: court.iluminacion,
      tarifaEstandar: court.tarifaEstandar,
    });
    setCourtDialog(true);
  };

  const saveCourt = async (event: FormEvent) => {
    event.preventDefault();
    if (!courtForm.nombre.trim() || !courtForm.superficie.trim()) {
      toast.error("Completa el nombre y la superficie de la cancha.");
      return;
    }
    if (courtForm.tarifaEstandar <= 0) {
      toast.error("La tarifa debe ser mayor a cero.");
      return;
    }

    if (!complex) return toast.error("Primero registra un complejo.");
    const sport = deportes.find((item) => item.nombre === courtForm.deporte);
    if (!sport) return toast.error("Selecciona un deporte válido.");
    try {
      await api(editingId ? `/canchas/${editingId}/` : "/canchas/", {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify({
          complejo_id: complex.id,
          deporte_id: sport.id,
          nombre: courtForm.nombre,
          tipo_superficie: courtForm.superficie,
          techada: courtForm.techado,
          iluminacion: courtForm.iluminacion,
          tarifa_estandar: courtForm.tarifaEstandar,
          activa: true,
        }),
      });
      await load();
      toast.success(editingId ? "Cancha actualizada." : "Cancha registrada.");
      setCourtDialog(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar");
    }
  };

  const updateSchedule = (index: number, field: keyof Schedule, value: string | boolean) => {
    setSchedules((current) => current.map((schedule, scheduleIndex) => (
      scheduleIndex === index ? { ...schedule, [field]: value } : schedule
    )));
  };

  const saveSchedules = async () => {
    const invalid = schedules.some((schedule) => schedule.enabled && schedule.close <= schedule.open);
    if (invalid) {
      toast.error("La hora de cierre debe ser posterior a la apertura.");
      return;
    }
    if (!complex) return;
    try {
      await api(`/complejos/${complex.id}/horarios/`, {
        method: "PUT",
        body: JSON.stringify(schedules.map((schedule, index) => ({
          dia_semana: index + 1,
          habilitado: schedule.enabled,
          hora_apertura: schedule.open,
          hora_cierre: schedule.close,
        }))),
      });
      toast.success("Horarios guardados correctamente.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudieron guardar");
    }
  };

  const requestMaintenance = () => {
    if (!maintenanceForm.reason.trim()) {
      toast.error("Escribe el motivo del bloqueo.");
      return;
    }
    if (maintenanceForm.end <= maintenanceForm.start) {
      toast.error("La hora final debe ser posterior a la hora inicial.");
      return;
    }
    setConfirmMaintenance(true);
  };

  const createMaintenance = async () => {
    try {
      const closure = await api<any>(`/canchas/${maintenanceForm.canchaId}/cierres/`, {
        method: "POST",
        body: JSON.stringify({
          fecha: maintenanceForm.date,
          hora_inicio: maintenanceForm.start,
          hora_fin: maintenanceForm.end,
          motivo: maintenanceForm.reason,
        }),
      });
      setMaintenance((current) => [...current, {
        id: closure.id,
        canchaId: maintenanceForm.canchaId,
        date: closure.fecha,
        start: closure.hora_inicio,
        end: closure.hora_fin,
        reason: closure.motivo,
      }]);
      setMaintenanceForm((current) => ({ ...current, reason: "" }));
      setConfirmMaintenance(false);
      toast.success("Horario bloqueado por mantenimiento.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo bloquear");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuración de canchas</h1>
          <p className="text-muted-foreground">Administra canchas, horarios de atención y cierres operativos.</p>
        </div>
        <Button onClick={openNewCourt} className="bg-gradient-accent border-0">
          <Plus className="mr-2 h-4 w-4" />Registrar cancha
        </Button>
      </div>

      <Tabs defaultValue="canchas" className="space-y-4">
        <TabsList className="grid h-auto w-full grid-cols-3 sm:w-fit">
          <TabsTrigger value="canchas">Canchas</TabsTrigger>
          <TabsTrigger value="horarios">Horarios</TabsTrigger>
          <TabsTrigger value="mantenimiento">Mantenimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="canchas">
          {courts.length === 0 ? (
            <Card className="p-10 text-center">
              <Trophy className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <h2 className="font-semibold">No hay canchas registradas</h2>
              <p className="mb-4 text-sm text-muted-foreground">Registra la primera cancha para comenzar a recibir reservas.</p>
              <Button onClick={openNewCourt}>Registrar cancha</Button>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {courts.map((court) => (
                <Card key={court.id} className="p-5 transition hover:shadow-elegant">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent/10">
                      <Trophy className="h-6 w-6 text-accent" />
                    </div>
                    <Badge className={court.activo ? "bg-accent text-accent-foreground" : ""} variant={court.activo ? "default" : "secondary"}>
                      {court.activo ? "Disponible" : "Inactiva"}
                    </Badge>
                  </div>
                  <h2 className="font-semibold">{court.nombre}</h2>
                  <p className="text-sm text-muted-foreground">{court.deporte} · {court.superficie}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {court.techado && <Badge variant="outline">Techada</Badge>}
                    {court.iluminacion && <Badge variant="outline">Iluminación</Badge>}
                  </div>
                  <div className="mt-5 flex items-end justify-between border-t pt-4">
                    <div><div className="text-xs text-muted-foreground">Tarifa estándar</div><div className="text-xl font-bold">S/ {court.tarifaEstandar}</div></div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={court.activo ? "Desactivar cancha" : "Activar cancha"}
                        onClick={async () => {
                          try {
                            await api(`/canchas/${court.id}/`, {
                              method: "PATCH",
                              body: JSON.stringify({ activa: !court.activo }),
                            });
                            setCourts((current) => current.map((item) => item.id === court.id ? { ...item, activo: !item.activo } : item));
                          } catch (error) {
                            toast.error(error instanceof Error ? error.message : "No se pudo actualizar");
                          }
                        }}
                      >
                        <Power className={`h-4 w-4 ${court.activo ? "text-accent" : "text-muted-foreground"}`} />
                      </Button>
                      <Button size="icon" variant="ghost" aria-label="Editar cancha" onClick={() => openEditCourt(court)}><Edit className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" aria-label="Eliminar cancha" onClick={() => setDeleteTarget(court)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="horarios">
          <Card className="p-5">
            <div className="mb-5">
              <h2 className="font-semibold">Horario general del complejo</h2>
              <p className="text-sm text-muted-foreground">Los jugadores solo podrán reservar dentro de estos rangos.</p>
            </div>
            <div className="space-y-3">
              {schedules.map((schedule, index) => (
                <div key={schedule.day} className="grid items-center gap-3 rounded-xl border p-4 sm:grid-cols-[140px_90px_1fr_1fr]">
                  <div className="font-medium">{schedule.day}</div>
                  <label className="flex items-center gap-2 text-sm">
                    <Switch checked={schedule.enabled} onCheckedChange={(checked) => updateSchedule(index, "enabled", checked)} />
                    {schedule.enabled ? "Abierto" : "Cerrado"}
                  </label>
                  <div><Label htmlFor={`open-${index}`}>Apertura</Label><Input id={`open-${index}`} type="time" disabled={!schedule.enabled} value={schedule.open} onChange={(event) => updateSchedule(index, "open", event.target.value)} /></div>
                  <div><Label htmlFor={`close-${index}`}>Cierre</Label><Input id={`close-${index}`} type="time" disabled={!schedule.enabled} value={schedule.close} onChange={(event) => updateSchedule(index, "close", event.target.value)} /></div>
                </div>
              ))}
            </div>
            <Button className="mt-5" onClick={saveSchedules}><Save className="mr-2 h-4 w-4" />Guardar horarios</Button>
          </Card>
        </TabsContent>

        <TabsContent value="mantenimiento" className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <Card className="p-5">
            <div className="mb-5">
              <h2 className="font-semibold">Bloquear horario</h2>
              <p className="text-sm text-muted-foreground">Cierra temporalmente una cancha por mantenimiento u otra incidencia.</p>
            </div>
            <div className="space-y-4">
              <div><Label>Cancha</Label><Select value={maintenanceForm.canchaId} onValueChange={(value) => setMaintenanceForm({ ...maintenanceForm, canchaId: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{courts.map((court) => <SelectItem key={court.id} value={court.id}>{court.nombre}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Fecha</Label><Input type="date" value={maintenanceForm.date} onChange={(event) => setMaintenanceForm({ ...maintenanceForm, date: event.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Desde</Label><Input type="time" value={maintenanceForm.start} onChange={(event) => setMaintenanceForm({ ...maintenanceForm, start: event.target.value })} /></div>
                <div><Label>Hasta</Label><Input type="time" value={maintenanceForm.end} onChange={(event) => setMaintenanceForm({ ...maintenanceForm, end: event.target.value })} /></div>
              </div>
              <div><Label>Motivo</Label><Input placeholder="Ej. Reparación de luminarias" value={maintenanceForm.reason} onChange={(event) => setMaintenanceForm({ ...maintenanceForm, reason: event.target.value })} /></div>
              <Button onClick={requestMaintenance} className="w-full" variant="destructive"><Wrench className="mr-2 h-4 w-4" />Bloquear horario</Button>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold">Bloqueos programados</h2>
            <p className="mb-5 text-sm text-muted-foreground">Puedes retirar un bloqueo si el mantenimiento termina antes.</p>
            {maintenance.length === 0 ? (
              <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No hay mantenimientos programados.</div>
            ) : (
              <div className="space-y-3">
                {maintenance.map((block) => (
                  <div key={block.id} className="flex flex-col gap-3 rounded-xl border border-warning/30 bg-warning/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-medium">{courts.find((court) => court.id === block.canchaId)?.nombre ?? "Cancha"}</div>
                      <div className="text-sm text-muted-foreground">{block.date} · {block.start} - {block.end}</div>
                      <div className="text-sm">{block.reason}</div>
                    </div>
                    <Button size="sm" variant="outline" onClick={async () => {
                      try {
                        await api(`/cierres/${block.id}/`, { method: "DELETE" });
                        setMaintenance((current) => current.filter((item) => item.id !== block.id));
                        toast.success("Bloqueo retirado.");
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : "No se pudo retirar");
                      }
                    }}>Retirar bloqueo</Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={courtDialog} onOpenChange={setCourtDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? "Editar cancha" : "Registrar cancha"}</DialogTitle></DialogHeader>
          <form onSubmit={saveCourt} className="space-y-4">
            <div><Label htmlFor="court-name">Nombre</Label><Input id="court-name" placeholder="Ej. Cancha principal" value={courtForm.nombre} onChange={(event) => setCourtForm({ ...courtForm, nombre: event.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Deporte</Label><Select value={courtForm.deporte} onValueChange={(value) => setCourtForm({ ...courtForm, deporte: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{deportes.map((sport) => <SelectItem key={sport.id} value={sport.nombre}>{sport.nombre}</SelectItem>)}</SelectContent></Select></div>
              <div><Label htmlFor="surface">Superficie</Label><Input id="surface" value={courtForm.superficie} onChange={(event) => setCourtForm({ ...courtForm, superficie: event.target.value })} /></div>
            </div>
            <div><Label htmlFor="rate">Tarifa estándar por hora (S/)</Label><Input id="rate" type="number" min="1" value={courtForm.tarifaEstandar} onChange={(event) => setCourtForm({ ...courtForm, tarifaEstandar: Number(event.target.value) })} /></div>
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-muted/50 p-4">
              <label className="flex items-center gap-2 text-sm"><Switch checked={courtForm.techado} onCheckedChange={(checked) => setCourtForm({ ...courtForm, techado: checked })} />Techada</label>
              <label className="flex items-center gap-2 text-sm"><Switch checked={courtForm.iluminacion} onCheckedChange={(checked) => setCourtForm({ ...courtForm, iluminacion: checked })} />Iluminación</label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCourtDialog(false)}>Cancelar</Button>
              <Button type="submit">{editingId ? "Guardar cambios" : "Registrar cancha"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Eliminar cancha</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Se eliminará <strong>{deleteTarget?.nombre}</strong>. Esta acción podría afectar reglas de precios y horarios asociados. ¿Deseas continuar?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={async () => {
              if (!deleteTarget) return;
              try {
                await api(`/canchas/${deleteTarget.id}/`, { method: "DELETE" });
                setCourts((current) => current.filter((court) => court.id !== deleteTarget.id));
                setDeleteTarget(null);
                toast.success("Cancha eliminada.");
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "No se pudo eliminar");
              }
            }}>Eliminar cancha</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmMaintenance} onOpenChange={setConfirmMaintenance}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirmar bloqueo</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Este horario quedará cerrado para los jugadores. ¿Deseas continuar?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmMaintenance(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={createMaintenance}>Sí, bloquear horario</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
