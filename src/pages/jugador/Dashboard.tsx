import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { reservasMock } from "@/data/mock";
import { Trophy, Calendar, MapPin, Star, Plus } from "lucide-react";

const scoringStyles: Record<string, { label: string; cls: string }> = {
  nuevo: { label: "Nuevo", cls: "from-slate-400 to-slate-600" },
  frecuente: { label: "Frecuente", cls: "from-accent to-emerald-500" },
  vip: { label: "VIP", cls: "from-amber-400 to-orange-500" },
};

export default function JugadorDashboard() {
  const { user } = useAuth();
  const score = scoringStyles[user?.scoring || "nuevo"];
  const proximas = reservasMock.filter(r => ["CONFIRMADA", "BLOQUEADA", "PENDIENTE"].includes(r.estado));
  const historial = reservasMock.filter(r => ["CANCELADA", "VENCIDA"].includes(r.estado));

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Hola, {user?.name} 👋</h1>
          <p className="text-muted-foreground">Tus reservas y horarios favoritos en un solo lugar.</p>
        </div>
        <Link to="/jugador/disponibilidad">
          <Button size="lg" className="bg-gradient-accent border-0 shadow-glow">
            <Plus className="w-4 h-4 mr-2" />Reservar cancha
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className={`p-5 bg-gradient-to-br ${score.cls} text-white border-0`}>
          <div className="flex items-center gap-2 mb-2"><Star className="w-4 h-4" /><span className="text-sm font-medium">Tu nivel</span></div>
          <div className="text-3xl font-bold">{score.label}</div>
          <p className="text-xs text-white/80 mt-1">Seña requerida: {user?.scoring === "nuevo" ? "50%" : "20%"}</p>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-muted-foreground mb-1">Próximas reservas</div>
          <div className="text-3xl font-bold">{proximas.length}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-muted-foreground mb-1">Total jugadas</div>
          <div className="text-3xl font-bold">12</div>
        </Card>
      </div>

      <section>
        <h2 className="text-xl font-bold mb-3">Próximas reservas</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {proximas.map(r => (
            <Card key={r.id} className="p-5 hover:shadow-elegant transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 grid place-items-center"><Trophy className="w-5 h-5 text-accent" /></div>
                  <div>
                    <div className="font-semibold">{r.canchaNombre}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{r.complejoNombre}</div>
                  </div>
                </div>
                <StatusBadge status={r.estado} />
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4" />{new Date(r.fechaInicio).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" })}
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">S/ {r.precio}</span>
                <Link to="/jugador/confirmacion"><Button variant="outline" size="sm">Ver detalle</Button></Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Historial</h2>
        <Card className="divide-y">
          {historial.map(r => (
            <div key={r.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{r.canchaNombre} · {r.complejoNombre}</div>
                <div className="text-xs text-muted-foreground">{new Date(r.fechaInicio).toLocaleString("es-PE")}</div>
              </div>
              <StatusBadge status={r.estado} />
            </div>
          ))}
        </Card>
      </section>
    </div>
  );
}
