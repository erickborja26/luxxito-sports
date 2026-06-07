import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const ingresos = ["L", "M", "X", "J", "V", "S", "D"].map((d, i) => ({ d, ingresos: 600 + Math.round(Math.random() * 1200) + (i > 3 ? 800 : 0) }));
const horasPico = Array.from({ length: 14 }, (_, i) => ({ h: `${8 + i}h`, r: Math.round(10 + Math.random() * 40 + (i > 9 ? 30 : 0)) }));
const ocupCancha = [
  { name: "Cancha 1", v: 85 }, { name: "Cancha 2", v: 65 }, { name: "Pádel A", v: 92 }, { name: "Tenis 1", v: 48 },
];
const COLORS = ["hsl(var(--accent))", "hsl(var(--info))", "hsl(var(--warning))", "hsl(var(--destructive))"];

export default function Reportes() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Reportes y KPIs</h1>
          <p className="text-muted-foreground">Métricas clave de tu complejo</p>
        </div>
        <div className="flex gap-2">
          <Input type="date" defaultValue="2026-06-01" />
          <Input type="date" defaultValue="2026-06-30" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: "Ingresos mes", v: "S/ 38,420", d: "+12% vs anterior" },
          { l: "Reservas", v: "486", d: "+8%" },
          { l: "Tasa cancelación", v: "4.2%", d: "-1.1%" },
          { l: "Clientes frecuentes", v: "62", d: "scoring ≥ 5" },
        ].map(k => (
          <Card key={k.l} className="p-5">
            <div className="text-xs text-muted-foreground">{k.l}</div>
            <div className="text-2xl font-bold mt-1">{k.v}</div>
            <div className="text-xs text-accent mt-1">{k.d}</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h2 className="font-semibold mb-3">Ingresos diarios</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={ingresos}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="d" /><YAxis />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="ingresos" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold mb-3">Horas pico</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={horasPico}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="h" /><YAxis />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Line type="monotone" dataKey="r" stroke="hsl(var(--info))" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="font-semibold mb-3">Ocupación por cancha</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={ocupCancha} dataKey="v" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {ocupCancha.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend /><Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
