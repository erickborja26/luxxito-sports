import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Reserva, reservasMock } from "@/data/mock";

export interface ExtraReservado { nombre: string; cantidad: number; precio: number }

export interface ReservaJugador extends Reserva {
  codigo: string;
  extras?: ExtraReservado[];
}

interface ReservasCtx {
  reservas: ReservaJugador[];
  agregarReserva: (r: Omit<ReservaJugador, "id" | "codigo">) => ReservaJugador;
  cancelarReserva: (id: string) => void;
}

const STORAGE_KEY = "luxxito_reservas_jugador";

const generarCodigo = () =>
  "LX-" + Math.random().toString(36).slice(2, 8).toUpperCase();

const semilla: ReservaJugador[] = reservasMock.map((r) => ({
  ...r,
  codigo: "LX-" + r.id.toUpperCase().padStart(6, "0"),
}));

const Ctx = createContext<ReservasCtx>({} as ReservasCtx);

export const ReservasProvider = ({ children }: { children: ReactNode }) => {
  const [reservas, setReservas] = useState<ReservaJugador[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      /* datos corruptos: se reinicia con la semilla */
    }
    return semilla;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservas));
  }, [reservas]);

  const agregarReserva = (r: Omit<ReservaJugador, "id" | "codigo">) => {
    const nueva: ReservaJugador = { ...r, id: crypto.randomUUID(), codigo: generarCodigo() };
    setReservas((prev) => [nueva, ...prev]);
    return nueva;
  };

  const cancelarReserva = (id: string) => {
    setReservas((prev) =>
      prev.map((r) => (r.id === id ? { ...r, estado: "CANCELADA" as const } : r))
    );
  };

  return (
    <Ctx.Provider value={{ reservas, agregarReserva, cancelarReserva }}>{children}</Ctx.Provider>
  );
};

export const useReservas = () => useContext(Ctx);
