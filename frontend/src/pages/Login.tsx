import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2, User, Building2, Headphones, CalendarCheck, MapPin, Star } from "lucide-react";
import { useAuth, Role } from "@/context/AuthContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CourtLines } from "@/components/SportsBackground";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const roles: { v: Role; label: string; icon: typeof User }[] = [
  { v: "jugador", label: "Jugador", icon: User },
  { v: "admin", label: "Complejo", icon: Building2 },
  { v: "soporte", label: "Soporte", icon: Headphones },
];

const stats = [
  { icon: MapPin, valor: "3", label: "complejos" },
  { icon: CalendarCheck, valor: "+1,200", label: "reservas al mes" },
  { icon: Star, valor: "4.9", label: "valoración" },
];

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Demo1234!");
  const [role, setRole] = useState<Role>("jugador");
  const [verPass, setVerPass] = useState(false);
  const [cargando, setCargando] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Ingresa tu correo y contraseña");
    setCargando(true);
    try {
      const authenticated = await login(email, password);
      if (authenticated.role !== role) {
        toast.info(`La cuenta corresponde al rol ${authenticated.role}.`);
      }
      toast.success("Bienvenido a LuxxitoSports");
      nav(authenticated.role === "admin" ? "/admin" : authenticated.role === "soporte" ? "/soporte" : "/jugador");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Credenciales inválidas");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-[100svh] grid lg:grid-cols-2">
      {/* Panel de marca */}
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-hero p-12 flex-col justify-between text-primary-foreground">
        {/* Capas decorativas premium */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute -right-40 top-1/2 -translate-y-1/2 w-[36rem] h-[36rem] motion-safe:animate-spin-slow [animation-duration:140s]">
            <CourtLines className="w-full h-full text-white opacity-[0.08]" />
          </div>
          <div className="absolute -left-32 -top-32 w-96 h-96 rounded-full bg-accent/20 blur-3xl motion-safe:animate-aurora" />
          <div className="absolute -bottom-40 left-1/3 w-[28rem] h-[28rem] rounded-full bg-info/10 blur-3xl motion-safe:animate-aurora [animation-delay:-12s]" />
          <div className="absolute -inset-x-1/3 top-1/4 h-44 -rotate-12 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent motion-safe:animate-beam" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)",
              backgroundSize: "26px 26px",
              maskImage: "radial-gradient(ellipse 80% 70% at 30% 30%, black 20%, transparent 70%)",
              WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 30% 30%, black 20%, transparent 70%)",
            }}
          />
        </div>

        <Link to="/" className="relative z-10 flex items-center gap-2 w-fit">
          <img
            src="/luxxito-sports-logo.png"
            alt="LuxxitoSports"
            className="h-12 w-auto"
          />
          <span className="font-bold text-xl">LuxxitoSports</span>
        </Link>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-5xl font-bold leading-tight text-balance">
              Tu próxima cancha,<br />
              <span className="bg-[linear-gradient(135deg,hsl(152_75%_55%),hsl(170_80%_50%))] bg-clip-text text-transparent">a un clic.</span>
            </h2>
            <p className="text-white/70 mt-4 text-lg max-w-md">
              Reserva, paga y juega. La forma más rápida de organizar partido.
            </p>
          </div>

          {/* Stats en glass */}
          <div className="flex gap-3">
            {stats.map(s => (
              <div key={s.label} className="flex-1 rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/10 p-4">
                <s.icon className="w-4 h-4 text-accent mb-2" />
                <div className="text-2xl font-bold leading-none">{s.valor}</div>
                <div className="text-xs text-white/60 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonial glass */}
          <div className="rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/10 p-5 max-w-md">
            <div className="flex gap-0.5 mb-2" aria-label="5 de 5 estrellas">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
            </div>
            <p className="text-sm text-white/85 leading-relaxed">
              "Antes coordinábamos por WhatsApp y siempre se cruzaban los horarios. Ahora reservo en un minuto y llego directo a jugar."
            </p>
            <div className="flex items-center gap-2.5 mt-3">
              <div className="w-8 h-8 rounded-full bg-gradient-accent grid place-items-center text-xs font-bold text-accent-foreground">C</div>
              <div>
                <div className="text-sm font-semibold leading-tight">Carlos Pérez</div>
                <div className="text-[11px] text-white/50">Jugador frecuente · San Borja</div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-white/40">Demo educativo — sistema de reservas</div>
      </div>

      {/* Panel de formulario */}
      <div className="relative flex items-center justify-center overflow-hidden bg-muted/30 p-4 py-8 sm:p-6 md:p-10">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(hsl(var(--primary) / 0.10) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 20%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 20%, transparent 75%)",
          }}
        />
        <div aria-hidden="true" className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl motion-safe:animate-aurora pointer-events-none" />

        <div className="relative w-full max-w-md">
          {/* Logo en móvil */}
          <Link to="/" className="lg:hidden flex items-center justify-center gap-2 mb-6">
            <img
              src="/luxxito-sports-logo.png"
              alt="LuxxitoSports"
              className="h-10 w-auto"
            />
            <span className="font-bold text-xl">LuxxitoSports</span>
          </Link>

          <div className="rounded-3xl bg-card/90 backdrop-blur-xl border shadow-elegant p-6 sm:p-8">
            <h1 className="text-2xl font-bold mb-1">Iniciar sesión</h1>
            <p className="text-sm text-muted-foreground mb-6">Accede a tu panel personal</p>

            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@correo.com"
                    className="pl-10 h-11"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pass">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="pass" type={verPass ? "text" : "password"} placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-11 h-11" />
                  <button
                    type="button"
                    onClick={() => setVerPass(v => !v)}
                    aria-label={verPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                  >
                    {verPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Entrar como</Label>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Tipo de cuenta">
                  {roles.map(r => (
                    <button
                      key={r.v}
                      type="button"
                      role="radio"
                      aria-checked={role === r.v}
                      onClick={() => setRole(r.v)}
                      className={cn(
                        "p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer",
                        role === r.v ? "border-accent bg-accent/5 text-foreground" : "border-border text-muted-foreground hover:border-muted-foreground"
                      )}
                    >
                      <r.icon className={cn("w-5 h-5", role === r.v && "text-accent")} />
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={cargando}
                className="w-full h-11 bg-gradient-accent border-0 shadow-glow hover:-translate-y-0.5 hover:brightness-110 transition-all duration-200 text-base font-semibold"
              >
                {cargando ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Entrando…</>) : "Entrar"}
              </Button>

              <div className="text-sm text-center text-muted-foreground">
                ¿No tienes cuenta?{" "}
                <Link to="/registro" className="text-accent font-semibold hover:underline underline-offset-4">Regístrate gratis</Link>
              </div>
            </form>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-4">
            Usa una cuenta registrada o los usuarios de demostración del README.
          </p>
        </div>
      </div>
    </div>
  );
}
