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

/* Geometrías de cancha por deporte (vista cenital, líneas finas en currentColor).
   Se usan como fondo de la cabecera de cada cancha para que cada deporte tenga identidad. */

export const CourtFutbol = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 400 260" className={className} fill="none" stroke="currentColor">
    <rect x="8" y="8" width="384" height="244" strokeWidth="2" />
    <path d="M200 8 V252" strokeWidth="1.5" />
    <circle cx="200" cy="130" r="40" strokeWidth="1.5" />
    <circle cx="200" cy="130" r="3" fill="currentColor" stroke="none" />
    <rect x="8" y="62" width="66" height="136" strokeWidth="1.5" />
    <rect x="8" y="98" width="26" height="64" strokeWidth="1.5" />
    <path d="M74 102 A40 40 0 0 1 74 158" strokeWidth="1.5" />
    <rect x="326" y="62" width="66" height="136" strokeWidth="1.5" />
    <rect x="366" y="98" width="26" height="64" strokeWidth="1.5" />
    <path d="M326 158 A40 40 0 0 1 326 102" strokeWidth="1.5" />
    <path d="M8 22 A14 14 0 0 0 22 8 M378 8 A14 14 0 0 0 392 22 M392 238 A14 14 0 0 0 378 252 M22 252 A14 14 0 0 0 8 238" strokeWidth="1.5" />
  </svg>
);

export const CourtTenis = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 400 260" className={className} fill="none" stroke="currentColor">
    <rect x="8" y="8" width="384" height="244" strokeWidth="2" />
    <path d="M8 42 H392 M8 218 H392" strokeWidth="1.5" />
    <path d="M200 8 V252" strokeWidth="2" strokeDasharray="4 7" />
    <path d="M104 42 V218 M296 42 V218" strokeWidth="1.5" />
    <path d="M104 130 H296" strokeWidth="1.5" />
  </svg>
);

export const CourtBasquet = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 400 260" className={className} fill="none" stroke="currentColor">
    <rect x="8" y="8" width="384" height="244" strokeWidth="2" />
    <path d="M200 8 V252" strokeWidth="1.5" />
    <circle cx="200" cy="130" r="34" strokeWidth="1.5" />
    <rect x="8" y="85" width="76" height="90" strokeWidth="1.5" />
    <circle cx="84" cy="130" r="28" strokeWidth="1.5" />
    <path d="M8 32 H40 A126 126 0 0 1 40 228 H8" strokeWidth="1.5" />
    <circle cx="32" cy="130" r="6" strokeWidth="1.5" />
    <rect x="316" y="85" width="76" height="90" strokeWidth="1.5" />
    <circle cx="316" cy="130" r="28" strokeWidth="1.5" />
    <path d="M392 32 H360 A126 126 0 0 0 360 228 H392" strokeWidth="1.5" />
    <circle cx="368" cy="130" r="6" strokeWidth="1.5" />
  </svg>
);

export const CourtVoley = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 400 260" className={className} fill="none" stroke="currentColor">
    <rect x="8" y="8" width="384" height="244" strokeWidth="2" />
    <path d="M200 2 V258" strokeWidth="2.5" strokeDasharray="3 6" />
    <path d="M136 8 V252 M264 8 V252" strokeWidth="1.5" />
    <path d="M168 8 V252 M232 8 V252" strokeWidth="1" strokeDasharray="2 8" />
  </svg>
);

export const CourtPadel = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 400 260" className={className} fill="none" stroke="currentColor">
    <rect x="8" y="8" width="384" height="244" strokeWidth="2" />
    <path d="M200 8 V252" strokeWidth="2" strokeDasharray="4 7" />
    <path d="M76 8 V252 M324 8 V252" strokeWidth="1.5" />
    <path d="M8 130 H76 M324 130 H392" strokeWidth="1.5" />
    <path d="M8 8 H392 M8 252 H392" strokeWidth="3" opacity="0.5" />
  </svg>
);

/* ── Ícono de ticket/entrada de evento deportivo ────────────────────────── */
export const TicketIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="tkt-body" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="55%" stopColor="#4f46e5" />
        <stop offset="100%" stopColor="#3730a3" />
      </linearGradient>
      <linearGradient id="tkt-stub" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#818cf8" />
        <stop offset="100%" stopColor="#6366f1" />
      </linearGradient>
      <linearGradient id="tkt-shine" x1="20%" y1="0%" x2="80%" y2="100%">
        <stop offset="0%" stopColor="white" stopOpacity="0.28" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </linearGradient>
      <filter id="tkt-shadow" x="-10%" y="-10%" width="120%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#3730a3" floodOpacity="0.45" />
      </filter>
    </defs>

    {/* Cuerpo principal del ticket */}
    <g filter="url(#tkt-shadow)">
      <rect x="4" y="16" width="56" height="32" rx="5" fill="url(#tkt-body)" />
    </g>

    {/* Muesca semicircular izquierda */}
    <circle cx="4" cy="32" r="5.5" fill="white" />
    {/* Muesca semicircular derecha */}
    <circle cx="60" cy="32" r="5.5" fill="white" />

    {/* Línea de corte punteada (divide cuerpo del stub) */}
    <line x1="44" y1="18" x2="44" y2="46" stroke="white" strokeWidth="1.4" strokeDasharray="2.5 2.5" strokeOpacity="0.55" />

    {/* Stub derecho (talón) */}
    <rect x="44" y="16" width="16" height="32" rx="0" fill="url(#tkt-stub)" opacity="0.55" />
    {/* Rectángulo de esquina del stub */}
    <rect x="44" y="16" width="16" height="32" rx="0" ry="0" fill="none" />
    {/* Esquinas redondeadas del stub lado derecho */}
    <path d="M44 16 H56 A4 4 0 0 1 60 20 V44 A4 4 0 0 1 56 48 H44" fill="url(#tkt-stub)" opacity="0.6" />

    {/* Estrella decorativa en el cuerpo */}
    <path d="M24 28 L25.5 31.5 L29 32 L26.5 34.5 L27 38 L24 36.5 L21 38 L21.5 34.5 L19 32 L22.5 31.5 Z"
      fill="white" opacity="0.9" />

    {/* Líneas de texto simuladas */}
    <rect x="10" y="26" width="9" height="2" rx="1" fill="white" opacity="0.35" />
    <rect x="10" y="31" width="7" height="1.5" rx="0.75" fill="white" opacity="0.25" />
    <rect x="10" y="35" width="8" height="1.5" rx="0.75" fill="white" opacity="0.25" />

    {/* Agujero de perforación (para colgante) */}
    <circle cx="34" cy="32" r="2.2" fill="none" stroke="white" strokeWidth="1.2" opacity="0.45" />

    {/* Brillo especular superior */}
    <rect x="4" y="16" width="56" height="14" rx="5" fill="url(#tkt-shine)" />
  </svg>
);

/* ── Íconos de deporte ──────────────────────────────────────────────────── */

const Futbol = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none">
    <defs>
      <radialGradient id="ic-futbol" cx="38%" cy="28%" r="75%">
        <stop offset="0%" stopColor="#f1f5f9" />
        <stop offset="55%" stopColor="#e2e8f0" />
        <stop offset="100%" stopColor="#94a3b8" />
      </radialGradient>
      <radialGradient id="ic-futbol-shadow" cx="50%" cy="50%" r="50%">
        <stop offset="60%" stopColor="transparent" />
        <stop offset="100%" stopColor="#0f172a" stopOpacity="0.18" />
      </radialGradient>
      <filter id="futbol-drop" x="-8%" y="-8%" width="120%" height="128%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0f172a" floodOpacity="0.3" />
      </filter>
    </defs>
    <g filter="url(#futbol-drop)">
      <circle cx="32" cy="32" r="28" fill="url(#ic-futbol)" stroke="#334155" strokeWidth="1.5" />
    </g>
    <circle cx="32" cy="32" r="28" fill="url(#ic-futbol-shadow)" />
    {/* Parche central */}
    <polygon points="32,20 42.5,27.5 38.5,40 25.5,40 21.5,27.5" fill="#1e293b" />
    {/* Costuras desde parche */}
    <path d="M32 20 V8.5 M42.5 27.5 L54 23 M38.5 40 L46.5 51 M25.5 40 L17.5 51 M21.5 27.5 L10 23"
      stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
    {/* Vértices exteriores de parches */}
    <path d="M32 8.5 L22 4 M32 8.5 L42 4 M54 23 L59 31.5 M10 23 L5 31.5 M46.5 51 L40 58.5 M17.5 51 L24 58.5"
      stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
    {/* Brillo especular */}
    <ellipse cx="22" cy="16" rx="8" ry="4.5" fill="white" opacity="0.55" transform="rotate(-30 22 16)" />
    <ellipse cx="26" cy="13" rx="3" ry="1.8" fill="white" opacity="0.35" transform="rotate(-30 26 13)" />
  </svg>
);

const Tenis = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none">
    <defs>
      <radialGradient id="ic-tenis" cx="38%" cy="28%" r="75%">
        <stop offset="0%" stopColor="#f7fee7" />
        <stop offset="50%" stopColor="#d9f99d" />
        <stop offset="100%" stopColor="#84cc16" />
      </radialGradient>
      <radialGradient id="ic-tenis-shadow" cx="50%" cy="50%" r="50%">
        <stop offset="55%" stopColor="transparent" />
        <stop offset="100%" stopColor="#365314" stopOpacity="0.2" />
      </radialGradient>
      <filter id="tenis-drop" x="-8%" y="-8%" width="120%" height="128%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#365314" floodOpacity="0.35" />
      </filter>
    </defs>
    <g filter="url(#tenis-drop)">
      <circle cx="32" cy="32" r="28" fill="url(#ic-tenis)" stroke="#65a30d" strokeWidth="1.5" />
    </g>
    <circle cx="32" cy="32" r="28" fill="url(#ic-tenis-shadow)" />
    {/* Costuras típicas de pelota de tenis */}
    <path d="M13 10 C 30 22, 30 42, 13 54" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    <path d="M51 10 C 34 22, 34 42, 51 54" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    {/* Sombra sutil debajo de costuras */}
    <path d="M13 10 C 30 22, 30 42, 13 54 M51 10 C 34 22, 34 42, 51 54"
      stroke="#84cc16" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7" />
    {/* Brillo */}
    <ellipse cx="21" cy="15" rx="8" ry="4.5" fill="white" opacity="0.55" transform="rotate(-30 21 15)" />
    <ellipse cx="25" cy="12" rx="3" ry="1.8" fill="white" opacity="0.4" transform="rotate(-30 25 12)" />
  </svg>
);

const Basquet = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none">
    <defs>
      <radialGradient id="ic-basquet" cx="38%" cy="28%" r="75%">
        <stop offset="0%" stopColor="#fed7aa" />
        <stop offset="50%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#c2410c" />
      </radialGradient>
      <radialGradient id="ic-basquet-shadow" cx="50%" cy="50%" r="50%">
        <stop offset="55%" stopColor="transparent" />
        <stop offset="100%" stopColor="#7c2d12" stopOpacity="0.25" />
      </radialGradient>
      <filter id="basquet-drop" x="-8%" y="-8%" width="120%" height="128%">
        <feDropShadow dx="0" dy="2" stdDeviation="2.2" floodColor="#7c2d12" floodOpacity="0.4" />
      </filter>
    </defs>
    <g filter="url(#basquet-drop)">
      <circle cx="32" cy="32" r="28" fill="url(#ic-basquet)" stroke="#9a3412" strokeWidth="1.5" />
    </g>
    <circle cx="32" cy="32" r="28" fill="url(#ic-basquet-shadow)" />
    {/* Costuras de balón de básquet */}
    <path d="M4.5 28 C 22 24, 42 24, 59.5 28" stroke="#7c2d12" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M4.5 36 C 22 40, 42 40, 59.5 36" stroke="#7c2d12" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M32 4 V60" stroke="#7c2d12" strokeWidth="2.2" />
    <path d="M12 10.5 C 25 22, 25 42, 12 53.5" stroke="#7c2d12" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M52 10.5 C 39 22, 39 42, 52 53.5" stroke="#7c2d12" strokeWidth="2.2" strokeLinecap="round" />
    {/* Brillo */}
    <ellipse cx="21" cy="15" rx="8" ry="4.5" fill="white" opacity="0.35" transform="rotate(-30 21 15)" />
    <ellipse cx="25" cy="12" rx="3.5" ry="1.8" fill="white" opacity="0.3" transform="rotate(-30 25 12)" />
  </svg>
);

const Voley = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none">
    <defs>
      <radialGradient id="ic-voley" cx="38%" cy="28%" r="75%">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="55%" stopColor="#e0e7f5" />
        <stop offset="100%" stopColor="#93afd4" />
      </radialGradient>
      <filter id="voley-drop" x="-8%" y="-8%" width="120%" height="128%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#1e3a8a" floodOpacity="0.35" />
      </filter>
    </defs>
    <g filter="url(#voley-drop)">
      <circle cx="32" cy="32" r="28" fill="url(#ic-voley)" stroke="#2563eb" strokeWidth="1.5" />
    </g>
    {/* Paneles del vóley: 3 azul + 3 amarillo intercalados */}
    <path d="M32 32 C 33 17, 40 7.5, 50 4.5 A28 28 0 0 1 60 32 Z" fill="#2563eb" opacity="0.75" />
    <path d="M32 32 C 19 31, 8.5 24.5, 5 14.5 A28 28 0 0 1 32 4 C 38 4, 44 6, 50 4.5 Z" fill="#facc15" opacity="0.8" />
    <path d="M32 32 C 19 31, 8.5 24.5, 5 14.5 A28 28 0 0 0 4.5 32 C 4.5 42, 9 51, 16.5 57 Z" fill="#2563eb" opacity="0.75" />
    <path d="M32 32 C 33 47, 26 57, 16.5 57 A28 28 0 0 0 47.5 57.5 Z" fill="#facc15" opacity="0.8" />
    <path d="M32 32 C 46 33, 57 26, 60 15 A28 28 0 0 1 60 32 C 60 42, 55.5 51, 47.5 57.5 Z" fill="#2563eb" opacity="0.75" />
    <path d="M32 32 C 33 17, 40 7.5, 50 4.5 A28 28 0 0 0 32 4 Z" fill="#facc15" opacity="0.8" />
    {/* Contorno */}
    <circle cx="32" cy="32" r="28" stroke="#1d4ed8" strokeWidth="1.5" />
    {/* Líneas de costura */}
    <path d="M32 32 C 33 17, 40 7.5, 50 4.5 M32 32 C 19 31, 8.5 24.5, 5 14.5 M32 32 C 33 47, 26 57, 16.5 57 M32 32 C 46 33, 57 26, 60 15 M32 32 C 17 31, 9 42, 16.5 57 M32 32 C 47 33, 56 43, 47.5 57.5"
      stroke="white" strokeWidth="1" opacity="0.5" />
    {/* Brillo */}
    <ellipse cx="21" cy="15" rx="8" ry="4.5" fill="white" opacity="0.55" transform="rotate(-30 21 15)" />
    <ellipse cx="25" cy="12" rx="3" ry="1.8" fill="white" opacity="0.4" transform="rotate(-30 25 12)" />
  </svg>
);

const Padel = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none">
    <defs>
      <linearGradient id="ic-padel-pala" x1="15%" y1="5%" x2="85%" y2="95%">
        <stop offset="0%" stopColor="#fde68a" />
        <stop offset="50%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
      <linearGradient id="ic-padel-mango" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#92400e" />
        <stop offset="100%" stopColor="#5c1f06" />
      </linearGradient>
      <radialGradient id="ic-padel-pelota" cx="35%" cy="28%" r="75%">
        <stop offset="0%" stopColor="#f7fee7" />
        <stop offset="60%" stopColor="#bef264" />
        <stop offset="100%" stopColor="#65a30d" />
      </radialGradient>
      <filter id="padel-drop" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="1" dy="2" stdDeviation="2.5" floodColor="#78350f" floodOpacity="0.45" />
      </filter>
    </defs>
    <g filter="url(#padel-drop)">
      {/* Mango */}
      <g transform="rotate(38 32 32)">
        <rect x="28.5" y="39" width="7" height="18" rx="3" fill="url(#ic-padel-mango)" />
        {/* Grip tape */}
        <rect x="28.5" y="40" width="7" height="2.5" rx="1" fill="white" opacity="0.15" />
        <rect x="28.5" y="44" width="7" height="2.5" rx="1" fill="white" opacity="0.15" />
        <rect x="28.5" y="48" width="7" height="2.5" rx="1" fill="white" opacity="0.15" />
        {/* Pala */}
        <path d="M32 5 C 45 5, 52 14, 52 25 C 52 37, 43 43, 32 43 C 21 43, 12 37, 12 25 C 12 14, 19 5, 32 5 Z"
          fill="url(#ic-padel-pala)" stroke="#b45309" strokeWidth="1.8" />
        {/* Marco de la pala */}
        <path d="M32 8 C 43 8, 49 16, 49 25 C 49 35.5, 41.5 40, 32 40 C 22.5 40, 15 35.5, 15 25 C 15 16, 21 8, 32 8 Z"
          fill="none" stroke="#d97706" strokeWidth="1" opacity="0.5" />
        {/* Agujeros hexagonales */}
        <g fill="none" stroke="#92400e" strokeWidth="1.2" opacity="0.7">
          <circle cx="26" cy="16" r="2.2" /><circle cx="38" cy="16" r="2.2" />
          <circle cx="20" cy="24" r="2.2" /><circle cx="32" cy="24" r="2.2" /><circle cx="44" cy="24" r="2.2" />
          <circle cx="26" cy="32" r="2.2" /><circle cx="38" cy="32" r="2.2" />
          <circle cx="32" cy="38" r="2.2" />
        </g>
        {/* Brillo de la pala */}
        <ellipse cx="23" cy="12" rx="7" ry="4" fill="white" opacity="0.4" transform="rotate(-20 23 12)" />
      </g>
    </g>
    {/* Pelota en esquina inferior derecha */}
    <g filter="url(#padel-drop)">
      <circle cx="51" cy="51" r="8.5" fill="url(#ic-padel-pelota)" stroke="#65a30d" strokeWidth="1.5" />
      <path d="M46 46.5 C 51 50.5, 51 52.5, 46.5 56" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
      <ellipse cx="47" cy="46" rx="3.5" ry="2" fill="white" opacity="0.45" transform="rotate(-30 47 46)" />
    </g>
  </svg>
);

export default function SportsBackground({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("absolute inset-0 overflow-hidden pointer-events-none select-none", className)}>
      {/* Resplandor de estadio: luz cenital verde cayendo desde arriba */}
      <div
        className="absolute -top-44 left-1/2 -translate-x-1/2 w-[64rem] h-[30rem]"
        style={{ background: "radial-gradient(ellipse at center top, hsl(152 70% 42% / 0.13), hsl(170 75% 40% / 0.05) 45%, transparent 70%)" }}
      />

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

      {/* Grano de película: textura fina que quita el look plano de SaaS genérico */}
      <div
        className="absolute inset-0 opacity-[0.30] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}

export { Futbol, Tenis, Basquet, Voley, Padel };

export const iconoDeporte: Record<string, ({ className }: { className?: string }) => JSX.Element> = {
  "Fútbol": Futbol,
  "Tenis": Tenis,
  "Básquet": Basquet,
  "Vóley": Voley,
  "Pádel": Padel,
};

// Identidad visual por deporte: su cancha real como geometría de fondo
// + gradiente y halo tintados a su color. Se usa en cabeceras de cancha y portadas de complejo.
export type FondoDeporte = {
  Court: ({ className }: { className?: string }) => JSX.Element;
  gradiente: string;
  /** Gradiente vivo para tiles pequeños (fecha en tarjeta de reserva). */
  tileGradiente: string;
  halo: string;
  textura?: string;
};

export const fondoDeporte: Record<string, FondoDeporte> = {
  "Fútbol": {
    Court: CourtFutbol,
    gradiente: "linear-gradient(135deg, hsl(222 65% 16%) 0%, hsl(222 62% 12%) 45%, hsl(152 65% 17%) 100%)",
    tileGradiente: "linear-gradient(160deg, hsl(152 65% 32%) 0%, hsl(160 70% 22%) 100%)",
    halo: "bg-accent/25",
    textura: "repeating-linear-gradient(90deg, hsl(0 0% 100% / 0.025) 0 40px, transparent 40px 80px)",
  },
  "Tenis": {
    Court: CourtTenis,
    gradiente: "linear-gradient(135deg, hsl(222 65% 16%) 0%, hsl(222 62% 12%) 45%, hsl(14 70% 19%) 100%)",
    tileGradiente: "linear-gradient(160deg, hsl(14 75% 42%) 0%, hsl(20 72% 28%) 100%)",
    halo: "bg-orange-500/25",
  },
  "Básquet": {
    Court: CourtBasquet,
    gradiente: "linear-gradient(135deg, hsl(222 65% 16%) 0%, hsl(222 62% 12%) 45%, hsl(26 80% 17%) 100%)",
    tileGradiente: "linear-gradient(160deg, hsl(26 85% 45%) 0%, hsl(18 80% 30%) 100%)",
    halo: "bg-amber-500/25",
    textura: "repeating-linear-gradient(0deg, hsl(0 0% 100% / 0.02) 0 14px, transparent 14px 28px)",
  },
  "Vóley": {
    Court: CourtVoley,
    gradiente: "linear-gradient(135deg, hsl(222 65% 16%) 0%, hsl(222 62% 12%) 45%, hsl(212 75% 21%) 100%)",
    tileGradiente: "linear-gradient(160deg, hsl(212 75% 42%) 0%, hsl(220 70% 28%) 100%)",
    halo: "bg-sky-400/25",
  },
  "Pádel": {
    Court: CourtPadel,
    gradiente: "linear-gradient(135deg, hsl(222 65% 16%) 0%, hsl(222 62% 12%) 45%, hsl(186 70% 16%) 100%)",
    tileGradiente: "linear-gradient(160deg, hsl(186 65% 35%) 0%, hsl(192 70% 22%) 100%)",
    halo: "bg-teal-300/25",
  },
};
