// Datos mock para LuxxitoSports
export interface Complejo { id: string; nombre: string; direccion: string; ciudad: string; distrito: string; descripcion?: string; }
export interface Cancha { id: string; complejoId: string; nombre: string; deporte: string; superficie: string; techado: boolean; iluminacion: boolean; tarifaEstandar: number; activo: boolean; }
export interface Reserva { id: string; canchaId: string; canchaNombre: string; complejoNombre: string; jugador: string; fechaInicio: string; fechaFin: string; precio: number; estado: "BLOQUEADA" | "CONFIRMADA" | "CANCELADA" | "VENCIDA" | "PENDIENTE"; metodoPago?: string; }
export interface Extra { id: string; nombre: string; tipo: string; cantidad: number; estado: "OPERATIVO" | "DAÑADO"; precio: number; }
export interface ReglaPrecio { id: string; canchaId: string; diaSemana: string; horaInicio: string; horaFin: string; tarifa: number; }
export interface Incidencia { id: string; titulo: string; descripcion: string; estado: "ABIERTA" | "EN_PROCESO" | "RESUELTA"; severidad: "baja" | "media" | "alta"; }
export interface Comprobante { id: string; reservaId: string; jugador: string; monto: number; montoEsperado: number; metodo: "Yape" | "Transferencia"; subidoEn: string; imagen: string; }

// 5 complejos en 3 distritos (2 + 2 + 1) para poder probar el filtro por distrito
export const complejos: Complejo[] = [
  { id: "c1", nombre: "Mundialitos Club", direccion: "Av. Aviación 2500", ciudad: "Lima", distrito: "San Borja", descripcion: "El clásico del barrio: fútbol y pádel con tribuna techada." },
  { id: "c2", nombre: "Arena Premium", direccion: "Av. San Luis 1800", ciudad: "Lima", distrito: "San Borja", descripcion: "Canchas de arcilla y arena profesional para raqueta y vóley." },
  { id: "c3", nombre: "La Bombonera Sport", direccion: "Malecón Cisneros 150", ciudad: "Lima", distrito: "Miraflores", descripcion: "Duela profesional frente al mar, ideal para básquet nocturno." },
  { id: "c4", nombre: "Olympus Center", direccion: "Av. Larco 980", ciudad: "Lima", distrito: "Miraflores", descripcion: "Club boutique de raqueta: pádel de cristal y tenis iluminado." },
  { id: "c5", nombre: "Galáctico Sports", direccion: "Av. Caminos del Inca 1200", ciudad: "Lima", distrito: "Surco", descripcion: "El multideporte más completo del sur de Lima." },
];

// Resolver de nombre centralizado: úsalo en vez de hardcodear nombres de complejo
export const getComplejo = (id: string) => complejos.find((c) => c.id === id);
export const nombreComplejo = (id: string) => getComplejo(id)?.nombre ?? "Complejo";

export const deportes = ["Fútbol", "Tenis", "Pádel", "Básquet", "Vóley"];

// Todos los deportes existen en la red, pero ningún complejo los tiene todos
export const canchas: Cancha[] = [
  // c1 · Mundialitos Club (San Borja): Fútbol + Pádel
  { id: "ca1", complejoId: "c1", nombre: "Cancha 1", deporte: "Fútbol", superficie: "Grass sintético", techado: true, iluminacion: true, tarifaEstandar: 120, activo: true },
  { id: "ca2", complejoId: "c1", nombre: "Cancha 2", deporte: "Fútbol", superficie: "Grass natural", techado: false, iluminacion: true, tarifaEstandar: 100, activo: true },
  { id: "ca3", complejoId: "c1", nombre: "Pádel A", deporte: "Pádel", superficie: "Cristal", techado: true, iluminacion: true, tarifaEstandar: 80, activo: true },
  // c2 · Arena Premium (San Borja): Tenis + Vóley
  { id: "ca4", complejoId: "c2", nombre: "Tenis 1", deporte: "Tenis", superficie: "Arcilla", techado: false, iluminacion: true, tarifaEstandar: 90, activo: true },
  { id: "ca6", complejoId: "c2", nombre: "Vóley Arena", deporte: "Vóley", superficie: "Arena", techado: false, iluminacion: true, tarifaEstandar: 60, activo: true },
  // c3 · La Bombonera Sport (Miraflores): Básquet + Fútbol
  { id: "ca5", complejoId: "c3", nombre: "Básquet 1", deporte: "Básquet", superficie: "Parquet", techado: true, iluminacion: true, tarifaEstandar: 70, activo: true },
  { id: "ca7", complejoId: "c3", nombre: "Cancha Mar", deporte: "Fútbol", superficie: "Grass sintético", techado: false, iluminacion: true, tarifaEstandar: 110, activo: true },
  // c4 · Olympus Center (Miraflores): Pádel + Tenis
  { id: "ca8", complejoId: "c4", nombre: "Pádel Olympus", deporte: "Pádel", superficie: "Cristal", techado: true, iluminacion: true, tarifaEstandar: 95, activo: true },
  { id: "ca9", complejoId: "c4", nombre: "Tenis Centre", deporte: "Tenis", superficie: "Cemento", techado: false, iluminacion: true, tarifaEstandar: 85, activo: true },
  // c5 · Galáctico Sports (Surco): Fútbol + Vóley + Básquet
  { id: "ca10", complejoId: "c5", nombre: "Estadio 1", deporte: "Fútbol", superficie: "Grass sintético", techado: true, iluminacion: true, tarifaEstandar: 130, activo: true },
  { id: "ca11", complejoId: "c5", nombre: "Vóley Galáctico", deporte: "Vóley", superficie: "Parquet", techado: true, iluminacion: true, tarifaEstandar: 65, activo: true },
  { id: "ca12", complejoId: "c5", nombre: "Básquet Pro", deporte: "Básquet", superficie: "Parquet", techado: true, iluminacion: true, tarifaEstandar: 75, activo: true },
];

export const reservasMock: Reserva[] = [
  { id: "r1", canchaId: "ca1", canchaNombre: "Cancha 1", complejoNombre: "Mundialitos Club", jugador: "Carlos Pérez", fechaInicio: "2026-06-10T19:00", fechaFin: "2026-06-10T20:00", precio: 120, estado: "CONFIRMADA", metodoPago: "Tarjeta" },
  { id: "r2", canchaId: "ca3", canchaNombre: "Pádel A", complejoNombre: "Mundialitos Club", jugador: "Carlos Pérez", fechaInicio: "2026-06-12T20:00", fechaFin: "2026-06-12T21:00", precio: 80, estado: "BLOQUEADA", metodoPago: "Yape" },
  { id: "r3", canchaId: "ca4", canchaNombre: "Tenis 1", complejoNombre: "Arena Premium", jugador: "Carlos Pérez", fechaInicio: "2026-05-28T18:00", fechaFin: "2026-05-28T19:00", precio: 90, estado: "CANCELADA" },
  { id: "r4", canchaId: "ca2", canchaNombre: "Cancha 2", complejoNombre: "Mundialitos Club", jugador: "Ana Torres", fechaInicio: "2026-06-08T17:00", fechaFin: "2026-06-08T18:00", precio: 100, estado: "PENDIENTE", metodoPago: "Transferencia" },
];

// Deriva complejoNombre en tiempo de ejecución para que sea siempre consistente con el mock de complejos
reservasMock.forEach(r => {
  const cancha = canchas.find(c => c.id === r.canchaId);
  if (cancha) r.complejoNombre = nombreComplejo(cancha.complejoId);
});

export const extrasMock: Extra[] = [
  { id: "e1", nombre: "Pelota de fútbol", tipo: "Pelota", cantidad: 8, estado: "OPERATIVO", precio: 10 },
  { id: "e2", nombre: "Set de chalecos x10", tipo: "Indumentaria", cantidad: 4, estado: "OPERATIVO", precio: 15 },
  { id: "e3", nombre: "Árbitro profesional", tipo: "Servicio", cantidad: 2, estado: "OPERATIVO", precio: 80 },
  { id: "e4", nombre: "Pelota de tenis x3", tipo: "Pelota", cantidad: 0, estado: "OPERATIVO", precio: 12 },
  { id: "e5", nombre: "Raqueta de pádel", tipo: "Equipo", cantidad: 3, estado: "DAÑADO", precio: 20 },
];

export const reglasPrecioMock: ReglaPrecio[] = [
  { id: "rp1", canchaId: "ca1", diaSemana: "Viernes", horaInicio: "18:00", horaFin: "22:00", tarifa: 160 },
  { id: "rp2", canchaId: "ca1", diaSemana: "Sábado", horaInicio: "10:00", horaFin: "14:00", tarifa: 140 },
  { id: "rp3", canchaId: "ca3", diaSemana: "Lunes", horaInicio: "19:00", horaFin: "22:00", tarifa: 100 },
];

export const comprobantesMock: Comprobante[] = [
  { id: "cp1", reservaId: "r4", jugador: "Ana Torres", monto: 100, montoEsperado: 100, metodo: "Transferencia", subidoEn: "2026-06-07T14:20", imagen: "" },
  { id: "cp2", reservaId: "r2", jugador: "Carlos Pérez", monto: 75, montoEsperado: 80, metodo: "Yape", subidoEn: "2026-06-07T13:55", imagen: "" },
];

export const incidenciasMock: Incidencia[] = [
  { id: "i1", titulo: "Latencia alta en checkout", descripcion: "P95 supera 800ms en endpoint /reservas", estado: "EN_PROCESO", severidad: "alta" },
  { id: "i2", titulo: "Cola Celery atrasada", descripcion: "20 jobs pendientes", estado: "ABIERTA", severidad: "media" },
  { id: "i3", titulo: "Bloqueos expirados sin liberar", descripcion: "Worker reiniciado", estado: "RESUELTA", severidad: "baja" },
];

// Genera estado de slots para una cancha en un día (8h-22h)
export function generarSlots(canchaId: string, fecha: string) {
  const slots = [];
  const seedCancha = canchaId.charCodeAt(canchaId.length - 1);
  // La fecha entra en el seed: cada día tiene disponibilidad distinta pero estable
  const seedFecha = fecha.split("-").reduce((acc, n) => acc + Number(n), 0);
  const seed = seedCancha + seedFecha;
  for (let h = 8; h < 22; h++) {
    const r = (seed * h * 13) % 10;
    let estado: "libre" | "bloqueado" | "reservado" | "mantenimiento" = "libre";
    if (r < 4) estado = "reservado";
    else if (r === 4) estado = "bloqueado";
    else if (r === 5) estado = "mantenimiento";
    const cancha = canchas.find((c) => c.id === canchaId);
    const base = cancha?.tarifaEstandar || 100;
    const precio = h >= 18 ? Math.round(base * 1.3) : base;
    slots.push({ hora: `${String(h).padStart(2, "0")}:00`, estado, precio });
  }
  return slots;
}
