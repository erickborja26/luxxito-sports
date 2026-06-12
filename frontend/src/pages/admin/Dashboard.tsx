import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock3,
  DollarSign,
  Receipt,
  Settings2,
  Trophy,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/StatusBadge";
import { canchas, comprobantesMock, reservasMock } from "@/data/mock";

const ocupacionSemanal = [
  { dia: "Lun", ocupacion: 54, ingresos: 1380 },
  { dia: "Mar", ocupacion: 61, ingresos: 1640 },
  { dia: "Mié", ocupacion: 58, ingresos: 1510 },
  { dia: "Jue", ocupacion: 72, ingresos: 2180 },
  { dia: "Vie", ocupacion: 88, ingresos: 2940 },
  { dia: "Sáb", ocupacion: 93, ingresos: 3420 },
  { dia: "Dom", ocupacion: 79, ingresos: 2640 },
];

const kpis = [
  { label: "Ocupación hoy", value: "78%", change: "+6% vs. ayer", icon: Activity, tone: "text-accent bg-accent/10" },
  { label: "Ingresos hoy", value: "S/ 2,840", change: "+12% vs. ayer", icon: DollarSign, tone: "text-info bg-info/10" },
  { label: "Reservas activas", value: "24", change: "12 próximas", icon: Calendar, tone: "text-warning bg-warning/10" },
  { label: "Pagos por validar", value: String(comprobantesMock.length), change: "Atender antes de 30 min", icon: Receipt, tone: "text-destructive bg-destructive/10" },
];

export default function AdminDashboard() {
  const reservasProximas = reservasMock.filter((reserva) => reserva.estado !== "CANCELADA").slice(0, 4);
  const canchasActivas = canchas.filter((cancha) => cancha.activo).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="outline" className="border-accent/30 bg-accent/5 text-accent">
              Operación en línea
            </Badge>
            <span className="text-xs text-muted-foreground">Actualizado hace 2 min</span>
          </div>
          <h1 className="text-3xl font-bold">Panel del complejo</h1>
          <p className="text-muted-foreground">Controla reservas, pagos, rendimiento y configuración desde un solo lugar.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline"><Link to="/admin/canchas"><Trophy className="mr-2 h-4 w-4" />Nueva cancha</Link></Button>
          <Button asChild variant="outline"><Link to="/admin/reservas"><Clock3 className="mr-2 h-4 w-4" />Bloquear horario</Link></Button>
          <Button asChild className="bg-gradient-accent border-0"><Link to="/admin/pagos"><Receipt className="mr-2 h-4 w-4" />Validar pagos</Link></Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="p-5 shadow-card">
            <div className={`mb-4 grid h-10 w-10 place-items-center rounded-xl ${kpi.tone}`}>
              <kpi.icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <div className="text-sm font-medium">{kpi.label}</div>
            <div className="mt-1 text-xs text-muted-foreground">{kpi.change}</div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="reservas" className="space-y-4">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 p-1 lg:w-fit lg:grid-cols-4">
          <TabsTrigger value="reservas">Reservas</TabsTrigger>
          <TabsTrigger value="pagos">Pagos pendientes</TabsTrigger>
          <TabsTrigger value="kpis">KPIs</TabsTrigger>
          <TabsTrigger value="canchas">Configuración de canchas</TabsTrigger>
        </TabsList>

        <TabsContent value="reservas" className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="font-semibold">Próximas reservas</h2>
                <p className="text-xs text-muted-foreground">Agenda operativa de hoy y los próximos días.</p>
              </div>
              <Button asChild size="sm" variant="outline"><Link to="/admin/reservas">Gestionar todas</Link></Button>
            </div>
            <div className="divide-y">
              {reservasProximas.map((reserva) => (
                <div key={reserva.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-secondary"><Calendar className="h-4 w-4" /></div>
                    <div>
                      <div className="font-medium">{reserva.canchaNombre}</div>
                      <div className="text-sm text-muted-foreground">{reserva.jugador}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(reserva.fechaInicio).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">S/ {reserva.precio}</span>
                    <StatusBadge status={reserva.estado} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold">Estado operativo</h2>
            <p className="mb-5 text-xs text-muted-foreground">Alertas que requieren atención del encargado.</p>
            <div className="space-y-3">
              <div className="flex gap-3 rounded-lg border border-warning/30 bg-warning/5 p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                <div><div className="text-sm font-medium">2 pagos próximos a vencer</div><div className="text-xs text-muted-foreground">Valídalos para no liberar las reservas.</div></div>
              </div>
              <div className="flex gap-3 rounded-lg border border-accent/30 bg-accent/5 p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <div><div className="text-sm font-medium">Sin cruces de horario</div><div className="text-xs text-muted-foreground">Todas las canchas están sincronizadas.</div></div>
              </div>
              <div className="flex gap-3 rounded-lg border p-3">
                <Users className="mt-0.5 h-4 w-4 shrink-0 text-info" />
                <div><div className="text-sm font-medium">8 clientes recurrentes</div><div className="text-xs text-muted-foreground">Han reservado 3 o más veces este mes.</div></div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="pagos">
          <Card className="p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">Comprobantes pendientes</h2>
                <p className="text-xs text-muted-foreground">Revisa monto, método y evidencia antes de decidir.</p>
              </div>
              <Button asChild size="sm"><Link to="/admin/pagos">Abrir bandeja de validación</Link></Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {comprobantesMock.map((comprobante) => {
                const coincide = comprobante.monto === comprobante.montoEsperado;
                return (
                  <div key={comprobante.id} className="rounded-xl border p-4">
                    <div className="flex items-start justify-between">
                      <div><div className="font-medium">{comprobante.jugador}</div><div className="text-xs text-muted-foreground">Reserva {comprobante.reservaId} · {comprobante.metodo}</div></div>
                      <Badge variant={coincide ? "secondary" : "destructive"}>{coincide ? "Monto correcto" : "Revisar monto"}</Badge>
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <div><div className="text-xs text-muted-foreground">Monto recibido</div><div className="text-xl font-bold">S/ {comprobante.monto}</div></div>
                      <div className="text-right"><div className="text-xs text-muted-foreground">Esperado</div><div className="font-semibold">S/ {comprobante.montoEsperado}</div></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="kpis">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div><h2 className="font-semibold">Ocupación semanal</h2><p className="text-xs text-muted-foreground">Porcentaje de slots reservados por día.</p></div>
              <Button asChild size="sm" variant="outline"><Link to="/admin/reportes">Ver reportes</Link></Button>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ocupacionSemanal}>
                  <defs>
                    <linearGradient id="ocupacion" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="dia" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                  <Area type="monotone" dataKey="ocupacion" stroke="hsl(var(--accent))" strokeWidth={3} fill="url(#ocupacion)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="canchas">
          <Card className="p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div><h2 className="font-semibold">Configuración de canchas</h2><p className="text-xs text-muted-foreground">Estado general de disponibilidad y tarifas.</p></div>
              <Button asChild size="sm"><Link to="/admin/canchas"><Settings2 className="mr-2 h-4 w-4" />Configurar</Link></Button>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border p-4"><div className="text-2xl font-bold">{canchas.length}</div><div className="text-sm text-muted-foreground">Canchas registradas</div></div>
              <div className="rounded-xl border p-4"><div className="text-2xl font-bold text-accent">{canchasActivas}</div><div className="text-sm text-muted-foreground">Canchas activas</div></div>
              <div className="rounded-xl border p-4"><div className="text-2xl font-bold">08:00 - 22:00</div><div className="text-sm text-muted-foreground">Horario principal</div></div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
