import { Link, useNavigate } from "react-router-dom";
import { Trophy, Loader2 } from "lucide-react";
import { useAuth, Role } from "@/context/AuthContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CourtLines } from "@/components/SportsBackground";
import { toast } from "sonner";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [role, setRole] = useState<Role>("jugador");
  const [form, setForm] = useState<any>({});
  const [cargando, setCargando] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.name) return toast.error("Completa los campos requeridos");
    const gmailRegex = /^[^\s@]+@gmail\.com$/i;
    if (!gmailRegex.test(String(form.email).trim())) {
      return toast.error("Solo se permiten correos @gmail.com");
    }
    setCargando(true);
    await new Promise(r => setTimeout(r, 700));
    register({ ...form, email: String(form.email).trim().toLowerCase(), role });
    toast.success("Cuenta creada correctamente");
    nav(role === "admin" ? "/admin/onboarding" : "/jugador");
  };

  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-hero flex items-center justify-center p-4 sm:p-6">
      {/* Capas decorativas premium */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute -right-48 -top-48 w-[34rem] h-[34rem] motion-safe:animate-spin-slow [animation-duration:140s]">
          <CourtLines className="w-full h-full text-white opacity-[0.07]" />
        </div>
        <div className="absolute -left-32 -bottom-32 w-96 h-96 rounded-full bg-accent/20 blur-3xl motion-safe:animate-aurora" />
        <div className="absolute top-1/4 -right-24 w-80 h-80 rounded-full bg-info/15 blur-3xl motion-safe:animate-aurora [animation-delay:-12s]" />
        <div className="absolute -inset-x-1/3 top-1/3 h-44 -rotate-12 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent motion-safe:animate-beam" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
            maskImage: "radial-gradient(ellipse 80% 70% at 50% 20%, black 20%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 20%, black 20%, transparent 75%)",
          }}
        />
      </div>

      <div className="relative w-full max-w-xl">
        <div className="rounded-3xl bg-card/95 backdrop-blur-xl border shadow-elegant p-6 sm:p-8">
          <Link to="/" className="flex items-center gap-2 mb-6 w-fit">
            <div className="w-10 h-10 rounded-xl bg-gradient-accent grid place-items-center shadow-glow">
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
                <div className="space-y-1.5">
                  <Label htmlFor="r-nombre">Nombre completo</Label>
                  <Input id="r-nombre" className="h-11" onChange={set("name")} placeholder="Juan Pérez" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="r-tel">Teléfono</Label>
                    <Input id="r-tel" className="h-11" onChange={set("phone")} placeholder="+51 9..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="r-email">Correo</Label>
                    <Input id="r-email" className="h-11" type="email" placeholder="tu@gmail.com" onChange={set("email")} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="r-pass">Contraseña</Label>
                  <Input id="r-pass" className="h-11" type="password" placeholder="••••••••" />
                </div>
              </TabsContent>

              <TabsContent value="admin" className="space-y-4 m-0">
                <div className="space-y-1.5">
                  <Label htmlFor="r-comercial">Nombre comercial</Label>
                  <Input id="r-comercial" className="h-11" onChange={set("name")} placeholder="Complejo XYZ" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="r-ruc">RUC / DNI</Label>
                    <Input id="r-ruc" className="h-11" onChange={set("ruc")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="r-tel2">Teléfono</Label>
                    <Input id="r-tel2" className="h-11" onChange={set("phone")} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="r-email2">Correo</Label>
                  <Input id="r-email2" className="h-11" type="email" placeholder="tu@gmail.com" onChange={set("email")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="r-pass2">Contraseña</Label>
                  <Input id="r-pass2" className="h-11" type="password" placeholder="••••••••" />
                </div>
              </TabsContent>

              <Button
                type="submit"
                disabled={cargando}
                className="w-full h-11 bg-gradient-accent border-0 shadow-glow hover:-translate-y-0.5 hover:brightness-110 transition-all duration-200 text-base font-semibold"
              >
                {cargando ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creando cuenta…</>) : "Crear cuenta"}
              </Button>
              <div className="text-sm text-center text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link to="/login" className="text-accent font-semibold hover:underline underline-offset-4">Inicia sesión</Link>
              </div>
            </form>
          </Tabs>
        </div>

        <p className="text-xs text-center text-white/50 mt-4">Demo educativo — sistema de reservas</p>
      </div>
    </div>
  );
}
