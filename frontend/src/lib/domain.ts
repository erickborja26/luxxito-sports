export type Role = "jugador" | "admin" | "soporte";
export type ApiRole = "JUGADOR" | "ADMINISTRADOR" | "SOPORTE";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  scoring?: "nuevo" | "frecuente" | "vip";
}

export interface Complejo {
  id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  activo: boolean;
  horarios?: Horario[];
}

export interface Horario {
  id?: number;
  dia_semana: number;
  habilitado: boolean;
  hora_apertura: string;
  hora_cierre: string;
}

export interface Deporte {
  id: number;
  nombre: string;
}

export interface Cancha {
  id: string;
  complejoId: string;
  complejoNombre: string;
  deporteId: number;
  nombre: string;
  deporte: string;
  superficie: string;
  techado: boolean;
  iluminacion: boolean;
  tarifaEstandar: number;
  activo: boolean;
}

export interface Extra {
  id: string;
  complejoId: string;
  nombre: string;
  tipo: string;
  cantidad: number;
  estado: "OPERATIVO" | "DANADO";
  precio: number;
  activo: boolean;
}

export interface ExtraReservado {
  id?: string;
  nombre: string;
  cantidad: number;
  precio: number;
}

export interface Pago {
  id: string;
  reservaId: string;
  jugador: string;
  monto: number;
  montoEsperado: number;
  metodo: string;
  estado: string;
  referencia: string;
  imagen: string;
  subidoEn: string;
}

export interface ReservaJugador {
  id: string;
  codigo: string;
  canchaId: string;
  canchaNombre: string;
  complejoNombre: string;
  jugador: string;
  fechaInicio: string;
  fechaFin: string;
  precio: number;
  estado: "CONFIRMADA" | "CANCELADA" | "VENCIDA" | "PENDIENTE" | "BLOQUEADA";
  metodoPago?: string;
  extras?: ExtraReservado[];
}

export interface ReglaPrecio {
  id: string;
  canchaId: string;
  nombre: string;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  tarifa: number;
  activo: boolean;
}

export interface Incidencia {
  id: string;
  titulo: string;
  descripcion: string;
  estado: "ABIERTA" | "EN_PROCESO" | "RESUELTA";
  severidad: "BAJA" | "MEDIA" | "ALTA";
  comentarioResolucion?: string;
}

export const roleFromApi = (role: ApiRole): Role =>
  role === "ADMINISTRADOR" ? "admin" : role === "SOPORTE" ? "soporte" : "jugador";

export const roleToApi = (role: Role): ApiRole =>
  role === "admin" ? "ADMINISTRADOR" : role === "soporte" ? "SOPORTE" : "JUGADOR";

export const mapUser = (data: any): User => ({
  id: data.id,
  email: data.correo,
  name: data.nombre,
  role: roleFromApi(data.rol),
  phone: data.telefono,
  scoring: data.scoring?.toLowerCase(),
});

export const mapCourt = (data: any): Cancha => ({
  id: data.id,
  complejoId: data.complejo_id,
  complejoNombre: data.complejo,
  deporteId: data.deporte_id,
  nombre: data.nombre,
  deporte: data.deporte,
  superficie: data.tipo_superficie,
  techado: data.techada,
  iluminacion: data.iluminacion,
  tarifaEstandar: Number(data.tarifa_estandar),
  activo: data.activa,
});

export const mapExtra = (data: any): Extra => ({
  id: data.id,
  complejoId: data.complejo_id,
  nombre: data.nombre,
  tipo: data.tipo,
  cantidad: data.cantidad,
  estado: data.estado,
  precio: Number(data.precio),
  activo: data.activo,
});

export const mapReservation = (data: any): ReservaJugador => ({
  id: data.id,
  codigo: data.codigo,
  canchaId: data.cancha_id,
  canchaNombre: data.cancha,
  complejoNombre: data.complejo,
  jugador: data.jugador,
  fechaInicio: `${data.fecha_programada}T${data.hora_inicio}`,
  fechaFin: `${data.fecha_programada}T${data.hora_fin}`,
  precio: Number(data.precio_total),
  estado: data.estado,
  metodoPago: data.pago?.metodo,
  extras: data.extras?.map((item: any) => ({
    id: item.extra_id,
    nombre: item.nombre,
    cantidad: item.cantidad,
    precio: Number(item.precio_unitario),
  })),
});

export const mapPayment = (data: any): Pago => ({
  id: data.id,
  reservaId: data.reserva_id,
  jugador: data.jugador,
  monto: Number(data.monto_pagado),
  montoEsperado: Number(data.monto_esperado),
  metodo: data.metodo,
  estado: data.estado,
  referencia: data.referencia,
  imagen: data.comprobante || "",
  subidoEn: data.created_at,
});
