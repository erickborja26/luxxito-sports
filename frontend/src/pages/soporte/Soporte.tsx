import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { incidenciasMock, Incidencia } from "@/data/mock";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Activity,
  Clock,
  AlertOctagon,
  ServerCrash,
  MessageSquare,
  ShieldAlert,
  TriangleAlert,
  Minus,
  Wifi,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

/* ─── Severidad: color + ícono + texto (accesibilidad §7.3 guía) ─── */
const SEV_CONFIG = {
  baja: {
    label: "Baja",
    icon: Minus,
    cls: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  media: {
    label: "Media",
    icon: TriangleAlert,
    cls: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  alta: {
    label: "Alta",
    icon: ShieldAlert,
    cls: "bg-red-50 text-red-700 border border-red-200",
  },
} as const;

/* ─── Métricas de monitoreo técnico ─── */
const METRICAS = [
  {
    label: "Uptime 30d",
    value: "99.94%",
    icon: Activity,
    /* Elemento firma: pulso animado en uptime — indica sistema vivo */
    pulse: true,
    dotColor: "bg-emerald-500",
    valueColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    border: "border-l-4 border-l-emerald-500",
  },
  {
    label: "Latencia P95",
    value: "324 ms",
    icon: Wifi,
    pulse: true,
    dotColor: null,
    valueColor: "text-sky-600",
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
    border: "border-l-4 border-l-sky-500",
  },
  {
    label: "Errores 24h",
    value: "17",
    icon: AlertOctagon,
    pulse: false,
    dotColor: null,
    valueColor: "text-amber-600",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    border: "border-l-4 border-l-amber-500",
  },
  {
    label: "Cola Celery",
    value: "8 jobs",
    icon: ServerCrash,
    pulse: false,
    dotColor: null,
    valueColor: "text-red-600",
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    border: "border-l-4 border-l-red-500",
  },
];

/* ─── Componente principal ─── */
export default function Soporte() {
  const [list, setList] = useState<Incidencia[]>(incidenciasMock);
  const [sel, setSel] = useState<Incidencia | null>(null);
  const [selEstado, setSelEstado] = useState<string>("");
  const [comment, setComment] = useState("");

  /* Abrir detalle de incidencia */
  const abrirDetalle = (inc: Incidencia) => {
    setSel(inc);
    setSelEstado(inc.estado);
    setComment("");
  };

  /* Guardar cambios: estado + comentario */
  const guardar = () => {
    if (!sel) return;
    setList((prev) =>
      prev.map((x) =>
        x.id === sel.id
          ? { ...x, estado: selEstado as Incidencia["estado"] }
          : x
      )
    );
    /* [Feedback inmediato] — toast confirma la acción completada */
    toast.success("Incidencia actualizada");
    setSel(null);
    setComment("");
  };

  return (
    /* Fondo base del sistema: gris muy claro, coherente con el resto de vistas */
    <div className="space-y-6">

      {/* ── Encabezado ── */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel de soporte</h1>
        <p className="text-muted-foreground mt-1">
          Monitoreo técnico e incidencias
        </p>
      </div>

      {/* ── Métricas ──
       * [Visibilidad del estado del sistema] — siempre en la parte superior,
       * sin scroll, para lectura instantánea del operario.
       * Borde izquierdo de color semáforo = consistencia con el calendario.
       */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICAS.map((m) => (
          <div
            key={m.label}
            className={`bg-white rounded-xl shadow-sm border border-gray-100 ${m.border} p-5 space-y-3`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-lg grid place-items-center ${m.iconBg}`}>
                <m.icon className={`w-4 h-4 ${m.iconColor}`} aria-hidden="true" />
              </div>

              {/* Pulse solo en uptime — elemento firma de la vista */}
              {m.pulse && m.dotColor && (
                <span className="relative flex h-2.5 w-2.5">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full ${m.dotColor} opacity-50`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-2.5 w-2.5 ${m.dotColor}`}
                  />
                </span>
              )}
            </div>

            <div>
              <div className={`text-2xl font-bold font-mono ${m.valueColor}`}>
                {m.value}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{m.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Banner de bloqueos liberados ──
       * [Relación con el mundo real] — lenguaje del operario, no IDs internos.
       * Ícono CheckCircle2 añadido para reforzar que es información positiva.
       */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3.5 flex items-center gap-3">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
        <span className="text-sm text-emerald-800">
          <b className="font-semibold">142</b> bloqueos temporales expirados liberados
          automáticamente en las últimas 24 h.
        </span>
      </div>

      {/* ── Tabla de incidencias ──
       * [Affordance] — cursor pointer + hover en filas indica interactividad.
       * [Accesibilidad §7.3] — severidad: color + ícono + texto, nunca solo color.
       * [Reconocimiento antes de recuerdo] — toda la info relevante visible
       *   en la tabla sin necesidad de abrir cada incidencia.
       */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <span className="font-semibold text-gray-900">Incidencias activas</span>
          <span className="text-xs text-muted-foreground font-mono bg-gray-100 px-2 py-0.5 rounded-full">
            {list.length} registros
          </span>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-gray-100">
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Título
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Severidad
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Estado
              </TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((inc) => {
              const sev = SEV_CONFIG[inc.severidad];
              const SevIcon = sev.icon;
              return (
                <TableRow
                  key={inc.id}
                  /* [Affordance] hover visible para indicar que es clickable */
                  className="border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => abrirDetalle(inc)}
                >
                  <TableCell>
                    <span className="font-medium text-gray-900 text-sm">
                      {inc.titulo}
                    </span>
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {inc.descripcion}
                    </div>
                  </TableCell>

                  <TableCell>
                    {/* [Accesibilidad §7.3] color + ícono + texto */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${sev.cls}`}
                    >
                      <SevIcon className="w-3 h-3" aria-hidden="true" />
                      {sev.label}
                    </span>
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={inc.estado} />
                  </TableCell>

                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        abrirDetalle(inc);
                      }}
                    >
                      Ver detalle
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* ── Modal de detalle / edición ──
       * [Control y libertad] — botón Cancelar siempre visible.
       * [Feedback inmediato] — Select actualiza estado en tiempo real.
       * [Prevención de errores] — cambio de estado es un paso explícito,
       *   separado del campo de comentario para evitar confusión.
       */}
      <Dialog open={!!sel} onOpenChange={() => setSel(null)}>
        <DialogContent className="bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-gray-900">
              {sel?.titulo}
            </DialogTitle>
          </DialogHeader>

          {sel && (
            <div className="space-y-5 text-sm">
              <p className="text-muted-foreground leading-relaxed">
                {sel.descripcion}
              </p>

              {/* Estado — [Relación con el mundo real]: etiquetas comprensibles */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Estado de la incidencia
                </label>
                <Select value={selEstado} onValueChange={(v) => setSelEstado(v)}>
                  <SelectTrigger className="border-gray-200 bg-gray-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["ABIERTA", "EN_PROCESO", "RESUELTA"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Comentario técnico */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                  Comentario de resolución
                </label>
                <Textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe las acciones tomadas o el diagnóstico…"
                  className="border-gray-200 bg-gray-50 resize-none placeholder:text-gray-400"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              className="text-gray-500 hover:text-gray-900"
              onClick={() => setSel(null)}
            >
              Cancelar
            </Button>
            {/* [Consistencia] botón primario = color accent del sistema (verde) */}
            <Button
              onClick={guardar}
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-0"
            >
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
