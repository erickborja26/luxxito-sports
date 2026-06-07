import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Activity, DollarSign, Calendar, AlertTriangle, Plus, Wrench, Receipt } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { reservasMock } from "@/data/mock";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

const ocupacion = Array.from({ length: 14 }, (_, i) => ({
  h: `${8 + i}h`,
  v: Math.round(40 + Math.sin(i) * 30 + Math.random() * 20),
}));

export default function AdminDashboard() {
  const kpis = [
    { label: "Ocupación hoy", value: "78%", icon: Activity, cls: "bg-accent/10 text-accent" },
    { label: "Ingresos hoy", value: "S/ 2,840", icon: DollarSign, cls: "bg-info/10 text-info" },
    { label: "Reservas pendientes", value: "12", icon: Calendar, cls: "bg-warning/10 text-warning" },
    { label: "Pagos por validar", value: "3", icon: Receipt, cls: "bg-destructive/10 text-destructive" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Panel administrador</h1>
          <p className="text-muted-foreground">Resumen operativo de tu complejo</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/canchas"><Button variant="outline"><Plus className="w-4 h-4 mr-1" />Cancha</Button></Link>
          <Link to="/admin/precios"><Button variant="outline"><DollarSign className="w-4 h-4 mr-1" />Precios</Button></Link>
          <Link to="/admin/reservas"><Button className="bg-gradient-accent border-0"><Wrench className="w-4 h-4 mr-1" />Bloquear</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <Card key={k.label} className="p-5">
            <div className={`w-10 h-10 rounded-lg grid place-items-center mb-3 ${k.cls}`}><k.icon className="w-5 h-5" /></div>
            <div className="text-2xl font-bold">{k.value}</div>
            <div className="text-xs text-muted-foreground">{k.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <h2 className="font-semibold mb-3">Ocupación por hora</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={ocupacion}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="h" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Line type="monotone" dataKey="v" stroke="hsl(var(--accent))" strokeWidth={3} dot={{ fill: "hsl(var(--accent))" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold mb-3">Próximas reservas</h2>
          <div className="space-y-2">
            {reservasMock.slice(0, 4).map(r => (
              <div key={r.id} className="flex items-start justify-between p-2 hover:bg-muted rounded-md">
                <div>
                  <div className="text-sm font-medium">{r.canchaNombre}</div>
                  <div className="text-xs text-muted-foreground">{r.jugador}</div>
                </div>
                <StatusBadge status={r.estado} className="text-[10px]" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5 bg-warning/10 border-warning/30">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
          <div>
            <div className="font-semibold">Horas valle disponibles</div>
            <p className="text-sm text-muted-foreground">8h-12h tienen baja ocupación. Crea una regla de precio dinámico para incentivar reservas.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
