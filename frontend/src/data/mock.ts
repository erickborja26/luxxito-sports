// Datos mock para LuxxitoSports
export interface Complejo { id: string; nombre: string; direccion: string; ciudad: string; }
export interface Cancha { id: string; complejoId: string; nombre: string; deporte: string; superficie: string; techado: boolean; iluminacion: boolean; tarifaEstandar: number; activo: boolean; }
export interface Reserva { id: string; canchaId: string; canchaNombre: string; complejoNombre: string; jugador: string; fechaInicio: string; fechaFin: string; precio: number; estado: "BLOQUEADA" | "CONFIRMADA" | "CANCELADA" | "VENCIDA" | "PENDIENTE"; metodoPago?: string; }
export interface Extra { id: string; nombre: string; tipo: string; cantidad: number; estado: "OPERATIVO" | "DAÑADO"; precio: number; }
export interface ReglaPrecio { id: string; canchaId: string; diaSemana: string; horaInicio: string; horaFin: string; tarifa: number; }
export interface Incidencia { id: string; titulo: string; descripcion: string; estado: "ABIERTA" | "EN_PROCESO" | "RESUELTA"; severidad: "baja" | "media" | "alta"; }
export interface Comprobante { id: string; reservaId: string; jugador: string; monto: number; montoEsperado: number; metodo: "Yape" | "Transferencia"; subidoEn: string; imagen: string; }

export const complejos: Complejo[] = [
  { id: "c1", nombre: "Luxxito San Borja", direccion: "Av. Aviación 2500", ciudad: "Lima" },
  { id: "c2", nombre: "Luxxito Miraflores", direccion: "Malecón Cisneros 150", ciudad: "Lima" },
  { id: "c3", nombre: "Luxxito Surco", direccion: "Av. Caminos del Inca 1200", ciudad: "Lima" },
];

export const deportes = ["Fútbol", "Tenis", "Pádel", "Básquet", "Vóley"];

export const canchas: Cancha[] = [
  { id: "ca1", complejoId: "c1", nombre: "Cancha 1", deporte: "Fútbol", superficie: "Grass sintético", techado: true, iluminacion: true, tarifaEstandar: 120, activo: true },
  { id: "ca2", complejoId: "c1", nombre: "Cancha 2", deporte: "Fútbol", superficie: "Grass natural", techado: false, iluminacion: true, tarifaEstandar: 100, activo: true },
  { id: "ca3", complejoId: "c1", nombre: "Pádel A", deporte: "Pádel", superficie: "Cristal", techado: true, iluminacion: true, tarifaEstandar: 80, activo: true },
  { id: "ca4", complejoId: "c2", nombre: "Tenis 1", deporte: "Tenis", superficie: "Arcilla", techado: false, iluminacion: true, tarifaEstandar: 90, activo: true },
  { id: "ca5", complejoId: "c3", nombre: "Básquet 1", deporte: "Básquet", superficie: "Parquet", techado: true, iluminacion: true, tarifaEstandar: 70, activo: false },
];

export const reservasMock: Reserva[] = [
  { id: "r1", canchaId: "ca1", canchaNombre: "Cancha 1", complejoNombre: "Luxxito San Borja", jugador: "Carlos Pérez", fechaInicio: "2026-06-10T19:00", fechaFin: "2026-06-10T20:00", precio: 120, estado: "CONFIRMADA", metodoPago: "Tarjeta" },
  { id: "r2", canchaId: "ca3", canchaNombre: "Pádel A", complejoNombre: "Luxxito San Borja", jugador: "Carlos Pérez", fechaInicio: "2026-06-12T20:00", fechaFin: "2026-06-12T21:00", precio: 80, estado: "BLOQUEADA", metodoPago: "Yape" },
  { id: "r3", canchaId: "ca4", canchaNombre: "Tenis 1", complejoNombre: "Luxxito Miraflores", jugador: "Carlos Pérez", fechaInicio: "2026-05-28T18:00", fechaFin: "2026-05-28T19:00", precio: 90, estado: "CANCELADA" },
  { id: "r4", canchaId: "ca2", canchaNombre: "Cancha 2", complejoNombre: "Luxxito San Borja", jugador: "Ana Torres", fechaInicio: "2026-06-08T17:00", fechaFin: "2026-06-08T18:00", precio: 100, estado: "PENDIENTE", metodoPago: "Transferencia" },
];

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
  const seed = canchaId.charCodeAt(canchaId.length - 1);
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
