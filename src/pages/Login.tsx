import { Link, useNavigate } from "react-router-dom";
import { Trophy, Shield } from "lucide-react";
import { useAuth, Role } from "@/context/AuthContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("jugador");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Ingresa tu correo");
    const gmailRegex = /^[^\s@]+@gmail\.com$/i;
    if (!gmailRegex.test(email.trim())) {
      return toast.error("Solo se permiten correos @gmail.com");
    }
    login(email.trim().toLowerCase(), role);
    toast.success("Bienvenido a LuxxitoSports");
    nav(role === "admin" ? "/admin" : role === "soporte" ? "/soporte" : "/jugador");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex bg-gradient-hero p-12 flex-col justify-between text-primary-foreground">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-accent grid place-items-center shadow-glow">
            <Trophy className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl">LuxxitoSports</span>
        </Link>
        <div>
          <h2 className="text-4xl font-bold mb-3 text-balance">Tu próxima cancha, a un clic.</h2>
          <p className="text-white/70">Reserva, paga y juega. La forma más rápida de organizar partido.</p>
        </div>
        <div className="text-xs text-white/50">Demo educativo — sistema de reservas</div>
      </div>
      <div className="flex items-center justify-center p-6 md:p-10">
        <Card className="w-full max-w-md p-8 shadow-elegant">
          <h1 className="text-2xl font-bold mb-1">Iniciar sesión</h1>
          <p className="text-sm text-muted-foreground mb-6">Accede a tu panel personal</p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>Correo electrónico</Label>
              <Input type="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label>Contraseña</Label>
              <Input type="password" placeholder="••••••••" defaultValue="demo1234" />
            </div>
            <div>
              <Label>Entrar como</Label>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="jugador">Jugador</SelectItem>
                  <SelectItem value="admin">Administrador de complejo</SelectItem>
                  <SelectItem value="soporte">Operador de soporte</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-gradient-accent border-0">Entrar</Button>
            <div className="text-sm text-center text-muted-foreground">
              ¿No tienes cuenta? <Link to="/registro" className="text-accent font-medium">Regístrate</Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
