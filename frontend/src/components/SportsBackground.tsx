import { cn } from "@/lib/utils";

/**
 * Fondo decorativo premium: malla de gradientes aurora, retícula de puntos,
 * geometría abstracta de cancha y un haz de luz diagonal.
 * Solo visual: pointer-events-none + aria-hidden, y las animaciones
 * respetan prefers-reduced-motion vía `motion-safe:`.
 */

// Líneas de cancha abstractas (círculo central, mediocampo) como geometría fina
export const CourtLines = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 400 400" className={className} fill="none">
    <circle cx="200" cy="200" r="184" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="200" cy="200" r="124" stroke="currentColor" strokeWidth="1" strokeDasharray="5 12" />
    <circle cx="200" cy="200" r="64" stroke="currentColor" strokeWidth="1.5" />
    <path d="M16 200 H384 M200 16 V384" stroke="currentColor" strokeWidth="1" />
    <circle cx="200" cy="200" r="5" fill="currentColor" />
  </svg>
);

/* Iconos de deporte para cards (no se usan en el fondo) */

const Futbol = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none">
    <circle cx="32" cy="32" r="29" fill="white" stroke="#1e293b" strokeWidth="2.5" />
    <polygon points="32,21 42.5,28.5 38.5,40.5 25.5,40.5 21.5,28.5" fill="#1e293b" />
    <path
      d="M32 21 32 8 M42.5 28.5 54.5 24 M38.5 40.5 46.5 51 M25.5 40.5 17.5 51 M21.5 28.5 9.5 24"
      stroke="#1e293b"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

const Tenis = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none">
    <circle cx="32" cy="32" r="29" fill="#d9ed4f" stroke="#aebf33" strokeWidth="2" />
    <path d="M13 9 C 29 22, 29 42, 13 55" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M51 9 C 35 22, 35 42, 51 55" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);

const Basquet = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none">
    <circle cx="32" cy="32" r="29" fill="#e8702a" stroke="#8f4517" strokeWidth="2" />
    <path d="M3 32 H61 M32 3 V61" stroke="#8f4517" strokeWidth="2.5" />
    <path d="M12 11 C 25 23, 25 41, 12 53 M52 11 C 39 23, 39 41, 52 53" stroke="#8f4517" strokeWidth="2.5" />
  </svg>
);

const Voley = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none">
    <circle cx="32" cy="32" r="29" fill="white" stroke="#2563eb" strokeWidth="2" />
    <path d="M32 32 C 32 18, 38 8, 47 5 M32 32 C 18 30, 9 23, 7 14 M32 32 C 42 42, 44 54, 39 60" stroke="#2563eb" strokeWidth="2.5" />
    <path d="M32 3 C 20 10, 14 22, 15 36 M61 32 C 56 22, 46 15, 33 14 M50 55 C 40 58, 27 56, 17 47" stroke="#2563eb" strokeWidth="2.5" />
  </svg>
);

const Padel = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none">
    <circle cx="32" cy="32" r="29" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
    <path d="M10 16 C 26 26, 38 26, 54 16 M10 48 C 26 38, 38 38, 54 48" stroke="white" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export default function SportsBackground({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("absolute inset-0 overflow-hidden pointer-events-none select-none", className)}>
      {/* Malla aurora: tres masas de color desplazándose muy lento */}
      <div className="absolute -top-32 -right-32 w-[36rem] h-[36rem] rounded-full bg-accent/15 blur-3xl motion-safe:animate-aurora" />
      <div className="absolute top-1/3 -left-44 w-[30rem] h-[30rem] rounded-full bg-info/10 blur-3xl motion-safe:animate-aurora [animation-delay:-9s]" />
      <div className="absolute -bottom-44 right-1/4 w-[32rem] h-[32rem] rounded-full bg-primary/10 blur-3xl motion-safe:animate-aurora [animation-delay:-17s]" />

      {/* Retícula de puntos con desvanecido radial desde arriba */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(hsl(var(--primary) / 0.14) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 90% 65% at 50% 0%, black 25%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 65% at 50% 0%, black 25%, transparent 78%)",
        }}
      />

      {/* Geometría de cancha: anillos finos girando casi imperceptiblemente */}
      <CourtLines className="absolute -right-56 top-1/2 -translate-y-1/2 w-[44rem] h-[44rem] text-primary opacity-[0.06] motion-safe:animate-breathe" />
      <div className="absolute -left-40 -bottom-48 w-[30rem] h-[30rem] motion-safe:animate-spin-slow [animation-duration:140s]">
        <CourtLines className="w-full h-full text-accent opacity-[0.07]" />
      </div>

      {/* Haz de luz diagonal recorriendo la vista */}
      <div className="absolute -inset-x-1/3 top-[18%] h-44 -rotate-12 bg-gradient-to-r from-transparent via-accent/[0.06] to-transparent motion-safe:animate-beam" />
    </div>
  );
}

export { Futbol, Tenis, Basquet, Voley, Padel };
