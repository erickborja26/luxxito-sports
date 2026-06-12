import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Role = "jugador" | "admin" | "soporte";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  ruc?: string;
  scoring?: "nuevo" | "frecuente" | "vip";
}

interface AuthCtx {
  user: User | null;
  login: (email: string, role?: Role) => void;
  register: (data: Partial<User> & { role: Role }) => void;
  logout: () => void;
}

const Ctx = createContext<AuthCtx>({} as AuthCtx);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("luxxito_user");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  const persist = (u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem("luxxito_user", JSON.stringify(u));
    else localStorage.removeItem("luxxito_user");
  };

  const login = (email: string, role: Role = "jugador") => {
    persist({
      id: crypto.randomUUID(),
      email,
      name: email.split("@")[0],
      role,
      scoring: "frecuente",
    });
  };

  const register = (data: Partial<User> & { role: Role }) => {
    persist({
      id: crypto.randomUUID(),
      email: data.email || "",
      name: data.name || "Usuario",
      role: data.role,
      phone: data.phone,
      ruc: data.ruc,
      scoring: "nuevo",
    });
  };

  const logout = () => persist(null);

  return <Ctx.Provider value={{ user, login, register, logout }}>{children}</Ctx.Provider>;
};

export const useAuth = () => useContext(Ctx);
