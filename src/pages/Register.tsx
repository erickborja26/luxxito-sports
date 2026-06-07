import { Link, useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";
import { useAuth, Role } from "@/context/AuthContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [role, setRole] = useState<Role>("jugador");
  const [form, setForm] = useState<any>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.name) return toast.error("Completa los campos requeridos");
    register({ ...form, role });
    toast.success("Cuenta creada correctamente");
    nav(role === "admin" ? "/admin/onboarding" : "/jugador");
  };

  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-xl p-8 shadow-elegant">
        <Link to="/" className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-accent grid place-items-center shadow-glow">
            <Trophy className="w-5 h-5 text-accent-foreground" />
          </div>
          <span className="font-bold text-xl">LuxxitoSports</span>
        </Link>
        <h1 className="text-2xl font-bold mb-1">Crear cuenta</h1>
        <p className="text-sm text-muted-foreground mb-6">Elige tu tipo de cuenta para empezar</p>

        <Tabs value={role} onValueChange={(v) => setRole(v as Role)}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="jugador">Soy Jugador</TabsTrigger>
            <TabsTrigger value="admin">Tengo un Complejo</TabsTrigger>
          </TabsList>

          <form onSubmit={submit} className="space-y-4 mt-6">
            <TabsContent value="jugador" className="space-y-4 m-0">
              <div><Label>Nombre completo</Label><Input onChange={set("name")} placeholder="Juan Pérez" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Teléfono</Label><Input onChange={set("phone")} placeholder="+51 9..." /></div>
                <div><Label>Correo</Label><Input type="email" onChange={set("email")} /></div>
              </div>
              <div><Label>Contraseña</Label><Input type="password" /></div>
            </TabsContent>

            <TabsContent value="admin" className="space-y-4 m-0">
              <div><Label>Nombre comercial</Label><Input onChange={set("name")} placeholder="Complejo XYZ" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>RUC / DNI</Label><Input onChange={set("ruc")} /></div>
                <div><Label>Teléfono</Label><Input onChange={set("phone")} /></div>
              </div>
              <div><Label>Correo</Label><Input type="email" onChange={set("email")} /></div>
              <div><Label>Contraseña</Label><Input type="password" /></div>
            </TabsContent>

            <Button type="submit" className="w-full bg-gradient-accent border-0">Crear cuenta</Button>
            <div className="text-sm text-center text-muted-foreground">
              ¿Ya tienes cuenta? <Link to="/login" className="text-accent font-medium">Inicia sesión</Link>
            </div>
          </form>
        </Tabs>
      </Card>
    </div>
  );
}
