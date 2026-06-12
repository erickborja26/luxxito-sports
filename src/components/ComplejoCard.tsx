import { MapPin, ArrowRight } from "lucide-react";
import { Complejo, canchas } from "@/data/mock";
import { iconoDeporte, fondoDeporte } from "@/components/SportsBackground";
import { cn } from "@/lib/utils";

/**
 * Tarjeta de complejo para la vista "Todos los complejos".
 * La portada es generada (gradiente del deporte principal + su cancha en perspectiva),
 * sin depender de imágenes externas.
 */
export default function ComplejoCard({ complejo, onSelect }: { complejo: Complejo; onSelect: () => void }) {
  const propias = canchas.filter(c => c.complejoId === complejo.id && c.activo);

  // Conteo de canchas por deporte, ordenado de mayor a menor
  const conteos = Object.entries(
    propias.reduce<Record<string, number>>((acc, c) => {
      acc[c.deporte] = (acc[c.deporte] ?? 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const deportePrincipal = conteos[0]?.[0] ?? "Fútbol";
  const fondo = fondoDeporte[deportePrincipal] ?? fondoDeporte["Fútbol"];
  const desde = propias.length ? Math.min(...propias.map(c => c.tarifaEstandar)) : null;

  return (
    <button
      onClick={onSelect}
      aria-label={`${complejo.nombre}, ${complejo.distrito}, ${propias.length} canchas. Ver horarios`}
      className="group block w-full text-left rounded-2xl overflow-hidden border bg-card shadow-card cursor-pointer
        transition-all duration-300 hover:shadow-elegant hover:-translate-y-1
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {/* Portada generada: frontis abstracto del complejo */}
      <div className="relative h-32 text-white overflow-hidden" style={{ background: fondo.gradiente }}>
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none">
          {fondo.textura && <div className="absolute inset-0" style={{ backgroundImage: fondo.textura }} />}
          <fondo.Court className="absolute -right-8 -bottom-16 w-72 text-white opacity-[0.14] [transform:perspective(600px)_rotateX(40deg)_rotate(-4deg)] transition-transform duration-500 group-hover:scale-110" />
          <div className={cn("absolute -left-12 -bottom-16 w-40 h-40 rounded-full blur-3xl", fondo.halo)} />
          <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/[0.07] to-transparent" />
        </div>
        <div className="relative h-full flex flex-col justify-end p-4">
          <div className="font-bold text-lg leading-tight">{complejo.nombre}</div>
          <div className="text-xs text-white/75 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
            {complejo.distrito} · {complejo.direccion}
          </div>
        </div>
        {desde !== null && (
          <div className="absolute top-3 right-3 text-right bg-black/25 backdrop-blur-sm rounded-lg px-2.5 py-1">
            <div className="text-[9px] uppercase tracking-wider text-white/65 leading-none">Desde</div>
            <div className="font-bold text-sm leading-tight">S/ {desde}</div>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        {complejo.descripcion && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{complejo.descripcion}</p>
        )}

        {/* Canchas por deporte: ícono + cantidad + nombre (nunca solo color/ícono) */}
        <div className="flex flex-wrap gap-1.5" aria-label="Canchas por deporte">
          {conteos.map(([dep, n]) => {
            const Icono = iconoDeporte[dep];
            return (
              <span key={dep} className="inline-flex items-center gap-1.5 text-xs font-medium bg-muted border rounded-full pl-1.5 pr-2.5 py-1">
                {Icono && <Icono className="w-4 h-4 shrink-0" />}
                {n} {dep}
              </span>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-1 border-t">
          <span className="text-xs text-muted-foreground">
            {propias.length} {propias.length === 1 ? "cancha disponible" : "canchas disponibles"}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent transition-transform duration-200 group-hover:translate-x-0.5">
            Ver horarios <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </button>
  );
}
