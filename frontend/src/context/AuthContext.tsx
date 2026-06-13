import { createContext, useContext, useState, ReactNode } from "react";
import { api, setTokens } from "@/lib/api";
import { mapUser, roleToApi, Role, User } from "@/lib/domain";

export type { Role, User };

interface RegisterData {
  role: Role;
  email: string;
  password: string;
  name: string;
  phone?: string;
  ruc?: string;
}

interface AuthCtx {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx>({} as AuthCtx);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    const data = await api<any>("/auth/token/", {
      method: "POST",
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });
    setTokens(data.access, data.refresh);
    const authenticated = mapUser(data.usuario);
    setUser(authenticated);
    return authenticated;
  };

  const register = async (data: RegisterData) => {
    await api("/auth/registro/", {
      method: "POST",
      body: JSON.stringify({
        correo: data.email.trim().toLowerCase(),
        password: data.password,
        rol: roleToApi(data.role),
        nombre_completo: data.role === "jugador" ? data.name : undefined,
        nombre_comercial: data.role === "admin" ? data.name : undefined,
        telefono: data.phone || "",
        ruc_dni: data.ruc,
      }),
    });
    return login(data.email, data.password);
  };

  const logout = () => {
    setTokens(null);
    setUser(null);
  };

  return <Ctx.Provider value={{ user, login, register, logout }}>{children}</Ctx.Provider>;
};

export const useAuth = () => useContext(Ctx);

