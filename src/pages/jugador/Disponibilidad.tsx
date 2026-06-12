import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { complejos, canchas, deportes, generarSlots, getComplejo, Cancha } from "@/data/mock";
import { Futbol, iconoDeporte, fondoDeporte } from "@/components/SportsBackground";
import ComplejoCard from "@/components/ComplejoCard";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Clock, Flame, Home, Lightbulb, Lock, MapPin, SearchX, Sparkles, Timer, Wrench } from "lucide-react";

type Slot = { hora: string; estado: "libre" | "bloqueado" | "reservado" | "mantenimiento"; precio: number };

// Estados visibles para el jugador (texto + color, nunca solo color)
const leyenda = [
  { etiqueta: "Disponible", dot: "bg-slot-free", chip: "bg-slot-free/10 border-slot-free/30 text-slot-free" },
  { etiqueta: "En proceso", dot: "bg-slot-locked motion-safe:animate-pulse", chip: "bg-slot-locked/10 border-slot-locked/30 text-slot-locked" },
  { etiqueta: "Ocupada", dot: "bg-slot-booked", chip: "bg-slot-booked/10 border-slot-booked/30 text-slot-booked" },
  { etiqueta: "Mantenimiento", dot: "bg-slot-maintenance", chip: "bg-slot-maintenance/10 border-slot-maintenance/40 text-muted-foreground" },
];

const mensajeNoDisponible: Record<string, string> = {
  reservado: "El horario seleccionado ya no está disponible. Por favor elige otro.",
  bloqueado: "Otro jugador está reservando este horario. Vuelve a intentarlo en unos minutos o elige otro.",
  mantenimiento: "La cancha está en mantenimiento en este horario. Elige otro horario disponible.",
};


const horas = Array.from({ length: 14 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);
const fmtFecha = (d: Date) => d.toLocaleDateString("en-CA"); // yyyy-mm-dd en hora local
const hoy = fmtFecha(new Date());

const proximosDias = Array.from({ length: 21 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  return d;
});

// Chip de horario según estado
const SlotChip = ({ slot, onClick }: { slot: Slot; onClick: () => void }) => {
  const punta = Number(slot.hora.slice(0, 2)) >= 18;

  if (slot.estado === "libre") {
    return (
      <button
        onClick={onClick}
        title={`Disponible · ${slot.hora} · S/ ${slot.precio}`}
        aria-label={`${slot.hora}, disponible, S/ ${slot.precio}`}
        className="group relative rounded-xl border-2 border-slot-free/45 bg-slot-free/[0.08] py-2.5 px-1 transition-all duration-200 cursor-pointer
          shadow-[inset_0_1px_0_hsl(var(--slot-free)/0.15)]
          hover:bg-gradient-accent hover:border-transparent hover:shadow-glow hover:scale-[1.05] active:scale-95
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
      >
        {/* Destello que recorre el chip al pasar el cursor (recortado a los bordes) */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
          <span
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent
              motion-safe:group-hover:translate-x-full motion-safe:transition-transform motion-safe:duration-700"
          />
        </span>
        {/* Badge de hora punta: resalta sobre el chip */}
        {punta && (
          <span
            className="absolute -top-1.5 -right-1.5 z-10 grid place-items-center w-5 h-5 rounded-full bg-warning text-white
              shadow-[0_2px_6px_hsl(var(--warning)/0.5)] ring-2 ring-card"
            aria-label="Hora punta"
            title="Hora punta · mayor demanda"
          >
            <Flame className="w-3 h-3" aria-hidden="true" />
          </span>
        )}
        <div className="relative flex items-center justify-center gap-1 font-bold text-sm tabular-nums text-foreground group-hover:text-white transition-colors">
          {slot.hora}
        </div>
        <div className="relative text-[11px] font-semibold text-accent group-hover:text-white/90 transition-colors">S/ {slot.precio}</div>
      </button>
    );
  }

  // Cada estado no disponible tiene identidad visual propia: tinte, borde e indicador
  const cfg = {
    reservado: {
      label: "Ocupada",
      chip: "border-slot-booked/25 bg-slot-booked/[0.07]",
      hora: "text-muted-foreground/50 line-through decoration-slot-booked/40 decoration-2",
      texto: "text-slot-booked/80",
      indicador: <Lock className="w-2.5 h-2.5" aria-hidden="true" />,
    },
    bloqueado: {
      label: "En proceso",
      chip: "border-slot-locked/35 bg-slot-locked/[0.09] motion-safe:[animation:pulse_2.5s_ease-in-out_infinite]",
      hora: "text-foreground/70",
      texto: "text-slot-locked",
      indicador: <span className="w-1.5 h-1.5 rounded-full bg-slot-locked motion-safe:animate-ping absolute" aria-hidden="true" />,
      indicadorBase: <span className="relative w-1.5 h-1.5 rounded-full bg-slot-locked" aria-hidden="true" />,
    },
    mantenimiento: {
      label: "Mant.",
      chip: "border-border/60 bg-muted/40 [background-image:repeating-linear-gradient(45deg,transparent,transparent_6px,hsl(var(--border)/0.35)_6px,hsl(var(--border)/0.35)_7px)]",
      hora: "text-muted-foreground/50",
      texto: "text-muted-foreground/70",
      indicador: <Wrench className="w-2.5 h-2.5" aria-hidden="true" />,
    },
  }[slot.estado];

  return (
    <button
      onClick={onClick}
      title={`${cfg.label} · ${slot.hora}`}
      aria-label={`${slot.hora}, ${cfg.label}, no seleccionable`}
      aria-disabled="true"
      className={cn("rounded-xl border py-2.5 px-1 cursor-not-allowed transition-colors duration-200", cfg.chip)}
    >
      <div className={cn("font-bold text-sm", cfg.hora)}>{slot.hora}</div>
      <div className={cn("flex items-center justify-center gap-1 text-[10px] font-semibold", cfg.texto)}>
        {"indicadorBase" in cfg ? (
          <span className="relative flex items-center justify-center w-2 h-2">
            {cfg.indicador}
            {cfg.indicadorBase}
          </span>
        ) : (
          cfg.indicador
        )}
        {cfg.label}
      </div>
    </button>
  );
};

const distritos = [...new Set(complejos.map(c => c.distrito))];

export default function Disponibilidad() {
  const [distrito, setDistrito] = useState("todos");
  const [complejo, setComplejo] = useState("todos");
  const [deporte, setDeporte] = useState("todos");
  const [fecha, setFecha] = useState(hoy);
  const [horaDesde, setHoraDesde] = useState("todas");
  const [cargando, setCargando] = useState(true);
  const [sel, setSel] = useState<{ cancha: Cancha; slot: Slot } | null>(null);
  const nav = useNavigate();

  // Simula la consulta al backend para dar feedback de carga al cambiar filtros
  useEffect(() => {
    setCargando(true);
    const t = setTimeout(() => setCargando(false), 450);
    return () => clearTimeout(t);
  }, [distrito, complejo, deporte, fecha, horaDesde]);

  // Filtrado encadenado: distrito → complejo → deporte
  const complejosFiltrados = useMemo(
    () => complejos.filter(c => distrito === "todos" || c.distrito === distrito),
    [distrito]
  );

  // Al cambiar distrito, si el complejo elegido ya no pertenece, volver a "todos"
  const onDistrito = (d: string) => {
    setDistrito(d);
    if (complejo !== "todos" && d !== "todos" && getComplejo(complejo)?.distrito !== d) {
      setComplejo("todos");
    }
  };

  const canchasFiltradas = useMemo(() => {
    const idsVisibles = new Set(complejosFiltrados.map(c => c.id));
    return canchas.filter(c =>
      (complejo === "todos" ? idsVisibles.has(c.complejoId) : c.complejoId === complejo) &&
      (deporte === "todos" || c.deporte === deporte) &&
      c.activo
    );
  }, [complejo, deporte, complejosFiltrados]);

  // En modo "todos": tarjetas de complejos (del distrito) que ofrecen el deporte filtrado
  const complejosVisibles = useMemo(
    () => complejosFiltrados.filter(cx =>
      canchas.some(c => c.complejoId === cx.id && c.activo && (deporte === "todos" || c.deporte === deporte))
    ),
    [complejosFiltrados, deporte]
  );

  const vistaTodos = complejo === "todos";
  const complejoSel = complejos.find(c => c.id === complejo);

  // Porcentaje de horarios libres por día. null = no hay canchas de ese deporte/complejo
  const dispPorDia = useMemo(() => {
    const m: Record<string, number | null> = {};
    for (const d of proximosDias) {
      const f = fmtFecha(d);
      if (canchasFiltradas.length === 0) { m[f] = null; continue; }
      let libres = 0, total = 0;
      for (const c of canchasFiltradas) {
        for (const s of generarSlots(c.id, f)) {
          total++;
          if (s.estado === "libre") libres++;
        }
      }
      m[f] = total ? libres / total : 0;
    }
    return m;
  }, [canchasFiltradas]);

  // La barra refleja OCUPACIÓN (qué tan llena está): llena/100% rojo (sin cupos),
  // >50% ámbar (quedan pocos), <=50% verde (varias opciones).
  const colorOcupacion = (ocupado: number) =>
    ocupado >= 1 ? "bg-slot-booked" : ocupado > 0.5 ? "bg-warning" : "bg-slot-free";

  const onSlot = (cancha: Cancha, slot: Slot) => {
    if (slot.estado !== "libre") {
      toast.error(mensajeNoDisponible[slot.estado], {
        description: "Los horarios se actualizan en tiempo real.",
      });
      return;
    }
    setSel({ cancha, slot });
  };

  const limpiarFiltros = () => {
    setDistrito("todos");
    setDeporte("todos");
    setHoraDesde("todas");
    toast.info("Filtros restablecidos");
  };

  const fechaLegible = new Date(fecha + "T00:00").toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent bg-accent/10 rounded-full px-3 py-1 mb-2">
          <Sparkles className="w-3 h-3" /> Precios actualizados en tiempo real
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold">
          Consultar{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg, hsl(152 70% 42%), hsl(170 75% 40%))" }}
          >
            disponibilidad
          </span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">Encuentra tu horario perfecto y reserva en menos de un minuto.</p>
      </div>

      {/* Filtros + selector de días */}
      <Card className="rounded-2xl bg-card/80 backdrop-blur-md shadow-card overflow-hidden">
        <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="f-distrito">Distrito</Label>
            <Select value={distrito} onValueChange={onDistrito}>
              <SelectTrigger id="f-distrito" className="cursor-pointer"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los distritos</SelectItem>
                {distritos.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="f-complejo">Complejo</Label>
            <Select value={complejo} onValueChange={setComplejo}>
              <SelectTrigger id="f-complejo" className="cursor-pointer"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los complejos</SelectItem>
                {complejosFiltrados.map(c => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="f-deporte">Deporte</Label>
            <Select value={deporte} onValueChange={setDeporte}>
              <SelectTrigger id="f-deporte" className="cursor-pointer"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los deportes</SelectItem>
                {deportes.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="f-hora">Hora desde</Label>
            <Select value={horaDesde} onValueChange={setHoraDesde}>
              <SelectTrigger id="f-hora" className="cursor-pointer"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Cualquier hora</SelectItem>
                {horas.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tira de días estilo booking */}
        <div className="border-t bg-muted/30 px-4 sm:px-5 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]" role="radiogroup" aria-label="Elegir fecha">
            {proximosDias.map((d, i) => {
              const v = fmtFecha(d);
              const activo = v === fecha;
              const pctDia = dispPorDia[v];
              const sinCanchas = pctDia === null;
              const ocupDia = sinCanchas ? 0 : 1 - pctDia; // la barra refleja ocupación
              return (
                <button
                  key={v}
                  role="radio"
                  aria-checked={activo}
                  title={sinCanchas ? "Sin canchas de este deporte" : `${Math.round(ocupDia * 100)}% ocupado · ${Math.round((pctDia as number) * 100)}% libre`}
                  onClick={() => setFecha(v)}
                  className={cn(
                    "flex flex-col items-center w-14 shrink-0 rounded-xl border py-2 transition-all duration-200 cursor-pointer",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                    activo
                      ? "bg-gradient-accent text-white border-transparent shadow-glow scale-105 ring-2 ring-accent/30 ring-offset-2"
                      : "bg-card border-border text-muted-foreground hover:border-accent/50 hover:text-foreground hover:-translate-y-0.5"
                  )}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wide">
                    {i === 0 ? "Hoy" : d.toLocaleDateString("es-PE", { weekday: "short" }).replace(".", "")}
                  </span>
                  <span className="text-lg font-bold leading-tight">{d.getDate()}</span>
                  <span className="text-[9px] uppercase opacity-75">{d.toLocaleDateString("es-PE", { month: "short" }).replace(".", "")}</span>
                  {/* Barra de ocupación del día: barra llena = sin cupos (rojo) */}
                  <span className={cn("mt-1.5 h-1.5 w-9 rounded-full overflow-hidden", activo ? "bg-white/30" : "bg-muted")} aria-hidden="true">
                    {!sinCanchas && (
                      <span
                        className={cn("block h-full rounded-full transition-[width] duration-500", activo ? "bg-white" : colorOcupacion(ocupDia))}
                        style={{ width: `${Math.max(8, Math.round(ocupDia * 100))}%` }}
                      />
                    )}
                  </span>
                  <span className={cn("text-[8px] font-bold leading-none mt-1 tabular-nums", activo ? "text-white/90" : "text-muted-foreground/60")}>
                    {sinCanchas ? "—" : `${Math.round(ocupDia * 100)}%`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Leyenda de estados: texto + color, no solo color */}
      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm" aria-label="Leyenda de estados">
        {leyenda.map(l => (
          <span key={l.etiqueta} className={cn("inline-flex items-center gap-1.5 font-semibold border rounded-full px-3 py-1", l.chip)}>
            <span className={cn("w-2 h-2 rounded-full", l.dot)} aria-hidden="true" />
            {l.etiqueta}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 font-medium bg-card border rounded-full px-3 py-1 shadow-card ring-1 ring-inset ring-warning/30">
          <Flame className="w-3.5 h-3.5 text-warning" aria-hidden="true" /> Hora punta
        </span>
      </div>

      {/* Contexto de la vista + ruta de regreso a la grilla de complejos */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {vistaTodos ? (
            <>
              <span className="font-medium text-foreground">{complejosVisibles.length}</span>{" "}
              {complejosVisibles.length === 1 ? "complejo" : "complejos"}
              {distrito !== "todos" && <> en <span className="font-medium text-foreground">{distrito}</span></>}
              {deporte !== "todos" && <> con <span className="font-medium text-foreground">{deporte}</span></>}
              . Elige uno para ver sus horarios.
            </>
          ) : (
            <>
              Mostrando disponibilidad para el <span className="capitalize font-medium text-foreground">{fechaLegible}</span> en{" "}
              <span className="font-medium text-foreground">{complejoSel?.nombre}</span> ({complejoSel?.distrito}).
            </>
          )}
        </p>
        {!vistaTodos && (
          <Button variant="ghost" size="sm" className="text-accent hover:text-accent" onClick={() => setComplejo("todos")}>
            ← Todos los complejos
          </Button>
        )}
      </div>

      {cargando ? (
        vistaTodos ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" aria-busy="true" aria-label="Buscando complejos">
            {[1, 2, 3].map(i => (
              <Card key={i} className="rounded-2xl overflow-hidden">
                <Skeleton className="h-32 w-full rounded-none" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-5" aria-busy="true" aria-label="Buscando horarios disponibles">
            {[1, 2].map(i => (
              <Card key={i} className="rounded-2xl overflow-hidden">
                <Skeleton className="h-24 w-full rounded-none" />
                <div className="p-4 sm:p-5 grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-2">
                  {Array.from({ length: 14 }).map((_, j) => <Skeleton key={j} className="h-14 rounded-xl" />)}
                </div>
              </Card>
            ))}
          </div>
        )
      ) : vistaTodos ? (
        complejosVisibles.length === 0 ? (
          <Card className="p-10 text-center rounded-2xl">
            <SearchX className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-lg font-semibold mb-1">No encontramos complejos con esos filtros</p>
            <p className="text-sm text-muted-foreground mb-4">Prueba con otro distrito u otro deporte.</p>
            <Button variant="outline" onClick={limpiarFiltros}>Restablecer filtros</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {complejosVisibles.map((cx, i) => (
              <div key={cx.id} className="animate-fade-in" style={{ animationDelay: `${i * 90}ms`, animationFillMode: "both" }}>
                <ComplejoCard complejo={cx} onSelect={() => setComplejo(cx.id)} />
              </div>
            ))}
          </div>
        )
      ) : canchasFiltradas.length === 0 ? (
        <Card className="p-10 text-center rounded-2xl">
          <SearchX className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-lg font-semibold mb-1">No encontramos canchas con esos filtros</p>
          <p className="text-sm text-muted-foreground mb-4">Prueba con otro deporte u otro complejo.</p>
          <Button variant="outline" onClick={limpiarFiltros}>Restablecer filtros</Button>
        </Card>
      ) : (
        <div className="space-y-5">
          {canchasFiltradas.map((c, idx) => {
            const slots = generarSlots(c.id, fecha).filter(s => horaDesde === "todas" || s.hora >= horaDesde);
            const libres = slots.filter(s => s.estado === "libre").length;
            const pct = slots.length ? Math.round((libres / slots.length) * 100) : 0;
            const proximoLibre = slots.find(s => s.estado === "libre");
            const Icono = iconoDeporte[c.deporte] || Futbol;
            const fondo = fondoDeporte[c.deporte] ?? fondoDeporte["Fútbol"];
            return (
              <Card
                key={c.id}
                className="rounded-2xl overflow-hidden animate-fade-in transition-shadow duration-200 hover:shadow-elegant"
                style={{ animationDelay: `${idx * 90}ms`, animationFillMode: "both" }}
              >
                {/* Cabecera oscura de la cancha, con identidad por deporte */}
                <div className="relative text-white px-4 sm:px-5 py-4 overflow-hidden" style={{ background: fondo.gradiente }}>
                  <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none">
                    {/* Textura del terreno (césped, duela) si el deporte la tiene */}
                    {fondo.textura && <div className="absolute inset-0" style={{ backgroundImage: fondo.textura }} />}
                    {/* La cancha del deporte en perspectiva, como vista desde la tribuna */}
                    <fondo.Court className="absolute -right-12 -bottom-24 w-[30rem] text-white opacity-[0.13] [transform:perspective(700px)_rotateX(42deg)_rotate(-4deg)]" />
                    <div className={cn("absolute -left-16 -bottom-20 w-48 h-48 rounded-full blur-3xl", fondo.halo)} />
                    {/* Luz cenital sutil sobre el borde superior */}
                    <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-white/[0.07] to-transparent" />
                  </div>
                  <div className="relative flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 grid place-items-center shrink-0">
                        <Icono className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="font-semibold">{c.nombre} · {c.deporte}</div>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <span className="text-[10px] bg-white/10 border border-white/10 rounded-full px-2 py-0.5">{c.superficie}</span>
                          {c.techado && <span className="text-[10px] bg-white/10 border border-white/10 rounded-full px-2 py-0.5">Techado</span>}
                          {c.iluminacion && <span className="text-[10px] bg-white/10 border border-white/10 rounded-full px-2 py-0.5">Iluminada</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider text-white/55">Desde</div>
                      <div className="font-bold text-xl leading-tight">S/ {c.tarifaEstandar}</div>
                    </div>
                  </div>
                  {/* Medidor de ocupación: barra llena = cancha llena (rojo) */}
                  <div className="relative flex items-center gap-2.5 mt-3">
                    <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-[width] duration-500", colorOcupacion((100 - pct) / 100))}
                        style={{ width: `${100 - pct}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-white/70 whitespace-nowrap">{libres} de {slots.length} libres</span>
                    {libres > 0 && libres <= 3 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-warning bg-warning/15 border border-warning/30 rounded-full px-2 py-0.5 whitespace-nowrap">
                        <Flame className="w-2.5 h-2.5" aria-hidden="true" /> ¡Últimos {libres}!
                      </span>
                    )}
                    {proximoLibre && (
                      <button
                        onClick={() => onSlot(c, proximoLibre)}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-white bg-white/10 border border-white/20 rounded-full px-2 py-0.5 whitespace-nowrap cursor-pointer
                          transition-colors duration-200 hover:bg-gradient-accent hover:border-transparent
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                      >
                        <Clock className="w-2.5 h-2.5" aria-hidden="true" /> Próx. libre {proximoLibre.hora}
                      </button>
                    )}
                  </div>
                </div>

                {/* Grilla de horarios */}
                <div className="p-4 sm:p-5">
                  {slots.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">No hay horarios desde las {horaDesde}. Prueba con una hora anterior.</p>
                  ) : libres === 0 ? (
                    <div className="mb-3 flex items-center gap-2 text-xs font-medium text-slot-booked bg-slot-booked/[0.07] border border-slot-booked/20 rounded-lg px-3 py-2">
                      <SearchX className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      Sin horarios libres en esta fecha. Los puntos del calendario te indican qué días tienen disponibilidad.
                    </div>
                  ) : null}
                  {slots.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-2 text-center">
                      {slots.map(s => <SlotChip key={s.hora} slot={s} onClick={() => onSlot(c, s)} />)}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detalle de cancha + confirmación de selección */}
      <Dialog open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>{sel?.cancha.nombre} · {sel?.cancha.deporte}</DialogTitle>
            <DialogDescription>Revisa el detalle antes de iniciar tu reserva.</DialogDescription>
          </DialogHeader>
          {sel && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="p-3 rounded-xl bg-muted flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground">Complejo</div>
                    <div className="font-medium">{complejoSel?.nombre}</div>
                    <div className="text-xs text-muted-foreground">{complejoSel?.direccion}</div>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-muted flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground">Fecha y hora</div>
                    <div className="font-medium capitalize">{fechaLegible}</div>
                    <div className="text-xs text-muted-foreground">{sel.slot.hora} · 1 hora</div>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-muted flex items-center gap-2">
                  <Home className="w-4 h-4 text-accent shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground">Superficie</div>
                    <div className="font-medium">{sel.cancha.superficie}</div>
                    <div className="text-xs text-muted-foreground">{sel.cancha.techado ? "Techado" : "Al aire libre"}</div>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-muted flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-accent shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground">Iluminación</div>
                    <div className="font-medium">{sel.cancha.iluminacion ? "Sí" : "No"}</div>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-accent text-accent-foreground flex items-center justify-between">
                <span className="text-sm">Precio del horario</span>
                <span className="font-bold text-xl">S/ {sel.slot.precio}</span>
              </div>
              <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                <Timer className="w-3.5 h-3.5 mt-0.5 shrink-0 text-warning" />
                Al iniciar la reserva, este horario quedará bloqueado para ti durante 20 minutos mientras completas el pago.
              </p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSel(null)}>Volver</Button>
            <Button
              className="bg-gradient-accent border-0 shadow-glow hover:-translate-y-0.5 hover:brightness-110 transition-all duration-200"
              onClick={() => nav("/jugador/reservar", { state: { ...sel, fecha } })}
            >
              Iniciar reserva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
