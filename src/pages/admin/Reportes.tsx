import { useState } from "react";
import { CalendarX2, DollarSign, Download, Percent, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const incomeData = [
  { day: "Lun", income: 1380, reservations: 15 },
  { day: "Mar", income: 1640, reservations: 18 },
  { day: "Mié", income: 1510, reservations: 17 },
  { day: "Jue", income: 2180, reservations: 23 },
  { day: "Vie", income: 2940, reservations: 29 },
  { day: "Sáb", income: 3420, reservations: 34 },
  { day: "Dom", income: 2640, reservations: 27 },
];

const occupancyData = [
  { court: "Cancha 1", occupancy: 88, hours: 74 },
  { court: "Cancha 2", occupancy: 71, hours: 60 },
  { court: "Pádel A", occupancy: 92, hours: 77 },
  { court: "Tenis 1", occupancy: 54, hours: 45 },
];

const cancellationTrend = [
  { week: "Sem 1", cancellations: 8, rate: 5.6 },
  { week: "Sem 2", cancellations: 6, rate: 4.1 },
  { week: "Sem 3", cancellations: 7, rate: 4.7 },
  { week: "Sem 4", cancellations: 4, rate: 2.8 },
];

const cancellationReasons = [
  { name: "Cambio de planes", value: 38 },
  { name: "Clima", value: 24 },
  { name: "Error de pago", value: 21 },
  { name: "Mantenimiento", value: 17 },
];

const colors = ["hsl(var(--accent))", "hsl(var(--info))", "hsl(var(--warning))", "hsl(var(--destructive))"];
const tooltipStyle = { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 };

export default function Reportes() {
  const [from, setFrom] = useState("2026-06-01");
  const [to, setTo] = useState("2026-06-30");

  const validateRange = () => {
    if (!from || !to || to < from) {
      toast.error("Selecciona un rango de fechas válido.");
      return false;
    }
    return true;
  };

  const exportReport = () => {
    if (!validateRange()) return;
    toast.success("Reporte preparado. La descarga se simula en esta versión frontend.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div><h1 className="text-3xl font-bold">Reportes y KPIs</h1><p className="text-muted-foreground">Analiza ocupación, ingresos y cancelaciones del complejo.</p></div>
        <div className="flex flex-wrap items-end gap-2">
          <div><label className="mb-1 block text-xs text-muted-foreground" htmlFor="report-from">Desde</label><Input id="report-from" type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></div>
          <div><label className="mb-1 block text-xs text-muted-foreground" htmlFor="report-to">Hasta</label><Input id="report-to" type="date" value={to} onChange={(event) => setTo(event.target.value)} /></div>
          <Button variant="outline" onClick={exportReport}><Download className="mr-2 h-4 w-4" />Exportar</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { label: "Ingresos del mes", value: "S/ 38,420", detail: "+12% vs. mes anterior", icon: DollarSign },
          { label: "Ocupación promedio", value: "76.3%", detail: "+5.2 puntos", icon: Percent },
          { label: "Reservas completadas", value: "486", detail: "+8% vs. mes anterior", icon: TrendingUp },
          { label: "Tasa de cancelación", value: "4.2%", detail: "-1.1 puntos", icon: CalendarX2 },
        ].map((kpi) => (
          <Card key={kpi.label} className="p-5">
            <kpi.icon className="mb-3 h-5 w-5 text-accent" />
            <div className="text-2xl font-bold">{kpi.value}</div>
            <div className="text-sm font-medium">{kpi.label}</div>
            <div className="mt-1 text-xs text-muted-foreground">{kpi.detail}</div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="ocupacion" className="space-y-4">
        <TabsList className="grid h-auto w-full grid-cols-3 sm:w-fit">
          <TabsTrigger value="ocupacion">Ocupación</TabsTrigger>
          <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
          <TabsTrigger value="cancelaciones">Cancelaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="ocupacion" className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
          <Card className="p-5">
            <h2 className="font-semibold">Ocupación por cancha</h2>
            <p className="mb-4 text-sm text-muted-foreground">Porcentaje de horas disponibles que terminaron reservadas.</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancyData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="court" type="category" width={75} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="occupancy" name="Ocupación %" fill="hsl(var(--accent))" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="font-semibold">Detalle por cancha</h2>
            <p className="mb-4 text-sm text-muted-foreground">Horas efectivamente reservadas en el periodo.</p>
            <div className="space-y-3">
              {occupancyData.map((item) => (
                <div key={item.court} className="rounded-xl border p-4">
                  <div className="flex items-center justify-between"><span className="font-medium">{item.court}</span><span className="font-bold text-accent">{item.occupancy}%</span></div>
                  <div className="mt-1 text-xs text-muted-foreground">{item.hours} horas reservadas</div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-accent" style={{ width: `${item.occupancy}%` }} /></div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="ingresos" className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
          <Card className="p-5">
            <h2 className="font-semibold">Ingresos diarios</h2>
            <p className="mb-4 text-sm text-muted-foreground">Facturación total confirmada por día de la semana.</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" /><YAxis />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`S/ ${value}`, "Ingresos"]} />
                  <Bar dataKey="income" fill="hsl(var(--info))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="font-semibold">Resumen semanal</h2>
            <div className="mt-4 space-y-4">
              <div className="rounded-xl bg-muted/50 p-4"><div className="text-xs text-muted-foreground">Total semanal</div><div className="text-2xl font-bold">S/ 15,710</div></div>
              <div className="rounded-xl bg-muted/50 p-4"><div className="text-xs text-muted-foreground">Ticket promedio</div><div className="text-2xl font-bold">S/ 96.38</div></div>
              <div className="rounded-xl bg-muted/50 p-4"><div className="text-xs text-muted-foreground">Mejor día</div><div className="text-2xl font-bold">Sábado</div><div className="text-xs text-accent">S/ 3,420</div></div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="cancelaciones" className="grid gap-4 xl:grid-cols-2">
          <Card className="p-5">
            <h2 className="font-semibold">Evolución de cancelaciones</h2>
            <p className="mb-4 text-sm text-muted-foreground">Cantidad y tasa semanal de reservas canceladas.</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cancellationTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" /><YAxis />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="cancellations" name="Cancelaciones" stroke="hsl(var(--destructive))" strokeWidth={3} />
                  <Line type="monotone" dataKey="rate" name="Tasa %" stroke="hsl(var(--warning))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="font-semibold">Motivos registrados</h2>
            <p className="mb-4 text-sm text-muted-foreground">Distribución de causas informadas por jugadores y encargados.</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={cancellationReasons} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                    {cancellationReasons.map((item, index) => <Cell key={item.name} fill={colors[index]} />)}
                  </Pie>
                  <Legend /><Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
