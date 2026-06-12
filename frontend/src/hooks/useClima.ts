import { useEffect, useState } from "react";

export interface Clima {
  temperatura: number;
  descripcion: string;
  esNoche: boolean;
}

// Códigos WMO de Open-Meteo → descripción en español
function descripcionWMO(codigo: number): string {
  if (codigo === 0) return "Despejado";
  if (codigo <= 3) return "Parcialmente nublado";
  if (codigo <= 48) return "Neblina";
  if (codigo <= 57) return "Llovizna";
  if (codigo <= 67) return "Lluvia";
  if (codigo <= 77) return "Nieve";
  if (codigo <= 82) return "Chubascos";
  if (codigo <= 86) return "Nieve";
  return "Tormenta";
}

// Lima, Perú por defecto
export function useClima(lat = -12.0464, lon = -77.0428) {
  const [clima, setClima] = useState<Clima | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=America%2FLima`,
      { signal: controller.signal }
    )
      .then(res => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then(data => {
        const cw = data.current_weather;
        if (!cw) return;
        setClima({
          temperatura: Math.round(cw.temperature),
          descripcion: descripcionWMO(cw.weathercode),
          esNoche: cw.is_day === 0,
        });
      })
      .catch(() => {
        // Sin conexión o API caída: valores de respaldo para no romper la UI
        const hora = new Date().getHours();
        setClima({ temperatura: 24, descripcion: "Despejado", esNoche: hora >= 18 || hora < 6 });
      });
    return () => controller.abort();
  }, [lat, lon]);

  return clima;
}
