import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { api, Paginated, unwrap } from "@/lib/api";
import { ExtraReservado, mapReservation, ReservaJugador } from "@/lib/domain";
import { useAuth } from "./AuthContext";

export type { ExtraReservado, ReservaJugador };

interface ReservasCtx {
  reservas: ReservaJugador[];
  loading: boolean;
  recargar: () => Promise<void>;
  cancelarReserva: (id: string, motivo?: string) => Promise<ReservaJugador>;
}

const Ctx = createContext<ReservasCtx>({} as ReservasCtx);

export const ReservasProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [reservas, setReservas] = useState<ReservaJugador[]>([]);
  const [loading, setLoading] = useState(false);

  const recargar = useCallback(async () => {
    if (!user) {
      setReservas([]);
      return;
    }
    setLoading(true);
    try {
      const data = await api<Paginated<any> | any[]>("/reservas/?page_size=100");
      setReservas(unwrap(data).map(mapReservation));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  const cancelarReserva = async (id: string, motivo = "Cancelada por el usuario") => {
    const data = await api<any>(`/reservas/${id}/cancelar/`, {
      method: "POST",
      body: JSON.stringify({ motivo }),
    });
    const updated = mapReservation(data);
    setReservas((current) => current.map((item) => item.id === id ? updated : item));
    return updated;
  };

  return (
    <Ctx.Provider value={{ reservas, loading, recargar, cancelarReserva }}>
      {children}
    </Ctx.Provider>
  );
};

export const useReservas = () => useContext(Ctx);
